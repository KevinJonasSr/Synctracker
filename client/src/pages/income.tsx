import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import AddPaymentForm from "@/components/forms/add-payment-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, Calendar, AlertTriangle, CheckCircle, Clock, Edit, Trash2, Music, Users } from "lucide-react";

const VanIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M3 17h1a2 2 0 1 0 4 0h8a2 2 0 1 0 4 0h1v-6l-3-5H3v11zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm14 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM4 7h10v4H4V7zm11 0h2.5l2 3.5V11H15V7z"/>
  </svg>
);
import type { Payment, DealWithRelations } from "@shared/schema";

interface JonasEntry {
  name: string;
  company: string;
  jonasIncome: string;
  paymentDate: string;
  type: 'publishing' | 'recording';
}

interface ProjectGroup {
  dealId: number;
  projectName: string;
  songTitle: string;
  publishingEntries: JonasEntry[];
  recordingEntries: JonasEntry[];
}

export default function Income() {
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [activeTab, setActiveTab] = useState("jonas");

  const { data: payments = [], isLoading: paymentsLoading, isError: paymentsError, refetch: refetchPayments } = useQuery<Payment[]>({
    queryKey: ["/api/payments"],
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const { data: deals = [], isLoading: dealsLoading, isError: dealsError, refetch: refetchDeals } = useQuery<DealWithRelations[]>({
    queryKey: ["/api/deals"],
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const projectGroups = useMemo(() => {
    const groups: ProjectGroup[] = [];
    
    deals.forEach(deal => {
      const publishingEntries: JonasEntry[] = [];
      const recordingEntries: JonasEntry[] = [];
      
      if (deal.composerPublishers && Array.isArray(deal.composerPublishers)) {
        deal.composerPublishers.forEach((cp: any) => {
          if (cp.isMine) {
            publishingEntries.push({
              name: cp.composer || '',
              company: cp.publisher || '',
              jonasIncome: cp.jonasShare || '',
              paymentDate: cp.paymentDate || '',
              type: 'publishing'
            });
          }
        });
      }
      
      if (deal.artistLabels && Array.isArray(deal.artistLabels)) {
        deal.artistLabels.forEach((al: any) => {
          if (al.isMine) {
            recordingEntries.push({
              name: al.artist || '',
              company: al.label || '',
              jonasIncome: al.jonasShare || '',
              paymentDate: al.paymentDate || '',
              type: 'recording'
            });
          }
        });
      }
      
      if (publishingEntries.length > 0 || recordingEntries.length > 0) {
        groups.push({
          dealId: deal.id,
          projectName: deal.projectName,
          songTitle: deal.song?.title || '',
          publishingEntries,
          recordingEntries
        });
      }
    });
    
    return groups;
  }, [deals]);

  const totalJonasPublishing = projectGroups.reduce((sum, group) => 
    sum + group.publishingEntries.reduce((s, e) => s + (parseFloat(e.jonasIncome) || 0), 0), 0);
  const totalJonasRecording = projectGroups.reduce((sum, group) => 
    sum + group.recordingEntries.reduce((s, e) => s + (parseFloat(e.jonasIncome) || 0), 0), 0);
  const totalJonasIncome = totalJonasPublishing + totalJonasRecording;

  const hasAnyPayment = (group: ProjectGroup) => {
    const pubHasPayment = group.publishingEntries.some(e => e.jonasIncome && e.paymentDate);
    const recHasPayment = group.recordingEntries.some(e => e.jonasIncome && e.paymentDate);
    return pubHasPayment || recHasPayment;
  };

  const pendingProjects = projectGroups.filter(g => !hasAnyPayment(g));
  const paidProjects = projectGroups.filter(g => hasAnyPayment(g));

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "paid":
        return "bg-green-100 text-green-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "paid":
        return <CheckCircle className="h-4 w-4" />;
      case "overdue":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString();
  };

  const formatCurrency = (amount: string | number | null) => {
    if (!amount) return "$0.00";
    return `$${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const isOverdue = (payment: Payment) => {
    if (payment.status === "paid") return false;
    return new Date(payment.dueDate) < new Date();
  };

  const filteredPayments = payments.filter(payment => {
    if (activeTab === "pending") return payment.status === "pending";
    if (activeTab === "paid") return payment.status === "paid";
    if (activeTab === "overdue") return isOverdue(payment);
    return true;
  });

  const totalPending = payments
    .filter(p => p.status === "pending")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const totalPaid = payments
    .filter(p => p.status === "paid")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const totalOverdue = payments
    .filter(p => isOverdue(p))
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const isLoading = paymentsLoading || dealsLoading;
  const isError = paymentsError || dealsError;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-gray-600">Loading income data...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="text-lg text-red-600">Failed to load income data</div>
        <p className="text-sm text-gray-500">Please check your connection and try again</p>
        <Button onClick={() => { refetchPayments(); refetchDeals(); }} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div>
      <Header
        title="Income Tracking"
        description="Track payments and revenue from your sync licensing deals"
        searchPlaceholder="Search payments, deals..."
        newItemLabel="Add Payment"
        onNewItem={() => setShowAddPayment(true)}
      />
      
      <div className="p-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Jonas Income</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(totalJonasIncome)}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Publishing Income</p>
                  <p className="text-2xl font-bold text-purple-600">{formatCurrency(totalJonasPublishing)}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Music className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Recording Income</p>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalJonasRecording)}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Projects</p>
                  <p className="text-2xl font-bold text-gray-800">{projectGroups.length}</p>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="jonas">All Jonas Income</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingProjects.length})</TabsTrigger>
            <TabsTrigger value="paid">Paid ({paidProjects.length})</TabsTrigger>
          </TabsList>
          
          {/* Jonas Income Tab - Merged Report */}
          <TabsContent value="jonas" className="mt-6">
            <Card>
              <CardHeader className="bg-emerald-100 border-b border-emerald-200">
                <CardTitle className="text-lg text-emerald-800">Deal Income Pipeline</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {projectGroups.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    No Jonas income entries found
                  </div>
                ) : (
                  <div className="divide-y">
                    {projectGroups.map((project) => (
                      <div key={project.dealId} className="p-4">
                        {/* Project Title */}
                        <h3 className="text-lg font-bold text-gray-900 mb-3">{project.projectName}</h3>
                        
                        {/* Song Title */}
                        {project.songTitle && (
                          <p className="text-sm text-gray-600 mb-3">Song: <span className="font-bold">{project.songTitle}</span></p>
                        )}
                        
                        {/* Publishing Info */}
                        {project.publishingEntries.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-semibold text-purple-700 mb-2 flex items-center gap-1">
                              <Music className="h-4 w-4" />
                              Publishing Info
                            </h4>
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead className="bg-purple-50">
                                  <tr>
                                    <th className="text-left py-2 px-3 font-medium text-purple-700">Jonas Writer</th>
                                    <th className="text-left py-2 px-3 font-medium text-purple-700">Publisher</th>
                                    <th className="text-right py-2 px-3 font-medium text-purple-700">Jonas Income</th>
                                    <th className="text-left py-2 px-3 font-medium text-purple-700">Payment Date</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-purple-100">
                                  {project.publishingEntries.map((entry, idx) => (
                                    <tr key={`pub-${idx}`} className="hover:bg-purple-50">
                                      <td className="py-2 px-3">{entry.name}</td>
                                      <td className="py-2 px-3">{entry.company}</td>
                                      <td className="py-2 px-3 text-right font-medium text-purple-700">
                                        {entry.jonasIncome ? formatCurrency(entry.jonasIncome) : '-'}
                                      </td>
                                      <td className="py-2 px-3">
                                        {formatDate(entry.paymentDate)}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                        
                        {/* Label Info */}
                        {project.recordingEntries.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-blue-700 mb-2 flex items-center gap-1">
                              <VanIcon className="h-4 w-4 text-red-600" />
                              Label Info
                            </h4>
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead className="bg-blue-50">
                                  <tr>
                                    <th className="text-left py-2 px-3 font-medium text-blue-700">Jonas Artist</th>
                                    <th className="text-left py-2 px-3 font-medium text-blue-700">Label</th>
                                    <th className="text-right py-2 px-3 font-medium text-blue-700">Jonas Income</th>
                                    <th className="text-left py-2 px-3 font-medium text-blue-700">Payment Date</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-blue-100">
                                  {project.recordingEntries.map((entry, idx) => (
                                    <tr key={`rec-${idx}`} className="hover:bg-blue-50">
                                      <td className="py-2 px-3">{entry.name}</td>
                                      <td className="py-2 px-3">{entry.company}</td>
                                      <td className="py-2 px-3 text-right font-medium text-blue-700">
                                        {entry.jonasIncome ? formatCurrency(entry.jonasIncome) : '-'}
                                      </td>
                                      <td className="py-2 px-3">
                                        {formatDate(entry.paymentDate)}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Totals Footer */}
            {projectGroups.length > 0 && (
              <Card className="mt-4 bg-gray-50">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-800">Total Jonas Income</span>
                    <span className="text-xl font-bold text-green-600">{formatCurrency(totalJonasIncome)}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          {/* Pending Tab - Projects without payment */}
          <TabsContent value="pending" className="mt-6">
            <Card>
              <CardHeader className="bg-yellow-100 border-b border-yellow-200">
                <CardTitle className="text-lg text-yellow-800">Pending Payments</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {pendingProjects.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    No pending payments
                  </div>
                ) : (
                  <div className="divide-y">
                    {pendingProjects.map((project) => renderProjectCard(project))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Paid Tab - Projects with payment received */}
          <TabsContent value="paid" className="mt-6">
            <Card>
              <CardHeader className="bg-green-100 border-b border-green-200">
                <CardTitle className="text-lg text-green-800">Payments Received</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {paidProjects.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    No payments received yet
                  </div>
                ) : (
                  <div className="divide-y">
                    {paidProjects.map((project) => renderProjectCard(project))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <AddPaymentForm open={showAddPayment} onClose={() => setShowAddPayment(false)} />
    </div>
  );

  function renderProjectCard(project: ProjectGroup) {
    return (
      <div key={project.dealId} className="p-4">
        {/* Project Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-3">{project.projectName}</h3>
        
        {/* Song Title */}
        {project.songTitle && (
          <p className="text-sm text-gray-600 mb-3">Song: <span className="font-bold">{project.songTitle}</span></p>
        )}
        
        {/* Publishing Info */}
        {project.publishingEntries.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-purple-700 mb-2 flex items-center gap-1">
              <Music className="h-4 w-4" />
              Publishing Info
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-purple-50">
                  <tr>
                    <th className="text-left py-2 px-3 font-medium text-purple-700">Jonas Writer</th>
                    <th className="text-left py-2 px-3 font-medium text-purple-700">Publisher</th>
                    <th className="text-right py-2 px-3 font-medium text-purple-700">Jonas Income</th>
                    <th className="text-left py-2 px-3 font-medium text-purple-700">Payment Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-100">
                  {project.publishingEntries.map((entry, idx) => (
                    <tr key={`pub-${idx}`} className="hover:bg-purple-50">
                      <td className="py-2 px-3">{entry.name}</td>
                      <td className="py-2 px-3">{entry.company}</td>
                      <td className="py-2 px-3 text-right font-medium text-purple-700">
                        {entry.jonasIncome ? formatCurrency(entry.jonasIncome) : '-'}
                      </td>
                      <td className="py-2 px-3">
                        {formatDate(entry.paymentDate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Label Info */}
        {project.recordingEntries.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-blue-700 mb-2 flex items-center gap-1">
              <VanIcon className="h-4 w-4 text-red-600" />
              Label Info
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="text-left py-2 px-3 font-medium text-blue-700">Jonas Artist</th>
                    <th className="text-left py-2 px-3 font-medium text-blue-700">Label</th>
                    <th className="text-right py-2 px-3 font-medium text-blue-700">Jonas Income</th>
                    <th className="text-left py-2 px-3 font-medium text-blue-700">Payment Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-100">
                  {project.recordingEntries.map((entry, idx) => (
                    <tr key={`rec-${idx}`} className="hover:bg-blue-50">
                      <td className="py-2 px-3">{entry.name}</td>
                      <td className="py-2 px-3">{entry.company}</td>
                      <td className="py-2 px-3 text-right font-medium text-blue-700">
                        {entry.jonasIncome ? formatCurrency(entry.jonasIncome) : '-'}
                      </td>
                      <td className="py-2 px-3">
                        {formatDate(entry.paymentDate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  function renderPaymentsList(paymentsList: Payment[]) {
    if (paymentsList.length === 0) {
      return (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <DollarSign className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No payments found</h3>
            <p className="text-gray-600 text-center mb-6">
              Start tracking your income by adding your first payment record.
            </p>
            <Button onClick={() => setShowAddPayment(true)} className="bg-brand-primary hover:bg-blue-700">
              Add Your First Payment
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="grid gap-6">
        {paymentsList.map((payment) => (
          <Card key={payment.id} className={`hover:shadow-md transition-shadow ${
            isOverdue(payment) ? "border-red-200 bg-red-50" : ""
          }`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-brand-primary/10 rounded-lg flex items-center justify-center">
                    {getStatusIcon(payment.status)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Payment #{payment.id}
                      </h3>
                      <Badge className={getStatusColor(payment.status)}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </Badge>
                      {isOverdue(payment) && (
                        <Badge variant="destructive">
                          Overdue
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                      <div>
                        <p className="font-medium text-gray-900">Amount</p>
                        <p className="text-lg font-semibold">{formatCurrency(payment.amount)}</p>
                      </div>
                      
                      <div>
                        <p className="font-medium text-gray-900">Due Date</p>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>{formatDate(payment.dueDate)}</span>
                        </div>
                      </div>
                      
                      {payment.paidDate && (
                        <div>
                          <p className="font-medium text-gray-900">Paid Date</p>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>{formatDate(payment.paidDate)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {payment.notes && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">Notes:</p>
                        <p className="text-sm text-gray-600">{payment.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4" />
                  </Button>
                  {payment.status === "pending" && (
                    <Button size="sm" className="bg-brand-secondary hover:bg-emerald-700">
                      Mark Paid
                    </Button>
                  )}
                  <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
}
