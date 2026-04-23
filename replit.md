# Amon Tour - Thailand Travel Platform

## Overview
Amon Tour is a full-stack tour management system for a Thai travel agency specializing in Krabi and southern Thailand experiences. The platform includes a public-facing website for customers to browse and request custom tours, contact the agency, and an admin panel for comprehensive content and tour management. The project aims to provide a seamless booking and management experience, integrating external tour providers while offering a rich, localized user interface.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
The frontend is built with **React 18** and **TypeScript**, using **Tailwind CSS** for styling with a custom design system featuring blue (#1e73be) and gold (#E6B64C) theme colors. **Shadcn/ui** components ensure consistency, while **Framer Motion** provides animations. SEO is managed with **React Helmet**.

### Technical Implementations
- **Frontend**: Utilizes **Vite** for fast builds, **Wouter** for routing, **React Query** for server state, and **React Hook Form** with **Zod** for form validation.
- **Backend**: An **Express.js** server with **TypeScript** provides a **RESTful API**. It features middleware for authentication, validation, error handling, **Multer** for file uploads, session management for admin, and rate limiting.
- **Database**: **PostgreSQL** is used with **Drizzle ORM** for type-safe operations, hosted on **Neon Database** (serverless). **Drizzle Kit** handles migrations.

### Feature Specifications
- **Public Website**: Tour browsing (including **Tour Ninja** integration), custom tour requests, contact system, blog, newsletter signup, and SEO optimization.
- **Admin Dashboard**: Tour card builder, blog management, custom tour request processing, newsletter management, and contact message handling.
- **Core Features**: Dynamic content rendering for blocks, WYSIWYG editor for pages, dynamic legal page content, and an automatic browser translation system.

### System Design Choices
- **Modular Block System**: Content is managed through reusable blocks with a defined creation procedure, ensuring consistency and maintainability.
- **API Proxy**: Handles external **Tour Ninja** integration for expanded tour inventory and image management.
- **Comprehensive Error Handling**: Implemented across the platform, especially for form submissions and external API calls.
- **SEO via Dynamic Rendering (SSR)**: Because the site is a React SPA, Googlebot would otherwise see only an empty `<div id="root">`. To fix this, `server/ssrShared.ts` and `server/ssrSeoRoutes.ts` intercept requests from search-engine and social bots (User-Agent based) and return fully-rendered HTML for `/`, `/tours`, `/tour-details/:id`, `/experiences`, `/custom-tour`, `/contact`, `/blog`. Real browsers fall through to the SPA unchanged. Each SSR page includes title, meta description, H1, real DB content, canonical, 11 hreflang locales and JSON-LD structured data (TravelAgency, TouristTrip, BreadcrumbList, ContactPage). Force SSR for testing via `?_ssr=1`.

## External Dependencies

- **@neondatabase/serverless**: PostgreSQL database connectivity.
- **drizzle-orm**: Type-safe database operations.
- **@tanstack/react-query**: Server state management and caching.
- **wouter**: Lightweight client-side routing.
- **zod**: Schema validation.
- **bcrypt**: Password hashing.
- **@radix-ui/**: Accessible UI component primitives.
- **tailwindcss**: Utility-first CSS framework.
- **framer-motion**: Animation library.
- **lucide-react**: Icon library.
- **Tour Ninja API**: External API for tour inventory and details, accessed via a custom server-side proxy.
- **Stripe**: (Prepared for) Payment processing integration.
- **SendGrid**: For email notifications and confirmations.