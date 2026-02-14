# SYNCTRACKER - CRITICAL SAVE
## Feb 14, 2026 - ALL INFO NEEDED TO CONTINUE

## PROJECT: /Users/kevinjonassr/Desktop/SyncTracker

## WHAT IT IS
Music Sync Licensing Management System for TV/Film/Ads

## MIGRATION DONE ✅
- vite.config.ts cleaned (Replit plugins removed)
- /server/replit_integrations/ DELETED
- /.replit DELETED
- /server/auth.ts CREATED with Clerk auth
- /server/routes.ts UPDATED to use new auth

## REMAINING STEPS
1. npm install @clerk/clerk-react @clerk/clerk-sdk-node
2. Update client/src/App.tsx with ClerkProvider
3. Create Neon DB at neon.tech (new project "synctracker")
4. Create Clerk app at clerk.com (new app "SyncTracker")
5. Create .env with credentials
6. npm run db:push
7. git init && git add . && git commit -m "Migrate from Replit"
8. git remote add origin git@github.com:KevinJonasSr/synctracker.git
9. git push -u origin main
10. Create Render web service
11. Add env vars in Render

## FANENGAGE PRO (REFERENCE - SAME PATTERN)
- GitHub: https://github.com/KevinJonasSr/fanengage-pro2
- Live: https://fanengage-pro2.onrender.com
- Neon: postgresql://neondb_owner:npg_qMt0sRNHEf6P@ep-frosty-credit-aiianwx3-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require
- Clerk PK: pk_test_cGVhY2VmdWwtZ2xvd3dvcm0tMzIuY2xlcmsuYWNjb3VudHMuZGV2JA
- Clerk SK: sk_test_eXyXko9LOcupjusRGftBcPWL3m3ZxwgMLybspwNR9y

## ENV TEMPLATE
DATABASE_URL=<new neon url>
CLERK_PUBLISHABLE_KEY=<new clerk pk>
CLERK_SECRET_KEY=<new clerk sk>
VITE_CLERK_PUBLISHABLE_KEY=<same as pk>
OPENAI_API_KEY=<for AI features>
NODE_ENV=production

## RENDER SETTINGS
Build: npm install && npm run build
Start: npm start

## SSH KEY (on Mac)
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIB1C46inwquem1iXAD5vcUMtgN/U1Uuo9n2gfLaIDUau kevinjonassr@gmail.com

## USER
Kevin Jonas Sr
kevinjonassr@gmail.com
GitHub: KevinJonasSr

## TEAM
carla@jonasgroup.com
raymond@jonasgroup.com

## COMMANDS
cd /Users/kevinjonassr/Desktop/SyncTracker
npm install
npm run dev
npm run build
npm run db:push

## CLIENT APP.TSX TEMPLATE
```tsx
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
// Wrap app in ClerkProvider
```

## DETAILED MIGRATION GUIDE
See: /Users/kevinjonassr/Desktop/SyncTracker/COMPLETE_MIGRATION_GUIDE.md

## API DOCS
See: /Users/kevinjonassr/Desktop/SyncTracker/API_DOCUMENTATION.md
