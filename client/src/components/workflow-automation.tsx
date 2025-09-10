import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Zap, Clock, Mail, Bell, Settings, Plus, Edit, Trash2, 
  Users, Calculator, FileText, Activity, AlertTriangle,
  TrendingUp, Filter, Play, Pause, BarChart3, Target
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { 
  WorkflowAutomation, InsertWorkflowAutomation,
  AutomationExecution, AutomationLog, TeamAssignmentRule,
  RevenueCalculationRule, NotificationTemplate, DocumentWorkflow, BulkOperation
} from "@shared/schema";
import { insertWorkflowAutomationSchema } from "@shared/schema";

export default function WorkflowAutomationPanel() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("status_automation");
  const { toast } = useToast();

  // Fetch all automation data
  const { data: automations = [], isLoading } = useQuery<WorkflowAutomation[]>({
    queryKey: ["/api/workflow-automation"],
  });

  const { data: executions = [], isLoading: executionsLoading } = useQuery<AutomationExecution[]>({
    queryKey: ["/api/automation-executions"],
  });

  const { data: teamRules = [], isLoading: teamRulesLoading } = useQuery<TeamAssignmentRule[]>({
    queryKey: ["/api/team-assignment-rules"],
  });

  const { data: revenueRules = [], isLoading: revenueRulesLoading } = useQuery<RevenueCalculationRule[]>({
    queryKey: ["/api/revenue-calculation-rules"],
  });

  const { data: notificationTemplates = [], isLoading: templatesLoading } = useQuery<NotificationTemplate[]>({
    queryKey: ["/api/notification-templates"],
  });

  const { data: documentWorkflows = [], isLoading: documentsLoading } = useQuery<DocumentWorkflow[]>({
    queryKey: ["/api/document-workflows"],
  });

  const { data: bulkOperations = [], isLoading: bulkLoading } = useQuery<BulkOperation[]>({
    queryKey: ["/api/bulk-operations"],
  });

  const { data: automationLogs = [], isLoading: logsLoading } = useQuery<AutomationLog[]>({
    queryKey: ["/api/automation-logs"],
    refetchInterval: 10000, // Refresh logs every 10 seconds
  });

  const createAutomationMutation = useMutation({
    mutationFn: async (data: InsertWorkflowAutomation) => {
      const response = await apiRequest("/api/workflow-automation", { method: "POST", body: data });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Automation created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/workflow-automation"] });
      setShowCreateDialog(false);
      form.reset();
    },
  });

  const toggleAutomationMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const response = await apiRequest(`/api/workflow-automation/${id}`, { method: "PUT", body: { isActive } });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workflow-automation"] });
    },
  });

  const processAutomationsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("/api/automation/process", { method: "POST", body: {} });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Automation processing started" });
      queryClient.invalidateQueries({ queryKey: ["/api/automation-executions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/automation-logs"] });
    },
  });

  const form = useForm<InsertWorkflowAutomation>({
    resolver: zodResolver(insertWorkflowAutomationSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "status_automation",
      triggerType: "date",
      triggerCondition: "{}",
      actionType: "email",
      actionData: "{}",
      isActive: true,
      entityType: "deal",
      priority: 1,
      frequency: "once",
      conditions: "{}",
      metadata: "{}"
    },
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'status_automation': return TrendingUp;
      case 'notifications': return Bell;
      case 'assignments': return Users;
      case 'revenue': return Calculator;
      case 'documents': return FileText;
      default: return Zap;
    }
  };

  const getTriggerIcon = (type: string) => {
    switch (type) {
      case 'date': return Clock;
      case 'status_change': return Settings;
      case 'time_elapsed': return Zap;
      case 'field_change': return Edit;
      case 'amount_threshold': return TrendingUp;
      default: return Clock;
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'email': return Mail;
      case 'notification': return Bell;
      case 'status_update': return Settings;
      case 'assignment': return Users;
      case 'calculation': return Calculator;
      case 'document_generation': return FileText;
      default: return Bell;
    }
  };

  // Calculate automation statistics
  const automationStats = {
    total: automations.length,
    active: automations.filter(a => a.isActive).length,
    executions: executions.length,
    successRate: executions.length > 0 
      ? Math.round((executions.filter((e: any) => e.status === 'success').length / executions.length) * 100)
      : 0,
    categories: {
      status_automation: automations.filter(a => a.category === 'status_automation').length,
      notifications: automations.filter(a => a.category === 'notifications').length,
      assignments: automations.filter(a => a.category === 'assignments').length,
      revenue: automations.filter(a => a.category === 'revenue').length,
      documents: automations.filter(a => a.category === 'documents').length,
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Workflow Automation</h2>
          <p className="text-gray-600 mt-1">Streamline your sync licensing operations with intelligent automation</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline"
            onClick={() => processAutomationsMutation.mutate()}
            disabled={processAutomationsMutation.isPending}
          >
            <Play className="mr-2 h-4 w-4" />
            {processAutomationsMutation.isPending ? "Processing..." : "Run All"}
          </Button>
          <Button onClick={() => setShowCreateDialog(true)} data-testid="button-create-automation">
            <Plus className="mr-2 h-4 w-4" />
            Create Automation
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Automations</p>
                <p className="text-2xl font-bold text-gray-900">{automationStats.total}</p>
              </div>
              <Zap className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Rules</p>
                <p className="text-2xl font-bold text-green-600">{automationStats.active}</p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Executions</p>
                <p className="text-2xl font-bold text-purple-600">{automationStats.executions}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-emerald-600">{automationStats.successRate}%</p>
              </div>
              <Target className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Automation Dashboard */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="automations">Automations</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Ops</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Automation Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="mr-2 h-5 w-5" />
                  Automation Categories
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(automationStats.categories).map(([category, count]) => {
                  const Icon = getCategoryIcon(category);
                  return (
                    <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Icon className="h-5 w-5 text-gray-600" />
                        <span className="capitalize font-medium">{category.replace('_', ' ')}</span>
                      </div>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="mr-2 h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!logsLoading && automationLogs.length > 0 ? (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {automationLogs.slice(0, 10).map((log: any) => (
                      <div key={log.id} className="flex items-start space-x-3 p-2 rounded-lg bg-gray-50">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          log.level === 'error' ? 'bg-red-500' :
                          log.level === 'warning' ? 'bg-yellow-500' :
                          log.level === 'info' ? 'bg-blue-500' : 'bg-gray-500'
                        }`}></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 truncate">{log.message}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No recent activity</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Automations Tab */}
        <TabsContent value="automations" className="space-y-6">
          {automations.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Zap className="mx-auto h-8 w-8 text-gray-400 mb-4" />
                <h4 className="font-medium text-gray-900 mb-2">No automations yet</h4>
                <p className="text-gray-600 mb-4">
                  Set up automated workflows to streamline your licensing process.
                </p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  Create Your First Automation
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {automations.map((automation) => {
                const TriggerIcon = getTriggerIcon(automation.triggerType);
                const ActionIcon = getActionIcon(automation.actionType);
                
                return (
                  <Card key={automation.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <TriggerIcon className="h-4 w-4 text-gray-600" />
                            <span className="text-sm text-gray-600">→</span>
                            <ActionIcon className="h-4 w-4 text-gray-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">{automation.name}</h4>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Badge variant="outline">{automation.triggerType.replace('_', ' ')}</Badge>
                              <span>→</span>
                              <Badge variant="outline">{automation.actionType}</Badge>
                              <span>•</span>
                              <Badge variant="secondary">{automation.entityType}</Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={automation.isActive ?? false}
                            onCheckedChange={(checked) => 
                              toggleAutomationMutation.mutate({ 
                                id: automation.id, 
                                isActive: checked 
                              })
                            }
                          />
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Template Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Template management features will be implemented here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monitoring Tab */}
        <TabsContent value="monitoring" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Automation Monitoring</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Real-time monitoring and analytics will be displayed here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bulk Operations Tab */}
        <TabsContent value="bulk" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Operations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Bulk operation management will be implemented here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Automation Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Workflow Automation</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit((data) => createAutomationMutation.mutate(data))} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1">Automation Name</label>
              <Input
                {...form.register("name")}
                placeholder="e.g., Follow-up reminder after 7 days"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Entity Type</label>
                <Select value={form.watch("entityType")} onValueChange={(value) => form.setValue("entityType", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deal">Deals</SelectItem>
                    <SelectItem value="pitch">Pitches</SelectItem>
                    <SelectItem value="payment">Payments</SelectItem>
                    <SelectItem value="contact">Contacts</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Trigger Type</label>
                <Select value={form.watch("triggerType")} onValueChange={(value) => form.setValue("triggerType", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Specific Date</SelectItem>
                    <SelectItem value="status_change">Status Change</SelectItem>
                    <SelectItem value="time_elapsed">Time Elapsed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Trigger Condition (JSON)</label>
              <Textarea
                {...form.register("triggerCondition")}
                placeholder='{"days": 7, "status": "sent"}'
                rows={3}
              />
              <p className="text-xs text-gray-500 mt-1">
                Define when this automation should trigger (JSON format)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Action Type</label>
              <Select value={form.watch("actionType")} onValueChange={(value) => form.setValue("actionType", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Send Email</SelectItem>
                  <SelectItem value="notification">Show Notification</SelectItem>
                  <SelectItem value="status_update">Update Status</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Action Data (JSON)</label>
              <Textarea
                {...form.register("actionData")}
                placeholder='{"template": "follow_up", "recipient": "client"}'
                rows={4}
              />
              <p className="text-xs text-gray-500 mt-1">
                Define what action to take (JSON format)
              </p>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createAutomationMutation.isPending}>
                {createAutomationMutation.isPending ? "Creating..." : "Create Automation"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}