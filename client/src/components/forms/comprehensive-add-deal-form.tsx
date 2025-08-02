import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { insertDealSchema, insertContactSchema, type InsertDeal, type InsertContact, type Song, type Contact } from "@shared/schema";
import { Plus, Building, User, FileText, DollarSign, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import AddContactForm from "@/components/forms/add-contact-form";

// Currency formatting functions
const formatCurrency = (value: string | number) => {
  if (!value && value !== 0) return '';
  const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]+/g, '')) : value;
  if (isNaN(numValue)) return '';
  if (numValue === 0) return '';
  return '$' + numValue.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
};

interface ComprehensiveAddDealFormProps {
  open: boolean;
  onClose: () => void;
  deal?: any;
}

export default function ComprehensiveAddDealForm({ open, onClose, deal }: ComprehensiveAddDealFormProps) {
  const { toast } = useToast();
  const isEditing = !!deal;
  const [showAddContact, setShowAddContact] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);

  // State for managing composer-publisher and artist-label data from selected song
  interface ComposerPublisher {
    composer: string;
    publisher: string;
    publishingOwnership: string;
    isMine: boolean;
  }
  
  interface ArtistLabel {
    artist: string;
    label: string;
    labelOwnership: string;
    isMine: boolean;
  }
  
  const [composerPublishers, setComposerPublishers] = useState<ComposerPublisher[]>([
    { composer: '', publisher: '', publishingOwnership: '', isMine: false }
  ]);
  
  const [artistLabels, setArtistLabels] = useState<ArtistLabel[]>([
    { artist: '', label: '', labelOwnership: '', isMine: false }
  ]);

  const form = useForm<InsertDeal>({
    shouldFocusError: false,
    defaultValues: {
      projectName: deal?.projectName || "",
      episodeNumber: deal?.episodeNumber || "",
      projectType: deal?.projectType || "",
      projectDescription: deal?.projectDescription || "",
      songId: deal?.songId || undefined,
      contactId: deal?.contactId || undefined,
      
      // Contact Information
      licenseeCompanyName: deal?.licenseeCompanyName || "",
      licenseeAddress: deal?.licenseeAddress || "",
      licenseeContactName: deal?.licenseeContactName || "",
      licenseeContactEmail: deal?.licenseeContactEmail || "",
      licenseeContactPhone: deal?.licenseeContactPhone || "",
      
      musicSupervisorName: deal?.musicSupervisorName || "",
      musicSupervisorAddress: deal?.musicSupervisorAddress || "",
      musicSupervisorContactName: deal?.musicSupervisorContactName || "",
      musicSupervisorContactEmail: deal?.musicSupervisorContactEmail || "",
      musicSupervisorContactPhone: deal?.musicSupervisorContactPhone || "",
      
      clearanceCompanyName: deal?.clearanceCompanyName || "",
      clearanceCompanyContactName: deal?.clearanceCompanyContactName || "",
      clearanceCompanyContactEmail: deal?.clearanceCompanyContactEmail || "",
      clearanceCompanyContactPhone: deal?.clearanceCompanyContactPhone || "",
      clearanceCompanyAddress: deal?.clearanceCompanyAddress || "",
      
      status: deal?.status || "new request",
      dealValue: deal?.dealValue || undefined,
      fullSongValue: deal?.fullSongValue || undefined,
      ourFee: deal?.ourFee || undefined,
      fullRecordingFee: deal?.fullRecordingFee || undefined,
      ourRecordingFee: deal?.ourRecordingFee || undefined,
      
      // Status dates
      pitchedDate: deal?.pitchedDate ? new Date(deal.pitchedDate).toISOString().slice(0, 16) : undefined,
      pendingApprovalDate: deal?.pendingApprovalDate ? new Date(deal.pendingApprovalDate).toISOString().slice(0, 16) : undefined,
      quotedDate: deal?.quotedDate ? new Date(deal.quotedDate).toISOString().slice(0, 16) : undefined,
      useConfirmedDate: deal?.useConfirmedDate ? new Date(deal.useConfirmedDate).toISOString().slice(0, 16) : undefined,
      beingDraftedDate: deal?.beingDraftedDate ? new Date(deal.beingDraftedDate).toISOString().slice(0, 16) : undefined,
      outForSignatureDate: deal?.outForSignatureDate ? new Date(deal.outForSignatureDate).toISOString().slice(0, 16) : undefined,
      paymentReceivedDate: deal?.paymentReceivedDate ? new Date(deal.paymentReceivedDate).toISOString().slice(0, 16) : undefined,
      completedDate: deal?.completedDate ? new Date(deal.completedDate).toISOString().slice(0, 16) : undefined,
      
      usage: deal?.usage || "",
      sceneDescription: deal?.sceneDescription || "",
      media: deal?.media || "",
      territory: deal?.territory || "worldwide",
      term: deal?.term || "",
      options: deal?.options || "",
      writers: deal?.writers || "",
      publishingInfo: deal?.publishingInfo || "",
      splits: deal?.splits || "",
      artist: deal?.artist || "",
      label: deal?.label || "",
      artistLabelSplits: deal?.artistLabelSplits || "",
      exclusivity: deal?.exclusivity ?? false,
      exclusivityRestrictions: deal?.exclusivityRestrictions || "",
      notes: deal?.notes || "",
      airDate: deal?.airDate || "",
    },
  });

  const { data: songs = [] } = useQuery<Song[]>({
    queryKey: ['/api/songs'],
  });

  const { data: contacts = [] } = useQuery<Contact[]>({
    queryKey: ['/api/contacts'],
  });

  // Reset form when deal prop changes (for editing)
  useEffect(() => {
    if (deal) {
      form.reset({
        projectName: deal.projectName || "",
        episodeNumber: deal.episodeNumber || "",
        projectType: deal.projectType || "",
        projectDescription: deal.projectDescription || "",
        songId: deal.songId || undefined,
        contactId: deal.contactId || undefined,
        
        // Contact Information
        licenseeCompanyName: deal.licenseeCompanyName || "",
        licenseeAddress: deal.licenseeAddress || "",
        licenseeContactName: deal.licenseeContactName || "",
        licenseeContactEmail: deal.licenseeContactEmail || "",
        licenseeContactPhone: deal.licenseeContactPhone || "",
        
        musicSupervisorName: deal.musicSupervisorName || "",
        musicSupervisorAddress: deal.musicSupervisorAddress || "",
        musicSupervisorContactName: deal.musicSupervisorContactName || "",
        musicSupervisorContactEmail: deal.musicSupervisorContactEmail || "",
        musicSupervisorContactPhone: deal.musicSupervisorContactPhone || "",
        
        clearanceCompanyName: deal.clearanceCompanyName || "",
        clearanceCompanyContactName: deal.clearanceCompanyContactName || "",
        clearanceCompanyContactEmail: deal.clearanceCompanyContactEmail || "",
        clearanceCompanyContactPhone: deal.clearanceCompanyContactPhone || "",
        clearanceCompanyAddress: deal.clearanceCompanyAddress || "",
        
        status: deal.status || "new request",
        dealValue: deal.dealValue || undefined,
        fullSongValue: deal.fullSongValue || undefined,
        ourFee: deal.ourFee || undefined,
        fullRecordingFee: deal.fullRecordingFee || undefined,
        ourRecordingFee: deal.ourRecordingFee || undefined,
        
        // Status dates
        pitchedDate: deal.pitchedDate ? new Date(deal.pitchedDate).toISOString().slice(0, 16) : undefined,
        pendingApprovalDate: deal.pendingApprovalDate ? new Date(deal.pendingApprovalDate).toISOString().slice(0, 16) : undefined,
        quotedDate: deal.quotedDate ? new Date(deal.quotedDate).toISOString().slice(0, 16) : undefined,
        useConfirmedDate: deal.useConfirmedDate ? new Date(deal.useConfirmedDate).toISOString().slice(0, 16) : undefined,
        beingDraftedDate: deal.beingDraftedDate ? new Date(deal.beingDraftedDate).toISOString().slice(0, 16) : undefined,
        outForSignatureDate: deal.outForSignatureDate ? new Date(deal.outForSignatureDate).toISOString().slice(0, 16) : undefined,
        paymentReceivedDate: deal.paymentReceivedDate ? new Date(deal.paymentReceivedDate).toISOString().slice(0, 16) : undefined,
        completedDate: deal.completedDate ? new Date(deal.completedDate).toISOString().slice(0, 16) : undefined,
        
        usage: deal.usage || "",
        sceneDescription: deal.sceneDescription || "",
        media: deal.media || "",
        territory: deal.territory || "worldwide",
        term: deal.term || "",
        options: deal.options || "",
        writers: deal.writers || "",
        publishingInfo: deal.publishingInfo || "",
        splits: deal.splits || "",
        artist: deal.artist || "",
        label: deal.label || "",
        artistLabelSplits: deal.artistLabelSplits || "",
        exclusivity: deal.exclusivity ?? false,
        exclusivityRestrictions: deal.exclusivityRestrictions || "",
        restrictions: deal.restrictions || "",
        notes: deal.notes || "",
        airDate: deal.airDate || "",
      });
    }
  }, [deal, form]);

  const createDealMutation = useMutation({
    mutationFn: (data: InsertDeal) => 
      apiRequest(isEditing ? `/api/deals/${deal.id}` : '/api/deals', { 
        method: isEditing ? 'PATCH' : 'POST', 
        body: data 
      }),
    onSuccess: async (response) => {
      console.log("Deal update successful:", response);
      
      // Invalidate multiple cache keys
      await queryClient.invalidateQueries({ queryKey: ['/api/deals'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/deals', deal?.id] });
      
      const newDeal = response;
      
      // Auto-create calendar event if air date is provided
      if (newDeal.airDate && !isEditing) {
        try {
          await apiRequest('/api/calendar-events', {
            method: 'POST',
            body: {
              title: `${newDeal.projectName} - Air Date`,
              description: `Air date for ${newDeal.projectName}`,
              startDate: newDeal.airDate,
              endDate: newDeal.airDate,
              allDay: true,
              entityType: "deal",
              entityId: newDeal.id,
              status: 'scheduled',
              reminderMinutes: 1440 // 24 hours before
            }
          });
          queryClient.invalidateQueries({ queryKey: ["/api/calendar-events"] });
        } catch (error) {
          console.log("Failed to create calendar event:", error);
        }
      }
      
      toast({
        title: isEditing ? "Deal updated successfully" : "Deal created successfully",
        description: newDeal.airDate && !isEditing
          ? `The deal has been ${isEditing ? 'updated' : 'created'} and calendar event created for air date.`
          : `The deal has been ${isEditing ? 'updated' : 'created'}.`,
      });
      
      // Force a brief delay to ensure cache invalidation completes
      setTimeout(() => {
        onClose();
        if (!isEditing) {
          form.reset();
        }
      }, 100);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'create'} deal: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Function to parse our split percentage from splits text
  const parseOurSplitPercentage = (splitsText: string): number => {
    if (!splitsText) return 50; // Default to 50%
    
    // Look for our percentage patterns
    const ourPatterns = [
      /our[:\s]*(\d+)%/i,
      /we[:\s]*(\d+)%/i,
      /us[:\s]*(\d+)%/i,
      /(\d+)%[^/]*our/i,
      /(\d+)%[^/]*we/i,
      /(\d+)%[^/]*us/i
    ];
    
    for (const pattern of ourPatterns) {
      const match = splitsText.match(pattern);
      if (match) {
        const percentage = parseInt(match[1]);
        if (percentage >= 0 && percentage <= 100) {
          return percentage;
        }
      }
    }
    
    // If no specific pattern found, look for any percentage
    const percentageMatch = splitsText.match(/(\d+)%/);
    if (percentageMatch) {
      const percentage = parseInt(percentageMatch[1]);
      if (percentage >= 0 && percentage <= 100) {
        return percentage;
      }
    }
    
    return 50; // Default to 50% if can't parse
  };

  // Function to calculate our fee based on splits
  const calculateOurFee = (fullFee: number, splitsText: string): number => {
    if (!fullFee || fullFee === 0) return 0;
    const ourPercentage = parseOurSplitPercentage(splitsText);
    return (fullFee * ourPercentage) / 100;
  };

  const onSubmit = (data: InsertDeal) => {
    console.log("Form submission data:", data);
    
    // Validate required fields manually
    if (!data.projectName || !data.projectType || !data.songId || !data.contactId) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields (Project Name, Project Type, Song Title, and Contact).",
        variant: "destructive",
      });
      return;
    }
    
    createDealMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Deal" : "Add New Deal"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Section 1: Project Information */}
          <Card className="bg-purple-50 border-purple-200">
            <CardHeader className="bg-purple-100 border-b border-purple-200">
              <CardTitle className="flex items-center space-x-2 text-purple-800">
                <FileText className="h-5 w-5" />
                <span>Project Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 bg-purple-50">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="projectName">Project Name *</Label>
                  <Input
                    id="projectName"
                    {...form.register("projectName")}
                    placeholder="Project name"
                  />
                  {form.formState.errors.projectName && (
                    <p className="text-sm text-red-600 mt-1">{form.formState.errors.projectName.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="episodeNumber">Episode #</Label>
                  <Input
                    id="episodeNumber"
                    {...form.register("episodeNumber")}
                    placeholder="e.g., S01E05"
                  />
                </div>
                <div>
                  <Label htmlFor="projectType">Project Type *</Label>
                  <Select 
                    value={form.watch("projectType")} 
                    onValueChange={(value) => form.setValue("projectType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select project type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="commercial">Commercial</SelectItem>
                      <SelectItem value="documentary">Documentary</SelectItem>
                      <SelectItem value="film">Film</SelectItem>
                      <SelectItem value="game">Video Game</SelectItem>
                      <SelectItem value="indie film">Indie Film</SelectItem>
                      <SelectItem value="non-profit">Non-Profit</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="podcast">Podcast</SelectItem>
                      <SelectItem value="promos">Promos</SelectItem>
                      <SelectItem value="sports">Sports</SelectItem>
                      <SelectItem value="student film">Student Film</SelectItem>
                      <SelectItem value="trailers">Trailers</SelectItem>
                      <SelectItem value="tv show">TV Show</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="projectDescription">Project Description</Label>
                <Textarea
                  id="projectDescription"
                  {...form.register("projectDescription")}
                  placeholder="Brief description of the project"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={form.watch("status")}
                    onValueChange={(value) => {
                      form.setValue("status", value);
                      
                      // Auto-populate corresponding date when status changes
                      const currentDate = new Date().toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:MM
                      
                      switch (value) {
                        case "new request":
                          form.setValue("pitchedDate", currentDate);
                          break;
                        case "pending approval":
                          form.setValue("pendingApprovalDate", currentDate);
                          break;
                        case "quoted":
                          form.setValue("quotedDate", currentDate);
                          break;
                        case "use confirmed":
                          form.setValue("useConfirmedDate", currentDate);
                          break;
                        case "being drafted":
                          form.setValue("beingDraftedDate", currentDate);
                          break;
                        case "out for signature":
                          form.setValue("outForSignatureDate", currentDate);
                          break;
                        case "payment received":
                          form.setValue("paymentReceivedDate", currentDate);
                          break;
                        case "completed":
                          form.setValue("completedDate", currentDate);
                          break;
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new request">New Request</SelectItem>
                      <SelectItem value="pending approval">Pending Approval</SelectItem>
                      <SelectItem value="quoted">Quoted</SelectItem>
                      <SelectItem value="use confirmed">Use Confirmed</SelectItem>
                      <SelectItem value="being drafted">Being Drafted</SelectItem>
                      <SelectItem value="out for signature">Out for Signature</SelectItem>
                      <SelectItem value="payment received">Payment Received</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="airDate">Air Date</Label>
                  <Input
                    id="airDate"
                    type="date"
                    {...form.register("airDate")}
                  />
                </div>
              </div>


            </CardContent>
          </Card>

          {/* Section 2: Song Information */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="bg-blue-100 border-b border-blue-200">
              <CardTitle className="flex items-center space-x-2 text-blue-800">
                <span>🎵</span>
                <span>Song Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 bg-blue-50">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="songId">Song Title *</Label>
                  <Select
                    value={form.watch("songId")?.toString()}
                    onValueChange={(value) => {
                      const songId = parseInt(value);
                      form.setValue("songId", songId);
                      
                      // Auto-populate comprehensive song information from database
                      const song = songs.find(s => s.id === songId);
                      if (song) {
                        setSelectedSong(song);
                        
                        // Basic song information
                        form.setValue("artist", song.artist || "");
                        form.setValue("label", song.producer || "");
                        
                        // Writers and publishing information
                        if (song.composer) {
                          form.setValue("writers", song.composer);
                        }
                        if (song.publisher) {
                          form.setValue("publishingInfo", song.publisher);
                        }
                        
                        // Load structured ownership data if available
                        if (song.composerPublishers && Array.isArray(song.composerPublishers)) {
                          setComposerPublishers(song.composerPublishers);
                        } else if (song.composer || song.publisher) {
                          // Fall back to legacy comma-separated strings
                          const composers = song.composer ? song.composer.split(', ').filter(Boolean) : [''];
                          const publishers = song.publisher ? song.publisher.split(', ').filter(Boolean) : [''];
                          
                          const maxLength = Math.max(composers.length, publishers.length);
                          const result: ComposerPublisher[] = [];
                          for (let i = 0; i < maxLength; i++) {
                            result.push({
                              composer: composers[i] || '',
                              publisher: publishers[i] || '',
                              publishingOwnership: '',
                              isMine: false
                            });
                          }
                          setComposerPublishers(result.length > 0 ? result : [{ composer: '', publisher: '', publishingOwnership: '', isMine: false }]);
                        }
                        
                        // Load artist-label data if available
                        if (song.artistLabels && Array.isArray(song.artistLabels)) {
                          setArtistLabels(song.artistLabels);
                        } else if (song.artist || song.producer) {
                          // Fall back to legacy comma-separated strings
                          const artists = song.artist ? song.artist.split(', ').filter(Boolean) : [''];
                          const labels = song.producer ? [song.producer] : [''];
                          
                          const maxLength = Math.max(artists.length, labels.length);
                          const result: ArtistLabel[] = [];
                          for (let i = 0; i < maxLength; i++) {
                            result.push({
                              artist: artists[i] || '',
                              label: labels[i] || '',
                              labelOwnership: '',
                              isMine: false
                            });
                          }
                          setArtistLabels(result.length > 0 ? result : [{ artist: '', label: '', labelOwnership: '', isMine: false }]);
                        }
                        
                        // Use actual split details if available, otherwise calculate from ownership data
                        if (song.splitDetails) {
                          form.setValue("splits", song.splitDetails);
                        } else {
                          // Calculate splits from actual ownership percentages
                          const publishingOwnership = song.publishingOwnership || 0;
                          const publisherOwnership = 100 - publishingOwnership;
                          form.setValue("splits", `${publishingOwnership}% Writer / ${publisherOwnership}% Publisher`);
                        }
                        
                        // Artist/Label splits from actual ownership data
                        const masterOwnership = song.masterOwnership || 0;
                        const labelOwnership = 100 - masterOwnership;
                        form.setValue("artistLabelSplits", `${masterOwnership}% Artist / ${labelOwnership}% Label`);
                        
                        // Auto-populate restrictions if available
                        if (song.restrictions) {
                          form.setValue("restrictions", song.restrictions);
                        }
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a song" />
                    </SelectTrigger>
                    <SelectContent>
                      {songs.map((song) => (
                        <SelectItem key={song.id} value={song.id.toString()}>
                          {song.title} - {song.artist}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.songId && (
                    <p className="text-sm text-red-600 mt-1">{form.formState.errors.songId.message}</p>
                  )}
                </div>
              </div>

              {selectedSong && (
                <div className="space-y-4">
                  {/* Basic Song Information */}
                  <Card className="bg-purple-50 border-purple-200">
                    <CardHeader className="bg-purple-100 border-b border-purple-200">
                      <CardTitle className="text-purple-800">Basic Song Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 bg-purple-50">
                      {/* First line: Title, Album */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Title</Label>
                          <Input
                            value={selectedSong.title || ""}
                            readOnly
                            className="bg-purple-25 cursor-not-allowed"
                          />
                        </div>
                        <div>
                          <Label>Album</Label>
                          <Input
                            value={selectedSong.album || ""}
                            readOnly
                            className="bg-purple-25 cursor-not-allowed"
                            placeholder="Album name"
                          />
                        </div>
                      </div>
                      
                      {/* Second line: Jonas's Ownership Summary */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Publishing Ownership (%)</Label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={composerPublishers
                              .filter(cp => cp.isMine && cp.publishingOwnership)
                              .reduce((total, cp) => total + parseFloat(cp.publishingOwnership || '0'), 0)
                              .toFixed(2)}
                            readOnly
                            className="bg-purple-25 cursor-not-allowed"
                            placeholder="0.00"
                          />
                          <p className="text-xs text-purple-600 mt-1">Auto-calculated from Jonas's checked composers</p>
                        </div>
                        <div>
                          <Label>Label Recording Ownership (%)</Label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={artistLabels
                              .filter(al => al.isMine && al.labelOwnership)
                              .reduce((total, al) => total + parseFloat(al.labelOwnership || '0'), 0)
                              .toFixed(2)}
                            readOnly
                            className="bg-purple-25 cursor-not-allowed"
                            placeholder="0.00"
                          />
                          <p className="text-xs text-purple-600 mt-1">Auto-calculated from Jonas's checked artists</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Publishing Information */}
                  <Card className="bg-green-50 border-green-200">
                    <CardHeader className="bg-green-100 border-b border-green-200">
                      <CardTitle className="text-green-800">Publishing Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 bg-green-50">
                      <div>
                        <Label className="text-base font-semibold">Composer(s), Publisher(s) & Ownership</Label>
                        <div className="space-y-3 mt-3">
                          <div className="grid grid-cols-12 gap-2 text-sm font-medium text-green-700">
                            <div className="col-span-4">Composer Name</div>
                            <div className="col-span-4">Publisher</div>
                            <div className="col-span-2">Ownership (%)</div>
                            <div className="col-span-1">Jonas</div>
                            <div className="col-span-1"></div>
                          </div>
                          {composerPublishers.map((item, index) => (
                            <div key={index} className="grid grid-cols-12 gap-2">
                              <div className="col-span-4">
                                <Input
                                  value={item.composer}
                                  readOnly
                                  className="bg-green-25 cursor-not-allowed"
                                />
                              </div>
                              <div className="col-span-4">
                                <Input
                                  value={item.publisher}
                                  readOnly
                                  className="bg-green-25 cursor-not-allowed"
                                />
                              </div>
                              <div className="col-span-2">
                                <Input
                                  value={item.publishingOwnership}
                                  readOnly
                                  className="bg-green-25 cursor-not-allowed"
                                />
                              </div>
                              <div className="col-span-1 flex justify-center items-center">
                                <Checkbox
                                  checked={item.isMine}
                                  disabled
                                />
                              </div>
                              <div className="col-span-1"></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Label Information */}
                  <Card className="bg-blue-50 border-blue-200">
                    <CardHeader className="bg-blue-100 border-b border-blue-200">
                      <CardTitle className="text-blue-800">Label Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 bg-blue-50">
                      <div>
                        <Label className="text-base font-semibold">Artist(s), Label(s) & Ownership</Label>
                        <div className="space-y-3 mt-3">
                          <div className="grid grid-cols-12 gap-2 text-sm font-medium text-blue-700">
                            <div className="col-span-4">Artist Name</div>
                            <div className="col-span-4">Label</div>
                            <div className="col-span-2">Ownership (%)</div>
                            <div className="col-span-1">Jonas</div>
                            <div className="col-span-1"></div>
                          </div>
                          {artistLabels.map((item, index) => (
                            <div key={index} className="grid grid-cols-12 gap-2">
                              <div className="col-span-4">
                                <Input
                                  value={item.artist}
                                  readOnly
                                  className="bg-blue-25 cursor-not-allowed"
                                />
                              </div>
                              <div className="col-span-4">
                                <Input
                                  value={item.label}
                                  readOnly
                                  className="bg-blue-25 cursor-not-allowed"
                                />
                              </div>
                              <div className="col-span-2">
                                <Input
                                  value={item.labelOwnership}
                                  readOnly
                                  className="bg-blue-25 cursor-not-allowed"
                                />
                              </div>
                              <div className="col-span-1 flex justify-center items-center">
                                <Checkbox
                                  checked={item.isMine}
                                  disabled
                                />
                              </div>
                              <div className="col-span-1"></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Deal Terms */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">Deal Terms</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="usage">Usage</Label>
                        <Input
                          id="usage"
                          {...form.register("usage")}
                          placeholder="e.g., Background music"
                        />
                      </div>
                      <div>
                        <Label htmlFor="sceneDescription">Scene Description</Label>
                        <Textarea
                          id="sceneDescription"
                          {...form.register("sceneDescription")}
                          placeholder="Describe how music is used in scene"
                          rows={4}
                          className="min-h-[100px]"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div>
                        <Label htmlFor="media">Media</Label>
                        <Textarea
                          id="media"
                          {...form.register("media")}
                          placeholder="e.g., TV, Film, Streaming, All media and devices..."
                          rows={3}
                          className="min-h-[80px]"
                        />
                      </div>
                      <div>
                        <Label htmlFor="term">Term</Label>
                        <Input
                          id="term"
                          {...form.register("term")}
                          placeholder="e.g., 5 years, In perpetuity"
                        />
                      </div>
                      <div>
                        <Label htmlFor="territory">Territory</Label>
                        <Select
                          value={form.watch("territory")}
                          onValueChange={(value) => form.setValue("territory", value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="worldwide">Worldwide</SelectItem>
                            <SelectItem value="us">United States</SelectItem>
                            <SelectItem value="north_america">North America</SelectItem>
                            <SelectItem value="europe">Europe</SelectItem>
                            <SelectItem value="uk">United Kingdom</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Fees Section */}
          <Card className="bg-green-50 border-green-200">
            <CardHeader className="bg-green-100 border-b border-green-200">
              <CardTitle className="flex items-center space-x-2 text-green-800">
                <DollarSign className="h-5 w-5" />
                <span>Fees</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 bg-green-50">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullSongValue">100% Publishing Fee ($)</Label>
                  <Input
                    id="fullSongValue"
                    type="text"
                    value={formatCurrency(form.watch("fullSongValue") || "")}
                    onChange={(e) => {
                      const numericValue = parseFloat(e.target.value.replace(/[$,]/g, "")) || 0;
                      form.setValue("fullSongValue", numericValue);
                      
                      // Auto-calculate our fee based on splits
                      const splitsText = form.watch("splits") || "";
                      if (splitsText) {
                        const ourFee = calculateOurFee(numericValue, splitsText);
                        form.setValue("ourFee", Math.round(ourFee * 100) / 100);
                      }
                    }}
                    placeholder="$0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="ourFee">Our Publishing Fee ($)</Label>
                  <Input
                    id="ourFee"
                    type="text"
                    value={formatCurrency(form.watch("ourFee") || "")}
                    onChange={(e) => {
                      const numericValue = parseFloat(e.target.value.replace(/[$,]/g, "")) || 0;
                      form.setValue("ourFee", numericValue);
                    }}
                    placeholder="$0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullRecordingFee">100% Recording Fee ($)</Label>
                  <Input
                    id="fullRecordingFee"
                    type="text"
                    value={formatCurrency(form.watch("fullRecordingFee") || "")}
                    onChange={(e) => {
                      const numericValue = parseFloat(e.target.value.replace(/[$,]/g, "")) || 0;
                      form.setValue("fullRecordingFee", numericValue);
                      
                      // Auto-calculate our recording fee based on splits
                      const splitsText = form.watch("splits") || "";
                      if (splitsText) {
                        const ourRecordingFee = calculateOurFee(numericValue, splitsText);
                        form.setValue("ourRecordingFee", Math.round(ourRecordingFee * 100) / 100);
                      }
                    }}
                    placeholder="$0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="ourRecordingFee">Our Recording Fee ($)</Label>
                  <Input
                    id="ourRecordingFee"
                    type="text"
                    value={formatCurrency(form.watch("ourRecordingFee") || "")}
                    onChange={(e) => {
                      const numericValue = parseFloat(e.target.value.replace(/[$,]/g, "")) || 0;
                      form.setValue("ourRecordingFee", numericValue);
                    }}
                    placeholder="$0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="exclusivity"
                    checked={form.watch("exclusivity")}
                    onCheckedChange={(checked) => form.setValue("exclusivity", checked)}
                  />
                  <Label htmlFor="exclusivity">Exclusive Deal</Label>
                </div>
                <div>
                  <Label htmlFor="exclusivityRestrictions">Exclusivity Restrictions</Label>
                  <Input
                    id="exclusivityRestrictions"
                    {...form.register("exclusivityRestrictions")}
                    placeholder="Describe any exclusivity restrictions"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="options">Options</Label>
                  <Textarea
                    id="options"
                    {...form.register("options")}
                    placeholder="Additional options, notes, or special terms for this deal"
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Contacts */}
          <Card className="bg-yellow-50 border-yellow-200">
            <CardHeader className="bg-yellow-100 border-b border-yellow-200">
              <CardTitle className="flex items-center space-x-2 text-yellow-800">
                <User className="h-5 w-5" />
                <span>Contacts</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 bg-yellow-50">
              {/* Music Supervisor */}
              <div>
                <h4 className="font-medium mb-3 flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Music Supervisor</span>
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contactId">Supervisor Name *</Label>
                    <div className="flex gap-2">
                      <Select
                        value={form.watch("contactId")?.toString() || ""}
                        onValueChange={(value) => {
                          const contactId = parseInt(value);
                          form.setValue("contactId", contactId);
                          
                          // Auto-fill contact information when supervisor is selected
                          const selectedContact = contacts.find(c => c.id === contactId);
                          if (selectedContact) {
                            form.setValue("musicSupervisorContactName", selectedContact.company || "");
                            form.setValue("musicSupervisorContactEmail", selectedContact.email || "");
                            form.setValue("musicSupervisorContactPhone", selectedContact.phone || "");
                          }
                        }}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select supervisor" />
                        </SelectTrigger>
                        <SelectContent>
                          {contacts.filter(contact => 
                            contact.role && (
                              contact.role.toLowerCase().includes('music supervisor') ||
                              contact.role.toLowerCase().includes('supervisor')
                            )
                          ).map((contact) => (
                            <SelectItem key={contact.id} value={contact.id.toString()}>
                              {contact.name} {contact.company && `(${contact.company})`}
                            </SelectItem>
                          ))}
                          <SelectItem value="all">--- Show All Contacts ---</SelectItem>
                          {contacts.filter(contact => 
                            !contact.role || !(
                              contact.role.toLowerCase().includes('music supervisor') ||
                              contact.role.toLowerCase().includes('supervisor')
                            )
                          ).map((contact) => (
                            <SelectItem key={contact.id} value={contact.id.toString()}>
                              {contact.name} {contact.company && `(${contact.company})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAddContact(true)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {form.formState.errors.contactId && (
                      <p className="text-sm text-red-600 mt-1">{form.formState.errors.contactId.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="musicSupervisorContactName">Company Name</Label>
                    <Input
                      id="musicSupervisorContactName"
                      {...form.register("musicSupervisorContactName")}
                      placeholder="Music company name"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label htmlFor="musicSupervisorContactEmail">Email</Label>
                    <Input
                      id="musicSupervisorContactEmail"
                      type="email"
                      {...form.register("musicSupervisorContactEmail")}
                      placeholder="supervisor@company.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="musicSupervisorContactPhone">Phone</Label>
                    <Input
                      id="musicSupervisorContactPhone"
                      {...form.register("musicSupervisorContactPhone")}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
              </div>

              {/* Licensee / Production Company */}
              <Separator />
              <div>
                <h4 className="font-medium mb-3 flex items-center space-x-2">
                  <Building className="h-4 w-4" />
                  <span>Licensee / Production Company</span>
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="licenseeCompanyName">Company Name</Label>
                    <Input
                      id="licenseeCompanyName"
                      {...form.register("licenseeCompanyName")}
                      placeholder="Production company name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="licenseeContactName">Contact Name</Label>
                    <Input
                      id="licenseeContactName"
                      {...form.register("licenseeContactName")}
                      placeholder="Contact person name"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div>
                    <Label htmlFor="licenseeContactEmail">Email</Label>
                    <Input
                      id="licenseeContactEmail"
                      type="email"
                      {...form.register("licenseeContactEmail")}
                      placeholder="contact@company.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="licenseeContactPhone">Phone</Label>
                    <Input
                      id="licenseeContactPhone"
                      {...form.register("licenseeContactPhone")}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="licenseeAddress">Address</Label>
                    <Input
                      id="licenseeAddress"
                      {...form.register("licenseeAddress")}
                      placeholder="Company address"
                    />
                  </div>
                </div>
              </div>

              {/* Clearance Company */}
              <Separator />
              <div>
                <h4 className="font-medium mb-3 flex items-center space-x-2">
                  <Building className="h-4 w-4" />
                  <span>Clearance Company</span>
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="clearanceCompanyName">Company Name</Label>
                    <Input
                      id="clearanceCompanyName"
                      {...form.register("clearanceCompanyName")}
                      placeholder="Clearance company name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="clearanceCompanyContactName">Contact Name</Label>
                    <Input
                      id="clearanceCompanyContactName"
                      {...form.register("clearanceCompanyContactName")}
                      placeholder="Contact person name"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div>
                    <Label htmlFor="clearanceCompanyContactEmail">Email</Label>
                    <Input
                      id="clearanceCompanyContactEmail"
                      type="email"
                      {...form.register("clearanceCompanyContactEmail")}
                      placeholder="clearance@company.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="clearanceCompanyContactPhone">Phone</Label>
                    <Input
                      id="clearanceCompanyContactPhone"
                      {...form.register("clearanceCompanyContactPhone")}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="clearanceCompanyAddress">Address</Label>
                    <Input
                      id="clearanceCompanyAddress"
                      {...form.register("clearanceCompanyAddress")}
                      placeholder="Company address"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 4: Additional Information */}
          <Card className="bg-green-50 border-green-200">
            <CardHeader className="bg-green-100 border-b border-green-200">
              <CardTitle className="flex items-center space-x-2 text-green-800">
                <FileText className="h-5 w-5" />
                <span>Additional Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 bg-green-50">
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  {...form.register("notes")}
                  placeholder="Additional notes about the deal"
                  rows={3}
                />
              </div>

              {/* Status Date Fields */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Status Dates</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pitchedDate">New Request Date</Label>
                    <Input
                      id="pitchedDate"
                      type="datetime-local"
                      {...form.register("pitchedDate")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="pendingApprovalDate">Pending Approval Date</Label>
                    <Input
                      id="pendingApprovalDate"
                      type="datetime-local"
                      {...form.register("pendingApprovalDate")}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label htmlFor="quotedDate">Quoted Date</Label>
                    <Input
                      id="quotedDate"
                      type="datetime-local"
                      {...form.register("quotedDate")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="useConfirmedDate">Use Confirmed Date</Label>
                    <Input
                      id="useConfirmedDate"
                      type="datetime-local"
                      {...form.register("useConfirmedDate")}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label htmlFor="beingDraftedDate">Being Drafted Date</Label>
                    <Input
                      id="beingDraftedDate"
                      type="datetime-local"
                      {...form.register("beingDraftedDate")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="outForSignatureDate">Out for Signature Date</Label>
                    <Input
                      id="outForSignatureDate"
                      type="datetime-local"
                      {...form.register("outForSignatureDate")}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label htmlFor="paymentReceivedDate">Payment Received Date</Label>
                    <Input
                      id="paymentReceivedDate"
                      type="datetime-local"
                      {...form.register("paymentReceivedDate")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="completedDate">Completed Date</Label>
                    <Input
                      id="completedDate"
                      type="datetime-local"
                      {...form.register("completedDate")}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createDealMutation.isPending}>
              {createDealMutation.isPending ? "Creating..." : isEditing ? "Update Deal" : "Create Deal"}
            </Button>
          </div>
        </form>
      </DialogContent>
      
      {/* Add Contact Form */}
      <AddContactForm 
        open={showAddContact}
        onClose={() => setShowAddContact(false)}
        onContactCreated={(newContact) => {
          console.log("New contact created:", newContact);
          
          // Refresh contacts query
          queryClient.invalidateQueries({ queryKey: ['/api/contacts'] });
          
          // Auto-select the new contact and fill form
          setTimeout(() => {
            form.setValue("contactId", newContact.id);
            form.setValue("musicSupervisorContactName", newContact.company || "");
            form.setValue("musicSupervisorContactEmail", newContact.email || "");
            form.setValue("musicSupervisorContactPhone", newContact.phone || "");
            
            // Trigger form update
            form.trigger(['contactId', 'musicSupervisorContactName', 'musicSupervisorContactEmail', 'musicSupervisorContactPhone']);
          }, 100);
          
          setShowAddContact(false);
        }}
        defaultRole="Music Supervisor"
      />
    </Dialog>
  );
}