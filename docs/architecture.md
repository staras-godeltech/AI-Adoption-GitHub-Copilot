# Architecture Documentation

This document describes the architecture of the Cosmetology Booking App, including the Clean Architecture layers, database schema, authentication flow, and booking sequence.

---

## Table of Contents

1. [Clean Architecture Overview](#clean-architecture-overview)
2. [Layer Responsibilities](#layer-responsibilities)
3. [Database Schema](#database-schema)
4. [Authentication Flow (JWT)](#authentication-flow-jwt)
5. [Booking Flow Sequence](#booking-flow-sequence)
6. [Technology Mapping](#technology-mapping)

---

## Clean Architecture Overview

The application follows **Clean Architecture** with four layers. Dependencies flow inward — outer layers depend on inner layers, never the reverse.

```
+------------------------------------------------------------------+
|                           API Layer                              |
|    Controllers, Middleware, Program.cs, appsettings.json        |
|                                                                  |
|  - Maps HTTP requests to Application use cases                  |
|  - JWT authentication middleware                                 |
|  - CORS, Swagger configuration                                  |
|  - Depends on: Application layer only                           |
+------------------------------------------------------------------+
                            |
                            v
+------------------------------------------------------------------+
|                      Application Layer                           |
|    DTOs, Interfaces (IRepository, IService), Use Cases          |
|                                                                  |
|  - Defines contracts (interfaces) for all external concerns     |
|  - Contains business use cases and orchestration logic          |
|  - DTOs for data in/out (no domain entity exposure)             |
|  - Depends on: Domain layer only                                |
+------------------------------------------------------------------+
                            |
                            v
+------------------------------------------------------------------+
|                    Infrastructure Layer                          |
|    AppDbContext, Repositories, AuthService, Migrations          |
|                                                                  |
|  - Implements Application interfaces                            |
|  - EF Core + SQLite/PostgreSQL                                  |
|  - BCrypt password hashing                                      |
|  - JWT token generation                                         |
|  - Depends on: Application and Domain layers                    |
+------------------------------------------------------------------+
                            |
                            v
+------------------------------------------------------------------+
|                       Domain Layer                               |
|    Entities: User, Service, Appointment, TimeSlot               |
|    Enums: UserRole, AppointmentStatus                           |
|                                                                  |
|  - Pure C# classes, no framework dependencies                   |
|  - Core business rules and invariants                           |
|  - Depends on: Nothing                                          |
+------------------------------------------------------------------+
```

---

## Layer Responsibilities

### Domain Layer (`backend/Domain/`)

Contains the core business entities and enumerations. Has no external dependencies.

**Entities:**
- `User` — Application user (customer or admin)
- `Service` — Cosmetology service offering
- `Appointment` — A booking between a customer and a service
- `TimeSlot` — Available time slots for booking

**Enumerations:**
- `UserRole` — `Customer = 0`, `Admin = 1`
- `AppointmentStatus` — `Pending = 0`, `Confirmed = 1`, `Cancelled = 2`, `Completed = 3`

---

### Application Layer (`backend/Application/`)

Defines the contracts and contains business logic orchestration.

**Repository Interfaces:**
- `IServiceRepository` — CRUD operations for services (with soft delete)
- `IAppointmentRepository` — CRUD and status management for appointments

**Service Interfaces:**
- `IAuthService` — Registration and login returning JWTs
- `IAvailabilityService` — Checks time slot availability

**DTOs (Data Transfer Objects):**
- `RegisterRequest`, `LoginRequest`, `AuthResponse`
- `ServiceDto`, `CreateServiceRequest`, `UpdateServiceRequest`
- `AppointmentDto`, `CreateAppointmentRequest`, `UpdateAppointmentStatusRequest`

---

### Infrastructure Layer (`backend/Infrastructure/`)

Implements all Application interfaces using concrete technologies.

**Data:**
- `AppDbContext` — EF Core DbContext with DbSets for all entities
- `DbInitializer` — Seeds the database with admin user and sample services

**Repositories:**
- `ServiceRepository` — Implements `IServiceRepository` using EF Core; soft delete sets `IsActive = false`
- `AppointmentRepository` — Implements `IAppointmentRepository` using EF Core

**Services:**
- `AuthService` — BCrypt password hashing + JWT generation
- `AvailabilityService` — Checks booked slots against business hours

**Migrations:**
- EF Core Code-First migrations in `Infrastructure/Migrations/`

---

### API Layer (`backend/API/`)

The entry point of the application. Thin layer that wires everything together.

**Controllers:**
- `AuthController` — `POST /api/auth/register`, `POST /api/auth/login`
- `ServicesController` — Full CRUD for services
- `AppointmentsController` — Appointment management for customers and admins

**Configuration:**
- `Program.cs` — Service registration, middleware pipeline, endpoint mapping
- `appsettings.json` — Base configuration (JWT, business hours)
- `appsettings.Development.json` — SQLite connection string
- `appsettings.Production.json` — PostgreSQL connection string, production CORS

---

## Database Schema

```
+-------------------+          +----------------------+
|       Users       |          |      Services        |
+-------------------+          +----------------------+
| Id (PK)           |          | Id (PK)              |
| FirstName         |          | Name                 |
| LastName          |          | Description          |
| Email (unique)    |          | DurationMinutes      |
| PasswordHash      |          | Price                |
| Role (enum)       |          | IsActive             |
| CreatedAt         |          | CreatedAt            |
+-------------------+          +----------------------+
         |                              |
         |  1:N                         |  1:N
         |                              |
+---------------------------------------------------+
|                    Appointments                   |
+---------------------------------------------------+
| Id (PK)                                           |
| CustomerId (FK -> Users.Id)                       |
| ServiceId (FK -> Services.Id)                     |
| CosmetologistId (nullable FK -> Users.Id)         |
| AppointmentDate (DateTime)                        |
| Status (enum: Pending/Confirmed/Cancelled/Done)   |
| Notes                                             |
| CreatedAt                                         |
+---------------------------------------------------+

+-------------------+
|     TimeSlots     |
+-------------------+
| Id (PK)           |
| SlotDateTime      |
| IsBooked          |
| AppointmentId (FK)|
+-------------------+
```

**Key Relationships:**
- One `User` (customer) can have many `Appointments`
- One `Service` can be linked to many `Appointments`
- One `Appointment` can be optionally assigned to one cosmetologist (`User` with Admin role)
- `TimeSlots` are generated based on business hours configuration

---

## Authentication Flow (JWT)

```
Client                          API                          Infrastructure
  |                              |                                |
  |--- POST /api/auth/login ---->|                                |
  |    { email, password }       |                                |
  |                              |--- AuthService.LoginAsync ---->|
  |                              |                                |--- Hash password
  |                              |                                |--- Find user by email
  |                              |                                |--- BCrypt.Verify()
  |                              |                                |--- Generate JWT token
  |                              |<--- AuthResponse (token) ------|
  |<--- 200 OK { token, role } --|
  |                              |
  |    (store token in          |
  |     localStorage)            |
  |                              |
  |--- GET /api/appointments --->|
  |    Authorization: Bearer ... |
  |                              |--- ValidateToken (JwtBearer)
  |                              |--- Extract Claims (userId, role)
  |                              |--- [Authorize] attribute check
  |<--- 200 OK (appointments) ---|
```

**JWT Token Structure:**
- **Header:** Algorithm (HS256)
- **Payload Claims:**
  - `sub` — User ID
  - `email` — User email
  - `role` — `Customer` or `Admin`
  - `exp` — Expiry timestamp (24 hours from issue)
  - `iss` — `CosmetologyBooking.API`
  - `aud` — `CosmetologyBooking.Client`
- **Signature:** HMACSHA256 with the secret key

**Role-Based Authorization:**
- `[Authorize]` — Any authenticated user
- `[Authorize(Roles = "Admin")]` — Admin only
- `[Authorize(Roles = "Customer")]` — Customer only

---

## Booking Flow Sequence

```
Customer (React App)             API                         Database
       |                          |                              |
       |--- GET /api/services --->|                              |
       |<-- 200 [ services ] -----|--- SELECT * FROM Services -->|
       |                          |                              |
       | (customer selects        |                              |
       |  service + date)         |                              |
       |                          |                              |
       |--- GET /api/appointments/|                              |
       |    available?date=...  ->|                              |
       |                          |--- Query booked slots ------>|
       |<-- 200 [ time slots ] ---|<-- return slots -------------|
       |                          |                              |
       | (customer selects slot)  |                              |
       |                          |                              |
       |--- POST /api/appointments|                              |
       |    { serviceId, date,  ->|                              |
       |      time, notes }       |--- Check slot availability ->|
       |                          |--- INSERT appointment ------>|
       |<-- 201 { appointment } --|<-- return appointment -------|
       |                          |                              |
       | (appointment shows as    |                              |
       |  Pending in dashboard)   |                              |
       |                          |                              |
      [Admin confirms]            |                              |
       |                          |                              |
       |--- PUT /api/appointments/|                              |
       |    {id}/status         ->|                              |
       |    { status: Confirmed } |--- UPDATE appointment ------>|
       |<-- 200 { appointment } --|<-- return updated ------------|
       |                          |                              |
       | (status updates to       |                              |
       |  Confirmed in dashboard) |                              |
```

---

## Technology Mapping

| Component | Technology | Version |
|-----------|-----------|---------|
| Backend Framework | ASP.NET Core | .NET 10 |
| ORM | Entity Framework Core | 10.x |
| Dev Database | SQLite | Latest |
| Prod Database | PostgreSQL | 16+ |
| Authentication | JWT Bearer | ASP.NET Core Identity Tokens |
| Password Hashing | BCrypt.Net-Next | 4.1.0 |
| API Documentation | Swashbuckle (Swagger) | Latest |
| Frontend Framework | React | 19 |
| Frontend Language | TypeScript | 5.9 |
| Frontend Build | Vite | 7 |
| Styling | TailwindCSS | 3.4 |
| HTTP Client | Axios | 1.x |
| Frontend Testing | Vitest + Testing Library | 4.x |
| Backend Testing | xUnit + WebApplicationFactory | Latest |
| Containerization | Docker | 24+ |
| CI/CD | GitHub Actions | — |
