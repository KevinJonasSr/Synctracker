import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import ComprehensiveAddDealForm from "@/components/forms/comprehensive-add-deal-form";
import DealDetailsDialog from "@/components/deal-details-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Handshake, Edit, Trash2, DollarSign, Calendar, Building } from "lucide-react";
import type { DealWithRelations } from "@shared/schema";

export default function Deals() {
  const [showAddDeal, setShowAddDeal] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedDeal, setSelectedDeal] = useState<DealWithRelations | null>(null);
  const [showDealDetails, setShowDealDetails] = useState(false);
  const [editingDeal, setEditingDeal] = useState<DealWithRelations | null>(null);
  const [showEditDeal, setShowEditDeal] = useState(false);

  const handleDealClick = (deal: DealWithRelations) => {
    setSelectedDeal(deal);
    setShowDealDetails(true);
  };

  const handleEditDeal = (e: React.MouseEvent, deal: DealWithRelations) => {
    e.stopPropagation(); // Prevent the card click from firing
    setEditingDeal(deal);
    setShowEditDeal(true);
  };

  const { data: deals = [], isLoading } = useQuery<DealWithRelations[]>({
    queryKey: ["/api/deals"],
  });

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
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    return status.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  };

  const getLatestStatusDate = (deal: DealWithRelations) => {
    // Get the most recent status date based on current status
    const statusDates = {
      'new request': deal.pitchedDate,
      'pending approval': deal.pendingApprovalDate,
      'quoted': deal.quotedDate,
      'use confirmed': deal.useConfirmedDate,
      'being drafted': deal.beingDraftedDate,
      'out for signature': deal.outForSignatureDate,
      'payment received': deal.paymentReceivedDate,
      'completed': deal.completedDate
    };
    
    const currentStatusDate = statusDates[deal.status as keyof typeof statusDates];
    return formatDate(currentStatusDate);
  };

  const filteredDeals = activeTab === "all" ? deals : deals.filter(deal => deal.status === activeTab);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-gray-600">Loading deals...</div>
      </div>
    );
  }

  return (
    <div>
      <Header
        title="Deal Pipeline"
        description="Manage your sync licensing deals from pitch to payment"
        searchPlaceholder="Search deals, projects, contacts..."
        newItemLabel="New Deal"
        onNewItem={() => setShowAddDeal(true)}
      />
      
      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="all" className="data-[state=active]:bg-gray-100">All Deals</TabsTrigger>
            <TabsTrigger value="new request" className="data-[state=active]:bg-red-100">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-300 rounded-full"></div>
                <span>New Request</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="pending approval" className="data-[state=active]:bg-yellow-100">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>Pending Approval</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="quoted" className="data-[state=active]:bg-blue-100">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Quoted</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="confirmed" className="data-[state=active]:bg-green-100">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Confirmed</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-green-100">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <span>Completed</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="paid" className="data-[state=active]:bg-emerald-100">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span>Paid</span>
              </div>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-6">
            {filteredDeals.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Handshake className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No deals found</h3>
                  <p className="text-gray-600 text-center mb-6">
                    {activeTab === "all"
                      ? "Start tracking your sync licensing deals by creating your first deal."
                      : `No deals with status "${getStatusLabel(activeTab)}" found.`
                    }
                  </p>
                  <Button onClick={() => setShowAddDeal(true)} className="bg-brand-primary hover:bg-blue-700">
                    Create Your First Deal
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {filteredDeals.map((deal) => (
                  <Card 
                    key={deal.id} 
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleDealClick(deal)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="w-16 h-16 bg-brand-primary/10 rounded-lg flex items-center justify-center">
                            <Handshake className="h-8 w-8 text-brand-primary" />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">{deal.projectName}</h3>
                              <Badge className={getStatusColor(deal.status)}>
                                {getStatusLabel(deal.status)}
                              </Badge>
                            </div>
                            
                            <p className="text-gray-600 mb-2">{deal.projectType}</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                              <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                  <span className="text-xs font-medium">♪</span>
                                </div>
                                <div>
                                  <p className="font-medium">{deal.song.title}</p>
                                  <p className="text-xs">by {deal.song.artist}</p>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <Building className="h-4 w-4 text-gray-400" />
                                <div>
                                  <p className="font-medium">{deal.contact.name}</p>
                                  <p className="text-xs">{deal.contact.company}</p>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <DollarSign className="h-4 w-4 text-gray-400" />
                                <div>
                                  <p className="font-medium">
                                    {deal.ourFee && deal.ourRecordingFee 
                                      ? `$${Number(deal.ourFee).toLocaleString()} / $${Number(deal.ourRecordingFee).toLocaleString()}`
                                      : deal.ourFee 
                                        ? `$${Number(deal.ourFee).toLocaleString()} Pub`
                                        : deal.ourRecordingFee
                                          ? `$${Number(deal.ourRecordingFee).toLocaleString()} Rec`
                                          : "TBD"
                                    }
                                  </p>
                                  <p className="text-xs">
                                    {deal.ourFee && deal.ourRecordingFee 
                                      ? "Publishing / Recording"
                                      : deal.ourFee 
                                        ? "Publishing Fee"
                                        : deal.ourRecordingFee
                                          ? "Recording Fee"
                                          : "Fees TBD"
                                    }
                                  </p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4" />
                                <span>Updated: {getLatestStatusDate(deal)}</span>
                              </div>
                              {deal.useConfirmedDate && (
                                <div className="flex items-center space-x-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>Confirmed: {formatDate(deal.useConfirmedDate)}</span>
                                </div>
                              )}
                            </div>
                            
                            {deal.projectDescription && (
                              <p className="text-sm text-gray-600 mt-3">{deal.projectDescription}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={(e) => handleEditDeal(e, deal)}
                          >
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

      <ComprehensiveAddDealForm open={showAddDeal} onClose={() => setShowAddDeal(false)} />
      
      <ComprehensiveAddDealForm 
        open={showEditDeal} 
        onClose={() => {
          setShowEditDeal(false);
          setEditingDeal(null);
        }}
        deal={editingDeal}
      />
      
      <DealDetailsDialog 
        deal={selectedDeal}
        open={showDealDetails}
        onClose={() => setShowDealDetails(false)}
      />
    </div>
  );
}
