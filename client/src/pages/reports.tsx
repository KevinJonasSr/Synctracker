import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { ChartBar, Download, Calendar, TrendingUp, DollarSign } from "lucide-react";
import type { DashboardMetrics, DealWithRelations } from "@shared/schema";

export default function Reports() {
  const [dateRange, setDateRange] = useState("last-30-days");
  const [reportType, setReportType] = useState("overview");

  const { data: metrics, isLoading: metricsLoading } = useQuery<DashboardMetrics>({
    queryKey: ["/api/dashboard"],
  });

  const { data: deals = [], isLoading: dealsLoading } = useQuery<DealWithRelations[]>({
    queryKey: ["/api/deals"],
  });

  const isLoading = metricsLoading || dealsLoading;

  // Process data for charts
  const dealsByStatusData = metrics?.dealsByStatus ? Object.entries(metrics.dealsByStatus).map(([status, count]) => ({
    name: status.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase()),
    value: count
  })) : [];

  const revenueByMonthData = [
    { month: "Jan", revenue: 45000, deals: 12 },
    { month: "Feb", revenue: 52000, deals: 15 },
    { month: "Mar", revenue: 48000, deals: 11 },
    { month: "Apr", revenue: 61000, deals: 18 },
    { month: "May", revenue: 55000, deals: 14 },
    { month: "Jun", revenue: 67000, deals: 20 },
  ];

  const topProjectTypes = deals.reduce((acc, deal) => {
    acc[deal.projectType] = (acc[deal.projectType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const projectTypeData = Object.entries(topProjectTypes).map(([type, count]) => ({
    name: type.charAt(0).toUpperCase() + type.slice(1),
    value: count
  }));

  const COLORS = ['#2563EB', '#059669', '#7C3AED', '#EF4444', '#F59E0B'];

  if (isLoading) {
    return (
      <div>
        <Header
          title="Reports"
          description="Analyze your sync licensing performance and revenue trends"
        />
        <div className="p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="h-10 bg-gray-200 rounded w-48 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded w-48 animate-pulse"></div>
          </div>
          <div className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header
        title="Reports"
        description="Analyze your sync licensing performance and revenue trends"
        searchPlaceholder="Search reports..."
        newItemLabel="Export Report"
        onNewItem={() => {}}
        showSearch={false}
      />
      
      <div className="p-6">
        {/* Filters */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last-7-days">Last 7 Days</SelectItem>
                <SelectItem value="last-30-days">Last 30 Days</SelectItem>
                <SelectItem value="last-90-days">Last 90 Days</SelectItem>
                <SelectItem value="last-year">Last Year</SelectItem>
                <SelectItem value="all-time">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <ChartBar className="h-4 w-4 text-gray-500" />
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overview">Overview</SelectItem>
                <SelectItem value="revenue">Revenue Analysis</SelectItem>
                <SelectItem value="deals">Deal Performance</SelectItem>
                <SelectItem value="contacts">Contact Analysis</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button variant="outline" className="ml-auto">
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>

        {/* Key Metrics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">${metrics?.totalRevenue.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-2 flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500 font-medium">+12.5%</span>
                <span className="text-gray-600 ml-1">vs last period</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Deals</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics?.activeDeals}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <ChartBar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-2 flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500 font-medium">+8.3%</span>
                <span className="text-gray-600 ml-1">vs last period</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-gray-900">73%</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-2 flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500 font-medium">+5.2%</span>
                <span className="text-gray-600 ml-1">vs last period</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Deal Value</p>
                  <p className="text-2xl font-bold text-gray-900">$4,250</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <div className="mt-2 flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500 font-medium">+15.7%</span>
                <span className="text-gray-600 ml-1">vs last period</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueByMonthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                  <Line type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Deal Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Deal Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dealsByStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {dealsByStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Project Types */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Types</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={projectTypeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#059669" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Deals Closed This Month</p>
                    <p className="text-sm text-gray-600">Target: 15 deals</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">18</p>
                    <Badge className="bg-green-100 text-green-800">+20%</Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Average Response Time</p>
                    <p className="text-sm text-gray-600">Target: 5 days</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">3.2</p>
                    <Badge className="bg-blue-100 text-blue-800">Excellent</Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Client Satisfaction</p>
                    <p className="text-sm text-gray-600">Based on feedback</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-purple-600">4.8</p>
                    <Badge className="bg-purple-100 text-purple-800">Outstanding</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
