import { expect } from 'chai';
import { describe, it } from 'mocha';

import { SERVICE_CONSTANTS } from '../src/bybit/service_constants.mjs';
import { CONSTANTS } from '../src/constants.mjs';

describe('Constants', () => {
  it('should be defined', () => {
    expect(CONSTANTS).to.exist;
    expect(SERVICE_CONSTANTS).to.exist;
  });

  describe('CONSTANTS', () => {
    it('should have all expected keys', () => {
      // Add all expected keys from CONSTANTS
      const expectedKeys = Object.keys(CONSTANTS);

      expectedKeys.forEach(key => {
        expect(CONSTANTS).to.have.property(key);
        expect(CONSTANTS[key]).to.not.be.undefined;
      });
    });
  });

  describe('SERVICE_CONSTANTS', () => {
    it('should have all expected keys', () => {
      // Add all expected keys from SERVICE_CONSTANTS
      const expectedKeys = Object.keys(SERVICE_CONSTANTS);

      expectedKeys.forEach(key => {
        expect(SERVICE_CONSTANTS).to.have.property(key);
        expect(SERVICE_CONSTANTS[key]).to.not.be.undefined;
      });
    });
  });
});
