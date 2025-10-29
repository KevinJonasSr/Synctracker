import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import AddTemplateForm from "@/components/forms/add-template-form";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Edit, Trash2, Download, Copy } from "lucide-react";
import type { Template } from "@shared/schema";

export default function Templates() {
  const [showAddTemplate, setShowAddTemplate] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const { data: templates = [], isLoading } = useQuery<Template[]>({
    queryKey: ["/api/templates"],
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case "contract":
        return "bg-blue-100 text-blue-800";
      case "quote":
        return "bg-green-100 text-green-800";
      case "invoice":
        return "bg-purple-100 text-purple-800";
      case "license":
        return "bg-orange-100 text-orange-800";
      case "approval_request":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  };

  const filteredTemplates = activeTab === "all" 
    ? templates 
    : templates.filter(template => template.type === activeTab);

  const templateTypes = ["contract", "quote", "invoice", "license", "approval_request"];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-gray-600">Loading templates...</div>
      </div>
    );
  }

  return (
    <div>
      <Header
        title="Templates"
        description="Manage document templates for contracts, quotes, and licensing"
        searchPlaceholder="Search templates..."
        newItemLabel="New Template"
        onNewItem={() => setShowAddTemplate(true)}
      />
      
      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">All Templates</TabsTrigger>
            <TabsTrigger value="approval_request">Approval Requests</TabsTrigger>
            <TabsTrigger value="quote">Quotes</TabsTrigger>
            <TabsTrigger value="contract">Contracts</TabsTrigger>
            <TabsTrigger value="invoice">Invoices</TabsTrigger>
            <TabsTrigger value="license">Licenses</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-6">
            {filteredTemplates.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <FileText className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No templates found</h3>
                  <p className="text-gray-600 text-center mb-6">
                    {activeTab === "all"
                      ? "Create your first template to streamline your licensing workflow."
                      : `No ${activeTab} templates found. Create one to get started.`
                    }
                  </p>
                  <Button onClick={() => setShowAddTemplate(true)} className="bg-brand-primary hover:bg-blue-700">
                    Create Your First Template
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {filteredTemplates.map((template) => (
                  <Card key={template.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="w-16 h-16 bg-brand-primary/10 rounded-lg flex items-center justify-center">
                            <FileText className="h-8 w-8 text-brand-primary" />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                              <Badge className={getTypeColor(template.type)}>
                                {template.type.charAt(0).toUpperCase() + template.type.slice(1)}
                              </Badge>
                            </div>
                            
                            <div className="text-sm text-gray-600 mb-4">
                              <p>Created: {formatDate(template.createdAt)}</p>
                              <p>Updated: {formatDate(template.updatedAt)}</p>
                            </div>
                            
                            <div className="bg-gray-50 rounded-lg p-4">
                              <p className="text-sm text-gray-700 mb-2 font-medium">Template Preview:</p>
                              <div className="text-sm text-gray-600 max-h-24 overflow-y-auto">
                                {template.content.slice(0, 200)}
                                {template.content.length > 200 && "..."}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <AddTemplateForm open={showAddTemplate} onClose={() => setShowAddTemplate(false)} />
    </div>
  );
}
