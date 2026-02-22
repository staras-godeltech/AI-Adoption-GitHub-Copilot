---
# Source: 01_architecture_initial.md
---

# Step 1 – Initial Architecture Design

## Prompt
You are a senior .NET architect.

I am building a production-quality application for a cosmetologist booking system.

Project constraints:
- Backend: .NET 8 Web API
- Architecture: Clean Architecture (Domain, Application, Infrastructure, API)
- Database: SQLLite (via EF Core)
- Authentication: JWT with role-based authorization
- Roles: Admin (cosmetologist), Customer
- IDE: Visual Studio Code
- The solution must follow best practices and be scalable.

Functional requirements:

Customer must be able to:
- View available services
- View available time slots
- Book an appointment
- View their appointments
- Cancel appointment (if not completed)

Admin must be able to:
- View all appointments
- Approve / reject appointments
- Mark appointment as completed
- Manage services (CRUD)
- Manage available time slots

Non-functional requirements:
- Proper separation of concerns
- DTO usage (no exposing entities)
- Validation layer
- Global exception handling
- Logging
- Repository pattern
- SOLID principles
- Role-based authorization
- Swagger documentation

Task:

1. Propose a high-level architecture structure.
2. Define the project structure (folders and projects).
3. List core domain entities.
4. Define key relationships between entities.
5. Suggest important design decisions and patterns.
6. Identify potential technical risks and how to mitigate them.

Do NOT generate implementation code yet.
Focus only on architecture and design.

---
# Source: 02_architecture_refined.md
---

# Step 2 – Refined Architecture Design

## Prompt

Refine the architecture proposal with more precision and depth.

Improve the design by:

1. Explicitly defining dependency direction between layers.
2. Replacing Role entity with a UserRole enum if appropriate.
3. Adding missing enums such as AppointmentStatus.
4. Defining how authentication is structured:
	- Where external OAuth validation lives
	- Where JWT issuing logic lives
	- How roles are assigned
5. Explaining how business use cases are structured (e.g., Commands/Queries).
6. Defining project structure including:
	- Test projects
	- CI pipeline location
7. Adjusting concurrency mitigation strategy for EF Core InMemory provider.
8. Clarifying how the system can later replace InMemory DB with PostgreSQL without architectural changes.

Do not generate code. Provide structured architectural explanation only.

## AI Response Summary

This architecture ensures strict separation of concerns, clear dependency direction, and future-proofing for database and authentication changes. Business logic is encapsulated in use case classes using CQRS, and all external integrations (auth, persistence, logging) are abstracted for easy replacement. Test projects and CI pipeline are included for quality assurance.

---
# Source: 03_project_structure.md
---

# Step 3 – Structure Architecture Design

## Prompt

#file:prompts.md #file:copilot-instructions.md 
Refine the architecture once more with these improvements:

1. Ensure API depends only on Application layer, and Infrastructure is wired via dependency injection at composition root.
2. Define authentication abstractions in Application layer (IExternalAuthService, ITokenService) and implementations in Infrastructure.
3. Simplify concurrency strategy for InMemory provider to application-level availability checks.
4. Define explicit mapping strategy (e.g., AutoMapper location and responsibility).
5. Clarify where DTOs are located and how they are separated from domain models.
6. Define where logging abstraction lives.
7. Ensure use case handlers do not depend on ASP.NET types.

Do not generate code. Provide final architectural structure ready for implementation.

## AI Response Summary

This structure ensures strict separation of concerns, clear dependency direction, and easy testability. All abstractions (repositories, authentication, logging, mapping) are defined in Application and implemented in Infrastructure. API is thin, only wiring dependencies and exposing endpoints. DTOs are separated from domain models, and mapping is abstracted. Concurrency for InMemory is handled at application level, and use case handlers remain framework-agnostic. This architecture is ready for scalable, production-quality implementation.

---
# Source: 04_api_scaffolding.md
---

# Step 4 – API Scaffolfing

## Prompt

#file:02_architecture_refined.md #file:03_project_structure.md 
Context: We have finalized the architecture:

- Domain → Application → Infrastructure → API
- UserRole and AppointmentStatus enums
- Authentication abstractions in Application, implemented in Infrastructure
- DTOs in Application, never expose domain
- AutoMapper mapping via Infrastructure
- Logging via ILogger abstraction
- Concurrency handled at Application layer
- Use case handlers framework-agnostic

Now generate a solution scaffolding for this project. Include:

