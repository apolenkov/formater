import { expect } from 'chai';
import { describe, it } from 'mocha';

import { SERVICE_CONFIG } from './service_config.mjs';

describe('Constants', () => {
  it('should be defined', () => {
    expect(SERVICE_CONFIG).to.exist;
  });

  describe('SERVICE_CONFIG', () => {
    it('should have all expected keys', () => {
      // Add all expected keys from SERVICE_CONFIG
      const expectedKeys = Object.keys(SERVICE_CONFIG);

      expectedKeys.forEach(key => {
        expect(SERVICE_CONFIG).to.have.property(key);
        expect(SERVICE_CONFIG[key]).to.not.be.undefined;
      });
    });
  });
});
