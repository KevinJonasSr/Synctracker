# SYNCTRACKER COMPLETE MIGRATION GUIDE
## Created Feb 14, 2026 - MASTER REFERENCE

## ⚠️ CURRENT STATUS - FEB 14 2026
Most server-side migration is DONE. Remaining:
1. ✅ vite.config.ts - DONE
2. ✅ Replit folders deleted - DONE  
3. ✅ server/auth.ts created - DONE
4. ✅ server/routes.ts updated - DONE
5. ☐ Install: npm install @clerk/clerk-react @clerk/clerk-sdk-node
6. ☐ Update client/src/App.tsx with ClerkProvider
7. ☐ Create Neon DB at neon.tech
8. ☐ Create Clerk app at clerk.com
9. ☐ Create .env file
10. ☐ npm run db:push
11. ☐ Create GitHub repo & push
12. ☐ Deploy to Render

## PROJECT LOCATION
`/Users/kevinjonassr/Desktop/SyncTracker`

## WHAT IS SYNCTRACKER
Music Sync Licensing Management System for TV/Film/Ads:
- Deal pipeline (New Request → Pending Approval → Quoted → Use Confirmed → Being Drafted → Out for Signature → Payment Received → Completed)
- Music catalog management with ownership tracking
- Contact/client management
- Revenue & payment tracking (publishing/recording fees)
- AI pitch matching (OpenAI)
- Calendar events for air dates
- Document/attachment management

## TECH STACK
- Frontend: React 18 + TypeScript + Vite + Tailwind + shadcn/ui
- Backend: Express.js + TypeScript  
- Database: Neon PostgreSQL + Drizzle ORM
- Auth: Clerk (migrated from Replit Auth)
- AI: OpenAI API for pitch matching

## MIGRATION COMPLETED ✅
1. ✅ vite.config.ts - Removed @replit/vite-plugin-cartographer and @replit/vite-plugin-runtime-error-modal
2. ✅ /server/replit_integrations/ folder - DELETED
3. ✅ /.replit file - DELETED
4. ✅ /server/auth.ts - Created with Clerk middleware (clerkAuth, isAuthenticated, registerAuthRoutes)
5. ✅ /server/routes.ts line 15 - Changed import to use new auth.ts

## REMAINING MIGRATION STEPS
1. Update registerRoutes function in routes.ts (lines 72-90) - see FIX below
2. Install packages: `npm install @clerk/clerk-react @clerk/clerk-sdk-node`
3. Update client/src/App.tsx with ClerkProvider
4. Create NEW Neon database at https://neon.tech for SyncTracker
5. Create NEW Clerk app at https://clerk.com for SyncTracker
6. Create .env file with credentials
7. Run: `npm run db:push` to push schema
8. Create GitHub repo: `git remote add origin git@github.com:KevinJonasSr/synctracker.git`
9. Push: `git add . && git commit -m "Migration from Replit" && git push -u origin main`
10. Create Render web service, connect to GitHub
11. Add environment variables in Render

## ROUTES.TS FIX (around line 72-90)
Replace this section:
```typescript
export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication first (before other routes)
  await setupAuth(app);
  registerAuthRoutes(app);

  // Protect all API routes except auth routes
  app.use("/api", (req, res, next) => {
    // Skip authentication for auth-related routes (use originalUrl for full path)
    const authRoutes = ['/api/login', '/api/logout', '/api/callback', '/api/auth/user'];
    const url = req.originalUrl.split('?')[0]; // Remove query string
    if (authRoutes.includes(url) || url.startsWith('/api/auth/')) {
      return next();
    }
    
    // Apply authentication + authorization for all other API routes
    isAuthenticated(req, res, (err) => {
      if (err) return next(err);
      isAllowedUser(req, res, next);
    });
  });
```

