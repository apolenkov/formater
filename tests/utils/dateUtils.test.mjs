import { expect } from 'chai';
import { describe, it } from 'mocha';

import { generateDateChunks } from '../../scripts/utils/dateUtils.mjs';

describe('Date Utils Tests', () => {
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

    // Check first chunk
    expect(chunks[1].chunkStart.format('YYYY-MM-DD')).to.equal('2023-01-08');
    expect(chunks[1].chunkEnd.format('YYYY-MM-DD')).to.equal('2023-01-14');

    // Check last chunk
    expect(chunks[2].chunkStart.format('YYYY-MM-DD')).to.equal(end);
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
});
