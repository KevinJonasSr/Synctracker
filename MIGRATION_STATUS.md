# SYNCTRACKER MIGRATION STATUS
## Updated Feb 14, 2026 - READ THIS FIRST

## IMMEDIATE NEXT STEP
Update routes.ts registerRoutes function (around line 72-90):
1. Remove `await setupAuth(app);` line
2. Add `app.use(clerkAuth);` at the start of registerRoutes
3. Register auth routes with `registerAuthRoutes(app);`
4. Keep the isAllowedUser middleware but update to use Clerk user

## ROUTES.TS EXACT FIX (lines ~69-90)
Change from:
```
export async function registerRoutes(app: Express): Promise<Server> {
  await setupAuth(app);
  registerAuthRoutes(app);
  app.use("/api", (req, res, next) => {
    const authRoutes = ['/api/login', '/api/logout', '/api/callback', '/api/auth/user'];
    ...
    isAuthenticated(req, res, (err) => {
      if (err) return next(err);
      isAllowedUser(req, res, next);
    });
  });
```

Change to:
```
export async function registerRoutes(app: Express): Promise<Server> {
  // Apply Clerk auth middleware
  app.use(clerkAuth);
  
  // Register auth routes
  registerAuthRoutes(app);
  
  // Protect API routes
  app.use("/api", (req, res, next) => {
    const authRoutes = ['/api/auth/user'];
    const url = req.originalUrl.split('?')[0];
    if (authRoutes.includes(url) || url.startsWith('/api/auth/')) {
      return next();
    }
    isAuthenticated(req, res, next);
  });
```

## PROJECT LOCATION
`/Users/kevinjonassr/Desktop/SyncTracker`

## MIGRATION COMPLETED
- ✅ vite.config.ts - Replit plugins removed
- ✅ /server/replit_integrations/ - DELETED
- ✅ /.replit - DELETED
- ✅ /server/auth.ts - Created with Clerk auth middleware
- ✅ /server/routes.ts - Updated import to use new auth.ts

## REMAINING STEPS
1. Update routes.ts lines 69-90 to remove setupAuth() call and use clerkAuth middleware
2. Install Clerk packages: npm install @clerk/clerk-react @clerk/clerk-sdk-node
3. Update client/src/App.tsx with ClerkProvider
4. Create NEW Neon database at neon.tech for SyncTracker
5. Create NEW Clerk app at clerk.com for SyncTracker
6. Update .env with new credentials
7. Run: npm run db:push
8. Create GitHub repo: KevinJonasSr/synctracker
9. Deploy to Render
10. Add environment variables in Render

## ROUTES.TS CHANGES NEEDED
Lines 69-90 need to be updated:
- Remove: `await setupAuth(app);`
- Add: `app.use(clerkAuth);` at the beginning
- Update auth middleware to use clerkAuth pattern

## FANENGAGE PRO REFERENCE (COMPLETED PROJECT)
- GitHub: https://github.com/KevinJonasSr/fanengage-pro2
- Live: https://fanengage-pro2.onrender.com
- Neon DB: postgresql://neondb_owner:npg_qMt0sRNHEf6P@ep-frosty-credit-aiianwx3-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require
- Clerk PK: pk_test_cGVhY2VmdWwtZ2xvd3dvcm0tMzIuY2xlcmsuYWNjb3VudHMuZGV2JA
- Clerk SK: sk_test_eXyXko9LOcupjusRGftBcPWL3m3ZxwgMLybspwNR9y

## SSH KEY (Already configured)
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIB1C46inwquem1iXAD5vcUMtgN/U1Uuo9n2gfLaIDUau kevinjonassr@gmail.com

## USER INFO
- Kevin Jonas Sr
- kevinjonassr@gmail.com
- GitHub: KevinJonasSr

## ENV VARS NEEDED FOR SYNCTRACKER
```
DATABASE_URL=<new Neon database - create at neon.tech>
CLERK_PUBLISHABLE_KEY=<new Clerk app - create at clerk.com>
CLERK_SECRET_KEY=<new Clerk app>
VITE_CLERK_PUBLISHABLE_KEY=<same as publishable>
OPENAI_API_KEY=<for AI pitch matching features>
NODE_ENV=production
```

## RENDER DEPLOYMENT SETTINGS
- Build Command: npm install && npm run build
- Start Command: npm start
- Environment: Node

## WHAT IS SYNCTRACKER
Music Sync Licensing Management System for TV/Film/Ads:
- Deal pipeline tracking (8 stages from New Request to Completed)
- Music catalog management
- Contact/client management
- Revenue & payment tracking
- AI pitch matching (OpenAI)
- Calendar events
- Document/attachment management

## TECH STACK
- Frontend: React 18 + TypeScript + Vite + Tailwind + shadcn/ui
- Backend: Express.js + TypeScript
- Database: Neon PostgreSQL + Drizzle ORM
- Auth: Clerk (migrated from Replit)
- AI: OpenAI API

## TEAM EMAILS
- Carla: carla@jonasgroup.com
- Raymond: raymond@jonasgroup.com

## API DOCUMENTATION
See /Users/kevinjonassr/Desktop/SyncTracker/API_DOCUMENTATION.md for full API docs