With this:
```typescript
export async function registerRoutes(app: Express): Promise<Server> {
  // Apply Clerk auth middleware globally
  app.use(clerkAuth);
  
  // Register auth routes
  registerAuthRoutes(app);

  // Protect all API routes except auth routes
  app.use("/api", (req, res, next) => {
    const authRoutes = ['/api/auth/user'];
    const url = req.originalUrl.split('?')[0];
    if (authRoutes.includes(url) || url.startsWith('/api/auth/')) {
      return next();
    }
    isAuthenticated(req, res, next);
  });
```

## ALSO UPDATE isAllowedUser MIDDLEWARE (around line 50)
Change from using `req.user.claims.email` to using Clerk's auth object:
```typescript
const isAllowedUser: RequestHandler = async (req, res, next) => {
  const auth = (req as any).auth;
  if (!auth?.userId) {
    return res.status(403).json({ message: "Access denied: Not authenticated" });
  }
  // For now, allow all authenticated users (can add email whitelist later)
  next();
};
```

## CLIENT APP.TSX CHANGES
Add Clerk provider (similar to FanEngage Pro):
```tsx
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

function App() {
  if (!clerkPubKey) {
    return <Router />; // For development without auth
  }
  
  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <QueryClientProvider client={queryClient}>
        <Router />
      </QueryClientProvider>
    </ClerkProvider>
  );
}
```

## ENV FILE TEMPLATE (.env)
```
DATABASE_URL=<new Neon database URL - create at neon.tech>
CLERK_PUBLISHABLE_KEY=<new Clerk publishable key - create at clerk.com>
CLERK_SECRET_KEY=<new Clerk secret key>
VITE_CLERK_PUBLISHABLE_KEY=<same as CLERK_PUBLISHABLE_KEY>
OPENAI_API_KEY=<OpenAI API key for AI features>
NODE_ENV=development
```

## RENDER DEPLOYMENT SETTINGS
- Build Command: `npm install && npm run build`
- Start Command: `npm start`
- Environment: Node

## FANENGAGE PRO REFERENCE (COMPLETED PROJECT - SAME PATTERN)
- GitHub: https://github.com/KevinJonasSr/fanengage-pro2
- Live: https://fanengage-pro2.onrender.com
- Neon DB: postgresql://neondb_owner:npg_qMt0sRNHEf6P@ep-frosty-credit-aiianwx3-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require
- Clerk PK: pk_test_cGVhY2VmdWwtZ2xvd3dvcm0tMzIuY2xlcmsuYWNjb3VudHMuZGV2JA
- Clerk SK: sk_test_eXyXko9LOcupjusRGftBcPWL3m3ZxwgMLybspwNR9y

## SSH KEY (Already configured on Mac)
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIB1C46inwquem1iXAD5vcUMtgN/U1Uuo9n2gfLaIDUau kevinjonassr@gmail.com
```

## USER INFO
- Kevin Jonas Sr
- kevinjonassr@gmail.com
- GitHub: KevinJonasSr

## TEAM EMAILS
- Carla: carla@jonasgroup.com
- Raymond: raymond@jonasgroup.com

## BUILD COMMANDS
```bash
cd /Users/kevinjonassr/Desktop/SyncTracker
npm install
npm run dev      # Development server
npm run build    # Production build
npm start        # Production server
npm run db:push  # Push schema to Neon database
npm run db:studio # Drizzle Studio (database GUI)
```

## API DOCUMENTATION
Full API docs at: /Users/kevinjonassr/Desktop/SyncTracker/API_DOCUMENTATION.md
- Songs CRUD
- Contacts CRUD
- Deals CRUD with status pipeline
- Pitches
- Payments
- Templates
- Calendar Events
- Playlists
- AI Smart Pitch Matching

## FILES MODIFIED IN MIGRATION
1. /vite.config.ts - Removed Replit plugins
2. /server/auth.ts - NEW FILE with Clerk auth
3. /server/routes.ts - Updated import, needs registerRoutes fix
4. DELETED: /server/replit_integrations/ folder
5. DELETED: /.replit file

## DOMAIN
- fan-ngaj.com (GoDaddy) - Reserved for FanEngage Pro
- SyncTracker will need separate domain or subdomain
