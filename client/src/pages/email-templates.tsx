import { useState, useMemo, useDeferredValue } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Header from "@/components/layout/header";
import AddEmailTemplateForm from "@/components/forms/add-email-template-form";
import { Mail, Plus, Search } from "lucide-react";
import type { EmailTemplate } from "@shared/schema";

export default function EmailTemplates() {
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);

  const { data: templates = [], isLoading } = useQuery<EmailTemplate[]>({
    queryKey: ["/api/email-templates"],
  });

  const filteredTemplates = useMemo(() => {
    return templates.filter(template =>
      template.name.toLowerCase().includes(deferredSearchQuery.toLowerCase()) ||
      template.stage.toLowerCase().includes(deferredSearchQuery.toLowerCase()) ||
      template.subject.toLowerCase().includes(deferredSearchQuery.toLowerCase())
    );
  }, [templates, deferredSearchQuery]);

  const getStageColor = (stage: string) => {
    const colors = {
      initial_pitch: "bg-blue-100 text-blue-800",
      follow_up: "bg-yellow-100 text-yellow-800",
      negotiation: "bg-orange-100 text-orange-800",
      contract_sent: "bg-purple-100 text-purple-800",
      deal_confirmed: "bg-green-100 text-green-800",
      payment_reminder: "bg-red-100 text-red-800",
      thank_you: "bg-gray-100 text-gray-800",
    };
    return colors[stage as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const formatStage = (stage: string) => {
    return stage.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Memoize expensive calculations to prevent unnecessary re-renders
  const mostUsedStage = useMemo(() => {
    if (templates.length === 0) return "N/A";
    
    const stageCounts = templates.reduce((acc: Record<string, number>, template) => {
      acc[template.stage] = (acc[template.stage] || 0) + 1;
      return acc;
    }, {});
    
    const mostUsed = Object.entries(stageCounts).reduce((max, [stage, count]) => 
      count > max[1] ? [stage, count] : max
    )[0];
    
    return formatStage(mostUsed);
  }, [templates]);

  const availableStagesCount = useMemo(() => {
    return new Set(templates.map(t => t.stage)).size;
  }, [templates]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Header
          title="Email Templates"
          description="Pre-written email templates for different stages of the licensing process"
        />
        <div className="grid gap-4" role="status" aria-live="polite" aria-label="Loading email templates">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-1/3"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-muted rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
          <span className="sr-only">Loading email templates, please wait...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Header
        title="Email Templates"
        description="Pre-written email templates for different stages of the licensing process"
        searchPlaceholder="Search templates..."
        onSearch={setSearchQuery}
        onNewItem={() => setIsAddFormOpen(true)}
        newItemLabel="New Template"
        showSearch={true}
        showNewButton={true}
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templates.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Most Used Stage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mostUsedStage}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Available Stages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {availableStagesCount}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Email Templates</CardTitle>
          <CardDescription>
            Manage your email templates for different licensing stages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Variables</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTemplates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <Mail className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">
                      {templates.length === 0 
                        ? "No email templates yet. Create your first template!"
                        : "No templates match your search."
                      }
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTemplates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium">{template.name}</TableCell>
                    <TableCell>
                      <Badge className={getStageColor(template.stage)}>
                        {formatStage(template.stage)}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{template.subject}</TableCell>
                    <TableCell>
                      {Array.isArray(template.variables) && template.variables.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {template.variables.slice(0, 3).map((variable: any, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {variable.name || variable}
                            </Badge>
                          ))}
                          {template.variables.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{template.variables.length - 3}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">No variables</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(template.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AddEmailTemplateForm
        open={isAddFormOpen}
        onClose={() => setIsAddFormOpen(false)}
      />
    </div>
  );
}