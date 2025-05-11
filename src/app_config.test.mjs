import { expect } from 'chai';
import { describe, it } from 'mocha';

import { APP_CONFIG } from './app_config.mjs';

describe('Constants', () => {
  it('should be defined', () => {
    expect(APP_CONFIG).to.exist;
  });

  describe('APP_CONFIG', () => {
    it('should have all expected keys', () => {
      // Add all expected keys from APP_CONFIG
      const expectedKeys = Object.keys(APP_CONFIG);

      expectedKeys.forEach(key => {
        expect(APP_CONFIG).to.have.property(key);
        expect(APP_CONFIG[key]).to.not.be.undefined;
      });
    });
  });
});
