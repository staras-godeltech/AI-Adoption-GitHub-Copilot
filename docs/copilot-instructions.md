# GitHub Copilot Usage Guide - Cosmetology Booking App

## Project Context
We are building a cosmetology booking app with:
- React + TypeScript frontend
- .NET 8 Minimal API backend
- SQLite database
- JWT authentication

## Prompt Templates

### For Architecture Design
Design a [component/system] for a cosmetology booking app that handles [functionality].
Include: [requirements].
Use: [tech stack].

### For Code Generation
Generate [file/component] that does [task].
Requirements:
- Uses [specific patterns]
- Handles errors for [scenarios]
- Includes [specific features]

### For Refactoring
Refactor this code to improve [aspect].
Current issues: [problems].
Expected outcome: [goals].

### For Testing
Create tests for [component].
Cover:
- Happy path: [scenario]
- Edge cases: [cases]
- Error handling: [errors]

## Best Practices for This Project

1. **Start each session** with: "We are building a cosmetology booking app with React and .NET. Current task: [task]"

2. **Always ask for**:
   - Error handling
   - TypeScript types/interfaces
   - Input validation
   - Comments for complex logic

3. **Review AI code for**:
   - Security issues
   - Performance problems
   - Consistent naming conventions
   - Proper error messages

4. **Document every prompt** in `prompts.md` with:
   - Exact prompt used
   - What was accepted/rejected
   - Why changes were made

## Common Prompts for This Project

### Backend (C#)
- "Create Entity Framework Core model for [entity] with relationships"
- "Generate Minimal API endpoints for [resource] with validation"
- "Implement JWT authentication with role-based authorization"
- "Create repository pattern for [entity]"

### Frontend (React)
- "Create React component for [feature] with TypeScript props"
- "Generate API service layer with axios and error handling"
- "Build form with validation using React Hook Form"
- "Create custom hook for [functionality]"

## Prompt Examples for Each Phase

### Setup Phase
Create a .NET 8 Minimal API project structure with:
- CORS enabled for localhost:5173
- Swagger documentation
- SQLite database context
- Folder structure: Controllers/, Models/, Data/, Services/

### Feature Phase
Build an AppointmentController with endpoints:
- GET /api/appointments - get all (admin only)
- GET /api/appointments/my - get user's appointments
- POST /api/appointments - create new booking
- PUT /api/appointments/{id}/status - update status (admin)
Include validation and proper HTTP status codes.

### Testing Phase
Write xUnit tests for AppointmentService:
- Test booking conflict detection
- Test invalid time slots
- Test overlapping appointments
- Test edge cases (past dates, closing time)

## Quality Checklist Before Accepting AI Code
- [ ] Code follows project conventions
- [ ] Error handling is present
- [ ] Input validation exists
- [ ] No security vulnerabilities
- [ ] Performance is acceptable
- [ ] Code is readable and commented
- [ ] Type safety is maintained
- [ ] Tests are included (when applicable)