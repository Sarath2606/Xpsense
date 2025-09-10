export type SplitType = "EQUAL" | "UNEQUAL" | "PERCENT" | "SHARES";
export interface SplitCalculationInput {
    splitType: SplitType;
    amount: number;
    participants: string[];
    shares?: number[];
    percents?: number[];
}
export interface SplitResult {
    participantId: string;
    shareAmount: number;
    sharePercentage: number;
}
export declare class SplitwiseSplitService {
    static computeShares(input: SplitCalculationInput): SplitResult[];
    private static computeEqualSplit;
    private static computeUnequalSplit;
    private static computePercentSplit;
    private static computeWeightedSplit;
    static validateSplitInput(input: SplitCalculationInput): string[];
    static getSplitTypeOptions(): {
        value: string;
        label: string;
        description: string;
    }[];
}
//# sourceMappingURL=splitwise-split.service.d.ts.map