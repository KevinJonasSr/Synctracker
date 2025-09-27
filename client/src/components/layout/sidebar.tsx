import { useLocation } from "wouter";
import { Link } from "wouter";
import { Music, BarChart3, Handshake, Send, Users, DollarSign, FileText, ChartBar, Mail, Calendar as CalendarIcon, Folder, TrendingUp } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart3 },
  { name: "Song Database", href: "/songs", icon: Music },
  { name: "Deal Pipeline", href: "/deals", icon: Handshake },
  { name: "Sync Pitches", href: "/pitches", icon: Send },
  { name: "Contacts", href: "/contacts", icon: Users },
  { name: "Income Tracking", href: "/income", icon: DollarSign },
  { name: "Playlists", href: "/playlists", icon: Folder },
  { name: "Templates", href: "/templates", icon: FileText },
  { name: "Email Templates", href: "/email-templates", icon: Mail },
  { name: "Calendar", href: "/calendar", icon: CalendarIcon },
  { name: "Analytics", href: "/analytics", icon: TrendingUp },
  { name: "Reports", href: "/reports", icon: ChartBar },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-card shadow-sm border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-card-foreground">
              <Music className="inline mr-2 text-brand-primary" size={20} />
              Sync Licensing
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Music Rights Management</p>
          </div>
          <ThemeToggle />
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? "text-white bg-brand-primary"
                  : "text-card-foreground hover:bg-muted"
              }`}
              data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <Icon className="mr-3" size={16} />
              {item.name}
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">JM</span>
          </div>
          <div>
            <p className="text-sm font-medium text-card-foreground">John Music</p>
            <p className="text-xs text-muted-foreground">Music Supervisor</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
