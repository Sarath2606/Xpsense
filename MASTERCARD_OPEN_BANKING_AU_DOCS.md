# Mastercard Open Banking Australia API Documentation

## Overview

**Service ID:** open-banking-au  
**Auth Type:** OpenBanking  
**Source URLs:**
- HTML: https://developer.mastercard.com/open-banking-au/documentation/
- MD: https://developer.mastercard.com/open-banking-au/documentation/index.md

**API Specifications:**
- https://developer.mastercard.com/open-banking-au/swagger/consent-webhooks-aus.yaml
- https://developer.mastercard.com/open-banking-au/swagger/mastercard-openbanking.yaml

## What is Open Banking?

Open banking is a technology that allows financial data sharing between data holders (for example, banks) and third-party service providers (for example, lenders) in a way that benefits the data owners (consumers). Open banking simplifies the process of accessing financial data and makes it more secure.

If you are a fintech company that is looking to enrich its products and provide higher-quality services, the Mastercard Open Banking APIs can help you achieve this. Mastercard Open Banking enables you to leverage a data infrastructure compliant with Consumer Data Right (CDR) regulation, for multiple Open Data use cases including payment initiation.

## How It Works

1. Customers access your product to get a particular service provided using their financial data.
2. Your product initiates workflow using Mastercard Open Banking.
3. Mastercard Open Banking requests the customer to provide consent to access their financial data.
4. The customer consents.
5. Mastercard Open Banking redirects the customer to the Financial Institution (FI) to authorise access to their data.
6. The FI requests the customer to authorise the data sharing.
7. The customer selects the accounts to which access is granted and authorises the access.
8. The FI returns customer's financial data requested by Mastercard Open Banking.
9. Mastercard Open Banking provides the requested data to support your product.
10. Your product provides the requested service back to the customer.

## Use Cases

### Payment Enablement
Provide a seamless payment experience for your customers.

### Personal Finance Management
Provide a consolidated view of your customers' finances in a single space to help your customers manage their wealth better.

### Lending
Confidently verify lending details and deliver a seamless lending experience for your customers.

## Key Features

### Platform Security
- Complies with security requirements defined under Schedule 2 of the CDR Rules and is SOC2+ certified
- Our platform is Active and has passed Conformance Testing required by the ACCC
- Unrestricted Accredited Data Recipient with the ACCC

### Consent Management
- Mastercard hosted complete consent management lifecycle -- screens and dashboards
- White-label consent management capabilities
- Consent and compliance monitoring program for CDR Rules changes

### CDR and Privacy Regulations
- Support to identify and implement the best CDR access model to enable your use case
- Provide multiple access models including Outsourced Service Provider (OSP), CDR Representative, and Business Consumer Disclosure Consent models
- Dedicated Australian CDR compliance teams - operational compliance, legal, privacy, and regulatory

## Onboarding

### Create a Sandbox Project

1. Log in to your Mastercard Developers account
2. Click **Create New Project**
3. Provide Project details:
   - Enter a name for your project
   - Select **No** for "Are you creating this project on behalf of a client?"
   - Select **Open Banking** from the **Select your API service** dropdown
   - Select the country where end users will be located
   - Click **Proceed**
4. Provide Service details:
   - Optionally enter a description for your Sandbox credentials
   - Click **Create Project**
5. Your project displays the Sandbox credentials - `Partner ID`, `Secret`, and `App Key`

### Keys Required

- **PartnerID** - Unique identifier for credentials
- **Secret** and **appKey** - Credentials required to authenticate API calls

### Request Production Access

Once tested in Sandbox, you can request an upgrade to Production:
- **Test Drive Premium**: Production, non-billable plan for testing with live data
- **Production (billable)**: Provides access to Open Banking endpoints mentioned in your contract

## Authentication

### Create Access Token

All requests must include an `App-Token` HTTP header. Generate a new access token using:

```bash
curl --location --request POST 'https://api.openbanking.mastercard.com.au/aggregation/v2/partners/authentication' \
--header 'Content-Type: application/json' \
--header 'App-Key: {{appKey}}' \
--header 'Accept: application/json' \
--data-raw '{
    "partnerId": "{{partnerId}}",
    "partnerSecret": "{{partnerSecret}}"
}'
```

**Expected Response:**
```json
{
  "token": "YBh22Sb9Es6e66Q7lWdt"
}
```

## Consent Management

### What is Consent?

Consent is a crucial part of getting access to the consumer's financial data. Any information received from the Financial Institution (FI) in Australia is protected by CDR regulation.

### Consent Attributes

Every consent must contain clear information about:
- Who will access the data (the data recipient)
- The purpose of accessing the data
- The FI to be accessed
- The type of data to be accessed
- How long the data recipient will have access to the data
- How many days of historical data the data recipient will fetch

### Consent Lifecycle

1. **Customer initiates the consent** - Creates a definition of consent including purpose, type of data, and access duration
2. **Customer submits consent/arrangement with the 1st FI** - Allows accessing financial accounts with this institution
3. **Customer may add more arrangements with other FIs** - Creates separate arrangements for each FI
4. **Customer may revoke** - Can revoke arrangements with one institution or the whole consent
5. **Consent expires** - When duration specified has elapsed, consent expires and data is deleted

### Subscribe for Consent Notifications

```bash
curl --location --request POST 'https://api.openbanking.mastercard.com.au/notifications/webhooks/subscriptions' \
--header 'App-Key: {{appKey}}' \
--header 'App-Token: {{appToken}}' \
--header 'Content-Type: application/json' \
--data-raw '{
  "url": "{{callback_url}}",
  "notificationType": "CONSENT"
}'
```

## Connect Application

The Connect application allows customers to grant authorization and use of their account credentials to access their financial data.

### How Connect Works

1. Your server registers a Customer with Open Banking and receives an ID
2. Using this customer ID, your server generates a URL for loading the Connect experience
3. Your frontend application redirects the customer to Connect using the generated URL
4. The customer consents to share the data with you
5. The customer logs into their Financial Institution through the Connect experience
6. The customer grants permission for their financial data to be accessed

### Generate Connect URL

```bash
curl --location --request POST 'https://api.openbanking.mastercard.com.au/connect/v2/generate' \
--header 'Content-Type: application/json' \
--header 'Accept: application/json' \
--header 'App-Token: {{appToken}}' \
--header 'App-Key: {{appKey}}' \
--data-raw '{
    "partnerId": "{{partnerId}}",
    "customerId": "{{customerId}}",
    "webhook": "{{webhookUrl}}"
}'
```

## Financial Institutions

### Institution Operations

Use the Institution APIs to search for a specific FI, or retrieve a list of all supported FIs.

**API Endpoints:**
- `GET /institution/v2/institutions` - Get all institutions
- `GET /institution/v2/institutions/{institutionId}` - Get specific institution

### Certified Institutions

FIs are certified based on accessibility from the Open Banking platform and ability to seamlessly add consumers and retrieve quality account data with performance consistency.

**API Endpoint:**
- `GET /institution/v2/certifiedInstitutions` - Get certified FIs

### Product Matrix

| Value | Product |
|-------|---------|
| transAgg | Transaction Aggregation |
| ach | Account Details (Money Transfer Verification) |
| voi | Verification of Income |
| voa | Verification of Assets |
| aha | Account History |
| availBalance | Account Balance |
| accountOwner | Account Owner |

## Open Banking Products

### Prerequisites

Before using any Open Banking products:
1. Generate your credentials for accessing the services
2. Understand how to authenticate and receive an access token
3. Connect your customer accounts through the Connect Application

### Available Products

1. **Verification of Income (VOI)** - Get a report that ranks a customer's income streams
2. **Verification of Assets (VOA)** - Retrieve up to 6 months of transaction history
3. **Cash Flow Analytics** - Analyze credit and debit cash flow
4. **Transaction Aggregation** - Receive nightly aggregations of financial transactions
5. **Account History** - Receive up to 12 months of aggregated financial transactions
6. **Account Details** - Verify account details for account opening or payment initiation
7. **Account Owner** - Retrieve account owner's details
8. **Account Balance** - Retrieve available account balance

## Quick Start Guide

### Step 1: Generate Your Credentials
1. Log in to Mastercard Developers
2. Create a new project
3. Select Open Banking
4. Note your Partner ID, Partner Secret, and App Key

### Step 2: Create an Access Token
Use the authentication endpoint to generate a token valid for 90 minutes.

### Step 3: Subscribe for Consent Notifications
Set up webhook subscriptions to receive consent notifications.

### Step 4: Register Your Application
Register your application to get an application ID.

### Step 5: Create Test Customer
Create a testing customer record to use with FinBank test profiles.

### Step 6: Generate Connect URL
Generate a Connect URL for customers to grant access to their accounts.

### Step 7: Fetch Data
Use various API endpoints to retrieve financial data.

## API Status Codes

### Common API Status Codes

| Code | Description | HTTP Response | Required Action |
|------|-------------|---------------|-----------------|
| 10005 | Missing Parameter | HTTP 400 | Submit request with valid text in all required fields |
| 10023 | Expired (App-Token) | HTTP 401 | Generate new App-Token |
| 110039 | Username policy violation | HTTP 500 | Use unique username between 6-255 characters |
| 325 5006 | Account being aggregated | HTTP 500 | Check account status periodically |
| 18001 | Report being generated | N/A | Wait for report generation to complete |

### Common Aggregation Status Codes

| Code | Description | Required Action |
|------|-------------|-----------------|
| 102 320 580 | Temporary FI issue | Submit support ticket |
| 103 | Wrong credentials | Update credentials or use Connect to revoke/reconsent |
| 108 | User action required at FI | Have customer login and resolve prompts |
| 109 | Security info update required | Have customer update password and reconsent |
| 900-907 | New institution connection | Submit support ticket |
| 910 | Connection down | Submit support ticket |
| 913-914 | Account closed/not found | Handle closed accounts in application |
| 915-916 | Connection being fixed | Wait and retry |
| 920-929 | Institution not supported | Contact FI to support aggregation |
| 931 | One-time passcode required | Inform customer of authentication requirement |
| 936 | Language preference issue | Have customer change language to English |

### Common Connect Status Codes

| Code | Description |
|------|-------------|
| 100 | User exited out of Connect |
| 200 | Success |
| 401 | Unauthorized |
| 500 | Unexpected error |
| 1403 | OAuth popup blocked |
| 1412 | Invalid SDK implementation |
| 1440 | Timeout - user logged out after 5 minutes inactivity |
| 10039 | Tampered Connect link |

## Test the APIs

### Test Profiles

Use these profiles with FinBank Aus OAuth (ID 200003), FinBank Aus B OAuth (ID 2002119), and FinBank OAuth Aus C (ID 2002120):

| Username | Password | Testing Purpose |
|----------|----------|-----------------|
| profile_4110 | profile_4110 | Personal Transaction, Savings, Loan, Mortgage and Credit Card |
| profile_4111 | profile_4111 | Personal Transaction, Savings, Loan, Mortgage and Credit Card |
| profile_4112 | profile_4112 | Personal Transaction, Savings, Loan, Mortgage and Credit Card |
| profile_4113 | profile_4113 | Personal Transaction, Savings, Loan, Mortgage and Credit Card |
| profile_4114 | profile_4114 | Personal Transaction, Savings, Loan, Mortgage and Credit Card |
| profile_4115 | profile_4115 | Personal Transaction, Savings, Loan, Mortgage and Credit Card |
| profile_4116 | profile_4116 | Personal Transaction, Savings, Loan, Mortgage and Credit Card |
| profile_4117 | profile_4117 | Personal Transaction, Savings |
| profile_4118 | profile_4118 | Business Account, Credit Card -- Large number of transactions |
| profile_voi_001 | profile_voi_001 | Verification of income testing |
| profile_voi_002 | profile_voi_002 | Verification of income testing |
| profile_voi_003 | profile_voi_003 | Verification of income testing |
| profile_voi_004 | profile_voi_004 | Verification of income testing |

## Webhook Notifications

API Specification: `https://static.developer.mastercard.com/content/open-banking-au/swagger/consent-webhooks-aus.yaml`

## Reference Application

The Mastercard Open Banking Reference Application is available on GitHub:
https://github.com/Mastercard/open-banking-reference-application-australia

### Compatibility
- Node (v14+)
- ReactJS (v18.3.1)

### Installation
```bash
git clone https://github.com/Mastercard/open-banking-reference-application-australia.git
cd open-banking-reference-application-australia
npm i
```

## Support

### Contact Information
For technical support, contact Mastercard API Support.

### FAQs

**General:**
- Sandbox allows access to all endpoints using testing customers and mock FI data
- Production (Non-Billable) uses active customers and real FI data
- Testing customers can only be used with Finbank test profiles
- Active customers mimic production workflow without charges

**Auth and Configuration:**
- Auth tokens are valid for up to 2 hours (120 minutes)
- Best practice: use single token for all requests and check timestamp
- Generate new token if older than 90 minutes
- Account locked after 5 failed authentication attempts

**Connect:**
- SDKs available for Web, React Native, Android, and iOS
- Can configure up to 8 Financial Institutions for display
- Experience parameter can be omitted for default branding
- Old accounts may still show after deletion but won't aggregate data

**Financial Institutions:**
- FI Certification status available via Get Certified Institutions API

**Products:**
- Account Balance caches every ~4 hours, Account Balance Live pulls real-time
- Get Customer Transactions pulls across all accounts
- Can choose single or all verification services
- Default: 180 days for transactions, 365 days for VOI and CFR reports
- Maximum 12 months of historic transactions available

## Glossary

- **Access Token** - Token returned after Partner ID and Secret authentication, valid for 90 minutes
- **Account Aggregation** - Process of gathering customer account data in real-time
- **Account ID** - Unique number representing a financial account owned by a customer
- **Applications** - Web or mobile applications registered with Mastercard
- **App Key** - Key associated with registered application, required in all API calls
- **Certified Institutions** - FIs certified based on accessibility and data quality
- **Connect** - User interface for connecting to Financial Institutions
- **Connect Events** - Notifications sent to event listeners via SDKs
- **Connect Experience** - Features to customize Connect app look and behavior
- **Connect Session** - Session from opening Connect app to data submission
- **Consent** - Customer permission to access financial data for limited time
- **Consumer** - Records associated with customers, persists as report owners
- **Customer** - End users granting access to financial accounts
- **Customer ID, Testing** - Unique ID for testing customers using FinBanks
- **FinBanks** - Testing Financial Institutions for simulating data transactions
- **Partner** - Company or individual with Mastercard Developers account
- **Sandbox** - Environment for testing Open Banking projects
- **Test Drive** - Free plan for testing with testing customer IDs
- **Test Profiles** - Different use case scenarios for testing applications

## API Reference

API Specification: `https://static.developer.mastercard.com/content/open-banking-au/swagger/mastercard-openbanking.yaml`

## Code and Formats

### Timestamps
- API supports Unix epoch timestamps or ISO-8601 format
- Unix epoch timestamp: seconds since January 1, 1970 (midnight UTC/GMT)
- Java/Javascript timestamps are in milliseconds

### URL Encoding
Request URLs must be URL-encoded:
- Spaces replaced with +
- @ symbol replaced with %40

**Good:** `?search=New+York+City&start=1&limit=10`  
**Bad:** `?search=New York City&start=1&limit=10`

## Code Examples

### Python Example - Generate Connect URL

```python
customer_id = "{{customerId}}"
api_client = ApiClient()
connect_parameters = ConnectParameters(
  partner_id=api_client.partner_id,
  customer_id=customer_id)

# Generate a Connect URL
response = ConnectApi(api_client.api_client).generate_connect_url(connect_parameters=connect_parameters)

print("Connect URL: ", response.link)
```

## Next Steps

