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