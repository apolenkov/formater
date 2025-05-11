import moment from 'moment';

/**
 * Generates date chunks between start and end dates with specified chunk size
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @param {number} chunkSize - Size of each chunk in days
 * @returns {Array} Array of objects with chunkStart and chunkEnd properties
 */
export function generateDateChunks(startDate, endDate, chunkSize) {
  // Validate date formats
  if (!isValidDateFormat(startDate) || !isValidDateFormat(endDate))
    throw new Error('Invalid date format. Please use YYYY-MM-DD format.');

  const start = moment(startDate);
  const end = moment(endDate);

  // Validate date range
  if (start.isAfter(end)) throw new Error('Start date must be before end date');

  const generateChunks = (currentStart, accumulatedChunks = []) => {
    if (currentStart.isAfter(end)) return accumulatedChunks;

    const currentEnd = moment.min(
      currentStart.clone().add(chunkSize - 1, 'days'),
      end.clone(),
    );

    const chunks = [
      ...accumulatedChunks,
      {
        chunkStart: currentStart.clone(),
        chunkEnd: currentEnd.clone(),
      },
    ];

    const nextStart = currentEnd.clone().add(1, 'days');

    return generateChunks(nextStart, chunks);
  };

  return generateChunks(start.clone());
}

/**
 * Returns today's date in YYYY-MM-DD format
 * @returns {string} Today's date formatted as YYYY-MM-DD
 */
export function getTodayFormatted() {
  return moment().format('YYYY-MM-DD');
}

/**
 * Returns the date from one month ago in YYYY-MM-DD format
 * @returns {string} Date from one month ago formatted as YYYY-MM-DD
 */
export function getTodayMinusOneMonth() {
  return moment().subtract(1, 'months').format('YYYY-MM-DD');
}

/**
 * Validates if a string is in YYYY-MM-DD format and represents a valid date
 * @param {string} dateString - The date string to validate
 * @returns {boolean} True if the date is valid and in correct format
 */
export function isValidDateFormat(dateString) {
  if (!dateString || typeof dateString !== 'string') return false;

  // Check format using regex (YYYY-MM-DD)
  const regex = /^\d{4}-\d{2}-\d{2}$/;

  if (!regex.test(dateString)) return false;

  // Check if it's a valid date
  const date = moment(dateString, 'YYYY-MM-DD', true);

  return date.isValid();
}
