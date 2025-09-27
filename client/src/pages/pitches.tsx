import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Header from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Send, Calendar, Clock, CheckCircle, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { insertPitchSchema, type Pitch, type InsertPitch, type Deal, type Song } from "@shared/schema";

export default function Pitches() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddPitch, setShowAddPitch] = useState(false);
  const [useCustomDeal, setUseCustomDeal] = useState(false);
  const [selectedPitch, setSelectedPitch] = useState<Pitch | null>(null);
  const [showUpdateStatus, setShowUpdateStatus] = useState(false);
  const [showFollowUp, setShowFollowUp] = useState(false);
  const { toast } = useToast();

  const { data: rawPitches = [], isLoading } = useQuery<Pitch[]>({
    queryKey: ["/api/pitches"],
  });

  // Sort pitches by priority: overdue follow-ups first, then upcoming follow-ups, then others
  const pitches = rawPitches.sort((a, b) => {
    const now = new Date();
    const aOverdue = a.followUpDate && new Date(a.followUpDate) <= now;
    const bOverdue = b.followUpDate && new Date(b.followUpDate) <= now;
    const aHasFollowUp = !!a.followUpDate;
    const bHasFollowUp = !!b.followUpDate;
    
    // Priority 1: Overdue follow-ups first (earliest overdue first)
    if (aOverdue && !bOverdue) return -1;
    if (!aOverdue && bOverdue) return 1;
    if (aOverdue && bOverdue) {
      return new Date(a.followUpDate!).getTime() - new Date(b.followUpDate!).getTime();
    }
    
    // Priority 2: Upcoming follow-ups (earliest first)
    if (aHasFollowUp && !bHasFollowUp) return -1;
    if (!aHasFollowUp && bHasFollowUp) return 1;
    if (aHasFollowUp && bHasFollowUp) {
      return new Date(a.followUpDate!).getTime() - new Date(b.followUpDate!).getTime();
    }
    
    // Priority 3: Others by submission date (most recent first)
    return new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime();
  });

  const { data: deals = [] } = useQuery<Deal[]>({
    queryKey: ["/api/deals"],
  });

  const { data: songs = [] } = useQuery<Song[]>({
    queryKey: ["/api/songs"],
  });

  const form = useForm({
    // Temporarily remove resolver to prevent validation issues
    // resolver: zodResolver(insertPitchSchema),
    defaultValues: {
      dealId: "",
      customDealName: "",
      status: "pitched",
      selectedSongs: [],
      notes: "",
      followUpDate: "",
    },
  });

  const createPitchMutation = useMutation({
    mutationFn: async (data: InsertPitch) => {
      return apiRequest("/api/pitches", {
        method: "POST",
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pitches"] });
      toast({
        title: "Pitch created",
        description: "Your new pitch has been added successfully.",
      });
      setShowAddPitch(false);
      setUseCustomDeal(false);
      form.reset({
        dealId: "",
        customDealName: "",
        status: "pitched",
        selectedSongs: [],
        notes: "",
        followUpDate: "",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating pitch",
        description: error.message || "Failed to create pitch",
        variant: "destructive",
      });
    },
  });

  const updatePitchMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertPitch> }) => {
      return apiRequest(`/api/pitches/${id}`, {
        method: "PUT",
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pitches"] });
      toast({
        title: "Pitch updated",
        description: "The pitch has been updated successfully.",
      });
      setShowUpdateStatus(false);
      setShowFollowUp(false);
      setSelectedPitch(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error updating pitch",
        description: error.message || "Failed to update pitch",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    // Validate required fields
    if (!useCustomDeal && !data.dealId) {
      toast({
        title: "Validation Error",
        description: "Please select a deal for this pitch.",
        variant: "destructive",
      });
      return;
    }

    if (useCustomDeal && !data.customDealName?.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a deal name for this pitch.",
        variant: "destructive",
      });
      return;
    }

    if (!data.selectedSongs || data.selectedSongs.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one song for this pitch.",
        variant: "destructive",
      });
      return;
    }

    // Convert and validate data - send strings to server, not Date objects
    const selectedSongTitles = data.selectedSongs?.map((songId: string) => {
      const song = songs.find(s => s.id === parseInt(songId));
      return song ? `${song.title} by ${song.artist}` : '';
    }).filter((title: string) => title).join('\n') || '';

    const processedData = {
      dealId: useCustomDeal ? null : parseInt(data.dealId),
      customDealName: useCustomDeal ? data.customDealName.trim() : null,
      status: data.status || "pitched",
      notes: selectedSongTitles + (data.notes ? '\n\nAdditional Notes:\n' + data.notes : ''),
      followUpDate: data.followUpDate && data.followUpDate !== "" ? data.followUpDate : undefined,
    };
    
    console.log("Submitting pitch data:", processedData);
    createPitchMutation.mutate(processedData);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pitched":
        return "bg-blue-100 text-blue-800";
      case "follow_up":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pitched":
        return "Pitched";
      case "follow_up":
        return "Follow Up";
      case "completed":
        return "Completed";
      default:
        return status.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  };

  const isFollowUpDue = (pitch: Pitch) => {
    if (!pitch.followUpDate) return false;
    return new Date(pitch.followUpDate) <= new Date();
  };

  const isFollowUpOverdue = (pitch: Pitch) => {
    if (!pitch.followUpDate) return false;
    const followUpDate = new Date(pitch.followUpDate);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - followUpDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff > 0;
  };

  const getDealName = (pitch: Pitch) => {
    if (pitch.customDealName) {
      return pitch.customDealName;
    }
    if (pitch.dealId) {
      const deal = deals.find(d => d.id === pitch.dealId);
      if (deal) {
        return `${deal.projectName}${deal.episodeNumber ? ` - Episode ${deal.episodeNumber}` : ''}`;
      }
    }
    return "Unknown Deal";
  };

  if (isLoading) {
    return (
      <div>
        <Header
          title="Sync Pitches"
          description="Track your pitch submissions and follow-up schedules"
          searchPlaceholder="Search pitches, projects..."
          newItemLabel="New Pitch"
        />
        <div className="p-6">
          <div className="grid gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1 space-y-3">
                      <div className="h-5 bg-gray-200 rounded w-2/5"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      </div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="flex space-x-2">
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                      <div className="h-8 w-20 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
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
        onNewItem={() => setShowAddPitch(true)}
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
                            Pitch: {getDealName(pitch)}
                          </h3>
                          <Badge className={getStatusColor(pitch.status)}>
                            {getStatusLabel(pitch.status)}
                          </Badge>
                          {isFollowUpOverdue(pitch) && (
                            <Badge variant="outline" className="text-red-600 border-red-600 bg-red-50">
                              Overdue
                            </Badge>
                          )}
                          {isFollowUpDue(pitch) && !isFollowUpOverdue(pitch) && (
                            <Badge variant="outline" className="text-yellow-600 border-yellow-600 bg-yellow-50">
                              Due Today
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
                            <div className="text-sm text-gray-600">
                              {pitch.notes.split('\n').map((line, index) => {
                                const trimmedLine = line.trim();
                                if (!trimmedLine) return null;
                                
                                if (trimmedLine === 'Additional Notes:') {
                                  return (
                                    <div key={index} className="mt-3 mb-1">
                                      <p className="text-sm font-medium text-gray-700">Additional Notes:</p>
                                    </div>
                                  );
                                }
                                
                                // Check if this line appears after "Additional Notes:"
                                const noteLines = pitch.notes?.split('\n') || [];
                                const additionalNotesIndex = noteLines.findIndex(l => l.trim() === 'Additional Notes:');
                                const isAdditionalNote = additionalNotesIndex >= 0 && index > additionalNotesIndex;
                                
                                if (isAdditionalNote) {
                                  return (
                                    <div key={index} className="text-sm text-gray-600 ml-2">
                                      {trimmedLine}
                                    </div>
                                  );
                                } else {
                                  // This is a song
                                  return (
                                    <div key={index} className="mb-1">
                                      <span className="text-sm font-medium text-gray-700">♪</span>
                                      <span className="text-sm text-gray-600 ml-2">{trimmedLine}</span>
                                    </div>
                                  );
                                }
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="w-full sm:w-auto"
                        onClick={() => {
                          setSelectedPitch(pitch);
                          setShowUpdateStatus(true);
                        }}
                      >
                        Update Status
                      </Button>
                      {(pitch.status === "pitched" || pitch.status === "follow_up") && (
                        <Button 
                          size="sm" 
                          className="bg-brand-secondary hover:bg-emerald-700 w-full sm:w-auto"
                          onClick={() => {
                            setSelectedPitch(pitch);
                            setShowFollowUp(true);
                          }}
                        >
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

      {/* Add Pitch Dialog */}
      <Dialog open={showAddPitch} onOpenChange={setShowAddPitch}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Pitch</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label>Associated Deal</Label>
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={useCustomDeal}
                      onChange={(e) => {
                        setUseCustomDeal(e.target.checked);
                        // Clear both fields when switching
                        form.setValue("dealId", "");
                        form.setValue("customDealName", "");
                      }}
                      className="mr-2"
                    />
                    Enter new deal name
                  </label>
                </div>
              </div>
              
              {useCustomDeal ? (
                <Input
                  {...form.register("customDealName")}
                  placeholder="Enter new deal name (e.g. 'Netflix Series - Season 2')"
                  className="w-full"
                />
              ) : (
                <Select
                  value={form.watch("dealId")?.toString() || ""}
                  onValueChange={(value) => form.setValue("dealId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a deal" />
                  </SelectTrigger>
                  <SelectContent>
                    {deals.map((deal) => (
                      <SelectItem key={deal.id} value={deal.id.toString()}>
                        {deal.projectName} {deal.episodeNumber && `- Episode ${deal.episodeNumber}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={form.watch("status")}
                  onValueChange={(value) => form.setValue("status", value as "pitched" | "follow_up" | "completed")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pitched">Pitched</SelectItem>
                    <SelectItem value="follow_up">Follow Up</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="followUpDate">Follow-up Date (Optional)</Label>
                <Input
                  id="followUpDate"
                  type="datetime-local"
                  {...form.register("followUpDate")}
                  placeholder=""
                />
              </div>
            </div>

            <div>
              <Label htmlFor="selectedSongs">Songs to Pitch</Label>
              <Select
                value=""
                onValueChange={(value: string) => {
                  const currentSongs = form.watch("selectedSongs") || [];
                  if (!currentSongs.includes(value)) {
                    form.setValue("selectedSongs", [...currentSongs, value]);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select songs to add to this pitch" />
                </SelectTrigger>
                <SelectContent>
                  {songs.map((song) => (
                    <SelectItem key={song.id} value={song.id.toString()}>
                      {song.title} by {song.artist}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Display selected songs */}
              {form.watch("selectedSongs")?.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">Selected Songs:</p>
                  <div className="space-y-2">
                    {form.watch("selectedSongs").map((songId) => {
                      const song = songs.find(s => s.id === parseInt(songId));
                      return song ? (
                        <div key={songId} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                          <span className="text-sm">{song.title} by {song.artist}</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const currentSongs = form.watch("selectedSongs") || [];
                              form.setValue("selectedSongs", currentSongs.filter(id => id !== songId));
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                {...form.register("notes")}
                placeholder="Add any additional notes about this pitch..."
                rows={3}
              />
            </div>

            <div className="flex space-x-4 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowAddPitch(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="flex-1 bg-brand-primary hover:bg-blue-700"
                disabled={createPitchMutation.isPending}
              >
                {createPitchMutation.isPending ? "Creating..." : "Create Pitch"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={showUpdateStatus} onOpenChange={setShowUpdateStatus}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Pitch Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select 
                defaultValue={selectedPitch?.status}
                onValueChange={(value) => {
                  if (selectedPitch) {
                    updatePitchMutation.mutate({
                      id: selectedPitch.id,
                      data: { status: value }
                    });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pitched">Pitched</SelectItem>
                  <SelectItem value="follow_up">Follow Up</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Follow Up Dialog */}
      <Dialog open={showFollowUp} onOpenChange={setShowFollowUp}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Follow Up</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="followUpDate">Follow-up Date</Label>
              <Input
                id="followUpDate"
                type="datetime-local"
                defaultValue={selectedPitch?.followUpDate ? 
                  new Date(selectedPitch.followUpDate).toISOString().slice(0, 16) : ""
                }
                onChange={(e) => {
                  if (selectedPitch && e.target.value) {
                    updatePitchMutation.mutate({
                      id: selectedPitch.id,
                      data: { followUpDate: new Date(e.target.value).toISOString() }
                    });
                  }
                }}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
