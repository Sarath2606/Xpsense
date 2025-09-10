# Splitwise Implementation Guide for Xpenses App

## Overview
Complete implementation guide for adding Splitwise-style expense sharing to your Xpenses app.

## Current State
✅ Basic UI components exist (GroupList, GroupDetailView, AddExpenseModal)
✅ Local storage persistence
✅ Group creation and management

## Implementation Plan

### Phase 1: Database Schema (PostgreSQL + Prisma)

```sql
-- Add to prisma/schema.prisma
model User {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  avatarUrl String?
  createdAt DateTime @default(now())
  
  groupMemberships GroupMember[]
  expenses         Expense[]      @relation("ExpensePayer")
  expenseShares    ExpenseShare[]
  settlements      Settlement[]   @relation("SettlementFrom")
  settlementsTo    Settlement[]   @relation("SettlementTo")
  activityLogs     ActivityLog[]
  invites          Invite[]       @relation("InviteInviter")
}

model Group {
  id           String   @id @default(uuid())
  name         String
  description  String?
  currencyCode String   @default("AUD")
  createdBy    String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  members      GroupMember[]
  expenses     Expense[]
  settlements  Settlement[]
  activityLogs ActivityLog[]
  invites      Invite[]
  
  creator      User     @relation(fields: [createdBy], references: [id])
}

model GroupMember {
  id        String   @id @default(uuid())
  groupId   String
  userId    String
  role      String   @default("member")
  joinedAt  DateTime @default(now())
  
  group     Group    @relation(fields: [groupId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([groupId, userId])
}

model Expense {
  id           String   @id @default(uuid())
  groupId      String
  payerId      String
  amount       Decimal  @db.Decimal(14, 2)
  currencyCode String   @default("AUD")
  description  String?
  splitType    String   // "EQUAL", "UNEQUAL", "PERCENT", "SHARES"
  date         DateTime
  createdBy    String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  group        Group          @relation(fields: [groupId], references: [id], onDelete: Cascade)
  payer        User           @relation("ExpensePayer", fields: [payerId], references: [id])
  creator      User           @relation(fields: [createdBy], references: [id])
  shares       ExpenseShare[]
  activityLogs ActivityLog[]
}

model ExpenseShare {
  id           String   @id @default(uuid())
  expenseId    String
  userId       String
  shareAmount  Decimal  @db.Decimal(14, 2)
  shareWeight  Decimal? @db.Decimal(14, 6)
  
  expense      Expense @relation(fields: [expenseId], references: [id], onDelete: Cascade)
  user         User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([expenseId, userId])
}

model Settlement {
  id           String   @id @default(uuid())
  groupId      String
  fromUserId   String
  toUserId     String
  amount       Decimal  @db.Decimal(14, 2)
  currencyCode String   @default("AUD")
  method       String?
  note         String?
  createdAt    DateTime @default(now())
  
  group        Group @relation(fields: [groupId], references: [id], onDelete: Cascade)
  fromUser     User  @relation("SettlementFrom", fields: [fromUserId], references: [id])
  toUser       User  @relation("SettlementTo", fields: [toUserId], references: [id])
}

model ActivityLog {
  id           String   @id @default(uuid())
  groupId      String
  actorId      String?
  type         String
  refId        String?
  snapshotJson Json?
  createdAt    DateTime @default(now())
  
  group        Group @relation(fields: [groupId], references: [id], onDelete: Cascade)
  actor        User? @relation(fields: [actorId], references: [id])
}

model Invite {
  id           String   @id @default(uuid())
  groupId      String
  inviterId    String
  inviteeEmail String
  token        String   @unique
  status       String   @default("pending")
  expiresAt    DateTime
  createdAt    DateTime @default(now())
  
  group        Group @relation(fields: [groupId], references: [id], onDelete: Cascade)
  inviter      User  @relation("InviteInviter", fields: [inviterId], references: [id])
}
```

### Phase 2: Core Services

