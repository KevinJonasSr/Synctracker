# Sync Licensing Management System

## Overview

This is a comprehensive music sync licensing management system built with React, Express, and PostgreSQL. The application helps music industry professionals manage their sync licensing deals, track revenue, organize music catalogs, and maintain industry contacts. It features a modern web interface with server-side rendering capabilities and a robust API backend.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon serverless PostgreSQL
- **API Design**: RESTful API with type-safe endpoints
- **Validation**: Zod schemas for request/response validation
- **Build Process**: ESBuild for production bundling

### Development Setup
- **Development Server**: Vite dev server with HMR
- **Production Build**: Static assets served by Express
- **TypeScript**: Full-stack TypeScript with shared types
- **Database Migrations**: Drizzle Kit for schema management

## Key Components

### Database Schema
The application uses a relational database with the following main entities:

1. **Songs**: Music catalog with metadata (title, artist, genre, mood, BPM, etc.)
2. **Contacts**: Industry contacts with company and role information
3. **Deals**: Sync licensing deals linking songs to contacts with project details
4. **Pitches**: Track pitch communications and follow-ups
5. **Payments**: Revenue tracking with payment status and due dates
6. **Templates**: Reusable document templates for contracts and quotes

### Core Features
- **Dashboard**: Overview of active deals, revenue metrics, and urgent actions
- **Song Database**: Comprehensive music catalog management
- **Deal Pipeline**: Track sync licensing opportunities through various stages
- **Contact Management**: Maintain industry relationships and contact information
- **Revenue Tracking**: Monitor payments and income from sync deals
- **Document Templates**: Generate contracts, quotes, and licensing agreements
- **Reporting**: Analytics and insights on deal performance

### User Interface
- **Responsive Design**: Mobile-first approach with desktop optimization
- **Dark/Light Mode**: CSS variables for theme switching
- **Accessibility**: ARIA-compliant components from Radix UI
- **Form Validation**: Real-time validation with user-friendly error messages
- **Data Visualization**: Charts and metrics for business insights

## Data Flow

1. **Client Requests**: React components make API calls through TanStack Query
2. **API Processing**: Express routes handle requests with validation
3. **Database Operations**: Drizzle ORM manages PostgreSQL interactions
4. **Response Handling**: Type-safe data returned to client components
5. **State Management**: TanStack Query caches and synchronizes server state
6. **UI Updates**: React components re-render with updated data

## External Dependencies

### Database
- **Neon PostgreSQL**: Serverless PostgreSQL database
- **Connection**: WebSocket-based connection for serverless compatibility

### UI Components
- **Radix UI**: Headless UI components for accessibility
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library for consistent iconography

### Development Tools
- **Vite**: Fast development server and build tool
- **ESBuild**: Fast JavaScript bundler for production
- **TypeScript**: Type safety across the entire stack

## Deployment Strategy

### Production Build
1. **Frontend**: Vite builds static assets to `dist/public`
2. **Backend**: ESBuild bundles server code to `dist/index.js`
3. **Database**: Drizzle migrations run on deployment
4. **Environment**: Environment variables configure database connection

### Development Workflow
1. **Local Development**: `npm run dev` starts development server
2. **Database Setup**: `npm run db:push` applies schema changes
3. **Type Checking**: `npm run check` validates TypeScript
4. **Production**: `npm run build && npm start` for production mode

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string (required)
- **NODE_ENV**: Environment mode (development/production)
- **REPL_ID**: Replit-specific configuration for development

## Changelog

```
Changelog:
- July 07, 2025. Initial setup
- July 07, 2025. Added integration features:
  * Email Templates - Pre-written templates for different licensing stages
  * File Attachment System - Upload and manage contracts, demos, project files
  * Calendar Integration - Track important dates and deadlines
- July 07, 2025. Enhanced song metadata system:
  * Comprehensive metadata fields (25+ industry-standard fields)
  * Professional identifiers (ISRC, UPC/EAN, IRC, P-Numbers)
  * Rights and publishing contact information
  * Technical details (file format, sample rate, BPM/key combinations)
  * Tabbed form interface for better organization
- July 07, 2025. Implemented advanced platform features:
  * Advanced Search System - Multi-criteria search with genre, mood, BPM, and metadata filters
  * Playlist Management - Organize songs into collections for clients, genres, or projects
  * Revenue Analytics Dashboard - Comprehensive reporting with charts and performance metrics
  * Workflow Automation - Automated tasks and reminders based on triggers and conditions
  * Client Relationship Management - Detailed client profiles with preferences and success tracking
  * Enhanced Integration Features - Expanded database schema for advanced functionality
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```