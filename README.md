# IqamaTrack — Saudi Employee Document & Expiry Management System

![Saudi Theme](https://img.shields.io/badge/Identity-Saudi_Green_%23006C35-006C35)
![Next.js](https://img.shields.io/badge/Next.js-16_App_Router-black)
![Prisma](https://img.shields.io/badge/Prisma-PostgreSQL_%26_SQLite-2D3748)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue)

**IqamaTrack** is a full-stack, enterprise web application engineered specifically for corporate HR departments, recruitment agencies, and administrators managing expatriate workers in the **Kingdom of Saudi Arabia (KSA)**.

It securely stores employee residence permits (Iqamas), tracks expiry dates using the **Asia/Riyadh** local timezone, archives documents, maintains renewal audit trails with fee tracking (e.g., Maktab Amal / Jawazat SADAD bills), and sends automated multi-channel milestone email notifications to both HR and employees.

---

## 1. Key Features

- **Saudi-Inspired Premium UI/UX**: Designed around Saudi Arabia's official green and white visual identity (`#006C35`, `#004B28`, `#008C4A`, `#F5F8F6`). Includes live Riyadh local clock, dark green navigation, and responsive layouts.
- **Riyadh Expiry Engine (`Asia/Riyadh`)**:
  - **Valid**: > 30 days remaining (Green)
  - **Expiring Soon**: 8 to 30 days remaining (Yellow/Orange)
  - **Critical**: 1 to 7 days remaining (Red)
  - **Expires Today**: 0 days (Pulsing Red)
  - **Expired**: < 0 days (Dark Red)
- **Automated Milestone Email Engine**:
  - Triggers at **30, 15, 7, 3, 1, 0 days**, and **weekly post-expiry** until renewed or set inactive.
  - **Deduplication Engine**: Unique key `${employeeId}_${expiryDateStr}_${notificationType}` ensures duplicate notifications are never sent.
  - Beautiful responsive Saudi Green HTML email templates.
  - Delivery audit logs with failure retry buttons.
- **Secure Document Vault**:
  - Stores employee Iqama scans and IDs (PDF, JPG, PNG up to 10MB).
  - Private streaming routes with role-based access checks (`/api/documents/[id]/preview` and `/api/documents/[id]/download`).
  - No public direct URLs to sensitive files.
- **AES-256-GCM Encryption**:
  - Sensitive 10-digit Iqama numbers are encrypted server-side with AES-256-GCM.
  - Masked by default (`245****891`), with authorized decryption on demand.
- **Renewal Ledger & Cost Tracking**:
  - Track renewal fees, SADAD bill references, previous vs new expiry dates, and responsible officer.
- **Interactive Expiry Calendar**:
  - Full-month matrix with color-coded expiry badges and day inspection modals.
- **Import & Export**:
  - Bulk employee onboarding via CSV upload with auto-encryption.
  - Instant CSV and printable PDF audit reports.
- **Role-Based Access Control (RBAC)**:
  - **Super Admin**: Complete platform, company, and user management.
  - **HR Manager**: Employee CRUD, renewals, document uploads, email triggers.
  - **Employee**: Self-service profile and expiry timeline view.

---

## 2. Technology Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons, Recharts, Framer Motion
- **Backend**: Next.js Server-Side Route Handlers, Node.js Crypto (AES-256-GCM), bcryptjs, jsonwebtoken
- **Database & ORM**: Prisma ORM with dual schema support:
  - **PostgreSQL / Supabase** (for production deployment)
  - **SQLite** (for instant zero-configuration local development)
- **Email Delivery**: Resend API / SMTP with fallback sandbox delivery logging.

---

## 3. Quick Start & Local Setup

### Prerequisites
- Node.js 18+ (tested on Node v24)
- npm 9+

### 1. Installation
Clone the repository and install dependencies:
```bash
cd iqamatrack
npm install
```

### 2. Environment Configuration
Copy the template configuration:
```bash
cp .env.example .env
```
For local zero-configuration development, the `.env` uses SQLite out of the box:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="iqamatrack_jwt_secret_super_secure_key_2026_riyadh"
ENCRYPTION_KEY="0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
CRON_SECRET="iqama_cron_secret_saudi_2026"
RESEND_API_KEY="" # Optional: Add your Resend API key for live emails
EMAIL_FROM="IqamaTrack Notifications <notifications@iqamatrack.sa>"
APP_URL="http://localhost:3000"
```

### 3. Database Initialization & Seeding
Push the database schema and populate with rich, realistic Saudi employee data:
```bash
npm run db:push
npm run seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 4. Default Seed Accounts

The database comes pre-seeded with 3 realistic accounts across all roles:

| Role | Email | Password |
|---|---|---|
| **Super Admin** | `admin@iqamatrack.sa` | `Admin@123456` |
| **HR Manager** | `hr@iqamatrack.sa` | `Hr@123456` |
| **Employee** | `ahmed.khan@iqamatrack.sa` | `Employee@123456` |

*Note: The login page includes quick-fill buttons for instant 1-click testing of each role.*

---

## 5. PostgreSQL & Supabase Production Setup

To connect to a production PostgreSQL database (e.g., Supabase):

1. In `prisma/schema.prisma`, update the datasource:
   ```prisma
   datasource db {
     provider  = "postgresql"
     url       = env("DATABASE_URL")
     directUrl = env("DIRECT_URL")
   }
   ```
   *(A complete production PostgreSQL schema is also included in `prisma/schema.postgresql.prisma`).*

2. Update your production `.env` with your Supabase connection strings:
   ```env
   DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true"
   DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
   ```

3. Run migrations:
   ```bash
   npx prisma migrate deploy
   npm run seed
   ```

---

## 6. Automated Expiry Job (Cron Runner)

The background expiry tracking engine is exposed via a secure endpoint:
`POST /api/cron/expiry-check`

### Automated Scheduling Options:
- **Vercel Cron**: Configured via `vercel.json`:
  ```json
  {
    "crons": [
      {
        "path": "/api/cron/expiry-check",
        "schedule": "0 5 * * *"
      }
    ]
  }
  ```
- **External Cron (GitHub Actions / Cloud Scheduler)**:
  Call with the authorization header:
  ```bash
  curl -X POST https://your-domain.com/api/cron/expiry-check \
    -H "Authorization: Bearer iqama_cron_secret_saudi_2026"
  ```
- **In-App Manual Trigger**:
  Click the **"Run Expiry Engine"** button in the top navigation bar or Notification Center at any time.

---

## 7. Project Structure

```
iqamatrack/
├── prisma/
│   ├── schema.prisma            # Active Prisma schema (SQLite / Postgres)
│   └── schema.postgresql.prisma # Dedicated Supabase/Postgres production schema
├── scripts/
│   └── seed.mjs                 # Realistic Saudi employees, companies, & logs seed
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/            # Login, Logout, Session check
│   │   │   ├── calendar/        # Monthly expiry timeline data
│   │   │   ├── cron/            # Scheduled expiry check runner
│   │   │   ├── dashboard/       # Real-time KPIs & Recharts analytics
│   │   │   ├── documents/       # Secure streaming download & preview
│   │   │   ├── email-logs/      # Dispatch audit logs and retry handler
│   │   │   ├── employees/       # CRUD, CSV Import, Reminders, Renewals
│   │   │   ├── notifications/   # Urgent alert queries
│   │   │   ├── renewals/        # Historical ledger queries
│   │   │   ├── settings/        # Company & profile preference endpoints
│   │   │   └── users/           # Super Admin RBAC user management
│   │   ├── calendar/            # Page 8: Iqama Expiry Calendar
│   │   ├── dashboard/           # Page 3: Main Dashboard
│   │   ├── email-logs/          # Page 11: Email Logs
│   │   ├── employees/           # Page 4: Employee Directory
│   │   │   ├── [id]/            # Page 7: Employee Profile & Document Vault
│   │   │   │   └── edit/        # Page 6: Edit Employee
│   │   │   └── new/             # Page 5: Add Employee
│   │   ├── forgot-password/     # Page 2: Password Recovery
│   │   ├── login/               # Page 1: Authentication
│   │   ├── notifications/       # Page 10: Notification Center
│   │   ├── renewals/            # Page 9: Renewal History & Ledger
│   │   ├── reports/             # Page 12: Reports & PDF Printable Export
│   │   ├── settings/
│   │   │   ├── company/         # Page 14: Company Settings & Schedules
│   │   │   └── profile/         # Page 15: Profile Settings
│   │   └── users/               # Page 13: Super Admin User Management
│   ├── components/
│   │   ├── layout/AppLayout.tsx # Saudi green sidebar, header, Riyadh clock
│   │   ├── modals/RenewModal.tsx
│   │   ├── modals/UploadDocModal.tsx
│   │   └── ui/StatusBadge.tsx
│   └── lib/
│       ├── audit.ts             # Compliance logging
│       ├── auth.ts              # JWT, session cookies, bcrypt
│       ├── crypto.ts            # AES-256-GCM encryption & masking
│       ├── emailService.ts      # HTML templates, Resend integration, deduplication
│       ├── expiryEngine.ts      # Asia/Riyadh timezone calculation engine
│       └── prisma.ts            # Prisma client singleton
└── .env.example                 # Production environment variable guide
```

---

## 8. License & Saudi Compliance Note

Developed for compliance with:
- Saudi Ministry of Human Resources and Social Development (MHRSD / Qiwa)
- General Directorate of Passports (Jawazat / Muqeem)
- National Cybersecurity Authority (NCA) data encryption best practices
