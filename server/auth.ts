import { Request, Response, NextFunction, RequestHandler } from "express";
import { ClerkExpressWithAuth } from "@clerk/clerk-sdk-node";

// Clerk middleware that adds auth to request
export const clerkAuth = ClerkExpressWithAuth();

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
