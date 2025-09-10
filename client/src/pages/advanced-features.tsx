import Header from "@/components/layout/header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SmartPitchMatching from "@/components/smart-pitch-matching";
import InvoiceManagement from "@/components/invoice-management";
import ExpenseTracking from "@/components/expense-tracking";
import { Brain, FileText, Receipt, MessageSquare, CheckSquare, BarChart3 } from "lucide-react";

export default function AdvancedFeatures() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <Header 
        title="Advanced Features" 
        description="AI-powered tools and business management features"
      />
      
      <Tabs defaultValue="smart-pitch" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="smart-pitch" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Smart Pitch
          </TabsTrigger>
          <TabsTrigger value="invoices" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Invoices
          </TabsTrigger>
          <TabsTrigger value="expenses" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Expenses
          </TabsTrigger>
          <TabsTrigger value="messaging" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Messaging
          </TabsTrigger>
          <TabsTrigger value="approvals" className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4" />
            Approvals
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Insights
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="smart-pitch" className="space-y-4">
          <SmartPitchMatching />
        </TabsContent>
        
        <TabsContent value="invoices" className="space-y-4">
          <InvoiceManagement />
        </TabsContent>
        
        <TabsContent value="expenses" className="space-y-4">
          <ExpenseTracking />
        </TabsContent>
        
        <TabsContent value="messaging" className="space-y-4">
          <div className="text-center py-12">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Integrated Messaging</h3>
            <p className="text-gray-600 mb-4">
              Communicate directly with contacts and manage conversations within deals.
              Features include email integration, SMS capabilities, and chat history tracking.
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="approvals" className="space-y-4">
          <div className="text-center py-12">
            <CheckSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Approval Workflows</h3>
            <p className="text-gray-600 mb-4">
              Set up multi-step approval processes for contracts, deals, and payments.
              Track progress through approval stages and manage stakeholder sign-offs.
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="insights" className="space-y-4">
          <div className="text-center py-12">
            <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Market Intelligence</h3>
            <p className="text-gray-600 mb-4">
              Industry trend analysis, competitive pricing insights, and performance analytics.
              Track which songs perform best across different media types and markets.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}