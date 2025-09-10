import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Search, Star, TrendingUp, TrendingDown, Users, DollarSign,
  Calendar, AlertTriangle, Target, CheckCircle, Phone, Mail
} from "lucide-react";
import type { ClientRelationshipData } from "@shared/schema";

interface ClientRelationshipDashboardProps {
  onClientSelect?: (clientId: number) => void;
}

export default function ClientRelationshipDashboard({ onClientSelect }: ClientRelationshipDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<'score' | 'revenue' | 'deals'>('score');

  const { data: relationships = [], isLoading } = useQuery<ClientRelationshipData[]>({
    queryKey: ["/api/dashboard/client-relationships"],
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getClientValueColor = (value: ClientRelationshipData['clientValue']) => {
    switch (value) {
      case 'high': return 'bg-green-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-gray-500 text-white';
      default: return 'bg-gray-300 text-gray-700';
    }
  };

  const getPaymentHistoryColor = (history: ClientRelationshipData['paymentHistory']) => {
    switch (history) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Filter and sort relationships
  const filteredRelationships = relationships
    .filter(client => 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.company.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'score': return b.relationshipScore - a.relationshipScore;
        case 'revenue': return b.totalRevenue - a.totalRevenue;
        case 'deals': return b.dealCount - a.dealCount;
        default: return b.relationshipScore - a.relationshipScore;
      }
    });

  // Calculate summary statistics
  const totalClients = relationships.length;
  const highValueClients = relationships.filter(c => c.clientValue === 'high').length;
  const avgRelationshipScore = relationships.reduce((sum, c) => sum + c.relationshipScore, 0) / relationships.length;
  const totalRevenue = relationships.reduce((sum, c) => sum + c.totalRevenue, 0);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="text-blue-600" size={20} />
              <div>
                <p className="text-sm text-gray-600">Total Clients</p>
                <p className="text-2xl font-bold">{totalClients}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="text-green-600" size={20} />
              <div>
                <p className="text-sm text-gray-600">High Value</p>
                <p className="text-2xl font-bold">{highValueClients}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="text-purple-600" size={20} />
              <div>
                <p className="text-sm text-gray-600">Avg Score</p>
                <p className="text-2xl font-bold">{avgRelationshipScore.toFixed(0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="text-green-600" size={20} />
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Client Relationship Dashboard */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Client Relationship Analytics</h3>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <Input
                  placeholder="Search clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                  data-testid="client-search"
                />
              </div>
              <div className="flex space-x-2">
                <Button
                  variant={sortBy === 'score' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy('score')}
                  data-testid="sort-score"
                >
                  Score
                </Button>
                <Button
                  variant={sortBy === 'revenue' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy('revenue')}
                  data-testid="sort-revenue"
                >
                  Revenue
                </Button>
                <Button
                  variant={sortBy === 'deals' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy('deals')}
                  data-testid="sort-deals"
                >
                  Deals
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {filteredRelationships.map((client) => (
                <Card 
                  key={client.contactId} 
                  className="cursor-pointer hover:shadow-md transition-all duration-200 border-l-4 border-l-blue-500"
                  onClick={() => onClientSelect?.(client.contactId)}
                  data-testid={`client-card-${client.contactId}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-4">
                        {/* Client Header */}
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">{client.name}</h4>
                            <p className="text-sm text-gray-600">{client.company}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getClientValueColor(client.clientValue)}>
                              {client.clientValue.charAt(0).toUpperCase() + client.clientValue.slice(1)} Value
                            </Badge>
                            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(client.relationshipScore)}`}>
                              Score: {client.relationshipScore}
                            </div>
                          </div>
                        </div>

                        {/* Key Metrics */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-blue-600">{client.dealCount}</p>
                            <p className="text-sm text-gray-600">Total Deals</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-green-600">{formatCurrency(client.totalRevenue)}</p>
                            <p className="text-sm text-gray-600">Total Revenue</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-purple-600">{formatCurrency(client.avgDealValue)}</p>
                            <p className="text-sm text-gray-600">Avg Deal Value</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-orange-600">{client.successRate.toFixed(0)}%</p>
                            <p className="text-sm text-gray-600">Success Rate</p>
                          </div>
                        </div>

                        {/* Relationship Health Indicators */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-gray-600">Payment History</span>
                              <span className={`text-sm font-medium ${getPaymentHistoryColor(client.paymentHistory)}`}>
                                {client.paymentHistory.charAt(0).toUpperCase() + client.paymentHistory.slice(1)}
                              </span>
                            </div>
                            <Progress 
                              value={client.paymentHistory === 'excellent' ? 100 : 
                                     client.paymentHistory === 'good' ? 75 : 
                                     client.paymentHistory === 'fair' ? 50 : 25} 
                              className="h-2" 
                            />
                          </div>
                          
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-gray-600">Communication</span>
                              <span className="text-sm font-medium">{client.communicationFrequency}/10</span>
                            </div>
                            <Progress value={client.communicationFrequency * 10} className="h-2" />
                          </div>
                          
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-gray-600">Last Contact</span>
                              <span className="text-sm text-gray-500">{formatDate(client.lastContactDate)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Preferred Genres */}
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Preferred Genres:</p>
                          <div className="flex flex-wrap gap-2">
                            {client.preferredGenres.map((genre, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {genre}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Risk Factors & Opportunities */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {client.riskFactors.length > 0 && (
                            <div>
                              <div className="flex items-center space-x-1 mb-2">
                                <AlertTriangle className="text-red-500" size={16} />
                                <p className="text-sm font-medium text-red-700">Risk Factors:</p>
                              </div>
                              <ul className="text-sm text-red-600 space-y-1">
                                {client.riskFactors.map((risk, index) => (
                                  <li key={index}>• {risk}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {client.opportunities.length > 0 && (
                            <div>
                              <div className="flex items-center space-x-1 mb-2">
                                <TrendingUp className="text-green-500" size={16} />
                                <p className="text-sm font-medium text-green-700">Opportunities:</p>
                              </div>
                              <ul className="text-sm text-green-600 space-y-1">
                                {client.opportunities.map((opportunity, index) => (
                                  <li key={index}>• {opportunity}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        {/* Next Best Action */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Target className="text-blue-600" size={16} />
                              <span className="text-sm font-medium text-blue-800">Next Best Action:</span>
                            </div>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline" data-testid={`call-${client.contactId}`}>
                                <Phone size={14} className="mr-1" />
                                Call
                              </Button>
                              <Button size="sm" variant="outline" data-testid={`email-${client.contactId}`}>
                                <Mail size={14} className="mr-1" />
                                Email
                              </Button>
                            </div>
                          </div>
                          <p className="text-sm text-blue-700 mt-2">{client.nextBestAction}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}