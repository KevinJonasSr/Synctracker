# SyncTracker - Music Sync Licensing Management System

A comprehensive full-stack application for managing music sync licensing deals, catalog, contacts, and revenue tracking.

## Features

- 🎵 **Music Catalog Management**: Comprehensive song metadata with ownership tracking
- 💼 **Deal Pipeline**: Full lifecycle tracking from pitch to payment
- 👥 **Contact & Client Management**: Relationship tracking with detailed profiles
- 💰 **Financial Management**: Revenue tracking, invoicing, and expense management
- 📄 **Document Generation**: Template system for contracts and quotes
- 📧 **Email Management**: Template-based email system with tracking
- 📅 **Calendar Integration**: Event tracking for air dates and deadlines
- 📊 **Analytics & Reporting**: Performance metrics and insights
- 🤖 **Smart Pitch Matching**: AI-powered song-to-project matching
- ⚡ **Workflow Automation**: Automated actions based on triggers

## Technology Stack

### Frontend
- React 18 with TypeScript
- Vite for fast development and builds
- Radix UI + shadcn/ui components
- Tailwind CSS for styling
- TanStack Query for server state management
- React Hook Form with Zod validation
- Wouter for routing

### Backend
- Node.js with Express.js
- PostgreSQL via Neon Serverless
- Drizzle ORM for type-safe database access
- OpenAI API for smart pitch matching
- Resend for email delivery

## Getting Started

### Prerequisites

- Node.js v22 or higher
- npm v10 or higher
- PostgreSQL database (Neon recommended)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd SyncTracker
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `RESEND_API_KEY`: API key for email sending
- `OPENAI_API_KEY`: API key for AI features
- `SESSION_SECRET`: Secret for session encryption

4. Push database schema
```bash
npm run db:push
```

5. (Optional) Run database migrations for indexes
```bash
npm run db:migrate
```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at http://localhost:5000

### Testing

Run tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Run tests with coverage:
```bash
npm run test:coverage
```

Run tests with UI:
```bash
npm run test:ui
```

### Building for Production

Build the application:
```bash
npm run build
```

Start the production server:
```bash
npm start
```

## Project Structure

```
SyncTracker/
├── client/               # Frontend React application
│   └── src/
│       ├── components/  # Reusable UI components
│       ├── pages/       # Page components
│       ├── hooks/       # Custom React hooks
│       └── lib/         # Utilities and helpers
├── server/              # Backend Express application
│   ├── middleware/      # Express middleware
│   │   ├── errorHandler.ts    # Error handling
│   │   ├── logger.ts           # Request logging
│   │   ├── rateLimiter.ts      # Rate limiting
│   │   ├── security.ts         # Security headers
│   │   └── validation.ts       # Input validation
│   ├── migrations/      # Database migrations
│   ├── utils/          # Utility functions
│   │   ├── response.ts        # API response helpers
│   │   └── health.ts          # Health check utilities
│   ├── db.ts           # Database connection
│   ├── routes.ts       # API routes
│   ├── storage.ts      # File storage
│   └── index.ts        # Server entry point
├── shared/             # Shared code between client and server
│   └── schema.ts       # Database schema and types
├── tests/              # Test files
│   ├── middleware/     # Middleware tests
│   └── utils/          # Utility tests
└── dist/              # Production build output
```

## API Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for detailed API documentation including:
- Endpoints
- Request/response formats
- Authentication
- Error codes
- Pagination
- Rate limiting

## New Features & Improvements

### Enhanced Error Handling
- Structured error responses with error codes
- Detailed validation error messages
- Proper HTTP status codes
- Development vs production error details

### Standardized API Responses
All API endpoints now return a consistent format:
```json
{
  "success": true,
  "data": { ... },
  "meta": { "page": 1, "total": 100 }
}
```

### Rate Limiting
- Default: 100 requests per 15 minutes
- Configurable via environment variables
- Rate limit headers in all responses

### Security Enhancements
- Helmet.js security headers
- Input sanitization to prevent XSS
- CORS configuration
- Request size limiting
- Parameter pollution prevention

### Performance Optimizations
- Database indexes on frequently queried fields
- Full-text search capabilities
- Efficient pagination
- Response caching ready

### Monitoring & Health Checks
- `/health` - Overall system health
- `/ready` - Readiness probe
- `/live` - Liveness probe
- Performance monitoring for slow requests
- Comprehensive request logging

### Testing Infrastructure
- Vitest test framework
- Unit tests for utilities and middleware
- Test coverage reporting
- Watch mode for development

## Environment Variables

See `.env.example` for all available environment variables and their descriptions.

### Required
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Secret for session encryption

### Optional
- `RESEND_API_KEY` - For email functionality
- `OPENAI_API_KEY` - For AI-powered features
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 5000)
- `RATE_LIMIT_WINDOW_MS` - Rate limit window (default: 900000)
- `RATE_LIMIT_MAX_REQUESTS` - Max requests per window (default: 100)

## Database Schema

The application uses 25+ tables covering:
- Core entities (songs, contacts, deals, pitches, payments)
- Document management (templates, email templates, attachments)
- Organization (playlists, calendar events, saved searches)
- Advanced features (smart pitch matching, analytics, workflow automation)
- Financial tracking (invoices, expenses, rights clearances)
- Collaboration (messages, approval workflows, bulk pitches)

See `shared/schema.ts` for the complete schema definition.

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage
- `npm run check` - Type check with TypeScript
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run database migrations

## Contributing

1. Create a feature branch
2. Make your changes
3. Add tests for new features
4. Ensure all tests pass
5. Submit a pull request

## License

MIT

## Support

For questions or issues, please contact the development team.

---

**Last Updated**: January 17, 2026
**Version**: 1.0.0
