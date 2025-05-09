import _ from 'lodash';
import moment from 'moment';

/**
 * Get today's date in YYYY-MM-DD format
 * @returns {string} Today's date
 */
function getTodayFormatted() {
  return moment().format('YYYY-MM-DD');
}

/**
 * Get date from one month ago in YYYY-MM-DD format
 * @returns {string} Date from one month ago
 */
function getTodayMinusOneMonth() {
  return moment().subtract(1, 'months').format('YYYY-MM-DD');
}

/**
 * Validate date format (YYYY-MM-DD)
 * @param {string} dateString - Date string to validate
 * @returns {boolean} Whether the date is valid
 */
function isValidDateFormat(dateString) {
  return moment(dateString, 'YYYY-MM-DD', true).isValid();
}

/**
 * Generates date chunks for API requests
 * @param {String} startDate - Start date
 * @param {String} endDate - End date
 * @param {number} chunkSizeInDays - Size of each chunk in days
 * @returns {Array<Object>} - Array of date chunks
 */
function generateDateChunks(startDate, endDate, chunkSizeInDays) {
  // Convert dates to moment objects
  const start = moment(startDate);
  const end = moment(endDate);

  if (!start.isValid() || !end.isValid()) {
    const error = 'Invalid date format. Please use YYYY-MM-DD format.';

    throw new Error(error);
  }

  if (start.isAfter(end)) {
    const error = 'Start date must be before end date';

    throw new Error(error);
  }

  // Handle case when start and end are the same
  if (start.isSame(end, 'day')) return [{ chunkStart: start, chunkEnd: end }];

  const totalDays = end.diff(start, 'days');

  // Calculate how many complete chunks we need
  const completeChunks = Math.floor(totalDays / chunkSizeInDays);

  // Generate the chunks
  const chunks = _.times(completeChunks, index => {
    const chunkStart = start.clone().add(index * chunkSizeInDays, 'days');
    const chunkEnd = chunkStart.clone().add(chunkSizeInDays - 1, 'days');

    return { chunkStart, chunkEnd };
  });

  // Add the final chunk if needed
  const lastChunkStart =
    completeChunks > 0
      ? start.clone().add(completeChunks * chunkSizeInDays, 'days')
      : start.clone();

  if (lastChunkStart.isSameOrBefore(end, 'day')) {
    chunks.push({
      chunkStart: lastChunkStart,
      chunkEnd: end,
    });
  }

  return chunks;
}

export {
  generateDateChunks,
  getTodayFormatted,
  getTodayMinusOneMonth,
  isValidDateFormat,
};
