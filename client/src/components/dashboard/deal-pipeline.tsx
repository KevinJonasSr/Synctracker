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
        <div className="flex flex-wrap gap-3 mb-6">
          <Badge className="bg-red-100 text-red-800 border-red-200">
            New Request ({dealsByStatus["new request"] || 0})
          </Badge>
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            Pending Approval ({dealsByStatus["pending approval"] || 0})
          </Badge>
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            Quoted ({dealsByStatus.quoted || 0})
          </Badge>
          <Badge className="bg-green-100 text-green-800 border-green-200">
            Use Confirmed ({dealsByStatus["use confirmed"] || 0})
          </Badge>
          <Badge className="bg-purple-100 text-purple-800 border-purple-200">
            Being Drafted ({dealsByStatus["being drafted"] || 0})
          </Badge>
          <Badge className="bg-orange-100 text-orange-800 border-orange-200">
            Out for Signature ({dealsByStatus["out for signature"] || 0})
          </Badge>
          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
            Payment Received ({dealsByStatus["payment received"] || 0})
          </Badge>
          <Badge className="bg-green-100 text-green-800 border-green-200">
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
