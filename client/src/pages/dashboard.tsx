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

  const { data: metrics, isLoading: metricsLoading } = useQuery<DashboardMetrics>({
    queryKey: ["/api/dashboard"],
  });

  const { data: deals = [], isLoading: dealsLoading } = useQuery<DealWithRelations[]>({
    queryKey: ["/api/deals"],
  });

  const isLoading = metricsLoading || dealsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-gray-600">Loading dashboard...</div>
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
