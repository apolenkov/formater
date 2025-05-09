import { Big } from 'big.js';
import _ from 'lodash';
import moment from 'moment';

import { SERVICE_CONSTANTS } from './service_constants.mjs';

// Configure Big.js to use fixed-point notation instead of exponential
Big.PE = 40; // Positive exponent limit
Big.NE = -40; // Negative exponent limit

/**
 *
 * Converts a Bybit trade to IntelInvest format
 * @param {Array} trades - Pair of trade entries
 * @returns {string} - Formatted CSV lines
 */
export function convertToIntelInvestFormat(trades) {
  if (trades.length > 2) throw new Error('In trade pair must be two iteration');

  const [base, target] = trades;

  const isBuy = base.side === SERVICE_CONSTANTS.BUYING_TYPE;
  const typeIn = isBuy
    ? SERVICE_CONSTANTS.TRADE_TYPES.SHARE_BUY
    : SERVICE_CONSTANTS.TRADE_TYPES.SHARE_SELL;
  const typeOut = isBuy
    ? SERVICE_CONSTANTS.TRADE_TYPES.SHARE_OUT
    : SERVICE_CONSTANTS.TRADE_TYPES.SHARE_IN;

  const formattedDate = moment(parseInt(base.transactionTime, 10)).format(
    'DD.MM.YYYY HH:mm:ss',
  );

  const quantity = new Big(base.cashFlow).abs().toFixed();
  const cashFlow = new Big(target.cashFlow).abs().toFixed();

  const dealInData = {
    type: typeIn,
    date: formattedDate,
    ticker: `${base.currency}:${base.currency}`,
    quantity,
    price: base.tradePrice,
    fee: target.feeRate,
    nkd: '',
    nominal: '',
    currency: target.currency,
    feeCurrency: target.currency,
    note: '',
    linkId: base.tradeId,
    tradeSystemId: SERVICE_CONSTANTS.TRADE_SOURCE,
  };

  const dealOutData = {
    type: typeOut,
    date: formattedDate,
    ticker: `${target.currency}:${target.currency}`,
    quantity: cashFlow,
    price: 1,
    fee: 0,
    nkd: '',
    nominal: '',
    currency: 'USD',
    feeCurrency: 'USD',
    note: '',
    linkId: base.tradeId,
    tradeSystemId: SERVICE_CONSTANTS.TRADE_SOURCE,
  };

  const dealIn = _.values(dealInData).join(';');
  const dealOut = _.values(dealOutData).join(';');

  return [dealIn, dealOut].join('\n');
}
