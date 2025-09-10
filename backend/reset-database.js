const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function resetDatabase() {
  try {
    console.log('🗑️  Starting complete database reset...\n');
    
    console.log('⚠️  WARNING: This will delete ALL data from the database!');
    console.log('⚠️  This action cannot be undone!\n');
    
    // Delete all data in the correct order (respecting foreign key constraints)
    console.log('1. Deleting all balances...');
    await prisma.balance.deleteMany({});
    console.log('   ✅ Balances deleted');
    
    console.log('2. Deleting all transactions...');
    await prisma.transaction.deleteMany({});
    console.log('   ✅ Transactions deleted');
    
    console.log('3. Deleting all connected accounts...');
    await prisma.connectedAccount.deleteMany({});
    console.log('   ✅ Connected accounts deleted');
    
    console.log('4. Deleting all tokens...');
    await prisma.token.deleteMany({});
    console.log('   ✅ Tokens deleted');
    
    console.log('5. Deleting all consents...');
    await prisma.consent.deleteMany({});
    console.log('   ✅ Consents deleted');
    
    console.log('6. Deleting all users...');
    await prisma.user.deleteMany({});
    console.log('   ✅ Users deleted');
    
    console.log('7. Deleting all institutions...');
    await prisma.institution.deleteMany({});
    console.log('   ✅ Institutions deleted');
    
    // Show final status
    console.log('\n📊 Final database status:');
    const finalAccounts = await prisma.connectedAccount.count();
    const finalUsers = await prisma.user.count();
    const finalConsents = await prisma.consent.count();
    const finalTokens = await prisma.token.count();
    const finalTransactions = await prisma.transaction.count();
    const finalBalances = await prisma.balance.count();
    const finalInstitutions = await prisma.institution.count();

    console.log(`  - Connected Accounts: ${finalAccounts}`);
    console.log(`  - Users: ${finalUsers}`);
    console.log(`  - Consents: ${finalConsents}`);
    console.log(`  - Tokens: ${finalTokens}`);
    console.log(`  - Transactions: ${finalTransactions}`);
    console.log(`  - Balances: ${finalBalances}`);
    console.log(`  - Institutions: ${finalInstitutions}`);

    console.log('\n✅ Database reset completed successfully!');
    console.log('🎉 Database is now completely clean and empty.');
    console.log('🚀 Ready for fresh start with real users only.');

  } catch (error) {
    console.error('❌ Error during database reset:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the reset
resetDatabase();