#### Split Calculation Service
```typescript
// src/services/split.service.ts
export class SplitService {
  static computeShares(input: {
    splitType: "EQUAL" | "UNEQUAL" | "PERCENT" | "SHARES";
    amount: number;
    participants: string[];
    shares?: number[];
    percents?: number[];
  }): number[] {
    const n = input.participants.length;
    const amt = Math.round(input.amount * 100); // Convert to cents

    switch (input.splitType) {
      case "EQUAL":
        return this.computeEqualSplit(amt, n);
      case "UNEQUAL":
        return this.computeUnequalSplit(amt, input.shares!);
      case "PERCENT":
        return this.computePercentSplit(amt, input.percents!);
      case "SHARES":
        return this.computeWeightedSplit(amt, input.shares!);
      default:
        throw new Error(`Unknown split type: ${input.splitType}`);
    }
  }

  private static computeEqualSplit(amountCents: number, participantCount: number): number[] {
    const base = Math.floor(amountCents / participantCount);
    const remainder = amountCents - base * participantCount;
    
    return Array.from({ length: participantCount }, (_, i) => 
      base + (i < remainder ? 1 : 0)
    );
  }

  // ... other split methods
}
```

#### Balance Calculation Service
```typescript
// src/services/balance.service.ts
export interface UserBalance {
  userId: string;
  userName: string;
  netAmount: number; // Positive = owed to user, Negative = user owes
  credits: number;
  debits: number;
}

export class BalanceService {
  static async calculateGroupBalances(groupId: string): Promise<UserBalance[]> {
    const balances = await prisma.$queryRaw`
      WITH credits AS (
        SELECT payer_id AS user_id, SUM(amount) AS credits
        FROM "Expense"
        WHERE group_id = ${groupId}
        GROUP BY payer_id
      ),
      debits AS (
        SELECT ep.user_id, SUM(ep.share_amount) AS debits
        FROM "ExpenseShare" ep
        JOIN "Expense" e ON e.id = ep.expense_id
        WHERE e.group_id = ${groupId}
        GROUP BY ep.user_id
      ),
      settlements AS (
        SELECT from_user_id AS user_id, -SUM(amount) AS delta
        FROM "Settlement" WHERE group_id = ${groupId} GROUP BY from_user_id
        UNION ALL
        SELECT to_user_id AS user_id, SUM(amount) AS delta
        FROM "Settlement" WHERE group_id = ${groupId} GROUP BY to_user_id
      ),
      settlement_agg AS (
        SELECT user_id, COALESCE(SUM(delta), 0) AS settle_delta 
        FROM settlements GROUP BY user_id
      )
      SELECT 
        u.id as "userId",
        u.name as "userName",
        COALESCE(c.credits, 0) - COALESCE(d.debits, 0) + COALESCE(sa.settle_delta, 0) AS "netAmount",
        COALESCE(c.credits, 0) AS credits,
        COALESCE(d.debits, 0) AS debits
      FROM "GroupMember" gm
      JOIN "User" u ON u.id = gm.user_id
      LEFT JOIN credits c ON c.user_id = u.id
      LEFT JOIN debits d ON d.user_id = u.id
      LEFT JOIN settlement_agg sa ON sa.user_id = u.id
      WHERE gm.group_id = ${groupId}
      ORDER BY u.name;
    `;

    return balances as UserBalance[];
  }

  static generateSettlementSuggestions(balances: UserBalance[]): SettlementSuggestion[] {
    const epsilon = 0.01;
    
    const debtors = balances
      .filter(b => b.netAmount < -epsilon)
      .map(b => ({ ...b, netAmount: -b.netAmount }))
      .sort((a, b) => b.netAmount - a.netAmount);
    
    const creditors = balances
      .filter(b => b.netAmount > epsilon)
      .sort((a, b) => b.netAmount - a.netAmount);

    const suggestions: SettlementSuggestion[] = [];
    let i = 0, j = 0;

    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];
      const pay = Math.min(debtor.netAmount, creditor.netAmount);
      
      suggestions.push({
        fromUserId: debtor.userId,
        fromUserName: debtor.userName,
        toUserId: creditor.userId,
        toUserName: creditor.userName,
        amount: pay
      });

      debtor.netAmount -= pay;
      creditor.netAmount -= pay;

      if (debtor.netAmount <= epsilon) i++;
      if (creditor.netAmount <= epsilon) j++;
    }

    return suggestions;
  }
}
```

### Phase 3: API Controllers

