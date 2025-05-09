import { promises as fs } from 'node:fs';
import path from 'node:path';

import { RestClientV5 } from 'bybit-api';
import { Command } from 'commander';
import dotenv from 'dotenv';
import _ from 'lodash';

import { BybitTradeService } from './src/bybit/service_api.mjs';
import { SERVICE_CONSTANTS } from './src/bybit/service_constants.mjs';
import { convertToIntelInvestFormat } from './src/bybit/trade_formatter.mjs';
import { CONSTANTS } from './src/constants.mjs';
import { setupLogger } from './src/logger.mjs';
import {
  getTodayFormatted,
  getTodayMinusOneMonth,
  isValidDateFormat,
} from './src/utils/dateUtils.mjs';

dotenv.config();

// Initialize logger
const logger = setupLogger(SERVICE_CONSTANTS.INTEGRATION_NAME);

// Bybit API client initialization-
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
 * @returns {Promise<void>}
 */
async function exportTrades(startDate, endDate) {
  logger.info('Starting execution', { startDate, endDate });

  const trades = await tradeService.getAll(startDate, endDate);

  const csvRows = _.values(
    _.mapValues(trades, tradeGroup => convertToIntelInvestFormat(tradeGroup)),
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

// Main execution
async function main() {
  // Set up CLI
  const program = new Command();

  program
    .name('bybit-exporter')
    .description('Export Bybit trades to CSV format')
    .version('1.0.0');

  program
    .option(
      '-s, --start-date <date>',
      'Start date in YYYY-MM-DD format',
      getTodayMinusOneMonth(),
    )
    .option(
      '-e, --end-date <date>',
      'End date in YYYY-MM-DD format',
      getTodayFormatted(),
    )
    .action(async options => {
      // Validate dates
      if (
        !isValidDateFormat(options.startDate) ||
        !isValidDateFormat(options.endDate)
      ) {
        logger.error('Invalid date format. Please use YYYY-MM-DD format.');
        throw new Error('Invalid date format');
      }

      await exportTrades(options.startDate, options.endDate);
    });

  await program.parseAsync();
}

main().catch(error => {
  logger.error('Error during execution', { error: error.message });

  // This avoids the explicit process.exit() call
  throw error;
});
