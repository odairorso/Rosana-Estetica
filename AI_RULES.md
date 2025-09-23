# AI Rules for Rosana Estética Dashboard

## Tech Stack Overview

- **Frontend Framework**: React 18 with TypeScript for type safety and modern development
- **Build Tool**: Vite for fast development and optimized production builds
- **Styling**: Tailwind CSS with custom design system (beauty salon inspired palette)
- **UI Components**: shadcn/ui library with Radix UI primitives for accessible, customizable components
- **State Management**: React Context API with React Query for server state management
- **Database**: Supabase (PostgreSQL) for real-time data and authentication
- **Icons**: lucide-react for consistent, modern iconography
- **Routing**: React Router v6 for client-side navigation
- **Theming**: next-themes for dark/light mode support
- **Forms**: React Hook Form with Zod validation for type-safe form handling

## Library Usage Rules

### UI Components
- **Always use shadcn/ui components first** - they are pre-installed and ready to use
- Import from `@/components/ui/[component-name]` (e.g., `@/components/ui/button`)
- **Never modify shadcn/ui component files** - create wrapper components if customization is needed
- Use Tailwind classes for styling, never inline styles

### Icons
- **Only use lucide-react** - no other icon libraries
- Import individual icons: `import { IconName } from 'lucide-react'`
- Use consistent sizing: `w-4 h-4` for small, `w-5 h-5` for medium, `w-6 h-6` for large

### Forms & Validation
- **Use React Hook Form** for all form handling
- **Use Zod** for schema validation
- Import from `react-hook-form` and `zod`
- Always create proper TypeScript interfaces for form data

### Data Fetching
- **Use React Query** for all server state management
- Import from `@tanstack/react-query`
- Use proper query keys and invalidation patterns
- Handle loading and error states consistently

### Database Operations
- **Only use Supabase client** from `@/lib/supabaseClient`
- Never expose Supabase credentials in frontend code
- Use environment variables for configuration
- Implement proper error handling for all database operations

### Styling Guidelines
- **Always use Tailwind classes** - no CSS files unless absolutely necessary
- Follow the existing color system (primary, secondary, success, warning, destructive)
- Use responsive design patterns (mobile-first approach)
- Maintain consistent spacing using Tailwind's spacing scale

### Component Structure
- Keep components under 100 lines of code
- Create new files for each component (no multi-component files)
- Use proper TypeScript interfaces for props
- Follow the existing file naming conventions

### State Management
- Use React Context for global app state
- Use React Query for server state
- Use local state (useState) for component-specific state
- Avoid prop drilling by using context appropriately

### Error Handling
- Always show user-friendly error messages using toast notifications
- Use the existing toast system (`useToast` hook)
- Log errors to console for debugging
- Never catch errors unless you can handle them properly

### Performance
- Use React.memo for expensive components
- Implement proper loading states
- Use React Query's caching effectively
- Optimize images and assets

### Security
- Never store sensitive data in localStorage
- Always validate data on both client and server
- Use proper authentication flows
- Sanitize user inputs before database operations