/**
 * Test file for Splitwise services
 * Run with: npx jest splitwise-services.test.ts
 */

import { SplitwiseSplitService } from './splitwise-split.service';

describe('SplitwiseSplitService', () => {
  describe('computeShares', () => {
    it('should compute equal split correctly', () => {
      const result = SplitwiseSplitService.computeShares({
        splitType: 'EQUAL',
        amount: 100,
        participants: ['user1', 'user2', 'user3']
      });

      expect(result).toHaveLength(3);
      expect(result[0].shareAmount).toBe(3333); // 33.33
      expect(result[1].shareAmount).toBe(3333); // 33.33
      expect(result[2].shareAmount).toBe(3334); // 33.34 (remainder)
      
      // Total should equal original amount
      const total = result.reduce((sum, r) => sum + r.shareAmount, 0);
      expect(total).toBe(10000); // 100.00 in cents
    });

    it('should compute unequal split correctly', () => {
      const result = SplitwiseSplitService.computeShares({
        splitType: 'UNEQUAL',
        amount: 100,
        participants: ['user1', 'user2'],
        shares: [60, 40]
      });

      expect(result).toHaveLength(2);
      expect(result[0].shareAmount).toBe(6000); // 60.00
      expect(result[1].shareAmount).toBe(4000); // 40.00
      
      const total = result.reduce((sum, r) => sum + r.shareAmount, 0);
      expect(total).toBe(10000);
    });

    it('should compute percent split correctly', () => {
      const result = SplitwiseSplitService.computeShares({
        splitType: 'PERCENT',
        amount: 100,
        participants: ['user1', 'user2', 'user3'],
        percents: [50, 30, 20]
      });

      expect(result).toHaveLength(3);
      expect(result[0].shareAmount).toBe(5000); // 50.00
      expect(result[1].shareAmount).toBe(3000); // 30.00
      expect(result[2].shareAmount).toBe(2000); // 20.00
      
      const total = result.reduce((sum, r) => sum + r.shareAmount, 0);
      expect(total).toBe(10000);
    });

    it('should handle edge case with 1 participant', () => {
      const result = SplitwiseSplitService.computeShares({
        splitType: 'EQUAL',
        amount: 50,
        participants: ['user1']
      });

      expect(result).toHaveLength(1);
      expect(result[0].shareAmount).toBe(5000); // 50.00
    });

    it('should throw error for invalid split type', () => {
      expect(() => {
        SplitwiseSplitService.computeShares({
          splitType: 'INVALID' as any,
          amount: 100,
          participants: ['user1', 'user2']
        });
      }).toThrow('Unknown split type: INVALID');
    });

    it('should throw error when shares don\'t match participants', () => {
      expect(() => {
        SplitwiseSplitService.computeShares({
          splitType: 'UNEQUAL',
          amount: 100,
          participants: ['user1', 'user2'],
          shares: [60] // Missing second share
        });
      }).toThrow('Shares array is required and must match participant count for UNEQUAL split');
    });
  });

  describe('validateSplitInput', () => {
    it('should return no errors for valid input', () => {
      const errors = SplitwiseSplitService.validateSplitInput({
        splitType: 'EQUAL',
        amount: 100,
        participants: ['user1', 'user2']
      });

      expect(errors).toHaveLength(0);
    });

    it('should return error for zero amount', () => {
      const errors = SplitwiseSplitService.validateSplitInput({
        splitType: 'EQUAL',
        amount: 0,
        participants: ['user1', 'user2']
      });

      expect(errors).toContain('Amount must be greater than 0');
    });

    it('should return error for empty participants', () => {
      const errors = SplitwiseSplitService.validateSplitInput({
        splitType: 'EQUAL',
        amount: 100,
        participants: []
      });

      expect(errors).toContain('At least one participant is required');
    });

    it('should return error for missing shares in UNEQUAL split', () => {
      const errors = SplitwiseSplitService.validateSplitInput({
        splitType: 'UNEQUAL',
        amount: 100,
        participants: ['user1', 'user2']
        // Missing shares array
      });

      expect(errors).toContain('Shares array is required and must have 2 elements for UNEQUAL split');
    });
  });

  describe('getSplitTypeOptions', () => {
    it('should return all split type options', () => {
      const options = SplitwiseSplitService.getSplitTypeOptions();

      expect(options).toHaveLength(4);
      expect(options.map(o => o.value)).toEqual(['EQUAL', 'UNEQUAL', 'PERCENT', 'SHARES']);
      expect(options[0].label).toBe('Split equally');
    });
  });
});

// Test data for balance calculations
export const mockUserBalances = [
  {
    userId: 'user1',
    userName: 'Alice',
    userEmail: 'alice@example.com',
    netAmount: 4000, // +40.00 (owed to Alice)
    credits: 12000,  // 120.00 paid
    debits: 8000,    // 80.00 owed
    settlementsIn: 0,
    settlementsOut: 0
  },
  {
    userId: 'user2',
    userName: 'Bob',
    userEmail: 'bob@example.com',
    netAmount: -3000, // -30.00 (Bob owes)
    credits: 6000,    // 60.00 paid
    debits: 9000,     // 90.00 owed
    settlementsIn: 0,
    settlementsOut: 0
  },
  {
    userId: 'user3',
    userName: 'Charlie',
    userEmail: 'charlie@example.com',
    netAmount: -1000, // -10.00 (Charlie owes)
    credits: 9000,    // 90.00 paid
    debits: 10000,    // 100.00 owed
    settlementsIn: 0,
    settlementsOut: 0
  }
];
