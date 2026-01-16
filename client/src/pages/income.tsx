import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import AddPaymentForm from "@/components/forms/add-payment-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, Calendar, AlertTriangle, CheckCircle, Clock, Edit, Trash2, Music, Users } from "lucide-react";
import type { Payment, DealWithRelations } from "@shared/schema";

interface JonasPaymentEntry {
  dealId: number;
  projectName: string;
  name: string;
  company: string;
  ownership: string;
  fee: number;
  jonasShare: string;
  paymentDate: string;
  type: 'publishing' | 'recording';
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

  const jonasPayments = useMemo(() => {
    const entries: JonasPaymentEntry[] = [];
    
    deals.forEach(deal => {
      const fullSongValue = Number(deal.fullSongValue) || 0;
      const fullRecordingFee = Number(deal.fullRecordingFee) || 0;
      
      if (deal.composerPublishers && Array.isArray(deal.composerPublishers)) {
        deal.composerPublishers.forEach((cp: any) => {
          if (cp.isMine) {
            const ownership = parseFloat(cp.publishingOwnership) || 0;
            const fee = (fullSongValue * ownership) / 100;
            entries.push({
              dealId: deal.id,
              projectName: deal.projectName,
              name: cp.composer || '',
              company: cp.publisher || '',
              ownership: cp.publishingOwnership || '',
              fee: fee,
              jonasShare: cp.jonasShare || '',
              paymentDate: cp.paymentDate || '',
              type: 'publishing'
            });
          }
        });
      }
      
      if (deal.artistLabels && Array.isArray(deal.artistLabels)) {
        deal.artistLabels.forEach((al: any) => {
          if (al.isMine) {
            const ownership = parseFloat(al.labelOwnership) || 0;
            const fee = (fullRecordingFee * ownership) / 100;
            entries.push({
              dealId: deal.id,
              projectName: deal.projectName,
              name: al.artist || '',
              company: al.label || '',
              ownership: al.labelOwnership || '',
              fee: fee,
              jonasShare: al.jonasShare || '',
              paymentDate: al.paymentDate || '',
              type: 'recording'
            });
          }
        });
      }
    });
    
    return entries;
  }, [deals]);

  const jonasPublishingPayments = jonasPayments.filter(p => p.type === 'publishing');
  const jonasRecordingPayments = jonasPayments.filter(p => p.type === 'recording');

  const totalJonasPublishing = jonasPublishingPayments.reduce((sum, p) => sum + (parseFloat(p.jonasShare) || 0), 0);
  const totalJonasRecording = jonasRecordingPayments.reduce((sum, p) => sum + (parseFloat(p.jonasShare) || 0), 0);

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
    if (!date) return "";
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
                  <p className="text-sm font-medium text-gray-600">Jonas Publishing</p>
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
                  <p className="text-sm font-medium text-gray-600">Jonas Recording</p>
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
                  <p className="text-sm font-medium text-gray-600">Payments Received</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending/Overdue</p>
                  <p className="text-2xl font-bold text-yellow-600">{formatCurrency(totalPending + totalOverdue)}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="jonas">Jonas Income</TabsTrigger>
            <TabsTrigger value="all">All Payments</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="paid">Paid</TabsTrigger>
            <TabsTrigger value="overdue">Overdue</TabsTrigger>
          </TabsList>
          
          {/* Jonas Income Tab */}
          <TabsContent value="jonas" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Jonas Publishing Income */}
              <Card className="border-purple-200">
                <CardHeader className="bg-purple-50 border-b border-purple-200">
                  <CardTitle className="flex items-center gap-2 text-purple-800">
                    <Music className="h-5 w-5" />
                    Jonas Publishing Income
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {jonasPublishingPayments.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      No Jonas publishing entries found
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-purple-50">
                          <tr className="border-b border-purple-200">
                            <th className="text-left py-2 px-3 font-medium text-purple-700">Project</th>
                            <th className="text-left py-2 px-3 font-medium text-purple-700">Writer</th>
                            <th className="text-left py-2 px-3 font-medium text-purple-700">Publisher</th>
                            <th className="text-right py-2 px-3 font-medium text-purple-700">Jonas Share</th>
                            <th className="text-left py-2 px-3 font-medium text-purple-700">Payment Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-purple-100">
                          {jonasPublishingPayments.map((entry, idx) => (
                            <tr key={`pub-${entry.dealId}-${idx}`} className="hover:bg-purple-50">
                              <td className="py-2 px-3 font-medium">{entry.projectName}</td>
                              <td className="py-2 px-3">{entry.name}</td>
                              <td className="py-2 px-3">{entry.company}</td>
                              <td className="py-2 px-3 text-right font-medium text-purple-700">
                                {entry.jonasShare ? formatCurrency(entry.jonasShare) : '-'}
                              </td>
                              <td className="py-2 px-3">
                                {entry.paymentDate ? formatDate(entry.paymentDate) : '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-purple-100">
                          <tr>
                            <td colSpan={3} className="py-2 px-3 font-bold text-purple-800">Total</td>
                            <td className="py-2 px-3 text-right font-bold text-purple-800">
                              {formatCurrency(totalJonasPublishing)}
                            </td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Jonas Recording Income */}
              <Card className="border-blue-200">
                <CardHeader className="bg-blue-50 border-b border-blue-200">
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <Users className="h-5 w-5" />
                    Jonas Recording Income
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {jonasRecordingPayments.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      No Jonas recording entries found
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-blue-50">
                          <tr className="border-b border-blue-200">
                            <th className="text-left py-2 px-3 font-medium text-blue-700">Project</th>
                            <th className="text-left py-2 px-3 font-medium text-blue-700">Artist</th>
                            <th className="text-left py-2 px-3 font-medium text-blue-700">Label</th>
                            <th className="text-right py-2 px-3 font-medium text-blue-700">Jonas Share</th>
                            <th className="text-left py-2 px-3 font-medium text-blue-700">Payment Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-blue-100">
                          {jonasRecordingPayments.map((entry, idx) => (
                            <tr key={`rec-${entry.dealId}-${idx}`} className="hover:bg-blue-50">
                              <td className="py-2 px-3 font-medium">{entry.projectName}</td>
                              <td className="py-2 px-3">{entry.name}</td>
                              <td className="py-2 px-3">{entry.company}</td>
                              <td className="py-2 px-3 text-right font-medium text-blue-700">
                                {entry.jonasShare ? formatCurrency(entry.jonasShare) : '-'}
                              </td>
                              <td className="py-2 px-3">
                                {entry.paymentDate ? formatDate(entry.paymentDate) : '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-blue-100">
                          <tr>
                            <td colSpan={3} className="py-2 px-3 font-bold text-blue-800">Total</td>
                            <td className="py-2 px-3 text-right font-bold text-blue-800">
                              {formatCurrency(totalJonasRecording)}
                            </td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* All Payments Tab */}
          <TabsContent value="all" className="mt-6">
            {renderPaymentsList(payments)}
          </TabsContent>

          <TabsContent value="pending" className="mt-6">
            {renderPaymentsList(filteredPayments)}
          </TabsContent>

          <TabsContent value="paid" className="mt-6">
            {renderPaymentsList(filteredPayments)}
          </TabsContent>

          <TabsContent value="overdue" className="mt-6">
            {renderPaymentsList(filteredPayments)}
          </TabsContent>
        </Tabs>
      </div>

      <AddPaymentForm open={showAddPayment} onClose={() => setShowAddPayment(false)} />
    </div>
  );

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
