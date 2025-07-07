import { Card, CardContent } from "@/components/ui/card";
import { Handshake, DollarSign, Clock, Music, TrendingUp } from "lucide-react";
import type { DashboardMetrics } from "@shared/schema";

interface MetricsCardsProps {
  metrics: DashboardMetrics;
}

export default function MetricsCards({ metrics }: MetricsCardsProps) {
  const cards = [
    {
      title: "Active Deals",
      value: metrics.activeDeals.toString(),
      icon: Handshake,
      bgColor: "bg-brand-primary/10",
      iconColor: "text-brand-primary",
      trend: "+12%",
      trendLabel: "from last month",
    },
    {
      title: "Total Revenue",
      value: `$${metrics.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      bgColor: "bg-brand-secondary/10",
      iconColor: "text-brand-secondary",
      trend: "+8%",
      trendLabel: "from last month",
    },
    {
      title: "Pending Payments",
      value: `$${metrics.pendingPayments.toLocaleString()}`,
      icon: Clock,
      bgColor: "bg-status-pending/10",
      iconColor: "text-status-pending",
      trend: `${metrics.urgentActions.length} overdue`,
      trendLabel: "payments",
    },
    {
      title: "Songs in Database",
      value: metrics.totalSongs.toString(),
      icon: Music,
      bgColor: "bg-brand-accent/10",
      iconColor: "text-brand-accent",
      trend: "+15",
      trendLabel: "this week",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className="border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                </div>
                <div className={`w-12 h-12 ${card.bgColor} rounded-full flex items-center justify-center`}>
                  <Icon className={`${card.iconColor}`} size={20} />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <TrendingUp className="text-green-500 mr-1" size={16} />
                <span className="text-green-500 font-medium">{card.trend}</span>
                <span className="text-gray-600 ml-1">{card.trendLabel}</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
