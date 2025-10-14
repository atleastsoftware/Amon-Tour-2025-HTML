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

## Development Guidelines

### Adding a New Block Type to the Page Editor

When adding a new block type to the incremental block library system, follow this complete checklist to avoid common issues:

#### 1. Database Schema (`shared/schema.ts`)
- Add the new block type to the `block_type` enum using SQL ALTER TYPE command
- Example: `ALTER TYPE block_type ADD VALUE IF NOT EXISTS 'contact';`

#### 2. Block Component (`client/src/components/blocks/YourBlock.tsx`)
- Create the visual component that renders the block on the public site
- Ensure it accepts a `block` prop with structure: `{ id: number, configuration?: {...} }`
- **CRITICAL**: Use nullish coalescing (`??`) instead of logical OR (`||`) for default values to allow empty strings:
  ```typescript
  const title = config.title ?? "Default Title";  // ✅ Correct - allows empty strings
  const title = config.title || "Default Title";  // ❌ Wrong - empty string becomes default
  ```
- Conditionally render sections based on content to avoid empty spaces:
  ```typescript
  {title && <h2>{title}</h2>}  // Only render if title exists
  ```

#### 3. Server Configuration (`server/routes.ts`)
- Add default data for the new block type in the `defaultBlockData` object
- Include all editable fields with French default values

#### 4. Block Selection Popup (`client/src/components/admin/BlockSelectionPopup.tsx`)
- Add the block to the `blockTypes` array with:
  - `type`: The block type identifier
  - `label`: Display name
  - `description`: Brief description
  - `icon`: Lucide icon
  - `preview`: Visual preview component showing the block's appearance

#### 5. Preview Components - **CRITICAL: All 3 must be updated**

##### a) RealBlockPreview (`client/src/components/admin/RealBlockPreview.tsx`)
- Add a `case` for the new block type in the miniature preview switch
- Use simplified mini representation (small text sizes, compact layout)

##### b) RealBlockPreview in Page Editor (`client/src/pages/admin-page-editor.tsx`)
- **Import the block component** at the top of the file
- Add a `case` for the new block type in the `getActualComponent()` switch
- Pass the block configuration merged with liveConfiguration for real-time preview
- Example:
  ```typescript
  case 'contact':
    const contactConfig = liveConfiguration || block.configuration || {};
    return <ContactBlock block={{ id: block.id, configuration: contactConfig }} />;
  ```

##### c) BlockPreview (`client/src/components/admin/BlockPreview.tsx`)
- Add a `case` in the `SimplifiedPreview` switch for the simplified editor preview
- Show a representative preview with proper styling

#### 6. Block Configuration Editor (`client/src/pages/admin-page-editor.tsx`)
- Add a `case` for the new block type in the configuration switch (before `default:`)
- Create form inputs for all editable properties:
  - Use `<Input>`, `<Textarea>`, `<ColorPicker>`, `<Switch>`, etc.
  - Call `updateField('fieldName', value)` for changes
  - Use `formData.fieldName || 'default'` for controlled values
  - Group related fields with `<Separator />` for better organization

#### 7. Dynamic Blocks Renderer (`client/src/components/DynamicBlocksRenderer.tsx`)
- Add a `case` to render the block on the public site
- Pass the full block configuration

#### Common Pitfalls to Avoid:
1. **Missing import** - Always import the block component in `admin-page-editor.tsx`
2. **Wrong prop structure** - Block components expect `{ id, configuration }` object, not individual props
3. **Missing preview case** - Must add to ALL 3 preview locations
4. **No editor fields** - Must add configuration case in the editor switch
5. **Using `||` for defaults** - ALWAYS use `??` (nullish coalescing) instead of `||` (logical OR) to allow empty strings. This prevents fields from showing default values when users intentionally leave them empty.
6. **Not hiding empty sections** - Wrap optional content in conditional rendering `{value && <element>{value}</element>}` to avoid empty spaces in the layout

## Changelog
- June 24, 2025: Initial setup
- June 24, 2025: Integrated complete backend system for 3 public forms (Krabi Celebration, Partnership, Group/Corporate) with full admin management interface, database tables, API endpoints, and notification system
- June 24, 2025: Fixed critical form submission issues - resolved database schema mismatches, corrected field name mappings between frontend forms and backend validation, added comprehensive error handling and logging, implemented toast notifications for user feedback
- June 24, 2025: Added WhatsApp field to Krabi Celebration form and admin panel - updated database schema, form interface, and admin display with international phone number support
- June 24, 2025: Implemented automatic email notification system using SendGrid - admin receives instant alerts for all form submissions (Krabi Celebration, Partnership, Group Corporate) with detailed information, plus confirmation emails sent to clients
- August 9, 2025: Completed comprehensive Tour Ninja image diagnostics and fixes - resolved image loading issues through improved error handling, increased proxy timeout, and enhanced fallback displays. All Tour Ninja images now display properly with elegant fallbacks.
- August 9, 2025: Implemented automatic browser translation system using IP geolocation - detects French-speaking visitors (FR, BE, CH, CA) and triggers native browser translators automatically. Admin interface at `/admin-translation` for configuration and testing.
- August 9, 2025: Successfully implemented authentic TourNinja presentation images - replaced generic Unsplash fallbacks with real tour-specific presentation images via `/api/image-proxy/{tourId}/presentation` URLs. All 18 tours now display their authentic promotional images as configured in TourNinja dashboard.
- August 9, 2025: Completed full Tour Ninja API integration with custom image override system - added real API keys, now displaying all 18 tours instead of 1 demo tour. Implemented complete admin dashboard for image management with upload, CRUD operations, and automatic frontend application of custom images with fallback system.
- October 8, 2025: Fixed critical UI issues in page editor - restored missing divider before "Modifier le formulaire complet" button, added form image display in DynamicFormBlockPreview component. Theme uses new brand colors: primary #084F6E (blue-green) and secondary #3BA8AF (turquoise) with updated logo.
- October 14, 2025: Implemented Contact block with comprehensive editing options - added new "contact" block type with email, phone, WhatsApp, Line ID contact methods plus optional "About Our Company" section. Documented complete block creation procedure in Development Guidelines to prevent recurring integration issues.
- October 14, 2025: Fixed critical empty field handling - replaced `||` with `??` (nullish coalescing) in all block components to allow empty strings. Added conditional rendering to hide empty sections and prevent unwanted default values. Updated development guidelines with this best practice for future block creation.
- October 14, 2025: Implemented Blog Search block - added "blog_search" block type with full blog display system including search bar, tags/categories filtering, and blog post cards. Features include customizable "Couleur des annonces" for Read More buttons and gradient backgrounds when images are absent, plus customizable colors for filter buttons (active/inactive states) and editable placeholder text. Block displays real blog posts with filtering functionality and dynamic connection to blog API. Completed all 7 integration steps following established block creation procedure.

## User Preferences

Preferred communication style: Simple, everyday language.