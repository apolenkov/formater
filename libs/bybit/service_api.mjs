import _ from 'lodash';

import { SERVICE_CONSTANTS } from './service_constants.mjs';

/**
 * Class for handling Bybit API operations
 */
export class BybitTradeService {
  /**
   * @param {Object} client - Bybit API client
   * @param {Object} logger - Logger instance
   */
  constructor(client, logger) {
    this.client = client;
    this.logger = logger;
  }

  /**
   * Recursively fetches trade logs from Bybit API with pagination
   * @param {Object} params - Request parameters
   * @param {number} [page=1] - Current page number
   * @param {Array} [transfers=[]] - Accumulated transfers
   * @param {string} [cursor] - Pagination cursor
   * @returns {Promise<Array>} - List of trades
   */
  async getTradesLogs(params, page = 1, transfers = [], cursor) {
    const { startTimestamp, endTimestamp } = params;

    const requestData = {
      category: 'spot',
      startTime: startTimestamp,
      endTime: endTimestamp,
      limit: SERVICE_CONSTANTS.PAGE_LIMIT,
      ...(cursor && { cursor }),
    };

    try {
      this.logger.debug('Fetching transaction log', {
        page,
        startTime: new Date(startTimestamp).toISOString(),
        endTime: new Date(endTimestamp).toISOString(),
        cursor,
      });

      const response = await this.client.getTransactionLog(requestData);

      if (!response.result?.list) {
        this.logger.warn('No list in response', { response });

        return transfers;
      }

      const newItems = response.result.list.length;

      this.logger.debug(`Received ${newItems} items`, { page });

      // Using lodash to concatenate arrays without mutation
      const newTransfers =
        newItems > 0 ? _.concat(transfers, response.result.list) : transfers;

      const nextCursor = response.result.nextPageCursor;

      if (nextCursor) {
        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));

        return this.getTradesLogs(params, page + 1, newTransfers, nextCursor);
      }

      return newTransfers;
    } catch (error) {
      this.logger.error('Error fetching trades', {
        page,
        error: error.message,
        stack: error.stack,
      });

      return transfers; // Return what we have so far
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

    const logs = await this.getTradesLogs({
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
