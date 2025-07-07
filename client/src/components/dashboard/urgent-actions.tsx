import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, FileSignature } from "lucide-react";
import type { DashboardMetrics } from "@shared/schema";

interface UrgentActionsProps {
  urgentActions: DashboardMetrics['urgentActions'];
}

export default function UrgentActions({ urgentActions }: UrgentActionsProps) {
  const getActionIcon = (type: string) => {
    switch (type) {
      case "overdue_payment":
        return { icon: AlertTriangle, color: "bg-status-overdue/10 text-status-overdue" };
      case "pending_response":
        return { icon: Clock, color: "bg-status-pending/10 text-status-pending" };
      case "contract_approval":
        return { icon: FileSignature, color: "bg-brand-primary/10 text-brand-primary" };
      default:
        return { icon: AlertTriangle, color: "bg-gray-300/10 text-gray-600" };
    }
  };

  const getActionButton = (type: string) => {
    switch (type) {
      case "overdue_payment":
        return { label: "Follow Up", variant: "destructive" as const };
      case "pending_response":
        return { label: "Respond", variant: "default" as const };
      case "contract_approval":
        return { label: "Review", variant: "default" as const };
      default:
        return { label: "Action", variant: "default" as const };
    }
  };

  const formatDueDate = (date: Date | undefined) => {
    if (!date) return "";
    const now = new Date();
    const diff = new Date(date).getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days < 0) return `Due ${Math.abs(days)} days ago`;
    if (days === 0) return "Due today";
    if (days === 1) return "Due tomorrow";
    return `Due in ${days} days`;
  };

  if (urgentActions.length === 0) {
    return (
      <Card>
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Urgent Actions Required</h3>
            <Badge variant="outline" className="text-green-600 border-green-600">
              All Clear
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center py-8 text-gray-500">
            No urgent actions required at this time.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Urgent Actions Required</h3>
          <Badge variant="destructive">
            {urgentActions.length} item{urgentActions.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-200">
          {urgentActions.map((action) => {
            const { icon: Icon, color } = getActionIcon(action.type);
            const { label, variant } = getActionButton(action.type);
            
            return (
              <div key={action.id} className="p-6 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 ${color} rounded-full flex items-center justify-center`}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{action.message}</p>
                    {action.dueDate && (
                      <p className="text-sm text-gray-500">{formatDueDate(action.dueDate)}</p>
                    )}
                  </div>
                </div>
                <Button variant={variant} size="sm">
                  {label}
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