* For the full list of testing profiles available, refer to [Test the APIs](https://developer.mastercard.com/open-banking-au/documentation/test-the-apis/index.md).
* Explore our [Reference App](https://developer.mastercard.com/open-banking-au/documentation/reference-app/index.md) to see a simple React application which uses many of the APIs mentioned above, including Connect.
* To learn more about Consent, which allows you to access your customer's accounts, refer to [Consent](https://developer.mastercard.com/open-banking-au/documentation/consent/index.md).
* To learn more about Connect, configure Connect for your application and receive Connect session events, read [Connect Application](https://developer.mastercard.com/open-banking-au/documentation/connect/index.md).
* You may also want to take a look at our [Open Banking products](https://developer.mastercard.com/open-banking-au/documentation/products/index.md).

---

## Payment Enablement

Verify account owner, bank account number, bank state branch (BSB), and account balance before initiating movement of funds. Build streamlined experiences for credit-decisioning, loan funding and loan servicing by leveraging Account Details, Account Balance Check (Live) or Account Balance Check (Cached), and Account Owner Verification API services.

This process can take the pain out of recurring payments like rent, utilities, tuition, insurance and healthcare, where Money Transfer is the primary payment method.

### How Payment Enablement Works

Use the following APIs to retrieve account information to set up online payments via Money Transfer, check balance to ensure accounts have sufficient funds, verify account ownership for Know Your Customer (KYC) compliance, and set up recurring payments:

1. Subscribe to [Consent Notifications](https://developer.mastercard.com/open-banking-au/documentation/consent/consent-notifications/index.md) to retrieve Consent Receipt ID
2. Generate a Connect URL to launch the [Connect Application](https://developer.mastercard.com/open-banking-au/documentation/connect/index.md)
3. Set up [Webhooks](https://developer.mastercard.com/open-banking-au/documentation/connect/webhooks/index.md) for Connect events and report notifications
4. [Get Account Owner Details](https://developer.mastercard.com/open-banking-au/documentation/products/verification-account-owner/index.md) to retrieve names and addresses
5. [Get Account Details](https://developer.mastercard.com/open-banking-au/documentation/products/account-details/index.md) to retrieve account number and BSB details
6. [Get Available Balance - Live](/documentation/products/account-balance/##get-available-balance---live) to retrieve real-time balances

### APIs Used for Payment Enablement

* [Generate Connect URL](https://developer.mastercard.com/open-banking-au/documentation/api-reference/index.md#GenerateConnectUrl)
* [Get Account Owner](https://developer.mastercard.com/open-banking-au/documentation/api-reference/index.md#GetAccountOwner)
* [Get Money Transfer Details](https://developer.mastercard.com/open-banking-au/documentation/api-reference/index.md#GetMoneyTransferDetails)
* [Get Available Balance Live](https://developer.mastercard.com/open-banking-au/documentation/api-reference/index.md#GetAvailableBalanceLive)

---

## Customer Accounts

### Understanding Accounts

Customer account records have a lot of different data points that can be used in your application. There are a few important pieces of information to note that can be used to properly identify accounts you want to use in your application, and some data points that will help you best organize account data inside your application.

### Key Account Record Fields

| Field | Description |
|-------|-------------|
| `id` | Store this unique account identifier for future account data retrieval and organization |
| `institutionId` | The id of the Financial Institution. This is useful for organizing account by Financial Institution. |
| `institutionLoginId` | This is the unique identifier for a set of accounts that are added under the set of login credentials. This is important to display accounts grouped by this identifier to give the end user the proper context to their accounts they added with their login credentials. |
| `Account Type` | This will tell you the type of account. This can be useful for determining how you will use them in the app. |

### Customer Account Operations

After a customer has added accounts, the list of accounts they have added can be retrieved, and removed using these operations.

**API Endpoints:**
- `GET /aggregation/v1/customers/{customerId}/accounts` - Get all customer accounts
- `GET /aggregation/v1/customers/{customerId}/accounts/{accountId}` - Get specific account
- `GET /aggregation/v1/customers/{customerId}/institutionLogins/{institutionLoginId}/accounts` - Get accounts by institution login
- `GET /aggregation/v1/customers/{customerId}/institutions/{institutionId}/accounts` - Get accounts by institution

---

## Applications

Applications are web or mobile applications developed by you to provide services to your customers. You must register each of your applications with Mastercard so that FIs recognise your product as being legitimate when accessing the consented accounts of your customers.

When creating a customer they must be assigned to the application. Each application has a unique set of customers.

### Registering Applications

**Note:** If your application will not be hosted in Australia, contact your Mastercard representative for advice.

To register an application for production, you must complete your contract with Sales. As the contract is concluded, you need to request application registration within Mastercard Open Banking system as well as with the Australian Competition and Consumer Commission (ACCC).

#### Required Information by Access Model

| As an **ADR** under OSP model | As a **Representative** under CDR Representative model | As a **BCDC** model customer |
|-------------------------------|------------------------------------------------------|------------------------------|
| 1. Application name<br>2. Legal entity name<br>3. Policy URL<br>4. Data complaints email address<br>5. Software ID<br>6. Organisation ID<br>7. Copyright logo<br>8. Business name<br>9. From email address<br>10. Application image | 1. Application name<br>2. Description<br>3. Application URL<br>4. Application image | 1. Application name<br>2. Description<br>3. Application URL<br>4. Application image<br>5. Disclosure type<br>6. Data handling policy URL (provided as policyUrl)<br>7. Data complaint email address |

**API Endpoint:** `POST /applications`

#### ADR Registration Example

```bash
curl --location --request POST 'https://api.openbanking.mastercard.com.au/applications' \
--header 'accept: application/json' \
--header 'App-Key: {{appKey}}' \
--header 'App-Token: {{appToken}}' \
--header 'Content-Type: application/json' \
--data-raw '{
  "appName": "{{appName}}",
  "appDescription": "{{appDescription}}",
  "image": "{{base64AppLogo}}",
  "legalEntityName": "{{legalName}}",
  "appUrl": "{{appWebsiteUrl}}",
  "policyUrl": "{{policyUrl}}",
  "dataComplaintsEmailAddress": "{{dataComplianceEmail}}",
  "copyrightLogo": "{{emailCopyrightLogo}}",
  "businessName": "{{emailCopyrightName}}",
  "fromEmail": "{{emailFrom}}",
  "replyToEmail": "{{emailReplyTo}}",
  "orgId": "{{cdrOrgId}}",
  "softwareId": "{{cdrSoftwareId}}"
}'
```

#### Representative Registration Example

```bash
curl --location --request POST 'https://api.openbanking.mastercard.com.au/applications' \
--header 'accept: application/json' \
--header 'App-Key: {{appKey}}' \
--header 'App-Token: {{appToken}}' \
--header 'Content-Type: application/json' \
--data-raw '{
  "appName": "{{legalNameOfYourOrg}}",
  "appDescription": "{{appDescription}}",
  "image": "{{base64OrgLogo}}"
}'
```

**Expected Response:**
```json
{
  "applicationId": "{{applicationId}}",
  "status": "Pending"
}
```

### Checking Application Registration Status

**API Endpoint:** `GET /applications`

```bash
curl --location --request GET 'https://api.openbanking.mastercard.com.au/applications?application_id={{applicationId}}' \
--header 'Accept: application/json' \
--header 'App-Key: {{appKey}}' \
--header 'App-Token: {{appToken}}'
```

### Checking Institution Registration

**API Endpoint:** `GET /applications/{application_id}/institutions`

```bash
curl --location --request GET 'https://api.openbanking.mastercard.com.au/applications/{{applicationId}}/institutions' \
--header 'Accept: application/json' \
--header 'App-Key: {{appKey}}' \
--header 'App-Token: {{appToken}}'
```

---

## Integrating with Connect

We provide the following SDKs to help you embed the Connect user experience anywhere you want within your applications:

* **Web Applications** --- The Connect [Web SDK](https://developer.mastercard.com/open-banking-au/documentation/connect/integrating-with-connect/web-sdk/index.md) allows you to embed the Connect user experience into an iFrame or add it into a popup window.

* **iOS Applications** --- The Connect [iOS SDK](https://developer.mastercard.com/open-banking-au/documentation/connect/integrating-with-connect/ios-sdk/index.md) is a compiled binary in XCFramework format.

* **Android Applications** --- The Connect [Android SDK](https://developer.mastercard.com/open-banking-au/documentation/connect/integrating-with-connect/android-sdk/index.md) is distributed as a compiled binary in Maven Central.

* **React Native Applications** --- The Connect [React Native SDK](https://developer.mastercard.com/open-banking-au/documentation/connect/integrating-with-connect/react-sdk/index.md) provides an easy way for cross-platform development.

### Why Use Connect SDKs

1. Using the SDKs can significantly reduce the development effort, and provides the cleanest integration.
2. The SDKs manage the OAuth re-direction for you.
3. Error messaging / event handling is built in, so you do not need to implement webhooks to receive Connect events.
4. The SDKs are compliant with any restrictions imposed by Financial Institutions.
5. The user journey when using our SDKs is correct and has been validated and tested.

### Callback Events

The SDKs provide the following events via their callback interface.

| Event | Description |
|-------|-------------|
| onLoaded | Sent when the Connect web page is loaded and ready to display. |
| onDone | Sent when the user successfully completes the Connect application. |
| onCancel | Sent when the user cancels the Connect application. |
| onError | Sent when there is an error during the Connect application. |
| onRoute | Sent when the user navigates to a new route or screen in Connect. |
| onUser | Sent when a user performs an action. User events provide visibility into what action a user could take within the Connect application. |

---

## Processing Consent Notifications

When a notification event is received, it is important to check its type and act accordingly if this is a Consent Notification event.

### Event Header Analysis

```bash
Event-Signature: {{"notification event signing key"}}
Event-Id: {{"notification event id"}}
Event-Type: {{"notification event type"}}
Event-Context: "CONSENT"

Content-Type: "application/json"
...
{{"standard HTTPS headers"}}
```

1. Check that `Event-Context` is `CONSENT`.
2. If yes, get the value of the `Event-Type` field and perform required action if any:

### Consent Notification Event Types

| Event Type | Description | Action Required |
|------------|-------------|-----------------|
| CONSENT_CREATED | This event is triggered when a customer initiates consent. At this point consent is in DRAFT state. | No action required. You may use this event for dispute resolution and troubleshooting. |
| INSTITUTIONS_ADDED | This event is triggered whenever a customer successfully consents to share accounts for a specific Financial Institution. | No action required. You may use this event to start gathering data from the shared accounts. |
| INSTITUTIONS_REVOKED | This event is triggered whenever a customer revokes arrangement to access accounts for particular institution(s). | Action is required: 1. Check the `changes` structure inside the event payload to see which institutions the revoked arrangements relate to. 2. Delete all the customer's data collected from these institutions, as well as the data derived from it. |
| INSTITUTIONS_EXPIRED | This event is triggered whenever the arrangement to access the accounts of the specific institution(s) expires. | Action is required: 1. Check the `changes` structure inside the event payload to see which institutions the expired arrangements relate to. 2. Delete all the customer's data collected from these institutions, as well as the data derived from it. |

---

## Consent Notifications Structure

All Consent Notification events have the same structure, containing three parts:

* A set of fields that identify a consent notification event.
* A description of what happened to the consent that triggered the event.
* The consent as it is at the moment after the change occurred.

### Event Structure

```json
{
  "{{fields identifying a consent notification event}}"
  "payload": {
    "changes": {
      "summary": "{{a verbal explanation of the change that happened to the consent at the moment of the event}}",
      "details": "{{a list of the changes that happened to consent per arrangement with an institution}}"
    },
    "consent": {
      "{{all details of the consent as they are at the moment after the change occurred}}"
    }
  }
}
```

### Event Identifying Fields

| Field | Description |
|-------|-------------|
| `eventId` | A webhook notification event unique number. |
| `eventType` | A webhook notification event type. Possible values: CONSENT_CREATED, INSTITUTIONS_ADDED, INSTITUTIONS_REVOKED, INSTITUTIONS_EXPIRED |
| `eventContext` | Represents the context in which the event has happened. Possible values: CONSENT, CONNECT |
| `eventTime` | A date and time when the event notification was created. The field value is in ISO 8601 format. |
| `customerId` | A Mastercard Open Banking customer ID. |

### Details of the Consent Changes

| Field | Description |
|-------|-------------|
| `changes` | Changes that actually happened to the consent at the point of time that triggered the event. |
| `summary` | Text explanation of the change that happened to the consent at the moment of the event. |
| `details` | A list of the changes to the consent. |
| `consentReceiptId` | A unique identifier of the consent given for a particular purpose. |
| `institutionId` | A Mastercard institution ID of an institution under consent affected by the change. |
| `institutionLoginId` | An institution login ID, represents a unique identifier for the authentication with the institution. |
| `accountIds` | A list of Mastercard Open Banking account IDs for each account consented under the institution. |

### Consent Fields

| Field | Description |
|-------|-------------|
| `consentReceiptId` | A unique identifier of the consent given for a particular purpose. |
| `customerId` | A Mastercard Open Banking customer ID. |
| `purpose` | A reason a customer needs to give access to their financial information. |
| `purposeStatement` | A customer-friendly explanation what the consent will be used for. |
| `statusDetails` | Details on the current status of the consent. |
| `allowedTrnxHistoryInDays` | Number of days into the past to which the consent allows to access transactions. |
| `allowedTrnxHistorySinceDate` | Date and time in the past from which consent allows to access the past transactions. |
| `createdDate` | Date and time when the consent was created. |
| `institutions` | An array of institution arrangements added to this consent. |
| `dataScopes` | Scope of the customer's data that this consent allows to access. |
| `accessPeriod` | A period of time allowed for accessing the customer's data granted by this consent. |

---

## Prevent Spoofing

We recommend that you verify the signature of the received notifications.

### Best Practices

1. Create an SHA-256 HMAC of the request body using a signing key received with a subscription response.
2. Compare it to the signature included in the `Event-Signature` header. If the two are equal then the notification is valid, otherwise, it is spoofed.
3. Store the `eventId` and ignore notifications with an ID that has already been processed to prevent replay attacks.

### Header Example

```bash
Event-Signature: "f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8"
Event-Id: "ac7e616b-8bf1-43a9-9ed4-11d9da2550c8"
Event-Type: "INSTITUTIONS_REVOKED"
Event-Context: "CONSENT"

Content-Type: "application/json"
...
{{"standard HTTPS headers"}}
```

### NodeJS Signature Verification Example

```javascript
const crypto = require('crypto');
const key = '{{signingKey}}';
router.use('/webhook-handler', (request, res) => {
  const body = request.body;
  const signature = crypto
    .createHmac('sha256', key)
    .update(JSON.stringify(body))
    .digest('hex');

  if (request.get('Event-Signature') !== signature) {
    throw new Error('Spoofing detected, rejecting event');
  }
});
```

---

## Verification of Assets (VOA)

The Verification of Assets (VOA) report includes all bank accounts for an individual customer. It retrieves up to six months of transaction history for each account type that the customer has permissioned via Connect. This report only supports deposit account types such as Transactions, Savings, Term Deposits and Investments.

### Generate VOA Report

**API Endpoint:** `POST /decisioning/v2/customers/{customerId}/voa`

### Get VOA Report

**API Endpoints:**
- `GET /decisioning/v4/consumers/{consumerId}/reports/{reportId}` - Get VOA Report by Consumer
- `GET /decisioning/v4/customers/{customerId}/reports/{reportId}` - Get VOA Report by Customer

**Note:** Get Report endpoints can both be used to obtain either JSON or PDF format reports. To specify the format required, use `application/json` or `application/pdf` for the Accept request headers.

### Refreshing Reports

If the user's consent is still active and you require an updated verification of income report, you can request a new report by using the APIs rather than re-engaging with the customer.

**Note:** Since many Financial Institutions only post transactions once per day, calling the refresh reports APIs repeatedly is not recommended.

---

## Consumers

### Consumer Records

To use reporting products, you must first create a Consumer record. Unlike a Customer record, a Consumer record cannot be deleted.

The following reporting products require a Consumer to be created for a Customer before they can be used:

* [Verification of Income](https://developer.mastercard.com/open-banking-au/documentation/products/voi/index.md)
* [Verification of Assets](https://developer.mastercard.com/open-banking-au/documentation/products/voa/index.md)

**Note:** Consumer Ids have a one-to-one relationship with a Customer Id.

### Creating a Consumer

**API Endpoint:** `POST /decisioning/v1/customers/{customerId}/consumer`

```bash
curl --location --request POST 'https://api.openbanking.mastercard.com.au/decisioning/v1/{{customerid}}/1005061234/consumer' \
--header 'Content-Type: application/json' \
--header 'Accept: application/json' \
--header 'App-Key: {{appKey}}' \
--header 'App-Token: {{appToken}}' \
--data-raw '{
  "firstName": "{{firstname}}",
  "lastName": "{{lastname}}",
  "phone": "{{phone}}"
}'
```

**Expected Response:**
```json
{
 "id": "0bf46322c167b562e6cbed9d40e19a4c",
 "createdDate": 1607450357,
 "customerId": 1005061234
}
```

### Operations for Retrieving and Managing Consumers

**API Endpoints:**
- `GET /decisioning/v1/customers/{customerId}/consumer` - Get consumer by customer ID
- `GET /decisioning/v1/consumers/{consumerId}` - Get consumer by consumer ID

---

## Transaction Aggregation

### Initial Aggregation of Accounts

After an account is added to the system an initial aggregation must be made on the account in order to retrieve transactions. When the first time aggregation occurs we retrieve the last 6 months worth of transaction data from the Financial Institution (where 6 months of data is supported from the Financial Institution).

**API Endpoint:** `POST /aggregation/v1/customers/{customerId}/institutionLogins/{institutionLoginId}/accounts`

### Retrieving Transactions

After transactions are loaded from the initial aggregation you can retrieve the transaction via the `Get Customer Transactions` call. You can also retrieve transactions by individual account.

**API Endpoints:**
- `GET /aggregation/v2/customers/{customerId}/transactions/{transactionId}` - Get specific transaction
- `GET /aggregation/v3/customers/{customerId}/transactions` - Get all customer transactions
- `GET /aggregation/v3/customers/{customerId}/accounts/{accountId}/transactions` - Get transactions by account

### Understanding Transactions

Transaction records will have a posted transaction date, amount, description or memo. Other transaction fields will be present based on the account type and based on the availability of the data point at the Financial Institution. We will also include a normalized payee and categorization data for the transaction.

### Pending Transactions

A pending transaction is a transaction that has been initiated but has not been cleared or posted by the institution. For many institutions, we are now able to capture pending transactions when they are displayed or provided in the institution's data.

Pending transactions are ephemeral. Each connection to an institution will capture pending transactions that are available at that time; if any of those transactions are not found in a subsequent connection, they will be deleted from the data.

"Pending" transactions are identified in the transaction record:

```json
"transactions": [
  {
    "id": 102122887150,
    "amount": 3678.9,
    "accountId": 1014136057,
    "customerId": 1005061234,
    "status": "pending",
    ...
  }
]
```

### Shadow Transactions

Some institutions continue to modify or delete transactions long after they are first posted to the institution's data feed. This practice can cause transactions to appear as duplicates, or to continue to appear in the data after they have disappeared from the institution's current website.

We've added the ability to identify transactions that were found in an earlier aggregation of an account, but are not found in the institution's current data source. These shadow transactions are identified in the transaction record:

```json
"transactions": [
  {
    "id": 102122887150,
    "amount": 3678.9,
    "accountId": 1014136057,
    "customerId": 1005061234,
    "status": "shadow",
    ...
  }
]
```

---

## Verification of Income (VOI)

### Overview

The Verification of Income (VOI) report analyzes both active and inactive income streams. It retrieves up to 12 months of validated banking data for an individual customer based on the accounts that they have permission to access. This report only supports deposit account types such as Transactions, Savings, and Term Deposits.

### Participants and Interactions

| Participant | Description | Example |
|-------------|-------------|---------|
| Customer | Customers are end users granting Mastercard Open Banking access to their financial accounts. Customers go through the Connect process to connect to their Financial Institutions and grant consent to sharing their account data. | Bank account holder |
| Data Holder | A financial institution or authorized deposit-taking institution (ADI) that holds customer data and is required to transfer this data to an accredited data recipient at the customer's request | Retail banks |
| Business Partner (Integrator) | An entity involved in the Verification of Income process, which could be either an Accredited Data Recipient (ADR) or a CDR Representative. The integrator uses customer data to provide products or services to the customer, in compliance with CDR regulations. | Financial institutions, financing and lending companies, technology service providers, data aggregators |
| Mastercard Platform | Serves as an integration point for integrators to offer Verification of income service. | Mastercard |

### How VOI Works

1. The business partner subscribes to consent notifications.
2. The business partner creates a customer record.
3. The business partner creates a consumer record.
4. The customer applies for a loan.
5. The Connect URL is presented to the customer who can use it to authorize access to their account.
6. The customer links accounts using Connect URL.
7. The business partner requests a Verification of Income Report.
8. The business partner receives an `inProgress` webhook.
9. The business partner receives a `done` webhook.
10. The business partner retrieves a Verification of Income Report.

### VOI API Endpoints

**Generate VOI Report:** `POST /decisioning/customers/{customerId}/voi`

**Get VOI Report:**
- `GET /decisioning/v4/consumers/{consumerId}/reports/{reportId}` - Get by Consumer
- `GET /decisioning/v4/customers/{customerId}/reports/{reportId}` - Get by Customer

**Note:** The `PDF` format is not yet currently supported for VOI reports. Reports are formatted in `JSON`. To specify the format required, use `application/json` for the Accept request headers.

### Refreshing VOI Reports

If the user's consent is still active and you require an updated verification of income report, you can request a new report by using the APIs rather than re-engaging with the customer.

**Note:** Since many Financial Institutions only post transactions once per day, calling the refresh reports APIs repeatedly is not recommended.

### Reading a Verification of Income Report

The Verification of Income JSON report is a consolidated summary of information about the income streams that have been identified from the accounts that the customer has shared. Within the report, we provide a summary of key information at both the customer level, and at the account level for each account.

### Verification of Income Attributes

| Attribute | Definition | Type |
|-----------|------------|------|
| NET_INCOME | This is an umbrella attribute that sums: PAYCHECK_INCOME NON_PAYCHECK_INCOME | Transactional |
| PAYCHECK_INCOME | Paycheck income is a regular income from an employer to employee. | Transactional |
| NON_PAYCHECK_INCOME | This is an umbrella group that sums: BONUS_INCOME CASH_AND_CHECK_DEPOSIT_INCOME CHILD_SUPPORT_INCOME DIVIDEND_INCOME GOVERNMENT_BENEFIT_INCOME (Group) DISABILITY_BENEFIT_INCOME OTHER_GOVERNMENT_BENEFIT_INCOME SOCIAL_SECURITY_BENEFIT_INCOME UNEMPLOYMENT_BENEFIT_INCOME INTEREST_INCOME INVESTMENT_INCOME OTHER_INCOME RESIDENTIAL_RENTAL_INCOME SELF_EMPLOYMENT_INCOME | Transactional |
| BONUS_INCOME | Bonus Income is a non-paycheck income that a customer receives from its employer as a separate transaction from regular paycheck transactions. | Transactional |
| SELF_EMPLOYMENT_INCOME | Self-employment income is a non-paycheck income that a customer receives for doing work that is not mutually exclusive to one employer. | Transactional |
| CHILD_SUPPORT_INCOME | Child support income is any money that a customer received by one parent as part of a custody arrangement with the other parent. | Transactional |
| CASH_AND_CHECK_DEPOSIT_INCOME | Cash and Check deposit is an income that is deposited to a customer's bank account in the form of a cash or a check deposit. | Transactional |
| RESIDENTIAL_RENTAL_INCOME | Residential rent income refers to any payment received for the use or occupation of a residential property | Transactional |
| RETIREMENT_INCOME | Retirement income is a superannuation income received from investment sources. | Transactional |
| DIVIDEND_INCOME | Dividend income is received as a stock shareholder's right for owning equity in a publicly traded company. | Transactional |
| INTEREST_INCOME | Interest income is a form of passive income received from a financial asset. | Transactional |
| GOVERNMENT_BENEFIT_INCOME | Government benefit income is a GROUPING of four types of identifiable income received by the customer as part of a government benefit program. | Transactional |
| DISABILITY_BENEFIT_INCOME | Disability income is a government benefit income received by customers with disabilities preventing them from working a normal job. | Transactional |
| UNEMPLOYMENT_BENEFIT_INCOME | Unemployment income is a government benefit income received by an unemployed person that is without work but meets some minimum criteria to be eligible for the benefit. | Transactional |
| SOCIAL_SECURITY_BENEFIT_INCOME | Social Security income is a pension from a government entity. | Transactional |
| OTHER_GOVERNMENT_BENEFIT_INCOME | Other Government Benefit Income is a government benefit provided outside of Disability income, Unemployment income, and Social Security income categories. | Transactional |
| OTHER_INCOME | OTHER_INCOME is any income that does not also fall into the "Paycheck Income" or any other "Non-Paycheck Income" categories. | Transactional |

### Time Interval Types

When assessing income the choice of time interval type in a report impacts how income patterns are presented and understood. A report currently supports up to two time interval types. If a partner requests for more than two interval types, the end point gives the error: `More than 2 intervalTypes passed request.` If the time interval type is not specified, the default is MONTHLY_CALENDAR.

| Time Interval Type | Description | First (Earliest) period may be partial | First (Most recent) period may be partial | Shortest possible period length | Longest possible period length |
|-------------------|-------------|----------------------------------------|-------------------------------------------|---------------------------------|--------------------------------|
| DAILY | The report will be broken up into one period for every calendar date in the report time period. | NO | NO | 1 | 1 |
| WEEKLY_CALENDAR | The report time period will be broken up into periods of seven calendar dates, with each period beginning on a Monday and ending on a Sunday, with the exception of the first and last periods which may be partial. | YES | YES | 1 | 7 |
| WEEKLY_ROLLING_7 | The report time period will be broken up into periods of seven calendar dates, counting backwards from the report end date. | YES | NO | 1 | 7 |
| BI_WEEKLY_CALENDAR | The report time period will be broken up into periods of 14 calendar dates, with each period beginning on a Monday and ending on the second subsequent Sunday, with the exception of the first and last periods which may be partial. | YES | YES | 1 | 14 |
| BI_WEEKLY_ROLLING_14 | The report time period will be broken up into periods of 14 calendar dates, counting backwards from the report end date. | YES | NO | 1 | 14 |
| SEMI_MONTHLY_CALENDAR | The report time period will be broken up into exactly two periods per calendar month, where both the first and the last period may be partial, and periods will alternate between representing the 1st:15th of the month and the 16th: end of the month. | YES | YES | 1 | 16 |
| MONTHLY_CALENDAR | The report time period will be broken up into one period per calendar month. | YES | YES | 1 | 31 |
| MONTHLY_ROLLING_30 | The report time period will be broken up into 11 periods of 30 calendar dates followed by one period of 35 (or 36 for leap years) calendar dates to make one full calendar year, starting backwards from the report end date. | YES | NO | 1 | 36 |
| QUARTERLY_CALENDAR | The report time period will be broken up into one period per three calendar months, where both the first and last period may be partial. | YES | YES | 1 | 92 |
| QUARTERLY_ROLLING_90 | The report time period will be broken up into three periods of 90 calendar dates followed by one period of 95 (or 96 for leap years) calendar dates to make one full calendar year, starting backwards from the report end date. | YES | NO | 1 | 96 |
| ANNUALLY | The report time period will be broken up into periods of 365 calendar dates (or 366 for leap years), starting backwards from the report end date. | YES | NO | 1 | 366 |
| HISTORICALLY | The report time period will be represented by exactly one period. | NO | NO | 1 | Duration of report data |

### JSON Report Structure - Analytics Section

Analytics will be provided at the account level, grouped by financial institution and at an aggregated customer level, similar to other lend and OBB products.

The analytics section is divided into three sections:
* Transactional attributes
* State attributes
* Streams

#### Account-level Analytics Structure

```json
"analytics": {
    "transactionalAttributes": [...],
    "stateAttributes": [...],
    "streams": [...]
}
```

#### Customer-level Analytics Structure

```json
"customerAnalytics": {
    "transactionalAttributes": [...],
    "stateAttributes": [...],
    "streams": [...]
}
```

#### Transactional Attributes

Transactional attributes are based on a unit of data being a transaction itself. They are evaluated as events in time. A transactional attribute represents some classification or categorization of a customer's underlying transactions.

**Note:** NET_INCOME will have aggregated data of PAYCHECK_INCOME and NON_PAYCHECK_INCOME. NON_PAYCHECK_INCOME will have aggregated data of CASH_AND_CHECK_DEPOSIT and RETIREMENT_INCOME.

##### Example 1: Basic Transactional Attributes

```json
"transactionalAttributes": [
    {
        "aggregatedByTimePeriods": [
            {
                "periods": [
                    {
                        "count": 5,
                        "endDate": "2024-12-31",
                        "max": 204.83,
                        "mean": 122.387463874,
                        "median": 138.5,
                        "min": 95.0,
                        "standardDeviation": 47.3029610588298,
                        "startDate": "2024-12-01",
                        "sum": 596.47,
                        "comparedToCohorts": []
                    }
                ],
                "timeIntervalType": "MONTHLY_CALENDAR",
                "cohortBenchmarkPeriods": [
                    {
                        "startDate": "2024-12-01",
                        "endDate": "2024-12-31",
                        "cohortValues": []
                    }
                ]
            }
        ],
        "attributeName": "NET_INCOME",
        "streamIds": [
            "50fc5a76-158d-488d-b6a3-1c288fb0a0e5",
            "f152bd96-7dbd-4156-bd48-d687a5d0bc32"
        ],
        "transactionIds": [
            "496744160",
            "496744258",
            "496744263",
            "496744362",
            "496744416",
            "496744420",
            "496744153",
            "496744154",
            "496744155",
            "496744156",
            "496744157",
            "496744158",
            "496744159",
            "496744161",
            "496744162",
            "496744163",
            "496744164",
            "496744165",
            "496744166",
            "496744167",
            "496744168",
            "496744169",
            "496744170",
            "496744171",
            "496744172",
            "496744173",
            "496744174",
            "496744175",
            "496744176",
            "496744177"
        ],
        "projectedValues": [],
        "streamConfidences": [
            {
                "streamId": "f152bd96-7dbd-4156-bd48-d687a5d0bc32",
                "confidence": "100.0"
            },
            {
                "streamId": "50fc5a76-158d-488d-b6a3-1c288fb0a0e5",
                "confidence": "100.0"
            }
        ]
    }
]
```

##### Example 2: Multiple Time Intervals

```json
"transactionalAttributes": [
    {
        "aggregatedByTimePeriods": [
            {
                "periods": [
                    {
                        "count": 5,
                        "endDate": "2024-12-31",
                        "max": 204.83,
                        "mean": 122.387463874,
                        "median": 138.5,
                        "min": 95.0,
                        "standardDeviation": 21.3029610588298,
                        "startDate": "2024-12-01",
                        "sum": 596.47,
                        "comparedToCohorts": []
                    }
                ],
                "timeIntervalType": "MONTHLY_CALENDAR",
                "cohortBenchmarkPeriods": [
                    {
                        "startDate": "2024-12-01",
                        "endDate": "2024-12-31",
                        "cohortValues": []
                    }
                ]
            },
            {
                "periods": [
                    {
                        "count": 30,
                        "endDate": "2024-12-31",
                        "max": 310.0,
                        "mean": 222.73333333333332,
                        "median": 201.5,
                        "min": 90.0,
                        "standardDeviation": 37.378473338,
                        "startDate": "2024-12-01",
                        "sum": 6682.0,
                        "comparedToCohorts": []
                    }
                ],
                "timeIntervalType": "ANNUALLY",
                "cohortBenchmarkPeriods": [
                    {
                        "startDate": "2024-03-05",
                        "endDate": "2025-03-04",
                        "cohortValues": []
                    }
                ]
            }
        ],
        "attributeName": "NON_PAYCHECK_INCOME",
        "streamIds": [
            "50fc5a76-158d-488d-b6a3-1c288fb0a0e5",
            "f152bd96-7dbd-4156-bd48-d687a5d0bc32"
        ],
        "transactionIds": [
            "496744160",
            "496744258",
            "496744263",
            "496744362",
            "496744416",
            "496744420",
            "496744153",
            "496744154",
            "496744155",
            "496744156",
            "496744157",
            "496744158",
            "496744159",
            "496744161",
            "496744162",
            "496744163",
            "496744164",
            "496744165",
            "496744166",
            "496744167",
            "496744168",
            "496744169",
            "496744170",
            "496744171",
            "496744172",
            "496744173",
            "496744174",
            "496744175",
            "496744176",
            "496744177"
        ],
        "projectedValues": [],
        "streamConfidences": [
            {
                "streamId": "f152bd96-7dbd-4156-bd48-d687a5d0bc32",
                "confidence": "100.0"
            },
            {
                "streamId": "50fc5a76-158d-488d-b6a3-1c288fb0a0e5",
                "confidence": "100.0"
            }
        ]
    }
]
```

##### Example 3: Complex Income Structure

```json
"transactionalAttributes": [
    {
        "aggregatedByTimePeriods": [
            {
                "periods": [
                    {
                        "count": 10,
                        "endDate": "2024-12-31",
                        "max": 1275.0,
                        "mean": 614.8840425531914,
                        "median": 610.0,
                        "min": 95.0,
                        "standardDeviation": 750.7685752999345,
                        "startDate": "2024-12-01",
                        "sum": 6127.47,
                        "comparedToCohorts": []
                    }
                ],
                "timeIntervalType": "MONTHLY_CALENDAR",
                "cohortBenchmarkPeriods": [
                    {
                        "startDate": "2024-12-01",
                        "endDate": "2024-12-31",
                        "cohortValues": []
                    }
                ]
            },
            {
                "periods": [
                    {
                        "count": 63,
                        "endDate": "2025-03-04",
                        "max": 6993.0,
                        "mean": 647.62820512820514,
                        "median": 997.5,
                        "min": 90.0,
                        "standardDeviation": 847.02134191044195,
                        "startDate": "2024-03-05",
                        "sum": 42092.0,
                        "comparedToCohorts": []
                    }
                ],
                "timeIntervalType": "ANNUALLY",
                "cohortBenchmarkPeriods": [
                    {
                        "startDate": "2024-03-05",
                        "endDate": "2025-03-04",
                        "cohortValues": []
                    }
                ]
            }
        ],
        "attributeName": "NET_INCOME",
        "streamIds": [
            "50fc5a76-158d-488d-b6a3-1c288fb0a0e5",
            "f152bd96-7dbd-4156-bd48-d687a5d0bc32",
            "8260ef2c-fb5c-48e1-ad2d-5a0d6df5e938",
            "f04457a6-c745-4859-95cd-e1abfc42aecd"
        ],
        "transactionIds": [
            "496744160",
            "496744258",
            "496744263",
            "496744362",
            "496744416",
            "496744420",
            "496744153",
            "496744154",
            "496744155",
            "496744156",
            "496744157",
            "496744158",
            "496744159",
            "496744161",
            "496744162",
            "496744163",
            "496744164",
            "496744165",
            "496744166",
            "496744167",
            "496744168",
            "496744169",
            "496744170",
            "496744171",
            "496744172",
            "496744173",
            "496744174",
            "496744175",
            "496744176",
            "496744177",
            "496743799",
            "496743810",
            "496743812",
            "496743814",
            "496743816",
            "496743817",
            "496743818",
            "496743819",
            "496743820",
            "496743821",
            "496743822",
            "496743823",
            "496743824",
            "496743825",
            "496743826",
            "496743827",
            "496743828",
            "496743829",
            "496743830",
            "496743831",
            "496743832",
            "496743833",
            "496743834",
            "496743835",
            "496743836",
            "496743837",
            "496743838",
            "496743839",
            "496743740",
            "496743741",
            "496743742",
            "496743743",
            "496743744"
        ],
        "projectedValues": [],
        "streamConfidences": [
            {
                "streamId": "50fc5a76-158d-488d-b6a3-1c288fb0a0e5",
                "confidence": "100.0"
            },
            {
                "streamId": "f152bd96-7dbd-4156-bd48-d687a5d0bc32",
                "confidence": "100.0"
            },
            {
                "streamId": "8260ef2c-fb5c-48e1-ad2d-5a0d6df5e938",
                "confidence": "100.0"
            },
            {
                "streamId": "f04457a6-c745-4859-95cd-e1abfc42aecd",
                "confidence": "100.0"
            }
        ]
    }
]
```

##### JSON Field Descriptions

| Key (Datatype) | Description | Applicable for VOI |
|----------------|-------------|-------------------|
| aggregatedByTimePeriods (object) | An object that contains periods object data, comparedToCohorts object data, and time interval type. | Yes |
| periods (object) | Statistics of aggregated transactions over some time period. | Yes |
| count (number) | For the selected time interval type, the number of transaction events that occurred during the period. For example, for monthly time interval, count will be shown for each month of a year. | Yes |
| endDate (string) | For the selected time interval type, the final day (inclusive) of the period being reported. For example, for monthly time interval, endDate will be shown for each month of a year. | Yes |
| max (number) | For the selected time interval type, the maximum value of all transaction amounts in the period. For example, for monthly time interval, max will be shown for each month of a year. | Yes |
| mean (number) | For the selected time interval type, the mean value of all transaction amounts in the period. For example, for monthly time interval, mean will be shown for each month of a year. | Yes |
| median (number) | For the selected time interval type, the median value of all transaction amounts in the period. For example, for monthly time interval, median will be shown for each month of a year. | Yes |
| min (number) | For the selected time interval type, the minimum value of all transaction amounts in the period. For example, for monthly time interval, min will be shown for each month of a year. | Yes |
| standardDeviation (number) | For the selected time interval type, the standard deviation of all transaction amounts in the period. For example, for monthly time interval, standardDeviation will be shown for each month of a year. | Yes |
| startDate (string) | For the selected time interval type, the first day (inclusive) of the period being reported. For example, for monthly time interval, startDate will be shown for each month of a year. | Yes |
| sum (number) | For the selected time interval type, the arithmetic sum of the amounts of all transactions in the period. For example, for monthly time interval, sum will be shown for each month of a year. | Yes |
| comparedToCohorts (object) | An array of elements comparing the customer's income/ spending during this period to the average customer's income/ spending in various cohorts, such as postal code. This field will be empty as it is not applicable for VOI AUS. | No |
| cohortType (string) | Describes the type of cohort being compared to for this period, for example POSTAL_CODE. This field will be empty as it is not applicable for VOI AUS. | No |
| totalDifferenceToCohort (number) | Reflects the difference between the customer's income/ spending value for the period minus that of the average income/ spending in this cohort. This field will be empty as it is not applicable for VOI AUS. | No |
| percentageDifferenceToCohort (number) | Reflects the percentage difference between the customer's income/ spending value for the period and the average income/ spending of the cohort. This field will be empty as it is not applicable for VOI AUS. | No |
| timeIntervalType (string) | See Time Interval Types for how each period is defined. | Yes |
| cohortBenchmarkPeriods (object) | A list of objects where each object is a period of the same duration as those in aggregatedByTimePeriods, describing the income/ spending of cohorts in the customer's zip code during that period for an attribute. | No |
| startDate (string) | The first day of the cohort benchmark period. | No |
| endDate (string) | The final day of the cohort benchmark period. | No |
| cohortValues (object) | An object that contains the type and value of a cohort benchmark period. This field will be empty as it is not applicable for VOI AUS. | No |
| cohortType (string) | For each cohort benchmark period, the type of cohort we have a representative metric for, for example POSTAL_CODE. This field will be empty as it is not applicable for VOI AUS. | No |
| value (number) | For each cohort benchmark period, the average income/ spending for the cohort during this time period. This field will be empty as it is not applicable for VOI AUS. | No |
| attributeName (string) | Name of the attribute that we are reporting the numbers for. | Yes |
| streamIds | List of stream IDs associated with the attribute. | Yes |
| transactionIds(object) | List of transaction IDs associated with the attribute. | Yes |
| projectedValues (object) | List of projection objects, where each object indicates the projected income/ spending value of the attribute over some coming period of time. This field will be empty as it is not applicable for VOI AUS. | No |
| timeUnit (string) | The unit of time being described, for example MONTHS. This field will be empty as it is not applicable for VOI AUS. | No |
| timeValue (number) | The number of timeUnit units for which we are projecting, for example 12 (for 12 months). This field will be empty as it is not applicable for VOI AUS. | No |
| projectionValue (number) | The predicted sum value of the attribute over the coming timeValue number of timeUnits. This field will be empty as it is not applicable for VOI AUS. | No |
| streamConfidences (object) | List of stream confidences, indicating the confidence in which we believe each stream is correctly associated with this attribute. | Yes |
| streamId (string) | The stream ID we are reporting the confidence for. | Yes |
| confidence (number) | A float value between 0 and 100. | Yes |

---

#### Streams {#streams}

Streams are groups of transactions that represent a repeated flow of funds for some consistent purpose between two parties (or accounts, if the same entity owns both the source and destination of funds). Examples of streams include: bi-weekly paychecks from an employer to an employee, a customer's monthly phone bill paid to a telecom provider, a customer's monthly transfer from a checking account to an investment account, and so on. Since a stream is a group of transactions, a transactional attribute can assign a list of streams to itself if the transactions in that stream all fit the same classification being described by the attribute.

##### Example 1: Basic Stream Structure

```json
"streams": [
    {
        "cadence": 14,
        "id": "50fc5a76-158d-488d-b6a3-1c288fb0a0e5",
        "payee": "Mr Howard Major Carter",
        "payor": "bnpl",
        "recency": 66,
        "earliestObservedDate": "2024-03-09T00:00:00",
        "latestObservedDate": "2024-12-28T00:00:00",
        "count": 6,
        "sum": 958.0,
        "status": "inactive",
        "min": 49.0,
        "max": 705.0,
        "mean": 159.666666666,
        "median": 50.0,
        "standardDeviation": 150.05693724578154,
        "minimumCadence": 0,
        "maximumCadence": 42,
        "medianCadence": 8,
        "modeCadence": 7,
        "standardDeviationCadence": 267.1671137446873,
        "transactionIds": [
            "496744160",
            "496744258",
            "496744263",
            "496744362",
            "496744416",
            "496744420"
        ]
    },
    {
        "cadence": 1,
        "id": "f152bd96-7dbd-4156-bd48-d687a5d0bc32",
        "payee": "Mr Howard Major Carter",
        "payor": "unrecognized entity",
        "recency": 51,
        "earliestObservedDate": "2024-03-06T00:00:00",
        "latestObservedDate": "2025-01-12T00:00:00",
        "count": 24,
        "sum": 5724.0,
        "status": "inactive",
        "min": 6.0,
        "max": 3326.0,
        "mean": 238.5,
        "median": 89.5,
        "standardDeviation": 665.4514649273176,
        "minimumCadence": 0,
        "maximumCadence": 6,
        "medianCadence": 0,
        "modeCadence": 0,
        "standardDeviationCadence": 1.3563402407265193,
        "transactionIds": [
            "496744153",
            "496744154",
            "496744155",
            "496744156",
            "496744157",
            "496744158",
            "496744159",
            "496744161",
            "496744162",
            "496744163",
            "496744164",
            "496744165",
            "496744166",
            "496744167",
            "496744168",
            "496744169",
            "496744170",
            "496744171",
            "496744172",
            "496744173",
            "496744174",
            "496744175",
            "496744176",
            "496744177"
        ]
    }
]
```

##### Example 2: Multiple Stream Types

```json
"streams": [
    {
        "cadence": 2,
        "id": "8260ef2c-fb5c-48e1-ad2d-5a0d6df5e938",
        "payee": "Mr Howard Major Carter",
        "payor": "uber",
        "recency": 53,
        "earliestObservedDate": "2024-03-05T00:00:00",
        "latestObservedDate": "2025-01-10T00:00:00",
        "count": 5,
        "sum": 33326.0,
        "status": "inactive",
        "min": 207.0,
        "max": 1747.0,
        "mean": 1209.5,
        "median": 1404.0,
        "standardDeviation": 604.2294266253507,
        "minimumCadence": 0,
        "maximumCadence": 8,
        "medianCadence": 1,
        "modeCadence": 1,
        "standardDeviationCadence": 2.068617626733007,
        "transactionIds": [
            "496743740",
            "496743741",
            "496743742",
            "496743743",
            "496743744"
        ]
    },
    {
        "cadence": 1,
        "id": "f04457a6-c745-4859-95cd-e1abfc42aecd",
        "payee": "Mr Howard Major Carter",
        "payor": "unrecognized entity",
        "recency": 49,
        "earliestObservedDate": "2024-03-06T00:00:00",
        "latestObservedDate": "2025-01-14T00:00:00",
        "count": 28,
        "sum": 29364.0,
        "status": "inactive",
        "min": 57.0,
        "max": 6993.0,
        "mean": 1048.7142857142858,
        "median": 754.5,
        "standardDeviation": 1334.369621099898,
        "minimumCadence": 0,
        "maximumCadence": 4,
        "medianCadence": 1,
        "modeCadence": 1,
        "standardDeviationCadence": 0.644018570940247,
        "transactionIds": [
            "496743799",
            "496743810",
            "496743812",
            "496743814",
            "496743816",
            "496743817",
            "496743818",
            "496743819",
            "496743820",
            "496743821",
            "496743822",
            "496743823",
            "496743824",
            "496743825",
            "496743826",
            "496743827",
            "496743828",
            "496743829",
            "496743830",
            "496743831",
            "496743832",
            "496743833",
            "496743834",
            "496743835",
            "496743836",
            "496743837",
            "496743838",
            "496743839"
        ]
    }
]
```

##### Example 3: Complex Stream Structure

```json
"streams": [
    {
        "cadence": 14,
        "id": "50fc5a76-158d-488d-b6a3-1c288fb0a0e5",
        "payee": "Mr Howard Major Carter",
        "payor": "bnpl",
        "recency": 66,
        "earliestObservedDate": "2024-03-09T00:00:00",
        "latestObservedDate": "2024-12-28T00:00:00",
        "count": 6,
        "sum": 958.0,
        "status": "inactive",
        "min": 49.0,
        "max": 705.0,
        "mean": 159.666666666,
        "median": 50.0,
        "standardDeviation": 150.05693724578154,
        "minimumCadence": 0,
        "maximumCadence": 42,
        "medianCadence": 8,
        "modeCadence": 7,
        "standardDeviationCadence": 267.1671137446873,
        "transactionIds": [
            "496744160",
            "496744258",
            "496744263",
            "496744362",
            "496744416",
            "496744420"
        ]
    },
    {
        "cadence": 1,
        "id": "f152bd96-7dbd-4156-bd48-d687a5d0bc32",
        "payee": "Mr Howard Major Carter",
        "payor": "unrecognized entity",
        "recency": 51,
        "earliestObservedDate": "2024-03-06T00:00:00",
        "latestObservedDate": "2025-01-12T00:00:00",
        "count": 24,
        "sum": 5724.0,
        "status": "inactive",
        "min": 6.0,
        "max": 3326.0,
        "mean": 238.5,
        "median": 89.5,
        "standardDeviation": 665.4514649273176,
        "minimumCadence": 0,
        "maximumCadence": 6,
        "medianCadence": 0,
        "modeCadence": 0,
        "standardDeviationCadence": 1.3563402407265193,
        "transactionIds": [
            "496744153",
            "496744154",
            "496744155",
            "496744156",
            "496744157",
            "496744158",
            "496744159",
            "496744161",
            "496744162",
            "496744163",
            "496744164",
            "496744165",
            "496744166",
            "496744167",
            "496744168",
            "496744169",
            "496744170",
            "496744171",
            "496744172",
            "496744173",
            "496744174",
            "496744175",
            "496744176",
            "496744177"
        ]
    },
    {
        "cadence": 2,
        "id": "8260ef2c-fb5c-48e1-ad2d-5a0d6df5e938",
        "payee": "Mr Howard Major Carter",
        "payor": "uber",
        "recency": 53,
        "earliestObservedDate": "2024-03-05T00:00:00",
        "latestObservedDate": "2025-01-10T00:00:00",
        "count": 5,
        "sum": 33326.0,
        "status": "inactive",
        "min": 207.0,
        "max": 1747.0,
        "mean": 1209.5,
        "median": 1404.0,
        "standardDeviation": 604.2294266253507,
        "minimumCadence": 0,
        "maximumCadence": 8,
        "medianCadence": 1,
        "modeCadence": 1,
        "standardDeviationCadence": 2.068617626733007,
        "transactionIds": [
            "496743740",
            "496743741",
            "496743742",
            "496743743",
            "496743744"
        ]
    },
    {
        "cadence": 1,
        "id": "f04457a6-c745-4859-95cd-e1abfc42aecd",
        "payee": "Mr Howard Major Carter",
        "payor": "unrecognized entity",
        "recency": 49,
        "earliestObservedDate": "2024-03-06T00:00:00",
        "latestObservedDate": "2025-01-14T00:00:00",
        "count": 28,
        "sum": 29364.0,
        "status": "inactive",
        "min": 57.0,
        "max": 6993.0,
        "mean": 1048.7142857142858,
        "median": 754.5,
        "standardDeviation": 1334.369621099898,
        "minimumCadence": 0,
        "maximumCadence": 4,
        "medianCadence": 1,
        "modeCadence": 1,
        "standardDeviationCadence": 0.644018570940247,
        "transactionIds": [
            "496743799",
            "496743810",
            "496743812",
            "496743814",
            "496743816",
            "496743817",
            "496743818",
            "496743819",
            "496743820",
            "496743821",
            "496743822",
            "496743823",
            "496743824",
            "496743825",
            "496743826",
            "496743827",
            "496743828",
            "496743829",
            "496743830",
            "496743831",
            "496743832",
            "496743833",
            "496743834",
            "496743835",
            "496743836",
            "496743837",
            "496743838",
            "496743839"
        ]
    }
]
```

##### Stream Field Descriptions

| Field | Description |
|-------|-------------|
| cadence | The typical number of days between transactions in this stream |
| id | Unique identifier for the stream |
| payee | The recipient of the funds (usually the customer) |
| payor | The source of the funds (employer, service provider, etc.) |
| recency | Number of days since the last transaction in this stream |
| earliestObservedDate | Date of the first transaction in this stream |
| latestObservedDate | Date of the most recent transaction in this stream |
| count | Total number of transactions in this stream |
| sum | Total amount of all transactions in this stream |
| status | Current status of the stream (active/inactive) |
| min | Minimum transaction amount in this stream |
| max | Maximum transaction amount in this stream |
| mean | Average transaction amount in this stream |
| median | Median transaction amount in this stream |
| standardDeviation | Standard deviation of transaction amounts |
| minimumCadence | Shortest interval between transactions |
| maximumCadence | Longest interval between transactions |
| medianCadence | Median interval between transactions |
| modeCadence | Most common interval between transactions |
| standardDeviationCadence | Standard deviation of intervals between transactions |
| transactionIds | List of transaction IDs that belong to this stream |

---

## JSON Field Descriptions

| Key (Datatype) | Description |
|----------------|-------------|
| cadence (number) | The average number of days elapsed between consecutive transactions in the stream. |
| id (string) | A randomly generated UUID to uniquely identify the stream. |
| payee (string) | The party that is receiving the funds. |
| payor (string) | The party that is sending the funds. |
| recency (number) | The number of days elapsed since the most recent transaction in the stream. |
| earliestObservedDate (string) | The date-time of the first observed transaction in the stream. |
| latestObservedDate (string) | The date-time of the last observed transaction in the stream. |
| status (string) | Active or inactive, depending on if the duration since the last transaction in the stream exceeds the historically observed cadence. |
| minimumCadence (number) | The smallest observed duration of time elapsed between any two consecutive transactions in the stream. |
| maximumCadence (number) | The largest observed duration of time elapsed between any two consecutive transactions in the stream. |
| medianCadence (number) | The median number of days elapsed between consecutive transactions in the stream. |
| modeCadence (number) | The most frequently observed number of days elapsed between consecutive transactions in the stream. |
| standardDeviationCadence (number) | The standard deviation of the number of days elapsed between consecutive transactions in the stream. |
| transactionIds (object) | A list of all the transaction IDs that were assigned to the stream. |

<br />

## Resources

* See how you can set up [Report Webhooks](https://developer.mastercard.com/open-banking-au/documentation/connect/webhooks/index.md#report-webhooks) to receive notifications about the progress of reports.

* See [Connect Events List](https://developer.mastercard.com/open-banking-au/documentation/connect/webhooks/webhooks-event-connect/index.md) and [Reports Events List](https://developer.mastercard.com/open-banking-au/documentation/connect/webhooks/webhooks-event-report/index.md) complete lists of events that you can retrieve via webhooks from both the Open Banking Connect application, and from the report generation endpoints.

---

# Authentication
source: https://developer.mastercard.com/open-banking-au/documentation/access-and-config/auth/index.md

## Authentication {#authentication}

Note: You will already be familiar with partner authentication if you followed the [Quick Start Guide](https://developer.mastercard.com/open-banking-au/documentation/quick-start-guide/index.md).

All requests sent to Mastercard Open Banking must include a `App-Token` HTTP header. Use the following endpoint whenever you need to generate a new access token:

API Reference: `POST /aggregation/v2/partners/authentication`

```sh
curl --location --request POST 'https://api.openbanking.mastercard.com.au/aggregation/v2/partners/authentication' \
--header 'Content-Type: application/json' \
--header 'App-Key: {{appKey}}' \
--header 'Accept: application/json' \
--data-raw '{
    "partnerId": "{{partnerId}}",
    "partnerSecret": "{{partnerSecret}}"
}'
```

* Expected response:

```json
{
  "token": "YBh22Sb9Es6e66Q7lWdt"
}
```

## Next Steps {#next-steps}

* Refer to [Applications](https://developer.mastercard.com/open-banking-au/documentation/access-and-config/applications/index.md) to register your application with the Mastercard and therefore kick off a software registration with ACCC.
* Refer to [Customers](https://developer.mastercard.com/open-banking-au/documentation/access-and-config/customers/index.md) to learn about creating a customer record for accessing data from Financial Institutions.

---

# Account Details
source: https://developer.mastercard.com/open-banking-au/documentation/products/account-details/index.md

Tip: Accessing user data (account data, transactions, reports, etc.) requires user consent. For more about consent please check the [consent](https://developer.mastercard.com/open-banking-au/documentation/consent/index.md) page. Note: Before calling any Account endpoints you should verify they support the service by checking our [Certified Institutions](https://developer.mastercard.com/open-banking-au/documentation/financial-institutions/index.md#certified-institutions) list.

Retrieve a customer's account details for Account Opening or Money Transfer Verification (MTV) to initiate payment. Use the `customerId` and the `accountId` parameters to specify the customer's account.

API Reference: `GET /aggregation/v3/customers/{customerId}/accounts/{accountId}/details`

A successful response will have the following form:
* JSON

```JSON
"paymentInstructions":
[
  {
    "type": "moneyTransfer",
    "accountNumber": "002343534556",
    "descriptors":
    [
      {
        "type": "bsbNumber",
        "value": "033-547"
      }
    ]
  }
]
```

The `bsbNumber` is required for money transfer and consists of three distinct parts in the format: XXY-ZZZ, where:

* XX = The parent Financial Institution
* Y = The state where the branch is located
* ZZZ = The branch location

---

# Account History
source: https://developer.mastercard.com/open-banking-au/documentation/products/account-history/index.md

Tip: Accessing user data (account data, transactions, reports, etc.) requires user consent. For more about consent please check the [consent](https://developer.mastercard.com/open-banking-au/documentation/consent/index.md) page.

Account history is a service that aggregates the last 12 months of transactions for the account or accounts under the `institutionLoginId` specified. That data can then be retrieved with the endpoints for transaction retrieval. This service is billed on a customer level. If any aggregation of load historic transactions is run for the month for any accounts successfully that customer record will be billed at the premium price for this service for that month.

### Overview {#overview}

This is a premium service. The billable event is a call to this service specifying a `customerId` that has not been used before with this service.

The recommended timeout setting for this request is `180 seconds` in order to receive a response. However, you can terminate the connection after making the call and the operation will still complete. You will have to pull the account records to check for an updated aggregation attempt date to know when the refresh is complete.

The date range sent to the institution is calculated from the account's `createdDate`. This means that calling this service a second time for the same account normally will not add any new transactions for the account. For this reason, a second call to this service for a known accountId will usually return with `HTTP 204`. In a few specific scenarios, it may be desirable to attempt a second call. Some examples are:

* The institution's policy has changed, making more transactions available.
* We added a longer transaction history support for the institution.
* The first call encountered an error, and the resulting Aggregation Ticket has now been fixed by the Support Team.
* In these cases, the POST request can contain the parameter `force=true` in the request body to force the second connection.

#### Load Account History {#load-account-history}

This service requires the HTTP header `Content-Length: 0` because it is a POST request with no body.

API Reference: `POST /aggregation/v1/customers/{customerId}/accounts/{accountId}/transactions/historic`

| Status Code | Description |
|-------------|-------------|
| HTTP 204 | Historic transactions have been loaded successfully. The transactions are now available by calling Get Customer Account Transactions. |

---

# Institution Settings
source: https://developer.mastercard.com/open-banking-au/documentation/connect/connect-institutions-settings/index.md

## Financial Institution Search List {#financial-institution-search-list}

You can change the Financial Institutions (FIs) search list that displays in a Connect session using the `institutionSettings` parameter in the body of the request for the [Generate Connect URL APIs](https://developer.mastercard.com/open-banking-au/documentation/connect/generate-2-connect-url-apis/index.md).

### Client Institution Settings {#client-institution-settings}

Set your environment with different institution settings to change the results of the institutions that display in the search list.

* [hidden](https://developer.mastercard.com/open-banking-au/documentation/connect/connect-institutions-settings/index.md#hidden-hide-financial-institutions) - Hide a specific institution(s) from the search list.

* [visible](https://developer.mastercard.com/open-banking-au/documentation/connect/connect-institutions-settings/index.md#visible-change-hidden-financial-institution-to-visible) - Display new connections include testing environments.

Note: To enable institutions settings you must [contact us](https://developer.mastercard.com/open-banking-au/documentation/support/index.md)

## Institution Settings {#institution-settings}

In the [Generate Connect URL APIs](https://developer.mastercard.com/open-banking-au/documentation/connect/generate-2-connect-url-apis/index.md), use the `institutionSettings` parameter to temporarily override the [Client Institution Settings](https://developer.mastercard.com/open-banking-au/documentation/connect/connect-institutions-settings/index.md#client-institution-settings) per connect session.

```JSON
{
  "partnerId": "1445585709680",
  "customerId": "1005061234",
  "type": "aggregation",
  "institutionSettings": {
    "5": "hidden",
    "1407": "hidden"
  }
}
```

### hidden: Hide Financial Institutions {#hidden-hide-financial-institutions}

Hide an individual institution or a set of institutions for a specific connect session.

```JSON
{
  "institutionSettings": {
    "5": "hidden",
    "1407": "hidden"
  }
}
```

### visible: Change Hidden Financial Institution to Visible {#visible-change-hidden-financial-institution-to-visible}

When new OAuth connections become available, you can internally test the connection by making the FI visible in Connect's search list for institutions. If the OAuth connection is new and the legacy connection is still available, then two FIs with the same name will display in the search list.

```JSON
{
  "institutionSettings": {
    "102224": "visible"
  }
}
```

---

# Customers
source: https://developer.mastercard.com/open-banking-au/documentation/access-and-config/customers/index.md

## Customer Records {#customer-records}

In order for you to use Open Banking with your customers, you will need to create customer records. These records allow you to view customers' account information and other types of data from the Financial Institutions (FIs) that they connect. When a customer logs into their bank and permissions their accounts, the financial data is associated with their `customerId`. If you delete the `customerId` field, the link to their account gets deleted as well.

Customer records always have a category of `INDIVIDUAL` or `BUSINESS` which indicates whether the service will be provided to the customer as an individual or a business entity. The category of customer record can be specified on creation using the `category` parameter and otherwise defaults to `INDIVIDUAL`. The customer category affects which other fields are required to create the customer record.

For customers of category `BUSINESS` and partners using a [Business Consumer Disclosure Consent (BCDC) model](https://developer.mastercard.com/open-banking-au/documentation/access-and-config/access-models/#cdr-access-models) the `abn` field parameter is mandatory. This field must contain the Australian Business Number for the business and the ABN must be valid and active on the Australian Business Register to create a customer record and to generate a connect URL. The ABN is not validated for customers using a Outsourced Service Provider (OSP) or CDR representative model. Partners using the BCDC model are not permitted to create customers of type `INDIVIDUAL`.

### Customer Account Types {#customer-account-types}

###### For Testing {#for-testing}

To begin testing Open Banking services using our mocked bank provider you need to create a test customer.

[Create a test customer →](https://developer.mastercard.com/open-banking-au/documentation/access-and-config/customers/index.md#test-customers)

###### For Upgraded Accounts {#for-upgraded-accounts}

Upgraded paid accounts must add an *active* customer record in order to access data from live FIs.

[Create an active customer →](https://developer.mastercard.com/open-banking-au/documentation/access-and-config/customers/index.md#active-customers)

## Test Customers {#test-customers}

Create a customer record to use with our mocked Financial Institution, FinBank. Note, you may have already completed this step if you followed the [Quick Start Guide](https://developer.mastercard.com/open-banking-au/documentation/quick-start-guide/index.md).

API Reference: `POST /aggregation/v2/customers/testing`

```sh
curl --location --request POST 'https://api.openbanking.mastercard.com.au/aggregation/v2/customers/testing' \
--header 'Content-Type: application/json' \
--header 'Accept: application/json' \
--header 'App-Key: {{appKey}}' \
--header 'App-Token: {{appToken}}' \
--data-raw '{
    "username": "{{username}}",
    "firstName": "{{firstName}}",
    "lastName": "{{lastName}}",
    "phone": "{{phone}}",
    "email": "{{email}}"
}'
```

* Expected response:

```json
{
  "id": "{{customerId}}",
  "username": "{{username}}",
  "createdDate": 1607450357
}
```

## Active Customers {#active-customers}

Upgraded paid accounts can also add active customers to use at live FIs. Creating customers requires [registering applications](https://developer.mastercard.com/open-banking-au/documentation/access-and-config/applications/index.md) in order to access live data. You can use either active or testing customers with the Finbank [test profiles](https://developer.mastercard.com/open-banking-au/documentation/test-the-apis/index.md).

###### Creating an Active Customer {#creating-an-active-customer}

API Reference: `POST /aggregation/v2/customers/active`

```sh
curl --location --request POST 'https://api.openbanking.mastercard.com.au/aggregation/v2/customers/active' \
--header 'Content-Type: application/json' \
--header 'Accept: application/json' \
--header 'App-Key: {{appKey}}' \
--header 'App-Token: {{appToken}}' \
--data-raw '{
  "username": "{{username}}",
  "firstName": "{{firstname}}",
  "lastName": "{{lastname}}",
  "phone": "{{phone}}",
  "email": "{{email}}",
  "applicationId": "{{applicationId}}"
}'
```

* Expected response:

```json
{
 "id": "1035061235",
 "username": "{{username}}",
 "createdDate": 1607450357
}
```

Tip: The `username` parameter used when creating a customer record must be unique, and consist of between 6 and 255 characters in any mix of the following:

* Upper case, lower case, or numeric characters
* The following non-alphanumeric special characters: `! @ . # $ % & * _ - +`

Use of other special characters (such as `í` or `ü`) may result in an error.

We recommend avoiding the use of email addresses for usernames.

###### Operations for Retrieving and Managing Active Customers {#operations-for-retrieving-and-managing-active-customers}

API Reference: `GET /aggregation/v1/customers/{customerId}`

API Reference: `GET /aggregation/v1/customers`

## Next Steps {#next-steps}

* To learn more about applications and how you can register an application, refer to the [Applications](https://developer.mastercard.com/open-banking-au/documentation/access-and-config/applications/index.md).
* If you wish to use any of the reporting products, you will need to create a consumer. Refer to [Consumers](https://developer.mastercard.com/open-banking-au/documentation/access-and-config/consumers/index.md).
* To learn more about Consent, which allows you to access your customer's accounts, refer to [Consent](https://developer.mastercard.com/open-banking-au/documentation/consent/index.md).
* To learn more about Connect, which allows your customers to consent access to their accounts, refer to the [Connect Application](https://developer.mastercard.com/open-banking-au/documentation/connect/index.md).
* For the full list of testing profiles available, refer to [Test the APIs](https://developer.mastercard.com/open-banking-au/documentation/test-the-apis/index.md).

---

# Account Balance
source: https://developer.mastercard.com/open-banking-au/documentation/products/account-balance/index.md

Tip: Accessing user data (account data, transactions, reports, etc.) requires user consent. For more about consent please check the [consent](https://developer.mastercard.com/open-banking-au/documentation/consent/index.md) page.

To get an account's balance information for the first time, use the Refresh Customer Accounts by Institution Login API. Otherwise, use the Get Customer Account API to retrieve the balance information for the Customer Account.

## Get Customer Account Balance {#get-customer-account-balance}

Account balance is a service included with the call [Get Customer Accounts](https://developer.mastercard.com/open-banking-au/documentation/access-and-config/accounts/index.md).

### Get Available Balance {#get-available-balance}

Retrieve the latest cached available and cleared account balances for a single customer account. Since we update and store balances throughout the day, this is the most accurate balance information available when a connection to a Financial Institution is unavailable or when a faster response is needed. Only deposit account types are supported: Transactions, Savings, and Term Deposits. This is a billable event each time the API is called.

API Reference: `GET /aggregation/v1/customers/{customerId}/accounts/{accountId}/availableBalance`

<br />

<br />

### Get Available Balance - Live {#get-available-balance---live}

Retrieve the available and cleared account balances for a single account in real-time from a Financial Institution. This is a billable event each time the API is called.

API Reference: `GET /aggregation/v1/customers/{customerId}/accounts/{accountId}/availableBalance/live`

---

# Account Owner
source: https://developer.mastercard.com/open-banking-au/documentation/products/verification-account-owner/index.md

## Account Owner {#account-owner}

Tip: Accessing user data (account data, transactions, reports, etc.) requires user consent. For more about consent please check the [consent](https://developer.mastercard.com/open-banking-au/documentation/consent/index.md) page.

Retrieve account owner details where available from a Financial Institution. This is a billable event each time the API is called.

### Get Account Owner Details {#get-account-owner-details}

API Reference: `GET /aggregation/v3/customers/{customerId}/accounts/{accountId}/owner`

---

# Lending
source: https://developer.mastercard.com/open-banking-au/documentation/usecases/lending/index.md

As a lender, use our Lend products to increase efficiency, reduce cost and improve the lending experience for you and your borrowers. Our Lend products integrate seamlessly into your workflow and help you verify a borrower's assets and income information - giving you access to information you need to make confident lending decisions.

## How it Works {#how-it-works}

Leverage the [Verification of Income](https://developer.mastercard.com/open-banking-au/documentation/products/voi/index.md) and [Verification of Assets](https://developer.mastercard.com/open-banking-au/documentation/products/voa/index.md) products to get a complete picture of your borrower's income to effectively assess risk and ensure they can reliably make payments. Access up-to-date income information, verify assets, account balance and all other relevant account data using our automatically generated reports.

* To be able to fetch any customer financial data, you will need a Consent Receipt ID. Subscribe to [Consent Notifications](https://developer.mastercard.com/open-banking-au/documentation/consent/consent-notifications/index.md) to retrieve this, as well as to be informed about consent lifecycle events so that you can treat the received data in accordance with CDR regulations.

* As the next step, generate a Connect URL to launch the [Connect Application](https://developer.mastercard.com/open-banking-au/documentation/connect/index.md) that allows your customers to link their accounts and provide you the permission to access their financial data through Mastercard Open Banking. Connect application is the only way you can allow your customers to link their accounts and is mandatory for integrating with any Mastercard Open Banking APIs.

* With additional [Webhooks](https://developer.mastercard.com/open-banking-au/documentation/connect/webhooks/index.md) your application can receive notifications about Connect events and to listen for when reports have been generated. You can use the following webhooks - [Connect Webhooks](https://developer.mastercard.com/open-banking-au/documentation/connect/webhooks/index.md#connect-webhooks), [Report Webhooks](https://developer.mastercard.com/open-banking-au/documentation/connect/webhooks/index.md#report-webhooks) and [Custom Webhooks](https://developer.mastercard.com/open-banking-au/documentation/connect/webhooks/index.md#custom-webhooks).

* As a lender, you can integrate Mastercard Lend products into your loan origination process to use the best reports for what you need and when you need it. Lenders can generate reports using Connect Application or by directly integrating the APIs.

  * Use [Verification of Assets (VOA)](https://developer.mastercard.com/open-banking-au/documentation/products/voa/index.md) for all transaction, savings, term deposits, and investment accounts for the given customer. This service retrieves 6 months of transaction history for each account.

  * Use [Verification of Income (VOI)](https://developer.mastercard.com/open-banking-au/documentation/products/voi/index.md) to retrieve up to 12 months of validated banking data and provide an analysis of both active and inactive income streams. Receive an accurate proof of income by analyzing all transaction, savings and relevant accounts for the given customer.

  * [Get Reports by Customer](https://developer.mastercard.com/open-banking-au/documentation/api-reference/index.md#GetReportsByCustomer) to retrieve the generated reports.

Diagram usecase_lend

## APIs Used {#apis-used}

* [Generate Connect URL](https://developer.mastercard.com/open-banking-au/documentation/api-reference/index.md#GenerateConnectUrl)
* [Generate Verification of Assets (VOA) report](https://developer.mastercard.com/open-banking-au/documentation/api-reference/index.md#GenerateVOAReport)
* [Generate Verification of Income (VOI) report](https://developer.mastercard.com/open-banking-au/documentation/api-reference/index.md#GenerateVOIReport)
* [Get Reports by Customer](https://developer.mastercard.com/open-banking-au/documentation/api-reference/index.md#GetReportsByCustomer)

## See More {#see-more}

### Quick Start Guide {#quick-start-guide}

Get started with using Mastercard Open Banking APIs in less than 30 minutes.   

[Get Started](https://developer.mastercard.com/open-banking-au/documentation/quick-start-guide/index.md)

### API Reference {#api-reference}

Find detailed explanation of all resources available through Mastercard Open Banking API.   

[Learn More](https://developer.mastercard.com/open-banking-au/documentation/api-reference/index.md)

---

# Cash Flow Report
source: https://developer.mastercard.com/open-banking-au/documentation/products/cash-flow-report/index.md

### Cash Flow Report {#cash-flow-report}

Tip: Accessing user data (account data, transactions, reports, etc.) requires user consent. For more about consent please check the [consent](https://developer.mastercard.com/open-banking-au/documentation/consent/index.md) page.

The Cash Flow report provide cash flow credit and debit analysis of a customer. The availability of consumer report data depends on the Financial Institution (FI). Some FIs provide only three or four months of transactions while others may provide up to 12 months.

Credit versus debit analysis for consolidated view of cash flow:

* Customizable attributes are also available
* Identification of potential transactions from other lenders
* Inflow and outflow transaction streams
* Trending and balance insights

### Generate Cash Flow Report (Business) {#generate-cash-flow-report-business}

API Reference: `POST /decisioning/v2/customers/{customerId}/cashFlowBusiness`

### Get Report by Customer {#get-report-by-customer}

Use the following to get the report once it has been generated.

API Reference: `GET /decisioning/v4/customers/{customerId}/reports/{reportId}`

### Get All Reports Generated by Customer {#get-all-reports-generated-by-customer}

Use the following to get all reports that have been generated for a specified customer.

API Reference: `GET /decisioning/v1/customers/{customerId}/reports`

Note: Get Report endpoints can both be used to obtain either JSON or PDF format reports.

To specify the format required, use `application/json` or `application/pdf` for the Accept request headers. If you've generated an API client from the Open Banking API specification using OpenAPI Generator, the [example code](https://github.com/Mastercard/open-banking-us-openapi/blob/main/tests/src/main/java/client/api/CustomPaymentHistoryApi.java) provided on GitHub shows what you need to do.

## Refreshing Reports {#refreshing-reports}

If the user's consent is still active and you require an updated verification of income report, you can request a new report by using the APIs rather than re-engaging with the customer.
Note: Since many Financial Institutions only post transactions once per day, calling the refresh reports APIs repeatedly is not recommended.

## Resources {#resources}

#### Report Example {#report-example}

You can view an example Cash Flow report by downloading the following PDF:
[cf-report.pdf](https://static.developer.mastercard.com/content/open-banking-au/uploads/reports/cf-report.pdf) (2MB)

---

# Personal Finance Management
source: https://developer.mastercard.com/open-banking-au/documentation/usecases/personal-finance-management/index.md

Personal Finance Management APIs empower you to connect with your customers to deliver clean, categorized and aggregated account data, helping them gain better financial control. Leverage our APIs to retrieve up to 12 months of account and transaction data and provide your customers a consolidated view of their finances in a single app. Provide not just data but analytics and insights to help your customers manage their wealth better.

## How it Works {#how-it-works}

After a customer consents access to their accounts, all the account and transaction data is retrieved using our APIs. The results can then be used in your financial apps to help your customers improve their finances through monitoring, budgeting, analytics and more.

Call the following APIs to provide your customers consolidated data from all their accounts in one place:

* To be able to fetch any customer financial data, you will need a Consent Receipt ID. Subscribe to [Consent Notifications](https://developer.mastercard.com/open-banking-au/documentation/consent/consent-notifications/index.md) to retrieve this, as well as to be informed about consent lifecycle events so that you can treat the received data in accordance with CDR regulations.

* As the next step, generate a Connect URL to launch the [Connect Application](https://developer.mastercard.com/open-banking-au/documentation/connect/index.md) that allows your customers to link their accounts and provide you the permission to access their financial data through Mastercard Open Banking. Connect application is the only way you can allow your customers to link their accounts and is mandatory for integrating with any Mastercard Open Banking APIs.

* With additional [Webhooks](https://developer.mastercard.com/open-banking-au/documentation/connect/webhooks/index.md) your application can receive notifications about Connect events and to listen for when reports have been generated. You can use the following webhooks - [Connect Webhooks](https://developer.mastercard.com/open-banking-au/documentation/connect/webhooks/index.md#connect-webhooks), [Report Webhooks](https://developer.mastercard.com/open-banking-au/documentation/connect/webhooks/index.md#report-webhooks) and [Custom Webhooks](https://developer.mastercard.com/open-banking-au/documentation/connect/webhooks/index.md#custom-webhooks).

* [Get Customer Accounts](https://developer.mastercard.com/open-banking-au/documentation/access-and-config/accounts/index.md) to get all accounts owned by the given customer.

* You can call the appropriate [Refresh Customer Accounts](https://developer.mastercard.com/open-banking-au/documentation/products/transaction-agg/index.md) endpoint to refresh the latest account and transaction data for a customer. In addition, Mastercard performs periodic refresh to update data from accounts added by customers.

* [Get All Customer Transactions](https://developer.mastercard.com/open-banking-au/documentation/products/account-history/index.md) to get all transactions available for this customer within the given date range, across all accounts.

Diagram usecase_pfm

## APIs Used {#apis-used}

* [Generate Connect URL](https://developer.mastercard.com/open-banking-au/documentation/api-reference/index.md#GenerateConnectUrl)
* [Get Customer Accounts](https://developer.mastercard.com/open-banking-au/documentation/api-reference/index.md#GetCustomerAccountsByInstitutionLogin)
* [Refresh Customer Accounts](https://developer.mastercard.com/open-banking-au/documentation/api-reference/index.md#RefreshCustomerAccountsByInstitutionLogin)
* [Load Historical Transactions](https://developer.mastercard.com/open-banking-au/documentation/api-reference/index.md#LoadHistoricTransactionsForCustomerAccount)
* [Get All Customer Transactions](https://developer.mastercard.com/open-banking-au/documentation/api-reference/index.md#GetAllCustomerTransactions)

## See More {#see-more}

### Quick Start Guide {#quick-start-guide}

Get started with using Mastercard Open Banking APIs in less than 30 minutes.   

[Get Started](https://developer.mastercard.com/open-banking-au/documentation/quick-start-guide/index.md)

### API Reference {#api-reference}

Find detailed explanation of all resources available through Mastercard Open Banking API.   

[Learn More](https://developer.mastercard.com/open-banking-au/documentation/api-reference/index.md)

---

# Configuring Consent Email Notifications
source: https://developer.mastercard.com/open-banking-au/documentation/access-and-config/consent-email-notifications/index.md

Under CDR regulation, you must obtain a [consent](https://developer.mastercard.com/open-banking-au/documentation/consent/index.md) from a consumer (also known as a customer within Mastercard Open Banking) before requesting access to their financial data.
Moreover, the regulator requires an Accredited Data Recipient (ADR) to inform the customer every time when their financial data sharing starts and stops, as well as remind them about ongoing data sharing (see [Notifications for consumers](https://www.oaic.gov.au/consumer-data-right/consumer-data-right-guidance-for-business/consumer-data-right-privacy-safeguard-guidelines/chapter-c-consent-the-basis-for-collecting-and-using-cdr-data)).
Note: Although Mastercard Open Banking generally manages these email notifications, clients with particular requirements may be permitted to send notifications themselves under some [access models](https://developer.mastercard.com/open-banking-au/documentation/access-and-config/access-models/index.md). Please contact your Mastercard representative for further details. Warning: To allow Mastercard sending the emails of your behalf, a manager of the DNS records for the sending domain on your side has to add `include: deliverygateways.mastercard.com` to the proper DNS SPF record. There will be issues with email delivery if the correct DNS entries are not added.

SPF is an SMTP / e-mail standard and is not unique to Mastercard. For more information you can read up on SPF records in [Wikipedia](https://en.wikipedia.org/wiki/Sender_Policy_Framework).

## Resources {#resources}

* To learn more about Consent, which allows you to access your customer's accounts, refer to [Consent](https://developer.mastercard.com/open-banking-au/documentation/consent/index.md).
* Refer to [Access Models](https://developer.mastercard.com/open-banking-au/documentation/access-and-config/access-models/index.md) to understand role and responsibilities of your organisation prior registering your [application](https://developer.mastercard.com/open-banking-au/documentation/access-and-config/applications/index.md).

---

# Consent Notifications
source: https://developer.mastercard.com/open-banking-au/documentation/consent/consent-notifications/index.md

Consent Notifications is a set of events that a data recipient can subscribe to and receive on the provided webhook URL by them. Consent Notifications let the recipient know whenever there are [lifecycle changes to the consent](https://developer.mastercard.com/open-banking-au/documentation/consent/index.md) occur, such as:

* Consent is created.
* An institution arrangement is added to the overall consent.
* An institution arrangement is revoked.
* The overall consent with one or more institutions under it is revoked.
* The overall consent with one or more institutions under it is expired.

<br />

Some Consent Notifications require actions to be taken in regard to the collected data. Refer to [Processing Consent Notifications](https://developer.mastercard.com/open-banking-au/documentation/consent/processing-consent-notifications/index.md) to learn about what post-event actions are required.
Note: All Mastercard partners are required to subscribe for Consent Notifications as this is the only way to get CDR required notification about consent being expired or revoked. See [Notifications to CDR participants](https://www.oaic.gov.au/consumer-data-right/consumer-data-right-guidance-for-business/consumer-data-right-privacy-safeguard-guidelines/chapter-c-consent-the-basis-for-collecting-and-using-cdr-data#notification-requirements).

#### Subscribing to notifications {#subscribing-to-notifications}

To start receiving consent notifications, you will need to subscribe to them. If a subscription is successful, the API call will return the `subscriptionID` and `signingKey`. You can use `signingKey` to verify the validity of the received notifications (see [Prevent Spoofing](https://developer.mastercard.com/open-banking-au/documentation/consent/prevent-spoofing/index.md)).
Note: We highly recommend that you save both the `subscriptionID` and the `signingKey` received within the Create subscription API response. For security reasons, the `signingKey` cannot be fetched after subscribing. If you have lost your sandbox signing key, then a new key can be created by creating a new PartnerID and resubscribing. If you have lost your production key, contact your Mastercard representative for assistance.
API Reference: `POST /notifications/webhooks/subscriptions`

Tip: For testing purposes you can use an online tool like [Webhook.site](https://webhook.site/#!/012738db-ce94-4787-8d55-bc2bea156abd), but in production you must use your own secure webhook service.

To prevent Consent Notifications from being missed on the receiving side, ensure that incoming HTTPS messages from Mastercard are allowed.

If we get a 200 HTTP response from your webhook listener server, the webhook event is registered as a success. For any non-200 HTTP status code (failed event), we will resend the webhook.

Our retry logic does exponential retries for 24 hours. The exact instances of each retry are as follows: 6 s, 48 s, 5 min, 34 min, 3 hours 42 min, 24 hours.
Once the max retry window is reached, the notification retry will stop.

#### Get subscription {#get-subscription}

In order to check subscription details, Get Subscription and Get All Subscriptions APIs can be useful. These APIs return the details of either a particular subscription or of all subscriptions. For example:

* The current URL.
* When the subscription was created.
* When the subscription was last updated.

Note: For security reasons, these APIs do not return a `signingKey`.

API Reference: `GET /notifications/webhooks/subscriptions/{subscription_id}`

API Reference: `GET /notifications/webhooks/subscriptions`

<br />

#### Updating subscription {#updating-subscription}

With time there may arise a need to use a different webhook URL to receive notifications, for example, in case the previous URL was compromised or due to an environment upgrade.

API Reference: `PUT /notifications/webhooks/subscriptions/{subscription_id}/url`

Tip: If possible, we recommend that you keep the old URL environment functional for 24 hours after the updated subscription request as there may be notifications in the system waiting in the queue to be sent to the old URL.

#### Resources {#resources}

* Refer to the [Consent](https://developer.mastercard.com/open-banking-au/documentation/consent/index.md) page to learn more about the importance of consent and its lifecycle.
* Refer to [Processing Consent Notifications](https://developer.mastercard.com/open-banking-au/documentation/consent/processing-consent-notifications/index.md) to learn about the Consent Notification Events types and understand what actions are required when the event is received.
* Refer to [Consent Notifications Structure](https://developer.mastercard.com/open-banking-au/documentation/consent/consent-notifications-structure/index.md) to learn about the Consent Notifications structure in detail.
* Refer to [Prevent Spoofing](https://developer.mastercard.com/open-banking-au/documentation/consent/prevent-spoofing/index.md) to validate the authenticity of the Consent Notification and prevent attacks.

---

# Configuring the Connect Experience
source: https://developer.mastercard.com/open-banking-au/documentation/connect/configure-connect-experience/index.md

It is possible to configure some of the UI and functional aspects of the Connect user experience. This can be useful to keep the experience aligned with your own branding. To enable this, you must [contact us](https://developer.mastercard.com/open-banking-au/documentation/support/index.md) and collaborate with a solution engineer to have your customizations setup on our system.

Once complete, you will be given an unique ID that you can use in the `experience` parameter when [generating a Connect URL](https://developer.mastercard.com/open-banking-au/documentation/connect/generate-2-connect-url-apis/index.md). The generated URL will then load your configured version of the Connect experience.

#### Configuration Options {#configuration-options}

The following table outlines the options you have when you want to configure the Connect experience.

| Name | Description | Connect Full | Connect Lite |
|------|-------------|--------------|--------------|
| Purpose | The reason for asking user to link their accounts. | ✔ | ✔ |
| Brand Color | The brand color that is used for primary buttons and the loader within Connect. | ✔ | ✔ |
| Brand Logo | Display a logo in Connect. Format allowed: SVG files | ✔ | |
| Brand Icon | Display an icon on the Share data page. | ✔ | ✔ |
| Heading Image | Customise or remove a heading image at the top of the Consent screen. | ✔ | ✔ |
| Popular Financial Institutions | Display the most common financial institutions (up to 8 tiles) on the Bank Search page. | ✔ | |
| Reports | The reports are generated after a Connect session successfully completes. | ✔ | |
| Single Use URL | By default a Connect URL can be used multiple times. Set this to true if you want to prevent multiple reports from being run from one Connect URL or email. **Note** : The `singleUserUrl` value passed in the Generate Connect URL API call overrides the value set via the experience. | ✔ | ✔ |
| Hide Exit Button | Hide the Exit button on all Connect pages. | ✔ | ✔ |
| Hide Back Button | Hide the Back button on all Connect pages. | ✔ | ✔ |
| De-identification Consent Enablement | Enable or disable de-identification consent. | ✔ | ✔ |
| De-identification Purpose Statement | Explanation of the reason for the de-identification consent. | ✔ | ✔ |

## Resources {#resources}

Within the Connect experience you can also control which financial institutions appear for your customers, refer to [Institutions Settings](https://developer.mastercard.com/open-banking-au/documentation/connect/connect-institutions-settings/index.md) for more information.

---

# Webhooks
source: https://developer.mastercard.com/open-banking-au/documentation/connect/webhooks/index.md

## Connect Webhooks {#connect-webhooks}

Webhook events are sent during a Connect session as the customer interacts with the application. You can track progress through a session, get information about customer usage, and receive notifications when certain processes are complete.

### Event Body {#event-body}

All events include a wrapper that contains metadata. The event data is within the `payload` key. If you specified custom events via the `webhookData` parameter when [generating a Connect URL](https://developer.mastercard.com/open-banking-au/documentation/connect/generate-2-connect-url-apis/index.md), they will be visible within the `webhookData` key.
* JSON

```JSON
{
  "customerId":"12345678",
  "consumerId":"ed81281fcec7ec557aa7d292a3188b75",
  "eventType":"started",
  "eventId":"1495468585434-0e73d1719173766fe4dfe1a8",
  "payload":{
    "event data will be here"
  },
  "webhookData": {
    "custom event data will be here"
  }
}  
```

### Prevent Spoofing {#prevent-spoofing}

If you're using webhooks for sensitive or critical information, we recommend that you verify the signature of the webhook.

###### Tips for Best Practice: {#tips-for-best-practice}

1. Create a SHA-256 HMAC of the request body using your Partner Secret as the key.
2. Compare it to the signature included on the X-Signature header. If the two are equal then the request is valid, otherwise, it is spoofed.
3. Store the `eventId` and ignore webhooks with an ID that have already been processed to prevent replay attacks.

The X-Signature header gets added to every event sent.

++Here is an example of signature verification in NodeJS:++

```javascript
const crypto = require('crypto');
const partnerSecret = '{{PARTNER_SECRET}}';
router.use('/webhook-handler', (request, res) => {
  const body = request.body;
  const signature = crypto
    .createHmac('sha256', partnerSecret)
    .update(JSON.stringify(body))
    .digest('hex');

  if (request.get('x-signature') !== signature) {
    throw new Error('Spoofing detected, rejecting webhook');
  }
});
```

Tip: If we get a 200 HTTP response from your webhook listener server, the webhook event is registered as a success. For any non-200 HTTP status code (failed event), we will resend the webhook.

Our retry logic will function for 3 days with an exponential back-off, meaning we will try multiple times within the first few minutes followed by a retry every hour for 72 hours. The exact instances of each retry within the first few minutes are as follows: 12ms, 72ms, 432ms, 2592ms, 15552ms, 93312ms.

Once the max retry window is reached, the notification retry will stop.

See [Connect Events List](https://developer.mastercard.com/open-banking-au/documentation/connect/webhooks/webhooks-event-connect/index.md) for details of the Connect webhook events.

## Report Webhooks {#report-webhooks}

There are two ways to receive information about a report through a webhook:

1. When you send a request to one of the endpoints which generate a report, you can specify a URL for your report listener (using the optional `callbackUrl` request parameter) which will then receive the report information.
2. When a report is generated through the Open Banking Connect application, the report events will be sent to the webhook URL configured when [generating a Connect URL](https://developer.mastercard.com/open-banking-au/documentation/connect/generate-2-connect-url-apis/index.md).

Report events notify you about the progress of a requested report. Events are sent when a report starts, updates, fails, or completes.

### Setting up a Report Listener {#setting-up-a-report-listener}

Here are some basic steps to follow when you want to set up an endpoint to receive webhook events on your server.

1. Add an inbound endpoint to receive webhook events, for example `/reportlistener`.
2. Set the `content type` of the body to match the accept header used in the Generate Report call.
3. Set the security on your endpoint to allow the HTTPS protocol.
4. Test the endpoint locally to simulate external calls to your application. We recommend testing with the URL: <http://ngrok.com>.
5. Process the test request on a separate thread and return an HTTP 200 success response.

#### Example code {#example-code}

**Java**

```java
@PostMapping(value = "/yourCallback", accepts = "application/xml")
```

**Javascript**

```javascript
app.post('/yourCallback', bodyParser.raw({type:'application/json'}), (req, resp) => {};
```

Note: Since report webhooks are sent only one time (with three attempts to retry if it is not successfully recieved), we recommend processing the webhook data on a different thread as soon as it is received.

See [Reports Events List](https://developer.mastercard.com/open-banking-au/documentation/connect/webhooks/webhooks-event-report/index.md) for details of the report webhook events.

## Custom Webhooks {#custom-webhooks}

There are two different objects you can use to receive information while the customer is interacting in a Connect or joint borrower session on a mobile app or web pages.

* [webhookData Object](https://developer.mastercard.com/open-banking-au/documentation/connect/webhooks/index.md#webhookdata-object)
* [webhookHeaders Object](https://developer.mastercard.com/open-banking-au/documentation/connect/webhooks/index.md#webhookheaders-object)

### webhookData Object {#webhookdata-object}

If you pass the `webhookData` object in the [Generate Connect URL APIs](https://developer.mastercard.com/open-banking-au/documentation/connect/generate-2-connect-url-apis/index.md), you will receive the object back in the body for all other Connect event types.

**Example:** Pass the `webhookData` object in a Generate Connect URL call to receive the `started` event notification.

```JSON
"webhookData": {
  "unquiqueCustomerId": "123456789",
  "uniqueRequestId": "234567890"
}
```

```JSON
{
  "customerId": "1463546",
  "eventType": "adding",
  "eventId": "1704384256449-196c11028016c7976922ff2a",
  "payload": {
    "institutionId": "200003",
    "oauth": true
  },
  "webhookData": {
    "unquiqueCustomerId": "123456789",
    "uniqueRequestId": "234567890"
  }
}
```

### webhookHeaders Object {#webhookheaders-object}

Passing the `webhookHeaders` object provides similar custom return behavior for every webhook event. However, it returns the results in the header instead of the body of the event.

```json
"webhookHeaders": {
  "webhookServerKey": "sadf67ewrkh",
  "webhookCustomerSignature": "91l;kj234924987lj"
}
```

```json
{
  "customerId": "1463546",
  "eventType": "adding",
  "eventId": "1704384256449-196c11028016c7976922ff2a",
  "payload": {
    "institutionId": "200003",
    "oauth": true
  },
  "webhookData": {
    "unquiqueCustomerId": "123456789",
    "uniqueRequestId": "234567890"
  },
  "webhookHeaders": {
    "webhookServerKey": "sadf67ewrkh",
    "webhookCustomerSignature": "91l;kj234924987lj"
  }
}
```

## Allowed IP Addresses {#allowed-ip-addresses}

To ensure both connect and consent webhook notifications reach your webhook listener server, you must add the following Mastercard IP addresses to your firewall's allowlist:

    54.66.101.2
    13.238.109.236
    52.62.188.205

---

# Generate Connect URL
source: https://developer.mastercard.com/open-banking-au/documentation/connect/generate-2-connect-url-apis/index.md

There are a few options when it comes to generating a Connect URL for your customers to use. This section covers what Connect products are available for use, what functionality they provide, and when best to use them.
Alert: Please note that in order to launch Connect, you need to create an experience. If you haven't done already, please reach out to your **Solution Engineer** or contact the [support](https://developer.mastercard.com/open-banking-au/documentation/support/index.md). **Connect Full**   

The Connect Full experience allows your customers:

* Search for the Financial Institution.
* Sign in to their Financial Institution and grant consent to access data.
* Connect and review multiple accounts.

<br />

[Use Connect Full →](https://developer.mastercard.com/open-banking-au/documentation/connect/generate-2-connect-url-apis/index.md#connect-full)
**Connect Lite**   

Connect Lite is a minimalistic implementation of the Connect Full experience, providing a limited set of features.
Connect Lite is a useful option if you want to handle the selection of Financial Institution and Account(s) in your own user experience.

[Use Connect Lite →](https://developer.mastercard.com/open-banking-au/documentation/connect/generate-2-connect-url-apis/index.md#connect-lite)
**Connect Dashboard**   

The Connect Dashboard allows your customers:

* Review their active and past consents.
* Revoke active consent.

<br />

[Use Connect Dashboard →](https://developer.mastercard.com/open-banking-au/documentation/connect/generate-2-connect-url-apis/index.md#connect-dashboard)

## How It Works {#how-it-works}

The Connect `experience` parameter allows you to configure parts of the Connect UI and functionality. See the [Configure the Connect Experience](https://developer.mastercard.com/open-banking-au/documentation/connect/configure-connect-experience/index.md) section for more information. The `redirectUri` specifies where the customer will be redirected to once they have completed authentication at their Financial Institution and permissioned access to their accounts.

These endpoints require [Authentication](https://developer.mastercard.com/open-banking-au/documentation/access-and-config/auth/index.md).

### Session time-out {#session-time-out}

Connect URLs are valid for 2 hours after being generated. Once the customer opens the Connect experience, the session is valid for 1 hour after authentication. The Connect experience will display an alert after 5 minutes of inactivity (this is extended to 10 minutes if the customer is adding OAuth accounts to allow for time to interact with the bank's website), and the session will terminate after 2 further minutes of inactivity.

### Webhooks {#webhooks}

When you are calling an API for generating a Connect URL you may send a URL for receiving [Connect Webhooks](https://developer.mastercard.com/open-banking-au/documentation/connect/webhooks/index.md). This is where certain events that occur during the Connect lifecycle will be sent to. Consent webhook events give visibility to the customer's actions during the consent journey and may help troubleshoot some cases like why the customer didn't add the accounts or on which step the journey was abandoned and why.
Tip: For testing purposes you can use commonly used online tools like webhook.site, requestbin.com, beeceptor.com, or other tools that will receive webhooks and post the content for you to review (note that this is not an official endorsement for any of these services). In production you **must** use your own secure webhook service. Note: If we get a 200 HTTP response from your webhook listener server, the webhook event is registered as a success. For any non-200 HTTP status code (failed event), we will resend the webhook.

Our retry logic will function for 3 days with an exponential back-off, meaning we will try multiple times within the first few minutes followed by a retry every hour for 72 hours. The exact instances of each retry within the first few minutes are as follows:
12ms, 72ms, 432ms, 2592ms, 15552ms, 93312ms.

### Software Development Kits (SDKs) {#software-development-kits-sdks}

Once you have generated a Connect URL you will need to provide a front end experience for your customers to grant permissions on their financial accounts. The [Connect SDKs](https://developer.mastercard.com/open-banking-au/documentation/connect/integrating-with-connect/index.md) provide you with encapsulated tools to make this easy.

## Connect Full {#connect-full}

Connect Full provides all the screens needed for the complete user experience.
The Connect Full experience provides screens to allow the user to find and select their FI, sign-in, submit consent, and then select the account(s) that they want to connect to open banking.

You may already be familiar with the Generate Connect URL endpoint if you followed the [Quick Start Guide](https://developer.mastercard.com/open-banking-au/documentation/quick-start-guide/index.md).

API Reference: `GET /connect/v2/generate`

<br />

## Connect Lite {#connect-lite}

Connect Lite gives you the flexibility to build your own screens to allow the user to select the FI and account, with Mastercard hosting the Terms and Conditions and sign-in screens only.

In order to use Connect Lite you need to supply an `institutionId`. To facilitate this you can perform a search using the institutions endpoint given a search term from your customer. Once you have a customer select an institution from the list you will have the `institutionId` needed in the Connect Lite endpoint.

API Reference: `GET /institution/v2/institutions`

<br />

Once you have the `institutionId` for the institution concerned, pass it to the following endpoint in order to generate a sign-in screen which is appropriate to the FI. The user will also be prompted to accept the terms and conditions and privacy agreement before sign-in.

API Reference: `GET /connect/v2/generate/lite`

## Connect Dashboard {#connect-dashboard}

As per CDR regulation, it is required to provide your users a way to review and manage their consent. To simplify fulfilling this requirement, Mastercard provides the Connect Dashboard.

API Reference: `POST /connect/v2/generate/consent/manage`

We also provide API endpoints for querying and revoking consents, see [Managing consent](https://developer.mastercard.com/open-banking-au/documentation/consent/manage-consent/index.md).

## Resources {#resources}

* [Status Codes](https://developer.mastercard.com/open-banking-au/documentation/codes-and-formats/index.md) display when something interrupts the process of the Connect application. The error code number and description can help you know what the issue is and how to resolve it.
* [Connect Events](https://developer.mastercard.com/open-banking-au/documentation/connect/integrating-with-connect/connect-2-events/index.md) are events sent from the Connect app through the SDK to your web and mobile apps.
* Please refer to the [Consent](https://developer.mastercard.com/open-banking-au/documentation/consent/index.md) page to learn about the consent that the user gives as part of their Connect journey.

---

# Managing Consent
source: https://developer.mastercard.com/open-banking-au/documentation/consent/manage-consent/index.md

One of the obligations driven by CDR regulation around consent is providing consumers (also known as customers) with a dashboard where they can see and manage their consent/arrangements. To simplify fulfilling this requirement, Mastercard provides the [Connect Dashboard](https://developer.mastercard.com/open-banking-au/documentation/connect/generate-2-connect-url-apis/index.md#connect-dashboard).

### Data redundancy or what to do when consent becomes invalid {#data-redundancy-or-what-to-do-when-consent-becomes-invalid}

Unless an exception applies, under CDR regulation, the data recipient is obligated to remove all fetched CDR data, as well as data derived from it as soon as:

1. Consent/arrangement to access this data expires or is revoked.
2. The service was provided and there is no more need to obtain the customer's data, even if the consent is still valid.

There are a few ways a customer can revoke the overall, or individual, institution consent:

* Through [Connect Dashboard](https://developer.mastercard.com/open-banking-au/documentation/connect/generate-2-connect-url-apis/index.md#connect-dashboard)
* Through the application or other ways of communication provided by the FI
* Through other ways of communication, for example, by [contacting Mastercard](mailto:DataComplaints_au@mastercard.com)

<br />

In each case, the data recipient is obligated to act on the obtained and derived data by deleting them.
The best way to know when the consent is revoked or expired is to subscribe for [Consent Notifications](https://developer.mastercard.com/open-banking-au/documentation/consent/consent-notifications/index.md).

We also provide [consent APIs](https://developer.mastercard.com/open-banking-au/documentation/consent/consent-apis/index.md) for the purposes of querying and revoking consents. These endpoints may not be suitable for all partners.

#### Resources {#resources}

* Refer to the [Connect Application](https://developer.mastercard.com/open-banking-au/documentation/connect/index.md) for information on how to use it to obtain customers' consent on data sharing.

---

# Objects Model
source: https://developer.mastercard.com/open-banking-au/documentation/access-and-config/objects-model/index.md

When building your own production application, understanding the building blocks and configuring them properly will help you achieve better and more efficient results.

## Objects Model {#objects-model}

Mastercard Open Banking defines such objects to access financial data of the customers:

* **Application** - an entity of a software product registered with Mastercard and The Australian Competition and Consumer Commission (ACCC). The application is what communicates with each Data Holder (DH) in order to retrieve the Customer's financial data.
* **Customer** - an entity representing the party whose financial data will be requested and processed.
* **Financial Institution** - an entity representing DH that Mastercard Open Banking can connect to for requesting Customer's financial data.
* **Consent** - an entity representing a Customer's agreement for the Application to access their financial information of the particular accounts.
* **Connect** - a Mastercard Open Banking product which facilitates the collections of Consents from a Customer.
* **Dashboard** - a Mastercard Open Banking product allowing Customers to review and manage their active and historical Consents given using Connect.
* **Account** - an entity representing a single financial account, details of which the Customer has consented to share. One Customer can share many Accounts under a single Consent.
* **Owner** - an entity representing the Account owner information for a single consented account.
* **Transaction** - an entity representing a single transaction associated with a consented Account.
* **Balance** - an entity representing a balance of a single consented Account.
* **Details** - an entity representing the Account details for [pay use case](https://developer.mastercard.com/open-banking-au/documentation/usecases/payment-enablement/index.md) (money transfer) for a single consented account.
* **Report** - an entity representing a single report to support [lend use case](https://developer.mastercard.com/open-banking-au/documentation/usecases/lending/index.md) using consented Accounts.
* **Consumer** - an entity representing a consumer of a Report. Such lend products as [Verification of Income (VOI)](https://developer.mastercard.com/open-banking-au/documentation/products/voi/index.md) and [Verification of Assets (VOA)](https://developer.mastercard.com/open-banking-au/documentation/products/voa/index.md) require Consumer to generate the Report.

![Open Banking objects model](https://static.developer.mastercard.com/content/open-banking-au/uploads/mobs-objects-model.png)

## How it works together {#how-it-works-together}

1. To access the Mastercard Open Banking APIs, you will need to complete an [authentication](https://developer.mastercard.com/open-banking-au/documentation/access-and-config/auth/index.md) process. After this, you will have access to the APIs and therefore entities depending on your production settings.

2. To access any Customer data, firstly your Application has to be [registered](https://developer.mastercard.com/open-banking-au/documentation/access-and-config/applications/index.md) with Mastercard and the ACCC. Each of your [Customers](https://developer.mastercard.com/open-banking-au/documentation/access-and-config/customers/index.md) must be associated with an Application.

3. In accordance with Consumer Data Right (CDR) regulations, Customers must provide their [Consent](https://developer.mastercard.com/open-banking-au/documentation/consent/index.md) to access their financial data. The Mastercard [Connect](https://developer.mastercard.com/open-banking-au/documentation/connect/index.md) product allows you to obtain Consent, while the [Dashboard](https://developer.mastercard.com/open-banking-au/documentation/api-reference/index.md#GenerateConnectDashboardUrl) allows Customers to manage their Consents in accordance with the regulations.

4. With the Customer and Consent entities in place, it is possible to request information about the customer's [Accounts](https://developer.mastercard.com/open-banking-au/documentation/access-and-config/accounts/index.md) and therefore their financial information (e.g., transactions, balance, etc.).

5. If your product is related to lending, in addition to the Customer and Consent you must also create a [Consumer](https://developer.mastercard.com/open-banking-au/documentation/access-and-config/consumers/index.md) entity. With this, you can generate and obtain Reports such as verification of assets, verification of income, and cash flow.

6. [Financial Institution API](https://developer.mastercard.com/open-banking-au/documentation/api-reference/index.md#GetInstitutions) allows you to check whether specific [Financial Institutions](https://developer.mastercard.com/open-banking-au/documentation/financial-institutions/index.md) is able to provide the information needed for your service. You can use this information to amend the Connect settings to show only Financial Institutions that satisfy your product's needs.

## Next Steps {#next-steps}

Refer to [Access Models](https://developer.mastercard.com/open-banking-au/documentation/access-and-config/access-models/index.md) to understand role and responsibilities of your organisation prior registering your [Application](https://developer.mastercard.com/open-banking-au/documentation/access-and-config/applications/index.md).

---

# Access Models
source: https://developer.mastercard.com/open-banking-au/documentation/access-and-config/access-models/index.md

Note: If you are unsure what access model is applicable to your organisation, please contact our [support team](https://developer.mastercard.com/open-banking-au/documentation/support/#get-help).

## CDR Access Models {#cdr-access-models}

Under the Consumer Data Right (CDR) regulations, there are several access models that can facilitate access to consumer data. Each access model has different requirements and conditions which govern the way data can be collected and used.

When partnering with Mastercard Open Banking, one of three access models will be applicable to your organisation:

* **Outsourced Service Provider (OSP).** This model is applicable to organisations who have been accredited by the Australian Competition and Consumer Commission (ACCC) as [Accredited Data Recipients (ADRs)](https://www.oaic.gov.au/consumer-data-right/consumer-data-right-legislation,-regulation-and-definitions/consumer-data-right-participants#ADR). Under this model, your organisation is known as the ADR and Mastercard is acting as your [OSP](https://www.oaic.gov.au/consumer-data-right/consumer-data-right-guidance-for-business/privacy-obligations/cdr-outsourcing-arrangement-privacy-obligations-for-an-outsourced-service-provider) pursuant to a written agreement.

* **CDR representative model.** This model is applicable to organisations who do not have their own accreditation but wish to access CDR data to provide their product and/or services. Under this model, Mastercard will collect CDR Data on your behalf using our accreditation. Your organisation will be appointed as a CDR Representative of Mastercard, pursuant to a written agreement.

* **Business Consumer Disclosure Consent (BCDC) model.** This model is applicable to organisations who wish to access data shared by business customers. Under this model, Mastercard will collect CDR Data using our accreditation and obtain a business consumer disclosure consent from end users to disclose it to you.

Note: By default, all credentials under Sandbox are associated with CDR representative model. To update your `partnerID` to OSP or the BCDC model, please contact our [support team](https://developer.mastercard.com/open-banking-au/documentation/support/#get-help). This is not required to use the sandbox but it will affect the appearence of the Connect flows. Note: If your organisation obtains its own [accreditation](https://www.cdr.gov.au/for-providers/become-accredited-data-recipient) whilst acting as a CDR Representative of Mastercard under the CDR Representative model, you will need to transition to the OSP model (and all current Consents will cease and Customers will be required to re-establish Consent).

## Responsibilities {#responsibilities}

It is important to understand the various obligations that apply to the collection and use of CDR data that apply to participants under each access model. For more information, see [Privacy obligations](https://www.oaic.gov.au/consumer-data-right/consumer-data-right-guidance-for-business/privacy-obligations).

Mastercard will provide you with support to help ensure compliance with these requirements. For example, Mastercard can facilitate [notifications](https://developer.mastercard.com/open-banking-au/documentation/consent/consent-notifications/index.md) to alert you when a Customer's Consent expires or is revoked, which may trigger an obligation to delete the Customer's CDR Data.

## Next Steps {#next-steps}

To register your application with Mastercard, you will need to use the Mastercard Open Banking APIs. Learn more about how you can [authenticate](https://developer.mastercard.com/open-banking-au/documentation/access-and-config/applications/index.md) to start using the API.

---

# Consent APIs
source: https://developer.mastercard.com/open-banking-au/documentation/consent/consent-apis/index.md

Mastercard provides APIs for consent creation and consent management. These APIs mirror the functionality of the Connect Application but allow full control of the user experience.
Note: Depending on the regulatory model, API-based consent may not be permitted for obtaining, amending, or managing connections to financial institutions. Contact your sales representative for more information.

As with the Connect Application, consent events are emitted through the lifecycle of each consent:

* Refer to [Consent Notifications](https://developer.mastercard.com/open-banking-au/documentation/consent/consent-notifications/index.md) for information about consent notification event types.
* Refer to [Consent Notifications Structure](https://developer.mastercard.com/open-banking-au/documentation/consent/consent-notifications-structure/index.md) for information about the structure of consent notifications.

## Obtain Consent {#obtain-consent}

As an alternative to using [Connect Full or Connect Lite](https://developer.mastercard.com/open-banking-au/documentation/connect/index.md), Mastercard offers APIs that can be used to obtain consent. These allow partners to customise the consent flow fully with their own user experience where permitted by Mastercard. Contact your sales representative for more information in relation to these APIs.

### How it Works {#how-it-works}

Before using obtain or amend consent APIs, you should subscribe to [consent webhooks](https://developer.mastercard.com/open-banking-au/documentation/connect/webhooks/webhooks-event-connect/index.md) and work with your solution engineer to create a [connect experience](https://developer.mastercard.com/open-banking-au/documentation/connect/configure-connect-experience/index.md) with an approved data sharing purpose. Connect webhooks are not available when using consent APIs.

The following steps can be used to obtain consent via API:

1. Use the Get Institutions API to present a list of financial institutions to the end user.

   API Reference: `GET /institution/v2/institutions`

2. Customer selects an institution with an associated `institution_id`.

3. Use the Get Application Details and Get Consents Purpose APIs to obtain details and display them to the end user on the consent screen.

   API Reference: `GET /applications`

   API Reference: `GET /data-sharing-consents/purposes`

   API Reference: `GET /data-sharing-consents/purposes/{purpose_id}`

4. Obtain consent from the end user. Create a consent record in our system using the Post Data Sharing Consent endpoint. Receive a `consent_receipt_id`.

5. Receive a `CONSENT_CREATED` webhook.

6. Use the Data Sharing Consent By Institution API to generate and display a URL to allow the user to authenticate with the bank.

   API Reference: `POST /data-sharing-consents/{consent_receipt_id}/institutions/{institution_id}/urls`

7. The user authenticates, selects accounts, and authorizes data sharing at the financial institution.

8. Receive `INSTITUTIONS_ADDED` webhook

9. Repeat steps 6 to 8 as needed until the user has connected all their financial institutions.

10. Access account data.

### Flow Diagrams {#flow-diagrams}

The following flow diagram is applicable for obtaining consent for one or more financial institutions:
Diagram obtainconsent

## Managing Consent {#managing-consent}

Mastercard provides endpoints that can be used to query consent records:

API Reference: `GET /data-sharing-consents`

API Reference: `GET /data-sharing-consents/{consent_receipt_id}`

We also provide these endpoints to revoke consent records:

API Reference: `DELETE /data-sharing-consents/{consent_receipt_id}`

API Reference: `DELETE /data-sharing-consents/{consent_receipt_id}/institutionLogins/{institution_login_id}`

These endpoints may not be suitable for all partners. Contact your sales representative for more information.

#### Resources {#resources}

* Refer to [Processing Consent Notifications](https://developer.mastercard.com/open-banking-au/documentation/consent/processing-consent-notifications/index.md) to learn about the Consent Notification Events types and understand what actions are required when the event is received.
* Refer to [Consent Notifications Structure](https://developer.mastercard.com/open-banking-au/documentation/consent/consent-notifications-structure/index.md) to learn about the Consent Notifications structure in detail.

---

# De-identification Consent
source: https://developer.mastercard.com/open-banking-au/documentation/consent/deidentification/index.md

A de-identification consent under the CDR allows an Accredited Data Recipient (ADR) to de-identify CDR data. The CDR regulations impose specific requirements in relation to de-identification consents and Mastercard offers a de-identification consent capability as part of the Connect flow which meets these requirements.

## Consent requirements {#consent-requirements}

* De-identification consents must be express.
* In most cases, they must be presented as opt-in (users must not be forced to provide consent to connect their bank accounts). However, if de-identification is reasonably necessary for a specific use case, users may be required to provide consent to proceed.
* De-identification consent lasts for the duration of the connection to the financial institution.

## De-identification process {#de-identification-process}

The CDR imposes specific requirements in relation to the subsequent processes for de-identification of consumer data. Refer to the [OAIC Privacy Safeguard 12 Guidelines](https://www.oaic.gov.au/consumer-data-right/consumer-data-right-guidance-for-business/consumer-data-right-privacy-safeguard-guidelines/chapter-12-privacy-safeguard-12-security-of-cdr-data-and-destruction-or-de-identification-of-redundant-cdr-data) for more details.
Note: Mastercard does not currently provide a mechanism for de-identifying CDR data, and this will need to be implemented by the Partner. Any data which has not been de-identified at the end of a consent must be deleted except where the CDR otherwise permits retention, for example, where a law or court order requires it to be retained.

De-identification consent is configured through the [Connect Experience](https://developer.mastercard.com/open-banking-au/documentation/connect/configure-connect-experience/index.md) by Mastercard. For more information, contact your sales representative.

## Notifications {#notifications}

The Mastercard platform sends [Consent Notifications](https://developer.mastercard.com/open-banking-au/documentation/consent/consent-notifications/index.md) to partners when a financial institution connection includes a de-identification consent. Notifications are sent via webhook events. The `INSTITUTIONS_ADDED` notification includes details of any obtained de-identification consent.

API Reference: `GET /notifications/webhooks/consents`

## API Endpoints {#api-endpoints}

Information about de-identification consent is also available via our [Consent APIs](https://developer.mastercard.com/open-banking-au/documentation/consent/consent-apis/index.md).

API Reference: `GET /data-sharing-consents/{consent_receipt_id}`

API Reference: `DELETE /data-sharing-consents/{consent_receipt_id}/institutionLogins/{institution_login_id}`

---

# Webhook Reports Events List
source: https://developer.mastercard.com/open-banking-au/documentation/connect/webhooks/webhooks-event-report/index.md

This page documents the complete list of events that you can retrieve via webhooks from the report generation endpoints.

## done {#done}

| Name | Connect Support | Description |
|------|-----------------|-------------|
| `done` | Generate Connect Full | Sent after all pending reports are completed. If you request more than one report, the payload is an array of information for each report requested. |

* JSON

```JSON
{
  "eventName": "done",
  "id": "ft81ayiv0i3i",
  "consumerId": "515909541562f11486e572f073ef5dce",
  "type": "voa",
  "status": "success",
  "customerId": 1463546
}
```

## failed {#failed}

| Name | Connect Support | Description |
|------|-----------------|-------------|
| `failed` | Generate Connect Full | Sent after a report has failed to generate. |

* JSON

```JSON
{
  "eventName": "failed",
  "id": "ft81ayiv0i3i",
  "consumerId": "515909541562f11486e572f073ef5dce",
  "type": "voa",
  "status": "failure",
  "customerId": 1463546
}
```

## generating {#generating}

| Name | Connect Support | Description |
|------|-----------------|-------------|
| `generating` | Generate Connect Full | Sent when a report starts generating at the end of Connect journey. If you request more than one report, the payload is an array of information for each report. Note: To generate reports at the end of the Connect journey, a Connect experience should be set up accordingly. See [Configuring the Connect Experience](https://developer.mastercard.com/open-banking-au/documentation/connect/configure-connect-experience/index.md) |

* JSON

```JSON
{
  "customerId": "1463546",
  "eventType": "generating",
  "eventId": "1704386596208-48edeceaf8f1169f7ea6dee2",
  "payload": {
    "id": "u7xg05hbybc4",
    "customerType": "testing",
    "customerId": 1463546,
    "requestId": "FIN177993",
    "requesterName": "Test Company Australia",
    "createdDate": 1704386595,
    "title": "Mastercard Open Banking Verification of Assets",
    "consumerId": "515909541562f11486e572f073ef5dce",
    "constraints": {
      "fromDate": 1699202595,
      "reportCustomFields": [
        {
          "label": "loanID",
          "value": "123456",
          "shown": true
        },
        {
          "label": "loanID",
          "value": "123456",
          "shown": true
        }
      ]
    },
    "type": "voa",
    "status": "inProgress",
    "source": "Finicity Connect",
    "reportId": "u7xg05hbybc4"
  }
}
```

## inProgress {#inprogress}

| Name | Connect Support | Description |
|------|-----------------|-------------|
| `inProgress` | Generate Connect Full | Sent when a report is being generated and has an `inProgress` status. |

* JSON

```JSON
{
  "eventName": "inProgress",
  "id": "ft81ayiv0i3i",
  "consumerId": "515909541562f11486e572f073ef5dce",
  "type": "voa",
  "status": "inProgress",
  "customerId": 1463546
}
```

---

# Web SDK
source: https://developer.mastercard.com/open-banking-au/documentation/connect/integrating-with-connect/web-sdk/index.md

We recommend using the Web SDK to integrate the Connect experience into your web applications.

You can also use the Web SDK to help you add the Connect experience to your mobile applications, by showing your web application within a webview in your mobile apps, although we recommend using our iOS, Android, or React Native SDKs for best results on mobile.

The Connect Web SDK allows you to embed Connect into an iFrame or add Connect into a popup window. The Connect SDK also provides events to help you monitor the progress of a user within the app.

###### Existing Projects/Manual Install {#existing-projectsmanual-install}

If you have an existing web project that uses a module compiler, such as Webpack or Babel, or you want to start from scratch, you can simply install the SDK.

[Install the SDK →](https://developer.mastercard.com/open-banking-au/documentation/connect/integrating-with-connect/web-sdk/index.md#installing-the-sdk)

###### Starter Code {#starter-code}

If you haven't used a module compiler before or want to get started with some helpful scaffolding code, we have provided a basic example using webpack.

[Use the Starter Code →](https://developer.mastercard.com/open-banking-au/documentation/connect/integrating-with-connect/web-sdk/index.md#using-the-starter-code)

## Installing the SDK {#installing-the-sdk}

add this also
can you add this in mastercard open banking au docs file we have more info to store

---

*This documentation is based on the official Mastercard Open Banking Australia API documentation. For the most up-to-date information, please refer to the official documentation at https://developer.mastercard.com/open-banking-au/documentation/*
---

# Webhook Connect Events Lists
source: https://developer.mastercard.com/open-banking-au/documentation/connect/webhooks/webhooks-event-connect/index.md

This page documents the complete list of events that you can retrieve via webhooks from the Open Banking Connect application.

## ping {#ping}

|  Name  |    Connect Support    |                                                                                   Description                                                                                   |
|--------|-----------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `ping` | Generate Connect Full | Sent when the Generate Connect URL APIs are called to verify that the webhook URL is accessible. This endpoint must return a 200 series or the Generate Connect URL call fails. |

* JSON

```JSON
{
  "eventType": "ping",
  "payload": {}
}
```

## financialConsentCreated (deprecated) {#financialconsentcreated-deprecated}

Note: This event is deprecated. To track consent lifecycle and content use [Consent Notifications](https://developer.mastercard.com/open-banking-au/documentation/consent/consent-notifications/index.md) instead.

|           Name            |    Connect Support    |                                                           Description                                                            |
|---------------------------|-----------------------|----------------------------------------------------------------------------------------------------------------------------------|
| `financialConsentCreated` | Generate Connect Full | Sent when the customer consents to sharing data through Open Banking. Only becomes relevant when the customer adds the accounts. |

* JSON

```JSON
{
  "customerId": "1017101354",
  "eventType": "financialConsentCreated",
  "eventId": "1658830298174-f8cc188daccbe833482fe292",
  "payload": {
    "receiptId": "e6062836-65e6-4de6-ad99-c9f6552a36fe",
    "scopes": [
      {
        "featureId": "1",
        "id": "common:customer.detail:read",
        "name": "Detailed Customer Data"
      },
      {
        "featureId": "2",
        "id": "common:customer.detail:read",
        "name": "Detailed Customer Data"
      },
      {
        "featureId": "3",
        "id": "bank:accounts.basic:read",
        "name": "Basic Bank Account Data"
      },
      {
        "featureId": "5",
        "id": "bank:transactions:read",
        "name": "Bank Transaction Data"
      }
    ],
    "accessPeriod": {
      "type": "timeframe",
      "startTime": "2022-07-26T10:11:12.079Z",
      "endTime": "2022-09-24T10:11:12.079Z"
    }
  }
}
```

## added {#added}

|  Name   |    Connect Support    |                                                                                  Description                                                                                  |
|---------|-----------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `added` | Generate Connect Full | Sent after the customer selected the accounts on data holder (DH) side and returns to Connect. The accounts are saved in the account's resource associated with the customer. |

* JSON

```JSON
  {
    "customerId": "1017101354",
    "eventType": "added",
    "eventId": "1611877956869-28ebb24c66699bf3c77f04b1",
    "payload": {
      "institutionId": "101732",
      "accounts": [
        {
          "id": "11468417",
          "number": "xxxx-xxxx-xxxx-0101",
          "accountNumberDisplay": "xxxx-xxxx-xxxx-0101",
          "name": "Transaction",
          "balance": 22327.3,
          "type": "transactionAndSavings",
          "status": "active",
          "customerId": "1463546",
          "institutionId": "200003",
          "balanceDate": 1704384285,
          "createdDate": 1704384285,
          "lastUpdatedDate": 1704423887,
          "currency": "AUD",
          "institutionLoginId": 1686094,
          "accountNickname": "Transaction",
          "marketSegment": "personal"
        },
        {
          "id": "11468419",
          "number": "xxxx-xxxx-xxxx-0103",
          "accountNumberDisplay": "xxxx-xxxx-xxxx-0103",
          "name": "creditCard",
          "balance": -1952.71,
          "type": "creditCard",
          "status": "active",
          "customerId": "1463546",
          "institutionId": "200003",
          "balanceDate": 1704384285,
          "createdDate": 1704384285,
          "lastUpdatedDate": 1704423887,
          "currency": "AUD",
          "institutionLoginId": 1686094,
          "accountNickname": "creditCard",
          "marketSegment": "personal"
        }
      ],
      "oauth": true,
      "receiptId": "7a24d242-4011-4be2-af7d-004bd4dd4be4"
    },
    "webhookData": {}
}
```

## adding {#adding}

|   Name   |    Connect Support    |                                                 Description                                                 |
|----------|-----------------------|-------------------------------------------------------------------------------------------------------------|
| `adding` | Generate Connect Full | Sent when a customer is redirected to a Financial Institution to log in and select which accounts to share. |

* JSON

```JSON
{
  "customerId": "1463546",
  "eventType": "adding",
  "eventId": "1704384256449-196c11028016c7976922ff2a",
  "payload": {
    "institutionId": "200003",
    "oauth": true
  }
}
```

## done {#done}

|  Name  |    Connect Support    |                                             Description                                             |
|--------|-----------------------|-----------------------------------------------------------------------------------------------------|
| `done` | Generate Connect Full | The **done** event is sent after the customer clicks **Submit** at the end of a Connect experience. |

* JSON

```JSON
{
  "customerId": "1463546",
  "eventType": "done",
  "eventId": "1704384297827-320fa36f67c173fa77be15d8",
  "payload": {}
}
```

## institutionNotFound {#institutionnotfound}

|         Name          |    Connect Support    |                                                           Description                                                           |
|-----------------------|-----------------------|---------------------------------------------------------------------------------------------------------------------------------|
| `institutionNotFound` | Generate Connect Full | Sent when the user searches for an institution that is not on our list. Connect provides the description for the `query` field. |

* JSON

```JSON
{
  "customerId": "29272504",
  "eventType": "institutionNotFound",
  "eventId": "1564677197519-4f47b664bd855275389e76c6",
  "payload": {
    "query": "not a real institution"
  }
}
```

## institutionSupported {#institutionsupported}

|          Name          |    Connect Support    |                              Description                              |
|------------------------|-----------------------|-----------------------------------------------------------------------|
| `institutionSupported` | Generate Connect Full | Sent when a user selects a Financial Institution from a search query. |

* JSON

```JSON
{
  "customerId": "1463546",
  "eventType": "institutionSupported",
  "eventId": "1704384247615-084d6eac431f80f4083b510d",
  "payload": {
    "institutionId": "200003"
  }
}
```

## processing {#processing}

|     Name     |    Connect Support    |                                                                                               Description                                                                                               |
|--------------|-----------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `processing` | Generate Connect Full | * Sent after the user selects their accounts from an OAuth connection, and then gets redirected back to Connect. * Sent when a request to generate a report is in the process of generating the report. |

* JSON

```JSON
{
  "customerId": "1463546",
  "eventType": "processing",
  "eventId": "1704384284684-349e4c801ba84fb76b96c091",
  "payload": {
    "institutionId": "200003"
  }
}
```

## started {#started}

|   Name    |    Connect Support    |                                    Description                                     |
|-----------|-----------------------|------------------------------------------------------------------------------------|
| `started` | Generate Connect Full | Sent when the Connect application is loaded and the landing web page is displayed. |

* JSON

```JSON
{
  "customerId": "1463546",
  "eventType": "started",
  "eventId": "1704384242127-71865a94bc331af02d9cd264",
  "payload": {}
}
```

## unableToConnect {#unabletoconnect}

|       Name        |    Connect Support    |                                                                                Description                                                                                 |
|-------------------|-----------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `unableToConnect` | Generate Connect Full | Sent when a Financial Institution is unavailable (unknown reasons) and a connection isn't possible. **Error codes**: 102, 500, 900, 903, 904, 901, 910, 915, 916, and 920. |

* JSON

```JSON
{
  "customerId": "29272504",
  "consumerId": "41d42ef0faef200e370208ad179a44cd",
  "eventType": "unableToConnect",
  "eventId": "1543535415162-6d06cbeed93533d612b4e255",
  "payload": {
    "institutionId": "15880",
    "code": 500
  }
}
```
