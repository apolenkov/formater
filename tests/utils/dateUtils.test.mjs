import { expect } from 'chai';
import { describe, it } from 'mocha';
import moment from 'moment';
import { useFakeTimers } from 'sinon';

import {
  generateDateChunks,
  getTodayFormatted,
  getTodayMinusOneMonth,
  isValidDateFormat,
} from '../../src/utils/dateUtils.mjs';

describe('Date Utils Tests', () => {
  describe('generateDateChunks', () => {
    it('should generate correct date chunks', () => {
      // Test with 7-day chunks
      const start = '2023-01-01';
      const end = '2023-01-15';
      const chunkSize = 7;

      const chunks = generateDateChunks(start, end, chunkSize);

      // Should have 3 chunks
      expect(chunks).to.have.length(3);

      // Check first chunk
      expect(chunks[0].chunkStart.format('YYYY-MM-DD')).to.equal(start);
      expect(chunks[0].chunkEnd.format('YYYY-MM-DD')).to.equal('2023-01-07');

      // Check second chunk
      expect(chunks[1].chunkStart.format('YYYY-MM-DD')).to.equal('2023-01-08');
      expect(chunks[1].chunkEnd.format('YYYY-MM-DD')).to.equal('2023-01-14');

      // Check last chunk
      expect(chunks[2].chunkStart.format('YYYY-MM-DD')).to.equal('2023-01-15');
      expect(chunks[2].chunkEnd.format('YYYY-MM-DD')).to.equal(end);
    });

    it('should handle same start and end date', () => {
      const startOne = '2023-01-01';
      const endOne = '2023-01-01';
      const chunkSize = 7;

      const chunks = generateDateChunks(startOne, endOne, chunkSize);

      // Should have 1 chunk
      expect(chunks).to.have.length(1);
      expect(chunks[0].chunkStart.format('YYYY-MM-DD')).to.equal(startOne);
      expect(chunks[0].chunkEnd.format('YYYY-MM-DD')).to.equal(endOne);
    });

    it('should handle chunk size larger than date range', () => {
      const start = '2023-01-01';
      const end = '2023-01-05';
      const chunkSize = 10;

      const chunks = generateDateChunks(start, end, chunkSize);

      // Should have 1 chunk
      expect(chunks).to.have.length(1);
      expect(chunks[0].chunkStart.format('YYYY-MM-DD')).to.equal(start);
      expect(chunks[0].chunkEnd.format('YYYY-MM-DD')).to.equal(end);
    });

    it('should throw error for invalid date format', () => {
      expect(() =>
        generateDateChunks('invalid-date', '2023-01-05', 7),
      ).to.throw('Invalid date format. Please use YYYY-MM-DD format.');
    });

    it('should throw error when start date is after end date', () => {
      expect(() => generateDateChunks('2023-01-10', '2023-01-05', 7)).to.throw(
        'Start date must be before end date',
      );
    });
  });

  describe('getTodayFormatted', () => {
    it("should return today's date in YYYY-MM-DD format", () => {
      // Use sinon in a functional way without let
      const clock = useFakeTimers(new Date('2023-05-15T12:00:00Z').getTime());

      try {
        expect(getTodayFormatted()).to.equal('2023-05-15');
      } finally {
        // Always restore the clock
        clock.restore();
      }
    });
  });

  describe('getTodayMinusOneMonth', () => {
    it('should return date from one month ago in YYYY-MM-DD format', () => {
      const clock = useFakeTimers(new Date('2023-05-15T12:00:00Z').getTime());

      try {
        expect(getTodayMinusOneMonth()).to.equal('2023-04-15');
      } finally {
        clock.restore();
      }
    });

    it('should handle month boundary correctly', () => {
      const testDate = new Date('2023-03-31T12:00:00Z');
      const clock = useFakeTimers(testDate.getTime());

      try {
        const result = getTodayMinusOneMonth();
        const expectedDate = moment(testDate)
          .subtract(1, 'months')
          .format('YYYY-MM-DD');

        expect(result).to.equal(expectedDate);
      } finally {
        clock.restore();
      }
    });
  });

  describe('isValidDateFormat', () => {
    it('should return true for valid date format', () => {
      expect(isValidDateFormat('2023-05-15')).to.be.true;
    });

    it('should return false for invalid date format', () => {
      expect(isValidDateFormat('05/15/2023')).to.be.false;
      expect(isValidDateFormat('2023/05/15')).to.be.false;
      expect(isValidDateFormat('15-05-2023')).to.be.false;
      expect(isValidDateFormat('not-a-date')).to.be.false;
      expect(isValidDateFormat('')).to.be.false;
    });

    it('should return false for invalid dates', () => {
      expect(isValidDateFormat('2023-13-15')).to.be.false;
      expect(isValidDateFormat('2023-02-30')).to.be.false;
    });
  });
});
