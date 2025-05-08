import { promises as fs } from 'node:fs';
import path from 'node:path';

import { RestClientV5 } from 'bybit-api';
import dotenv from 'dotenv';
import _ from 'lodash';

import { CONSTANTS } from '../constants.mjs';
import { setupLogger } from '../logger.mjs';
import { generateDateChunks } from '../utils/dateUtils.mjs';
import { BybitTradeService } from './service_api.mjs';
import { SERVICE_CONSTANTS } from './service_constants.mjs';
import { convertToIntelInvestFormat } from './trade_formatter.mjs';

dotenv.config();

// Initialize logger
const logger = setupLogger(SERVICE_CONSTANTS.INTEGRATION_NAME);

// Ensure logs directory exists
await fs.mkdir(CONSTANTS.PATHS.LOGS_DIR, { recursive: true });

// Ensure output directory exists
await fs.mkdir(CONSTANTS.PATHS.OUTPUT_DIR, { recursive: true });

// Bybit API client initialization
const client = new RestClientV5({
  key: process.env.BYBIT_API_KEY,
  secret: process.env.BYBIT_API_SECRET,
});

// Initialize the trade service
const tradeService = new BybitTradeService(client, logger);

/**
 * Main execution function
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 */
async function execute(startDate, endDate) {
  logger.info('Starting execution', { startDate, endDate });

  // Generate array of date chunks
  const dateChunks = generateDateChunks(
    startDate,
    endDate,
    SERVICE_CONSTANTS.CHUNK_SIZE_DAYS,
  );

  logger.info(`Generated ${dateChunks.length} date chunks`);

  // Process chunks sequentially using lodash
  const logsArrays = await _.reduce(
    dateChunks,
    async (previousPromise, chunk, index) => {
      const accumulator = await previousPromise;
      const result = await tradeService.processChunk(
        chunk,
        index,
        dateChunks.length,
      );

      return result.length > 0 ? [...accumulator, result] : accumulator;
    },
    Promise.resolve([]),
  );

  // Flatten the array of arrays
  const trades = logsArrays.flat();

  logger.info('Processing complete', { totalTrades: trades.length });

  if (trades.length === 0) {
    logger.warn('No trades found for the specified period');

    return;
  }

  // Group trades by orderId and convert to CSV format
  const groupedTrades = _.groupBy(trades, 'orderId');

  logger.debug(
    `Grouped into ${Object.keys(groupedTrades).length} unique orders`,
  );

  const csvRows = _.values(
    _.mapValues(groupedTrades, tradeGroup =>
      convertToIntelInvestFormat(tradeGroup),
    ),
  );
  const csvContent = _.concat([CONSTANTS.CSV_HEADER], csvRows).join('\n');

  // Write to file
  const fileName = path.join(
    CONSTANTS.PATHS.OUTPUT_DIR,
    `bybit_trades_${startDate}_to_${endDate}.csv`,
  );

  await fs.writeFile(fileName, csvContent, 'utf8');
  logger.info('Export successful', { fileName, rowCount: csvRows.length });
}

// Command line arguments or default values
const startDate = process.argv[2] || '2024-11-01';
const endDate = process.argv[3] || '2025-05-01';

// Main execution
try {
  await execute(startDate, endDate);
  logger.info('Execution completed successfully');
} catch (error) {
  logger.error('Error during execution', {
    error: error.message,
    stack: error.stack,
  });
  throw error;
}
