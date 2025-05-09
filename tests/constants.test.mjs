import { expect } from 'chai';
import { describe, it } from 'mocha';

import { SERVICE_CONSTANTS } from '../libs/bybit/service_constants.mjs';
import { CONSTANTS } from '../libs/constants.mjs';

describe('Constants', () => {
  it('should be defined', () => {
    expect(CONSTANTS).to.exist;
    expect(SERVICE_CONSTANTS).to.exist;
  });
});
