import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Area, AreaChart,
  ScatterChart, Scatter, ReferenceLine
} from 'recharts';
import { TrendingUp, PieChart as PieChartIcon, BarChart3, Activity } from "lucide-react";
import type { AdvancedMetrics } from "@shared/schema";

interface InteractiveChartsProps {
  timeRange?: string;
  onChartClick?: (chartType: string, data: any) => void;
}

export default function InteractiveCharts({ timeRange = '30d', onChartClick }: InteractiveChartsProps) {
  const [activeChart, setActiveChart] = useState<string>("revenue");

  const { data: metrics, isLoading } = useQuery<AdvancedMetrics>({
    queryKey: ["/api/dashboard/advanced-metrics", timeRange],
  });

  if (isLoading || !metrics) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-64 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Prepare chart data
  const revenueData = [
    { month: 'Jan', revenue: metrics.revenueAnalytics.currentMonth * 0.8, target: metrics.revenueAnalytics.projectedMonthly * 0.8 },
    { month: 'Feb', revenue: metrics.revenueAnalytics.currentMonth * 0.9, target: metrics.revenueAnalytics.projectedMonthly * 0.9 },
    { month: 'Mar', revenue: metrics.revenueAnalytics.currentMonth * 1.1, target: metrics.revenueAnalytics.projectedMonthly * 1.0 },
    { month: 'Apr', revenue: metrics.revenueAnalytics.currentMonth, target: metrics.revenueAnalytics.projectedMonthly },
  ];

  const dealStageData = metrics.dealPerformance.dealsByStage.map(stage => ({
    stage: stage.stage.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    count: stage.count,
    value: stage.value,
    avgTime: stage.avgTimeInStage,
  }));

  const portfolioData = metrics.portfolioAnalysis.revenueDistribution.byGenre.map(item => ({
    name: item.genre,
    value: item.revenue,
    percentage: item.percentage,
  }));

  const performanceData = [
    { metric: 'Conversion Rate', current: metrics.dealPerformance.conversionRate, target: 75, benchmark: 65 },
    { metric: 'Avg Deal Value', current: metrics.dealPerformance.averageDealValue / 1000, target: 6, benchmark: 4.5 },
    { metric: 'Time to Close', current: metrics.dealPerformance.averageTimeToClose, target: 25, benchmark: 35 },
    { metric: 'Client Retention', current: 94, target: 90, benchmark: 80 },
  ];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {typeof entry.value === 'number' && entry.value > 1000 
                ? `$${(entry.value / 1000).toFixed(1)}k` 
                : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900">Performance Analytics</h3>
        <Tabs value={activeChart} onValueChange={setActiveChart}>
          <TabsList>
            <TabsTrigger value="revenue" data-testid="chart-revenue">
              <TrendingUp size={16} className="mr-2" />
              Revenue
            </TabsTrigger>
            <TabsTrigger value="pipeline" data-testid="chart-pipeline">
              <BarChart3 size={16} className="mr-2" />
              Pipeline
            </TabsTrigger>
            <TabsTrigger value="portfolio" data-testid="chart-portfolio">
              <PieChartIcon size={16} className="mr-2" />
              Portfolio
            </TabsTrigger>
            <TabsTrigger value="performance" data-testid="chart-performance">
              <Activity size={16} className="mr-2" />
              Performance
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend Chart */}
        <Card className={activeChart === 'revenue' ? 'ring-2 ring-blue-500' : ''}>
          <CardHeader>
            <h4 className="font-semibold">Revenue Trend vs Target</h4>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stackId="1" 
                  stroke="#3B82F6" 
                  fill="#3B82F6" 
                  fillOpacity={0.6}
                  name="Actual Revenue"
                />
                <Line 
                  type="monotone" 
                  dataKey="target" 
                  stroke="#EF4444" 
                  strokeDasharray="5 5"
                  name="Target"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Deal Pipeline Chart */}
        <Card className={activeChart === 'pipeline' ? 'ring-2 ring-blue-500' : ''}>
          <CardHeader>
            <h4 className="font-semibold">Deal Pipeline by Stage</h4>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dealStageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="stage" 
                  angle={-45} 
                  textAnchor="end" 
                  height={80}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#3B82F6" name="Deal Count" />
                <Bar dataKey="value" fill="#10B981" name="Total Value ($)" yAxisId="right" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Portfolio Distribution Chart */}
        <Card className={activeChart === 'portfolio' ? 'ring-2 ring-blue-500' : ''}>
          <CardHeader>
            <h4 className="font-semibold">Revenue by Genre</h4>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={portfolioData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {portfolioData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance Benchmarks Chart */}
        <Card className={activeChart === 'performance' ? 'ring-2 ring-blue-500' : ''}>
          <CardHeader>
            <h4 className="font-semibold">Performance vs Benchmarks</h4>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="metric" type="category" width={100} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="current" fill="#3B82F6" name="Current" />
                <Bar dataKey="target" fill="#10B981" name="Target" />
                <Bar dataKey="benchmark" fill="#F59E0B" name="Industry Avg" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Chart View */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">
              {activeChart === 'revenue' && 'Revenue Analytics Deep Dive'}
              {activeChart === 'pipeline' && 'Pipeline Conversion Analysis'}
              {activeChart === 'portfolio' && 'Portfolio Performance Breakdown'}
              {activeChart === 'performance' && 'Competitive Benchmarking'}
            </h4>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onChartClick?.(activeChart, metrics)}
              data-testid={`expand-chart-${activeChart}`}
            >
              Expand Analysis
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            {activeChart === 'revenue' && (
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  name="Revenue"
                />
                <Line 
                  type="monotone" 
                  dataKey="target" 
                  stroke="#EF4444" 
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  name="Target"
                />
                <ReferenceLine y={metrics.revenueAnalytics.projectedMonthly} stroke="red" strokeDasharray="3 3" />
              </LineChart>
            )}
            
            {activeChart === 'pipeline' && (
              <ScatterChart data={dealStageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="avgTime" name="Avg Time in Stage (days)" />
                <YAxis dataKey="count" name="Deal Count" />
                <Tooltip content={<CustomTooltip />} />
                <Scatter dataKey="count" fill="#3B82F6" />
              </ScatterChart>
            )}
            
            {activeChart === 'portfolio' && (
              <BarChart data={portfolioData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#3B82F6" name="Revenue" />
              </BarChart>
            )}
            
            {activeChart === 'performance' && (
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="metric" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="current" fill="#3B82F6" name="Current Performance" />
                <Bar dataKey="target" fill="#10B981" name="Target" />
                <Bar dataKey="benchmark" fill="#F59E0B" name="Industry Benchmark" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}