import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, FileText, DollarSign, Send, Check, Clock, AlertCircle, Plus } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Deal } from "@shared/schema";

interface Invoice {
  id: number;
  dealId: number;
  invoiceNumber: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  status: string;
  dueDate: Date;
  paidDate?: Date;
  notes?: string;
  createdAt: Date;
  deal?: Deal;
}

export default function InvoiceManagement() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedDealId, setSelectedDealId] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [taxRate, setTaxRate] = useState("0");
  const [dueDate, setDueDate] = useState<Date>();
  const [notes, setNotes] = useState("");
  const { toast } = useToast();

  const { data: invoices = [] } = useQuery({
    queryKey: ['/api/invoices'],
  });

  const { data: deals = [] } = useQuery({
    queryKey: ['/api/deals'],
  });

  const createInvoiceMutation = useMutation({
    mutationFn: async (invoiceData: any) => {
      return apiRequest('/api/invoices', {
        method: 'POST',
        body: invoiceData
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      setShowCreateDialog(false);
      resetForm();
      toast({
        title: "Invoice Created",
        description: "Invoice has been generated successfully"
      });
    }
  });

  const updateInvoiceStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return apiRequest(`/api/invoices/${id}`, {
        method: 'PUT',
        body: { status }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      toast({
        title: "Status Updated",
        description: "Invoice status has been updated"
      });
    }
  });

  const resetForm = () => {
    setSelectedDealId("");
    setAmount("");
    setTaxRate("0");
    setDueDate(undefined);
    setNotes("");
  };

  const calculateTotal = () => {
    const baseAmount = parseFloat(amount) || 0;
    const tax = baseAmount * (parseFloat(taxRate) / 100);
    return baseAmount + tax;
  };

  const generateInvoiceNumber = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `INV-${year}${month}${day}-${random}`;
  };

  const handleCreateInvoice = () => {
    if (!selectedDealId || !amount || !dueDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const baseAmount = parseFloat(amount);
    const taxAmount = baseAmount * (parseFloat(taxRate) / 100);
    const totalAmount = baseAmount + taxAmount;

    createInvoiceMutation.mutate({
      dealId: parseInt(selectedDealId),
      invoiceNumber: generateInvoiceNumber(),
      amount: baseAmount,
      taxAmount,
      totalAmount,
      dueDate: dueDate.toISOString(),
      notes
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <Check className="h-4 w-4" />;
      case 'sent': return <Send className="h-4 w-4" />;
      case 'overdue': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Invoice Management</h2>
          <p className="text-gray-600">Generate and track invoices for your deals</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Invoice
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Invoice</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="deal">Deal</Label>
                <Select value={selectedDealId} onValueChange={setSelectedDealId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a deal" />
                  </SelectTrigger>
                  <SelectContent>
                    {deals.map((deal: Deal) => (
                      <SelectItem key={deal.id} value={deal.id.toString()}>
                        {deal.projectTitle} - ${deal.value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount ($)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxRate">Tax Rate (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    value={taxRate}
                    onChange={(e) => setTaxRate(e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dueDate ? format(dueDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dueDate}
                      onSelect={setDueDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Input
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional notes..."
                />
              </div>

              {amount && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>${parseFloat(amount || "0").toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax ({taxRate}%):</span>
                    <span>${(parseFloat(amount || "0") * parseFloat(taxRate) / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                    <span>Total:</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              )}

              <Button onClick={handleCreateInvoice} className="w-full">
                Generate Invoice
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {invoices.map((invoice: Invoice) => (
          <Card key={invoice.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span className="font-semibold">{invoice.invoiceNumber}</span>
                    <Badge className={getStatusColor(invoice.status)}>
                      {getStatusIcon(invoice.status)}
                      <span className="ml-1">{invoice.status}</span>
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    Due: {format(new Date(invoice.dueDate), "MMM dd, yyyy")}
                  </p>
                  {invoice.deal && (
                    <p className="text-sm text-gray-600">
                      Deal: {invoice.deal.projectTitle}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">${invoice.totalAmount.toFixed(2)}</div>
                  <div className="text-sm text-gray-600">
                    Tax: ${invoice.taxAmount.toFixed(2)}
                  </div>
                </div>
              </div>
              
              {invoice.status !== 'paid' && (
                <div className="flex gap-2 mt-4">
                  {invoice.status === 'draft' && (
                    <Button 
                      size="sm" 
                      onClick={() => updateInvoiceStatusMutation.mutate({ id: invoice.id, status: 'sent' })}
                    >
                      <Send className="h-4 w-4 mr-1" />
                      Send
                    </Button>
                  )}
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => updateInvoiceStatusMutation.mutate({ id: invoice.id, status: 'paid' })}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Mark Paid
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}