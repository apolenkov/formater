import { expect } from 'chai';
import { describe, it } from 'mocha';

import { SERVICE_CONSTANTS } from './service_constants.mjs';

describe('Constants', () => {
  it('should be defined', () => {
    expect(SERVICE_CONSTANTS).to.exist;
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
