# Amon Tour - Thailand Travel Platform

## Overview

This is a full-stack tour management system for Amon Tour, a Thai travel agency specializing in Krabi and southern Thailand experiences. The application provides a public-facing website for customers to browse tours and experiences, make custom tour requests, and contact the agency, along with an admin panel for content management.

## System Architecture

### Frontend Architecture
- **React 18** with TypeScript for type safety
- **Vite** as the build tool for fast development and optimized production builds
- **Wouter** for lightweight client-side routing
- **Tailwind CSS** with custom design system using blue (#1e73be) and gold (#E6B64C) theme colors
- **Shadcn/ui** components for consistent UI elements
- **React Query (TanStack Query)** for server state management and API caching
- **React Hook Form** with Zod validation for form handling
- **Framer Motion** for animations and transitions
- **React Helmet** for SEO meta tag management

### Backend Architecture
- **Express.js** server with TypeScript
- **RESTful API** structure with route-based organization
- **Middleware-based** request processing (authentication, validation, error handling)
- **File upload handling** with Multer for tour images
- **Session management** for admin authentication
- **Rate limiting** for API protection

### Database Architecture
- **PostgreSQL** with Drizzle ORM for type-safe database operations
- **Neon Database** as serverless PostgreSQL provider with WebSocket support
- **Drizzle Kit** for database migrations and schema management

## Key Components

### Public Website Features
1. **Tour Browsing**: Display featured tours with search and filtering
2. **Tour Ninja Integration**: External tour provider integration via API proxy
3. **Custom Tour Requests**: Form-based system for personalized tour inquiries
4. **Contact System**: Customer inquiry management
5. **Blog System**: Content management for travel articles and guides
6. **Newsletter Signup**: Email subscription management
7. **SEO Optimization**: Meta tags, structured data, sitemap generation

### Admin Dashboard Features
1. **Tour Card Builder**: Visual tour card creation and management
2. **Blog Management**: Create and manage blog posts, categories, and tags
3. **Custom Tour Request Management**: Process and respond to customer inquiries
4. **Newsletter Management**: Manage email subscriptions
5. **Contact Message Management**: Handle customer inquiries

### Database Schema
- `users`: Admin authentication
- `tours`: Tour listings with pricing and media
- `custom_tour_requests`: Customer requests with status tracking
- `contact_messages`: Customer inquiries
- `tour_cards`: Visual tour cards for marketing
- `blog_posts`, `blog_categories`, `blog_tags`: Content management
- `newsletter_subscriptions`: Email marketing

## Data Flow

1. **Public Users**: Browse tours → Make inquiries → Receive responses
2. **Tour Data**: Local tours + Tour Ninja API integration for extended inventory
3. **Admin Users**: Authenticate → Manage content → Process customer requests
4. **API Proxy**: Frontend ↔ Express API ↔ Tour Ninja API ↔ Database

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Database connectivity
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **wouter**: Lightweight routing
- **zod**: Schema validation
- **bcrypt**: Password hashing

### UI/UX Dependencies
- **@radix-ui/***: Accessible component primitives
- **tailwindcss**: Utility-first CSS framework
- **framer-motion**: Animation library
- **lucide-react**: Icon library

### Tour Ninja Integration
- **Custom API**: Integration with Tour Ninja platform for external tour inventory
- **API Proxy**: Server-side proxy to handle Tour Ninja API calls
- **Environment Variables**: API credentials management

### Payment Integration
- **@stripe/stripe-js** and **@stripe/react-stripe-js**: Payment processing (prepared but not fully implemented)

## Deployment Strategy

### Environment Setup
- **Node.js 20**: Runtime environment
- **PostgreSQL 16**: Database system
- **Python 3.11**: Additional scripting support

### Build Process
- **Development**: `npm run dev` - Vite dev server with Express backend
- **Production Build**: `npm run build` - Vite build + esbuild for server bundling
- **Production Start**: `npm run start` - Runs built application

### Deployment Configuration
- **Replit Autoscale**: Configured for automatic scaling
- **Port 5000**: Internal application port
- **Port 80**: External access port
- **Static Assets**: Served from `/uploads` and `/attached_assets`

### Database Management
- **Migrations**: `npm run db:push` using Drizzle Kit
- **Schema**: Centralized in `shared/schema.ts`
- **Seeding**: Tour data migration from JSON files

### Environment Variables
```env
DATABASE_URL=postgresql://...
TOUR_NINJA_API_KEY=your_api_key
TOUR_NINJA_COMPANY_ID=your_company_id
COMPANY_NAME=Amon Tour
SESSION_SECRET=your_secret
STRIPE_SECRET_KEY=your_stripe_key (optional)
SENDGRID_API_KEY=your_sendgrid_key (for email notifications)
```

## Changelog
- June 24, 2025: Initial setup
- June 24, 2025: Integrated complete backend system for 3 public forms (Krabi Celebration, Partnership, Group/Corporate) with full admin management interface, database tables, API endpoints, and notification system
- June 24, 2025: Fixed critical form submission issues - resolved database schema mismatches, corrected field name mappings between frontend forms and backend validation, added comprehensive error handling and logging, implemented toast notifications for user feedback
- June 24, 2025: Added WhatsApp field to Krabi Celebration form and admin panel - updated database schema, form interface, and admin display with international phone number support
- June 24, 2025: Implemented automatic email notification system using SendGrid - admin receives instant alerts for all form submissions (Krabi Celebration, Partnership, Group Corporate) with detailed information, plus confirmation emails sent to clients

## User Preferences

Preferred communication style: Simple, everyday language.