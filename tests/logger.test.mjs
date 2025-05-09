import { expect } from 'chai';
import { afterEach, beforeEach, describe, it } from 'mocha';
import { createSandbox } from 'sinon';
import winston from 'winston';

import { setupLogger } from '../src/logger.mjs';

describe('Logger', () => {
  // Use a stubs object to store all stubs and mocks
  const stubs = {};
  // Create a sinon sandbox
  const sandbox = createSandbox();

  beforeEach(() => {
    // Create a mock logger object
    stubs.mockLogger = {
      level: '',
      format: {},
      defaultMeta: {},
      transports: [],
    };

    // Create stubs for winston format methods
    stubs.formatStub = {
      combine: sandbox.stub().returnsThis(),
      timestamp: sandbox.stub().returnsThis(),
      json: sandbox.stub().returnsThis(),
      colorize: sandbox.stub().returnsThis(),
      printf: sandbox.stub().returnsThis(),
    };

    // Create stubs for winston transports
    stubs.consoleTransportStub = sandbox.stub().returns({});
    stubs.fileTransportStub = sandbox.stub().returns({});

    // Create a stub for winston.createLogger
    stubs.createLoggerStub = sandbox.stub().callsFake(config => {
      stubs.mockLogger.level = config.level;
      stubs.mockLogger.format = config.format;
      stubs.mockLogger.defaultMeta = config.defaultMeta;
      stubs.mockLogger.transports = config.transports;

      return stubs.mockLogger;
    });

    // Replace winston methods with stubs using sandbox
    sandbox.stub(winston, 'createLogger').callsFake(stubs.createLoggerStub);

    // For format properties, we need to be careful as they might be getters
    sandbox.stub(winston, 'format').value({
      combine: stubs.formatStub.combine,
      timestamp: stubs.formatStub.timestamp,
      json: stubs.formatStub.json,
      colorize: stubs.formatStub.colorize,
      printf: stubs.formatStub.printf,
    });

    // For transports, also use value to avoid getter issues
    sandbox.stub(winston, 'transports').value({
      Console: stubs.consoleTransportStub,
      File: stubs.fileTransportStub,
    });
  });

  afterEach(() => {
    // Restore all stubs and mocks
    sandbox.restore();

    // Clear the stubs object
    Object.keys(stubs).forEach(key => {
      delete stubs[key];
    });
  });

  it('should create a logger with correct configuration', () => {
    const serviceName = 'testService';
    const logger = setupLogger(serviceName);

    expect(stubs.createLoggerStub.called).to.be.true;
    expect(logger).to.exist;
    expect(logger.defaultMeta).to.deep.equal({ service: serviceName });
    expect(logger.level).to.equal('info');
    expect(stubs.consoleTransportStub.called).to.be.true;
    expect(stubs.fileTransportStub.called).to.be.true;
    expect(stubs.fileTransportStub.firstCall.args[0]).to.include({
      filename: `logs/${serviceName}.log`,
      dirname: 'logs',
    });
  });

  it('should use LOG_LEVEL from environment if available', () => {
    const originalEnv = process.env.LOG_LEVEL;

    process.env.LOG_LEVEL = 'debug';

    const logger = setupLogger('testService');

    expect(logger.level).to.equal('debug');

    // Restore original environment value
    process.env.LOG_LEVEL = originalEnv;
  });
});
