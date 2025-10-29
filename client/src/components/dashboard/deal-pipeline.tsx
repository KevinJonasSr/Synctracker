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
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

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
      case "not used":
        return "bg-slate-100 text-slate-800";
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
      case "not used":
        return "Not used";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  };

  const handleStatusFilter = (status: string) => {
    if (selectedStatus === status) {
      setSelectedStatus(null); // Clear filter if same status clicked
    } else {
      setSelectedStatus(status);
    }
  };

  const filteredDeals = selectedStatus 
    ? deals.filter(deal => deal.status === selectedStatus)
    : deals;

  return (
    <Card className="lg:col-span-2">
      <CardHeader className="border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold text-gray-900">Deal Pipeline</h3>
            {selectedStatus && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Filtered by:</span>
                <Badge className={getStatusColor(selectedStatus)}>
                  {getStatusLabel(selectedStatus)}
                </Badge>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedStatus(null)}
                  className="text-gray-500 hover:text-gray-700 h-6 w-6 p-0"
                >
                  ×
                </Button>
              </div>
            )}
          </div>
          <Button variant="ghost" size="sm" className="text-brand-primary hover:text-blue-700">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {/* Pipeline Stages */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Badge 
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedStatus === "new request" 
                ? "bg-red-200 text-red-900 border-red-300 shadow-md" 
                : "bg-red-100 text-red-800 border-red-200 hover:bg-red-150"
            }`}
            onClick={() => handleStatusFilter("new request")}
          >
            New Request ({dealsByStatus["new request"] || 0})
          </Badge>
          <Badge 
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedStatus === "pending approval" 
                ? "bg-yellow-200 text-yellow-900 border-yellow-300 shadow-md" 
                : "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-150"
            }`}
            onClick={() => handleStatusFilter("pending approval")}
          >
            Pending Approval ({dealsByStatus["pending approval"] || 0})
          </Badge>
          <Badge 
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedStatus === "quoted" 
                ? "bg-blue-200 text-blue-900 border-blue-300 shadow-md" 
                : "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-150"
            }`}
            onClick={() => handleStatusFilter("quoted")}
          >
            Quoted ({dealsByStatus.quoted || 0})
          </Badge>
          <Badge 
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedStatus === "use confirmed" 
                ? "bg-green-200 text-green-900 border-green-300 shadow-md" 
                : "bg-green-100 text-green-800 border-green-200 hover:bg-green-150"
            }`}
            onClick={() => handleStatusFilter("use confirmed")}
          >
            Use Confirmed ({dealsByStatus["use confirmed"] || 0})
          </Badge>
          <Badge 
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedStatus === "being drafted" 
                ? "bg-purple-200 text-purple-900 border-purple-300 shadow-md" 
                : "bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-150"
            }`}
            onClick={() => handleStatusFilter("being drafted")}
          >
            Being Drafted ({dealsByStatus["being drafted"] || 0})
          </Badge>
          <Badge 
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedStatus === "out for signature" 
                ? "bg-orange-200 text-orange-900 border-orange-300 shadow-md" 
                : "bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-150"
            }`}
            onClick={() => handleStatusFilter("out for signature")}
          >
            Out for Signature ({dealsByStatus["out for signature"] || 0})
          </Badge>
          <Badge 
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedStatus === "payment received" 
                ? "bg-emerald-200 text-emerald-900 border-emerald-300 shadow-md" 
                : "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-150"
            }`}
            onClick={() => handleStatusFilter("payment received")}
          >
            Payment Received ({dealsByStatus["payment received"] || 0})
          </Badge>
          <Badge 
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedStatus === "completed" 
                ? "bg-green-200 text-green-900 border-green-300 shadow-md" 
                : "bg-green-100 text-green-800 border-green-200 hover:bg-green-150"
            }`}
            onClick={() => handleStatusFilter("completed")}
          >
            Completed ({dealsByStatus.completed || 0})
          </Badge>
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
              {filteredDeals.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    {selectedStatus 
                      ? `No deals found with status "${getStatusLabel(selectedStatus)}". Click the status badge again to clear the filter.`
                      : "No deals found. Create your first deal to get started."
                    }
                  </td>
                </tr>
              ) : (
                filteredDeals.map((deal) => (
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
