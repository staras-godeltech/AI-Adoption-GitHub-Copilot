# Deployment Guide

This guide covers deploying the Cosmetology Booking App to production using **Render.com** for the backend API and **Vercel** for the React frontend, with **PostgreSQL** as the production database.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Architecture Overview](#architecture-overview)
3. [Deploy PostgreSQL on Render](#deploy-postgresql-on-render)
4. [Deploy Backend API on Render](#deploy-backend-api-on-render)
5. [Deploy Frontend on Vercel](#deploy-frontend-on-vercel)
6. [Configure CORS](#configure-cors)
7. [Verify Production Deployment](#verify-production-deployment)
8. [Local Docker Deployment](#local-docker-deployment)
9. [Environment Variable Reference](#environment-variable-reference)

---

## Prerequisites

- A [GitHub](https://github.com) account with the repository forked/accessible
- A [Render.com](https://render.com) account (free tier works)
- A [Vercel](https://vercel.com) account (free tier works)
- [Docker](https://docker.com) (for local Docker deployment only)

---

## Architecture Overview

```
Vercel (Frontend)          Render.com (Backend)       Render.com (Database)
+------------------+       +------------------+       +------------------+
| React + Vite     |  -->  | .NET 10 API      |  -->  | PostgreSQL 16    |
| (Static SPA)     |       | (Docker / Native)|       | (Managed DB)     |
+------------------+       +------------------+       +------------------+
```

---

## Deploy PostgreSQL on Render

1. Log in to [Render.com](https://render.com) and click **New +** → **PostgreSQL**.
2. Configure the database:
   - **Name**: `cosmetology-db`
   - **Database**: `cosmetology`
   - **User**: `cosmetology`
   - **Region**: Choose the region closest to your users
   - **Plan**: Free (or paid for production)
3. Click **Create Database**.
4. Once created, copy the **Internal Database URL** — you will need it for the API configuration.

The connection string format is:
```
Host=...render.com;Port=5432;Database=cosmetology;Username=cosmetology;Password=...
```

---

## Deploy Backend API on Render

### Option A: Deploy as Web Service (Recommended)

1. In Render, click **New +** → **Web Service**.
2. Connect your GitHub repository.
3. Configure the service:
   - **Name**: `cosmetology-api`
   - **Region**: Same as your database
   - **Branch**: `main`
   - **Runtime**: **Docker** (Render will use the `Dockerfile` in the repo root)
   - **Instance Type**: Free (or paid)

4. Add **Environment Variables** (click "Add Environment Variable" for each):

   | Key | Value |
   |-----|-------|
   | `ASPNETCORE_ENVIRONMENT` | `Production` |
   | `ConnectionStrings__Default` | Your PostgreSQL connection string from above |
   | `Jwt__Key` | A random 32+ character secret (generate with `openssl rand -base64 32`) |
   | `Jwt__Issuer` | `CosmetologyBooking.API` |
   | `Jwt__Audience` | `CosmetologyBooking.Client` |
   | `CORS_ALLOWED_ORIGINS` | Your Vercel frontend URL (e.g., `https://my-app.vercel.app`) |

5. Click **Create Web Service**.
6. Wait for the build and deployment to complete (~5 minutes).
7. Note your API URL: `https://cosmetology-api.onrender.com`

### Option B: Deploy with docker-compose locally

See [Local Docker Deployment](#local-docker-deployment) below.

---

## Deploy Frontend on Vercel

1. Log in to [Vercel](https://vercel.com) and click **Add New** → **Project**.
2. Import your GitHub repository.
3. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. Add **Environment Variables**:

   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | Your Render API URL (e.g., `https://cosmetology-api.onrender.com`) |

5. Click **Deploy**.
6. Vercel will build and deploy your frontend automatically.
7. Note your frontend URL: `https://my-app.vercel.app`

The `vercel.json` in the `frontend/` folder is already configured to handle client-side routing (SPA fallback to `index.html`).

---

## Configure CORS

After deploying the frontend, update the CORS environment variable on Render:

1. Go to your Render Web Service → **Environment**.
2. Update `CORS_ALLOWED_ORIGINS` to your actual Vercel URL.
3. Click **Save Changes** — the service will redeploy automatically.

---

## Verify Production Deployment

### Backend Verification

```bash
# Health check
curl https://cosmetology-api.onrender.com/api/health

# Expected response:
# {"status":"Healthy","timestamp":"...","service":"CosmetologyBooking.API"}

# API info
curl https://cosmetology-api.onrender.com/

# Swagger UI
# Open in browser: https://cosmetology-api.onrender.com/swagger
```

### Frontend Verification

1. Open your Vercel URL in a browser.
2. Navigate to the Services page — services should load from the API.
3. Register a new customer account.
4. Log in with the admin account and verify the dashboard loads.
5. Book a test appointment end-to-end:
   - Browse services → Select a service → Choose date/time → Confirm booking
   - Log in as admin → Confirm the appointment
   - Verify the status updates in the customer view

---

## Local Docker Deployment

For local testing with Docker:

### 1. Create an `.env` file

```bash
# In the repo root, create a .env file
cat > .env << 'EOF'
POSTGRES_DB=cosmetology
POSTGRES_USER=cosmetology
POSTGRES_PASSWORD=your-secure-password
JWT_KEY=your-at-least-32-character-jwt-secret-key-here
CORS_ALLOWED_ORIGINS=http://localhost:5173
EOF
```

### 2. Start the services

```bash
docker-compose up --build
```

This starts:
- **PostgreSQL** on port 5432
- **API** on port 8080

### 3. Run the frontend separately

```bash
cd frontend
cp .env.example .env
# Edit .env and set VITE_API_URL=http://localhost:8080
npm install
npm run dev
```

### 4. Access the application

- Frontend: `http://localhost:5173`
- API: `http://localhost:8080`
- Swagger UI: `http://localhost:8080/swagger`

### Stopping

```bash
docker-compose down

# To also remove the database volume:
docker-compose down -v
```

---

## Environment Variable Reference

### Backend (Production)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `ASPNETCORE_ENVIRONMENT` | Yes | Runtime environment | `Production` |
| `ConnectionStrings__Default` | Yes | Database connection string | `Host=...;Database=cosmetology;...` |
| `Jwt__Key` | Yes | JWT signing secret (min 32 chars) | `randomly-generated-32-char-string` |
| `Jwt__Issuer` | No | JWT issuer | `CosmetologyBooking.API` |
| `Jwt__Audience` | No | JWT audience | `CosmetologyBooking.Client` |
| `Jwt__ExpiryHours` | No | Token lifetime in hours | `24` |
| `CORS_ALLOWED_ORIGINS` | Yes | Comma-separated allowed origins | `https://my-app.vercel.app` |

### Frontend (Production)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `VITE_API_URL` | Yes | Backend API base URL | `https://cosmetology-api.onrender.com` |

> **Security Note:** Never commit secret values to source control. Always use environment variables or secret management tools for production secrets.
