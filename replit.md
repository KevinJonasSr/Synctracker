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
- July 07, 2025. Implemented comprehensive AI and business management features:
  * Smart Pitch Matching - AI-powered song recommendations with themes, seasonality, and occasion analysis
  * Invoice Management - Automated invoice generation with tax calculations and payment tracking
  * Expense Tracking - Business expense management with category organization and tax deductible tracking
  * Rights Clearance Tracker - Monitor publishing splits, mechanical rights, and sync clearance status
  * Version Control System - Track different mixes, edits, and stems with automatic linking
  * Content Protection - Watermarking system for demo tracks and usage monitoring
  * Performance Analytics - Track song performance across different media types
  * Market Intelligence - Industry trend analysis and competitive pricing insights
  * Integrated Messaging - Built-in communication system with contacts and deal participants
  * Approval Workflows - Multi-step approval processes for contracts and major deals
  * Contract Generation - AI-powered contract creation based on deal templates
  * Streaming & Publishing Integration - Connect with platforms for performance data and royalty tracking
- July 08, 2025. Enhanced contact creation and air date tracking:
  * Inline Contact Creation - Add new contacts directly from deal form without navigation
  * Comprehensive Contact Fields - Phone number formatting, current projects tracking, and full contact details
  * Air Date Tracking - Manual air date input with automatic calendar event creation
  * Calendar Integration - Air dates automatically populate calendar for weekly/monthly planning
  * Database Schema Updates - Added air_date column to deals table for tracking broadcast dates
- July 08, 2025. Complete redesign of Add New Deal form with three-section architecture:
  * Section 1: Project Information - Episode number, comprehensive contact management for three entity types (Licensee/Production Company, Music Supervisor, Clearance Company), usage/media/term/territory fields, updated status dropdown with 8 options
  * Section 2: Song Information - Writers/publishing/splits fields, artist/label information, exclusivity with restrictions field, split deal value tracking
  * Section 3: Additional Information - Pitch dates and notes organization
  * Enhanced Deal Value System - Split into "100% Publishing Fee" and "100% Recording Fee" with corresponding split-based fees
  * Comprehensive Contact Management - Full address and contact details for all deal participants
  * Status Management - Updated to include Pitched, Pending Approval, Quoted, Use Confirmed, Being Drafted, Out for Signature, Payment Received, Completed
- July 09, 2025. Completed comprehensive status change date tracking system:
  * Automatic Date Population - Status changes automatically populate corresponding date fields (pitchedDate, pendingApprovalDate, quotedDate, useConfirmedDate, beingDraftedDate, outForSignatureDate, paymentReceivedDate, completedDate)
  * Color-Coded Status Display - Visual status indicators with distinctive colors for easy identification
  * Edit Deal Form Functionality - Fully functional deal editing with proper form validation and date handling
  * Database Schema Optimization - Enhanced insertDealSchema to handle string date inputs with proper conversion to Date objects
  * Storage Layer Date Conversion - Automatic conversion of ISO date strings to Date objects for database compatibility
  * Form Validation Resolution - Fixed complex validation issues preventing form submissions
- July 09, 2025. Enhanced project type management:
  * Added new project types: Promos, Sports, Trailers, Indie Film, Student Film, Non-Profit
  * Alphabetized all project type dropdowns for consistency across application
  * Updated comprehensive add deal form, edit deal form, smart pitch matching, and legacy add deal form
  * Complete project type list: Commercial, Documentary, Film, Game, Indie Film, Non-Profit, Other, Podcast, Promos, Sports, Student Film, Trailers, TV Show
- July 09, 2025. Resolved comprehensive form validation and status tracking system:
  * Fixed server-side validation errors by enhancing insertDealSchema to handle string/number type coercion from form inputs
  * Implemented automatic status date population when deal status is selected in form
  * Enhanced automatic fee calculation with real-time split percentage parsing for both publishing and recording fees
  * Successfully resolved all form submission issues - deals now create properly without validation errors
  * Status dates automatically populate in Additional Information section when corresponding status is selected
  * Form now supports manual status date entry and automatic calculation of fees based on splits percentage
- July 10, 2025. Enhanced pitch creation system and status terminology updates:
  * Resolved critical pitch creation bug by fixing apiRequest function parameter order
  * Updated Deal Pipeline status terminology from "Pitched" to "New Request" across all components
  * Implemented auto-generated submission timestamps for pitch creation
  * Updated database schema default status from "pitched" to "new request"
  * Successfully migrated 15 existing deals from "pitched" to "new request" status
  * Fixed comprehensive status display and filtering across Deal Pipeline, forms, and detail views
  * Updated Add New Deal form to default to "New Request" status
  * Changed "Pitch Date" labels to "New Request Date" in Additional Information section
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```