- Projects for Domain, Application, Infrastructure, API
- Test projects for each layer
- Frontend React folder
- CI/CD folder with workflow
- dotnet CLI commands for all projects and references
- Ensure dependency directions are strictly maintained
Do NOT generate implementation code yet.

## AI Response Summary
## Solution Scaffolding

---

### 1. Project Structure

```
CosmetologyBooking.sln
├── src/
│   ├── CosmetologyBooking.Domain/
│   ├── CosmetologyBooking.Application/
│   ├── CosmetologyBooking.Infrastructure/
│   ├── CosmetologyBooking.API/
├── tests/
│   ├── CosmetologyBooking.Domain.Tests/
│   ├── CosmetologyBooking.Application.Tests/
│   ├── CosmetologyBooking.Infrastructure.Tests/
│   ├── CosmetologyBooking.API.Tests/
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
├── .github/
│   └── workflows/
│       └── ci.yml
```

---

### 2. dotnet CLI Commands

```bash
# Create solution
dotnet new sln -n CosmetologyBooking

# Create projects
dotnet new classlib -n CosmetologyBooking.Domain -o src/CosmetologyBooking.Domain
dotnet new classlib -n CosmetologyBooking.Application -o src/CosmetologyBooking.Application
dotnet new classlib -n CosmetologyBooking.Infrastructure -o src/CosmetologyBooking.Infrastructure
dotnet new webapi -n CosmetologyBooking.API -o src/CosmetologyBooking.API

# Create test projects
dotnet new xunit -n CosmetologyBooking.Domain.Tests -o tests/CosmetologyBooking.Domain.Tests
dotnet new xunit -n CosmetologyBooking.Application.Tests -o tests/CosmetologyBooking.Application.Tests
dotnet new xunit -n CosmetologyBooking.Infrastructure.Tests -o tests/CosmetologyBooking.Infrastructure.Tests
dotnet new xunit -n CosmetologyBooking.API.Tests -o tests/CosmetologyBooking.API.Tests

# Add projects to solution
dotnet sln add src/CosmetologyBooking.Domain
dotnet sln add src/CosmetologyBooking.Application
dotnet sln add src/CosmetologyBooking.Infrastructure
dotnet sln add src/CosmetologyBooking.API
dotnet sln add tests/CosmetologyBooking.Domain.Tests
dotnet sln add tests/CosmetologyBooking.Application.Tests
dotnet sln add tests/CosmetologyBooking.Infrastructure.Tests
dotnet sln add tests/CosmetologyBooking.API.Tests

# Add project references (maintain dependency direction)
dotnet add src/CosmetologyBooking.Application reference src/CosmetologyBooking.Domain
dotnet add src/CosmetologyBooking.Infrastructure reference src/CosmetologyBooking.Application
dotnet add src/CosmetologyBooking.Infrastructure reference src/CosmetologyBooking.Domain
dotnet add src/CosmetologyBooking.API reference src/CosmetologyBooking.Application

# Add test project references
dotnet add tests/CosmetologyBooking.Domain.Tests reference src/CosmetologyBooking.Domain
dotnet add tests/CosmetologyBooking.Application.Tests reference src/CosmetologyBooking.Application
dotnet add tests/CosmetologyBooking.Application.Tests reference src/CosmetologyBooking.Domain
dotnet add tests/CosmetologyBooking.Infrastructure.Tests reference src/CosmetologyBooking.Infrastructure
dotnet add tests/CosmetologyBooking.Infrastructure.Tests reference src/CosmetologyBooking.Application
dotnet add tests/CosmetologyBooking.Infrastructure.Tests reference src/CosmetologyBooking.Domain
dotnet add tests/CosmetologyBooking.API.Tests reference src/CosmetologyBooking.API
dotnet add tests/CosmetologyBooking.API.Tests reference src/CosmetologyBooking.Application
```

---

### 3. Frontend Setup

```bash
# Create React frontend with Vite
cd frontend
npm create vite@latest
# Follow prompts for React + TypeScript
npm install
```

---

### 4. CI/CD Folder

- `.github/workflows/ci.yml`  
  - Contains build, test, lint, and deployment steps for both backend and frontend.

---

### 5. Dependency Direction

- **Domain**: No dependencies.
- **Application**: Depends only on Domain.
- **Infrastructure**: Depends on Application and Domain.
- **API**: Depends only on Application (Infrastructure wired via DI).
- **Tests**: Each test project references only its corresponding layer and dependencies as needed.

---

**Ready for implementation. No code generated yet.**