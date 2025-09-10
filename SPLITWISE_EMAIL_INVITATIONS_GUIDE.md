# Splitwise Email Invitations System - Complete Guide

## 🎯 **Overview**

The Splitwise email invitation system allows group admins to send real-time email invitations to users who don't have accounts yet. This creates a seamless onboarding experience for new users.

## 🔧 **How It Works**

### **1. Invitation Process**
1. **Admin sends invitation**: Group admin clicks "Send Invite" button
2. **Email sent**: System generates unique token and sends email
3. **User receives email**: Beautiful HTML email with invitation link
4. **User clicks link**: Redirects to app with invitation token
5. **User accepts**: Creates account (if needed) and joins group

### **2. Email Flow**
```
Admin → Send Invite → Email Service → User → Click Link → Accept → Join Group
```

## 📧 **Email Configuration**

### **Environment Variables Required**
Add these to your `.env` file:

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@xpenses.com

# Frontend URL (for invitation links)
FRONTEND_URL=http://localhost:3000
```

### **Gmail Setup (Recommended)**
1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. **Use the generated password** in `SMTP_PASS`

### **Other Email Providers**
- **SendGrid**: Use SMTP with SendGrid credentials
- **Mailgun**: Use Mailgun SMTP settings
- **AWS SES**: Use AWS SES SMTP configuration

## 🚀 **How to Use**

### **For Group Admins**

1. **Navigate to Group**: Go to your Splitwise group
2. **Click "Send Invite"**: Blue button next to "Add Member"
3. **Enter Email**: Type the recipient's email address
4. **Add Message** (Optional): Personal message for the invitation
5. **Send**: Click "Send Invitation"

### **For Recipients**

1. **Receive Email**: Check inbox for invitation email
2. **Click Link**: Click "Accept Invitation" button
3. **Create Account** (if needed): Sign up with email
4. **Join Group**: Automatically added to the group

## 📋 **API Endpoints**

### **Send Invitation**
```http
POST /api/splitwise/groups/:id/invites
Content-Type: application/json
Authorization: Bearer <firebase-token>

{
  "email": "user@example.com",
  "message": "Hey! Join our expense sharing group"
}
```

**Response:**
```json
{
  "message": "Invitation sent successfully",
  "invitation": {
    "id": "invite-id",
    "email": "user@example.com",
    "expiresAt": "2024-01-15T10:00:00Z"
  }
}
```

### **Accept Invitation**
```http
POST /api/splitwise/invites/accept
Content-Type: application/json
Authorization: Bearer <firebase-token>

