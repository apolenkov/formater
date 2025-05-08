import { promises as fs } from 'node:fs';
import path from 'node:path';

import { RestClientV5 } from 'bybit-api';
import dotenv from 'dotenv';
import _ from 'lodash';

import { BybitTradeService } from './libs/bybit/service_api.mjs';
import { SERVICE_CONSTANTS } from './libs/bybit/service_constants.mjs';
import { convertToIntelInvestFormat } from './libs/bybit/trade_formatter.mjs';
import { CONSTANTS } from './libs/constants.mjs';
import { setupLogger } from './libs/logger.mjs';

dotenv.config();

// Initialize logger
const logger = setupLogger(SERVICE_CONSTANTS.INTEGRATION_NAME);

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

exportTrades('2024-11-01', '2025-05-01').then().catch(console.error);
