import { Button } from "@/components/ui/button";
import { Music2, FileText, DollarSign, Calendar, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-background/80 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Music2 className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xl font-semibold text-foreground">Sync Tracker</span>
          </div>
          <Button asChild className="shadow-lg">
            <a href="/api/login">
              Sign In
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </nav>

      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-6xl font-serif font-bold text-foreground leading-tight">
                  Manage Your Music Sync Licensing
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Streamline your sync licensing workflow with powerful tools for catalog management, deal tracking, and revenue analytics.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild className="shadow-xl hover:shadow-2xl transition-all">
                  <a href="/api/login">
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </a>
                </Button>
              </div>

              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  Secure Access
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  Invite Only
                </span>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/5 rounded-3xl blur-3xl" />
              <div className="relative grid grid-cols-2 gap-4">
                <FeatureCard
                  icon={<Music2 className="h-6 w-6" />}
                  title="Music Catalog"
                  description="Organize your entire catalog with metadata, rights info, and more"
                />
                <FeatureCard
                  icon={<FileText className="h-6 w-6" />}
                  title="Deal Pipeline"
                  description="Track licensing opportunities from pitch to payment"
                />
                <FeatureCard
                  icon={<DollarSign className="h-6 w-6" />}
                  title="Revenue Tracking"
                  description="Monitor income, generate invoices, and track payments"
                />
                <FeatureCard
                  icon={<Calendar className="h-6 w-6" />}
                  title="Calendar & Dates"
                  description="Never miss an air date or deadline"
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-border/50 py-6">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Sync Tracker. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="group p-6 rounded-2xl bg-card/50 hover:bg-card border border-border/50 hover:border-border transition-all duration-300 hover:shadow-xl">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