{
  "token": "invitation-token"
}
```

### **Get Pending Invitations**
```http
GET /api/splitwise/invites/pending
Authorization: Bearer <firebase-token>
```

### **Cancel Invitation**
```http
DELETE /api/splitwise/invites/:inviteId
Authorization: Bearer <firebase-token>
```

## 🎨 **Email Template**

The invitation email includes:

- **Beautiful HTML Design**: Professional gradient header
- **Group Information**: Group name and description
- **Personal Message**: Custom message from inviter
- **Accept Button**: Direct link to accept invitation
- **Expiration Info**: 7-day expiration notice
- **Branding**: Xpenses branding and footer

### **Email Preview**
```
┌─────────────────────────────────────┐
│           You're Invited!           │
│      Join the expense sharing       │
│              group                  │
├─────────────────────────────────────┤
│                                     │
│  Group Name: "Roommates 2024"       │
│                                     │
│  John has invited you to join their │
│  expense sharing group on Xpenses.  │
│                                     │
│  "Hey! Let's track our shared       │
│   expenses together!"               │
│                                     │
│        [Accept Invitation]          │
│                                     │
│  This invitation expires in 7 days. │
│                                     │
└─────────────────────────────────────┘
```

## 🔒 **Security Features**

### **Token Security**
- **Cryptographically Secure**: 32-byte random tokens
- **Time-Limited**: 7-day expiration
- **Single-Use**: Tokens invalidated after acceptance
- **Email-Specific**: Tokens tied to specific email addresses

### **Access Control**
- **Admin Only**: Only group admins can send invitations
- **Authentication Required**: Must be logged in to accept
- **Duplicate Prevention**: Can't invite existing members
- **Rate Limiting**: Prevents spam invitations

## 🗄️ **Database Schema**

### **SplitwiseInvite Table**
```sql
CREATE TABLE splitwise_invites (
  id VARCHAR PRIMARY KEY,
  group_id VARCHAR NOT NULL,
  email VARCHAR NOT NULL,
  token VARCHAR UNIQUE NOT NULL,
  message TEXT,
  accepted BOOLEAN DEFAULT FALSE,
  accepted_at TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  invited_by VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (group_id) REFERENCES splitwise_groups(id) ON DELETE CASCADE,
  FOREIGN KEY (invited_by) REFERENCES users(id) ON DELETE CASCADE
);
```

## 🧪 **Testing**

### **Test Email Setup**
1. **Use Gmail**: Set up Gmail SMTP for testing
2. **Test Account**: Create test email account
3. **Send Test Invite**: Send invitation to test email
4. **Verify Email**: Check inbox and spam folder
5. **Test Acceptance**: Click link and accept invitation

### **Development Testing**
```bash
# Test email sending
curl -X POST http://localhost:3001/api/splitwise/groups/group-id/invites \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "message": "Test invitation"}'
```

## 🐛 **Troubleshooting**

### **Email Not Sending**
- **Check SMTP Settings**: Verify host, port, credentials
- **Check Firewall**: Ensure port 587/465 is open
- **Check Gmail**: Enable "Less secure app access" or use app password
- **Check Logs**: Look for SMTP error messages

### **Invitation Link Not Working**
- **Check Token**: Verify token is valid and not expired
- **Check Frontend URL**: Ensure FRONTEND_URL is correct
- **Check Authentication**: User must be logged in to accept

### **User Can't Accept Invitation**
- **Check Expiration**: Invitation may have expired
- **Check Duplicate**: User may already be a member
- **Check Authentication**: User must be authenticated

## 🎯 **Frontend Integration**

### **Components Created**
- **SendInviteModal**: Modal for sending invitations
- **Updated GroupDetailView**: Added "Send Invite" button
- **API Integration**: Full invitation API integration

### **User Experience**
- **Seamless Flow**: From invitation to group membership
- **Error Handling**: User-friendly error messages
- **Loading States**: Professional loading indicators
- **Success Feedback**: Clear confirmation messages

## 📈 **Analytics & Tracking**

### **Metrics to Track**
- **Invitation Sent**: Number of invitations sent
- **Email Opened**: Email open rates
- **Invitation Accepted**: Acceptance rate
- **Time to Accept**: Average time to accept invitation
- **User Conversion**: New user signups from invitations

### **Event Tracking**
```javascript
// Track invitation sent
analytics.track('invitation_sent', {
  groupId: group.id,
  recipientEmail: email,
  hasMessage: !!message
});

// Track invitation accepted
analytics.track('invitation_accepted', {
  groupId: group.id,
  isNewUser: !existingUser
});
```

## 🔮 **Future Enhancements**

### **Planned Features**
- **Bulk Invitations**: Send multiple invitations at once
- **Invitation Templates**: Customizable email templates
- **Reminder Emails**: Automatic reminders for pending invitations
- **Invitation Analytics**: Detailed invitation performance metrics
- **Social Sharing**: Share invitations on social media
- **QR Code Invitations**: QR codes for mobile invitations

### **Advanced Features**
- **Invitation Limits**: Limit invitations per group/admin
- **Invitation Approval**: Require approval for large groups
- **Invitation Expiry**: Customizable expiration times
- **Invitation History**: Track all invitation activities

## ✅ **Implementation Checklist**

### **Backend Setup**
- [ ] Install nodemailer: `npm install nodemailer`
- [ ] Configure SMTP settings in `.env`
- [ ] Create SplitwiseInvitesController
- [ ] Create invitation routes
- [ ] Update Prisma schema
- [ ] Run database migration
- [ ] Test email sending

### **Frontend Setup**
- [ ] Create SendInviteModal component
- [ ] Update GroupDetailView with invite button
- [ ] Add invitation API endpoints
- [ ] Update useSplitwiseApi hook
- [ ] Test invitation flow

### **Testing**
- [ ] Test email sending with real email
- [ ] Test invitation acceptance flow
- [ ] Test error handling
- [ ] Test expiration handling
- [ ] Test duplicate prevention

## 🎉 **Conclusion**

The email invitation system provides a complete solution for inviting new users to Splitwise groups. It includes:

- ✅ **Real-time email sending** with beautiful templates
- ✅ **Secure token-based invitations** with expiration
- ✅ **Seamless user onboarding** for new users
- ✅ **Admin controls** for invitation management
- ✅ **Comprehensive error handling** and validation
- ✅ **Professional UI/UX** with loading states and feedback

The system is production-ready and provides a professional invitation experience for your users!
