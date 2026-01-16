import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { insertDealSchema, insertContactSchema, type InsertDeal, type InsertContact, type Song, type Contact } from "@shared/schema";
import { Plus, Building, User, FileText, DollarSign, X, Check, ChevronsUpDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import AddContactForm from "@/components/forms/add-contact-form";
import ComprehensiveSongForm from "@/components/forms/comprehensive-song-form";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Currency formatting functions
const formatCurrency = (value: string | number, showZero: boolean = false) => {
  if (!value && value !== 0) return '';
  const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]+/g, '')) : value;
  if (isNaN(numValue)) return '';
  if (numValue === 0 && !showZero) return '';
  return '$ ' + numValue.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

// Currency input component that allows natural typing
interface CurrencyInputProps {
  id: string;
  value: number | null | undefined;
  onChange: (value: number) => void;
  placeholder?: string;
}

function CurrencyInput({ id, value, onChange, placeholder = "$0.00" }: CurrencyInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [localValue, setLocalValue] = useState("");

  const numValue = value ?? undefined;

  useEffect(() => {
    if (!isFocused) {
      setLocalValue(numValue ? numValue.toString() : "");
    }
  }, [numValue, isFocused]);

  const handleFocus = () => {
    setIsFocused(true);
    setLocalValue(numValue ? numValue.toString() : "");
  };

  const handleBlur = () => {
    setIsFocused(false);
    const numericValue = parseFloat(localValue.replace(/[^0-9.-]/g, "")) || 0;
    onChange(numericValue);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    // Allow digits, decimal point, and comma for user convenience
    const cleanValue = rawValue.replace(/[^0-9.,]/g, "");
    setLocalValue(cleanValue);
    // Also update form value in real-time for calculations
    const numericValue = parseFloat(cleanValue.replace(/,/g, "")) || 0;
    onChange(numericValue);
  };

  const displayValue = isFocused 
    ? localValue 
    : formatCurrency(numValue || "", false);

  return (
    <Input
      id={id}
      type="text"
      value={displayValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder={placeholder}
    />
  );
}

interface ComprehensiveAddDealFormProps {
  open: boolean;
  onClose: () => void;
  deal?: any;
}

export default function ComprehensiveAddDealForm({ open, onClose, deal }: ComprehensiveAddDealFormProps) {
  const { toast } = useToast();
  const isEditing = !!deal;
  const [showAddContact, setShowAddContact] = useState(false);
  const [showAddSong, setShowAddSong] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [songSearchOpen, setSongSearchOpen] = useState(false);
  const [songSearchValue, setSongSearchValue] = useState("");
  const justCreatedSongRef = useRef(false); // Flag to prevent dropdown reopening after song creation
  const [contactSearchOpen, setContactSearchOpen] = useState(false);
  const [contactSearchValue, setContactSearchValue] = useState("");

  // State for managing composer-publisher and artist-label data from selected song
  interface ComposerPublisher {
    composer: string;
    publisher: string;
    publishingOwnership: string;
    isMine: boolean;
    jonasShare: string;
    paymentDate: string;
  }
  
  interface ArtistLabel {
    artist: string;
    label: string;
    labelOwnership: string;
    isMine: boolean;
    jonasShare: string;
    paymentDate: string;
  }
  
  const [composerPublishers, setComposerPublishers] = useState<ComposerPublisher[]>([
    { composer: '', publisher: '', publishingOwnership: '', isMine: false, jonasShare: '', paymentDate: '' }
  ]);
  
  const [artistLabels, setArtistLabels] = useState<ArtistLabel[]>([
    { artist: '', label: '', labelOwnership: '', isMine: false, jonasShare: '', paymentDate: '' }
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
      pitchedDate: deal?.pitchedDate ? new Date(deal.pitchedDate).toISOString().slice(0, 10) : undefined,
      pendingApprovalDate: deal?.pendingApprovalDate ? new Date(deal.pendingApprovalDate).toISOString().slice(0, 10) : undefined,
      quotedDate: deal?.quotedDate ? new Date(deal.quotedDate).toISOString().slice(0, 10) : undefined,
      useConfirmedDate: deal?.useConfirmedDate ? new Date(deal.useConfirmedDate).toISOString().slice(0, 10) : undefined,
      beingDraftedDate: deal?.beingDraftedDate ? new Date(deal.beingDraftedDate).toISOString().slice(0, 10) : undefined,
      outForSignatureDate: deal?.outForSignatureDate ? new Date(deal.outForSignatureDate).toISOString().slice(0, 10) : undefined,
      paymentReceivedDate: deal?.paymentReceivedDate ? new Date(deal.paymentReceivedDate).toISOString().slice(0, 10) : undefined,
      completedDate: deal?.completedDate ? new Date(deal.completedDate).toISOString().slice(0, 10) : undefined,
      
      usage: deal?.usage || "",
      sceneDescription: deal?.sceneDescription || "",
      media: deal?.media || "",
      territory: deal?.territory || "Worldwide",
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
      airDate: deal?.airDate ? new Date(deal.airDate).toISOString().split('T')[0] : "",
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
      // Set up selectedSong state for editing
      if (deal.songId && songs.length > 0) {
        const song = songs.find(s => s.id === deal.songId);
        if (song) {
          setSelectedSong(song);
          setSongSearchValue(`${song.title} - ${song.artist}`);
          
          // PRIORITY: Load from deal first (which has jonasShare and paymentDate), fall back to song
          if (deal.composerPublishers && Array.isArray(deal.composerPublishers)) {
            // Use deal's composerPublishers (which includes jonasShare and paymentDate)
            const composerPublishersWithDate = deal.composerPublishers.map((cp: any) => ({
              ...cp,
              jonasShare: cp.jonasShare || '',
              paymentDate: cp.paymentDate || ''
            }));
            setComposerPublishers(composerPublishersWithDate);
          } else if (song.composerPublishers && Array.isArray(song.composerPublishers)) {
            // Fall back to song's composerPublishers
            const composerPublishersWithDate = song.composerPublishers.map((cp: any) => ({
              ...cp,
              jonasShare: cp.jonasShare || '',
              paymentDate: cp.paymentDate || ''
            }));
            setComposerPublishers(composerPublishersWithDate);
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
                isMine: false,
                jonasShare: '',
                paymentDate: ''
              });
            }
            setComposerPublishers(result.length > 0 ? result : [{ composer: '', publisher: '', publishingOwnership: '', isMine: false, jonasShare: '', paymentDate: '' }]);
          }
          
          // PRIORITY: Load from deal first (which has jonasShare and paymentDate), fall back to song
          if (deal.artistLabels && Array.isArray(deal.artistLabels)) {
            // Use deal's artistLabels (which includes jonasShare and paymentDate)
            const artistLabelsWithDate = deal.artistLabels.map((al: any) => ({
              ...al,
              jonasShare: al.jonasShare || '',
              paymentDate: al.paymentDate || ''
            }));
            setArtistLabels(artistLabelsWithDate);
          } else if (song.artistLabels && Array.isArray(song.artistLabels)) {
            // Fall back to song's artistLabels
            const artistLabelsWithDate = song.artistLabels.map((al: any) => ({
              ...al,
              jonasShare: al.jonasShare || '',
              paymentDate: al.paymentDate || ''
            }));
            setArtistLabels(artistLabelsWithDate);
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
                isMine: false,
                jonasShare: '',
                paymentDate: ''
              });
            }
            setArtistLabels(result.length > 0 ? result : [{ artist: '', label: '', labelOwnership: '', isMine: false, jonasShare: '', paymentDate: '' }]);
          }
        }
      }
      
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
        pitchedDate: deal.pitchedDate ? new Date(deal.pitchedDate).toISOString().slice(0, 10) : undefined,
        pendingApprovalDate: deal.pendingApprovalDate ? new Date(deal.pendingApprovalDate).toISOString().slice(0, 10) : undefined,
        quotedDate: deal.quotedDate ? new Date(deal.quotedDate).toISOString().slice(0, 10) : undefined,
        useConfirmedDate: deal.useConfirmedDate ? new Date(deal.useConfirmedDate).toISOString().slice(0, 10) : undefined,
        beingDraftedDate: deal.beingDraftedDate ? new Date(deal.beingDraftedDate).toISOString().slice(0, 10) : undefined,
        outForSignatureDate: deal.outForSignatureDate ? new Date(deal.outForSignatureDate).toISOString().slice(0, 10) : undefined,
        paymentReceivedDate: deal.paymentReceivedDate ? new Date(deal.paymentReceivedDate).toISOString().slice(0, 10) : undefined,
        completedDate: deal.completedDate ? new Date(deal.completedDate).toISOString().slice(0, 10) : undefined,
        
        usage: deal.usage || "",
        sceneDescription: deal.sceneDescription || "",
        media: deal.media || "",
        territory: deal.territory || "Worldwide",
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
        airDate: deal.airDate ? new Date(deal.airDate).toISOString().split('T')[0] : "",
      });
    }
  }, [deal, form, songs]);

  const createDealMutation = useMutation({
    mutationFn: async (data: InsertDeal) => {
      const response = await apiRequest(isEditing ? `/api/deals/${deal.id}` : '/api/deals', { 
        method: isEditing ? 'PATCH' : 'POST', 
        body: data 
      });
      return response.json();
    },
    onSuccess: async (newDeal) => {
      console.log("Deal update successful:", newDeal);
      
      // Invalidate multiple cache keys
      await queryClient.invalidateQueries({ queryKey: ['/api/deals'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/deals', deal?.id] });
      
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

  // Function to calculate our fee based on actual ownership percentages
  const calculateOurFeeFromOwnership = (fullFee: number, ownershipPercentage: number): number => {
    if (!fullFee || fullFee === 0) return 0;
    return (fullFee * ownershipPercentage) / 100;
  };

  // Recalculate recording fee when artistLabels ownership changes
  useEffect(() => {
    const fullRecordingFee = form.watch("fullRecordingFee");
    if (fullRecordingFee && fullRecordingFee > 0) {
      const ourOwnershipTotal = artistLabels
        .filter(al => al.isMine)
        .reduce((sum, al) => {
          const ownership = parseFloat(al.labelOwnership) || 0;
          return sum + ownership;
        }, 0);
      
      if (ourOwnershipTotal > 0) {
        const ourRecordingFee = calculateOurFeeFromOwnership(fullRecordingFee, ourOwnershipTotal);
        form.setValue("ourRecordingFee", Math.round(ourRecordingFee * 100) / 100);
      }
    }
  }, [artistLabels]);

  const onSubmit = (data: InsertDeal) => {
    console.log("Form submission data:", data);
    
    // Validate required fields manually
    if (!data.projectName || !data.projectType || !data.songId) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields (Project Name, Project Type, and Song Title).",
        variant: "destructive",
      });
      return;
    }
    
    // Include composerPublishers and artistLabels data with jonasShare values
    const submissionData = {
      ...data,
      composerPublishers: composerPublishers,
      artistLabels: artistLabels,
    };
    
    createDealMutation.mutate(submissionData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto p-2 text-sm">
        <DialogHeader>
          <DialogTitle className="text-lg">{isEditing ? "Edit Deal" : "Add New Deal"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2 pb-6 [&_.card-title]:text-sm [&_.card-title]:py-0.5 [&_label]:text-xs [&_input]:h-8 [&_input]:text-xs [&_textarea]:text-xs [&_select]:h-8 [&_select]:text-xs">
          {/* Section 1: Project Information */}
          <Card className="bg-purple-50 border-purple-200">
            <CardHeader className="bg-purple-100 border-b border-purple-200 py-0.5 px-3">
              <CardTitle className="flex items-center space-x-1 text-purple-800 text-sm">
                <FileText className="h-4 w-4" />
                <span>Project Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 bg-purple-50 p-1.5">
              <div className="grid grid-cols-3 gap-2">
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
                      <SelectItem value="internet">Internet</SelectItem>
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
                  rows={1}
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={form.watch("status")}
                    onValueChange={(value) => {
                      form.setValue("status", value);
                      
                      // Auto-populate corresponding date when status changes
                      const currentDate = new Date().toISOString().slice(0, 10); // Format: YYYY-MM-DD
                      
                      switch (value) {
                        case "new request":
                          form.setValue("pitchedDate", currentDate, { shouldValidate: true, shouldDirty: true });
                          break;
                        case "pending approval":
                          form.setValue("pendingApprovalDate", currentDate, { shouldValidate: true, shouldDirty: true });
                          break;
                        case "quoted":
                          form.setValue("quotedDate", currentDate, { shouldValidate: true, shouldDirty: true });
                          break;
                        case "use confirmed":
                          form.setValue("useConfirmedDate", currentDate, { shouldValidate: true, shouldDirty: true });
                          break;
                        case "being drafted":
                          form.setValue("beingDraftedDate", currentDate, { shouldValidate: true, shouldDirty: true });
                          break;
                        case "out for signature":
                          form.setValue("outForSignatureDate", currentDate, { shouldValidate: true, shouldDirty: true });
                          break;
                        case "payment received":
                          form.setValue("paymentReceivedDate", currentDate, { shouldValidate: true, shouldDirty: true });
                          break;
                        case "completed":
                          form.setValue("completedDate", currentDate, { shouldValidate: true, shouldDirty: true });
                          break;
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ballpark">Ballpark</SelectItem>
                      <SelectItem value="new request">New Request</SelectItem>
                      <SelectItem value="pending approval">Pending Approval</SelectItem>
                      <SelectItem value="quoted">Quoted</SelectItem>
                      <SelectItem value="use confirmed">Use Confirmed</SelectItem>
                      <SelectItem value="being drafted">Being Drafted</SelectItem>
                      <SelectItem value="out for signature">Out for Signature</SelectItem>
                      <SelectItem value="payment received">Payment Received</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="not used">Not Used</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="ballpark">Ballpark</Label>
                  <Select
                    value={form.watch("ballpark") || ""}
                    onValueChange={(value) => form.setValue("ballpark", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select ballpark" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="$500-$1,000">$500-$1,000</SelectItem>
                      <SelectItem value="$1,000-$2,500">$1,000-$2,500</SelectItem>
                      <SelectItem value="$2,500-$5,000">$2,500-$5,000</SelectItem>
                      <SelectItem value="$5,000-$10,000">$5,000-$10,000</SelectItem>
                      <SelectItem value="$10,000-$25,000">$10,000-$25,000</SelectItem>
                      <SelectItem value="$25,000-$50,000">$25,000-$50,000</SelectItem>
                      <SelectItem value="$50,000+">$50,000+</SelectItem>
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
            <CardHeader className="bg-blue-100 border-b border-blue-200 py-0.5 px-2">
              <CardTitle className="flex items-center space-x-1 text-blue-800 text-sm">
                <span>🎵</span>
                <span>Song Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 bg-blue-50 p-1.5">
              {selectedSong ? (
                <div className="space-y-1">
                  {/* First line: Title, Album */}
                  <div className="grid grid-cols-2 gap-2 pb-10">
                    <div className="relative">
                      <div className="flex items-center justify-between mb-1">
                        <Label htmlFor="songId">Title *</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowAddSong(true)}
                          className="h-6 px-2 text-xs text-blue-600 hover:text-blue-800"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Song
                        </Button>
                      </div>
                      <Command className="rounded-lg border shadow-md">
                        <CommandInput 
                          placeholder="Type to search songs..."
                          value={songSearchValue}
                          onValueChange={setSongSearchValue}
                          onFocus={() => {
                            // Don't reopen if we just created a song
                            if (!justCreatedSongRef.current) {
                              setSongSearchOpen(true);
                            }
                          }}
                          onBlur={() => {
                            // Delay to allow click on item
                            setTimeout(() => {
                              if (!form.watch("songId")) {
                                setSongSearchOpen(false);
                              }
                            }, 200);
                          }}
                        />
                        {songSearchOpen && !justCreatedSongRef.current && (
                          <CommandList>
                            <CommandEmpty>No song found.</CommandEmpty>
                            <CommandGroup>
                              {songs.map((song) => (
                                <CommandItem
                                  key={song.id}
                                  value={`${song.title} ${song.artist}`}
                                  onSelect={() => {
                                      const songId = song.id;
                                      form.setValue("songId", songId);
                                      setSongSearchValue(`${song.title} - ${song.artist}`);
                                      setSongSearchOpen(false);
                                      
                                      // Auto-populate comprehensive song information from database
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
                                        // Ensure paymentDate and jonasShare fields exist for each item
                                        const composerPublishersWithDate = song.composerPublishers.map(cp => ({
                                          ...cp,
                                          jonasShare: cp.jonasShare || '',
                                          paymentDate: cp.paymentDate || ''
                                        }));
                                        setComposerPublishers(composerPublishersWithDate);
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
                                            isMine: false,
                                            jonasShare: '',
                                            paymentDate: ''
                                          });
                                        }
                                        setComposerPublishers(result.length > 0 ? result : [{ composer: '', publisher: '', publishingOwnership: '', isMine: false, jonasShare: '', paymentDate: '' }]);
                                      }
                                      
                                      // Load artist-label data if available
                                      if (song.artistLabels && Array.isArray(song.artistLabels)) {
                                        // Ensure paymentDate and jonasShare fields exist for each item
                                        const artistLabelsWithDate = song.artistLabels.map(al => ({
                                          ...al,
                                          jonasShare: al.jonasShare || '',
                                          paymentDate: al.paymentDate || ''
                                        }));
                                        setArtistLabels(artistLabelsWithDate);
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
                                            isMine: false,
                                            jonasShare: '',
                                            paymentDate: ''
                                          });
                                        }
                                        setArtistLabels(result.length > 0 ? result : [{ artist: '', label: '', labelOwnership: '', isMine: false, jonasShare: '', paymentDate: '' }]);
                                      }
                                      
                                      // Use actual split details if available, otherwise calculate from ownership data
                                      if (song.splitDetails) {
                                        form.setValue("splits", song.splitDetails);
                                      } else {
                                        // Calculate splits from actual ownership percentages
                                        const publishingOwnership = parseFloat(song.publishingOwnership?.toString() || '0');
                                        const publisherOwnership = 100 - publishingOwnership;
                                        form.setValue("splits", `${publishingOwnership}% Writer / ${publisherOwnership}% Publisher`);
                                      }
                                      
                                      // Artist/Label splits from actual ownership data
                                      const masterOwnership = parseFloat(song.masterOwnership?.toString() || '0');
                                      const labelOwnership = 100 - masterOwnership;
                                      form.setValue("artistLabelSplits", `${masterOwnership}% Artist / ${labelOwnership}% Label`);
                                      
                                      // Auto-populate restrictions if available
                                      if (song.restrictions) {
                                        form.setValue("restrictions", song.restrictions);
                                      }
                                    }}
                                  >
                                  {song.title} - {song.artist}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        )}
                      </Command>
                      {form.formState.errors.songId && (
                        <p className="text-sm text-red-600 mt-1">{form.formState.errors.songId.message}</p>
                      )}
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
                  <div className="grid grid-cols-2 gap-2">
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
                  
                  {/* Publishing Information */}
                  <Card className="bg-green-50 border-green-200">
                    <CardHeader className="bg-green-100 border-b border-green-200 py-0.5 px-2">
                      <CardTitle className="text-green-800 text-sm">Publishing Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1 bg-green-50 p-2">
                      <div>
                        <Label className="text-xs font-semibold">Composer(s), Publisher(s) & Ownership</Label>
                        <div className="space-y-1.5 mt-1.5">
                          <div className="grid grid-cols-12 gap-1 text-xs font-medium text-green-700">
                            <div className="col-span-2">Composer Name</div>
                            <div className="col-span-2">Publisher</div>
                            <div className="col-span-1">%</div>
                            <div className="col-span-1">Jonas</div>
                            <div className="col-span-2">100% Fee</div>
                            <div className="col-span-2">Jonas Share</div>
                            <div className="col-span-2">Payment Date</div>
                          </div>
                          {(() => {
                            const fullSongValue = form.watch("fullSongValue") || 0;
                            return composerPublishers.map((item, index) => {
                              const ownership = parseFloat(item.publishingOwnership) || 0;
                              const fee = (fullSongValue * ownership) / 100;
                              
                              return (
                                <div key={index} className="grid grid-cols-12 gap-2">
                                  <div className="col-span-2">
                                    <Input
                                      value={item.composer}
                                      readOnly
                                      className="bg-green-25 cursor-not-allowed text-xs"
                                    />
                                  </div>
                                  <div className="col-span-2">
                                    <Input
                                      value={item.publisher}
                                      readOnly
                                      className="bg-green-25 cursor-not-allowed text-xs"
                                    />
                                  </div>
                                  <div className="col-span-1">
                                    <Input
                                      value={item.publishingOwnership}
                                      readOnly
                                      className="bg-green-25 cursor-not-allowed text-xs"
                                    />
                                  </div>
                                  <div className="col-span-1 flex justify-center items-center">
                                    <Checkbox
                                      checked={item.isMine}
                                      disabled
                                    />
                                  </div>
                                  <div className="col-span-2">
                                    <Input
                                      value={formatCurrency(fee, true)}
                                      readOnly
                                      className="bg-green-25 cursor-not-allowed text-xs"
                                    />
                                  </div>
                                  <div className="col-span-2">
                                    <div className="relative">
                                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-600">$</span>
                                      <Input
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={item.jonasShare || ''}
                                        onChange={(e) => {
                                          const newComposerPublishers = [...composerPublishers];
                                          newComposerPublishers[index].jonasShare = e.target.value;
                                          setComposerPublishers(newComposerPublishers);
                                        }}
                                        className="bg-white text-xs pl-5"
                                      />
                                    </div>
                                  </div>
                                  <div className="col-span-2">
                                    <Input
                                      type="date"
                                      value={item.paymentDate || ''}
                                      onChange={(e) => {
                                        const newComposerPublishers = [...composerPublishers];
                                        newComposerPublishers[index].paymentDate = e.target.value;
                                        setComposerPublishers(newComposerPublishers);
                                      }}
                                      className="bg-white text-xs"
                                    />
                                  </div>
                                </div>
                              );
                            });
                          })()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Label Information */}
                  <Card className="bg-blue-50 border-blue-200">
                    <CardHeader className="bg-blue-100 border-b border-blue-200 py-0.5 px-2">
                      <CardTitle className="text-blue-800 text-sm">Label Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1 bg-blue-50 p-2">
                      <div>
                        <Label className="text-xs font-semibold">Artist(s), Label(s) & Ownership</Label>
                        <div className="space-y-1.5 mt-1.5">
                          <div className="grid grid-cols-12 gap-1 text-xs font-medium text-blue-700">
                            <div className="col-span-2">Artist Name</div>
                            <div className="col-span-2">Label</div>
                            <div className="col-span-1">%</div>
                            <div className="col-span-1">Jonas</div>
                            <div className="col-span-2">100% Fee</div>
                            <div className="col-span-2">Jonas Share</div>
                            <div className="col-span-2">Payment Date</div>
                          </div>
                          {(() => {
                            const fullRecordingFee = form.watch("fullRecordingFee") || 0;
                            return artistLabels.map((item, index) => {
                              const ownership = parseFloat(item.labelOwnership) || 0;
                              const fee = (fullRecordingFee * ownership) / 100;
                              
                              return (
                                <div key={index} className="grid grid-cols-12 gap-2">
                                  <div className="col-span-2">
                                    <Input
                                      value={item.artist}
                                      readOnly
                                      className="bg-blue-25 cursor-not-allowed text-xs"
                                    />
                                  </div>
                                  <div className="col-span-2">
                                    <Input
                                      value={item.label}
                                      readOnly
                                      className="bg-blue-25 cursor-not-allowed text-xs"
                                    />
                                  </div>
                                  <div className="col-span-1">
                                    <Input
                                      value={item.labelOwnership}
                                      readOnly
                                      className="bg-blue-25 cursor-not-allowed text-xs"
                                    />
                                  </div>
                                  <div className="col-span-1 flex justify-center items-center">
                                    <Checkbox
                                      checked={item.isMine}
                                      disabled
                                    />
                                  </div>
                                  <div className="col-span-2">
                                    <Input
                                      value={formatCurrency(fee, true)}
                                      readOnly
                                      className="bg-blue-25 cursor-not-allowed text-xs"
                                    />
                                  </div>
                                  <div className="col-span-2">
                                    <div className="relative">
                                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-600">$</span>
                                      <Input
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={item.jonasShare || ''}
                                        onChange={(e) => {
                                          const newArtistLabels = [...artistLabels];
                                          newArtistLabels[index].jonasShare = e.target.value;
                                          setArtistLabels(newArtistLabels);
                                        }}
                                      className="bg-white text-xs pl-5"
                                    />
                                    </div>
                                  </div>
                                  <div className="col-span-2">
                                    <Input
                                      type="date"
                                      value={item.paymentDate || ''}
                                      onChange={(e) => {
                                        const newArtistLabels = [...artistLabels];
                                        newArtistLabels[index].paymentDate = e.target.value;
                                        setArtistLabels(newArtistLabels);
                                      }}
                                      className="bg-white text-xs"
                                    />
                                  </div>
                                </div>
                              );
                            });
                          })()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                </div>
              ) : (
                <div className="relative">
                  <div className="flex items-center justify-between mb-1">
                    <Label htmlFor="songId">Title *</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAddSong(true)}
                      className="h-6 px-2 text-xs text-blue-600 hover:text-blue-800"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Song
                    </Button>
                  </div>
                  <Command className="rounded-lg border shadow-md">
                    <CommandInput 
                      placeholder="Type to search songs..."
                      value={songSearchValue}
                      onValueChange={setSongSearchValue}
                      onFocus={() => {
                        // Don't reopen if we just created a song
                        if (!justCreatedSongRef.current) {
                          setSongSearchOpen(true);
                        }
                      }}
                      onBlur={() => {
                        // Delay to allow click on item
                        setTimeout(() => {
                          if (!form.watch("songId")) {
                            setSongSearchOpen(false);
                          }
                        }, 200);
                      }}
                    />
                    {songSearchOpen && !justCreatedSongRef.current && (
                      <CommandList>
                        <CommandEmpty>No song found.</CommandEmpty>
                        <CommandGroup>
                          {songs.map((song) => (
                            <CommandItem
                              key={song.id}
                              value={`${song.title} ${song.artist}`}
                              onSelect={() => {
                                  const songId = song.id;
                                  form.setValue("songId", songId);
                                  setSongSearchValue(`${song.title} - ${song.artist}`);
                                  setSongSearchOpen(false);
                                  
                                  // Auto-populate comprehensive song information from database
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
                                    // Ensure paymentDate and jonasShare fields exist for each item
                                    const composerPublishersWithDate = song.composerPublishers.map(cp => ({
                                      ...cp,
                                      jonasShare: cp.jonasShare || '',
                                      paymentDate: cp.paymentDate || ''
                                    }));
                                    setComposerPublishers(composerPublishersWithDate);
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
                                        isMine: false,
                                        jonasShare: '',
                                        paymentDate: ''
                                      });
                                    }
                                    setComposerPublishers(result.length > 0 ? result : [{ composer: '', publisher: '', publishingOwnership: '', isMine: false, jonasShare: '', paymentDate: '' }]);
                                  }
                                  
                                  // Load artist-label data if available
                                  if (song.artistLabels && Array.isArray(song.artistLabels)) {
                                    // Ensure paymentDate and jonasShare fields exist for each item
                                    const artistLabelsWithDate = song.artistLabels.map(al => ({
                                      ...al,
                                      jonasShare: al.jonasShare || '',
                                      paymentDate: al.paymentDate || ''
                                    }));
                                    setArtistLabels(artistLabelsWithDate);
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
                                        isMine: false,
                                        jonasShare: '',
                                        paymentDate: ''
                                      });
                                    }
                                    setArtistLabels(result.length > 0 ? result : [{ artist: '', label: '', labelOwnership: '', isMine: false, jonasShare: '', paymentDate: '' }]);
                                  }
                                  
                                  // Use actual split details if available, otherwise calculate from ownership data
                                  if (song.splitDetails) {
                                    form.setValue("splits", song.splitDetails);
                                  } else {
                                    // Calculate splits from actual ownership percentages
                                    const publishingOwnership = parseFloat(song.publishingOwnership?.toString() || '0');
                                    const publisherOwnership = 100 - publishingOwnership;
                                    form.setValue("splits", `${publishingOwnership}% Writer / ${publisherOwnership}% Publisher`);
                                  }
                                  
                                  // Artist/Label splits from actual ownership data
                                  const masterOwnership = parseFloat(song.masterOwnership?.toString() || '0');
                                  const labelOwnership = 100 - masterOwnership;
                                  form.setValue("artistLabelSplits", `${masterOwnership}% Artist / ${labelOwnership}% Label`);
                                  
                                  // Auto-populate restrictions if available
                                  if (song.restrictions) {
                                    form.setValue("restrictions", song.restrictions);
                                  }
                                }}
                              >
                              {song.title} - {song.artist}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    )}
                  </Command>
                  {form.formState.errors.songId && (
                    <p className="text-sm text-red-600 mt-1">{form.formState.errors.songId.message}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Deal Terms */}
          {selectedSong && (
            <Card className="bg-orange-50 border-orange-200">
              <CardHeader className="bg-orange-100 border-b border-orange-200 py-0.5 px-2">
                <CardTitle className="text-orange-800 text-sm">Deal Terms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 bg-orange-50 p-1.5">
                <div className="grid grid-cols-2 gap-2">
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
                      rows={2}
                      className="min-h-[60px]"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <Label htmlFor="media">Media</Label>
                  <Textarea
                    id="media"
                    {...form.register("media")}
                    placeholder="e.g., TV, Film, Streaming, All media and devices..."
                    rows={2}
                    className="min-h-[60px]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
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
                    <Input
                      id="territory"
                      {...form.register("territory")}
                      placeholder="e.g., Worldwide, North America, etc."
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="options">Options</Label>
                  <Input
                    id="options"
                    {...form.register("options")}
                    placeholder="Enter options"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Fees Section */}
          <Card className="bg-green-50 border-green-200">
            <CardHeader className="bg-green-100 border-b border-green-200 py-0.5 px-2">
              <CardTitle className="flex items-center space-x-1 text-green-800 text-sm">
                <DollarSign className="h-4 w-4" />
                <span>Fees</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 bg-green-50 p-1.5">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="fullSongValue">100% Publishing Fee ($)</Label>
                  <CurrencyInput
                    id="fullSongValue"
                    value={form.watch("fullSongValue")}
                    onChange={(numericValue) => {
                      form.setValue("fullSongValue", numericValue);
                      
                      // Auto-calculate our fee based on actual publishing ownership percentage
                      if (selectedSong && selectedSong.publishingOwnership) {
                        const ownershipPct = parseFloat(selectedSong.publishingOwnership.toString());
                        const ourFee = calculateOurFeeFromOwnership(numericValue, ownershipPct);
                        form.setValue("ourFee", Math.round(ourFee * 100) / 100);
                      } else {
                        // Fallback to splits text parsing if no ownership data
                        const splitsText = form.watch("splits") || "";
                        if (splitsText) {
                          const ourFee = calculateOurFee(numericValue, splitsText);
                          form.setValue("ourFee", Math.round(ourFee * 100) / 100);
                        }
                      }
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="ourFee">Our Publishing Fee ($)</Label>
                  <CurrencyInput
                    id="ourFee"
                    value={form.watch("ourFee")}
                    onChange={(numericValue) => {
                      form.setValue("ourFee", numericValue);
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="fullRecordingFee">100% Recording Fee ($)</Label>
                  <CurrencyInput
                    id="fullRecordingFee"
                    value={form.watch("fullRecordingFee")}
                    onChange={(numericValue) => {
                      form.setValue("fullRecordingFee", numericValue);
                      
                      // Calculate our recording fee by summing ownership from checked artist/label rows
                      const ourOwnershipTotal = artistLabels
                        .filter(al => al.isMine)
                        .reduce((sum, al) => {
                          const ownership = parseFloat(al.labelOwnership) || 0;
                          return sum + ownership;
                        }, 0);
                      
                      if (ourOwnershipTotal > 0) {
                        const ourRecordingFee = calculateOurFeeFromOwnership(numericValue, ourOwnershipTotal);
                        form.setValue("ourRecordingFee", Math.round(ourRecordingFee * 100) / 100);
                      } else if (selectedSong && selectedSong.masterOwnership) {
                        // Fallback to song's master ownership if no artist/label splits checked
                        const ownershipPct = parseFloat(selectedSong.masterOwnership.toString());
                        const ourRecordingFee = calculateOurFeeFromOwnership(numericValue, ownershipPct);
                        form.setValue("ourRecordingFee", Math.round(ourRecordingFee * 100) / 100);
                      } else {
                        // Final fallback to artist/label splits text parsing
                        const artistLabelSplitsText = form.watch("artistLabelSplits") || "";
                        if (artistLabelSplitsText) {
                          const ourRecordingFee = calculateOurFee(numericValue, artistLabelSplitsText);
                          form.setValue("ourRecordingFee", Math.round(ourRecordingFee * 100) / 100);
                        }
                      }
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="ourRecordingFee">Our Recording Fee ($)</Label>
                  <CurrencyInput
                    id="ourRecordingFee"
                    value={form.watch("ourRecordingFee")}
                    onChange={(numericValue) => {
                      form.setValue("ourRecordingFee", numericValue);
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="exclusivity"
                    checked={form.watch("exclusivity") ?? false}
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
            </CardContent>
          </Card>

          {/* Section 3: Contacts */}
          <Card className="bg-yellow-50 border-yellow-200">
            <CardHeader className="bg-yellow-100 border-b border-yellow-200 py-0.5 px-2">
              <CardTitle className="flex items-center space-x-1 text-yellow-800 text-sm">
                <User className="h-4 w-4" />
                <span>Contacts</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 bg-yellow-50 p-1.5">
              {/* Music Supervisor */}
              <div>
                <h4 className="font-medium mb-1 flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Music Supervisor</span>
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="contactId">Supervisor Name</Label>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Command className="rounded-lg border shadow-md">
                          <CommandInput 
                            placeholder="Type to search contacts..."
                            value={contactSearchValue}
                            onValueChange={setContactSearchValue}
                            onFocus={() => setContactSearchOpen(true)}
                            onBlur={() => {
                              setTimeout(() => {
                                setContactSearchOpen(false);
                              }, 200);
                            }}
                          />
                          {contactSearchOpen && (
                            <CommandList>
                              <CommandEmpty>No contact found.</CommandEmpty>
                              <CommandGroup>
                                {contacts.map((contact) => (
                                  <CommandItem
                                    key={contact.id}
                                    value={`${contact.name} ${contact.company || ''}`}
                                    onSelect={() => {
                                      const contactId = contact.id;
                                      form.setValue("contactId", contactId);
                                      setContactSearchValue(`${contact.name}${contact.company ? ` (${contact.company})` : ''}`);
                                      setContactSearchOpen(false);
                                      
                                      // Auto-fill contact information when supervisor is selected
                                      form.setValue("musicSupervisorContactName", contact.company || "");
                                      form.setValue("musicSupervisorContactEmail", contact.email || "");
                                      form.setValue("musicSupervisorContactPhone", contact.phone || "");
                                    }}
                                  >
                                    {contact.name} {contact.company && `(${contact.company})`}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          )}
                        </Command>
                      </div>
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
                <div className="grid grid-cols-2 gap-2 mt-2">
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
                <h4 className="font-medium mb-1 flex items-center space-x-2">
                  <Building className="h-4 w-4" />
                  <span>Licensee / Production Company</span>
                </h4>
                <div className="grid grid-cols-2 gap-2">
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
                <div className="grid grid-cols-3 gap-2 mt-4">
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
                <h4 className="font-medium mb-1 flex items-center space-x-2">
                  <Building className="h-4 w-4" />
                  <span>Clearance Company</span>
                </h4>
                <div className="grid grid-cols-2 gap-2">
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
                <div className="grid grid-cols-3 gap-2 mt-4">
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
          <Card className="bg-red-50 border-red-200">
            <CardHeader className="bg-red-100 border-b border-red-200 py-0.5 px-2">
              <CardTitle className="flex items-center space-x-1 text-red-800 text-sm">
                <FileText className="h-4 w-4" />
                <span>Additional Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 bg-red-50 p-1.5">
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  {...form.register("notes")}
                  placeholder="Additional notes about the deal"
                  rows={2}
                />
              </div>

              {/* Status Date Fields */}
              <div className="border-t pt-2">
                <h4 className="font-medium mb-2">Status Dates</h4>
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <Label htmlFor="pitchedDate" className="text-sm">New Request</Label>
                    <Input
                      id="pitchedDate"
                      type="date"
                      {...form.register("pitchedDate")}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pendingApprovalDate" className="text-sm">Pending Approval</Label>
                    <Input
                      id="pendingApprovalDate"
                      type="date"
                      {...form.register("pendingApprovalDate")}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="quotedDate" className="text-sm">Quoted</Label>
                    <Input
                      id="quotedDate"
                      type="date"
                      {...form.register("quotedDate")}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="useConfirmedDate" className="text-sm">Use Confirmed</Label>
                    <Input
                      id="useConfirmedDate"
                      type="date"
                      {...form.register("useConfirmedDate")}
                      className="text-sm"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-3 mt-2">
                  <div>
                    <Label htmlFor="beingDraftedDate" className="text-sm">Being Drafted</Label>
                    <Input
                      id="beingDraftedDate"
                      type="date"
                      {...form.register("beingDraftedDate")}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="outForSignatureDate" className="text-sm">Out for Signature</Label>
                    <Input
                      id="outForSignatureDate"
                      type="date"
                      {...form.register("outForSignatureDate")}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="paymentReceivedDate" className="text-sm">Payment Received</Label>
                    <Input
                      id="paymentReceivedDate"
                      type="date"
                      {...form.register("paymentReceivedDate")}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="completedDate" className="text-sm">Completed</Label>
                    <Input
                      id="completedDate"
                      type="date"
                      {...form.register("completedDate")}
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="sticky bottom-0 bg-background border-t pt-2 mt-2 flex justify-end space-x-2 z-10">
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
      
      {/* Add Song Form - using comprehensive tabbed form */}
      <ComprehensiveSongForm 
        open={showAddSong}
        onClose={() => setShowAddSong(false)}
        onSongCreated={(newSong) => {
          console.log("New song created:", newSong);
          
          // Set flag to prevent dropdown from reopening
          justCreatedSongRef.current = true;
          
          // Close the add song dialog first
          setShowAddSong(false);
          
          // Close the song search dropdown
          setSongSearchOpen(false);
          
          // Auto-select the new song and populate form immediately
          form.setValue("songId", newSong.id);
          setSongSearchValue(`${newSong.title} - ${newSong.artist}`);
          setSelectedSong(newSong);
          
          // Clear the flag after a short delay to allow normal dropdown behavior again
          setTimeout(() => {
            justCreatedSongRef.current = false;
          }, 500);
          
          // Populate basic song information
          form.setValue("artist", newSong.artist || "");
          form.setValue("label", newSong.producer || "");
          if (newSong.composer) {
            form.setValue("writers", newSong.composer);
          }
          if (newSong.publisher) {
            form.setValue("publishingInfo", newSong.publisher);
          }
          
          // Load structured ownership data if available
          if (newSong.composerPublishers && Array.isArray(newSong.composerPublishers)) {
            const composerPublishersWithDate = newSong.composerPublishers.map((cp: any) => ({
              ...cp,
              jonasShare: cp.jonasShare || '',
              paymentDate: cp.paymentDate || ''
            }));
            setComposerPublishers(composerPublishersWithDate);
          }
          
          if (newSong.artistLabels && Array.isArray(newSong.artistLabels)) {
            const artistLabelsWithDate = newSong.artistLabels.map((al: any) => ({
              ...al,
              jonasShare: al.jonasShare || '',
              paymentDate: al.paymentDate || ''
            }));
            setArtistLabels(artistLabelsWithDate);
          }
        }}
      />
    </Dialog>
  );
}