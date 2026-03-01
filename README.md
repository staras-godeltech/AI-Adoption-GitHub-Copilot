# Cosmetology Booking App

[![Tests](https://github.com/staras-godeltech/AI-Adoption-GitHub-Copilot/actions/workflows/tests.yml/badge.svg)](https://github.com/staras-godeltech/AI-Adoption-GitHub-Copilot/actions/workflows/tests.yml)
![.NET 10](https://img.shields.io/badge/.NET-10.0-512BD4?logo=dotnet)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?logo=tailwindcss)
![SQLite](https://img.shields.io/badge/SQLite-003B57?logo=sqlite)
![License](https://img.shields.io/badge/License-MIT-green)

A full-stack web application for cosmetology service booking, built as a demonstration of AI-assisted development using GitHub Copilot. This project showcases Clean Architecture principles with a .NET 10 backend and a React 19 frontend.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Screenshots](#screenshots)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Project Overview

This application enables:
- **Customers** to browse cosmetology services, view available time slots, book appointments, and manage their bookings.
- **Administrators (Cosmetologists)** to manage services, view all appointments, update statuses, and use the admin dashboard with calendar and export features.

The project was built with **90%+ AI-generated code** using GitHub Copilot, documenting all prompts and AI interactions in [`docs/prompts.md`](docs/prompts.md).

---

## Key Features

### Customer Features
- Register and log in with JWT authentication
- Browse and filter available cosmetology services
- Book appointments with date/time selection and availability checking
- View, manage, and cancel their own appointments

### Admin Features
- Secure admin login with role-based authorization
- Full service management (create, edit, deactivate)
- Appointment management with status updates (Pending, Confirmed, Cancelled, Completed)
- Calendar view of all appointments
- Bulk appointment actions
- Export appointments to CSV

### Technical Features
- Clean Architecture (Domain → Application → Infrastructure → API)
- JWT authentication with role-based authorization
- Swagger UI for interactive API documentation
- SQLite for development, PostgreSQL for production
- Docker and docker-compose support
- GitHub Actions CI/CD pipeline

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend Framework | React 19 + TypeScript 5.9 |
| Frontend Build | Vite 7 |
| Styling | TailwindCSS 3.4 |
| HTTP Client | Axios |
| Backend Framework | .NET 10 (ASP.NET Core) |
| API Style | RESTful Controllers |
| ORM | Entity Framework Core 10 |
| Dev Database | SQLite |
| Prod Database | PostgreSQL |
| Authentication | JWT Bearer Tokens |
| API Documentation | Swagger UI (Swashbuckle) |
| Backend Testing | xUnit + WebApplicationFactory |
| Frontend Testing | Vitest + Testing Library |
| CI/CD | GitHub Actions |
| Containerization | Docker + docker-compose |

---

## Architecture

This project follows **Clean Architecture** with strict dependency inversion:

```
┌──────────────────────────────────────────────────────────────┐
│                         API Layer                            │
│          (Controllers, Middleware, Program.cs)               │
│              Depends on: Application                         │
├──────────────────────────────────────────────────────────────┤
│                    Application Layer                         │
│        (Use Cases, DTOs, Repository Interfaces,              │
│                  Service Interfaces)                         │
│              Depends on: Domain                              │
├──────────────────────────────────────────────────────────────┤
│                   Infrastructure Layer                       │
│         (EF Core DbContext, Repositories, AuthService,       │
│                  Migrations, Seeding)                        │
│            Depends on: Application, Domain                   │
├──────────────────────────────────────────────────────────────┤
│                      Domain Layer                            │
│           (Entities, Enums - no dependencies)                │
└──────────────────────────────────────────────────────────────┘

        React Frontend ──HTTP──> .NET API ──EF Core──> SQLite/PostgreSQL
```

**Dependency Direction:** Domain ← Application ← Infrastructure ← API

See [`docs/architecture.md`](docs/architecture.md) for detailed diagrams.

---

## Project Structure

```
AI-Adoption-GitHub-Copilot/
├── backend/
│   ├── API/                         # ASP.NET Core Web API
│   │   ├── Controllers/             # API controllers
│   │   ├── Program.cs               # App configuration & startup
│   │   ├── appsettings.json         # Base configuration
│   │   ├── appsettings.Development.json
│   │   └── appsettings.Production.json
│   ├── Application/                 # Business logic layer
│   │   ├── Auth/                    # Authentication interfaces & DTOs
│   │   ├── Repositories/            # Repository interfaces
│   │   ├── Services/                # Service interfaces
│   │   └── DTOs/                    # Data transfer objects
│   ├── Domain/                      # Core domain models
│   │   ├── Entities/                # Domain entities
│   │   └── Enums/                   # Domain enumerations
│   ├── Infrastructure/              # Data access implementation
│   │   ├── Data/                    # DbContext & seeding
│   │   ├── Migrations/              # EF Core migrations
│   │   ├── Repositories/            # Repository implementations
│   │   └── Services/                # Service implementations
│   └── Tests/
│       ├── API.Tests/               # Integration tests
│       ├── Application.Tests/       # Unit tests
│       ├── Domain.Tests/            # Unit tests
│       └── Infrastructure.Tests/    # Unit tests
├── frontend/
│   ├── src/
│   │   ├── components/              # Reusable UI components
│   │   ├── contexts/                # React contexts (Auth)
│   │   ├── layouts/                 # Page layouts
│   │   ├── pages/                   # Page components
│   │   ├── services/                # Axios API service layer
│   │   └── types/                   # TypeScript type definitions
│   ├── .env.example                 # Environment variable template
│   ├── .env.production              # Production environment variables
│   ├── vite.config.ts
│   └── package.json
├── docs/
│   ├── prompts.md                   # Complete AI prompt log
│   ├── architecture.md              # Architecture diagrams
│   ├── user-guide.md                # Customer user guide
│   ├── admin-guide.md               # Admin/cosmetologist guide
│   └── deployment.md                # Deployment instructions
├── Dockerfile                       # Backend Docker image
├── docker-compose.yml               # Full stack docker-compose
├── CosmetologyBooking.slnx
└── README.md
```

---

## Setup Instructions

### Prerequisites

- [Node.js 20+](https://nodejs.org/)
- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Git](https://git-scm.com/)

### 1. Clone the Repository

```bash
git clone https://github.com/staras-godeltech/AI-Adoption-GitHub-Copilot.git
cd AI-Adoption-GitHub-Copilot
```

### 2. Backend Setup

```bash
# Restore NuGet packages
dotnet restore

# Run the API (from the repo root)
cd backend/API
dotnet run
# Backend starts at http://localhost:5000
# Swagger UI: http://localhost:5000/swagger
```

The SQLite database (`cosmetology.db`) is created and seeded automatically on first run.

### 3. Frontend Setup

```bash
# In a new terminal, from the repo root
cd frontend

# Copy environment variables template
cp .env.example .env

# Install dependencies
npm install

# Start the development server
npm run dev
# Frontend starts at http://localhost:5173
```

### 4. Using Docker (Alternative)

```bash
# Start the full stack with docker-compose
docker-compose up --build
# API: http://localhost:8080
# Frontend: http://localhost:5173 (run separately with npm run dev)
```

### Default Credentials

After the database is seeded, you can log in with:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@cosmetology.local | Password123! |
| Cosmetologist | jane.smith@cosmetology.local | Password123! |
| Customer | john.doe@cosmetology.local | Password123! |

---

## Environment Variables

### Backend

| Variable | Description | Default |
|----------|-------------|---------|
| `ConnectionStrings__Default` | SQLite or PostgreSQL connection string | `Data Source=cosmetology.db` |
| `Jwt__Key` | JWT signing secret (min 32 chars) | See appsettings.json |
| `Jwt__Issuer` | JWT issuer | `CosmetologyBooking.API` |
| `Jwt__Audience` | JWT audience | `CosmetologyBooking.Client` |
| `Jwt__ExpiryHours` | Token expiry in hours | `24` |
| `CORS_ALLOWED_ORIGINS` | Comma-separated allowed origins for production | — |

### Frontend

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:5000` |

See [`frontend/.env.example`](frontend/.env.example) for a complete template.

---

## API Documentation

When the backend is running, Swagger UI is available at:

**Development:** `http://localhost:5000/swagger`

The OpenAPI specification is available at: `http://localhost:5000/swagger/v1/swagger.json`

### Key Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register a new customer | None |
| POST | `/api/auth/login` | Log in and receive JWT | None |
| GET | `/api/services` | List all active services | None |
| POST | `/api/services` | Create a new service | Admin |
| GET | `/api/appointments` | List appointments | Customer/Admin |
| POST | `/api/appointments` | Book an appointment | Customer |
| PUT | `/api/appointments/{id}/status` | Update appointment status | Admin |
| GET | `/api/health` | Health check | None |

---

## Testing

### Backend Tests

```bash
# Run all backend tests from the repo root
dotnet test

# Run specific test project
dotnet test backend/Tests/Domain.Tests/
dotnet test backend/Tests/Application.Tests/
dotnet test backend/Tests/Infrastructure.Tests/
dotnet test backend/Tests/API.Tests/
```

### Frontend Tests

```bash
cd frontend

# Run tests once
npm run test:run

# Run tests in watch mode
npm test

# Run with coverage report
npm run coverage
```

---

## Screenshots

### Home Page
*The main landing page with service highlights and call-to-action.*

![Home Page](docs/screenshots/home.png)

### Services Page
*Browse all available cosmetology services with filtering.*

![Services Page](docs/screenshots/services.png)

### Book Appointment
*Step-by-step booking flow with date/time selection.*

![Book Appointment](docs/screenshots/booking.png)

### Admin Dashboard
*Comprehensive admin dashboard with appointment management.*

![Admin Dashboard](docs/screenshots/admin.png)

---

## Deployment

See [`docs/deployment.md`](docs/deployment.md) for complete instructions on:
- Deploying the backend to Render.com
- Deploying the frontend to Vercel
- Setting up PostgreSQL in production
- Configuring environment variables

Quick production build:

```bash
# Build frontend for production
cd frontend
npm run build
# Output in frontend/dist/

# Build backend Docker image
docker build -t cosmetology-api .
docker run -p 8080:8080 -e JWT__KEY=your-secret cosmetology-api
```

---

## AI Development

This project was built with **90%+ AI-generated code** using GitHub Copilot.

- Complete AI prompt log: [`docs/prompts.md`](docs/prompts.md)
- Architecture decisions and AI interactions documented for all issues #1-#10

---

## Contributing

This is a learning project focused on AI-assisted development. Contributions are welcome:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m 'Add my feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
