import { expect } from 'chai';
import { afterEach, describe, it } from 'mocha';
import moment from 'moment';
import { restore, stub } from 'sinon';

import { BybitTradeService } from './service_api.mjs';
import { SERVICE_CONSTANTS } from './service_constants.mjs';

describe('BybitTradeService', () => {
  // Setup function to create fresh mocks and service for each test
  const setupTest = () => {
    const mockClient = {
      getTransactionLog: stub(),
      getDepositLogs: stub(),
    };

    const mockLogger = {
      debug: stub(),
      info: stub(),
      warn: stub(),
      error: stub(),
    };

    const service = new BybitTradeService(mockClient, mockLogger);

    return { mockClient, mockLogger, service };
  };

  // Reset sinon after each test
  afterEach(() => {
    restore();
  });

  describe('fetchLogs', () => {
    it('should fetch logs successfully with a single page', async () => {
      // Setup
      const testContext = setupTest();
      const { mockLogger, service } = testContext;

      // Mock data
      const mockLogs = [
        { id: '1', symbol: 'BTCUSDT', price: '30000' },
        { id: '2', symbol: 'ETHUSDT', price: '2000' },
      ];

      // Create a stub for the method
      const methodStub = stub().resolves({
        result: {
          list: mockLogs,
          nextPageCursor: null,
        },
      });

      const params = {
        startTimestamp: 1609459200000, // 2021-01-01
        endTimestamp: 1612137600000, // 2021-02-01
        category: 'spot',
        method: methodStub,
      };

      // Call the method
      const result = await service.fetchLogs(params);

      // Assertions
      expect(result).to.deep.equal(mockLogs);
      expect(methodStub.calledOnce).to.be.true;
      expect(methodStub.firstCall.args[0]).to.deep.equal({
        category: 'spot',
        startTime: params.startTimestamp,
        endTime: params.endTimestamp,
        limit: SERVICE_CONSTANTS.PAGE_LIMIT,
      });
      expect(mockLogger.debug.calledWith('Fetching transaction log')).to.be
        .true;
    });

    it('should handle pagination correctly', async () => {
      // Setup
      const testContext = setupTest();
      const { mockLogger, service } = testContext;

      // Mock data for pages
      const mockLogsPage1 = [{ id: '1', symbol: 'BTCUSDT', price: '30000' }];
      const mockLogsPage2 = [{ id: '2', symbol: 'ETHUSDT', price: '2000' }];

      // Create a stub for the method with pagination
      const methodStub = stub();

      methodStub.onFirstCall().resolves({
        result: {
          list: mockLogsPage1,
          nextPageCursor: 'next_page_token',
        },
      });
      methodStub.onSecondCall().resolves({
        result: {
          list: mockLogsPage2,
          nextPageCursor: null,
        },
      });

      const params = {
        startTimestamp: 1609459200000,
        endTimestamp: 1612137600000,
        category: 'spot',
        method: methodStub,
      };

      // Call the method
      const result = await service.fetchLogs(params);

      // Assertions
      expect(result).to.deep.equal([...mockLogsPage1, ...mockLogsPage2]);
      expect(methodStub.calledTwice).to.be.true;

      // First call should not have cursor
      expect(methodStub.firstCall.args[0]).to.deep.equal({
        category: 'spot',
        startTime: params.startTimestamp,
        endTime: params.endTimestamp,
        limit: SERVICE_CONSTANTS.PAGE_LIMIT,
      });

      // Second call should include the cursor
      expect(methodStub.secondCall.args[0]).to.deep.equal({
        category: 'spot',
        startTime: params.startTimestamp,
        endTime: params.endTimestamp,
        limit: SERVICE_CONSTANTS.PAGE_LIMIT,
        cursor: 'next_page_token',
      });

      // Ensure mockLogger is used
      expect(mockLogger.debug.called).to.be.true;
    });

    it('should handle empty response gracefully', async () => {
      // Setup
      const testContext = setupTest();
      const { mockLogger, service } = testContext;

      // Create a stub for the method with empty response
      const methodStub = stub().resolves({
        result: {},
      });

      const params = {
        startTimestamp: 1609459200000,
        endTimestamp: 1612137600000,
        category: 'spot',
        method: methodStub,
      };

      // Call the method
      const result = await service.fetchLogs(params);

      // Assertions
      expect(result).to.deep.equal([]);
      expect(mockLogger.warn.calledWith('No list in response')).to.be.true;
      expect(methodStub.called).to.be.true;
    });

    it('should handle API errors gracefully', async () => {
      // Setup
      const testContext = setupTest();
      const { mockLogger, service } = testContext;

      // Create a stub for the method that throws an error
      const mockError = new Error('API Error');
      const methodStub = stub().rejects(mockError);

      const params = {
        startTimestamp: 1609459200000,
        endTimestamp: 1612137600000,
        category: 'spot',
        method: methodStub,
      };

      // Call the method
      const result = await service.fetchLogs(params);

      // Assertions
      expect(result).to.deep.equal([]);
      expect(mockLogger.error.calledWith('Error fetching spot logs')).to.be
        .true;
      expect(mockLogger.error.firstCall.args[1].error).to.equal('API Error');
      expect(methodStub.called).to.be.true;
    });
  });

  describe('getTradesLogs', () => {
    it('should call fetchLogs with correct parameters', async () => {
      // Setup
      const testContext = setupTest();
      const { service } = testContext;

      // Mock data
      const mockTrades = [
        { id: '1', symbol: 'BTCUSDT', price: '30000' },
        { id: '2', symbol: 'ETHUSDT', price: '2000' },
      ];

      // Create a stub for the fetchLogs method
      const fetchLogsStub = stub(service, 'fetchLogs').resolves(mockTrades);

      const params = {
        startTimestamp: 1609459200000,
        endTimestamp: 1612137600000,
      };

      // Call the method
      const result = await service.getTradesLogs(params);

      // Assertions
      expect(result).to.deep.equal(mockTrades);
      expect(fetchLogsStub.calledOnce).to.be.true;
      expect(fetchLogsStub.firstCall.args[0]).to.deep.include({
        startTimestamp: params.startTimestamp,
        endTimestamp: params.endTimestamp,
        category: 'spot',
      });
      expect(fetchLogsStub.firstCall.args[0].method).to.equal(
        service.client.getTransactionLog,
      );
    });
  });

  describe('getDepositLogs', () => {
    it('should call fetchLogs with correct parameters', async () => {
      // Setup
      const testContext = setupTest();
      const { service } = testContext;

      // Mock data
      const mockDeposits = [
        { id: '1', coin: 'BTC', amount: '1.0' },
        { id: '2', coin: 'ETH', amount: '10.0' },
      ];

      // Create a stub for the fetchLogs method
      const fetchLogsStub = stub(service, 'fetchLogs').resolves(mockDeposits);

      const params = {
        startTimestamp: 1609459200000,
        endTimestamp: 1612137600000,
      };

      // Call the method
      const result = await service.getDepositLogs(params);

      // Assertions
      expect(result).to.deep.equal(mockDeposits);
      expect(fetchLogsStub.calledOnce).to.be.true;
      expect(fetchLogsStub.firstCall.args[0]).to.deep.include({
        startTimestamp: params.startTimestamp,
        endTimestamp: params.endTimestamp,
        category: 'spot',
      });
      expect(fetchLogsStub.firstCall.args[0].method).to.equal(
        service.client.getDepositLogs,
      );
    });
  });

  // TODO: add abstract logic
  describe.skip('processChunk', () => {});

  describe('processTraderChunk', () => {
    it('should process a chunk and return trades', async () => {
      // Setup
      const testContext = setupTest();
      const { mockLogger, service } = testContext;

      // Mock data
      const mockTrades = [
        { id: '1', symbol: 'BTCUSDT', price: '30000' },
        { id: '2', symbol: 'ETHUSDT', price: '2000' },
      ];

      // Create a stub for the getTradesLogs method
      const getTradesLogsStub = stub(service, 'getTradesLogs').resolves(
        mockTrades,
      );

      const chunkStart = moment('2021-01-01');
      const chunkEnd = moment('2021-01-07');
      const chunk = { chunkStart, chunkEnd };

      // Call the method
      const result = await service.processTraderChunk(chunk, 0, 5);

      // Assertions
      expect(result).to.deep.equal(mockTrades);
      expect(getTradesLogsStub.calledOnce).to.be.true;
      expect(getTradesLogsStub.firstCall.args[0]).to.deep.equal({
        startTimestamp: chunkStart.valueOf(),
        endTimestamp: chunkEnd.valueOf(),
      });
      expect(mockLogger.info.calledWith('Processing chunk 1/5')).to.be.true;
      expect(
        mockLogger.info.calledWith(
          `Found ${mockTrades.length} trades in chunk`,
        ),
      ).to.be.true;
    });

    it('should handle empty results gracefully', async () => {
      // Setup
      const testContext = setupTest();
      const { mockLogger, service } = testContext;

      // Mock the getTradesLogs method to return empty array
      stub(service, 'getTradesLogs').resolves([]);

      const chunkStart = moment('2021-01-01');
      const chunkEnd = moment('2021-01-07');
      const chunk = { chunkStart, chunkEnd };

      // Call the method
      const result = await service.processTraderChunk(chunk, 0, 5);

      // Assertions
      expect(result).to.deep.equal([]);
      expect(mockLogger.info.calledWith('No trades found in chunk')).to.be.true;
    });
  });

  // TODO: add deposit logic
  describe.skip('processDepositChunk', () => {});

  describe('getAll', () => {
    // TODO: add deposit logic

    it('should fetch all trades for the specified date range', async () => {
      const testContext = setupTest();
      const { mockLogger, service } = testContext;

      // Mock data
      const mockTrades = [
        { id: '1', symbol: 'BTCUSDT', price: '30000', tradeId: 'trade1' },
        { id: '2', symbol: 'ETHUSDT', price: '2000', tradeId: 'trade2' },
      ];

      // Mock the getTradesLogs method to return trades for two chunks
      stub(service, 'getTradesLogs')
        .onFirstCall()
        .resolves(mockTrades.slice(0, 1)) // First chunk
        .onSecondCall()
        .resolves(mockTrades.slice(1)); // Second chunk

      const startDate = '2021-01-01';
      const endDate = '2021-01-30';

      // Call the method
      const result = await service.getAll(startDate, endDate);

      // Assertions
      expect(result).to.be.an('object');
      expect(Object.keys(result)).to.have.lengthOf(2); // Two unique trades
      expect(result['trade1']).to.deep.equal([mockTrades[0]]);
      expect(result['trade2']).to.deep.equal([mockTrades[1]]);
      expect(mockLogger.info.calledWith('Processing complete')).to.be.true;
      expect(mockLogger.warn.called).to.be.false; // No warning for trades found
    });

    it('should handle no trades found gracefully', async () => {
      const testContext = setupTest();
      const { mockLogger, service } = testContext;

      // Mock the processTraderChunk method to return empty array
      stub(service, 'processTraderChunk').resolves([]);

      const startDate = '2021-01-01';
      const endDate = '2021-01-02';

      // Call the method
      const result = await service.getAll(startDate, endDate);

      // Assertions
      expect(result).to.deep.equal({}); // No trades found
      expect(
        mockLogger.warn.calledWith('No trades found for the specified period'),
      ).to.be.true;
    });
  });
});
