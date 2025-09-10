import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, Music, Users, Target, Calendar, BarChart3 } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

interface AnalyticsData {
  revenue: {
    total: number;
    monthly: Array<{ month: string; amount: number; deals: number }>;
    byGenre: Array<{ genre: string; amount: number; percentage: number }>;
    byClient: Array<{ client: string; amount: number; deals: number }>;
  };
  performance: {
    pitchSuccess: number;
    averageDealValue: number;
    averageTimeToClose: number;
    topPerformingSongs: Array<{ song: string; artist: string; deals: number; revenue: number }>;
    clientSuccess: Array<{ client: string; successRate: number; totalPitches: number }>;
  };
  trends: {
    genrePopularity: Array<{ genre: string; count: number; trend: 'up' | 'down' | 'stable' }>;
    seasonalTrends: Array<{ month: string; activity: number }>;
    dealStages: Array<{ stage: string; count: number; averageDays: number }>;
  };
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff00ff'];

export default function Analytics() {
  const [timeRange, setTimeRange] = useState("12months");
  
  // Mock data - in real app, this would come from API
  const mockAnalytics: AnalyticsData = {
    revenue: {
      total: 45750,
      monthly: [
        { month: "Jan", amount: 3200, deals: 4 },
        { month: "Feb", amount: 2800, deals: 3 },
        { month: "Mar", amount: 4100, deals: 5 },
        { month: "Apr", amount: 3800, deals: 4 },
        { month: "May", amount: 5200, deals: 6 },
        { month: "Jun", amount: 4600, deals: 5 },
        { month: "Jul", amount: 3900, deals: 4 },
        { month: "Aug", amount: 4800, deals: 6 },
        { month: "Sep", amount: 5100, deals: 5 },
        { month: "Oct", amount: 4200, deals: 4 },
        { month: "Nov", amount: 4800, deals: 5 },
        { month: "Dec", amount: 5150, deals: 6 },
      ],
      byGenre: [
        { genre: "Electronic", amount: 15200, percentage: 33.2 },
        { genre: "Pop", amount: 12300, percentage: 26.9 },
        { genre: "Cinematic", amount: 8900, percentage: 19.5 },
        { genre: "Rock", amount: 6100, percentage: 13.3 },
        { genre: "Hip Hop", amount: 3250, percentage: 7.1 },
      ],
      byClient: [
        { client: "Netflix Studios", amount: 12500, deals: 8 },
        { client: "Sony Pictures", amount: 9800, deals: 6 },
        { client: "Universal Music", amount: 7200, deals: 5 },
        { client: "Warner Bros", amount: 6100, deals: 4 },
        { client: "Apple Music", amount: 4850, deals: 3 },
      ],
    },
    performance: {
      pitchSuccess: 18.5,
      averageDealValue: 1850,
      averageTimeToClose: 45,
      topPerformingSongs: [
        { song: "Urban Sunrise", artist: "Maya Chen", deals: 3, revenue: 8400 },
        { song: "Midnight Drive", artist: "The Neon Collective", deals: 2, revenue: 6200 },
        { song: "Digital Dreams", artist: "Alex Rivera", deals: 2, revenue: 4800 },
        { song: "City Lights", artist: "Luna Park", deals: 1, revenue: 3200 },
        { song: "Electric Soul", artist: "Maya Chen", deals: 1, revenue: 2800 },
      ],
      clientSuccess: [
        { client: "Netflix Studios", successRate: 25.0, totalPitches: 32 },
        { client: "Sony Pictures", successRate: 22.2, totalPitches: 27 },
        { client: "Universal Music", successRate: 19.2, totalPitches: 26 },
        { client: "Warner Bros", successRate: 16.7, totalPitches: 24 },
        { client: "Apple Music", successRate: 15.0, totalPitches: 20 },
      ],
    },
    trends: {
      genrePopularity: [
        { genre: "Electronic", count: 45, trend: 'up' },
        { genre: "Pop", count: 38, trend: 'up' },
        { genre: "Cinematic", count: 32, trend: 'stable' },
        { genre: "Rock", count: 28, trend: 'down' },
        { genre: "Hip Hop", count: 22, trend: 'up' },
      ],
      seasonalTrends: [
        { month: "Jan", activity: 15 },
        { month: "Feb", activity: 12 },
        { month: "Mar", activity: 18 },
        { month: "Apr", activity: 22 },
        { month: "May", activity: 28 },
        { month: "Jun", activity: 25 },
        { month: "Jul", activity: 20 },
        { month: "Aug", activity: 24 },
        { month: "Sep", activity: 30 },
        { month: "Oct", activity: 26 },
        { month: "Nov", activity: 22 },
        { month: "Dec", activity: 19 },
      ],
      dealStages: [
        { stage: "Initial Contact", count: 45, averageDays: 7 },
        { stage: "Pitch Sent", count: 38, averageDays: 14 },
        { stage: "Under Review", count: 22, averageDays: 21 },
        { stage: "Negotiating", count: 15, averageDays: 12 },
        { stage: "Contract Sent", count: 8, averageDays: 8 },
        { stage: "Closed Won", count: 5, averageDays: 3 },
      ],
    },
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <BarChart3 className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div>
      <Header
        title="Analytics & Reports"
        description="Comprehensive insights into your sync licensing performance"
      />

      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3months">Last 3 Months</SelectItem>
                <SelectItem value="6months">Last 6 Months</SelectItem>
                <SelectItem value="12months">Last 12 Months</SelectItem>
                <SelectItem value="24months">Last 24 Months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Revenue</p>
                      <p className="text-2xl font-bold">${mockAnalytics.revenue.total.toLocaleString()}</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Success Rate</p>
                      <p className="text-2xl font-bold">{mockAnalytics.performance.pitchSuccess}%</p>
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
                      <p className="text-2xl font-bold">${mockAnalytics.performance.averageDealValue}</p>
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
                      <p className="text-2xl font-bold">{mockAnalytics.performance.averageTimeToClose} days</p>
                    </div>
                    <Calendar className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockAnalytics.revenue.monthly}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                    <Line type="monotone" dataKey="amount" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
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
                        data={mockAnalytics.revenue.byGenre}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ genre, percentage }) => `${genre} ${percentage}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="amount"
                      >
                        {mockAnalytics.revenue.byGenre.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
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
                    {mockAnalytics.revenue.byClient.map((client, index) => (
                      <div key={client.client} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{client.client}</p>
                          <p className="text-sm text-gray-600">{client.deals} deals</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">${client.amount.toLocaleString()}</p>
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
                    {mockAnalytics.performance.topPerformingSongs.map((song, index) => (
                      <div key={song.song} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{song.song}</p>
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
                    {mockAnalytics.performance.clientSuccess.map((client) => (
                      <div key={client.client} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">{client.client}</span>
                          <span className="text-sm text-gray-600">{client.successRate}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${client.successRate}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500">{client.totalPitches} total pitches</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Genre Popularity Trends */}
              <Card>
                <CardHeader>
                  <CardTitle>Genre Popularity Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockAnalytics.trends.genrePopularity.map((genre) => (
                      <div key={genre.genre} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getTrendIcon(genre.trend)}
                          <span className="font-medium">{genre.genre}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">{genre.count} songs</span>
                          <Badge variant={genre.trend === 'up' ? 'default' : genre.trend === 'down' ? 'destructive' : 'secondary'}>
                            {genre.trend}
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
                    <BarChart data={mockAnalytics.trends.seasonalTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="activity" fill="#8884d8" />
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