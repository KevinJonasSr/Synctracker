# SyncTracker Migration Notes
## Created Feb 14, 2026

## PROJECT OVERVIEW
**SyncTracker** - Music Sync Licensing Management System
- Manages sync licensing deals
- Tracks revenue and music catalogs
- Maintains industry contacts
- Deal pipeline tracking
- AI-powered pitch matching

## CURRENT LOCATION
`/Users/kevinjonassr/Desktop/SyncTracker`

## TECH STACK (Same as FanEngage Pro)
- Frontend: React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- Backend: Express.js + TypeScript
- Database: Neon PostgreSQL + Drizzle ORM
- Currently uses: Replit Auth (needs migration to Clerk)

## MIGRATION TASKS
1. ☐ Remove Replit-specific plugins from vite.config.ts
2. ☐ Remove Replit auth - replace with Clerk
3. ☐ Create new Neon database for SyncTracker
4. ☐ Create Clerk app for SyncTracker
5. ☐ Update environment variables
6. ☐ Create GitHub repo (KevinJonasSr/synctracker)
7. ☐ Deploy to Render
8. ☐ Add environment variables in Render
9. ☐ Connect domain (if applicable)

## KEY FEATURES TO PRESERVE
- Dashboard with deal overview
- Music Catalog management
- Deal Pipeline (stages: New Request → Pending Approval → Quoted → Use Confirmed → Being Drafted → Out for Signature → Payment Received → Completed)
- Contact & Relationship Management
- Financial Management (publishing/recording fees)
- Document Management
- Reporting & Analytics
- AI pitch matching (OpenAI integration)

## FILES TO MODIFY
- `/server/index.ts` - Remove Replit auth
- `/server/replit_integrations/` - DELETE entire folder
- `/vite.config.ts` - Remove Replit plugins
- `/client/src/App.tsx` - Add Clerk provider
- `/.replit` - DELETE
- `/replit.md` - Can keep for reference

## ENVIRONMENT VARIABLES NEEDED
```
DATABASE_URL=<new Neon database>
CLERK_PUBLISHABLE_KEY=<new Clerk app>
CLERK_SECRET_KEY=<new Clerk app>
VITE_CLERK_PUBLISHABLE_KEY=<same as above>
OPENAI_API_KEY=<if using AI features>
NODE_ENV=production
```

## RENDER DEPLOYMENT
- Build Command: `npm install && npm run build`
- Start Command: `npm start`

## DEPLOYMENT PATTERN (from FanEngage Pro)
1. Clean up Replit code
2. Add Clerk auth
3. Create Neon DB + push schema
4. Create GitHub repo
5. Deploy to Render
6. Add env vars
7. Test

## FANENGAGE PRO REFERENCE
- GitHub: https://github.com/KevinJonasSr/fanengage-pro2
- Live: https://fanengage-pro2.onrender.com
- Same deployment pattern to follow