#### Groups Controller
```typescript
// src/controllers/groups.controller.ts
export class GroupsController {
  static async createGroup(req: Request, res: Response) {
    try {
      const { name, description, currencyCode = "AUD" } = req.body;
      const userId = req.user.id;

      const group = await prisma.group.create({
        data: {
          name,
          description,
          currencyCode,
          createdBy: userId,
          members: {
            create: {
              userId,
              role: "admin"
            }
          }
        },
        include: {
          members: {
            include: {
              user: {
                select: { id: true, name: true, email: true, avatarUrl: true }
              }
            }
          }
        }
      });

      res.status(201).json(group);
    } catch (error) {
      res.status(500).json({ error: "Failed to create group" });
    }
  }

  static async getMyGroups(req: Request, res: Response) {
    try {
      const userId = req.user.id;

      const groups = await prisma.group.findMany({
        where: {
          members: {
            some: { userId }
          }
        },
        include: {
          members: {
            include: {
              user: {
                select: { id: true, name: true, email: true, avatarUrl: true }
              }
            }
          },
          _count: {
            select: {
              expenses: true,
              members: true
            }
          }
        },
        orderBy: { updatedAt: "desc" }
      });

      res.json(groups);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch groups" });
    }
  }
}
```

#### Expenses Controller
```typescript
// src/controllers/expenses.controller.ts
export class ExpensesController {
  static async createExpense(req: Request, res: Response) {
    try {
      const { groupId } = req.params;
      const {
        payerId,
        amount,
        currency = "AUD",
        description,
        splitType,
        participants,
        shares,
        percents
      } = req.body;
      const userId = req.user.id;

      // Validate group membership
      const membership = await prisma.groupMember.findUnique({
        where: { groupId_userId: { groupId, userId } }
      });

      if (!membership) {
        return res.status(403).json({ error: "Not a group member" });
      }

      // Validate all participants are group members
      const groupMembers = await prisma.groupMember.findMany({
        where: { groupId },
        select: { userId: true }
      });

      const memberIds = groupMembers.map(m => m.userId);
      const invalidParticipants = participants.filter(p => !memberIds.includes(p));
      
      if (invalidParticipants.length > 0) {
        return res.status(400).json({ 
          error: "Some participants are not group members",
          invalidParticipants 
        });
      }

      // Compute shares
      const shareAmounts = SplitService.computeShares({
        splitType,
        amount,
        participants,
        shares,
        percents
      });

      // Create expense in transaction
      const expense = await prisma.$transaction(async (tx) => {
        const exp = await tx.expense.create({
          data: {
            groupId,
            payerId,
            amount,
            currencyCode: currency,
            description,
            splitType,
            date: new Date(),
            createdBy: userId
          }
        });

        // Create expense shares
        await tx.expenseShare.createMany({
          data: participants.map((participantId, index) => ({
            expenseId: exp.id,
            userId: participantId,
            shareAmount: shareAmounts[index] / 100,
            shareWeight: shares?.[index] || null
          }))
        });

        // Log activity
        await tx.activityLog.create({
          data: {
            groupId,
            actorId: userId,
            type: "EXPENSE_CREATED",
            refId: exp.id,
            snapshotJson: {
              amount,
              description,
              splitType,
              participants,
              shares: shareAmounts
            }
          }
        });

        return exp;
      });

      res.status(201).json(expense);
    } catch (error) {
      console.error("Create expense error:", error);
      res.status(500).json({ error: "Failed to create expense" });
    }
  }
}
```

### Phase 4: API Routes

```typescript
// src/routes/groups.ts
import { Router } from "express";
import { GroupsController } from "../controllers/groups.controller";
import { ExpensesController } from "../controllers/expenses.controller";
import { BalancesController } from "../controllers/balances.controller";
import { SettlementsController } from "../controllers/settlements.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.use(authMiddleware);

// Groups
router.post("/", GroupsController.createGroup);
router.get("/", GroupsController.getMyGroups);
router.get("/:id", GroupsController.getGroupDetails);
router.post("/:id/members", GroupsController.addMember);
router.delete("/:id/members/:userId", GroupsController.removeMember);

// Expenses
router.post("/:id/expenses", ExpensesController.createExpense);
router.get("/:id/expenses", ExpensesController.getGroupExpenses);

// Balances
router.get("/:id/balances", BalancesController.getGroupBalances);

// Settlements
router.post("/:id/settlements", SettlementsController.createSettlement);
router.get("/:id/settlements", SettlementsController.getGroupSettlements);

export default router;
```

### Phase 5: Frontend Integration

