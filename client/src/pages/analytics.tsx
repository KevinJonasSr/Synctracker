import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, DollarSign, Music, Users, Target, Calendar, BarChart3, Download, RefreshCw } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import type { ComprehensiveAnalytics, AnalyticsTimeRange } from "@shared/schema";

const COLORS = ['#2563EB', '#059669', '#7C3AED', '#EF4444', '#F59E0B', '#8B5CF6'];

export default function Analytics() {
  const [timeRange, setTimeRange] = useState<AnalyticsTimeRange>("1y");
  const [refreshing, setRefreshing] = useState(false);
  
  // Fetch comprehensive analytics data
  const { data: analytics, isLoading, error, refetch } = useQuery<ComprehensiveAnalytics>({
    queryKey: ["/api/analytics/comprehensive", timeRange],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const exportData = (type: 'pdf' | 'excel') => {
    // Implementation for export functionality
    console.log(`Exporting ${type} report for ${timeRange}`);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <BarChart3 className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColor = (value: number) => {
    return value > 0 ? 'text-green-600' : value < 0 ? 'text-red-600' : 'text-gray-600';
  };

  if (isLoading) {
    return (
      <div>
        <Header
          title="Analytics & Reports"
          description="Comprehensive insights into your sync licensing performance"
        />
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-12 w-full mb-4" />
                  <Skeleton className="h-6 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-1/3" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-64 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header
          title="Analytics & Reports"
          description="Comprehensive insights into your sync licensing performance"
        />
        <div className="p-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-red-600 mb-4">
                <BarChart3 className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Failed to load analytics</h3>
              <p className="text-gray-600 mb-4">There was an error loading the analytics data.</p>
              <Button onClick={handleRefresh} disabled={refreshing}>
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header
        title="Analytics & Reports"
        description="Comprehensive insights into your sync licensing performance"
      />

      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-4">
            <Select value={timeRange} onValueChange={(value) => setTimeRange(value as AnalyticsTimeRange)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
                <SelectItem value="1y">Last Year</SelectItem>
                <SelectItem value="2y">Last 2 Years</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" onClick={() => exportData('excel')}>
              <Download className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
            <Button variant="outline" onClick={() => exportData('pdf')}>
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="catalog">Music Catalog</TabsTrigger>
            <TabsTrigger value="forecast">Forecast</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Revenue</p>
                      <p className="text-2xl font-bold">${analytics?.revenue.total.toLocaleString()}</p>
                      <div className="flex items-center mt-2">
                        <span className={`text-sm ${getTrendColor(analytics?.revenue.growth || 0)}`}>
                          {(analytics?.revenue.growth || 0) > 0 ? '+' : ''}{(analytics?.revenue.growth || 0).toFixed(1)}%
                        </span>
                        <span className="text-gray-500 text-sm ml-1">vs previous period</span>
                      </div>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Deal Win Rate</p>
                      <p className="text-2xl font-bold">{analytics?.keyMetrics.dealWinRate.toFixed(1)}%</p>
                      <div className="flex items-center mt-2">
                        <Badge variant={analytics?.benchmarks.performanceRating === 'excellent' ? 'default' : 'secondary'}>
                          {analytics?.benchmarks.performanceRating}
                        </Badge>
                      </div>
                    </div>
                    <Target className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Avg Deal Value</p>
                      <p className="text-2xl font-bold">${analytics?.dealPerformance.averageDealValue.toLocaleString()}</p>
                      <div className="flex items-center mt-2">
                        <span className="text-sm text-gray-500">
                          Industry avg: ${analytics?.benchmarks.industryAverageDealValue.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <BarChart3 className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Avg Time to Close</p>
                      <p className="text-2xl font-bold">{analytics?.dealPerformance.averageTimeToClose} days</p>
                      <div className="flex items-center mt-2">
                        <span className="text-sm text-gray-500">
                          Catalog utilization: {analytics?.musicCatalog.utilizationRate.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <Calendar className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Project Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analytics?.revenue.byProjectType || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ type, percentage }) => `${type} ${percentage.toFixed(1)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="revenue"
                      >
                        {(analytics?.revenue.byProjectType || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Deal Conversion Funnel</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(analytics?.dealPerformance.conversionFunnel || []).map((stage, index) => (
                      <div key={stage.stage} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">{stage.stage}</span>
                          <span className="text-sm text-gray-600">{stage.count} deals ({stage.percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${stage.percentage}%` }}
                          />
                        </div>
                        {stage.dropOffRate > 0 && (
                          <p className="text-xs text-red-500">Drop-off: {stage.dropOffRate}%</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue by Genre */}
              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Genre</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analytics?.revenue.byGenre || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ genre, percentage }: any) => `${genre} ${percentage}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="revenue"
                      >
                        {(analytics?.revenue.byGenre || []).map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Revenue']} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Top Clients */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Clients by Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(analytics?.revenue.byClient || []).map((client: any, index: number) => (
                      <div key={client.client || index} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{client.client}</p>
                          <p className="text-sm text-gray-600">{client.deals} deals</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">${(client.revenue || 0).toLocaleString()}</p>
                          <Badge variant="outline">#{index + 1}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Performing Songs */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Songs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(analytics?.musicCatalog.topPerformingSongs || []).map((song: any, index: number) => (
                      <div key={song.title || index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{song.title}</p>
                            <p className="text-sm text-gray-600">{song.artist}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">${song.revenue.toLocaleString()}</p>
                          <p className="text-sm text-gray-600">{song.deals} deals</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Client Success Rates */}
              <Card>
                <CardHeader>
                  <CardTitle>Client Success Rates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(analytics?.dealPerformance.topPerformers.clients || []).map((client: any) => (
                      <div key={client.name} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">{client.name}</span>
                          <span className="text-sm text-gray-600">{(client.successRate * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${client.successRate * 100}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500">{client.deals} total deals</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="catalog" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Genre Popularity Trends */}
              <Card>
                <CardHeader>
                  <CardTitle>Genre Popularity Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(analytics?.musicCatalog.genrePerformance || []).map((genre: any) => (
                      <div key={genre.genre} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getTrendIcon(genre.marketTrend === 'hot' ? 'up' : genre.marketTrend === 'declining' ? 'down' : 'stable')}
                          <span className="font-medium">{genre.genre}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">{genre.songs} songs</span>
                          <Badge variant={genre.marketTrend === 'hot' ? 'default' : genre.marketTrend === 'declining' ? 'destructive' : 'secondary'}>
                            {genre.marketTrend}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Seasonal Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Seasonal Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={analytics?.forecast.seasonalTrends || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="historicalRevenue" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}