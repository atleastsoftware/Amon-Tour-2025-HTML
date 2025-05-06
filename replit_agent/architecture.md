# Architecture

## Overview

This application is a tour management system for a Thai travel agency named "Senthang Siam Tour". It follows a full-stack architecture with a React frontend and Express backend, using a PostgreSQL database for data persistence. The application allows customers to browse tours, submit custom tour requests, and contact the agency, while providing administrators with tools to manage tour content.

The system uses a monorepo structure with three main parts:
- `client`: React frontend built with Vite
- `server`: Express backend
- `shared`: Common types and database schemas shared between frontend and backend

## System Architecture

### Frontend Architecture

The frontend is built with React using a component-based architecture, with UI components from Shadcn UI. It follows these design principles:

- **Component-based design**: UI elements are broken down into reusable components
- **Custom hooks**: Encapsulate business logic and API calls
- **Centralized state management**: Using React Query for API state
- **Responsive design**: Tailwind CSS for styling with mobile-first approach
- **Client-side routing**: Using Wouter for lightweight routing

### Backend Architecture

The backend follows a RESTful API architecture built with Express.js, using the following patterns:

- **Route-based organization**: API endpoints organized by domain
- **Service layer pattern**: Business logic abstracted into service modules
- **Data access layer**: Database interactions through Drizzle ORM
- **Middleware-based processing**: Request validation, authentication, and error handling
- **File uploads**: Handling tour image uploads with Multer

### Database Architecture

The application uses a PostgreSQL database with Drizzle ORM for database operations. The schema includes:

- `users`: For admin authentication
- `tours`: Tour listings with details and media
- `custom_tour_requests`: Customer requests for custom tours
- `contact_messages`: Customer inquiries

The database connection uses Neon's serverless PostgreSQL with WebSocket support.

## Key Components

### Frontend Components

1. **UI Components**
   - Shadcn UI components (`client/src/components/ui/`)
   - Layout components (`client/src/components/layout/`)
   - Feature-specific components (`client/src/components/home/`, `client/src/components/tour/`)

2. **Pages**
   - Public pages: Home, Tours, Tour details, Custom tour request
   - Admin pages: Login, Dashboard, Tour form

3. **Services & Utilities**
   - Authentication (`client/src/lib/auth.ts`)
   - API client (`client/src/lib/queryClient.ts`)
   - Utility functions (`client/src/lib/utils.ts`)

### Backend Components

1. **API Routes**
   - Authentication routes (login/logout)
   - Tour management (CRUD operations)
   - Customer inquiries (custom tour requests, contact messages)

2. **Services**
   - Database storage (`server/storage.ts`)
   - File upload handling (`server/upload.ts`)
   - Data migration (`server/migration.ts`)

3. **Middleware**
   - Authentication middleware
   - Request validation
   - Static file serving

### Database Schema

The database schema includes:

1. **users**
   - id (PK)
   - username (unique)
   - password

2. **tours**
   - id (PK)
   - title
   - description
   - shortDescription
   - duration
   - price
   - imageUrl
   - tourNinjaUrl
   - featured

3. **custom_tour_requests**
   - id (PK)
   - name
   - email
   - travelers
   - duration
   - interests (JSON array)
   - message
   - createdAt

4. **contact_messages**
   - id (PK)
   - name
   - email
   - subject
   - message
   - createdAt

## Data Flow

### Public User Flow

1. **Browsing Tours**
   - Client requests tour data via React Query
   - Server queries database for tour information
   - Client displays tours with filtering options

2. **Tour Details**
   - Client requests specific tour details
   - Server retrieves single tour data
   - Client displays comprehensive tour information

3. **Custom Tour Request**
   - User fills out form with requirements
   - Client validates and sends request to server
   - Server stores request in database
   - Confirmation displayed to user

4. **Contact Message**
   - User submits contact form
   - Client validates and sends message to server
   - Server stores message in database
   - Confirmation displayed to user

### Admin User Flow

1. **Authentication**
   - Admin submits login credentials
   - Server validates credentials and creates session
   - Client receives successful authentication response and stores session state

2. **Tour Management**
   - Admin can view, create, edit, and delete tours
   - Image uploads handled with multipart/form-data
   - Form validation on both client and server

3. **Request Management**
   - Admin can view custom tour requests and contact messages
   - No editing or deletion functionality for these records

## External Dependencies

### Frontend Dependencies

- **UI Framework**: React with Vite
- **Component Library**: Shadcn UI (built on Radix UI primitives)
- **Styling**: Tailwind CSS
- **State Management**: React Query
- **Form Handling**: React Hook Form with Zod validation
- **Routing**: Wouter
- **Animations**: Framer Motion

### Backend Dependencies

- **Server Framework**: Express.js
- **Database ORM**: Drizzle ORM
- **Database Client**: @neondatabase/serverless
- **File Upload**: Multer
- **Session Management**: express-session with MemoryStore
- **Validation**: Zod

## Deployment Strategy

The application is configured to run on Replit with the following deployment process:

1. **Development Environment**
   - Development server via `npm run dev`
   - Vite handles hot module reloading
   - Express serves both API and static assets

2. **Production Build**
   - Frontend built with Vite (`npm run build`)
   - Backend bundled with esbuild
   - Output stored in the `dist` directory

3. **Production Deployment**
   - NODE_ENV set to "production"
   - Static assets served from `dist/public`
   - Express handles API requests
   - Database connection using environment variables

4. **Configuration**
   - Environment variables for database connection and session security
   - Replit-specific configuration in `.replit` for deployment
   - Automatic admin user creation for initial setup

5. **Data Migration**
   - Initial tour data loaded from JSON files
   - Migration runs once at startup to seed database if empty

## Security Considerations

1. **Authentication**
   - Session-based authentication for admin users
   - Password storage (note: currently stored in plain text, should be hashed)
   - Route protection via middleware

2. **File Uploads**
   - File type validation
   - Size limits
   - Secure file naming

3. **Data Validation**
   - Input validation with Zod schemas
   - API request validation

4. **Environment Variables**
   - Database connection strings
   - Session secrets