#### API Service Layer
```javascript
// src/services/splitwiseApi.js
import { apiClient } from '../config/api';

export const splitwiseApi = {
  // Groups
  createGroup: (groupData) => apiClient.post('/groups', groupData),
  getMyGroups: () => apiClient.get('/groups'),
  getGroupDetails: (groupId) => apiClient.get(`/groups/${groupId}`),
  addMember: (groupId, email) => apiClient.post(`/groups/${groupId}/members`, { email }),
  removeMember: (groupId, userId) => apiClient.delete(`/groups/${groupId}/members/${userId}`),

  // Expenses
  createExpense: (groupId, expenseData) => apiClient.post(`/groups/${groupId}/expenses`, expenseData),
  getGroupExpenses: (groupId) => apiClient.get(`/groups/${groupId}/expenses`),
  updateExpense: (expenseId, expenseData) => apiClient.patch(`/expenses/${expenseId}`, expenseData),
  deleteExpense: (expenseId) => apiClient.delete(`/expenses/${expenseId}`),

  // Balances
  getGroupBalances: (groupId) => apiClient.get(`/groups/${groupId}/balances`),

  // Settlements
  createSettlement: (groupId, settlementData) => apiClient.post(`/groups/${groupId}/settlements`, settlementData),
  getGroupSettlements: (groupId) => apiClient.get(`/groups/${groupId}/settlements`),

  // Invites
  sendInvite: (groupId, email) => apiClient.post(`/groups/${groupId}/invites`, { email }),
  acceptInvite: (token) => apiClient.post('/invites/accept', { token }),
};
```

#### Updated SplitwiseView
```javascript
// src/components/splitwise/SplitwiseView.js
import React, { useState, useEffect } from 'react';
import { splitwiseApi } from '../../services/splitwiseApi';

const SplitwiseView = ({ onBack }) => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [view, setView] = useState('list');

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const response = await splitwiseApi.getMyGroups();
      setGroups(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load groups');
      console.error('Load groups error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (newGroup) => {
    try {
      const response = await splitwiseApi.createGroup(newGroup);
      setGroups([response.data, ...groups]);
      setShowCreateGroup(false);
    } catch (err) {
      setError('Failed to create group');
      console.error('Create group error:', err);
    }
  };

  // ... rest of component logic
};
```

### Phase 6: Email Invites

#### Email Service
```typescript
// src/services/email.service.ts
import nodemailer from 'nodemailer';

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async sendGroupInvite(invite: {
    token: string;
    groupName: string;
    inviterName: string;
    inviteeEmail: string;
  }) {
    const joinUrl = `${process.env.FRONTEND_URL}/join?token=${invite.token}`;

    const mailOptions = {
      from: process.env.FROM_EMAIL,
      to: invite.inviteeEmail,
      subject: `${invite.inviterName} invited you to join "${invite.groupName}"`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>You're invited to join a Splitwise group!</h2>
          <p>${invite.inviterName} has invited you to join the expense sharing group "${invite.groupName}".</p>
          <p>Click the button below to accept the invitation:</p>
          <a href="${joinUrl}" 
             style="display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            Join Group
          </a>
          <p>Or copy this link: ${joinUrl}</p>
          <p>This invitation will expire in 7 days.</p>
        </div>
      `
    };

    await this.transporter.sendMail(mailOptions);
  }
}
```

#### Invites Controller
```typescript
// src/controllers/invites.controller.ts
import { v4 as uuidv4 } from 'uuid';
import { EmailService } from '../services/email.service';

export class InvitesController {
  static async sendInvite(req: Request, res: Response) {
    try {
      const { groupId } = req.params;
      const { email } = req.body;
      const userId = req.user.id;

      // Check if user is group member
      const membership = await prisma.groupMember.findUnique({
        where: { groupId_userId: { groupId, userId } }
      });

      if (!membership) {
        return res.status(403).json({ error: "Not a group member" });
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        // Check if already a member
        const existingMember = await prisma.groupMember.findUnique({
          where: { groupId_userId: { groupId, userId: existingUser.id } }
        });

        if (existingMember) {
          return res.status(400).json({ error: "User is already a group member" });
        }

        // Add directly to group
        await prisma.groupMember.create({
          data: {
            groupId,
            userId: existingUser.id,
            role: "member"
          }
        });

        return res.json({ message: "User added to group successfully" });
      }

      // Create invite
      const token = uuidv4();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

      const invite = await prisma.invite.create({
        data: {
          groupId,
          inviterId: userId,
          inviteeEmail: email,
          token,
          expiresAt
        },
        include: {
          group: { select: { name: true } },
          inviter: { select: { name: true } }
        }
      });

      // Send email
      const emailService = new EmailService();
      await emailService.sendGroupInvite({
        token,
        groupName: invite.group.name,
        inviterName: invite.inviter.name,
        inviteeEmail: email
      });

      res.json({ message: "Invitation sent successfully" });
    } catch (error) {
      console.error("Send invite error:", error);
      res.status(500).json({ error: "Failed to send invitation" });
    }
  }

