import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { Suspense, lazy } from "react";
import Sidebar from "@/components/layout/sidebar";

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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Sidebar />
          <Suspense fallback={<div>Loading...</div>}>
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
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
