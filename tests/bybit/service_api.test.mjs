import { expect } from 'chai';
import { afterEach, describe, it } from 'mocha';
import moment from 'moment';
import { restore, stub } from 'sinon';

import { BybitTradeService } from '../../src/bybit/service_api.mjs';
import { SERVICE_CONSTANTS } from '../../src/bybit/service_constants.mjs';

describe('BybitTradeService', () => {
  // Setup function to create fresh mocks and service for each test
  const setupTest = () => {
    const mockClient = {
      getTransactionLog: stub(),
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

  describe('getTradesLogs', () => {
    it('should fetch trades successfully with a single page', async () => {
      // Setup
      const testContext = setupTest();
      const { mockClient, mockLogger, service } = testContext;

      // Mock data
      const mockTrades = [
        { id: '1', symbol: 'BTCUSDT', price: '30000' },
        { id: '2', symbol: 'ETHUSDT', price: '2000' },
      ];

      // Setup mock response
      mockClient.getTransactionLog.resolves({
        result: {
          list: mockTrades,
          nextPageCursor: null,
        },
      });

      const params = {
        startTimestamp: 1609459200000, // 2021-01-01
        endTimestamp: 1612137600000, // 2021-02-01
      };

      // Call the method
      const result = await service.getTradesLogs(params);

      // Assertions
      expect(result).to.deep.equal(mockTrades);
      expect(mockClient.getTransactionLog.calledOnce).to.be.true;
      expect(mockClient.getTransactionLog.firstCall.args[0]).to.deep.equal({
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
      const { mockClient, mockLogger, service } = testContext;

      // Mock data for first page
      const mockTradesPage1 = [{ id: '1', symbol: 'BTCUSDT', price: '30000' }];

      // Mock data for second page
      const mockTradesPage2 = [{ id: '2', symbol: 'ETHUSDT', price: '2000' }];

      // Setup mock responses for pagination
      mockClient.getTransactionLog.onFirstCall().resolves({
        result: {
          list: mockTradesPage1,
          nextPageCursor: 'next_page_token',
        },
      });

      mockClient.getTransactionLog.onSecondCall().resolves({
        result: {
          list: mockTradesPage2,
          nextPageCursor: null,
        },
      });

      const params = {
        startTimestamp: 1609459200000,
        endTimestamp: 1612137600000,
      };

      // Call the method
      const result = await service.getTradesLogs(params);

      // Assertions
      expect(result).to.deep.equal([...mockTradesPage1, ...mockTradesPage2]);
      expect(mockClient.getTransactionLog.calledTwice).to.be.true;

      // First call should not have cursor
      expect(mockClient.getTransactionLog.firstCall.args[0]).to.deep.equal({
        category: 'spot',
        startTime: params.startTimestamp,
        endTime: params.endTimestamp,
        limit: SERVICE_CONSTANTS.PAGE_LIMIT,
      });

      // Second call should include the cursor
      expect(mockClient.getTransactionLog.secondCall.args[0]).to.deep.equal({
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
      const { mockClient, mockLogger, service } = testContext;

      // Setup mock response with no list
      mockClient.getTransactionLog.resolves({
        result: {},
      });

      const params = {
        startTimestamp: 1609459200000,
        endTimestamp: 1612137600000,
      };

      // Call the method
      const result = await service.getTradesLogs(params);

      // Assertions
      expect(result).to.deep.equal([]);
      expect(mockLogger.warn.calledWith('No list in response')).to.be.true;
      expect(mockClient.getTransactionLog.called).to.be.true;
    });

    it('should handle API errors gracefully', async () => {
      // Setup
      const testContext = setupTest();
      const { mockClient, mockLogger, service } = testContext;

      // Setup mock to throw an error
      const mockError = new Error('API Error');

      mockClient.getTransactionLog.rejects(mockError);

      const params = {
        startTimestamp: 1609459200000,
        endTimestamp: 1612137600000,
      };

      // Call the method
      const result = await service.getTradesLogs(params);

      // Assertions
      expect(result).to.deep.equal([]);
      expect(mockLogger.error.calledWith('Error fetching trades')).to.be.true;
      expect(mockLogger.error.firstCall.args[1].error).to.equal('API Error');
      expect(mockClient.getTransactionLog.called).to.be.true;
    });
  });

  describe('processChunk', () => {
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
      const result = await service.processChunk(chunk, 0, 5);

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
      const result = await service.processChunk(chunk, 0, 5);

      // Assertions
      expect(result).to.deep.equal([]);
      expect(mockLogger.info.calledWith('No trades found in chunk')).to.be.true;
    });
  });

  describe('getAll', () => {
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

      console.log(result);

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

      // Mock the getTradesLogs method to return empty array
      stub(service, 'getTradesLogs').resolves([]);

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
