import { Request, Response, NextFunction, RequestHandler } from "express";

// Check if Clerk keys are configured
const hasClerkKeys = process.env.CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY;

// Clerk middleware that adds auth to request (only if keys are configured)
export const clerkAuth: RequestHandler = (req, res, next) => {
  if (!hasClerkKeys) {
    // Skip Clerk auth if not configured
    (req as any).auth = { userId: null };
    return next();
  }
  
  // Dynamically import and use Clerk
  const { ClerkExpressWithAuth } = require("@clerk/clerk-sdk-node");
  return ClerkExpressWithAuth()(req, res, next);
};

// Check if user is authenticated
export const isAuthenticated: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  const auth = (req as any).auth;
  
  if (!auth?.userId) {
    return res.status(401).json({ 
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Authentication required"
      }
    });
  }
  
  next();
};

// Auth routes for client-side
export function registerAuthRoutes(app: any) {
  // Get current user info
  app.get("/api/auth/user", clerkAuth, async (req: Request, res: Response) => {
    const auth = (req as any).auth;
    
    if (!auth?.userId) {
      return res.json({ user: null });
    }

    res.json({ 
      user: {
        id: auth.userId,
        email: auth.sessionClaims?.email,
      }
    });
  });
}
