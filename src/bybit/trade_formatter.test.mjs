import { expect } from 'chai';
import { describe, it } from 'mocha';
import moment from 'moment';

import { SERVICE_CONFIG } from './service_config.mjs';
import { convertToIntelInvestFormat } from './trade_formatter.mjs';

describe('Trade Formatter', () => {
  describe('convertToIntelInvestFormat', () => {
    it('should correctly format a buy trade', () => {
      // Arrange
      const timestamp = Date.now();
      const formattedDate = moment(timestamp).format('DD.MM.YYYY HH:mm:ss');
      const tradeId = 'trade123';
      const trade = [
        {
          side: SERVICE_CONFIG.SIDE_NAME,
          transactionTime: timestamp.toString(),
          cashFlow: '-100',
          currency: 'BTC',
          tradePrice: '20000',
          tradeId,
        },
        {
          cashFlow: '2000000',
          currency: 'USDT',
          feeRate: '0.1',
          tradeId,
        },
      ];

      // Act
      const result = convertToIntelInvestFormat(trade);
      const lines = result.split('\n');

      // Assert
      expect(lines).to.have.length(2);

      const dealInParts = lines[0].split(';');

      expect(dealInParts[0]).to.equal(SERVICE_CONFIG.TRADE_TYPES.SHARE_BUY);
      expect(dealInParts[1]).to.equal(formattedDate);
      expect(dealInParts[2]).to.equal('BTC:BTC');
      expect(dealInParts[3]).to.equal('100');
      expect(dealInParts[4]).to.equal('20000');
      expect(dealInParts[5]).to.equal('0.1');
      expect(dealInParts[9]).to.equal('USDT');
      expect(dealInParts[11]).to.equal(tradeId);
      expect(dealInParts[12]).to.equal(SERVICE_CONFIG.SYSTEM_NAME);

      const dealOutParts = lines[1].split(';');

      expect(dealOutParts[0]).to.equal(SERVICE_CONFIG.TRADE_TYPES.SHARE_OUT);
      expect(dealOutParts[1]).to.equal(formattedDate);
      expect(dealOutParts[2]).to.equal('USDT:USDT');
      expect(dealOutParts[3]).to.equal('2000000');
      expect(dealOutParts[4]).to.equal('1');
      expect(dealOutParts[5]).to.equal('0');
      expect(dealOutParts[9]).to.equal('USD');
      expect(dealOutParts[11]).to.equal(tradeId);
      expect(dealOutParts[12]).to.equal(SERVICE_CONFIG.SYSTEM_NAME);
    });

    it('should correctly format a sell trade', () => {
      // Arrange
      const timestamp = Date.now();
      const formattedDate = moment(timestamp).format('DD.MM.YYYY HH:mm:ss');
      const tradeId = 'trade456';
      const trade = [
        {
          side: SERVICE_CONFIG.TRADE_TYPES.SHARE_SELL,
          transactionTime: timestamp.toString(),
          cashFlow: '0.5',
          currency: 'ETH',
          tradePrice: '1500',
          tradeId,
        },
        {
          cashFlow: '-750',
          currency: 'USDT',
          feeRate: '0.2',
          tradeId,
        },
      ];

      // Act
      const result = convertToIntelInvestFormat(trade);
      const lines = result.split('\n');

      // Assert
      expect(lines).to.have.length(2);

      const dealInParts = lines[0].split(';');

      expect(dealInParts[0]).to.equal(SERVICE_CONFIG.TRADE_TYPES.SHARE_SELL);
      expect(dealInParts[1]).to.equal(formattedDate);
      expect(dealInParts[2]).to.equal('ETH:ETH');
      expect(dealInParts[3]).to.equal('0.5');
      expect(dealInParts[4]).to.equal('1500');
      expect(dealInParts[5]).to.equal('0.2');

      const dealOutParts = lines[1].split(';');

      expect(dealOutParts[0]).to.equal(SERVICE_CONFIG.TRADE_TYPES.SHARE_IN);
      expect(dealOutParts[2]).to.equal('USDT:USDT');
      expect(dealOutParts[3]).to.equal('750');
    });

    it('should handle large numbers correctly using Big.js', () => {
      // Arrange
      const timestamp = Date.now();
      const tradeId = 'trade789';
      const trade = [
        {
          side: SERVICE_CONFIG.SIDE_NAME,
          transactionTime: timestamp.toString(),
          cashFlow: '-0.00000001',
          currency: 'BTC',
          tradePrice: '20000',
          tradeId,
        },
        {
          cashFlow: '0.0000002',
          currency: 'USDT',
          feeRate: '0.001',
          tradeId,
        },
      ];

      // Act
      const result = convertToIntelInvestFormat(trade);
      const lines = result.split('\n');

      // Assert
      expect(lines).to.have.length(2);

      const dealInParts = lines[0].split(';');

      expect(dealInParts[3]).to.equal('0.00000001');

      const dealOutParts = lines[1].split(';');

      expect(dealOutParts[3]).to.equal('0.0000002');
    });

    it('should throw an error when trade pair has more than 2 items', () => {
      // Arrange
      const timestamp = Date.now();
      const tradeId = 'trade123';
      const trade = [
        {
          side: SERVICE_CONFIG.SIDE_NAME,
          transactionTime: timestamp.toString(),
          cashFlow: '-100',
          currency: 'BTC',
          tradePrice: '20000',
          tradeId,
        },
        {
          cashFlow: '2000000',
          currency: 'USDT',
          feeRate: '0.1',
          tradeId,
        },
        {
          cashFlow: '50',
          currency: 'ETH',
          feeRate: '0.05',
          tradeId,
        },
      ];

      // Act & Assert
      expect(() => convertToIntelInvestFormat(trade)).to.throw(
        'In trade pair must be two iteration',
      );
    });
  });
});
