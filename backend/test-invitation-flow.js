const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testInvitationFlow() {
  try {
    console.log('🧪 Testing invitation flow...\n');

    // Test with a fresh email that's not in the system
    const testEmail = 'testuser123@example.com';
    const testGroupId = 'cmfosr6ux0011i5d4wo83p4rh'; // Group "34"
    const inviterId = 'cmfkhemus0000i5o4pps4tmyu'; // sarath chandra

    console.log(`Testing with email: ${testEmail}`);
    console.log(`Group ID: ${testGroupId}`);
    console.log(`Inviter ID: ${inviterId}\n`);

    // 1. Check if user exists
    console.log('1. Checking if test user exists:');
    const existingUser = await prisma.user.findUnique({
      where: { email: testEmail }
    });

    if (existingUser) {
      console.log(`  ✅ User exists: ${existingUser.name} (${existingUser.id})`);
      
      // Check if they're already a member
      const existingMember = await prisma.splitwiseGroupMember.findUnique({
        where: { 
          groupId_userId: { 
            groupId: testGroupId, 
            userId: existingUser.id 
          } 
        }
      });

      if (existingMember) {
        console.log(`  ❌ User is already a member with role: ${existingMember.role}`);
        console.log('  This explains why invitation failed!\n');
        return;
      } else {
        console.log(`  ✅ User is not a member of this group`);
      }
    } else {
      console.log(`  ✅ User does not exist (fresh user)`);
    }

    // 2. Check group exists
    console.log('\n2. Checking if group exists:');
    const group = await prisma.splitwiseGroup.findUnique({
      where: { id: testGroupId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true
              }
            }
          }
        }
      }
    });

    if (group) {
      console.log(`  ✅ Group exists: ${group.name}`);
      console.log(`  Current members (${group.members.length}):`);
      group.members.forEach((member, index) => {
        console.log(`    ${index + 1}. ${member.user.name} (${member.user.email}) - ${member.role}`);
      });
    } else {
      console.log(`  ❌ Group not found`);
      return;
    }

    // 3. Check inviter permissions
    console.log('\n3. Checking inviter permissions:');
    const inviterMembership = await prisma.splitwiseGroupMember.findUnique({
      where: { 
        groupId_userId: { 
          groupId: testGroupId, 
          userId: inviterId 
        } 
      }
    });

    if (inviterMembership) {
      console.log(`  ✅ Inviter is a member with role: ${inviterMembership.role}`);
      if (inviterMembership.role !== 'admin') {
        console.log(`  ⚠️  Warning: Only admins should be able to send invitations`);
      }
    } else {
      console.log(`  ❌ Inviter is not a member of this group`);
    }

    // 4. Simulate invitation creation
    console.log('\n4. Simulating invitation creation:');
    const crypto = require('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    console.log(`  Token: ${token.substring(0, 8)}...`);
    console.log(`  Expires: ${expiresAt}`);
    console.log(`  Frontend URL: ${process.env.FRONTEND_URL || 'NOT SET'}`);
    console.log(`  Full invitation URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/splitwise/invite/accept?token=${token}`);

    // 5. Create test invitation (don't actually create, just simulate)
    console.log('\n5. Would create invitation with data:');
    const invitationData = {
      groupId: testGroupId,
      email: testEmail,
      token,
      expiresAt,
      invitedBy: inviterId,
      message: 'Test invitation message'
    };
    console.log(JSON.stringify(invitationData, null, 2));

    console.log('\n✅ Invitation flow test completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`- Test email: ${testEmail}`);
    console.log(`- Group: ${group.name}`);
    console.log(`- Inviter role: ${inviterMembership?.role || 'unknown'}`);
    console.log(`- Frontend URL: ${process.env.FRONTEND_URL || 'NOT SET'}`);
    console.log('\n🔧 To fix the original issue:');
    console.log('1. Make sure FRONTEND_URL is set to the correct production URL');
    console.log('2. Test with a fresh email that is not already a member');
    console.log('3. Check that the invitation email contains the correct URL');

  } catch (error) {
    console.error('❌ Error testing invitation flow:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testInvitationFlow();
