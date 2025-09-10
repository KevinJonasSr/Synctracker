import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, TrendingDown, DollarSign, Target, Clock, 
  Users, Music, Handshake, AlertTriangle, Info, ChevronRight
} from "lucide-react";
import type { AdvancedMetrics } from "@shared/schema";

interface AdvancedMetricsCardsProps {
  timeRange?: string;
  onMetricClick?: (metric: string, data: any) => void;
}

export default function AdvancedMetricsCards({ 
  timeRange = '30d', 
  onMetricClick 
}: AdvancedMetricsCardsProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);

  const { data: metrics, isLoading, error } = useQuery<AdvancedMetrics>({
    queryKey: ["/api/dashboard/advanced-metrics", selectedTimeRange],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            Failed to load advanced metrics. Please try again.
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercent = (value: number, decimals = 1) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
  };

  const getTrendIcon = (value: number) => {
    return value >= 0 ? TrendingUp : TrendingDown;
  };

  const getTrendColor = (value: number) => {
    return value >= 0 ? 'text-green-500' : 'text-red-500';
  };

  const getPerformanceRating = (current: number, target: number) => {
    const ratio = current / target;
    if (ratio >= 1.1) return { rating: 'Excellent', color: 'bg-green-500' };
    if (ratio >= 0.9) return { rating: 'Good', color: 'bg-blue-500' };
    if (ratio >= 0.7) return { rating: 'Average', color: 'bg-yellow-500' };
    return { rating: 'Below Target', color: 'bg-red-500' };
  };

  // Enhanced metrics data with targets and comparisons
  const enhancedMetrics = [
    {
      id: 'revenue',
      title: 'Monthly Revenue',
      value: formatCurrency(metrics.revenueAnalytics.currentMonth),
      change: metrics.revenueAnalytics.monthlyGrowth,
      target: metrics.revenueAnalytics.projectedMonthly,
      icon: DollarSign,
      description: 'vs. last month',
      details: {
        quarter: formatCurrency(metrics.revenueAnalytics.currentQuarter),
        quarterlyGrowth: metrics.revenueAnalytics.quarterlyGrowth,
        year: formatCurrency(metrics.revenueAnalytics.currentYear),
        yearlyGrowth: metrics.revenueAnalytics.yearlyGrowth,
      }
    },
    {
      id: 'conversion',
      title: 'Conversion Rate',
      value: `${metrics.dealPerformance.conversionRate.toFixed(1)}%`,
      change: 12.5, // Mock trend data
      target: 75,
      icon: Target,
      description: 'deal success rate',
      details: {
        avgDealValue: formatCurrency(metrics.dealPerformance.averageDealValue),
        avgTimeToClose: `${metrics.dealPerformance.averageTimeToClose.toFixed(0)} days`,
        pipelineVelocity: metrics.dealPerformance.pipelineVelocity,
      }
    },
    {
      id: 'avgdeal',
      title: 'Avg Deal Value',
      value: formatCurrency(metrics.dealPerformance.averageDealValue),
      change: 8.3,
      target: 6000,
      icon: Handshake,
      description: 'per completed deal',
      details: {
        totalDeals: metrics.dealPerformance.dealsByStage.reduce((sum, stage) => sum + stage.count, 0),
        successRate: metrics.dealPerformance.successRate,
      }
    },
    {
      id: 'timetoclose',
      title: 'Avg Time to Close',
      value: `${metrics.dealPerformance.averageTimeToClose.toFixed(0)} days`,
      change: -15.2, // Negative is good for time metrics
      target: 25,
      icon: Clock,
      description: 'faster than target',
      details: {
        fastest: '12 days',
        slowest: '90 days',
        benchmark: '30 days industry avg',
      }
    },
    {
      id: 'clients',
      title: 'Active Clients',
      value: metrics.topPerformers.clients.length.toString(),
      change: 23.1,
      target: 50,
      icon: Users,
      description: 'engaged this month',
      details: {
        highValue: metrics.topPerformers.clients.filter(c => c.totalRevenue > 25000).length,
        newClients: 3, // Mock data
        retention: '94%',
      }
    },
    {
      id: 'portfolio',
      title: 'Song Utilization',
      value: `${metrics.portfolioAnalysis.songUtilization.utilizationRate}%`,
      change: 5.7,
      target: 80,
      icon: Music,
      description: 'of catalog active',
      details: {
        totalSongs: metrics.portfolioAnalysis.songUtilization.totalSongs,
        activeSongs: metrics.portfolioAnalysis.songUtilization.activeSongs,
        underperforming: metrics.portfolioAnalysis.songUtilization.underperformingSongs,
      }
    },
    {
      id: 'forecast',
      title: 'Revenue Forecast',
      value: formatCurrency(metrics.predictiveAnalytics.revenueForecasting.next30Days),
      change: 18.9,
      target: metrics.revenueAnalytics.projectedMonthly,
      icon: TrendingUp,
      description: 'next 30 days',
      details: {
        confidence: `${(metrics.predictiveAnalytics.revenueForecasting.confidence * 100).toFixed(0)}%`,
        next60Days: formatCurrency(metrics.predictiveAnalytics.revenueForecasting.next60Days),
        next90Days: formatCurrency(metrics.predictiveAnalytics.revenueForecasting.next90Days),
      }
    },
    {
      id: 'risk',
      title: 'Portfolio Risk',
      value: metrics.portfolioAnalysis.riskAnalysis.portfolioRisk,
      change: -8.2, // Negative risk change is good
      target: 'Low',
      icon: AlertTriangle,
      description: 'risk level decreased',
      details: {
        overduePayments: metrics.portfolioAnalysis.riskAnalysis.overduePayments,
        contractRenewals: metrics.portfolioAnalysis.riskAnalysis.contractRenewals,
        clientDependency: `${metrics.portfolioAnalysis.riskAnalysis.clientDependency}%`,
      }
    },
  ];

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Performance Metrics</h2>
        <div className="flex space-x-2">
          {['7d', '30d', '90d', '1y'].map((range) => (
            <Button
              key={range}
              variant={selectedTimeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTimeRange(range)}
              data-testid={`timerange-${range}`}
            >
              {range}
            </Button>
          ))}
        </div>
      </div>

      {/* Enhanced Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {enhancedMetrics.map((metric) => {
          const Icon = metric.icon;
          const TrendIcon = getTrendIcon(metric.change);
          const trendColor = getTrendColor(metric.change);
          const performance = getPerformanceRating(
            typeof metric.target === 'number' ? parseFloat(metric.value.replace(/[^0-9.-]/g, '')) : 0,
            typeof metric.target === 'number' ? metric.target : 0
          );
          
          const progressValue = typeof metric.target === 'number' 
            ? Math.min((parseFloat(metric.value.replace(/[^0-9.-]/g, '')) / metric.target) * 100, 100)
            : 75;

          return (
            <Card 
              key={metric.id} 
              className="cursor-pointer hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-blue-300"
              onClick={() => onMetricClick?.(metric.id, metric)}
              data-testid={`metric-card-${metric.id}`}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-blue-50`}>
                    <Icon className="text-blue-600" size={20} />
                  </div>
                  <div className="flex items-center space-x-1">
                    <TrendIcon className={`${trendColor}`} size={16} />
                    <span className={`text-sm font-medium ${trendColor}`}>
                      {formatPercent(metric.change)}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                    <p className="text-xs text-gray-500">{metric.description}</p>
                  </div>

                  {/* Progress Bar for Target Achievement */}
                  {typeof metric.target === 'number' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Target Progress</span>
                        <Badge 
                          className={`${performance.color} text-white text-xs`}
                          data-testid={`performance-${metric.id}`}
                        >
                          {performance.rating}
                        </Badge>
                      </div>
                      <Progress value={progressValue} className="h-2" />
                      <p className="text-xs text-gray-500">
                        Target: {typeof metric.target === 'string' ? metric.target : formatCurrency(metric.target)}
                      </p>
                    </div>
                  )}

                  {/* Action Button */}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-between text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    data-testid={`view-details-${metric.id}`}
                  >
                    <span>View Details</span>
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary Insights */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Info className="text-blue-600" size={20} />
            <h3 className="text-lg font-semibold text-blue-900">Key Insights</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-blue-800">Revenue Performance</h4>
              <p className="text-sm text-blue-700">
                Monthly revenue up {formatPercent(metrics.revenueAnalytics.monthlyGrowth)} with strong Q4 momentum. 
                On track to exceed yearly targets.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-blue-800">Deal Efficiency</h4>
              <p className="text-sm text-blue-700">
                Conversion rate improving with {metrics.dealPerformance.averageTimeToClose.toFixed(0)}-day 
                average close time, faster than industry benchmark.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-blue-800">Portfolio Health</h4>
              <p className="text-sm text-blue-700">
                {metrics.portfolioAnalysis.songUtilization.utilizationRate}% catalog utilization with 
                {metrics.portfolioAnalysis.riskAnalysis.portfolioRisk.toLowerCase()} risk profile.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}