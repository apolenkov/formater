import { expect } from 'chai';
import { describe, it } from 'mocha';

import { CONSTANTS } from '../../scripts/constants.mjs';

describe('Constants', () => {
  it('should be defined', () => {
    expect(CONSTANTS).to.exist;
  });

  it('PATHS should contain expected properties', () => {
    expect(CONSTANTS.PATHS).to.have.property('LOGS_DIR', 'logs');
    expect(CONSTANTS.PATHS).to.have.property('OUTPUT_DIR', 'out');
  });

  it('CSV_HEADER should be defined and contain expected format', () => {
    expect(CONSTANTS.CSV_HEADER).to.exist;
    expect(CONSTANTS.CSV_HEADER).to.include('#CsvFormatVersion:v1');
    expect(CONSTANTS.CSV_HEADER).to.include('TYPE;DATE;TICKER');
  });
});
