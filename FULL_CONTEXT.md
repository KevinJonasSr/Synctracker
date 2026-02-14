# SYNCTRACKER - FULL MIGRATION CONTEXT
## Saved Feb 14, 2026 - CRITICAL - READ THIS FIRST

## IMMEDIATE NEXT STEPS
1. View current files: vite.config.ts, server/index.ts, client/src/App.tsx
2. Remove Replit plugins from vite.config.ts
3. Remove Replit auth from server - add Clerk
4. Create new Neon database at neon.tech
5. Create new Clerk app at clerk.com  
6. Push schema to new database
7. Create GitHub repo: KevinJonasSr/synctracker
8. Deploy to Render
9. Add env vars in Render

## PROJECT LOCATION
`/Users/kevinjonassr/Desktop/SyncTracker`

## WHAT IS SYNCTRACKER
Music Sync Licensing Management System:
- Manages sync licensing deals for music in TV/Film/Ads
- Tracks revenue and music catalogs
- Maintains industry contacts
- Deal pipeline tracking (New Request → Completed)
- AI-powered pitch matching (OpenAI)
- Financial management (publishing/recording fees)

## MIGRATION PLAN (Same pattern as FanEngage Pro)

### Step 1: Clean Replit Code
- DELETE: `/server/replit_integrations/` folder
- DELETE: `/.replit` file
- MODIFY: `/vite.config.ts` - remove Replit plugins
- MODIFY: `/server/index.ts` - remove Replit auth imports

### Step 2: Add Clerk Auth
- Install @clerk/clerk-react and @clerk/express
- Create new Clerk app at clerk.com
- Update App.tsx with ClerkProvider
- Create auth middleware for server

### Step 3: Create Neon Database
- Go to neon.tech
- Create new project "synctracker"
- Get DATABASE_URL connection string
- Run: `npm run db:push`

### Step 4: Deploy
- Create GitHub repo: KevinJonasSr/synctracker
- Create Render web service
- Add environment variables
- Deploy

## TECH STACK
- Frontend: React 18 + TypeScript + Vite + Tailwind + shadcn/ui
- Backend: Express.js + TypeScript
- Database: Neon PostgreSQL + Drizzle ORM
- Auth: Clerk (replacing Replit Auth)
- AI: OpenAI API

## BUILD COMMANDS
```
npm install
npm run dev      # Development
npm run build    # Production build
npm start        # Production server
npm run db:push  # Push schema to database
```

## ENVIRONMENT VARIABLES NEEDED
```
DATABASE_URL=<new Neon database URL>
CLERK_PUBLISHABLE_KEY=<new Clerk app>
CLERK_SECRET_KEY=<new Clerk app>
VITE_CLERK_PUBLISHABLE_KEY=<same as publishable>
OPENAI_API_KEY=<for AI features>
NODE_ENV=production
```

## FANENGAGE PRO REFERENCE (COMPLETED PROJECT)
- GitHub: https://github.com/KevinJonasSr/fanengage-pro2
- Live: https://fanengage-pro2.onrender.com
- Neon DB: postgresql://neondb_owner:npg_qMt0sRNHEf6P@ep-frosty-credit-aiianwx3-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require
- Clerk: pk_test_cGVhY2VmdWwtZ2xvd3dvcm0tMzIuY2xlcmsuYWNjb3VudHMuZGV2JA

## FILES THAT NEED CHANGES

### vite.config.ts - REMOVE THESE LINES:
```
import { cartographer } from "@replit/vite-plugin-cartographer";
import runtimeErrorModal from "@replit/vite-plugin-runtime-error-modal";
// And remove them from plugins array
```

### server/index.ts - REMOVE:
- Any imports from "./replit_integrations/"
- Replace with Clerk auth middleware

### client/src/App.tsx - ADD:
```tsx
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
```

## BACKUP FILES CREATED
- SCHEMA_BACKUP.txt - Database schema
- SERVER_BACKUP.txt - Server index
- VITE_BACKUP.txt - Vite config
- APP_BACKUP.txt - React App component

## RENDER DEPLOYMENT SETTINGS
- Build Command: `npm install && npm run build`
- Start Command: `npm start`
- Environment: Node

## GITHUB SSH KEY (Already configured on this Mac)
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIB1C46inwquem1iXAD5vcUMtgN/U1Uuo9n2gfLaIDUau kevinjonassr@gmail.com
```

## USER INFO
- Name: Kevin Jonas Sr
- Email: kevinjonassr@gmail.com
- GitHub: KevinJonasSr
- Team: Carla (carla@jonasgroup.com), Raymond (raymond@jonasgroup.com)
