import { Request, Response, NextFunction, RequestHandler } from "express";

// Temporarily disable Clerk auth for deployment testing
// TODO: Re-enable once environment variables are confirmed working

// Clerk middleware - currently bypassed
export const clerkAuth: RequestHandler = (req, res, next) => {
  // Skip Clerk auth for now - allow all requests
  (req as any).auth = { userId: "temp-user" };
  next();
};

// Check if user is authenticated - temporarily bypassed
export const isAuthenticated: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  // Allow all requests for now
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
