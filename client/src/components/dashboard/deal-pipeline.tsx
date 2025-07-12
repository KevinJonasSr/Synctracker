import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DealDetailsDialog from "@/components/deal-details-dialog";
import type { DealWithRelations } from "@shared/schema";

interface DealPipelineProps {
  deals: DealWithRelations[];
  dealsByStatus: Record<string, number>;
}

export default function DealPipeline({ deals, dealsByStatus }: DealPipelineProps) {
  const [selectedDeal, setSelectedDeal] = useState<DealWithRelations | null>(null);
  const [showDealDetails, setShowDealDetails] = useState(false);

  const handleDealClick = (deal: DealWithRelations) => {
    setSelectedDeal(deal);
    setShowDealDetails(true);
  };
  const getStatusColor = (status: string) => {
    // Normalize status to handle both underscore and space formats
    const normalizedStatus = status.replace(/_/g, ' ').toLowerCase();
    
    switch (normalizedStatus) {
      case "new request":
        return "bg-red-100 text-red-800";
      case "pending approval":
        return "bg-yellow-100 text-yellow-800";
      case "quoted":
        return "bg-blue-100 text-blue-800";
      case "use confirmed":
        return "bg-green-100 text-green-800";
      case "being drafted":
        return "bg-purple-100 text-purple-800";
      case "out for signature":
        return "bg-orange-100 text-orange-800";
      case "payment received":
        return "bg-emerald-100 text-emerald-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-300/10 text-gray-600";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "new request":
        return "New Request";
      case "pending approval":
        return "Pending Approval";
      case "quoted":
        return "Quoted";
      case "use confirmed":
        return "Use Confirmed";
      case "being drafted":
        return "Being Drafted";
      case "out for signature":
        return "Out for Signature";
      case "payment received":
        return "Payment Received";
      case "completed":
        return "Completed";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
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
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8 gap-4 mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-300 rounded-full flex-shrink-0"></div>
            <span className="text-xs font-medium text-gray-600 truncate">New Request</span>
            <span className="text-xs text-gray-500">({dealsByStatus["new request"] || 0})</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full flex-shrink-0"></div>
            <span className="text-xs font-medium text-gray-600 truncate">Pending</span>
            <span className="text-xs text-gray-500">({dealsByStatus["pending approval"] || 0})</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
            <span className="text-xs font-medium text-gray-600 truncate">Quoted</span>
            <span className="text-xs text-gray-500">({dealsByStatus.quoted || 0})</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
            <span className="text-xs font-medium text-gray-600 truncate">Use Confirmed</span>
            <span className="text-xs text-gray-500">({dealsByStatus["use confirmed"] || 0})</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full flex-shrink-0"></div>
            <span className="text-xs font-medium text-gray-600 truncate">Being Drafted</span>
            <span className="text-xs text-gray-500">({dealsByStatus["being drafted"] || 0})</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full flex-shrink-0"></div>
            <span className="text-xs font-medium text-gray-600 truncate">Out for Signature</span>
            <span className="text-xs text-gray-500">({dealsByStatus["out for signature"] || 0})</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-emerald-500 rounded-full flex-shrink-0"></div>
            <span className="text-xs font-medium text-gray-600 truncate">Payment Received</span>
            <span className="text-xs text-gray-500">({dealsByStatus["payment received"] || 0})</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-600 rounded-full flex-shrink-0"></div>
            <span className="text-xs font-medium text-gray-600 truncate">Completed</span>
            <span className="text-xs text-gray-500">({dealsByStatus.completed || 0})</span>
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
                  <tr 
                    key={deal.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleDealClick(deal)}
                  >
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
                      {deal.ourFee && deal.ourRecordingFee 
                        ? `$${Number(deal.ourFee).toLocaleString()} / $${Number(deal.ourRecordingFee).toLocaleString()}`
                        : deal.ourFee 
                          ? `$${Number(deal.ourFee).toLocaleString()}`
                          : deal.ourRecordingFee
                            ? `$${Number(deal.ourRecordingFee).toLocaleString()}`
                            : "TBD"
                      }
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
      
      <DealDetailsDialog 
        deal={selectedDeal}
        open={showDealDetails}
        onClose={() => setShowDealDetails(false)}
      />
    </Card>
  );
}
