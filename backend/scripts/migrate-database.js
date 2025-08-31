const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateDatabase() {
  console.log('🚀 Starting database migration...');

  try {
    // Create Mastercard institution if it doesn't exist
    const mastercardInstitution = await prisma.institution.upsert({
      where: { code: 'AUS-CDR-Mastercard' },
      update: {},
      create: {
        name: 'Mastercard Open Banking',
        code: 'AUS-CDR-Mastercard',
        logoUrl: 'https://example.com/mastercard-logo.png',
        isActive: true
      }
    });

    console.log('✅ Mastercard institution created/updated:', mastercardInstitution.name);

    // Create sample institutions for testing
    const sampleInstitutions = [
      {
        name: 'Commonwealth Bank',
        code: 'AUS-CDR-CBA',
        logoUrl: 'https://example.com/cba-logo.png'
      },
      {
        name: 'Westpac',
        code: 'AUS-CDR-Westpac',
        logoUrl: 'https://example.com/westpac-logo.png'
      },
      {
        name: 'ANZ',
        code: 'AUS-CDR-ANZ',
        logoUrl: 'https://example.com/anz-logo.png'
      },
      {
        name: 'NAB',
        code: 'AUS-CDR-NAB',
        logoUrl: 'https://example.com/nab-logo.png'
      }
    ];

    for (const institution of sampleInstitutions) {
      await prisma.institution.upsert({
        where: { code: institution.code },
        update: {},
        create: institution
      });
    }

    console.log('✅ Sample institutions created/updated');

    // Create sample user for testing (if needed)
    const sampleUser = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {},
      create: {
        email: 'test@example.com',
        name: 'Test User',
        firebaseUid: 'test-firebase-uid'
      }
    });

    console.log('✅ Sample user created/updated:', sampleUser.email);

    // Create sample consent for testing
    const sampleConsent = await prisma.consent.upsert({
      where: { consentRef: 'test-consent-ref' },
      update: {},
      create: {
        userId: sampleUser.id,
        institutionId: mastercardInstitution.id,
        status: 'ACTIVE',
        scopes: 'bank:accounts.basic:read bank:transactions:read bank:balances:read offline_access',
        consentRef: 'test-consent-ref',
        expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000) // 180 days from now
      }
    });

    console.log('✅ Sample consent created/updated');

    // Create sample token
    const sampleToken = await prisma.token.upsert({
      where: { consentId: sampleConsent.id },
      update: {},
      create: {
        consentId: sampleConsent.id,
        accessToken: 'encrypted-test-access-token',
        refreshToken: 'encrypted-test-refresh-token',
        tokenType: 'Bearer',
        scope: 'bank:accounts.basic:read bank:transactions:read bank:balances:read offline_access',
        expiresAt: new Date(Date.now() + 3600 * 1000) // 1 hour from now
      }
    });

    console.log('✅ Sample token created/updated');

    // Create sample connected account
    const sampleAccount = await prisma.connectedAccount.upsert({
      where: {
        userId_accountId: {
          userId: sampleUser.id,
          accountId: 'test-account-id'
        }
      },
      update: {},
      create: {
        userId: sampleUser.id,
        consentId: sampleConsent.id,
        accountId: 'test-account-id',
        accountName: 'Everyday Account',
        accountType: 'CHECKING',
        productCategory: 'TRANS_AND_SAVINGS_ACCOUNTS',
        bankName: 'Mastercard Open Banking',
        maskedNumber: '****1234',
        balance: 1500.00,
        availableBalance: 1450.00,
        currency: 'AUD',
        status: 'ACTIVE',
        lastSyncAt: new Date()
      }
    });

    console.log('✅ Sample connected account created/updated');

    // Create sample balance
    const sampleBalance = await prisma.balance.create({
      data: {
        accountId: sampleAccount.id,
        asAt: new Date(),
        current: 1500.00,
        available: 1450.00,
        currency: 'AUD'
      }
    });

    console.log('✅ Sample balance created');

    // Create sample transactions
    const sampleTransactions = [
      {
        userId: sampleUser.id,
        connectedAccountId: sampleAccount.id,
        transactionId: 'test-txn-1',
        description: 'Woolworths',
        amount: -45.67,
        currency: 'AUD',
        category: 'Groceries',
        transactionType: 'DEBIT',
        date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        isImported: true
      },
      {
        userId: sampleUser.id,
        connectedAccountId: sampleAccount.id,
        transactionId: 'test-txn-2',
        description: 'Salary Payment',
        amount: 2500.00,
        currency: 'AUD',
        category: 'Income',
        transactionType: 'CREDIT',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        isImported: true
      },
      {
        userId: sampleUser.id,
        connectedAccountId: sampleAccount.id,
        transactionId: 'test-txn-3',
        description: 'Netflix Subscription',
        amount: -15.99,
        currency: 'AUD',
        category: 'Entertainment',
        transactionType: 'DEBIT',
        date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
        isImported: true
      }
    ];

    for (const transaction of sampleTransactions) {
      await prisma.transaction.upsert({
        where: { transactionId: transaction.transactionId },
        update: {},
        create: transaction
      });
    }

    console.log('✅ Sample transactions created');

    // Create sample audit logs
    const sampleAuditLogs = [
      {
        userId: sampleUser.id,
        action: 'CONSENT_START',
        details: { consentId: sampleConsent.id, scopes: 'bank:accounts.basic:read bank:transactions:read bank:balances:read offline_access' },
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      {
        userId: sampleUser.id,
        action: 'CONSENT_GRANTED',
        details: { consentId: sampleConsent.id },
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      {
        userId: sampleUser.id,
        action: 'INITIAL_SYNC_START',
        details: { consentId: sampleConsent.id },
        ipAddress: 'system',
        userAgent: 'sync-service'
      },
      {
        userId: sampleUser.id,
        action: 'INITIAL_SYNC_COMPLETE',
        details: { consentId: sampleConsent.id, accountsSynced: 1, transactionsSynced: 3, balancesSynced: 1 },
        ipAddress: 'system',
        userAgent: 'sync-service'
      }
    ];

    for (const auditLog of sampleAuditLogs) {
      await prisma.auditLog.create({
        data: auditLog
      });
    }

    console.log('✅ Sample audit logs created');

    console.log('🎉 Database migration completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- 1 Mastercard institution`);
    console.log(`- ${sampleInstitutions.length} sample institutions`);
    console.log(`- 1 sample user (${sampleUser.email})`);
    console.log(`- 1 sample consent`);
    console.log(`- 1 sample token`);
    console.log(`- 1 sample connected account`);
    console.log(`- 1 sample balance`);
    console.log(`- ${sampleTransactions.length} sample transactions`);
    console.log(`- ${sampleAuditLogs.length} sample audit logs`);

  } catch (error) {
    console.error('❌ Database migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateDatabase()
    .then(() => {
      console.log('✅ Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateDatabase };
