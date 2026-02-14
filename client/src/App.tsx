import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { ClerkProvider, SignedIn, SignedOut } from "@clerk/clerk-react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { Suspense, lazy, useState, useEffect } from "react";
import Sidebar from "@/components/layout/sidebar";
import OnboardingTour from "@/components/OnboardingTour";
import { useAuth } from "@/hooks/use-auth";
import LandingPage from "@/pages/landing";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const Dashboard = lazy(() => import("@/pages/dashboard"));
const Songs = lazy(() => import("@/pages/songs"));
const Deals = lazy(() => import("@/pages/deals"));
const Pitches = lazy(() => import("@/pages/pitches"));
const Contacts = lazy(() => import("@/pages/contacts"));
const Income = lazy(() => import("@/pages/income"));
const Templates = lazy(() => import("@/pages/templates"));
const Reports = lazy(() => import("@/pages/reports"));
const EmailTemplates = lazy(() => import("@/pages/email-templates"));
const Calendar = lazy(() => import("@/pages/calendar"));
const Playlists = lazy(() => import("@/pages/playlists"));
const Analytics = lazy(() => import("@/pages/analytics"));
const NotFound = lazy(() => import("@/pages/not-found"));

function AuthenticatedApp() {
  const [tourEnabled, setTourEnabled] = useState(false);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('hasSeenSyncTrackerTour');
    if (!hasSeenTour) {
      setTimeout(() => setTourEnabled(true), 500);
    }
  }, []);

  const handleTourExit = () => {
    setTourEnabled(false);
    localStorage.setItem('hasSeenSyncTrackerTour', 'true');
  };

  const handleStartTour = () => {
    setTourEnabled(true);
  };

  return (
    <>
      {tourEnabled && <OnboardingTour enabled={tourEnabled} onExit={handleTourExit} />}
      <div className="flex min-h-screen bg-background">
        <Sidebar onStartTour={handleStartTour} />
        <main className="flex-1 lg:ml-64 bg-background">
          <Suspense fallback={<div className="p-6 text-muted-foreground">Loading...</div>}>
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/songs" component={Songs} />
              <Route path="/deals" component={Deals} />
              <Route path="/pitches" component={Pitches} />
              <Route path="/contacts" component={Contacts} />
              <Route path="/income" component={Income} />
              <Route path="/templates" component={Templates} />
              <Route path="/reports" component={Reports} />
              <Route path="/email-templates" component={EmailTemplates} />
              <Route path="/calendar" component={Calendar} />
              <Route path="/playlists" component={Playlists} />
              <Route path="/analytics" component={Analytics} />
              <Route component={NotFound} />
            </Switch>
          </Suspense>
        </main>
      </div>
    </>
  );
}

function AppContent() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return user ? <AuthenticatedApp /> : <LandingPage />;
}

function App() {
  // If no Clerk key, run without auth (for development)
  if (!clerkPubKey) {
    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <TooltipProvider>
            <AppContent />
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    );
  }

  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <TooltipProvider>
            <AppContent />
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

export default App;
