const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAccounts() {
  try {
    console.log('Checking for accounts in database...');
    
    const accounts = await prisma.connectedAccount.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true
          }
        }
      }
    });
    
    console.log(`Found ${accounts.length} accounts:`);
    accounts.forEach(account => {
      console.log(`- ID: ${account.id}`);
      console.log(`  Account Name: ${account.accountName}`);
      console.log(`  Bank Name: ${account.bankName}`);
      console.log(`  Balance: ${account.balance}`);
      console.log(`  Status: ${account.status}`);
      console.log(`  User: ${account.user?.email}`);
      console.log('---');
    });
    
    if (accounts.length === 0) {
      console.log('No accounts found in database.');
      console.log('This means either:');
      console.log('1. No bank accounts have been connected yet');
      console.log('2. The consent flow didn\'t create accounts properly');
      console.log('3. The database is empty');
    }
    
  } catch (error) {
    console.error('Error checking accounts:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAccounts();
