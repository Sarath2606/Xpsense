const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugInvitationFlow() {
  try {
    console.log('🔍 Debugging invitation flow...\n');

    // 1. Check recent invitations
    console.log('1. Checking recent invitations:');
    const recentInvites = await prisma.splitwiseInvite.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        group: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    console.log(`Found ${recentInvites.length} recent invitations:`);
    recentInvites.forEach((invite, index) => {
      console.log(`  ${index + 1}. Email: ${invite.email}`);
      console.log(`     Group: ${invite.group.name} (${invite.group.id})`);
      console.log(`     Token: ${invite.token.substring(0, 8)}...`);
      console.log(`     Accepted: ${invite.accepted}`);
      console.log(`     Expires: ${invite.expiresAt}`);
      console.log(`     Created: ${invite.createdAt}`);
      console.log(`     Is Expired: ${new Date() > invite.expiresAt}`);
      console.log('');
    });

    // 2. Check if there are any pending invitations for the test email
    const testEmail = 'smilysarath26@gmail.com';
    console.log(`2. Checking pending invitations for ${testEmail}:`);
    const pendingInvites = await prisma.splitwiseInvite.findMany({
      where: {
        email: testEmail,
        accepted: false,
        expiresAt: { gt: new Date() }
      },
      include: {
        group: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    console.log(`Found ${pendingInvites.length} pending invitations for ${testEmail}:`);
    pendingInvites.forEach((invite, index) => {
      console.log(`  ${index + 1}. Group: ${invite.group.name}`);
      console.log(`     Token: ${invite.token}`);
      console.log(`     Full URL: https://xpenses-app.pages.dev/splitwise/invite/accept?token=${invite.token}`);
      console.log(`     Expires: ${invite.expiresAt}`);
      console.log('');
    });

    // 3. Check if the user exists
    console.log(`3. Checking if user ${testEmail} exists:`);
    const user = await prisma.user.findUnique({
      where: { email: testEmail },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    });

    if (user) {
      console.log(`  ✅ User exists: ${user.name} (${user.id})`);
      console.log(`     Created: ${user.createdAt}`);
      
      // Check group memberships
      const memberships = await prisma.splitwiseGroupMember.findMany({
        where: { userId: user.id },
        include: {
          group: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });
      
      console.log(`     Group memberships: ${memberships.length}`);
      memberships.forEach((membership, index) => {
        console.log(`       ${index + 1}. ${membership.group.name} (${membership.role})`);
      });
    } else {
      console.log(`  ❌ User does not exist`);
    }

    // 4. Check environment variables
    console.log('\n4. Environment variables:');
    console.log(`  FRONTEND_URL: ${process.env.FRONTEND_URL || 'NOT SET'}`);
    console.log(`  USE_SENDGRID: ${process.env.USE_SENDGRID || 'NOT SET'}`);
    console.log(`  SENDGRID_API_KEY: ${process.env.SENDGRID_API_KEY ? 'SET' : 'NOT SET'}`);

  } catch (error) {
    console.error('❌ Error debugging invitation flow:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugInvitationFlow();
