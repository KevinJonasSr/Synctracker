import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import AddPaymentForm from "@/components/forms/add-payment-form";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, Calendar, AlertTriangle, CheckCircle, Clock, Edit, Trash2 } from "lucide-react";
import type { Payment } from "@shared/schema";

export default function Income() {
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const { data: payments = [], isLoading, isError, refetch } = useQuery<Payment[]>({
    queryKey: ["/api/payments"],
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

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

  const formatDate = (date: Date | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  };

  const formatCurrency = (amount: string | null) => {
    if (!amount) return "$0.00";
    return `$${Number(amount).toLocaleString()}`;
  };

  const isOverdue = (payment: Payment) => {
    if (payment.status === "paid") return false;
    return new Date(payment.dueDate) < new Date();
  };

  const filteredPayments = activeTab === "all" 
    ? payments 
    : payments.filter(payment => {
        if (activeTab === "overdue") {
          return isOverdue(payment);
        }
        return payment.status === activeTab;
      });

  // Calculate totals
  const totalPending = payments
    .filter(p => p.status === "pending")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const totalPaid = payments
    .filter(p => p.status === "paid")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const totalOverdue = payments
    .filter(p => isOverdue(p))
    .reduce((sum, p) => sum + Number(p.amount), 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-gray-600">Loading payments...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="text-lg text-red-600">Failed to load payments</div>
        <p className="text-sm text-gray-500">Please check your connection and try again</p>
        <Button onClick={() => refetch()} variant="outline">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Paid</p>
                  <p className="text-2xl font-bold text-green-600">${totalPaid.toLocaleString()}</p>
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
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">${totalPending.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Overdue</p>
                  <p className="text-2xl font-bold text-red-600">${totalOverdue.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">All Payments</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="paid">Paid</TabsTrigger>
            <TabsTrigger value="overdue">Overdue</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-6">
            {filteredPayments.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <DollarSign className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No payments found</h3>
                  <p className="text-gray-600 text-center mb-6">
                    {activeTab === "all"
                      ? "Start tracking your income by adding your first payment record."
                      : `No ${activeTab} payments found.`
                    }
                  </p>
                  <Button onClick={() => setShowAddPayment(true)} className="bg-brand-primary hover:bg-blue-700">
                    Add Your First Payment
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {filteredPayments.map((payment) => (
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
            )}
          </TabsContent>
        </Tabs>
      </div>

      <AddPaymentForm open={showAddPayment} onClose={() => setShowAddPayment(false)} />
    </div>
  );
}
