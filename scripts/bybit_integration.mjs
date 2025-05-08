import { promises as fs } from 'node:fs';

import { Big } from 'big.js';
import { RestClientV5 } from 'bybit-api';
import dotenv from 'dotenv';
import _ from 'lodash';
import moment from 'moment';

dotenv.config();

// Bybit API credentials from .env
const API_KEY = process.env.BYBIT_API_KEY;
const API_SECRET = process.env.BYBIT_API_SECRET;

// Initialize Bybit API client
const client = new RestClientV5({
  key: API_KEY,
  secret: API_SECRET,
});

async function getTradesLogs(params, page = 1, transfers = [], cursor) {
  const { startTimestamp, endTimestamp } = params;
  const requestData = {
    category: 'spot',
    startTime: startTimestamp,
    endTime: endTimestamp,

    limit: 50, // Maximum page size per request
    ...(cursor && { cursor }), // Only send cursor if we have one
  };
  const response = await client.getTransactionLog(requestData);

  // Check to continue to next page
  const nextCursor = response.result.nextPageCursor;
  const newTransfers =
    response.result.list && response.result.list.length > 0
      ? [...transfers, ...response.result.list]
      : transfers;

  if (nextCursor)
    return getTradesLogs(params, page + 1, newTransfers, nextCursor);

  return newTransfers;
}

// Function to convert Bybit trade to IntelInvest format
function convertToIntelInvestFormat(trade) {
  const [base, target] = trade;

  // Determine transaction type based on side
  const isBuy = base.side === 'Buy';
  const typeIn = isBuy ? 'SHARE_BUY' : 'SHARE_SELL';
  const typeOut = isBuy ? 'SHARE_OUT' : 'SHARE_IN';

  // Format date (YYYY-MM-DD HH:MM:SS)
  const formattedDate = moment(parseInt(base.transactionTime, 10)).format(
    'DD.MM.YYYY HH:mm:ss',
  );

  const quantity = new Big(base.cashFlow).abs().toString();
  const cashFlow = new Big(target.cashFlow).abs().toString();

  // Create CSV line in IntelInvest format
  const dealIn = [
    typeIn, // TYPE
    formattedDate, // DATE
    `${base.currency}:${base.currency}`, // TICKER
    quantity, // QUANTITY
    base.tradePrice, // PRICE
    target.feeRate, // FEE
    '', // NKD
    '', // NOMINAL trade.execValue,
    target.currency, // CURRENCY
    target.currency, // FEE_CURRENCY
    '', // NOTE
    base.orderId, // LINK_ID
    'bybit', // TRADE_SYSTEM_ID
  ].join(';');

  const dealOut = [
    typeOut, // TYPE
    formattedDate, // DATE
    `${target.currency}:${target.currency}`, // TICKER
    cashFlow, // QUANTITY
    1, // PRICE
    0, // FEE
    '', // NKD
    '', // NOMINAL trade.execValue,
    'USD', // CURRENCY
    'USD', // FEE_CURRENCY
    '', // NOTE
    base.orderId, // LINK_ID
    'bybit', // TRADE_SYSTEM_ID
  ].join(';');

  return [dealIn, dealOut].join('\n');
}

async function execute(startDate, endDate) {
  console.log(`Fetching trades from ${startDate} to ${endDate}`);

  // Convert dates to moment objects
  const start = moment(startDate);
  const end = moment(endDate);

  // Generate array of date chunks
  const dateChunks = generateDateChunks(start, end, 7);

  // Map each chunk to a getLogs call and wait for all to complete
  const logsArrays = await Promise.all(
    dateChunks.map(({ chunkStart, chunkEnd }) => {
      console.log(
        `Fetching logs from ${chunkStart.format(
          'YYYY-MM-DD',
        )} to ${chunkEnd.format('YYYY-MM-DD')}`,
      );

      return getTradesLogs({
        startTimestamp: chunkStart.valueOf(),
        endTimestamp: chunkEnd.valueOf(),
      });
    }),
  );

  const trades = logsArrays.filter(array => array && array.length > 0).flat();

  if (trades.length > 0) {
    const csvHeader =
      '#CsvFormatVersion:v1\n' +
      'TYPE;DATE;TICKER;QUANTITY;PRICE;FEE;NKD;NOMINAL;CURRENCY;' +
      'FEE_CURRENCY;NOTE;LINK_ID;TRADE_SYSTEM_ID';

    const groupedTrades = _.groupBy(trades, 'orderId');
    const csvRows = _.mapValues(groupedTrades, convertToIntelInvestFormat);
    const csvContent = [csvHeader, ...Object.values(csvRows)].join('\n');

    const fileName = `out/bybit_trades_${startDate}.csv`;

    await fs.writeFile(fileName, csvContent, 'utf8');

    console.log(`Trades exported to ${fileName}`);
  }
}

function generateDateChunks(start, end, chunkSizeInDays) {
  const totalDays = end.diff(start, 'days');
  const chunkCount = Math.ceil(totalDays / chunkSizeInDays);

  return Array.from({ length: chunkCount }, (_, index) => {
    const chunkStart = start.clone().add(index * chunkSizeInDays, 'days');
    const chunkEnd = moment.min(
      chunkStart.clone().add(chunkSizeInDays - 1, 'days'),
      end,
    );

    return { chunkStart, chunkEnd };
  });
}

execute('2024-11-01', '2025-05-01')
  .then(() => console.log('Execution completed successfully'))
  .catch(console.error);
