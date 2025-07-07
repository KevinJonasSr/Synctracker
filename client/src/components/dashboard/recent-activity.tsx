import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CheckCircle, Handshake, Send, Music, AlertTriangle } from "lucide-react";
import type { DashboardMetrics } from "@shared/schema";

interface RecentActivityProps {
  activities: DashboardMetrics['recentActivity'];
}

export default function RecentActivity({ activities }: RecentActivityProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "payment":
        return { icon: CheckCircle, color: "bg-status-completed/10 text-status-completed" };
      case "deal":
        return { icon: Handshake, color: "bg-brand-primary/10 text-brand-primary" };
      case "pitch":
        return { icon: Send, color: "bg-status-pending/10 text-status-pending" };
      case "song":
        return { icon: Music, color: "bg-brand-accent/10 text-brand-accent" };
      default:
        return { icon: AlertTriangle, color: "bg-gray-300/10 text-gray-600" };
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return "Just now";
  };

  return (
    <Card>
      <CardHeader className="border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No recent activity to display.
            </div>
          ) : (
            activities.map((activity) => {
              const { icon: Icon, color } = getActivityIcon(activity.type);
              return (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`w-8 h-8 ${color} rounded-full flex items-center justify-center flex-shrink-0`}>
                    <Icon size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatTimeAgo(activity.timestamp)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
