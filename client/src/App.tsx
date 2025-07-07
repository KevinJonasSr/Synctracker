import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Songs from "@/pages/songs";
import Deals from "@/pages/deals";
import Pitches from "@/pages/pitches";
import Contacts from "@/pages/contacts";
import Income from "@/pages/income";
import Templates from "@/pages/templates";
import Reports from "@/pages/reports";
import Sidebar from "@/components/layout/sidebar";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/songs" component={Songs} />
      <Route path="/deals" component={Deals} />
      <Route path="/pitches" component={Pitches} />
      <Route path="/contacts" component={Contacts} />
      <Route path="/income" component={Income} />
      <Route path="/templates" component={Templates} />
      <Route path="/reports" component={Reports} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="flex h-screen bg-gray-50">
          <Sidebar />
          <main className="flex-1 overflow-y-auto">
            <Router />
          </main>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
