"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockUserBalances = void 0;
const splitwise_split_service_1 = require("./splitwise-split.service");
describe('SplitwiseSplitService', () => {
    describe('computeShares', () => {
        it('should compute equal split correctly', () => {
            const result = splitwise_split_service_1.SplitwiseSplitService.computeShares({
                splitType: 'EQUAL',
                amount: 100,
                participants: ['user1', 'user2', 'user3']
            });
            expect(result).toHaveLength(3);
            expect(result[0].shareAmount).toBe(3333);
            expect(result[1].shareAmount).toBe(3333);
            expect(result[2].shareAmount).toBe(3334);
            const total = result.reduce((sum, r) => sum + r.shareAmount, 0);
            expect(total).toBe(10000);
        });
        it('should compute unequal split correctly', () => {
            const result = splitwise_split_service_1.SplitwiseSplitService.computeShares({
                splitType: 'UNEQUAL',
                amount: 100,
                participants: ['user1', 'user2'],
                shares: [60, 40]
            });
            expect(result).toHaveLength(2);
            expect(result[0].shareAmount).toBe(6000);
            expect(result[1].shareAmount).toBe(4000);
            const total = result.reduce((sum, r) => sum + r.shareAmount, 0);
            expect(total).toBe(10000);
        });
        it('should compute percent split correctly', () => {
            const result = splitwise_split_service_1.SplitwiseSplitService.computeShares({
                splitType: 'PERCENT',
                amount: 100,
                participants: ['user1', 'user2', 'user3'],
                percents: [50, 30, 20]
            });
            expect(result).toHaveLength(3);
            expect(result[0].shareAmount).toBe(5000);
            expect(result[1].shareAmount).toBe(3000);
            expect(result[2].shareAmount).toBe(2000);
            const total = result.reduce((sum, r) => sum + r.shareAmount, 0);
            expect(total).toBe(10000);
        });
        it('should handle edge case with 1 participant', () => {
            const result = splitwise_split_service_1.SplitwiseSplitService.computeShares({
                splitType: 'EQUAL',
                amount: 50,
                participants: ['user1']
            });
            expect(result).toHaveLength(1);
            expect(result[0].shareAmount).toBe(5000);
        });
        it('should throw error for invalid split type', () => {
            expect(() => {
                splitwise_split_service_1.SplitwiseSplitService.computeShares({
                    splitType: 'INVALID',
                    amount: 100,
                    participants: ['user1', 'user2']
                });
            }).toThrow('Unknown split type: INVALID');
        });
        it('should throw error when shares don\'t match participants', () => {
            expect(() => {
                splitwise_split_service_1.SplitwiseSplitService.computeShares({
                    splitType: 'UNEQUAL',
                    amount: 100,
                    participants: ['user1', 'user2'],
                    shares: [60]
                });
            }).toThrow('Shares array is required and must match participant count for UNEQUAL split');
        });
    });
    describe('validateSplitInput', () => {
        it('should return no errors for valid input', () => {
            const errors = splitwise_split_service_1.SplitwiseSplitService.validateSplitInput({
                splitType: 'EQUAL',
                amount: 100,
                participants: ['user1', 'user2']
            });
            expect(errors).toHaveLength(0);
        });
        it('should return error for zero amount', () => {
            const errors = splitwise_split_service_1.SplitwiseSplitService.validateSplitInput({
                splitType: 'EQUAL',
                amount: 0,
                participants: ['user1', 'user2']
            });
            expect(errors).toContain('Amount must be greater than 0');
        });
        it('should return error for empty participants', () => {
            const errors = splitwise_split_service_1.SplitwiseSplitService.validateSplitInput({
                splitType: 'EQUAL',
                amount: 100,
                participants: []
            });
            expect(errors).toContain('At least one participant is required');
        });
        it('should return error for missing shares in UNEQUAL split', () => {
            const errors = splitwise_split_service_1.SplitwiseSplitService.validateSplitInput({
                splitType: 'UNEQUAL',
                amount: 100,
                participants: ['user1', 'user2']
            });
            expect(errors).toContain('Shares array is required and must have 2 elements for UNEQUAL split');
        });
    });
    describe('getSplitTypeOptions', () => {
        it('should return all split type options', () => {
            const options = splitwise_split_service_1.SplitwiseSplitService.getSplitTypeOptions();
            expect(options).toHaveLength(4);
            expect(options.map(o => o.value)).toEqual(['EQUAL', 'UNEQUAL', 'PERCENT', 'SHARES']);
            expect(options[0].label).toBe('Split equally');
        });
    });
});
exports.mockUserBalances = [
    {
        userId: 'user1',
        userName: 'Alice',
        userEmail: 'alice@example.com',
        netAmount: 4000,
        credits: 12000,
        debits: 8000,
        settlementsIn: 0,
        settlementsOut: 0
    },
    {
        userId: 'user2',
        userName: 'Bob',
        userEmail: 'bob@example.com',
        netAmount: -3000,
        credits: 6000,
        debits: 9000,
        settlementsIn: 0,
        settlementsOut: 0
    },
    {
        userId: 'user3',
        userName: 'Charlie',
        userEmail: 'charlie@example.com',
        netAmount: -1000,
        credits: 9000,
        debits: 10000,
        settlementsIn: 0,
        settlementsOut: 0
    }
];
//# sourceMappingURL=splitwise-services.test.js.map