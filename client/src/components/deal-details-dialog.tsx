import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EditDealForm from "@/components/forms/edit-deal-form";
import { 
  Calendar, 
  DollarSign, 
  Building, 
  Music, 
  Globe, 
  Shield, 
  FileText, 
  Edit, 
  Trash2,
  Users,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { DealWithRelations } from "@shared/schema";

interface DealDetailsDialogProps {
  deal: DealWithRelations | null;
  open: boolean;
  onClose: () => void;
}

export default function DealDetailsDialog({ deal, open, onClose }: DealDetailsDialogProps) {
  const { toast } = useToast();
  const [showEditForm, setShowEditForm] = useState(false);
  
  const deleteDealMutation = useMutation({
    mutationFn: async () => {
      if (!deal) return;
      return apiRequest('DELETE', `/api/deals/${deal.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/deals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      toast({
        title: "Deal deleted",
        description: "The deal has been successfully deleted.",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error deleting deal",
        description: "Failed to delete the deal. Please try again.",
        variant: "destructive",
      });
    }
  });

  if (!deal) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pitched":
        return "bg-gray-100 text-gray-800";
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
    switch (status) {
      case "pitched":
        return "Pitched";
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

  const formatDate = (date: Date | null | string) => {
    if (!date) return "Not set";
    return new Date(date).toLocaleDateString();
  };

  const formatDateTime = (date: Date | null | string) => {
    if (!date) return "Not set";
    return new Date(date).toLocaleString();
  };



  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete the deal "${deal.projectName}"? This action cannot be undone.`)) {
      deleteDealMutation.mutate();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <DialogTitle className="text-xl">{deal.projectName}</DialogTitle>
              <Badge className={getStatusColor(deal.status)}>
                {getStatusLabel(deal.status)}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => setShowEditForm(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDelete}
                disabled={deleteDealMutation.isPending}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="mt-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="pitches">Pitches</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Project Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>Project Details</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Project Type</label>
                    <p className="text-gray-900 capitalize">{deal.projectType}</p>
                  </div>
                  {deal.projectDescription && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Description</label>
                      <p className="text-gray-900">{deal.projectDescription}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-600">Territory</label>
                    <p className="text-gray-900 flex items-center space-x-2">
                      <Globe className="h-4 w-4" />
                      <span className="capitalize">{deal.territory}</span>
                    </p>
                  </div>
                  {deal.term && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Term</label>
                      <p className="text-gray-900">{deal.term}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-600">Exclusivity</label>
                    <p className="text-gray-900 flex items-center space-x-2">
                      <Shield className="h-4 w-4" />
                      <span>{deal.exclusivity ? "Exclusive" : "Non-exclusive"}</span>
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Song Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Music className="h-5 w-5" />
                    <span>Song Details</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Title</label>
                    <p className="text-gray-900 font-medium">{deal.song.title}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Artist</label>
                    <p className="text-gray-900">{deal.song.artist}</p>
                  </div>
                  {deal.song.album && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Album</label>
                      <p className="text-gray-900">{deal.song.album}</p>
                    </div>
                  )}
                  {deal.song.composer && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Composer</label>
                      <p className="text-gray-900">{deal.song.composer}</p>
                    </div>
                  )}
                  {deal.song.description && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Description</label>
                      <p className="text-gray-900 text-sm">{deal.song.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Contact Details</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Name</label>
                    <p className="text-gray-900 font-medium">{deal.contact.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-gray-900">{deal.contact.email}</p>
                  </div>
                  {deal.contact.phone && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Phone</label>
                      <p className="text-gray-900">{deal.contact.phone}</p>
                    </div>
                  )}
                  {deal.contact.company && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Company</label>
                      <p className="text-gray-900 flex items-center space-x-2">
                        <Building className="h-4 w-4" />
                        <span>{deal.contact.company}</span>
                      </p>
                    </div>
                  )}
                  {deal.contact.role && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Role</label>
                      <p className="text-gray-900">{deal.contact.role}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Financial Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5" />
                    <span>Financial Details</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Deal Value</label>
                    <p className="text-gray-900 font-medium">
                      {deal.dealValue ? `$${Number(deal.dealValue).toLocaleString()}` : "TBD"}
                    </p>
                  </div>
                  {deal.usage && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Usage</label>
                      <p className="text-gray-900">{deal.usage}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {deal.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-900 whitespace-pre-wrap">{deal.notes}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="timeline" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Deal Timeline</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">Air Date</p>
                      <p className="text-sm text-gray-600">{formatDate(deal.airDate)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">Pitch Date</p>
                      <p className="text-sm text-gray-600">{formatDate(deal.pitchDate)}</p>
                    </div>
                  </div>

                  {/* Status Timeline */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-4 p-3 bg-blue-50 rounded-lg">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      <div>
                        <p className="text-xs font-medium text-blue-700">Pitched</p>
                        <p className="text-xs text-blue-600">{formatDateTime(deal.pitchedDate)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 p-3 bg-yellow-50 rounded-lg">
                      <Calendar className="h-4 w-4 text-yellow-500" />
                      <div>
                        <p className="text-xs font-medium text-yellow-700">Pending Approval</p>
                        <p className="text-xs text-yellow-600">{formatDateTime(deal.pendingApprovalDate)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 p-3 bg-purple-50 rounded-lg">
                      <Calendar className="h-4 w-4 text-purple-500" />
                      <div>
                        <p className="text-xs font-medium text-purple-700">Quoted</p>
                        <p className="text-xs text-purple-600">{formatDateTime(deal.quotedDate)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <div>
                        <p className="text-xs font-medium text-green-700">Use Confirmed</p>
                        <p className="text-xs text-green-600">{formatDateTime(deal.useConfirmedDate)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 p-3 bg-indigo-50 rounded-lg">
                      <FileText className="h-4 w-4 text-indigo-500" />
                      <div>
                        <p className="text-xs font-medium text-indigo-700">Being Drafted</p>
                        <p className="text-xs text-indigo-600">{formatDateTime(deal.beingDraftedDate)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 p-3 bg-orange-50 rounded-lg">
                      <FileText className="h-4 w-4 text-orange-500" />
                      <div>
                        <p className="text-xs font-medium text-orange-700">Out for Signature</p>
                        <p className="text-xs text-orange-600">{formatDateTime(deal.outForSignatureDate)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 p-3 bg-emerald-50 rounded-lg">
                      <DollarSign className="h-4 w-4 text-emerald-500" />
                      <div>
                        <p className="text-xs font-medium text-emerald-700">Payment Received</p>
                        <p className="text-xs text-emerald-600">{formatDateTime(deal.paymentReceivedDate)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <div>
                        <p className="text-xs font-medium text-green-700">Completed</p>
                        <p className="text-xs text-green-600">{formatDateTime(deal.completedDate)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-sm text-gray-600">Created: {formatDateTime(deal.createdAt)}</p>
                  <p className="text-sm text-gray-600">Last Updated: {formatDateTime(deal.updatedAt)}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pitches" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pitches</CardTitle>
              </CardHeader>
              <CardContent>
                {deal.pitches && deal.pitches.length > 0 ? (
                  <div className="space-y-4">
                    {deal.pitches.map((pitch) => (
                      <div key={pitch.id} className="p-4 border rounded-lg">
                        <p className="font-medium">Pitch #{pitch.id}</p>
                        <p className="text-sm text-gray-600">Created: {formatDateTime(pitch.createdAt)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No pitches recorded for this deal.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Payments</CardTitle>
              </CardHeader>
              <CardContent>
                {deal.payments && deal.payments.length > 0 ? (
                  <div className="space-y-4">
                    {deal.payments.map((payment) => (
                      <div key={payment.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">${Number(payment.amount).toLocaleString()}</p>
                          <Badge className={payment.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                            {payment.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">Due: {formatDate(payment.dueDate)}</p>
                        {payment.paidDate && (
                          <p className="text-sm text-gray-600">Paid: {formatDate(payment.paidDate)}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No payments recorded for this deal.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
      
      <EditDealForm 
        deal={deal}
        open={showEditForm}
        onClose={() => setShowEditForm(false)}
      />
    </Dialog>
  );
}