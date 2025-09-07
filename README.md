# Cyber Scam & Recovery Unit

Next.js 14 (App Router, TypeScript) + TailwindCSS + Radix UI + Framer Motion frontend.

Scripts:
- dev: next dev
- build: next build
- start: next start

Features:
- Homepage with hero, how it works, services, trust, CTA banner
- Fraud Reporting Wizard with progress and animations
- User Dashboard with status, evidence hashes, timeline
- Reviewer Dashboard with filters, classification, messaging
- Dark mode and accessible components

Backend (NestJS + Prisma)

To run the backend locally:

```bash
cd backend
cp .env.example .env
# update .env DATABASE_URL to point at your Postgres
npm install
npx prisma generate
npm run start:dev
```

The backend exposes an API under the /api prefix and Swagger UI at /api-docs.
