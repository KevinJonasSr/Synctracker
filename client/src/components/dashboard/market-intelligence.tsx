import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Globe, Target, Lightbulb, 
  BarChart3, Zap, AlertCircle, CheckCircle, ExternalLink
} from "lucide-react";
import type { MarketInsight, AdvancedMetrics } from "@shared/schema";

interface MarketIntelligenceProps {
  onInsightClick?: (insight: MarketInsight) => void;
}

export default function MarketIntelligence({ onInsightClick }: MarketIntelligenceProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [timeRange, setTimeRange] = useState('6m');

  const { data: insights = [], isLoading: insightsLoading } = useQuery<MarketInsight[]>({
    queryKey: ["/api/dashboard/market-insights", selectedCategory !== 'all' ? selectedCategory : undefined],
  });

  const { data: metrics } = useQuery<AdvancedMetrics>({
    queryKey: ["/api/dashboard/advanced-metrics", "30d"],
  });

  const { data: benchmarks } = useQuery({
    queryKey: ["/api/dashboard/performance-benchmarks"],
  });

  const getImpactColor = (impact: MarketInsight['impact']) => {
    switch (impact) {
      case 'high': return 'bg-red-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getCategoryIcon = (category: MarketInsight['category']) => {
    switch (category) {
      case 'trend': return TrendingUp;
      case 'opportunity': return Target;
      case 'threat': return AlertCircle;
      case 'competitor': return BarChart3;
      default: return Lightbulb;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Mock market data for visualization
  const industryTrends = [
    { month: 'Jan', syncLicensing: 120, streaming: 85, broadcast: 95 },
    { month: 'Feb', syncLicensing: 135, streaming: 88, broadcast: 92 },
    { month: 'Mar', syncLicensing: 148, streaming: 92, broadcast: 89 },
    { month: 'Apr', syncLicensing: 162, streaming: 95, broadcast: 87 },
    { month: 'May', syncLicensing: 175, streaming: 98, broadcast: 85 },
    { month: 'Jun', syncLicensing: 189, streaming: 102, broadcast: 83 },
  ];

  const competitivePosition = [
    { metric: 'Market Share', us: 85, competitor1: 70, competitor2: 60, industry: 65 },
    { metric: 'Deal Value', us: 90, competitor1: 75, competitor2: 80, industry: 70 },
    { metric: 'Client Retention', us: 94, competitor1: 85, competitor2: 88, industry: 82 },
    { metric: 'Time to Close', us: 80, competitor1: 70, competitor2: 65, industry: 75 },
    { metric: 'Portfolio Size', us: 75, competitor1: 90, competitor2: 85, industry: 80 },
  ];

  const territoryOpportunities = [
    { name: 'North America', current: 60, potential: 85, growth: 42 },
    { name: 'Europe', current: 25, potential: 65, growth: 160 },
    { name: 'Asia Pacific', current: 10, potential: 45, growth: 350 },
    { name: 'Latin America', current: 5, potential: 25, growth: 400 },
  ];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  if (insightsLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Globe className="text-blue-600" size={24} />
              <h3 className="text-xl font-semibold text-gray-900">Market Intelligence</h3>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                {['3m', '6m', '1y', '2y'].map((range) => (
                  <Button
                    key={range}
                    variant={timeRange === range ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTimeRange(range)}
                    data-testid={`timerange-${range}`}
                  >
                    {range}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all" data-testid="category-all">All Insights</TabsTrigger>
          <TabsTrigger value="trend" data-testid="category-trend">Trends</TabsTrigger>
          <TabsTrigger value="opportunity" data-testid="category-opportunity">Opportunities</TabsTrigger>
          <TabsTrigger value="threat" data-testid="category-threat">Threats</TabsTrigger>
          <TabsTrigger value="competitor" data-testid="category-competitor">Competition</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Market Insights */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <h4 className="font-semibold">Latest Insights</h4>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-80">
                  <div className="space-y-4">
                    {insights.map((insight) => {
                      const Icon = getCategoryIcon(insight.category);
                      return (
                        <Card 
                          key={insight.id}
                          className="cursor-pointer hover:shadow-md transition-all duration-200 border-l-4 border-l-blue-500"
                          onClick={() => onInsightClick?.(insight)}
                          data-testid={`insight-${insight.id}`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start space-x-3">
                              <div className="p-2 bg-blue-50 rounded-full">
                                <Icon className="text-blue-600" size={16} />
                              </div>
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center space-x-2">
                                  <h5 className="font-medium text-sm">{insight.title}</h5>
                                  <Badge className={getImpactColor(insight.impact)}>
                                    {insight.impact}
                                  </Badge>
                                </div>
                                <p className="text-xs text-gray-600">{insight.description}</p>
                                
                                {/* Data Points */}
                                {insight.dataPoints.length > 0 && (
                                  <div className="space-y-1">
                                    {insight.dataPoints.slice(0, 2).map((point, index) => (
                                      <div key={index} className="flex items-center justify-between text-xs">
                                        <span className="text-gray-500">{point.metric}:</span>
                                        <div className="flex items-center space-x-1">
                                          <span className="font-medium">{point.value}</span>
                                          <span className={point.change >= 0 ? 'text-green-500' : 'text-red-500'}>
                                            {point.change >= 0 ? '+' : ''}{point.change}%
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {/* Confidence Score */}
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-gray-500">Confidence:</span>
                                  <span className={`text-xs font-medium ${getConfidenceColor(insight.confidence)}`}>
                                    {(insight.confidence * 100).toFixed(0)}%
                                  </span>
                                </div>

                                {/* Action Button */}
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="w-full text-xs"
                                  data-testid={`view-insight-${insight.id}`}
                                >
                                  View Details
                                  <ExternalLink size={12} className="ml-1" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Market Trends Visualization */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <h4 className="font-semibold">Industry Trends Analysis</h4>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={industryTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="syncLicensing" 
                      stroke="#3B82F6" 
                      strokeWidth={3}
                      name="Sync Licensing"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="streaming" 
                      stroke="#10B981" 
                      strokeWidth={2}
                      name="Streaming"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="broadcast" 
                      stroke="#F59E0B" 
                      strokeWidth={2}
                      name="Broadcast"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Competitive Analysis & Territory Opportunities */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Competitive Position Radar */}
            <Card>
              <CardHeader>
                <h4 className="font-semibold">Competitive Position Analysis</h4>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={competitivePosition}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" />
                    <PolarRadiusAxis domain={[0, 100]} />
                    <Radar 
                      name="Our Performance" 
                      dataKey="us" 
                      stroke="#3B82F6" 
                      fill="#3B82F6" 
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                    <Radar 
                      name="Industry Average" 
                      dataKey="industry" 
                      stroke="#10B981" 
                      strokeDasharray="5 5"
                      strokeWidth={2}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
                
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <h5 className="font-medium text-green-700">Strengths</h5>
                    <ul className="text-green-600 space-y-1">
                      <li>• High client retention rate</li>
                      <li>• Premium deal values</li>
                      <li>• Strong market presence</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h5 className="font-medium text-orange-700">Improvement Areas</h5>
                    <ul className="text-orange-600 space-y-1">
                      <li>• Expand portfolio size</li>
                      <li>• Optimize closing speed</li>
                      <li>• International presence</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Territory Expansion Opportunities */}
            <Card>
              <CardHeader>
                <h4 className="font-semibold">Territory Expansion Opportunities</h4>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={territoryOpportunities}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="current" fill="#3B82F6" name="Current Market Share %" />
                    <Bar dataKey="potential" fill="#10B981" name="Market Potential %" />
                  </BarChart>
                </ResponsiveContainer>
                
                <div className="mt-4 space-y-3">
                  {territoryOpportunities.map((territory, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{territory.name}</p>
                        <p className="text-xs text-gray-500">
                          Current: {territory.current}% | Potential: {territory.potential}%
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">+{territory.growth}%</p>
                        <p className="text-xs text-gray-500">Growth potential</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Key Recommendations */}
          <Card className="mt-6">
            <CardHeader>
              <h4 className="font-semibold">Strategic Recommendations</h4>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Target className="text-blue-600" size={20} />
                    <h5 className="font-medium text-blue-800">Market Expansion</h5>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Focus on European market entry</li>
                    <li>• Establish Asia-Pacific partnerships</li>
                    <li>• Develop territory-specific catalogs</li>
                  </ul>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="text-green-600" size={20} />
                    <h5 className="font-medium text-green-800">Portfolio Optimization</h5>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Increase electronic music catalog</li>
                    <li>• Target commercial advertising</li>
                    <li>• Develop seasonal collections</li>
                  </ul>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Zap className="text-purple-600" size={20} />
                    <h5 className="font-medium text-purple-800">Technology Integration</h5>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Implement AI-powered matching</li>
                    <li>• Automate contract generation</li>
                    <li>• Enhance client portal features</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}