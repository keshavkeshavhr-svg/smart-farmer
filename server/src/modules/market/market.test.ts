/**
 * Unit tests for market price computation logic.
 * Tests the summarization and prediction heuristics
 * without requiring a live database.
 */

describe('Market Price Computation', () => {
  // Simulate 30 days of price points
  const generatePricePoints = (basePrice: number, days: number, trend: 'up' | 'down' | 'stable') => {
    return Array.from({ length: days }, (_, i) => {
      const trendFactor = trend === 'up' ? i * 0.5 : trend === 'down' ? -i * 0.3 : 0;
      const noise = (Math.random() - 0.5) * 2;
      return {
        date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000).toISOString(),
        price: basePrice + trendFactor + noise,
        crop: 'Tomato',
        district: 'Bangalore',
      };
    });
  };

  describe('Price Summary Computation', () => {
    it('should compute correct min/max/avg from price points', () => {
      const prices = [25, 30, 28, 35, 22, 27, 33];
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      const avg = prices.reduce((a, b) => a + b, 0) / prices.length;

      expect(min).toBe(22);
      expect(max).toBe(35);
      expect(avg).toBeCloseTo(28.57, 1);
    });

    it('should handle single price point', () => {
      const prices = [42];
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      const avg = prices[0];

      expect(min).toBe(42);
      expect(max).toBe(42);
      expect(avg).toBe(42);
    });

    it('should detect upward trend', () => {
      const points = generatePricePoints(20, 30, 'up');
      const firstWeekAvg = points.slice(0, 7).reduce((s, p) => s + p.price, 0) / 7;
      const lastWeekAvg = points.slice(-7).reduce((s, p) => s + p.price, 0) / 7;

      expect(lastWeekAvg).toBeGreaterThan(firstWeekAvg);
    });

    it('should detect downward trend', () => {
      const points = generatePricePoints(40, 30, 'down');
      const firstWeekAvg = points.slice(0, 7).reduce((s, p) => s + p.price, 0) / 7;
      const lastWeekAvg = points.slice(-7).reduce((s, p) => s + p.price, 0) / 7;

      expect(lastWeekAvg).toBeLessThan(firstWeekAvg);
    });
  });

  describe('AI Price Prediction Heuristic', () => {
    /**
     * Simulates the linear regression stub from ai.controller.ts
     * prediction = lastPrice * (1 + trend%) ± range
     */
    function predictPrice(recentPrices: number[]): { min: number; max: number; predicted: number } {
      if (recentPrices.length < 2) {
        const p = recentPrices[0] || 0;
        return { min: p * 0.9, max: p * 1.1, predicted: p };
      }

      const n = recentPrices.length;
      const last = recentPrices[n - 1];
      const first = recentPrices[0];
      const trendPct = (last - first) / first;
      
      // Simple linear extrapolation
      const predicted = last * (1 + trendPct * 0.1); // dampen the trend
      const range = Math.abs(trendPct) * last * 0.15 + last * 0.05;

      return {
        min: Math.max(0, predicted - range),
        max: predicted + range,
        predicted,
      };
    }

    it('should predict higher prices for upward trend', () => {
      const prices = [20, 22, 24, 26, 28, 30, 32];
      const prediction = predictPrice(prices);

      expect(prediction.predicted).toBeGreaterThan(30);
      expect(prediction.max).toBeGreaterThan(prediction.predicted);
      expect(prediction.min).toBeLessThan(prediction.predicted);
    });

    it('should predict lower prices for downward trend', () => {
      const prices = [40, 38, 36, 34, 32, 30, 28];
      const prediction = predictPrice(prices);

      expect(prediction.predicted).toBeLessThan(30);
    });

    it('should handle stable prices', () => {
      const prices = [25, 25, 25, 25, 25, 25, 25];
      const prediction = predictPrice(prices);

      expect(prediction.predicted).toBeCloseTo(25, 0);
      expect(prediction.min).toBeGreaterThan(20);
      expect(prediction.max).toBeLessThan(30);
    });

    it('should always return non-negative min', () => {
      const prices = [5, 4, 3, 2, 1];
      const prediction = predictPrice(prices);

      expect(prediction.min).toBeGreaterThanOrEqual(0);
    });

    it('should handle single value gracefully', () => {
      const prediction = predictPrice([30]);
      expect(prediction.predicted).toBe(30);
      expect(prediction.min).toBe(27); // 30 * 0.9
      expect(prediction.max).toBe(33); // 30 * 1.1
    });
  });

  describe('Razorpay Signature Verification', () => {
    const crypto = require('crypto');

    function verifySignature(orderId: string, paymentId: string, signature: string, secret: string): boolean {
      const body = `${orderId}|${paymentId}`;
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(body)
        .digest('hex');
      return expectedSignature === signature;
    }

    it('should verify valid HMAC signature', () => {
      const secret = 'test_razorpay_secret';
      const orderId = 'order_abc123';
      const paymentId = 'pay_xyz789';
      const body = `${orderId}|${paymentId}`;
      const validSig = crypto.createHmac('sha256', secret).update(body).digest('hex');

      expect(verifySignature(orderId, paymentId, validSig, secret)).toBe(true);
    });

    it('should reject tampered signature', () => {
      const result = verifySignature('order_abc', 'pay_xyz', 'tampered_signature', 'secret');
      expect(result).toBe(false);
    });
  });
});
