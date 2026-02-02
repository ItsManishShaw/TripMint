# Deployment Guide

## Recommended stack

- Web: Vercel
- API: Render (Docker-free Node service)
- Database: Supabase Postgres

## Environments

### API

Required environment variables:

- PORT=4000
- DATABASE_URL (Supabase Postgres URL)
- JWT_SECRET (strong random string)
- CORS_ORIGIN (comma-separated list, e.g., https://app.example.com)
- LOG_LEVEL (info | debug | warn | error)

Migrations and seed:

- pnpm --filter @travel/api prisma:migrate
- pnpm --filter @travel/api prisma:seed

Start:

- pnpm --filter @travel/api dev (for development)

### Web

Required environment variables:

- NEXT_PUBLIC_API_BASE (e.g., https://api.example.com)

Start:

- pnpm --filter @travel/web dev

## Vercel (web)

1. Create a Vercel project from this repo.
2. Set Root Directory to apps/web.
3. Set environment variable NEXT_PUBLIC_API_BASE=https://<your-render-api>.onrender.com
4. Deploy.

## Render (api)

1. Create a new Web Service from this repo.
2. Root Directory: apps/api
3. Build Command: pnpm install
4. Start Command: pnpm dev (for now) or a production start after adding a build step.
5. Set env vars: PORT=4000, DATABASE_URL, JWT_SECRET, CORS_ORIGIN=https://<your-vercel-app>.vercel.app, LOG_LEVEL=info
6. Deploy.

## Supabase (db)

1. Create a project, grab the Postgres connection string.
2. Set DATABASE_URL on Render.
3. Run migrations from Render or locally:
   - pnpm --filter @travel/api prisma:migrate

## Notes

- Keep JWT_SECRET and database credentials in secret managers.
- The API uses rate limiting and logging; tune LOG_LEVEL for production.
