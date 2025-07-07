import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { DealWithRelations } from "@shared/schema";

interface DealPipelineProps {
  deals: DealWithRelations[];
  dealsByStatus: Record<string, number>;
}

export default function DealPipeline({ deals, dealsByStatus }: DealPipelineProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pitched":
        return "bg-gray-300/10 text-gray-600";
      case "under_review":
        return "bg-status-pending/10 text-status-pending";
      case "confirmed":
        return "bg-brand-primary/10 text-brand-primary";
      case "completed":
        return "bg-status-completed/10 text-status-completed";
      default:
        return "bg-gray-300/10 text-gray-600";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pitched":
        return "Pitched";
      case "under_review":
        return "Under Review";
      case "confirmed":
        return "Confirmed";
      case "completed":
        return "Completed";
      default:
        return status;
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  };

  return (
    <Card className="lg:col-span-2">
      <CardHeader className="border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Deal Pipeline</h3>
          <Button variant="ghost" size="sm" className="text-brand-primary hover:text-blue-700">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {/* Pipeline Stages */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
            <span className="text-sm font-medium text-gray-600">Pitched</span>
            <span className="text-sm text-gray-500">({dealsByStatus.pitched || 0})</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-status-pending rounded-full"></div>
            <span className="text-sm font-medium text-gray-600">Under Review</span>
            <span className="text-sm text-gray-500">({dealsByStatus.under_review || 0})</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-brand-primary rounded-full"></div>
            <span className="text-sm font-medium text-gray-600">Confirmed</span>
            <span className="text-sm text-gray-500">({dealsByStatus.confirmed || 0})</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-status-completed rounded-full"></div>
            <span className="text-sm font-medium text-gray-600">Completed</span>
            <span className="text-sm text-gray-500">({dealsByStatus.completed || 0})</span>
          </div>
        </div>

        {/* Deals Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Project</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Song</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Value</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {deals.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    No deals found. Create your first deal to get started.
                  </td>
                </tr>
              ) : (
                deals.map((deal) => (
                  <tr key={deal.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{deal.projectName}</p>
                        <p className="text-sm text-gray-500">{deal.projectType}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{deal.song.title}</p>
                        <p className="text-sm text-gray-500">by {deal.song.artist}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={getStatusColor(deal.status)}>
                        {getStatusLabel(deal.status)}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {deal.dealValue ? `$${Number(deal.dealValue).toLocaleString()}` : "TBD"}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {formatDate(deal.updatedAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
