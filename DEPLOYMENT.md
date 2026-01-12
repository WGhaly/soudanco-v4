# Soudanco V4 - Deployment Guide

## Environment Variables

Both the Admin Panel and User App require the following environment variables to be set in your deployment platform (Vercel/Netlify):

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/dbname?sslmode=require` |
| `JWT_SECRET` | Secret key for JWT token signing (min 32 chars) | `your-super-secret-jwt-key-min-32-chars` |
| `JWT_REFRESH_SECRET` | Secret key for refresh tokens (min 32 chars) | `your-refresh-secret-key-min-32-chars` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `FRONTEND_URL` | Frontend URL for CORS | (auto-detected) |
| `PING_MESSAGE` | Health check response | `pong` |

## Database Setup (Production)

For production, you'll need a PostgreSQL database. Recommended providers:

1. **Neon** (https://neon.tech) - Serverless PostgreSQL, generous free tier
2. **Supabase** (https://supabase.com) - PostgreSQL with additional features
3. **Railway** (https://railway.app) - Simple PostgreSQL hosting
4. **PlanetScale** (MySQL alternative if needed)

### Database Migration

After setting up your production database, run the schema migration:

```bash
# From Admin Panel directory
cd "Admin Panel"
DATABASE_URL="your-production-connection-string" npx drizzle-kit push

# Optionally seed the database
DATABASE_URL="your-production-connection-string" npx tsx server/db/seed.ts
```

## Deployment Options

### Option 1: Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel dashboard
3. Set environment variables in Vercel project settings
4. Deploy

**Vercel CLI:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy Admin Panel
cd "Admin Panel"
vercel --prod

# Deploy User App
cd "User App"
vercel --prod
```

### Option 2: Netlify

The projects already have `netlify.toml` configured.

1. Push your code to GitHub
2. Import project in Netlify dashboard
3. Set environment variables in Netlify project settings
4. Deploy

**Netlify CLI:**
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy Admin Panel
cd "Admin Panel"
netlify deploy --prod

# Deploy User App  
cd "User App"
netlify deploy --prod
```

## Post-Deployment Checklist

- [ ] Database URL is set and accessible
- [ ] JWT secrets are set (use strong, unique values)
- [ ] Test login on Admin Panel (admin@soudanco.com / admin123)
- [ ] Test login on User App (aljawhra@example.com / customer123)
- [ ] Verify API endpoints are working (/api/ping)
- [ ] Check CORS is working for your domain

## Test Credentials

### Admin Panel
- Email: `admin@soudanco.com`
- Password: `admin123`

### User App (Customers)
| Customer | Email | Password |
|----------|-------|----------|
| Al-Jawhra Market | aljawhra@example.com | customer123 |
| Nile Supermarket | nile@example.com | customer123 |
| Cairo Fresh | cairofresh@example.com | customer123 |
| Delta Foods | deltafoods@example.com | customer123 |
| Alexandria Grocery | alexgrocery@example.com | customer123 |

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│  ┌──────────────────┐          ┌──────────────────┐         │
│  │   Admin Panel    │          │    User App      │         │
│  │   (React SPA)    │          │   (React SPA)    │         │
│  └────────┬─────────┘          └────────┬─────────┘         │
│           │                              │                   │
│           └──────────┬───────────────────┘                   │
│                      │                                       │
├──────────────────────┼───────────────────────────────────────┤
│                      ▼                                       │
│              ┌───────────────┐                               │
│              │  Express API  │                               │
│              │  (Serverless) │                               │
│              └───────┬───────┘                               │
│                      │                                       │
├──────────────────────┼───────────────────────────────────────┤
│                      ▼                                       │
│              ┌───────────────┐                               │
│              │  PostgreSQL   │                               │
│              │   Database    │                               │
│              └───────────────┘                               │
└─────────────────────────────────────────────────────────────┘
```

## Troubleshooting

### "Database connection failed"
- Verify DATABASE_URL is correct
- Ensure database allows connections from your deployment IP
- Check SSL mode requirements (add `?sslmode=require` if needed)

### "JWT verification failed"
- Ensure JWT_SECRET and JWT_REFRESH_SECRET are set
- Secrets must be at least 32 characters

### "CORS error"
- Set FRONTEND_URL environment variable to your frontend domain
- Ensure credentials: include is set in fetch calls

### "Cannot read properties of undefined"
- Check that all environment variables are set
- Verify database schema is migrated