  static async acceptInvite(req: Request, res: Response) {
    try {
      const { token } = req.body;
      const userId = req.user.id;

      const invite = await prisma.invite.findFirst({
        where: {
          token,
          status: "pending",
          expiresAt: { gt: new Date() }
        },
        include: {
          group: { select: { id: true, name: true } }
        }
      });

      if (!invite) {
        return res.status(400).json({ error: "Invalid or expired invitation" });
      }

      // Check if already a member
      const existingMember = await prisma.groupMember.findUnique({
        where: { groupId_userId: { groupId: invite.groupId, userId } }
      });

      if (existingMember) {
        return res.status(400).json({ error: "Already a group member" });
      }

      // Add to group and mark invite as accepted
      await prisma.$transaction([
        prisma.groupMember.create({
          data: {
            groupId: invite.groupId,
            userId,
            role: "member"
          }
        }),
        prisma.invite.update({
          where: { id: invite.id },
          data: { status: "accepted" }
        })
      ]);

      res.json({ 
        message: "Successfully joined group",
        group: invite.group
      });
    } catch (error) {
      console.error("Accept invite error:", error);
      res.status(500).json({ error: "Failed to accept invitation" });
    }
  }
}
```

### Phase 7: Environment Setup

#### Environment Variables
```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/xpenses"

# Email (for invites)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
FROM_EMAIL="noreply@yourapp.com"

# Frontend URL (for invite links)
FRONTEND_URL="https://yourapp.com"

# JWT Secret
JWT_SECRET="your-secret-key"
```

#### Database Migration
```bash
# Run after updating schema
npx prisma migrate dev --name add-splitwise-tables
npx prisma generate
```

### Phase 8: API Endpoints Summary

```
POST   /groups                    - Create group
GET    /groups                    - Get user's groups
GET    /groups/:id                - Get group details
POST   /groups/:id/members        - Add member
DELETE /groups/:id/members/:userId - Remove member

POST   /groups/:id/expenses       - Create expense
GET    /groups/:id/expenses       - Get group expenses
PATCH  /expenses/:id              - Update expense
DELETE /expenses/:id              - Delete expense

GET    /groups/:id/balances       - Get group balances
POST   /groups/:id/settlements    - Record settlement
GET    /groups/:id/settlements    - Get settlements

POST   /groups/:id/invites        - Send invite
POST   /invites/accept            - Accept invite
```

### Phase 9: Testing Strategy

#### Unit Tests
```typescript
// tests/services/split.service.test.ts
import { SplitService } from '../../src/services/split.service';

describe('SplitService', () => {
  describe('computeShares', () => {
    it('should compute equal split correctly', () => {
      const result = SplitService.computeShares({
        splitType: 'EQUAL',
        amount: 100,
        participants: ['user1', 'user2', 'user3']
      });

      expect(result).toEqual([3333, 3333, 3334]); // 33.33, 33.33, 33.34
    });

    it('should compute unequal split correctly', () => {
      const result = SplitService.computeShares({
        splitType: 'UNEQUAL',
        amount: 100,
        participants: ['user1', 'user2'],
        shares: [60, 40]
      });

      expect(result).toEqual([6000, 4000]); // 60.00, 40.00
    });
  });
});
```

### Phase 10: Implementation Timeline

1. **Week 1**: Database schema and Prisma setup
2. **Week 2**: Core backend services and API endpoints
3. **Week 3**: Frontend integration and UI updates
4. **Week 4**: Email invites and testing
5. **Week 5**: Deployment and documentation

### Phase 11: Future Enhancements

- **Recurring Expenses**: Weekly/monthly bills
- **Categories**: Food, transport, utilities, etc.
- **Receipt Upload**: Image storage with OCR
- **Multi-currency**: FX rates and conversions
- **Real-time Updates**: WebSocket notifications
- **Mobile App**: React Native version

## Conclusion

This implementation guide provides a complete roadmap for adding Splitwise-style functionality to your Xpenses app. The modular approach allows you to implement features incrementally while maintaining code quality and scalability.

Key benefits:
- ✅ Scalable database design
- ✅ Robust balance calculations
- ✅ Secure API endpoints
- ✅ Email invitation system
- ✅ Comprehensive testing strategy
- ✅ Production-ready deployment

Follow this guide step by step, and you'll have a fully functional expense sharing system that rivals Splitwise's core features!
