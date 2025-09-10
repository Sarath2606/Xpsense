# Splitwise API Documentation

## Overview
This document describes all the API endpoints for the Splitwise expense sharing system. All endpoints require authentication via JWT token in the Authorization header.

**Base URL**: `http://localhost:3001/api/splitwise`

**Authentication**: Include `Authorization: Bearer <your-jwt-token>` in request headers

---

## Groups Management

### Create Group
**POST** `/groups`

Create a new expense sharing group.

**Request Body:**
```json
{
  "name": "Trip to Bali",
  "description": "Vacation expenses for Bali trip",
  "currencyCode": "AUD"
}
```

**Response:**
```json
{
  "message": "Group created successfully",
  "group": {
    "id": "clx1234567890",
    "name": "Trip to Bali",
    "description": "Vacation expenses for Bali trip",
    "currencyCode": "AUD",
    "createdBy": "user123",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z",
    "members": [...],
    "creator": {...}
  }
}
```

### Get My Groups
**GET** `/groups`

Get all groups where the current user is a member.

**Response:**
```json
{
  "groups": [
    {
      "id": "clx1234567890",
      "name": "Trip to Bali",
      "description": "Vacation expenses for Bali trip",
      "currencyCode": "AUD",
      "members": [...],
      "creator": {...},
      "_count": {
        "expenses": 5,
        "members": 4
      }
    }
  ],
  "total": 1
}
```

### Get Group Details
**GET** `/groups/:id`

Get detailed information about a specific group.

**Response:**
```json
{
  "group": {
    "id": "clx1234567890",
    "name": "Trip to Bali",
    "description": "Vacation expenses for Bali trip",
    "currencyCode": "AUD",
    "members": [...],
    "creator": {...},
    "expenses": [...],
    "_count": {
      "expenses": 5,
      "members": 4,
      "settlements": 2
    }
  }
}
```

### Update Group
**PUT** `/groups/:id`

Update group information (admin only).

**Request Body:**
```json
{
  "name": "Updated Trip Name",
  "description": "Updated description",
  "currencyCode": "USD"
}
```

### Delete Group
**DELETE** `/groups/:id`

Delete a group (admin only).

---

## Member Management

### Add Member
**POST** `/groups/:id/members`

Add a new member to the group by email (admin only).

**Request Body:**
```json
{
  "email": "newmember@example.com",
  "role": "member"
}
```

### Remove Member
**DELETE** `/groups/:id/members/:memberId`

Remove a member from the group (admin only).

### Update Member Role
**PATCH** `/groups/:id/members/:memberId`

Update a member's role (admin only).

**Request Body:**
```json
{
  "role": "admin"
}
```

---

## Expenses Management

### Create Expense
**POST** `/expenses/groups/:groupId/expenses`

Create a new expense in a group.

**Request Body:**
```json
{
  "payerId": "user123",
  "amount": 150.00,
  "currency": "AUD",
  "description": "Dinner at restaurant",
  "splitType": "EQUAL",
  "participants": ["user123", "user456", "user789"],
  "date": "2024-01-15T18:30:00Z"
}
```

**Split Types:**
- `EQUAL`: Split equally among participants
- `UNEQUAL`: Specify exact amounts for each person
- `PERCENT`: Split by percentages (must sum to 100%)
- `SHARES`: Split by weights/shares

**For UNEQUAL/SHARES:**
```json
{
  "splitType": "UNEQUAL",
  "participants": ["user123", "user456"],
  "shares": [100.00, 50.00]
}
```

**For PERCENT:**
```json
{
  "splitType": "PERCENT",
  "participants": ["user123", "user456", "user789"],
  "percents": [50, 30, 20]
}
```

### Get Group Expenses
**GET** `/expenses/groups/:groupId/expenses`

Get all expenses for a group with pagination.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `sortBy`: Sort field (default: "date")
- `sortOrder`: Sort direction (default: "desc")

**Response:**
```json
{
  "expenses": [
    {
      "id": "exp123",
      "amount": 150.00,
      "description": "Dinner at restaurant",
      "splitType": "EQUAL",
      "date": "2024-01-15T18:30:00Z",
      "payer": {...},
      "creator": {...},
      "shares": [...]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "pages": 1
  }
}
```

### Get Expense
**GET** `/expenses/:id`

Get a specific expense by ID.

### Update Expense
**PUT** `/expenses/:id`

Update an existing expense (creator or admin only).

### Delete Expense
**DELETE** `/expenses/:id`

Delete an expense (creator or admin only).

