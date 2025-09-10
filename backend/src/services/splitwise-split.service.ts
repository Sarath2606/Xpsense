/**
 * Splitwise Split Calculation Service
 * Handles all expense splitting logic for different split types
 */

export type SplitType = "EQUAL" | "UNEQUAL" | "PERCENT" | "SHARES";

export interface SplitCalculationInput {
  splitType: SplitType;
  amount: number; // Total amount in dollars
  participants: string[]; // Array of user IDs
  shares?: number[]; // For UNEQUAL/SHARES split types
  percents?: number[]; // For PERCENT split type
}

export interface SplitResult {
  participantId: string;
  shareAmount: number; // Amount in cents
  sharePercentage: number; // Percentage of total
}

export class SplitwiseSplitService {
  /**
   * Main method to compute expense shares based on split type
   */
  static computeShares(input: SplitCalculationInput): SplitResult[] {
    const { splitType, amount, participants, shares, percents } = input;
    
    // Convert amount to cents to avoid floating point issues
    const amountCents = Math.round(amount * 100);
    
    let shareAmounts: number[];
    
    switch (splitType) {
      case "EQUAL":
        shareAmounts = this.computeEqualSplit(amountCents, participants.length);
        break;
      case "UNEQUAL":
        if (!shares || shares.length !== participants.length) {
          throw new Error("Shares array is required and must match participant count for UNEQUAL split");
        }
        shareAmounts = this.computeUnequalSplit(amountCents, shares);
        break;
      case "PERCENT":
        if (!percents || percents.length !== participants.length) {
          throw new Error("Percents array is required and must match participant count for PERCENT split");
        }
        shareAmounts = this.computePercentSplit(amountCents, percents);
        break;
      case "SHARES":
        if (!shares || shares.length !== participants.length) {
          throw new Error("Shares array is required and must match participant count for SHARES split");
        }
        shareAmounts = this.computeWeightedSplit(amountCents, shares);
        break;
      default:
        throw new Error(`Unknown split type: ${splitType}`);
    }
    
    // Validate that shares sum to total amount
    const totalShares = shareAmounts.reduce((sum, share) => sum + share, 0);
    if (Math.abs(totalShares - amountCents) > 1) { // Allow 1 cent tolerance
      throw new Error(`Share amounts (${totalShares} cents) don't sum to total amount (${amountCents} cents)`);
    }
    
    // Convert to result format
    return participants.map((participantId, index) => ({
      participantId,
      shareAmount: shareAmounts[index],
      sharePercentage: amount > 0 ? (shareAmounts[index] / amountCents) * 100 : 0
    }));
  }
  
  /**
   * Equal split: divide amount equally among all participants
   * Handles remainder by distributing 1 cent to first N participants
   */
  private static computeEqualSplit(amountCents: number, participantCount: number): number[] {
    if (participantCount <= 0) {
      throw new Error("Participant count must be greater than 0");
    }
    
    const baseShare = Math.floor(amountCents / participantCount);
    const remainder = amountCents - (baseShare * participantCount);
    
    return Array.from({ length: participantCount }, (_, index) => 
      baseShare + (index < remainder ? 1 : 0)
    );
  }
  
  /**
   * Unequal split: exact amounts specified for each participant
   * Shares must sum to total amount
   */
  private static computeUnequalSplit(amountCents: number, shares: number[]): number[] {
    // Convert shares to cents
    const shareCents = shares.map(share => Math.round(share * 100));
    const totalShares = shareCents.reduce((sum, share) => sum + share, 0);
    
    if (Math.abs(totalShares - amountCents) > 1) {
      throw new Error(`Specified shares (${totalShares} cents) don't sum to total amount (${amountCents} cents)`);
    }
    
    return shareCents;
  }
  
