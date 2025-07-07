import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { CalendarIcon, Plus, Receipt, DollarSign, FileText, Briefcase, Camera, Gavel, Megaphone } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Song } from "@shared/schema";

interface Expense {
  id: number;
  songId?: number;
  category: string;
  description: string;
  amount: number;
  date: Date;
  receipt?: string;
  taxDeductible: boolean;
  createdAt: Date;
  song?: Song;
}

const expenseCategories = [
  { value: "production", label: "Production", icon: Camera },
  { value: "marketing", label: "Marketing", icon: Megaphone },
  { value: "legal", label: "Legal", icon: Gavel },
  { value: "business", label: "Business", icon: Briefcase },
  { value: "equipment", label: "Equipment", icon: Receipt },
  { value: "travel", label: "Travel", icon: DollarSign },
  { value: "software", label: "Software", icon: FileText },
  { value: "other", label: "Other", icon: Receipt }
];

export default function ExpenseTracking() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedSongId, setSelectedSongId] = useState<string>("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [taxDeductible, setTaxDeductible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { toast } = useToast();

  const { data: expenses = [] } = useQuery({
    queryKey: ['/api/expenses'],
  });

  const { data: songs = [] } = useQuery({
    queryKey: ['/api/songs'],
  });

  const createExpenseMutation = useMutation({
    mutationFn: async (expenseData: any) => {
      return apiRequest('/api/expenses', {
        method: 'POST',
        body: expenseData
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/expenses'] });
      setShowCreateDialog(false);
      resetForm();
      toast({
        title: "Expense Added",
        description: "Expense has been recorded successfully"
      });
    }
  });

  const resetForm = () => {
    setSelectedSongId("");
    setCategory("");
    setDescription("");
    setAmount("");
    setDate(new Date());
    setTaxDeductible(false);
  };

  const handleCreateExpense = () => {
    if (!category || !description || !amount || !date) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    createExpenseMutation.mutate({
      songId: selectedSongId ? parseInt(selectedSongId) : null,
      category,
      description,
      amount: parseFloat(amount),
      date: date.toISOString(),
      taxDeductible
    });
  };

  const filteredExpenses = expenses.filter((expense: Expense) => 
    selectedCategory === "all" || expense.category === selectedCategory
  );

  const totalExpenses = filteredExpenses.reduce((sum: number, expense: Expense) => sum + expense.amount, 0);
  const taxDeductibleTotal = filteredExpenses
    .filter((expense: Expense) => expense.taxDeductible)
    .reduce((sum: number, expense: Expense) => sum + expense.amount, 0);

  const getCategoryIcon = (categoryValue: string) => {
    const category = expenseCategories.find(cat => cat.value === categoryValue);
    const IconComponent = category?.icon || Receipt;
    return <IconComponent className="h-4 w-4" />;
  };

  const getCategoryColor = (categoryValue: string) => {
    const colors: Record<string, string> = {
      production: "bg-blue-100 text-blue-800",
      marketing: "bg-green-100 text-green-800",
      legal: "bg-red-100 text-red-800",
      business: "bg-purple-100 text-purple-800",
      equipment: "bg-yellow-100 text-yellow-800",
      travel: "bg-orange-100 text-orange-800",
      software: "bg-indigo-100 text-indigo-800",
      other: "bg-gray-100 text-gray-800"
    };
    return colors[categoryValue] || colors.other;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Expense Tracking</h2>
          <p className="text-gray-600">Track business expenses and tax deductibles</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Expense</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        <div className="flex items-center gap-2">
                          <cat.icon className="h-4 w-4" />
                          {cat.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="song">Related Song (Optional)</Label>
                <Select value={selectedSongId} onValueChange={setSelectedSongId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a song" />
                  </SelectTrigger>
                  <SelectContent>
                    {songs.map((song: Song) => (
                      <SelectItem key={song.id} value={song.id.toString()}>
                        {song.title} - {song.artist}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the expense..."
                  rows={3}
                />
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
                  <Label>Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="taxDeductible"
                  checked={taxDeductible}
                  onCheckedChange={setTaxDeductible}
                />
                <Label htmlFor="taxDeductible">Tax deductible</Label>
              </div>

              <Button onClick={handleCreateExpense} className="w-full">
                Add Expense
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalExpenses.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tax Deductible</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${taxDeductibleTotal.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {expenseCategories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4">
        {filteredExpenses.map((expense: Expense) => (
          <Card key={expense.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(expense.category)}
                    <span className="font-semibold">{expense.description}</span>
                    <Badge className={getCategoryColor(expense.category)}>
                      {expenseCategories.find(cat => cat.value === expense.category)?.label}
                    </Badge>
                    {expense.taxDeductible && (
                      <Badge variant="outline">Tax Deductible</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    {format(new Date(expense.date), "MMM dd, yyyy")}
                  </p>
                  {expense.song && (
                    <p className="text-sm text-gray-600">
                      Song: {expense.song.title} - {expense.song.artist}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold">${expense.amount.toFixed(2)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}