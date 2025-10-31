import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { insertSongSchema, type InsertSong } from "@shared/schema";
import { Plus, X } from "lucide-react";

interface ComprehensiveSongFormProps {
  open: boolean;
  onClose: () => void;
  song?: any; // For editing existing songs
}

export default function ComprehensiveSongForm({ open, onClose, song }: ComprehensiveSongFormProps) {
  const { toast } = useToast();
  const isEditing = !!song;
  
  // State for managing multiple artists 
  const [legacyArtists, setLegacyArtists] = useState<string[]>(
    song?.artist ? song.artist.split(', ').filter(Boolean) : ['']
  );
  
  // Structure to store composer and their associated publisher and ownership
  interface ComposerPublisher {
    composer: string;
    publisher: string;
    publishingOwnership: string;
    isMine: boolean;
  }
  
  // Structure to store artist and their associated label and ownership
  interface ArtistLabel {
    artist: string;
    label: string;
    labelOwnership: string;
    isMine: boolean;
  }
  
  const [composerPublishers, setComposerPublishers] = useState<ComposerPublisher[]>(() => {
    if (song?.composer || song?.publisher) {
      const composers = song?.composer ? song.composer.split(', ').filter(Boolean) : [''];
      const publishers = song?.publisher ? song.publisher.split(', ').filter(Boolean) : [''];
      
      // Match composers with publishers, padding with empty strings if needed
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
      return result.length > 0 ? result : [{ composer: '', publisher: '', publishingOwnership: '', isMine: false }];
    }
    return [{ composer: '', publisher: '', publishingOwnership: '', isMine: false }];
  });
  
  const [artistLabels, setArtistLabels] = useState<ArtistLabel[]>(() => {
    if (song?.artist || song?.producer) {
      const artists = song?.artist ? song.artist.split(', ').filter(Boolean) : [''];
      const labels = song?.producer ? [song.producer] : [''];
      
      // Match artists with labels, padding with empty strings if needed
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
      return result.length > 0 ? result : [{ artist: '', label: '', labelOwnership: '', isMine: false }];
    }
    return [{ artist: '', label: '', labelOwnership: '', isMine: false }];
  });
  
  // Reset state when song prop changes
  useEffect(() => {
    // Reset legacy artists
    setLegacyArtists(song?.artist ? song.artist.split(', ').filter(Boolean) : ['']);
    
    // Reset composer-publisher data - use structured data if available, otherwise fall back to legacy
    if (song?.composerPublishers && Array.isArray(song.composerPublishers) && song.composerPublishers.length > 0) {
      // Use saved structured data
      setComposerPublishers(song.composerPublishers);
    } else if (song?.composer || song?.publisher) {
      // Fall back to legacy comma-separated strings
      const composers = song?.composer ? song.composer.split(', ').filter(Boolean) : [''];
      const publishers = song?.publisher ? song.publisher.split(', ').filter(Boolean) : [''];
      
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
    } else {
      setComposerPublishers([{ composer: '', publisher: '', publishingOwnership: '', isMine: false }]);
    }
    
    // Reset artist-label data - use structured data if available, otherwise fall back to legacy
    if (song?.artistLabels && Array.isArray(song.artistLabels) && song.artistLabels.length > 0) {
      // Use saved structured data
      setArtistLabels(song.artistLabels);
    } else if (song?.artist || song?.producer) {
      // Fall back to legacy comma-separated strings
      const artists = song?.artist ? song.artist.split(', ').filter(Boolean) : [''];
      const labels = song?.producer ? [song.producer] : [''];
      
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
    } else {
      setArtistLabels([{ artist: '', label: '', labelOwnership: '', isMine: false }]);
    }
  }, [song]);
  
  // Helper functions for managing legacy artist arrays (keeping for backward compatibility)
  const addLegacyArtist = () => setLegacyArtists([...legacyArtists, '']);
  const removeLegacyArtist = (index: number) => {
    if (legacyArtists.length > 1) {
      setLegacyArtists(legacyArtists.filter((_, i) => i !== index));
    }
  };
  const updateLegacyArtist = (index: number, value: string) => {
    const newArtists = [...legacyArtists];
    newArtists[index] = value;
    setLegacyArtists(newArtists);
  };

  // Helper functions for managing composer-publisher pairs
  const addComposerPublisher = () => setComposerPublishers([...composerPublishers, { composer: '', publisher: '', publishingOwnership: '', isMine: false }]);
  const removeComposerPublisher = (index: number) => {
    if (composerPublishers.length > 1) {
      setComposerPublishers(composerPublishers.filter((_, i) => i !== index));
    }
  };
  const updateComposer = (index: number, value: string) => {
    const newComposerPublishers = [...composerPublishers];
    newComposerPublishers[index].composer = value;
    setComposerPublishers(newComposerPublishers);
  };
  const updatePublisher = (index: number, value: string) => {
    const newComposerPublishers = [...composerPublishers];
    newComposerPublishers[index].publisher = value;
    setComposerPublishers(newComposerPublishers);
  };
  const updatePublishingOwnership = (index: number, value: string) => {
    const newComposerPublishers = [...composerPublishers];
    newComposerPublishers[index].publishingOwnership = value;
    setComposerPublishers(newComposerPublishers);
  };
  const updateComposerIsMine = (index: number, value: boolean) => {
    const newComposerPublishers = [...composerPublishers];
    newComposerPublishers[index].isMine = value;
    setComposerPublishers(newComposerPublishers);
  };

  // Helper functions for managing artist-label pairs
  const addArtistLabel = () => setArtistLabels([...artistLabels, { artist: '', label: '', labelOwnership: '', isMine: false }]);
  const removeArtistLabel = (index: number) => {
    if (artistLabels.length > 1) {
      setArtistLabels(artistLabels.filter((_, i) => i !== index));
    }
  };
  const updateArtist = (index: number, value: string) => {
    const newArtistLabels = [...artistLabels];
    newArtistLabels[index].artist = value;
    setArtistLabels(newArtistLabels);
  };
  const updateLabel = (index: number, value: string) => {
    const newArtistLabels = [...artistLabels];
    newArtistLabels[index].label = value;
    setArtistLabels(newArtistLabels);
  };
  const updateLabelOwnership = (index: number, value: string) => {
    const newArtistLabels = [...artistLabels];
    newArtistLabels[index].labelOwnership = value;
    setArtistLabels(newArtistLabels);
  };
  const updateArtistIsMine = (index: number, value: boolean) => {
    const newArtistLabels = [...artistLabels];
    newArtistLabels[index].isMine = value;
    setArtistLabels(newArtistLabels);
  };


  
  const form = useForm<InsertSong>({
    resolver: zodResolver(insertSongSchema),
    defaultValues: {
      title: song?.title || "",
      artist: song?.artist || "",
      album: song?.album || "",
      composer: song?.composer || "",
      producer: song?.producer || "",
      publisher: song?.publisher || "",
      irc: song?.irc || "",
      isrc: song?.isrc || "",
      upcEan: song?.upcEan || "",
      pNumbers: song?.pNumbers || "",
      proCueSheetId: song?.proCueSheetId || "",
      genreSubGenre: song?.genreSubGenre || "",
      moodTheme: song?.moodTheme || "",
      bpmKey: song?.bpmKey || "",
      vocalInstrumentation: song?.vocalInstrumentation || "",
      explicitContent: song?.explicitContent ?? false,
      lyrics: song?.lyrics || "",
      durationFormatted: song?.durationFormatted || "",
      version: song?.version || "",
      coverArtDescription: song?.coverArtDescription || "",
      fileTypeSampleRate: song?.fileTypeSampleRate || "",
      contentRepresentationCode: song?.contentRepresentationCode || "",
      masterRightsContact: song?.masterRightsContact || "",
      publishingRightsContact: song?.publishingRightsContact || "",
      syncRepresentation: song?.syncRepresentation || "",
      contentRepresented: song?.contentRepresented || "",
      smartLinkQrCode: song?.smartLinkQrCode || "",
      // Legacy fields
      genre: song?.genre || "",
      mood: song?.mood || "",
      tempo: song?.tempo || undefined,
      duration: song?.duration || undefined,
      key: song?.key || "",
      bpm: song?.bpm || undefined,
      description: song?.description || "",
      tags: song?.tags || [],
      filePath: song?.filePath || "",
      // Ownership fields
      publishingOwnership: song?.publishingOwnership || undefined,
      masterOwnership: song?.masterOwnership || undefined,
      splitDetails: song?.splitDetails || "",
      restrictions: song?.restrictions || "",
    },
  });

  // Reset form when song prop changes
  useEffect(() => {
    if (song) {
      form.reset({
        title: song.title || "",
        artist: song.artist || "",
        album: song.album || "",
        composer: song.composer || "",
        producer: song.producer || "",
        publisher: song.publisher || "",
        irc: song.irc || "",
        isrc: song.isrc || "",
        upcEan: song.upcEan || "",
        pNumbers: song.pNumbers || "",
        proCueSheetId: song.proCueSheetId || "",
        genreSubGenre: song.genreSubGenre || "",
        moodTheme: song.moodTheme || "",
        bpmKey: song.bpmKey || "",
        vocalInstrumentation: song.vocalInstrumentation || "",
        explicitContent: song.explicitContent ?? false,
        lyrics: song.lyrics || "",
        durationFormatted: song.durationFormatted || "",
        version: song.version || "",
        coverArtDescription: song.coverArtDescription || "",
        fileTypeSampleRate: song.fileTypeSampleRate || "",
        contentRepresentationCode: song.contentRepresentationCode || "",
        masterRightsContact: song.masterRightsContact || "",
        publishingRightsContact: song.publishingRightsContact || "",
        syncRepresentation: song.syncRepresentation || "",
        contentRepresented: song.contentRepresented || "",
        smartLinkQrCode: song.smartLinkQrCode || "",
        genre: song.genre || "",
        mood: song.mood || "",
        tempo: song.tempo || undefined,
        duration: song.duration || undefined,
        key: song.key || "",
        bpm: song.bpm || undefined,
        description: song.description || "",
        tags: song.tags || [],
        filePath: song.filePath || "",
        publishingOwnership: song.publishingOwnership || undefined,
        masterOwnership: song.masterOwnership || undefined,
        splitDetails: song.splitDetails || "",
        restrictions: song.restrictions || "",
      });
    } else {
      // Reset to empty form when no song is provided
      form.reset({
        title: "",
        artist: "",
        album: "",
        composer: "",
        producer: "",
        publisher: "",
        irc: "",
        isrc: "",
        upcEan: "",
        pNumbers: "",
        proCueSheetId: "",
        genreSubGenre: "",
        moodTheme: "",
        bpmKey: "",
        vocalInstrumentation: "",
        explicitContent: false,
        lyrics: "",
        durationFormatted: "",
        version: "",
        coverArtDescription: "",
        fileTypeSampleRate: "",
        contentRepresentationCode: "",
        masterRightsContact: "",
        publishingRightsContact: "",
        syncRepresentation: "",
        contentRepresented: "",
        smartLinkQrCode: "",
        genre: "",
        mood: "",
        tempo: undefined,
        duration: undefined,
        key: "",
        bpm: undefined,
        description: "",
        tags: [],
        filePath: "",
        publishingOwnership: undefined,
        masterOwnership: undefined,
        splitDetails: "",
        restrictions: "",
      });
    }
  }, [song, form]);

  const createSongMutation = useMutation({
    mutationFn: async (data: InsertSong) => {
      console.log('Mutation starting with data:', data);
      const endpoint = isEditing ? `/api/songs/${song.id}` : "/api/songs";
      const method = isEditing ? "PUT" : "POST";
      console.log('Making API call:', method, endpoint);
      
      try {
        const response = await apiRequest(endpoint, {
          method,
          body: data,
        });
        console.log('API response received:', response);
        const result = await response.json();
        console.log('Parsed response:', result);
        return result;
      } catch (error) {
        console.error('API call failed:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('Mutation succeeded:', data);
      toast({
        title: "Success",
        description: isEditing ? "Song updated successfully" : "Song added successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/songs"] });
      onClose();
      form.reset();
    },
    onError: (error: any) => {
      console.error('Mutation failed:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save song",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertSong) => {
    console.log('Form submitted with data:', data);
    console.log('Form errors:', form.formState.errors);
    
    // Convert tags string to array if provided, handle undefined/empty values
    let processedTags: string[] = [];
    if (data.tags && Array.isArray(data.tags) && data.tags[0] && data.tags[0] !== "undefined") {
      processedTags = data.tags[0].split(",").map(tag => tag.trim()).filter(tag => tag.length > 0);
    }
    
    // Combine multiple artists and composers into comma-separated strings
    const combinedArtist = artistLabels.map(al => al.artist).filter(artist => artist.trim()).join(', ');
    const combinedLabel = artistLabels.map(al => al.label).filter(label => label.trim()).join(', ');
    const combinedComposer = composerPublishers.map(cp => cp.composer).filter(composer => composer.trim()).join(', ');
    const combinedPublisher = composerPublishers.map(cp => cp.publisher).filter(publisher => publisher.trim()).join(', ');
    
    // Calculate Jonas's total ownership percentages
    const jonasPublishingOwnership = composerPublishers
      .filter(cp => cp.isMine && cp.publishingOwnership)
      .reduce((total, cp) => total + parseFloat(cp.publishingOwnership || '0'), 0);
    
    const jonasLabelOwnership = artistLabels
      .filter(al => al.isMine && al.labelOwnership)
      .reduce((total, al) => total + parseFloat(al.labelOwnership || '0'), 0);
    
    const processedData = {
      ...data,
      artist: combinedArtist,
      producer: combinedLabel, // Label goes into producer field
      composer: combinedComposer,
      publisher: combinedPublisher,
      tags: processedTags,
      // Include structured ownership data
      composerPublishers: composerPublishers,
      artistLabels: artistLabels,
      // Include calculated ownership percentages for display
      publishingOwnership: jonasPublishingOwnership > 0 ? jonasPublishingOwnership : null,
      masterOwnership: jonasLabelOwnership > 0 ? jonasLabelOwnership : null,
    };
    
    console.log('Processed data for submission:', processedData);
    createSongMutation.mutate(processedData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Song" : "Add New Song"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit, (errors) => {
          console.log('Form validation failed:', errors);
          toast({
            title: "Validation Error",
            description: "Please check the form for errors",
            variant: "destructive",
          });
        })} className="h-full overflow-hidden">
          <Tabs defaultValue="basic" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="metadata">Metadata</TabsTrigger>
              <TabsTrigger value="rights">Rights</TabsTrigger>
              <TabsTrigger value="technical">Technical</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto p-1">
              <TabsContent value="basic" className="space-y-4">
                {/* Part 1: Basic Song Details - Light Purple */}
                <Card className="bg-purple-50 border-purple-200">
                  <CardHeader className="bg-purple-100 border-b border-purple-200">
                    <CardTitle className="text-purple-800">Basic Song Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 bg-purple-50">
                    {/* First line: Title, Album */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="title">Title *</Label>
                        <Input
                          id="title"
                          {...form.register("title")}
                          placeholder="Song title"
                        />
                        {form.formState.errors.title && (
                          <p className="text-sm text-red-600">{form.formState.errors.title.message}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="album">Album</Label>
                        <Input
                          id="album"
                          {...form.register("album")}
                          placeholder="Album name"
                        />
                      </div>
                    </div>
                    
                    {/* Second line: Jonas's Ownership Summary */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="publishingOwnership">Publishing Ownership (%)</Label>
                        <Input
                          id="publishingOwnership"
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={composerPublishers
                            .filter(cp => cp.isMine && cp.publishingOwnership)
                            .reduce((total, cp) => total + parseFloat(cp.publishingOwnership || '0'), 0)
                            .toFixed(2)}
                          readOnly
                          className="bg-purple-100/50 font-semibold"
                          placeholder="0.00"
                        />
                        <p className="text-xs text-purple-600 mt-1">Auto-calculated from Jonas's checked composers</p>
                      </div>
                      <div>
                        <Label htmlFor="masterOwnership">Label Recording Ownership (%)</Label>
                        <Input
                          id="masterOwnership"
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={artistLabels
                            .filter(al => al.isMine && al.labelOwnership)
                            .reduce((total, al) => total + parseFloat(al.labelOwnership || '0'), 0)
                            .toFixed(2)}
                          readOnly
                          className="bg-purple-100/50 font-semibold"
                          placeholder="0.00"
                        />
                        <p className="text-xs text-purple-600 mt-1">Auto-calculated from Jonas's checked artists</p>
                      </div>
                    </div>

                  </CardContent>
                </Card>
                
                {/* Part 2: Publishing Information - Green */}
                <Card className="bg-green-50 border-green-200">
                  <CardHeader className="bg-green-100 border-b border-green-200">
                    <CardTitle className="text-green-800">Publishing Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 bg-green-50">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <Label className="text-base font-semibold">Composer(s), Publisher(s) & Ownership</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addComposerPublisher}
                          className="h-6 px-2"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="space-y-3">
                        <div className="grid grid-cols-12 gap-2 text-sm font-medium text-green-700">
                          <div className="col-span-4">Composer Name</div>
                          <div className="col-span-4">Publisher</div>
                          <div className="col-span-2">Ownership (%)</div>
                          <div className="col-span-1">Jonas</div>
                          <div className="col-span-1">Actions</div>
                        </div>
                        {composerPublishers.map((item, index) => (
                          <div key={index} className="grid grid-cols-12 gap-2">
                            <div className="col-span-4">
                              <Input
                                value={item.composer}
                                onChange={(e) => updateComposer(index, e.target.value)}
                                placeholder="Composer name"
                              />
                            </div>
                            <div className="col-span-4">
                              <Input
                                value={item.publisher}
                                onChange={(e) => updatePublisher(index, e.target.value)}
                                placeholder="Publisher name"
                              />
                            </div>
                            <div className="col-span-2">
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"
                                value={item.publishingOwnership}
                                onChange={(e) => updatePublishingOwnership(index, e.target.value)}
                                placeholder="0.00"
                              />
                            </div>
                            <div className="col-span-1 flex justify-center items-center">
                              <Checkbox
                                checked={item.isMine}
                                onCheckedChange={(checked: boolean | string) => updateComposerIsMine(index, Boolean(checked))}
                              />
                            </div>
                            <div className="col-span-1 flex justify-center">
                              {composerPublishers.length > 1 && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeComposerPublisher(index)}
                                  className="h-10 px-3 flex-shrink-0"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="splitDetails">Split Details</Label>
                      <Textarea
                        id="splitDetails"
                        {...form.register("splitDetails")}
                        placeholder="Detailed breakdown of all ownership splits and agreements"
                        rows={3}
                      />
                      <p className="text-xs text-green-600 mt-1">Include detailed information about all parties' ownership shares and agreements</p>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Part 3: Label Information - Blue */}
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader className="bg-blue-100 border-b border-blue-200">
                    <CardTitle className="text-blue-800">Label Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 bg-blue-50">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <Label className="text-base font-semibold">Artist(s), Label(s) & Ownership</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addArtistLabel}
                          className="h-6 px-2"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="space-y-3">
                        <div className="grid grid-cols-12 gap-2 text-sm font-medium text-blue-700">
                          <div className="col-span-4">Artist Name</div>
                          <div className="col-span-4">Label</div>
                          <div className="col-span-2">Ownership (%)</div>
                          <div className="col-span-1">Jonas</div>
                          <div className="col-span-1">Actions</div>
                        </div>
                        {artistLabels.map((item, index) => (
                          <div key={index} className="grid grid-cols-12 gap-2">
                            <div className="col-span-4">
                              <Input
                                value={item.artist}
                                onChange={(e) => updateArtist(index, e.target.value)}
                                placeholder="Artist name"
                              />
                            </div>
                            <div className="col-span-4">
                              <Input
                                value={item.label}
                                onChange={(e) => updateLabel(index, e.target.value)}
                                placeholder="Label name"
                              />
                            </div>
                            <div className="col-span-2">
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"
                                value={item.labelOwnership}
                                onChange={(e) => updateLabelOwnership(index, e.target.value)}
                                placeholder="0.00"
                              />
                            </div>
                            <div className="col-span-1 flex justify-center items-center">
                              <Checkbox
                                checked={item.isMine}
                                onCheckedChange={(checked: boolean | string) => updateArtistIsMine(index, Boolean(checked))}
                              />
                            </div>
                            <div className="col-span-1 flex justify-center">
                              {artistLabels.length > 1 && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeArtistLabel(index)}
                                  className="h-10 px-3 flex-shrink-0"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </CardContent>
                </Card>
                
                {/* Part 4: Restrictions - Yellow */}
                <Card className="bg-yellow-50 border-yellow-200">
                  <CardHeader className="bg-yellow-100 border-b border-yellow-200">
                    <CardTitle className="text-yellow-800">Restrictions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 bg-yellow-50">
                    <div>
                      <Label htmlFor="restrictions">Usage Restrictions</Label>
                      <Textarea
                        id="restrictions"
                        {...form.register("restrictions")}
                        placeholder="Any usage restrictions, limitations, or special licensing requirements for this song"
                        rows={3}
                      />
                      <p className="text-xs text-yellow-600 mt-1">Include any restrictions on territory, media, exclusivity, or other licensing limitations</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="metadata" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Metadata & Identifiers</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="irc">IRC</Label>
                        <Input
                          id="irc"
                          {...form.register("irc")}
                          placeholder="International Recording Code"
                        />
                      </div>
                      <div>
                        <Label htmlFor="isrc">ISRC</Label>
                        <Input
                          id="isrc"
                          {...form.register("isrc")}
                          placeholder="International Standard Recording Code"
                        />
                      </div>
                      <div>
                        <Label htmlFor="upcEan">UPC/EAN</Label>
                        <Input
                          id="upcEan"
                          {...form.register("upcEan")}
                          placeholder="UPC/EAN barcode"
                        />
                      </div>
                      <div>
                        <Label htmlFor="pNumbers">(P) Number(s)</Label>
                        <Input
                          id="pNumbers"
                          {...form.register("pNumbers")}
                          placeholder="P-line information"
                        />
                      </div>
                      <div>
                        <Label htmlFor="proCueSheetId">PRO Cue Sheet ID</Label>
                        <Input
                          id="proCueSheetId"
                          {...form.register("proCueSheetId")}
                          placeholder="PRO cue sheet identifier"
                        />
                      </div>
                      <div>
                        <Label htmlFor="version">Version</Label>
                        <Input
                          id="version"
                          {...form.register("version")}
                          placeholder="Version (e.g., Radio Edit, Extended)"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="rights" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Rights & Representation</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label htmlFor="masterRightsContact">Master Rights Contact</Label>
                        <Input
                          id="masterRightsContact"
                          {...form.register("masterRightsContact")}
                          placeholder="Master rights contact information"
                        />
                      </div>
                      <div>
                        <Label htmlFor="publishingRightsContact">Publishing Rights Contact</Label>
                        <Input
                          id="publishingRightsContact"
                          {...form.register("publishingRightsContact")}
                          placeholder="Publishing rights contact information"
                        />
                      </div>
                      <div>
                        <Label htmlFor="syncRepresentation">Sync Representation</Label>
                        <Input
                          id="syncRepresentation"
                          {...form.register("syncRepresentation")}
                          placeholder="Sync representation details"
                        />
                      </div>
                      <div>
                        <Label htmlFor="contentRepresented">Content Represented</Label>
                        <Input
                          id="contentRepresented"
                          {...form.register("contentRepresented")}
                          placeholder="Content representation details"
                        />
                      </div>
                      <div>
                        <Label htmlFor="contentRepresentationCode">Content Representation Code</Label>
                        <Input
                          id="contentRepresentationCode"
                          {...form.register("contentRepresentationCode")}
                          placeholder="Content representation code"
                        />
                      </div>
                    </div>
                    
                    <div className="border-t pt-4">
                      <h4 className="font-semibold text-lg mb-4">Ownership Information</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="publishingOwnership">Publishing Ownership (%)</Label>
                          <Input
                            id="publishingOwnership"
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            {...form.register("publishingOwnership")}
                            placeholder="e.g., 50.00"
                          />
                          <p className="text-xs text-gray-600 mt-1">Your publishing ownership percentage (0-100%)</p>
                        </div>
                        <div>
                          <Label htmlFor="masterOwnership">Master Recording Ownership (%)</Label>
                          <Input
                            id="masterOwnership"
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            {...form.register("masterOwnership")}
                            placeholder="e.g., 50.00"
                          />
                          <p className="text-xs text-gray-600 mt-1">Your master recording ownership percentage (0-100%)</p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <Label htmlFor="splitDetails">Split Details</Label>
                        <Textarea
                          id="splitDetails"
                          {...form.register("splitDetails")}
                          placeholder="Detailed breakdown of all ownership splits and agreements"
                          rows={3}
                        />
                        <p className="text-xs text-gray-600 mt-1">Include detailed information about all parties' ownership shares and agreements</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="technical" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Technical Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="genreSubGenre">Genre/Sub-Genre</Label>
                        <Input
                          id="genreSubGenre"
                          {...form.register("genreSubGenre")}
                          placeholder="Genre and sub-genre"
                        />
                      </div>
                      <div>
                        <Label htmlFor="moodTheme">Mood/Theme</Label>
                        <Input
                          id="moodTheme"
                          {...form.register("moodTheme")}
                          placeholder="Mood and theme"
                        />
                      </div>
                      <div>
                        <Label htmlFor="bpmKey">BPM / Key</Label>
                        <Input
                          id="bpmKey"
                          {...form.register("bpmKey")}
                          placeholder="BPM and key signature"
                        />
                      </div>
                      <div>
                        <Label htmlFor="vocalInstrumentation">Vocal/Instrumentation</Label>
                        <Input
                          id="vocalInstrumentation"
                          {...form.register("vocalInstrumentation")}
                          placeholder="Vocal and instrumentation details"
                        />
                      </div>
                      <div>
                        <Label htmlFor="durationFormatted">Duration</Label>
                        <Input
                          id="durationFormatted"
                          {...form.register("durationFormatted")}
                          placeholder="MM:SS format"
                        />
                      </div>
                      <div>
                        <Label htmlFor="fileTypeSampleRate">File Type/Sample Rate</Label>
                        <Input
                          id="fileTypeSampleRate"
                          {...form.register("fileTypeSampleRate")}
                          placeholder="File format and sample rate"
                        />
                      </div>
                    </div>
                    
                    {/* Legacy numeric fields for compatibility */}
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                      <div>
                        <Label htmlFor="tempo">Tempo</Label>
                        <Input
                          id="tempo"
                          type="number"
                          {...form.register("tempo")}
                          placeholder="e.g., 120"
                        />
                      </div>
                      <div>
                        <Label htmlFor="duration">Duration (seconds)</Label>
                        <Input
                          id="duration"
                          type="number"
                          {...form.register("duration")}
                          placeholder="e.g., 180"
                        />
                      </div>
                      <div>
                        <Label htmlFor="bpm">BPM</Label>
                        <Input
                          id="bpm"
                          type="number"
                          {...form.register("bpm")}
                          placeholder="e.g., 120"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div>
                        <Label htmlFor="key">Key</Label>
                        <Input
                          id="key"
                          {...form.register("key")}
                          placeholder="e.g., C Major, A Minor"
                        />
                      </div>
                      <div>
                        <Label htmlFor="tags">Tags</Label>
                        <Input
                          id="tags"
                          {...form.register("tags.0")}
                          placeholder="Comma-separated tags"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="filePath">File Path</Label>
                      <Input
                        id="filePath"
                        {...form.register("filePath")}
                        placeholder="File path or URL"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="explicitContent"
                        checked={form.watch("explicitContent") || false}
                        onCheckedChange={(checked) => form.setValue("explicitContent", !!checked)}
                      />
                      <Label htmlFor="explicitContent">Explicit Content</Label>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="content" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Content & Artwork</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="lyrics">Lyrics</Label>
                      <Textarea
                        id="lyrics"
                        {...form.register("lyrics")}
                        placeholder="Song lyrics"
                        rows={6}
                      />
                    </div>
                    <div>
                      <Label htmlFor="coverArtDescription">Cover Art Description</Label>
                      <Textarea
                        id="coverArtDescription"
                        {...form.register("coverArtDescription")}
                        placeholder="Description of cover art"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="smartLinkQrCode">Smart Link / QR Code</Label>
                      <Input
                        id="smartLinkQrCode"
                        {...form.register("smartLinkQrCode")}
                        placeholder="Smart link or QR code URL"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        {...form.register("description")}
                        placeholder="General description of the song"
                        rows={4}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={createSongMutation.isPending}>
                {createSongMutation.isPending ? "Saving..." : isEditing ? "Update Song" : "Add Song"}
              </Button>
            </div>
          </Tabs>
        </form>
      </DialogContent>
    </Dialog>
  );
}