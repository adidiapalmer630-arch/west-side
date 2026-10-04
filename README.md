# WEST SIDE

WEST SIDE is a full-stack sportsbook demo with a secure Express API and a polished React client. It is designed for local development and production-style architecture, with PostgreSQL-ready configuration and a secure wallet/betting workflow.

## Features

- Express API with JWT auth and protected wallet routes
- SQLite demo database for local runs
- PostgreSQL-ready configuration through `DATABASE_URL`
- React + Vite frontend for the sportsbook experience
- User registration, login, wallet deposits, withdrawals, and bet placement
- Admin summary endpoints and fixture data APIs
- Security middleware: Helmet, CORS, rate limiting, request logging

## Tech stack

- Backend: Node.js, Express, SQLite3, PostgreSQL-ready config
- Frontend: React, Vite
- Auth: JWT
- Security: Helmet, express-rate-limit, CORS, Morgan

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Create a local environment file from the template:

```bash
copy .env.example .env
```

3. Start the app:

```bash
node server.js
```

4. Open the app:

- Main app: http://localhost:3000
- Admin view: http://localhost:3000/admin.html

## Demo accounts

Seeded admin account:

- Username: emmanuel
- Password: Password123!

## Environment variables

The root `.env.example` contains:

```env
PORT=3000
JWT_SECRET=your-secure-jwt-secret
DATABASE_URL=postgres://username:password@localhost:5432/westside
NODE_ENV=development
```

For production, replace the demo secret, set `NODE_ENV=production`, and point `DATABASE_URL` to a real PostgreSQL instance.

## Production next steps

- rotate the demo JWT secret in a real environment
- add a managed PostgreSQL database and production deployment service
- hook the wallet and settlement flow to a real payments provider
- replace the in-memory admin state with a durable database-backed admin store
- secure the admin API with stricter verification, audit logs, and role checks

## Notes

This is a concept demo for UI and workflow validation, not a licensed real-money betting system.
