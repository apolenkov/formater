import _ from 'lodash';
import moment from 'moment';

import { generateDateChunks } from '../utils/dateUtils.mjs';
import { SERVICE_CONFIG } from './service_config.mjs';

/**
 * Class for handling Bybit API operations
 */
export class BybitTradeService {
  /**
   * @param {Object} client - Bybit API client
   * @param {Object} logger - Logger instance
   * @param {Object} settings - Settings for request
   */
  constructor(client, logger, settings) {
    this.client = client;
    this.logger = logger;
    this.settings = settings;
  }

  /**
   * Recursively fetches trade logs from Bybit API with pagination
   * @param {Object} params - Request chunk parameters
   * @param {number} [page=1] - Current page number
   * @param {Array} [items=[]] - Accumulated transfers
   * @param {string} [cursor] - Pagination cursor
   * @returns {Promise<Array>} - Logs
   */
  async fetchLogs(params, page = 1, items = [], cursor) {
    const { startTimestamp, endTimestamp } = params;
    const { method, category } = this.settings;

    const requestData = {
      category,
      startTime: startTimestamp,
      endTime: endTimestamp,
      limit: SERVICE_CONFIG.PAGE_LIMIT,
      ...(cursor && { cursor }),
    };

    try {
      this.logger.debug('Fetching transaction log', {
        category,
        page,
        startTime: moment(startTimestamp).toISOString(),
        endTime: moment(endTimestamp).toISOString(),
        cursor,
      });

      const response = await method.call(this.client, requestData);

      if (!response.result?.list) {
        this.logger.warn('No list in response', { response });

        return items;
      }

      const newItems = response.result.list.length;

      this.logger.debug(`Received ${newItems} items`, { page });

      const updatedItems =
        newItems > 0 ? _.concat(items, response.result.list) : items;

      const nextCursor = response.result.nextPageCursor;

      if (nextCursor) {
        // Add a delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, SERVICE_CONFIG.DELAY));

        return this.fetchLogs(params, page + 1, updatedItems, nextCursor);
      }

      return updatedItems;
    } catch (error) {
      this.logger.error(`Error fetching ${category} logs`, {
        page,
        error: error.message,
        stack: error.stack,
      });

      return items;
    }
  }

  /**
   * Fetches between the specified date range
   * @param {String} startDate - The start date for fetching
   * @param {String} endDate - The end date for fetching
   * @returns {Promise<Array>} - Result
   */
  async logs(startDate, endDate) {
    // Generate array of date chunks
    const dateChunks = generateDateChunks(
      startDate,
      endDate,
      this.settings.chunkSize,
    );

    this.logger.info(`Generated ${dateChunks.length} date chunks`);

    // Process chunks sequentially
    const results = await _.reduce(
      dateChunks,
      async (previousPromise, chunk, index) => {
        const accumulator = await previousPromise;
        const result = await this.processChunk(chunk, index, dateChunks.length);

        return result.length > 0 ? [...accumulator, result] : accumulator;
      },
      Promise.resolve([]),
    );

    const logs = results.flat();

    this.logger.info('Processing complete', { totalTrades: logs.length });

    if (logs.length === 0) {
      this.logger.warn('No trades found for the specified period');

      return [];
    }
  }

  /**
   * Processes a single date chunk and fetches trades
   * @param {Object} chunk - The date chunk to process
   * @param {number} index - Index of the chunk
   * @param {number} total - Total number of chunks
   * @returns {Promise<Array>} - List of trades for this chunk
   */
  async processChunk(chunk, index, total) {
    const { chunkStart, chunkEnd } = chunk;
    const chunkStartStr = chunkStart.format('YYYY-MM-DD');
    const chunkEndStr = chunkEnd.format('YYYY-MM-DD');

    this.logger.info(`Processing chunk ${index + 1}/${total}`, {
      chunkStart: chunkStartStr,
      chunkEnd: chunkEndStr,
    });

    const logs = await this.fetchLogs({
      startTimestamp: chunkStart.valueOf(),
      endTimestamp: chunkEnd.valueOf(),
    });

    if (!_.isEmpty(logs)) {
      this.logger.info(`Found ${logs.length} trades in chunk`, {
        chunkIndex: index + 1,
        chunkStart: chunkStartStr,
        chunkEnd: chunkEndStr,
      });

      return logs;
    }

    this.logger.info('No trades found in chunk', {
      chunkIndex: index + 1,
      chunkStart: chunkStartStr,
      chunkEnd: chunkEndStr,
    });

    return [];
  }
}
