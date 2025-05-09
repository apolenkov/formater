import winston from 'winston';

const DEFAULT_LEVEL = 'info';

/**
 * Sets up a configured logger instance
 * @param {string} serviceName - Name of the service for logging
 * @returns {winston.Logger} - Configured logger instance
 */
export function setupLogger(serviceName) {
  return winston.createLogger({
    level: process.env.LOG_LEVEL || DEFAULT_LEVEL,
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json(),
    ),
    defaultMeta: { service: serviceName },
    transports: [
      // Write to console with colors
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.printf(
            ({ timestamp, level, message, ...meta }) =>
              `${timestamp} [${level}]: ${message} ${
                Object.keys(meta).length ? JSON.stringify(meta) : ''
              }`,
          ),
        ),
      }),
      // Write all logs to file
      new winston.transports.File({
        filename: `logs/${serviceName}.log`,
        dirname: 'logs',
        maxsize: 10485760, // 10MB
        maxFiles: 5,
      }),
    ],
  });
}
