import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import MetricsCards from "@/components/dashboard/metrics-cards";
import DealPipeline from "@/components/dashboard/deal-pipeline";
import RecentActivity from "@/components/dashboard/recent-activity";
import UrgentActions from "@/components/dashboard/urgent-actions";
import ComprehensiveAddDealForm from "@/components/forms/comprehensive-add-deal-form";
import type { DashboardMetrics, DealWithRelations } from "@shared/schema";

export default function Dashboard() {
  const [showAddDeal, setShowAddDeal] = useState(false);

  const { data: metrics, isLoading: metricsLoading, isError: metricsError, refetch: refetchMetrics } = useQuery<DashboardMetrics>({
    queryKey: ["/api/dashboard"],
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const { data: deals = [], isLoading: dealsLoading, isError: dealsError, refetch: refetchDeals } = useQuery<DealWithRelations[]>({
    queryKey: ["/api/deals"],
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const isLoading = metricsLoading || dealsLoading;
  const isError = metricsError || dealsError;

  const handleRefresh = () => {
    refetchMetrics();
    refetchDeals();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  if (isError || !metrics) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="text-lg text-red-600">Failed to load dashboard data</div>
        <p className="text-sm text-gray-500">Please check your connection and try again</p>
        <button 
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <Header
        title="Dashboard"
        description="Track your sync licensing deals and revenue"
        searchPlaceholder="Search songs, deals, contacts..."
        newItemLabel="New Deal"
        onNewItem={() => setShowAddDeal(true)}
      />
      
      <div id="dashboard-overview" className="p-6">
        <MetricsCards metrics={metrics} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <DealPipeline deals={deals} dealsByStatus={metrics.dealsByStatus} />
          
          <div className="space-y-6">
            <RecentActivity activities={metrics.recentActivity} />
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
              </div>
              <div className="p-6 space-y-3">
                <button 
                  id="add-song-button"
                  className="w-full flex items-center justify-center space-x-2 bg-brand-primary text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <span>Add New Song</span>
                </button>
                <button 
                  id="add-deal-button"
                  onClick={() => setShowAddDeal(true)}
                  className="w-full flex items-center justify-center space-x-2 bg-brand-secondary text-white px-4 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  <span>Create Pitch</span>
                </button>
                <button 
                  id="add-template-button"
                  className="w-full flex items-center justify-center space-x-2 bg-brand-accent text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <span>Add Contact</span>
                </button>
                <button className="w-full flex items-center justify-center space-x-2 bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors">
                  <span>Export Report</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <UrgentActions urgentActions={metrics.urgentActions} />
        </div>
      </div>

      <ComprehensiveAddDealForm open={showAddDeal} onClose={() => setShowAddDeal(false)} />
    </div>
  );
}