  /**
   * Percent split: divide based on percentages
   * Handles rounding by distributing remainder to largest fractional parts
   */
  private static computePercentSplit(amountCents: number, percents: number[]): number[] {
    // Validate percentages sum to 100
    const totalPercent = percents.reduce((sum, percent) => sum + percent, 0);
    if (Math.abs(totalPercent - 100) > 0.01) {
      throw new Error(`Percents must sum to 100, got ${totalPercent}`);
    }
    
    // Calculate preliminary shares
    const prelimShares = percents.map(percent => 
      Math.floor(amountCents * (percent / 100))
    );
    
    // Calculate remainder
    const totalPrelim = prelimShares.reduce((sum, share) => sum + share, 0);
    const remainder = amountCents - totalPrelim;
    
    // Distribute remainder to largest fractional parts
    const fractionalParts = percents.map((percent, index) => ({
      index,
      fractional: (amountCents * (percent / 100)) - prelimShares[index]
    }));
    
    // Sort by fractional part (descending)
    fractionalParts.sort((a, b) => b.fractional - a.fractional);
    
    // Distribute remainder
    const result = [...prelimShares];
    for (let i = 0; i < remainder; i++) {
      result[fractionalParts[i].index]++;
    }
    
    return result;
  }
  
  /**
   * Weighted split: divide based on weights/shares
   * Similar to percent but weights don't need to sum to 100
   */
  private static computeWeightedSplit(amountCents: number, weights: number[]): number[] {
    // Validate weights are positive
    if (weights.some(weight => weight <= 0)) {
      throw new Error("All weights must be positive");
    }
    
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    if (totalWeight <= 0) {
      throw new Error("Total weight must be positive");
    }
    
    // Calculate preliminary shares
    const prelimShares = weights.map(weight => 
      Math.floor(amountCents * (weight / totalWeight))
    );
    
    // Calculate remainder
    const totalPrelim = prelimShares.reduce((sum, share) => sum + share, 0);
    const remainder = amountCents - totalPrelim;
    
    // Distribute remainder to largest fractional parts
    const fractionalParts = weights.map((weight, index) => ({
      index,
      fractional: (amountCents * (weight / totalWeight)) - prelimShares[index]
    }));
    
    // Sort by fractional part (descending)
    fractionalParts.sort((a, b) => b.fractional - a.fractional);
    
    // Distribute remainder
    const result = [...prelimShares];
    for (let i = 0; i < remainder; i++) {
      result[fractionalParts[i].index]++;
    }
    
    return result;
  }
  
  /**
   * Validate split input before processing
   */
  static validateSplitInput(input: SplitCalculationInput): string[] {
    const errors: string[] = [];
    
    if (!input.amount || input.amount <= 0) {
      errors.push("Amount must be greater than 0");
    }
    
    if (!input.participants || input.participants.length === 0) {
      errors.push("At least one participant is required");
    }
    
    if (!input.splitType) {
      errors.push("Split type is required");
    }
    
    // Validate based on split type
    switch (input.splitType) {
      case "UNEQUAL":
      case "SHARES":
        if (!input.shares || input.shares.length !== input.participants.length) {
          errors.push(`Shares array is required and must have ${input.participants.length} elements for ${input.splitType} split`);
        }
        break;
      case "PERCENT":
        if (!input.percents || input.percents.length !== input.participants.length) {
          errors.push(`Percents array is required and must have ${input.participants.length} elements for PERCENT split`);
        }
        break;
    }
    
    return errors;
  }
  
  /**
   * Get split type options for UI
   */
  static getSplitTypeOptions() {
    return [
      { value: "EQUAL", label: "Split equally", description: "Divide the expense equally among all participants" },
      { value: "UNEQUAL", label: "Split unequally", description: "Specify exact amounts for each person" },
      { value: "PERCENT", label: "Split by percentage", description: "Divide based on percentages (must sum to 100%)" },
      { value: "SHARES", label: "Split by shares", description: "Divide based on weights/shares" }
    ];
  }
}
