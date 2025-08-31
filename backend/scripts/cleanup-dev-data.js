const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupDevData() {
	try {
		console.log('🧹 Cleaning up development mock data...');

		// Delete dev transactions not linked to real accounts
		const deletedTx = await prisma.transaction.deleteMany({
			where: {
				OR: [
					{ connectedAccountId: null },
					{ description: { contains: 'Mock', mode: 'insensitive' } }
				]
			}
		});
		console.log(`🗑️ Deleted ${deletedTx.count} transactions`);

		// Delete dev accounts
		const deletedAccounts = await prisma.connectedAccount.deleteMany({
			where: {
				OR: [
					{ accountId: { startsWith: 'dev-account-' } },
					{ bankName: { contains: 'Development Bank', mode: 'insensitive' } }
				]
			}
		});
		console.log(`🗑️ Deleted ${deletedAccounts.count} connected accounts`);

		// Delete dev consents
		const deletedConsents = await prisma.consent.deleteMany({
			where: {
				OR: [
					{ consentRef: { startsWith: 'dev-consent-' } },
					{ status: 'PENDING', scopes: { contains: 'accounts:basic transactions balances offline_access' } }
				]
			}
		});
		console.log(`🗑️ Deleted ${deletedConsents.count} consents`);

		// Optionally delete DEV-BANK institution
		const deletedInstitutions = await prisma.institution.deleteMany({
			where: { code: 'DEV-BANK' }
		});
		if (deletedInstitutions.count > 0) {
			console.log(`🗑️ Deleted ${deletedInstitutions.count} development institutions`);
		}

		console.log('✅ Cleanup complete');
	} catch (error) {
		console.error('❌ Cleanup failed:', error);
	} finally {
		await prisma.$disconnect();
	}
}

cleanupDevData();


