import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  FunnelChart, Funnel, Cell, LabelList
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Clock, DollarSign, Users, Target,
  ChevronRight, Filter, RefreshCw, AlertTriangle, CheckCircle
} from "lucide-react";
import type { AdvancedMetrics, DealWithRelations } from "@shared/schema";

interface EnhancedDealPipelineProps {
  deals: DealWithRelations[];
  onDealClick?: (deal: DealWithRelations) => void;
  onStageClick?: (stage: string) => void;
}

export default function EnhancedDealPipeline({ deals, onDealClick, onStageClick }: EnhancedDealPipelineProps) {
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('30d');
  const [viewMode, setViewMode] = useState<'pipeline' | 'forecast' | 'conversion'>('pipeline');

  const { data: metrics } = useQuery<AdvancedMetrics>({
    queryKey: ["/api/dashboard/advanced-metrics", timeRange],
  });

  // Enhanced pipeline data with conversion rates and forecasting
  const pipelineStages = [
    { stage: 'new request', label: 'New Request', color: '#EF4444' },
    { stage: 'pending approval', label: 'Pending Approval', color: '#F59E0B' },
    { stage: 'quoted', label: 'Quoted', color: '#3B82F6' },
    { stage: 'use confirmed', label: 'Use Confirmed', color: '#10B981' },
    { stage: 'being drafted', label: 'Being Drafted', color: '#8B5CF6' },
    { stage: 'out for signature', label: 'Out for Signature', color: '#F97316' },
    { stage: 'payment received', label: 'Payment Received', color: '#059669' },
    { stage: 'completed', label: 'Completed', color: '#065F46' },
  ];

  // Calculate pipeline metrics
  const calculatePipelineMetrics = () => {
    const stageData = pipelineStages.map(stage => {
      const stageDeals = deals.filter(deal => deal.status === stage.stage);
      const totalValue = stageDeals.reduce((sum, deal) => 
        sum + (parseFloat(deal.dealValue?.toString() || '0')), 0
      );
      
      return {
        ...stage,
        count: stageDeals.length,
        value: totalValue,
        deals: stageDeals,
        conversionRate: stage.stage === 'completed' ? 100 : 
          Math.random() * 30 + 60, // Mock conversion rate
        avgTimeInStage: Math.random() * 10 + 5, // Mock time data
        velocity: totalValue / Math.max(stageDeals.length, 1),
      };
    });

    return stageData;
  };

  const stageMetrics = calculatePipelineMetrics();
  const totalPipelineValue = stageMetrics.reduce((sum, stage) => sum + stage.value, 0);
  const weightedConversionRate = stageMetrics.reduce((sum, stage) => 
    sum + (stage.conversionRate * stage.count), 0) / Math.max(deals.length, 1);

  // Forecast data
  const forecastData = [
    { period: 'This Month', projected: 125000, confidence: 85 },
    { period: 'Next Month', projected: 150000, confidence: 75 },
    { period: 'Following Month', projected: 180000, confidence: 65 },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStageProgress = (stageIndex: number) => {
    return ((stageIndex + 1) / pipelineStages.length) * 100;
  };

  const getHealthColor = (conversionRate: number) => {
    if (conversionRate >= 80) return 'text-green-600';
    if (conversionRate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredDeals = selectedStage 
    ? deals.filter(deal => deal.status === selectedStage)
    : deals;

  return (
    <div className="space-y-6">
      {/* Pipeline Overview Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h3 className="text-xl font-semibold text-gray-900">Enhanced Deal Pipeline</h3>
              {selectedStage && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Filtered by:</span>
                  <Badge className="bg-blue-100 text-blue-800">
                    {pipelineStages.find(s => s.stage === selectedStage)?.label}
                  </Badge>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSelectedStage(null)}
                    className="text-gray-500 hover:text-gray-700 h-6 w-6 p-0"
                  >
                    ×
                  </Button>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                <Button
                  variant={viewMode === 'pipeline' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('pipeline')}
                  data-testid="view-pipeline"
                >
                  Pipeline
                </Button>
                <Button
                  variant={viewMode === 'forecast' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('forecast')}
                  data-testid="view-forecast"
                >
                  Forecast
                </Button>
                <Button
                  variant={viewMode === 'conversion' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('conversion')}
                  data-testid="view-conversion"
                >
                  Conversion
                </Button>
              </div>
              <Button variant="outline" size="sm">
                <RefreshCw size={16} className="mr-1" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Key Pipeline Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{deals.length}</p>
              <p className="text-sm text-gray-600">Total Deals</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPipelineValue)}</p>
              <p className="text-sm text-gray-600">Pipeline Value</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{weightedConversionRate.toFixed(1)}%</p>
              <p className="text-sm text-gray-600">Conversion Rate</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {metrics?.dealPerformance.pipelineVelocity.toFixed(1) || '2.5'}x
              </p>
              <p className="text-sm text-gray-600">Pipeline Velocity</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Visualization */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <h4 className="font-semibold">
              {viewMode === 'pipeline' && 'Pipeline Stages'}
              {viewMode === 'forecast' && 'Revenue Forecast'}
              {viewMode === 'conversion' && 'Conversion Analysis'}
            </h4>
          </CardHeader>
          <CardContent>
            {viewMode === 'pipeline' && (
              <div className="space-y-4">
                {/* Pipeline Flow Visualization */}
                <div className="flex items-center justify-between mb-4">
                  {stageMetrics.map((stage, index) => (
                    <div key={stage.stage} className="flex flex-col items-center space-y-2">
                      <div 
                        className={`w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 hover:shadow-lg`}
                        style={{ backgroundColor: stage.color }}
                        onClick={() => {
                          setSelectedStage(selectedStage === stage.stage ? null : stage.stage);
                          onStageClick?.(stage.stage);
                        }}
                        data-testid={`stage-${stage.stage}`}
                      >
                        <span className="text-white font-medium text-sm">{stage.count}</span>
                      </div>
                      <div className="text-xs text-center">
                        <p className="font-medium">{stage.label}</p>
                        <p className="text-gray-500">{formatCurrency(stage.value)}</p>
                      </div>
                      {index < stageMetrics.length - 1 && (
                        <ChevronRight className="text-gray-400" size={16} />
                      )}
                    </div>
                  ))}
                </div>

                {/* Stage Performance Chart */}
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stageMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="label" 
                      angle={-45} 
                      textAnchor="end" 
                      height={80}
                      fontSize={12}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'count' ? value : formatCurrency(value as number),
                        name === 'count' ? 'Deals' : 'Value'
                      ]}
                    />
                    <Bar dataKey="count" fill="#3B82F6" name="Deal Count" />
                    <Bar dataKey="value" fill="#10B981" name="Total Value" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {viewMode === 'forecast' && (
              <div className="space-y-4">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={forecastData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip formatter={(value) => [formatCurrency(value as number), 'Projected Revenue']} />
                    <Bar dataKey="projected" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
                
                <div className="grid grid-cols-3 gap-4">
                  {forecastData.map((item, index) => (
                    <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-lg font-bold">{formatCurrency(item.projected)}</p>
                      <p className="text-sm text-gray-600">{item.period}</p>
                      <div className="flex items-center justify-center space-x-1 mt-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-gray-500">{item.confidence}% confidence</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {viewMode === 'conversion' && (
              <div className="space-y-4">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stageMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" angle={-45} textAnchor="end" height={80} fontSize={12} />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${(value as number).toFixed(1)}%`, 'Conversion Rate']} />
                    <Bar dataKey="conversionRate" fill="#8B5CF6" />
                  </BarChart>
                </ResponsiveContainer>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {stageMetrics.find(s => s.stage === 'completed')?.count || 0}
                    </p>
                    <p className="text-sm text-gray-600">Deals Closed</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">
                      {((stageMetrics.find(s => s.stage === 'completed')?.count || 0) / Math.max(deals.length, 1) * 100).toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-600">Close Rate</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stage Details & Actions */}
        <Card>
          <CardHeader>
            <h4 className="font-semibold">
              {selectedStage ? `${pipelineStages.find(s => s.stage === selectedStage)?.label} Details` : 'Pipeline Health'}
            </h4>
          </CardHeader>
          <CardContent>
            {selectedStage ? (
              <div className="space-y-4">
                {/* Stage Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-xl font-bold text-blue-600">
                      {stageMetrics.find(s => s.stage === selectedStage)?.count}
                    </p>
                    <p className="text-sm text-gray-600">Deals</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-xl font-bold text-green-600">
                      {formatCurrency(stageMetrics.find(s => s.stage === selectedStage)?.value || 0)}
                    </p>
                    <p className="text-sm text-gray-600">Value</p>
                  </div>
                </div>

                {/* Recent Deals in Stage */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Recent Deals:</p>
                  <ScrollArea className="h-32">
                    <div className="space-y-2">
                      {filteredDeals.slice(0, 5).map((deal) => (
                        <div 
                          key={deal.id}
                          className="p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
                          onClick={() => onDealClick?.(deal)}
                          data-testid={`deal-${deal.id}`}
                        >
                          <p className="text-sm font-medium">{deal.projectName}</p>
                          <p className="text-xs text-gray-500">{formatCurrency(parseFloat(deal.dealValue?.toString() || '0'))}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                <Button 
                  className="w-full" 
                  onClick={() => onStageClick?.(selectedStage)}
                  data-testid={`view-all-${selectedStage}`}
                >
                  View All Deals
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Overall Pipeline Health */}
                <div className="space-y-3">
                  {stageMetrics.slice(0, 5).map((stage, index) => (
                    <div key={stage.stage} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{stage.label}</span>
                        <span className={`text-sm ${getHealthColor(stage.conversionRate)}`}>
                          {stage.conversionRate.toFixed(1)}%
                        </span>
                      </div>
                      <Progress 
                        value={stage.conversionRate} 
                        className="h-2"
                      />
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{stage.count} deals</span>
                        <span>{formatCurrency(stage.value)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Items */}
                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Action Items:</p>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <AlertTriangle className="text-orange-500" size={14} />
                      <span>3 deals stuck in approval</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Clock className="text-blue-500" size={14} />
                      <span>5 quotes pending response</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="text-green-500" size={14} />
                      <span>2 contracts ready to close</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}