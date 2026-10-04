# WEST SIDE Deployment Guide

This project is ready for deployment as a Node.js API + Vite frontend. One public deployment can be completed in 3 parts:

1. Deploy the backend API
2. Deploy the frontend app
3. Connect a PostgreSQL database and production environment variables

## 1) API deployment (Render)

### Prerequisites
- GitHub repository connected to Render
- Render account

### Render setup
1. Sign in to Render.
2. Click New > Web Service.
3. Connect the repository.
4. Set the build command:
   ```bash
   npm install && npm run build
   ```
5. Set the start command:
   ```bash
   npm run start:prod
   ```
6. Set environment variables:
   ```env
   NODE_ENV=production
   PORT=3000
   JWT_SECRET=<your-long-random-secret>
   DATABASE_URL=<your-postgres-url>
   ALLOWED_ORIGINS=https://your-frontend-domain.com
   ```
7. Click Create Web Service.

### Notes
- The backend already supports PostgreSQL via `DATABASE_URL` and falls back to SQLite locally.
- The default `JWT_SECRET` in code is a demo value; replace it in production.

---

## 2) Frontend deployment (Vercel)

### Prerequisites
- Vercel account
- frontend built from the `client` directory

### Vercel setup
1. Import the project into Vercel.
2. Set the project root to the repository root if needed.
3. Set the framework to Vite.
4. Add environment variable:
   ```env
   VITE_API_URL=https://your-render-app-url.onrender.com
   ```
5. Deploy.

### Optional frontend proxy config
If your frontend is served by the same backend, you can also use the included `vercel.json` rewrite pattern after replacing the placeholder backend URL.

---

## 3) Database setup (PostgreSQL)

### Recommended providers
- Render Postgres
- Neon
- Supabase Postgres
- Azure Database for PostgreSQL

### Typical connection string
```env
DATABASE_URL=postgres://username:password@host:5432/westside
```

The backend is already PostgreSQL-ready. When `DATABASE_URL` is present, it uses PostgreSQL; otherwise it uses the local SQLite file.

---

## 4) Production environment checklist

Use these values in the deployed API:

```env
PORT=3000
NODE_ENV=production
JWT_SECRET=<generate-a-strong-secret>
DATABASE_URL=<production-postgres-url>
ALLOWED_ORIGINS=https://your-frontend-domain.com
PAYMENT_PROVIDER=demo-mpesa
ODDS_PROVIDER=simulated-feed
```

---

## 5) Final verification after deployment

After deployment, test these URLs:

- Backend health:
  ```bash
  curl https://your-render-app-url.onrender.com/api/health
  ```
  Expected response:
  ```json
  {"status":"ok","service":"WEST SIDE API"}
  ```

- Frontend app:
  ```bash
  https://your-frontend-domain.vercel.app
  ```

- Register/login flow via the UI or API.

---

## 6) Common issues

### CORS errors
- Ensure `ALLOWED_ORIGINS` includes the deployed frontend domain.

### Database connection errors
- Ensure `DATABASE_URL` is valid and the database is reachable from the host.

### JWT errors
- Regenerate a secure `JWT_SECRET` and ensure all deployments use the same secret if needed.

### Build failures
- Run locally first:
  ```bash
  npm install
  npm run build
  ```

---

## 7) Recommended final production hardening

- rotate the demo JWT seed
- use a managed database instead of SQLite in production
- replace demo wallet/payment provider logic with a real provider
- add real admin auditing and settlement persistence
- enforce stricter role validation for admin APIs

This project is deploy-ready, but the final public live deployment requires your real deployment credentials and host URLs.
