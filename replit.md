# Sync Licensing Management System

## Overview
This project is a comprehensive music sync licensing management system. Its primary purpose is to empower music industry professionals by providing tools to manage sync licensing deals, track revenue, organize music catalogs, and maintain industry contacts. The system aims to streamline operations with a modern web interface and a robust API backend, facilitating efficient deal management, financial oversight, and relationship management within the sync licensing ecosystem. Key capabilities include a comprehensive music catalog, deal pipeline tracking, revenue analytics, and intelligent features for pitch matching and contract generation.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Design Philosophy
The system adopts a full-stack TypeScript approach, ensuring type safety across both frontend and backend. It leverages modern web technologies for a responsive and performant user experience, with a focus on accessibility and intuitive design.

### Frontend
- **Framework**: React with TypeScript for component-based UI development.
- **Build Tool**: Vite for rapid development and optimized production builds.
- **UI/UX**: Radix UI for accessible, unstyled components, styled with shadcn/ui and Tailwind CSS for a customizable theme, supporting dark/light modes.
- **State Management**: TanStack Query for efficient server state management, caching, and synchronization.
- **Routing**: Wouter for lightweight client-side routing.
- **Form Management**: React Hook Form integrated with Zod for robust form validation.
- **Visuals**: Incorporates charts and metrics for business insights and uses Lucide React for consistent iconography.

### Backend
- **Runtime & Framework**: Node.js with Express.js for a powerful and flexible RESTful API.
- **Database**: PostgreSQL, accessed via Drizzle ORM for type-safe database interactions and schema management (Drizzle Kit).
- **Validation**: Zod schemas for rigorous request and response validation, ensuring data integrity.
- **Build Process**: ESBuild for efficient production bundling of server code.

### Core Features
- **Dashboard**: Provides an overview of active deals, revenue, and pending actions.
- **Music Catalog**: Manages comprehensive song metadata, including professional identifiers and rights information. Supports multiple artists and composers.
- **Deal Pipeline**: Tracks licensing opportunities through various stages (New Request, Pending Approval, Quoted, Use Confirmed, Being Drafted, Out for Signature, Payment Received, Completed). Includes automatic date tracking for status changes.
- **Contact & Relationship Management**: Manages industry contacts and client profiles, including inline contact creation.
- **Financial Management**: Features revenue tracking, automated invoice generation, expense tracking, and detailed financial breakdowns (publishing and recording fees). Uses accurate ownership percentages for fee calculations: publishing fees use publishing ownership, recording fees use master ownership.
- **Document Management**: Allows for file attachments (contracts, demos), document template generation, and version control for mixes/stems.
- **Reporting & Analytics**: Offers comprehensive reporting, performance analytics, and market intelligence.
- **AI & Automation**: Includes AI-powered smart pitch matching, workflow automation, and AI-assisted contract generation.
- **Integration**: Supports calendar integration for air dates and built-in messaging.

### Data Flow
Client requests made via TanStack Query are processed by Express routes, which interact with PostgreSQL via Drizzle ORM. Type-safe responses are returned, updating the React UI through TanStack Query's state management.

## External Dependencies

- **Neon PostgreSQL**: Serverless PostgreSQL database for scalable and flexible data storage.
- **Radix UI**: Headless UI component library for building accessible user interfaces.
- **Tailwind CSS**: Utility-first CSS framework for rapid and consistent styling.
- **Lucide React**: Icon library for a consistent visual language.
- **Vite**: Frontend build tool for development and production.
- **ESBuild**: Backend bundler for optimizing server code.
- **TypeScript**: Used across the full stack for type safety.