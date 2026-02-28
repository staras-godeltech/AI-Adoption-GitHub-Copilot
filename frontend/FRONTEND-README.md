# Cosmetology Booking - Frontend

A React + TypeScript + TailwindCSS frontend application for the Cosmetology Booking system.

## Tech Stack

- **React 19.2** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **TailwindCSS v4** - Utility-first CSS framework
- **ESLint** - Code linting

## Project Structure

```
src/
├── components/     # Reusable UI components
│   └── Button.tsx  # Example button component with TailwindCSS
├── pages/          # Page components
│   └── HomePage.tsx # Landing page
├── layouts/        # Layout components
│   └── MainLayout.tsx # Main app layout with header/footer
├── services/       # API and external services
│   └── api.ts      # API client configuration
├── types/          # TypeScript type definitions
│   └── index.ts    # Common types (User, Service, Appointment, etc.)
├── assets/         # Static assets
├── App.tsx         # Root component
├── main.tsx        # Entry point
└── index.css       # Global styles with TailwindCSS directives
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server (runs on http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## Configuration

### Vite Config

The Vite dev server is configured to:
- Run on port **5173**
- Auto-open browser on start

### TailwindCSS Config

TailwindCSS v4 is configured via:
- `tailwind.config.js` - Content paths and theme customization
- `postcss.config.js` - PostCSS plugins (@tailwindcss/postcss, autoprefixer)
- `src/index.css` - TailwindCSS directives

## Available Components

### Button Component
Located in `src/components/Button.tsx`

```tsx
import Button from './components/Button';

<Button variant="primary">Click Me</Button>
<Button variant="secondary">Cancel</Button>
```

### MainLayout
Located in `src/layouts/MainLayout.tsx`

Provides consistent header, footer, and content area across pages.

### HomePage
Located in `src/pages/HomePage.tsx`

Example landing page demonstrating TailwindCSS utility classes.

## API Integration

The `api.ts` service provides a configured HTTP client for backend communication:

```tsx
import apiClient from './services/api';

// GET request
const services = await apiClient.get<Service[]>('/services');

// POST request
const appointment = await apiClient.post('/appointments', data);
```

Set the API base URL via environment variable:
```bash
VITE_API_URL=http://localhost:5000/api
```

## Type Definitions

Common types are defined in `src/types/index.ts`:
- `User`
- `Service`
- `TimeSlot`
- `Appointment`

## Next Steps

1. Install React Router for navigation
2. Add authentication context and protected routes
3. Create service listing and booking forms
4. Implement admin dashboard
5. Add form validation library (e.g., React Hook Form)
6. Set up state management (Context API or Zustand)

## Development Notes

- The project uses **React 19.2** with modern patterns
- TailwindCSS v4 requires `@tailwindcss/postcss` package
- All components use TypeScript for type safety
- ESLint is configured for code quality

## Troubleshooting

### TailwindCSS not working
Ensure `@tailwindcss/postcss` is installed:
```bash
npm install -D @tailwindcss/postcss
```

### Port 5173 already in use
Change the port in `vite.config.ts`:
```ts
server: {
  port: 3000, // or any available port
}
```

## License

MIT