### Get Split Types
**GET** `/expenses/split-types`

Get available split type options for UI.

**Response:**
```json
{
  "splitTypes": [
    {
      "value": "EQUAL",
      "label": "Split equally",
      "description": "Divide the expense equally among all participants"
    },
    {
      "value": "UNEQUAL",
      "label": "Split unequally",
      "description": "Specify exact amounts for each person"
    },
    {
      "value": "PERCENT",
      "label": "Split by percentage",
      "description": "Divide based on percentages (must sum to 100%)"
    },
    {
      "value": "SHARES",
      "label": "Split by shares",
      "description": "Divide based on weights/shares"
    }
  ]
}
```

---

## Balances & Settlements

### Get Group Balances
**GET** `/balances/groups/:groupId/balances`

Get comprehensive balance information for all group members.

**Response:**
```json
{
  "message": "Group balances calculated successfully",
  "groupId": "clx1234567890",
  "groupName": "Trip to Bali",
  "totalExpenses": 150000,
  "totalSettlements": 50000,
  "userBalances": [
    {
      "userId": "user123",
      "userName": "Alice",
      "userEmail": "alice@example.com",
      "netAmount": 4000,
      "credits": 12000,
      "debits": 8000,
      "settlementsIn": 0,
      "settlementsOut": 0
    }
  ],
  "settlementSuggestions": [
    {
      "fromUserId": "user456",
      "fromUserName": "Bob",
      "toUserId": "user123",
      "toUserName": "Alice",
      "amount": 3000,
      "description": "Bob pays Alice $30.00"
    }
  ],
  "currencyCode": "AUD"
}
```

### Get My Balance
**GET** `/balances/groups/:groupId/balances/my-balance`

Get the current user's balance in a specific group.

### Get My Group Balances
**GET** `/balances/my-groups`

Get all groups where the user has balances (for dashboard).

### Validate Group Balances
**GET** `/balances/groups/:groupId/balances/validate`

Validate that group balances sum to zero (for debugging).

### Get Balance History
**GET** `/balances/groups/:groupId/balances/history`

Get balance history for the current user in a group.

**Query Parameters:**
- `days`: Number of days to look back (default: 30)

### Get Settlement Suggestions
**GET** `/balances/groups/:groupId/balances/settlements`

Get optimal settlement suggestions to minimize cash flow.

---

## Settlements Management

### Create Settlement
**POST** `/settlements/groups/:groupId/settlements`

Record a payment between users.

**Request Body:**
```json
{
  "fromUserId": "user456",
  "toUserId": "user123",
  "amount": 30.00,
  "currency": "AUD",
  "method": "Bank Transfer",
  "note": "Payment for dinner"
}
```

### Get Group Settlements
**GET** `/settlements/groups/:groupId/settlements`

Get all settlements for a group with pagination.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `sortBy`: Sort field (default: "createdAt")
- `sortOrder`: Sort direction (default: "desc")

### Get User Settlements
**GET** `/settlements/groups/:groupId/settlements/user/:userId`

Get settlements involving a specific user.

### Get Settlement
**GET** `/settlements/:id`

Get a specific settlement by ID.

### Update Settlement
**PUT** `/settlements/:id`

Update a settlement (admin only).

### Delete Settlement
**DELETE** `/settlements/:id`

Delete a settlement (admin only).

---

## Error Responses

All endpoints return consistent error responses:

**400 Bad Request:**
```json
{
  "error": "Invalid expense data",
  "details": ["Amount must be greater than 0"]
}
```

**401 Unauthorized:**
```json
{
  "error": "Authentication required"
}
```

**403 Forbidden:**
```json
{
  "error": "Not a member of this group"
}
```

**404 Not Found:**
```json
{
  "error": "Group not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Failed to create group"
}
```

---

## Data Types

### Money Handling
- All amounts are stored as `NUMERIC(14,2)` in the database
- API accepts amounts in dollars (e.g., 150.00)
- Internal calculations use cents for precision
- Responses show amounts in dollars

### Dates
- All dates use ISO 8601 format: `YYYY-MM-DDTHH:mm:ss.sssZ`
- Timezone: UTC

### IDs
- All IDs use CUID format (e.g., `clx1234567890`)
- Generated automatically by Prisma

---

## Rate Limiting
- 100 requests per minute per IP in production
- 5000 requests per minute per IP in development
- Health check endpoints are not rate limited

---

## Authentication
All endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

The token should contain:
- `userId`: User's unique identifier
- `email`: User's email address
- `name`: User's display name (optional)
