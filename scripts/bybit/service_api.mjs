import _ from 'lodash';

import { SERVICE_CONSTANTS } from './service_constants.mjs';

/**
 * Recursively fetches trade logs from Bybit API with pagination
 * @param {Object} params - Request parameters
 * @param {Object} client - Bybit API client
 * @param {Object} logger - Logger instance
 * @param {number} page - Current page number
 * @param {Array} transfers - Accumulated transfers
 * @param {string} [cursor] - Pagination cursor
 * @returns {Promise<Array>} - List of trades
 */
export async function getTradesLogs(
  params,
  client,
  logger,
  page = 1,
  transfers = [],
  cursor,
) {
  const { startTimestamp, endTimestamp } = params;

  const requestData = {
    category: 'spot',
    startTime: startTimestamp,
    endTime: endTimestamp,
    limit: SERVICE_CONSTANTS.PAGE_LIMIT,
    ...(cursor && { cursor }),
  };

  try {
    logger.debug('Fetching transaction log', {
      page,
      startTime: new Date(startTimestamp).toISOString(),
      endTime: new Date(endTimestamp).toISOString(),
      cursor,
    });

    const response = await client.getTransactionLog(requestData);

    if (!response.result?.list) {
      logger.warn('No list in response', { response });

      return transfers;
    }

    const newItems = response.result.list.length;

    logger.debug(`Received ${newItems} items`, { page });

    // Using lodash to concatenate arrays
    const newTransfers =
      newItems > 0 ? _.concat(transfers, response.result.list) : transfers;

    const nextCursor = response.result.nextPageCursor;

    if (nextCursor) {
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));

      return getTradesLogs(
        params,
        client,
        logger,
        page + 1,
        newTransfers,
        nextCursor,
      );
    }

    return newTransfers;
  } catch (error) {
    logger.error('Error fetching trades', {
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
 * @param {Object} client - Bybit API client
 * @param {Object} logger - Logger instance
 * @returns {Promise<Array>} - List of trades for this chunk
 */
export async function processChunk(chunk, index, total, client, logger) {
  const { chunkStart, chunkEnd } = chunk;
  const chunkStartStr = chunkStart.format('YYYY-MM-DD');
  const chunkEndStr = chunkEnd.format('YYYY-MM-DD');

  logger.info(`Processing chunk ${index + 1}/${total}`, {
    chunkStart: chunkStartStr,
    chunkEnd: chunkEndStr,
  });

  const logs = await getTradesLogs(
    {
      startTimestamp: chunkStart.valueOf(),
      endTimestamp: chunkEnd.valueOf(),
    },
    client,
    logger,
  );

  if (!_.isEmpty(logs)) {
    logger.info(`Found ${logs.length} trades in chunk`, {
      chunkIndex: index + 1,
      chunkStart: chunkStartStr,
      chunkEnd: chunkEndStr,
    });

    return logs;
  }

  logger.info('No trades found in chunk', {
    chunkIndex: index + 1,
    chunkStart: chunkStartStr,
    chunkEnd: chunkEndStr,
  });

  return [];
}
