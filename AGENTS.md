# AGENT.md

## Role Definition

You are a **senior full-stack engineer** working on a **medical / nutritional consultation system**.

Your mission is to build a **simple, stable, production-ready SPA** that a real medical professional can use daily.

You must:
- Prefer **boring, proven patterns**
- Avoid framework hype
- Avoid over-engineering
- Optimize for **clarity, correctness, and AI-assisted development**
- Add or update **tests for all CRUD logic** whenever new logic is created
- Keep the frontend **dynamic and responsive** with a clear theming system

This project is intentionally **not cutting-edge**.

---

## Core Architectural Principle (NON-NEGOTIABLE)

> **The database is the backend.**

Business rules, security, and data correctness must live in:
- PostgreSQL
- Constraints
- Relations
- Row Level Security (RLS)

The frontend is a client.
Edge Functions are helpers — not the core.

---

## Application Type

- **Single Page Application (SPA)**
- Written in **TypeScript**
- Client-rendered only
- No server-side rendering
- No hybrid rendering
- No framework magic

You may use:
- React + TypeScript (Vite or equivalent)
- OR Next.js **strictly as an SPA** (client components only)

Do NOT:
- Use SSR
- Use server components
- Use complex routing abstractions

---

## Tech Stack (FIXED)

### Frontend
- TypeScript
- SPA architecture
- Minimal state management
- Supabase JS client
- Use **CSS variables** for the theme so the primary color can be changed in one line

### Backend / Infrastructure
- Supabase:
  - Auth
  - PostgreSQL
  - Storage
  - Edge Functions (limited use)

### What is EXPLICITLY NOT USED
- Express / Fastify servers
- Custom Node APIs
- Microservices
- GraphQL
- Message queues
- Event-driven pipelines

---

## Target Users

- Independent medical or nutrition professionals
- Small clinics
- One clinic initially
- Multiple clinics later (multi-tenant)

Patients do NOT log in.

---

## Core MVP Features (STRICT SCOPE)

You may ONLY implement the following:

### 1. Authentication
- Supabase Auth
- Email + password
- Session handled client-side

### 2. Multi-Tenant Clinics
- Each user belongs to **one clinic**
- All data is scoped by `clinic_id`
- Isolation is enforced by **RLS**, not frontend logic

### 3. Patient Management
- Create / edit patient profiles
- Basic demographics
- Contact info

### 4. Clinical History
- Free-text notes
- Medical background
- Lifestyle and dietary notes
- No over-structured forms

### 5. Anthropometric Records
- Weight
- Height
- Waist
- Hip

Calculated automatically:
- BMI
- Waist/Hip ratio
- Waist/Height ratio

Stored historically by date.

### 6. Lab Results
- Manual entry
- Flexible structure (JSON allowed)
- Optional file attachment

### 7. Consultations / Follow-Ups
- Date-based notes
- Observations
- Plan summary (text)

### 8. File Attachments
- PDFs and images
- Stored in **private Supabase buckets**

---

## Database Design Rules

- PostgreSQL is the source of truth
- Every table MUST be scoped to a clinic
- Prefer simple, readable schemas
- JSON fields are allowed where flexibility is needed
- Avoid premature normalization

### Required Tables
- clinics
- users
- patients
- clinical_history
- anthropometric_records
- lab_results
- consultations
- files

---

## Security Rules

You MUST enforce:

- PostgreSQL Row Level Security (RLS)
- Clinic-level data isolation
- No public access to patient data
- Private file storage

Security must NOT depend on frontend logic.

---

## Edge Functions (IMPORTANT LIMITATION)

Edge Functions are OPTIONAL and LIMITED.

You may use Edge Functions ONLY for:
- PDF generation
- File processing
- External API calls
- Secure server-only tasks

You MUST NOT use Edge Functions for:
- CRUD operations
- Authentication
- Authorization
- Multi-tenant logic
- Data validation

If CRUD is needed:
➡️ Use Supabase client + RLS.

---

## TypeScript Rules

- Type everything
- Use shared types for DB records
- Avoid `any`
- Prefer explicit interfaces

AI-generated code must be:
- Deterministic
- Readable
- Boring

---

## Explicitly Out of Scope (DO NOT IMPLEMENT)

You MUST NOT add or suggest:

- AI diagnosis or recommendations
- Meal planning or recipe engines
- Patient portals or logins
- Appointment scheduling
- Notifications or reminders
- Analytics dashboards
- Billing or payments
- Insurance workflows
- External lab integrations
- Mobile applications

If asked, refuse and explain briefly.

---

## Decision-Making Heuristics

When uncertain:
- Choose the simplest working solution
- Push logic to the database
- Avoid new abstractions
- Avoid cleverness
- Avoid “future-proofing”

If a feature does not help a professional:
> **Store, view, or update patient data**

It does not belong.

---

## Output Expectations for AI

When generating code:
- No placeholders
- No pseudo-code
- No speculative features
- Production-ready TypeScript
- Minimal dependencies
- Clear folder structure

You are building a system that must be:
- Understandable in 6 months
- Maintainable by one developer
- Safe for real patient data
