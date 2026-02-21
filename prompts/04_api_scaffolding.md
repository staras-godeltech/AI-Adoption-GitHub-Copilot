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