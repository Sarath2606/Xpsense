"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SplitwiseSplitService = void 0;
class SplitwiseSplitService {
    static computeShares(input) {
        const { splitType, amount, participants, shares, percents } = input;
        const amountCents = Math.round(amount * 100);
        let shareAmounts;
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
        const totalShares = shareAmounts.reduce((sum, share) => sum + share, 0);
        if (Math.abs(totalShares - amountCents) > 1) {
            throw new Error(`Share amounts (${totalShares} cents) don't sum to total amount (${amountCents} cents)`);
        }
        return participants.map((participantId, index) => ({
            participantId,
            shareAmount: shareAmounts[index],
            sharePercentage: amount > 0 ? (shareAmounts[index] / amountCents) * 100 : 0
        }));
    }
    static computeEqualSplit(amountCents, participantCount) {
        if (participantCount <= 0) {
            throw new Error("Participant count must be greater than 0");
        }
        const baseShare = Math.floor(amountCents / participantCount);
        const remainder = amountCents - (baseShare * participantCount);
        return Array.from({ length: participantCount }, (_, index) => baseShare + (index < remainder ? 1 : 0));
    }
    static computeUnequalSplit(amountCents, shares) {
        const shareCents = shares.map(share => Math.round(share * 100));
        const totalShares = shareCents.reduce((sum, share) => sum + share, 0);
        if (Math.abs(totalShares - amountCents) > 1) {
            throw new Error(`Specified shares (${totalShares} cents) don't sum to total amount (${amountCents} cents)`);
        }
        return shareCents;
    }
    static computePercentSplit(amountCents, percents) {
        const totalPercent = percents.reduce((sum, percent) => sum + percent, 0);
        if (Math.abs(totalPercent - 100) > 0.01) {
            throw new Error(`Percents must sum to 100, got ${totalPercent}`);
        }
        const prelimShares = percents.map(percent => Math.floor(amountCents * (percent / 100)));
        const totalPrelim = prelimShares.reduce((sum, share) => sum + share, 0);
        const remainder = amountCents - totalPrelim;
        const fractionalParts = percents.map((percent, index) => ({
            index,
            fractional: (amountCents * (percent / 100)) - prelimShares[index]
        }));
        fractionalParts.sort((a, b) => b.fractional - a.fractional);
        const result = [...prelimShares];
        for (let i = 0; i < remainder; i++) {
            result[fractionalParts[i].index]++;
        }
        return result;
    }
    static computeWeightedSplit(amountCents, weights) {
        if (weights.some(weight => weight <= 0)) {
            throw new Error("All weights must be positive");
        }
        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        if (totalWeight <= 0) {
            throw new Error("Total weight must be positive");
        }
        const prelimShares = weights.map(weight => Math.floor(amountCents * (weight / totalWeight)));
        const totalPrelim = prelimShares.reduce((sum, share) => sum + share, 0);
        const remainder = amountCents - totalPrelim;
        const fractionalParts = weights.map((weight, index) => ({
            index,
            fractional: (amountCents * (weight / totalWeight)) - prelimShares[index]
        }));
        fractionalParts.sort((a, b) => b.fractional - a.fractional);
        const result = [...prelimShares];
        for (let i = 0; i < remainder; i++) {
            result[fractionalParts[i].index]++;
        }
        return result;
    }
    static validateSplitInput(input) {
        const errors = [];
        if (!input.amount || input.amount <= 0) {
            errors.push("Amount must be greater than 0");
        }
        if (!input.participants || input.participants.length === 0) {
            errors.push("At least one participant is required");
        }
        if (!input.splitType) {
            errors.push("Split type is required");
        }
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
    static getSplitTypeOptions() {
        return [
            { value: "EQUAL", label: "Split equally", description: "Divide the expense equally among all participants" },
            { value: "UNEQUAL", label: "Split unequally", description: "Specify exact amounts for each person" },
            { value: "PERCENT", label: "Split by percentage", description: "Divide based on percentages (must sum to 100%)" },
            { value: "SHARES", label: "Split by shares", description: "Divide based on weights/shares" }
        ];
    }
}
exports.SplitwiseSplitService = SplitwiseSplitService;
//# sourceMappingURL=splitwise-split.service.js.map