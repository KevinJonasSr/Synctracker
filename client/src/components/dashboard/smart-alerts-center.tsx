import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bell, AlertTriangle, Clock, TrendingDown, DollarSign, 
  Users, Target, CheckCircle, X, ExternalLink, Filter
} from "lucide-react";
import type { SmartAlert } from "@shared/schema";

interface SmartAlertsCenterProps {
  onAlertAction?: (alertId: string, action: string) => void;
}

export default function SmartAlertsCenter({ onAlertAction }: SmartAlertsCenterProps) {
  const [selectedTab, setSelectedTab] = useState<string>("all");
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  const { data: alerts = [], isLoading, refetch } = useQuery<SmartAlert[]>({
    queryKey: ["/api/dashboard/smart-alerts"],
    refetchInterval: 60000, // Refresh every minute
  });

  const getAlertIcon = (type: SmartAlert['type']) => {
    switch (type) {
      case 'deadline': return Clock;
      case 'performance': return TrendingDown;
      case 'revenue': return DollarSign;
      case 'opportunity': return Target;
      case 'risk': return AlertTriangle;
      default: return Bell;
    }
  };

  const getAlertColor = (priority: SmartAlert['priority']) => {
    switch (priority) {
      case 'urgent': return 'border-red-500 bg-red-50';
      case 'high': return 'border-orange-500 bg-orange-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      case 'low': return 'border-blue-500 bg-blue-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  const getPriorityBadgeColor = (priority: SmartAlert['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
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

  const handleDismissAlert = (alertId: string) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]));
    onAlertAction?.(alertId, 'dismiss');
  };

  const handleActionClick = (alertId: string, action: string) => {
    onAlertAction?.(alertId, action);
  };

  // Filter alerts by tab and exclude dismissed alerts
  const filteredAlerts = alerts
    .filter(alert => !dismissedAlerts.has(alert.id))
    .filter(alert => {
      if (selectedTab === 'all') return true;
      if (selectedTab === 'urgent') return alert.priority === 'urgent';
      if (selectedTab === 'actionRequired') return alert.actionRequired;
      return alert.type === selectedTab;
    });

  const urgentCount = alerts.filter(a => a.priority === 'urgent' && !dismissedAlerts.has(a.id)).length;
  const actionRequiredCount = alerts.filter(a => a.actionRequired && !dismissedAlerts.has(a.id)).length;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Bell className="text-blue-600" size={20} />
            <h3 className="text-lg font-semibold">Smart Alerts Center</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="text-blue-600" size={20} />
            <h3 className="text-lg font-semibold">Smart Alerts Center</h3>
            {urgentCount > 0 && (
              <Badge className="bg-red-500 text-white" data-testid="urgent-count">
                {urgentCount} Urgent
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Refresh
            </Button>
            <Filter className="text-gray-400" size={16} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all" data-testid="tab-all">
              All ({filteredAlerts.length})
            </TabsTrigger>
            <TabsTrigger value="urgent" data-testid="tab-urgent">
              Urgent ({urgentCount})
            </TabsTrigger>
            <TabsTrigger value="actionRequired" data-testid="tab-action-required">
              Action ({actionRequiredCount})
            </TabsTrigger>
            <TabsTrigger value="deadline" data-testid="tab-deadline">
              Deadlines
            </TabsTrigger>
            <TabsTrigger value="performance" data-testid="tab-performance">
              Performance
            </TabsTrigger>
            <TabsTrigger value="opportunity" data-testid="tab-opportunity">
              Opportunities
            </TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab} className="mt-6">
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {filteredAlerts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="mx-auto mb-4 text-green-500" size={48} />
                    <p className="text-lg font-medium">All clear!</p>
                    <p className="text-sm">No alerts in this category.</p>
                  </div>
                ) : (
                  filteredAlerts.map((alert) => {
                    const Icon = getAlertIcon(alert.type);
                    const alertColor = getAlertColor(alert.priority);
                    const badgeColor = getPriorityBadgeColor(alert.priority);
                    
                    return (
                      <Card 
                        key={alert.id} 
                        className={`border-l-4 ${alertColor} transition-all duration-200 hover:shadow-md`}
                        data-testid={`alert-${alert.id}`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3 flex-1">
                              <div className={`p-2 rounded-full ${alertColor}`}>
                                <Icon size={20} />
                              </div>
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center space-x-2">
                                  <h4 className="font-medium text-gray-900">{alert.title}</h4>
                                  <Badge className={badgeColor} data-testid={`priority-${alert.priority}`}>
                                    {alert.priority.charAt(0).toUpperCase() + alert.priority.slice(1)}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-700">{alert.message}</p>
                                {alert.details && (
                                  <p className="text-xs text-gray-500">{alert.details}</p>
                                )}
                                <div className="flex items-center justify-between text-xs text-gray-400">
                                  <span>{formatTimeAgo(alert.createdAt)}</span>
                                  {alert.expiresAt && (
                                    <span>Expires {formatTimeAgo(alert.expiresAt)}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDismissAlert(alert.id)}
                              className="text-gray-400 hover:text-gray-600"
                              data-testid={`dismiss-${alert.id}`}
                            >
                              <X size={16} />
                            </Button>
                          </div>

                          {/* Suggested Actions */}
                          {alert.actionRequired && alert.suggestedActions && alert.suggestedActions.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <p className="text-sm font-medium text-gray-700 mb-2">Suggested Actions:</p>
                              <div className="flex flex-wrap gap-2">
                                {alert.suggestedActions.map((action, index) => (
                                  <Button
                                    key={index}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleActionClick(alert.id, action)}
                                    className="text-xs"
                                    data-testid={`action-${alert.id}-${index}`}
                                  >
                                    {action}
                                    <ExternalLink size={12} className="ml-1" />
                                  </Button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Entity Link */}
                          {alert.entityType && alert.entityId && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <Button
                                variant="link"
                                size="sm"
                                onClick={() => handleActionClick(alert.id, 'view_entity')}
                                className="text-blue-600 p-0 h-auto"
                                data-testid={`view-entity-${alert.id}`}
                              >
                                View {alert.entityType} #{alert.entityId}
                                <ExternalLink size={12} className="ml-1" />
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}