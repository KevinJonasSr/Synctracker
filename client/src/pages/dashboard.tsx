import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/header";
import AdvancedMetricsCards from "@/components/dashboard/advanced-metrics-cards";
import SmartAlertsCenter from "@/components/dashboard/smart-alerts-center";
import InteractiveCharts from "@/components/dashboard/interactive-charts";
import ClientRelationshipDashboard from "@/components/dashboard/client-relationship-dashboard";
import EnhancedDealPipeline from "@/components/dashboard/enhanced-deal-pipeline";
import MarketIntelligence from "@/components/dashboard/market-intelligence";
import ComprehensiveAddDealForm from "@/components/forms/comprehensive-add-deal-form";
import { 
  BarChart3, Users, TrendingUp, Globe, AlertTriangle, 
  RefreshCw, Download, Settings 
} from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { DashboardMetrics, DealWithRelations } from "@shared/schema";

export default function Dashboard() {
  const [showAddDeal, setShowAddDeal] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedClient, setSelectedClient] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const { data: metrics, isLoading: metricsLoading } = useQuery<DashboardMetrics>({
    queryKey: ["/api/dashboard"],
  });

  const { data: deals = [], isLoading: dealsLoading } = useQuery<DealWithRelations[]>({
    queryKey: ["/api/deals"],
  });

  const isLoading = metricsLoading || dealsLoading;

  const handleMetricClick = (metricId: string, data: any) => {
    console.log("Metric clicked:", metricId, data);
    // Navigate to detailed view or show modal
  };

  const handleAlertAction = (alertId: string, action: string) => {
    console.log("Alert action:", alertId, action);
    // Handle alert actions (dismiss, view, take action)
  };

  const handleChartClick = (chartType: string, data: any) => {
    console.log("Chart clicked:", chartType, data);
    // Navigate to detailed analysis
  };

  const handleClientSelect = (clientId: number) => {
    setSelectedClient(clientId);
    setActiveTab("clients");
  };

  const handleDealClick = (deal: DealWithRelations) => {
    console.log("Deal clicked:", deal);
    // Navigate to deal details
  };

  const handleStageClick = (stage: string) => {
    console.log("Stage clicked:", stage);
    // Filter deals by stage or navigate to stage view
  };

  const handleInsightClick = (insight: any) => {
    console.log("Insight clicked:", insight);
    // Show detailed insight analysis
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Invalidate all dashboard-related queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/deals"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard/advanced-metrics"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard/smart-alerts"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard/market-insights"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/contacts"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/songs"] }),
      ]);
      
      toast({
        title: "Dashboard Refreshed",
        description: "All data has been updated successfully.",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh dashboard data. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-gray-600">Loading business intelligence dashboard...</div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-red-600">Failed to load dashboard data</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title="Business Intelligence Dashboard"
        description="Comprehensive sync licensing analytics and insights"
        searchPlaceholder="Search deals, clients, songs, insights..."
        newItemLabel="New Deal"
        onNewItem={() => setShowAddDeal(true)}
      />
      
      <div className="p-6">
        {/* Dashboard Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-gray-900">Executive Dashboard</h2>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isRefreshing}
              data-testid="refresh-dashboard"
            >
              <RefreshCw size={16} className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" data-testid="export-report">
              <Download size={16} className="mr-2" />
              Export Report
            </Button>
            <Button variant="outline" size="sm" data-testid="dashboard-settings">
              <Settings size={16} className="mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Enhanced Tabbed Dashboard */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center space-x-2" data-testid="tab-overview">
              <BarChart3 size={16} />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2" data-testid="tab-analytics">
              <TrendingUp size={16} />
              <span>Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="pipeline" className="flex items-center space-x-2" data-testid="tab-pipeline">
              <BarChart3 size={16} />
              <span>Pipeline</span>
            </TabsTrigger>
            <TabsTrigger value="clients" className="flex items-center space-x-2" data-testid="tab-clients">
              <Users size={16} />
              <span>Clients</span>
            </TabsTrigger>
            <TabsTrigger value="market" className="flex items-center space-x-2" data-testid="tab-market">
              <Globe size={16} />
              <span>Market Intel</span>
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center space-x-2" data-testid="tab-alerts">
              <AlertTriangle size={16} />
              <span>Alerts</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <AdvancedMetricsCards 
              onMetricClick={handleMetricClick}
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardContent className="p-6">
                  <InteractiveCharts 
                    onChartClick={handleChartClick}
                  />
                </CardContent>
              </Card>
              
              <SmartAlertsCenter 
                onAlertAction={handleAlertAction}
              />
            </div>

            {/* Quick Actions & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => setShowAddDeal(true)}
                      data-testid="quick-new-deal"
                    >
                      New Deal
                    </Button>
                    <Button variant="outline" data-testid="quick-new-song">
                      Add Song
                    </Button>
                    <Button variant="outline" data-testid="quick-new-contact">
                      Add Contact
                    </Button>
                    <Button variant="outline" data-testid="quick-generate-report">
                      Generate Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Revenue Growth</span>
                      <span className="text-sm font-medium text-green-600">+18.5%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Deal Success Rate</span>
                      <span className="text-sm font-medium text-blue-600">73.2%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Client Satisfaction</span>
                      <span className="text-sm font-medium text-purple-600">94%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Portfolio Utilization</span>
                      <span className="text-sm font-medium text-orange-600">68%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <InteractiveCharts 
              onChartClick={handleChartClick}
            />
          </TabsContent>

          {/* Pipeline Tab */}
          <TabsContent value="pipeline" className="space-y-6">
            <EnhancedDealPipeline 
              deals={deals}
              onDealClick={handleDealClick}
              onStageClick={handleStageClick}
            />
          </TabsContent>

          {/* Clients Tab */}
          <TabsContent value="clients" className="space-y-6">
            <ClientRelationshipDashboard 
              onClientSelect={handleClientSelect}
            />
          </TabsContent>

          {/* Market Intelligence Tab */}
          <TabsContent value="market" className="space-y-6">
            <MarketIntelligence 
              onInsightClick={handleInsightClick}
            />
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-6">
            <SmartAlertsCenter 
              onAlertAction={handleAlertAction}
            />
          </TabsContent>
        </Tabs>
      </div>

      <ComprehensiveAddDealForm open={showAddDeal} onClose={() => setShowAddDeal(false)} />
    </div>
  );
}
