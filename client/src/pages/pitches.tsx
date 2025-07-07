import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Send, Calendar, Clock, CheckCircle } from "lucide-react";
import type { Pitch } from "@shared/schema";

export default function Pitches() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: pitches = [], isLoading } = useQuery<Pitch[]>({
    queryKey: ["/api/pitches"],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "responded":
        return "bg-green-100 text-green-800";
      case "no_response":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    return status.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  };

  const isFollowUpDue = (pitch: Pitch) => {
    if (!pitch.followUpDate) return false;
    return new Date(pitch.followUpDate) <= new Date();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-gray-600">Loading pitches...</div>
      </div>
    );
  }

  return (
    <div>
      <Header
        title="Sync Pitches"
        description="Track your pitch submissions and follow-up schedules"
        searchPlaceholder="Search pitches, projects..."
        newItemLabel="New Pitch"
        onSearch={setSearchQuery}
        onNewItem={() => {}}
      />
      
      <div className="p-6">
        {pitches.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Send className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No pitches found</h3>
              <p className="text-gray-600 text-center mb-6">
                Pitches are automatically created when you add deals. Start by creating your first deal.
              </p>
              <Button className="bg-brand-primary hover:bg-blue-700">
                Create Your First Deal
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {pitches.map((pitch) => (
              <Card key={pitch.id} className={`hover:shadow-md transition-shadow ${
                isFollowUpDue(pitch) ? "border-yellow-200 bg-yellow-50" : ""
              }`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-brand-primary/10 rounded-lg flex items-center justify-center">
                        <Send className="h-8 w-8 text-brand-primary" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Pitch #{pitch.id}
                          </h3>
                          <Badge className={getStatusColor(pitch.status)}>
                            {getStatusLabel(pitch.status)}
                          </Badge>
                          {isFollowUpDue(pitch) && (
                            <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                              Follow-up Due
                            </Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="font-medium">Submitted</p>
                              <p>{formatDate(pitch.submissionDate)}</p>
                            </div>
                          </div>
                          
                          {pitch.followUpDate && (
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-gray-400" />
                              <div>
                                <p className="font-medium">Follow-up</p>
                                <p>{formatDate(pitch.followUpDate)}</p>
                              </div>
                            </div>
                          )}
                          
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="font-medium">Status</p>
                              <p>{getStatusLabel(pitch.status)}</p>
                            </div>
                          </div>
                        </div>
                        
                        {pitch.notes && (
                          <div className="mt-3">
                            <p className="text-sm font-medium text-gray-700 mb-1">Notes:</p>
                            <p className="text-sm text-gray-600">{pitch.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        Update Status
                      </Button>
                      {pitch.status === "pending" && (
                        <Button size="sm" className="bg-brand-secondary hover:bg-emerald-700">
                          Follow Up
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
