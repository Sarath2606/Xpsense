const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupTestData() {
  try {
    console.log('🧹 Starting cleanup of test data...\n');

    // 1. Clean up test accounts
    console.log('1. Cleaning up test accounts...');
    const testAccounts = await prisma.connectedAccount.findMany({
      where: {
        OR: [
          { accountName: { contains: 'test', mode: 'insensitive' } },
          { bankName: { contains: 'test', mode: 'insensitive' } },
          { accountName: { contains: 'demo', mode: 'insensitive' } },
          { bankName: { contains: 'demo', mode: 'insensitive' } },
          { accountName: { contains: 'sandbox', mode: 'insensitive' } },
          { bankName: { contains: 'sandbox', mode: 'insensitive' } },
          { accountName: { contains: 'sample', mode: 'insensitive' } },
          { bankName: { contains: 'sample', mode: 'insensitive' } },
          { accountName: { contains: 'mock', mode: 'insensitive' } },
          { bankName: { contains: 'mock', mode: 'insensitive' } },
          { accountName: { contains: 'development', mode: 'insensitive' } },
          { bankName: { contains: 'development', mode: 'insensitive' } },
          { accountName: 'Main Checking Account' },
          { accountName: 'Savings Account' },
          { bankName: 'Development Bank' }
        ]
      }
    });

    console.log(`Found ${testAccounts.length} test accounts to delete:`);
    testAccounts.forEach(account => {
      console.log(`  - ${account.accountName} (${account.bankName})`);
    });

    if (testAccounts.length > 0) {
      // Delete related balances first
      const accountIds = testAccounts.map(acc => acc.id);
      await prisma.balance.deleteMany({
        where: {
          accountId: { in: accountIds }
        }
      });
      console.log(`Deleted ${testAccounts.length} balance records`);

      // Delete related transactions
      await prisma.transaction.deleteMany({
        where: {
          connectedAccountId: { in: accountIds }
        }
      });
      console.log(`Deleted transactions for test accounts`);

      // Delete the test accounts
      await prisma.connectedAccount.deleteMany({
        where: {
          id: { in: accountIds }
        }
      });
      console.log(`Deleted ${testAccounts.length} test accounts`);
    }

    // 2. Clean up test users (if they exist)
    console.log('\n2. Cleaning up test users...');
    const testUsers = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: 'test', mode: 'insensitive' } },
          { email: { contains: 'demo', mode: 'insensitive' } },
          { email: { contains: 'sandbox', mode: 'insensitive' } },
          { email: { contains: 'sample', mode: 'insensitive' } },
          { email: { contains: 'mock', mode: 'insensitive' } },
          { email: { contains: '@example.com' } },
          { email: { contains: '@test.com' } }
        ]
      }
    });

    console.log(`Found ${testUsers.length} test users to delete:`);
    testUsers.forEach(user => {
      console.log(`  - ${user.email}`);
    });

    if (testUsers.length > 0) {
      const userIds = testUsers.map(user => user.id);
      
      // Delete related data first
      await prisma.balance.deleteMany({
        where: {
          account: {
            userId: { in: userIds }
          }
        }
      });

      await prisma.transaction.deleteMany({
        where: {
          account: {
            userId: { in: userIds }
          }
        }
      });

      await prisma.connectedAccount.deleteMany({
        where: {
          userId: { in: userIds }
        }
      });

      await prisma.consent.deleteMany({
        where: {
          userId: { in: userIds }
        }
      });

      await prisma.token.deleteMany({
        where: {
          userId: { in: userIds }
        }
      });

      // Delete the test users
      await prisma.user.deleteMany({
        where: {
          id: { in: userIds }
        }
      });
      console.log(`Deleted ${testUsers.length} test users`);
    }

    // 3. Clean up test consents (by checking related test users)
    console.log('\n3. Cleaning up test consents...');
    const testConsents = await prisma.consent.findMany({
      where: {
        user: {
          OR: [
            { email: { contains: 'test', mode: 'insensitive' } },
            { email: { contains: 'demo', mode: 'insensitive' } },
            { email: { contains: 'sandbox', mode: 'insensitive' } },
            { email: { contains: 'sample', mode: 'insensitive' } },
            { email: { contains: 'mock', mode: 'insensitive' } },
            { email: { contains: '@example.com' } },
            { email: { contains: '@test.com' } }
          ]
        }
      }
    });

    console.log(`Found ${testConsents.length} test consents to delete`);
    if (testConsents.length > 0) {
      await prisma.consent.deleteMany({
        where: {
          id: { in: testConsents.map(c => c.id) }
        }
      });
      console.log(`Deleted ${testConsents.length} test consents`);
    }

    // 4. Clean up test tokens
    console.log('\n4. Cleaning up test tokens...');
    const testTokens = await prisma.token.findMany({
      where: {
        OR: [
          { accessToken: { contains: 'test', mode: 'insensitive' } },
          { refreshToken: { contains: 'test', mode: 'insensitive' } }
        ]
      }
    });

    console.log(`Found ${testTokens.length} test tokens to delete`);
    if (testTokens.length > 0) {
      await prisma.token.deleteMany({
        where: {
          id: { in: testTokens.map(t => t.id) }
        }
      });
      console.log(`Deleted ${testTokens.length} test tokens`);
    }

    // 5. Show final status
    console.log('\n5. Final database status:');
    const finalAccounts = await prisma.connectedAccount.count();
    const finalUsers = await prisma.user.count();
    const finalConsents = await prisma.consent.count();
    const finalTokens = await prisma.token.count();
    const finalTransactions = await prisma.transaction.count();
    const finalBalances = await prisma.balance.count();

    console.log(`  - Connected Accounts: ${finalAccounts}`);
    console.log(`  - Users: ${finalUsers}`);
    console.log(`  - Consents: ${finalConsents}`);
    console.log(`  - Tokens: ${finalTokens}`);
    console.log(`  - Transactions: ${finalTransactions}`);
    console.log(`  - Balances: ${finalBalances}`);

    console.log('\n✅ Test data cleanup completed successfully!');
    console.log('🎉 Database is now clean and ready for real users.');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
cleanupTestData();
