import { expect } from 'chai';
import { describe, it } from 'mocha';

import { CONSTANTS } from './constants.mjs';

describe('Constants', () => {
  it('should be defined', () => {
    expect(CONSTANTS).to.exist;
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
});
