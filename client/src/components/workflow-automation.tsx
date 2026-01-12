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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Zap, Clock, Mail, Bell, Settings, Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { WorkflowAutomation, InsertWorkflowAutomation } from "@shared/schema";
import { insertWorkflowAutomationSchema } from "@shared/schema";

export default function WorkflowAutomationPanel() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { toast } = useToast();

  const { data: automations = [], isLoading } = useQuery<WorkflowAutomation[]>({
    queryKey: ["/api/workflow-automation"],
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

  const form = useForm<InsertWorkflowAutomation>({
    resolver: zodResolver(insertWorkflowAutomationSchema),
    defaultValues: {
      name: "",
      triggerType: "date",
      triggerCondition: "",
      actionType: "email",
      actionData: "",
      isActive: true,
      entityType: "deal",
    },
  });

  const getTriggerIcon = (type: string) => {
    switch (type) {
      case 'date': return Clock;
      case 'status_change': return Settings;
      case 'time_elapsed': return Zap;
      default: return Clock;
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'email': return Mail;
      case 'notification': return Bell;
      case 'status_update': return Settings;
      default: return Bell;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Workflow Automation</h3>
          <p className="text-sm text-gray-600">Automate routine tasks and reminders</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Automation
        </Button>
      </div>

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