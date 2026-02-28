# Copilot Instructions — CosmetologyBooking

## Project Architecture

This project follows strict Clean Architecture:

Domain → Application → Infrastructure → API

Dependency rules:

- Domain has NO dependencies.
- Application depends ONLY on Domain.
- Infrastructure depends on Application and Domain.
- API depends ONLY on Application.
- Infrastructure is wired in API as the composition root via DI.
- No outer layer may be referenced by an inner layer.

Violations of dependency direction are NOT allowed.

---

## Layer Responsibilities

### Domain Layer
Contains:
- Entities
- Value Objects
- Enums (UserRole, AppointmentStatus)
- Domain business rules

Rules:
- No framework dependencies.
- No EF Core attributes.
- No ASP.NET references.
- No logging abstractions.
- Pure business logic only.

---

### Application Layer
Contains:
- DTOs (input/output models)
- CQRS use case handlers (Commands & Queries)
- Repository interfaces
- Authentication abstractions (IExternalAuthService, ITokenService)
- Logging abstraction (ILoggerService)
- Mapping abstraction
- Validation logic

Rules:
- Must depend only on Domain.
- Must not reference Infrastructure.
- Must not reference ASP.NET types (HttpContext, IActionResult, etc.).
- Use case handlers must be framework-agnostic.
- DTOs must never expose domain entities directly.
- Business logic belongs here, not in API.

---

### Infrastructure Layer
Contains:
- EF Core DbContext
- Repository implementations
- Authentication services (OAuthService, JwtService)
- Logging implementation (e.g., Serilog)
- AutoMapper profiles
- External integrations

Rules:
- Implements interfaces defined in Application.
- No business logic.
- No controller logic.
- Must not introduce dependency inversion violations.

---

### API Layer
Contains:
- Controllers
- Middleware (Global Exception Handling)
- Swagger configuration
- Dependency injection configuration
- Authorization policies

Rules:
- Thin controllers.
- No business logic inside controllers.
- Only call Application use cases.
- Never expose domain entities directly.
- Always use DTOs.

---

## Architectural Patterns

### CQRS
- Commands mutate state.
- Queries read state.
- Separate handlers per use case.
- Handlers implement explicit interfaces.

### Repository Pattern
- Interfaces defined in Application.
- Implementations in Infrastructure.
- No direct DbContext usage outside Infrastructure.

### DTO Policy
- DTOs live in Application.
- Required for all API input/output.
- Domain entities must never cross API boundary.

### Mapping
- AutoMapper configuration in Infrastructure.
- Application depends only on abstraction.
- Handlers use mapping abstraction.

### Concurrency Strategy
- For InMemory provider:
  - Perform availability checks at Application level.
- For relational DB:
  - Use optimistic concurrency (RowVersion).

---

## Authentication & Authorization

- Application defines IExternalAuthService and ITokenService.
- Infrastructure implements them.
- JWT must contain role claim.
- Role-based authorization enforced in API via policies.
- UserRole enum used in Domain.

---

## Logging

- Application defines ILoggerService abstraction.
- Infrastructure implements logging.
- Do not use Console.WriteLine in business logic.

---

## Coding Standards

- Follow SOLID principles.
- Prefer constructor injection.
- Avoid static helpers for business logic.
- Prefer explicit interfaces.
- Use async/await for I/O operations.
- Keep methods small and single-responsibility.
- Avoid magic strings.

---

## Testing

- Each layer has a corresponding test project.
- Domain tests focus on business rules.
- Application tests focus on use case logic.
- Infrastructure tests focus on repository behavior.
- API tests focus on endpoint behavior.

Do not generate untestable code.

---

## Generation Constraints for Copilot

When generating code:

- Respect layer boundaries.
- Do not introduce cross-layer references.
- Do not inject Infrastructure into Application.
- Do not expose EF Core types outside Infrastructure.
- Do not place business logic in Controllers.
- Prefer clarity over cleverness.
- Avoid over-engineering.
- Generate production-quality, maintainable code.

If a request conflicts with architecture rules, follow architecture rules.

---

## Auto-Logging Requirements

The agent MUST automatically log every prompt used in `docs/prompts.md` in the following format:

### When starting a new prompt:
1. Ask user: "Should I log this prompt to prompts.md?"
2. If yes, add entry with:
   - Date (YYYY-MM-DD)
   - The exact prompt used
   - "In progress" as initial result
   - Empty changes field

### When completing a task:
1. Ask user: "What was the result and any changes made?"
2. Update the prompt entry with:
   - Result summary
   - Changes made
   - Any issues encountered

### For follow-up prompts:
1. Always check if there's an existing entry for current task
2. Update the same entry or create new one as appropriate
3. Maintain chronological order in prompts.md

### Example format:
```markdown
| Date | Prompt | Result | Changes Made |
|------|--------|--------|--------------|
| 2024-02-28 | "Initial setup prompt..." | AuthContext created | Added token storage |
```