import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, TrendingUp, TrendingDown, Target, Lightbulb, AlertCircle, Star, DollarSign, Calendar, BarChart3 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

interface AIInsight {
  type: 'revenue_prediction' | 'success_probability' | 'market_trend' | 'recommendation';
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  priority: number;
  actionable: boolean;
  data?: any;
}

interface RevenuePrediction {
  month: string;
  predicted: number;
  confidence: number;
  factors: string[];
}

interface SuccessProbability {
  dealId: number;
  projectName: string;
  probability: number;
  factors: {
    positive: string[];
    negative: string[];
  };
  recommendations: string[];
}

interface MarketTrend {
  category: string;
  trend: 'up' | 'down' | 'stable';
  growth: number;
  insights: string[];
  opportunities: string[];
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff00ff'];

export default function AIAnalyticsInsights() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("6months");
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);

  const { data: deals = [] } = useQuery({
    queryKey: ['/api/deals'],
  });

  const { data: songs = [] } = useQuery({
    queryKey: ['/api/songs'],
  });

  // Mock AI insights data - in a real app, this would come from AI analysis
  const mockRevenuePredictions: RevenuePrediction[] = [
    {
      month: "Jan 2025",
      predicted: 4200,
      confidence: 85,
      factors: ["Seasonal holiday content", "Historical Q1 performance"]
    },
    {
      month: "Feb 2025", 
      predicted: 3800,
      confidence: 78,
      factors: ["Valentine's Day projects", "Lower commercial activity"]
    },
    {
      month: "Mar 2025",
      predicted: 5100,
      confidence: 82,
      factors: ["Spring campaign season", "New client onboarding"]
    },
    {
      month: "Apr 2025",
      predicted: 4600,
      confidence: 75,
      factors: ["Easter content", "Film festival season"]
    },
    {
      month: "May 2025",
      predicted: 5800,
      confidence: 88,
      factors: ["Summer campaign prep", "High-budget projects"]
    },
    {
      month: "Jun 2025",
      predicted: 6200,
      confidence: 90,
      factors: ["Peak summer content", "Festival season"]
    }
  ];

  const mockSuccessProbabilities: SuccessProbability[] = [
    {
      dealId: 1,
      projectName: "Summer Blockbuster Film",
      probability: 85,
      factors: {
        positive: ["High budget", "Established client", "Popular genre"],
        negative: ["Competitive market", "Short timeline"]
      },
      recommendations: ["Emphasize exclusive content", "Offer package deals"]
    },
    {
      dealId: 2,
      projectName: "Holiday Commercial Campaign",
      probability: 72,
      factors: {
        positive: ["Seasonal relevance", "Previous success with client"],
        negative: ["Budget constraints", "Limited exclusivity"]
      },
      recommendations: ["Propose tiered pricing", "Include social media rights"]
    }
  ];

  const mockMarketTrends: MarketTrend[] = [
    {
      category: "Electronic Music",
      trend: 'up',
      growth: 25,
      insights: ["Growing demand in tech commercials", "Popular in streaming content"],
      opportunities: ["Focus on minimal/ambient electronic", "Target fintech clients"]
    },
    {
      category: "Cinematic Orchestral",
      trend: 'up',
      growth: 18,
      insights: ["High demand for trailer music", "Streaming platform growth"],
      opportunities: ["Develop epic trailer packages", "Partner with film studios"]
    },
    {
      category: "Traditional Rock",
      trend: 'down',
      growth: -12,
      insights: ["Declining use in commercials", "Shift to modern alternatives"],
      opportunities: ["Modernize arrangements", "Target nostalgia campaigns"]
    }
  ];

  const mockAIInsights: AIInsight[] = [
    {
      type: 'revenue_prediction',
      title: 'Q2 Revenue Surge Expected',
      description: 'AI predicts 35% revenue increase in Q2 based on seasonal trends and client behavior patterns.',
      confidence: 88,
      impact: 'high',
      priority: 1,
      actionable: true,
      data: { predicted: 18500, current: 13700 }
    },
    {
      type: 'market_trend',
      title: 'Electronic Music Demand Rising',
      description: '25% increase in electronic music sync requests detected. Consider expanding electronic catalog.',
      confidence: 82,
      impact: 'medium',
      priority: 2,
      actionable: true
    },
    {
      type: 'success_probability',
      title: 'High-Value Deal Alert',
      description: 'Deal #24 shows 85% success probability. Consider prioritizing this negotiation.',
      confidence: 85,
      impact: 'high',
      priority: 1,
      actionable: true
    },
    {
      type: 'recommendation',
      title: 'Optimize Pricing Strategy',
      description: 'AI suggests adjusting rates for commercial projects by 15% based on market analysis.',
      confidence: 76,
      impact: 'medium',
      priority: 3,
      actionable: true
    }
  ];

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'revenue_prediction': return <DollarSign className="h-4 w-4 text-green-600" />;
      case 'success_probability': return <Target className="h-4 w-4 text-blue-600" />;
      case 'market_trend': return <TrendingUp className="h-4 w-4 text-purple-600" />;
      case 'recommendation': return <Lightbulb className="h-4 w-4 text-orange-600" />;
      default: return <Brain className="h-4 w-4 text-gray-600" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <BarChart3 className="h-4 w-4 text-gray-600" />;
    }
  };

  const generateInsights = async () => {
    setIsGeneratingInsights(true);
    
    // Simulate AI processing
    setTimeout(() => {
      setInsights(mockAIInsights);
      setIsGeneratingInsights(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6" />
            AI Analytics Insights
          </h2>
          <p className="text-gray-600">Advanced AI-powered business intelligence and predictions</p>
        </div>
        <div className="flex gap-3">
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-40" data-testid="select-timeframe">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="12months">Last 12 Months</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={generateInsights} disabled={isGeneratingInsights} data-testid="button-generate-insights">
            {isGeneratingInsights ? "Generating..." : "Generate AI Insights"}
            <Brain className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="insights" className="w-full">
        <TabsList>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="predictions">Revenue Predictions</TabsTrigger>
          <TabsTrigger value="success">Success Probabilities</TabsTrigger>
          <TabsTrigger value="trends">Market Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          {insights.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Brain className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Generate AI Insights</h3>
                <p className="text-gray-600 mb-4">
                  Click "Generate AI Insights" to analyze your data and get actionable recommendations.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {insights
                .sort((a, b) => a.priority - b.priority)
                .map((insight, index) => (
                  <Card key={index} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getInsightIcon(insight.type)}
                          <h4 className="font-semibold">{insight.title}</h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getImpactColor(insight.impact)}>
                            {insight.impact} impact
                          </Badge>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Star className="h-3 w-3" />
                            {insight.confidence}% confidence
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 mb-3">{insight.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <Progress value={insight.confidence} className="w-24" />
                        {insight.actionable && (
                          <Button variant="outline" size="sm" data-testid={`button-action-${index}`}>
                            Take Action
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Predictions</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mockRevenuePredictions}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [`$${value}`, name === 'predicted' ? 'Predicted Revenue' : name]}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="predicted" 
                    stroke="#8884d8" 
                    strokeWidth={3}
                    dot={{ fill: '#8884d8', strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockRevenuePredictions.map((prediction, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{prediction.month}</h4>
                    <Badge variant="outline">{prediction.confidence}% confidence</Badge>
                  </div>
                  <p className="text-2xl font-bold text-green-600 mb-2">
                    ${prediction.predicted.toLocaleString()}
                  </p>
                  <div className="space-y-1">
                    {prediction.factors.map((factor, idx) => (
                      <p key={idx} className="text-xs text-gray-600">• {factor}</p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="success" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {mockSuccessProbabilities.map((deal, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold">{deal.projectName}</h4>
                    <div className="flex items-center gap-2">
                      <div className={`text-lg font-bold ${deal.probability >= 80 ? 'text-green-600' : deal.probability >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {deal.probability}%
                      </div>
                      <Badge variant="outline">Success Probability</Badge>
                    </div>
                  </div>
                  
                  <Progress value={deal.probability} className="mb-4" />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium text-green-700 mb-2">Positive Factors</h5>
                      <ul className="space-y-1">
                        {deal.factors.positive.map((factor, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex items-center gap-1">
                            <div className="w-1 h-1 bg-green-500 rounded-full" />
                            {factor}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium text-red-700 mb-2">Risk Factors</h5>
                      <ul className="space-y-1">
                        {deal.factors.negative.map((factor, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex items-center gap-1">
                            <div className="w-1 h-1 bg-red-500 rounded-full" />
                            {factor}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <Separator className="my-3" />
                  
                  <div>
                    <h5 className="font-medium mb-2">AI Recommendations</h5>
                    <ul className="space-y-1">
                      {deal.recommendations.map((rec, idx) => (
                        <li key={idx} className="text-sm text-blue-600 flex items-center gap-1">
                          <Lightbulb className="h-3 w-3" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockMarketTrends.map((trend, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">{trend.category}</h4>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(trend.trend)}
                      <span className={`text-sm font-medium ${trend.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {trend.growth >= 0 ? '+' : ''}{trend.growth}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <h5 className="text-sm font-medium mb-1">Market Insights</h5>
                      <ul className="space-y-1">
                        {trend.insights.map((insight, idx) => (
                          <li key={idx} className="text-xs text-gray-600">• {insight}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="text-sm font-medium mb-1">Opportunities</h5>
                      <ul className="space-y-1">
                        {trend.opportunities.map((opportunity, idx) => (
                          <li key={idx} className="text-xs text-blue-600">• {opportunity}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}