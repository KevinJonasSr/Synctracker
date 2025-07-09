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
import { Plus, Building, User, FileText } from "lucide-react";

// Phone number formatting function
const formatPhoneNumber = (value: string) => {
  // Remove all non-numeric characters
  const phoneNumber = value.replace(/[^\d]/g, '');
  
  // Format based on length
  if (phoneNumber.length <= 3) {
    return phoneNumber;
  } else if (phoneNumber.length <= 6) {
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
  } else if (phoneNumber.length <= 10) {
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6)}`;
  } else {
    // Handle international numbers or longer formats
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
  }
};

interface ComprehensiveAddDealFormProps {
  open: boolean;
  onClose: () => void;
}

export default function ComprehensiveAddDealForm({ open, onClose }: ComprehensiveAddDealFormProps) {
  const { toast } = useToast();
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContactName, setNewContactName] = useState("");
  const [newContactEmail, setNewContactEmail] = useState("");
  const [newContactPhone, setNewContactPhone] = useState("");
  const [newContactCompany, setNewContactCompany] = useState("");
  const [newContactRole, setNewContactRole] = useState("");
  const [newContactNotes, setNewContactNotes] = useState("");
  const [newContactProjects, setNewContactProjects] = useState("");
  
  const form = useForm<InsertDeal>({
    resolver: zodResolver(insertDealSchema),
    shouldFocusError: false, // Prevent auto-focus on validation errors
    defaultValues: {
      projectName: "",
      episodeNumber: "",
      projectType: "",
      projectDescription: "",
      songId: undefined,
      contactId: undefined,
      
      // Contact Information
      licenseeCompanyName: "",
      licenseeAddress: "",
      licenseeContactName: "",
      licenseeContactEmail: "",
      licenseeContactPhone: "",
      
      musicSupervisorName: "",
      musicSupervisorAddress: "",
      musicSupervisorContactName: "",
      musicSupervisorContactEmail: "",
      musicSupervisorContactPhone: "",
      
      clearanceCompanyName: "",
      clearanceCompanyAddress: "",
      clearanceCompanyContactName: "",
      clearanceCompanyContactEmail: "",
      clearanceCompanyContactPhone: "",
      
      status: "pitched",
      dealValue: undefined,
      fullSongValue: undefined,
      ourFee: undefined,
      fullRecordingFee: undefined,
      ourRecordingFee: undefined,
      
      // Status dates
      pitchedDate: undefined,
      pendingApprovalDate: undefined,
      quotedDate: undefined,
      useConfirmedDate: undefined,
      beingDraftedDate: undefined,
      outForSignatureDate: undefined,
      paymentReceivedDate: undefined,
      completedDate: undefined,
      usage: "",
      media: "",
      territory: "worldwide",
      term: "",
      exclusivity: false,
      exclusivityRestrictions: "",
      
      // Song Information
      writers: "",
      publishingInfo: "",
      splits: "",
      artist: "",
      label: "",
      artistLabelSplits: "",
      
      notes: "",
      airDate: "",
      pitchDate: undefined,
    },
  });

  // Watch for status changes to auto-update dates
  const watchedStatus = form.watch("status");
  useEffect(() => {
    if (watchedStatus && watchedStatus !== "pitched") {
      const now = new Date().toISOString().slice(0, 16); // Format for datetime-local
      const fieldMap = {
        "pitched": "pitchedDate",
        "pending approval": "pendingApprovalDate",
        "quoted": "quotedDate",
        "use confirmed": "useConfirmedDate",
        "being drafted": "beingDraftedDate",
        "out for signature": "outForSignatureDate",
        "payment received": "paymentReceivedDate",
        "completed": "completedDate"
      };
      
      const dateField = fieldMap[watchedStatus.toLowerCase()];
      if (dateField && !form.getValues(dateField)) {
        form.setValue(dateField, now);
      }
    }
  }, [watchedStatus, form]);

  const { data: songs = [] } = useQuery<Song[]>({
    queryKey: ["/api/songs"],
  });

  const { data: contacts = [] } = useQuery<Contact[]>({
    queryKey: ["/api/contacts"],
  });

  const createContactMutation = useMutation({
    mutationFn: async (contactData: any) => {
      const response = await apiRequest('POST', '/api/contacts', contactData);
      return response.json();
    },
    onSuccess: (newContact) => {
      queryClient.invalidateQueries({ queryKey: ['/api/contacts'] });
      form.setValue('contactId', newContact.id);
      setShowAddContact(false);
      // Clear form
      setNewContactName("");
      setNewContactEmail("");
      setNewContactPhone("");
      setNewContactCompany("");
      setNewContactRole("");
      setNewContactNotes("");
      setNewContactProjects("");
      toast({
        title: "Contact added successfully",
        description: `${newContact.name} has been added to your contacts.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error adding contact",
        description: "Failed to add the contact. Please try again.",
        variant: "destructive",
      });
    }
  });

  const createDealMutation = useMutation({
    mutationFn: async (data: InsertDeal) => {
      // Ensure all required fields are present and properly typed
      const processedData = {
        ...data,
        songId: data.songId ? parseInt(data.songId.toString()) : null,
        contactId: data.contactId ? parseInt(data.contactId.toString()) : null,
        dealValue: data.dealValue ? parseFloat(data.dealValue.toString()) : null,
        fullSongValue: data.fullSongValue ? parseFloat(data.fullSongValue.toString()) : null,
        ourFee: data.ourFee ? parseFloat(data.ourFee.toString()) : null,
        fullRecordingFee: data.fullRecordingFee ? parseFloat(data.fullRecordingFee.toString()) : null,
        ourRecordingFee: data.ourRecordingFee ? parseFloat(data.ourRecordingFee.toString()) : null,
        pitchDate: data.pitchDate ? new Date(data.pitchDate).toISOString() : null,
        
        // Status dates
        pitchedDate: data.pitchedDate ? new Date(data.pitchedDate).toISOString() : null,
        pendingApprovalDate: data.pendingApprovalDate ? new Date(data.pendingApprovalDate).toISOString() : null,
        quotedDate: data.quotedDate ? new Date(data.quotedDate).toISOString() : null,
        useConfirmedDate: data.useConfirmedDate ? new Date(data.useConfirmedDate).toISOString() : null,
        beingDraftedDate: data.beingDraftedDate ? new Date(data.beingDraftedDate).toISOString() : null,
        outForSignatureDate: data.outForSignatureDate ? new Date(data.outForSignatureDate).toISOString() : null,
        paymentReceivedDate: data.paymentReceivedDate ? new Date(data.paymentReceivedDate).toISOString() : null,
        completedDate: data.completedDate ? new Date(data.completedDate).toISOString() : null,
        airDate: data.airDate ? new Date(data.airDate).toISOString() : null,
      };
      
      console.log("Processed data:", processedData);
      const response = await apiRequest("POST", "/api/deals", processedData);
      return response.json();
    },
    onSuccess: async (newDeal) => {
      queryClient.invalidateQueries({ queryKey: ["/api/deals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      
      // Auto-create calendar event if airdate is set
      if (newDeal.airDate) {
        try {
          await apiRequest("POST", "/api/calendar-events", {
            title: `Air Date: ${newDeal.projectName}`,
            description: `Air date for ${newDeal.projectName}`,
            eventDate: newDeal.airDate,
            entityType: "deal",
            entityId: newDeal.id
          });
          queryClient.invalidateQueries({ queryKey: ["/api/calendar-events"] });
        } catch (error) {
          console.log("Failed to create calendar event:", error);
        }
      }
      
      form.reset();
      onClose();
      toast({
        title: "Deal Added",
        description: newDeal.airDate 
          ? "Deal has been added to the pipeline and calendar event created for air date"
          : "Deal has been successfully added to the pipeline"
      });
    },
    onError: (error) => {
      console.error("Error creating deal:", error);
      toast({
        title: "Error Creating Deal",
        description: "There was an error creating the deal. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleAddContact = () => {
    if (!newContactName.trim() || !newContactEmail.trim()) {
      toast({
        title: "Missing required fields",
        description: "Please provide at least a name and email for the contact.",
        variant: "destructive",
      });
      return;
    }

    const contactData = {
      name: newContactName.trim(),
      email: newContactEmail.trim(),
      phone: newContactPhone.trim() || null,
      company: newContactCompany.trim() || null,
      role: newContactRole.trim() || null,
      notes: `${newContactNotes.trim()}${newContactProjects.trim() ? '\n\nCurrent Projects:\n' + newContactProjects.trim() : ''}`.trim() || null,
    };

    createContactMutation.mutate(contactData);
  };

  const onSubmit = (data: InsertDeal) => {
    console.log("Form submitted with data:", data);
    console.log("Form state:", form.formState);
    
    // Validate required fields
    if (!data.projectName || !data.projectType || !data.songId || !data.contactId) {
      console.log("Validation failed - missing required fields:", {
        projectName: data.projectName,
        projectType: data.projectType,
        songId: data.songId,
        contactId: data.contactId
      });
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields (Project Name, Project Type, Song Title, and Contact).",
        variant: "destructive",
      });
      return;
    }
    
    console.log("Validation passed, submitting deal");
    createDealMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Deal</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit, (errors) => {
          console.log("Form validation errors:", errors);
          
          // Find the first error and show a specific message
          const firstError = Object.keys(errors)[0];
          let errorMessage = "Please check the form for errors and try again.";
          
          if (firstError === "contactId") {
            errorMessage = "Please select a contact for this deal.";
          } else if (firstError === "songId") {
            errorMessage = "Please select a song for this deal.";
          } else if (firstError === "projectName") {
            errorMessage = "Please enter a project name.";
          } else if (firstError === "projectType") {
            errorMessage = "Please select a project type.";
          }
          
          toast({
            title: "Form validation failed",
            description: errorMessage,
            variant: "destructive",
          });
        })} className="space-y-6">
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
                      <SelectItem value="indie_film">Indie Film</SelectItem>
                      <SelectItem value="non_profit">Non-Profit</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="podcast">Podcast</SelectItem>
                      <SelectItem value="promos">Promos</SelectItem>
                      <SelectItem value="sports">Sports</SelectItem>
                      <SelectItem value="student_film">Student Film</SelectItem>
                      <SelectItem value="trailers">Trailers</SelectItem>
                      <SelectItem value="tv">TV Show</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={form.watch("status")}
                    onValueChange={(value) => form.setValue("status", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pitched">Pitched</SelectItem>
                      <SelectItem value="pending_approval">Pending Approval</SelectItem>
                      <SelectItem value="quoted">Quoted</SelectItem>
                      <SelectItem value="use_confirmed">Use Confirmed</SelectItem>
                      <SelectItem value="being_drafted">Being Drafted</SelectItem>
                      <SelectItem value="out_for_signature">Out for Signature</SelectItem>
                      <SelectItem value="payment_received">Payment Received</SelectItem>
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

              <div>
                <Label htmlFor="projectDescription">Project Description</Label>
                <Textarea
                  id="projectDescription"
                  {...form.register("projectDescription")}
                  placeholder="Brief description of the project"
                  rows={2}
                />
              </div>

              {/* Contact Information */}
              <Separator />
              
              {/* Licensee / Production Company */}
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
                <div className="grid grid-cols-3 gap-4 mt-3">
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
                      value={form.watch("licenseeContactPhone") || ""}
                      onChange={(e) => {
                        const formatted = formatPhoneNumber(e.target.value);
                        form.setValue("licenseeContactPhone", formatted);
                      }}
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

              {/* Music Supervisor */}
              <div>
                <h4 className="font-medium mb-3 flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Music Supervisor</span>
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="musicSupervisorName">Supervisor Name</Label>
                    <Input
                      id="musicSupervisorName"
                      {...form.register("musicSupervisorName")}
                      placeholder="Music supervisor name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="musicSupervisorContactName">Company Name</Label>
                    <Input
                      id="musicSupervisorContactName"
                      {...form.register("musicSupervisorContactName")}
                      placeholder="Company name"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-3">
                  <div>
                    <Label htmlFor="musicSupervisorContactEmail">Email</Label>
                    <Input
                      id="musicSupervisorContactEmail"
                      type="email"
                      {...form.register("musicSupervisorContactEmail")}
                      placeholder="supervisor@email.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="musicSupervisorContactPhone">Phone</Label>
                    <Input
                      id="musicSupervisorContactPhone"
                      value={form.watch("musicSupervisorContactPhone") || ""}
                      onChange={(e) => {
                        const formatted = formatPhoneNumber(e.target.value);
                        form.setValue("musicSupervisorContactPhone", formatted);
                      }}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="musicSupervisorAddress">Address</Label>
                    <Input
                      id="musicSupervisorAddress"
                      {...form.register("musicSupervisorAddress")}
                      placeholder="Supervisor address"
                    />
                  </div>
                </div>
              </div>

              {/* Clearance Company */}
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
                <div className="grid grid-cols-3 gap-4 mt-3">
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
                      value={form.watch("clearanceCompanyContactPhone") || ""}
                      onChange={(e) => {
                        const formatted = formatPhoneNumber(e.target.value);
                        form.setValue("clearanceCompanyContactPhone", formatted);
                      }}
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

              <Separator />

              {/* Deal Terms */}
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="usage">Usage</Label>
                  <Input
                    id="usage"
                    {...form.register("usage")}
                    placeholder="e.g., Background music"
                  />
                </div>
                <div>
                  <Label htmlFor="media">Media</Label>
                  <Input
                    id="media"
                    {...form.register("media")}
                    placeholder="e.g., TV, Film, Streaming"
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="songId">Song Title *</Label>
                  <Select
                    value={form.watch("songId")?.toString()}
                    onValueChange={(value) => form.setValue("songId", parseInt(value))}
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
                <div>
                  <Label htmlFor="contactId">Contact *</Label>
                  <div className="flex space-x-2">
                    <Select
                      value={form.watch("contactId")?.toString() || ""}
                      onValueChange={(value) => {
                        const contactId = parseInt(value);
                        form.setValue("contactId", contactId);
                        
                        // Auto-populate music supervisor name with selected contact
                        const selectedContact = contacts.find(c => c.id === contactId);
                        if (selectedContact) {
                          form.setValue("musicSupervisorName", selectedContact.name);
                          if (selectedContact.company) {
                            form.setValue("musicSupervisorContactName", selectedContact.company);
                          }
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select contact" />
                      </SelectTrigger>
                      <SelectContent>
                        {contacts.map((contact) => (
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
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="writers">Writers</Label>
                  <Textarea
                    id="writers"
                    {...form.register("writers")}
                    placeholder="List of song writers"
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="publishingInfo">Publishing Information</Label>
                  <Textarea
                    id="publishingInfo"
                    {...form.register("publishingInfo")}
                    placeholder="Publishing company details"
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="splits">Splits</Label>
                  <Textarea
                    id="splits"
                    {...form.register("splits")}
                    placeholder="Publishing splits breakdown"
                    rows={2}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="artist">Artist</Label>
                  <Input
                    id="artist"
                    {...form.register("artist")}
                    placeholder="Recording artist"
                  />
                </div>
                <div>
                  <Label htmlFor="label">Label</Label>
                  <Input
                    id="label"
                    {...form.register("label")}
                    placeholder="Record label"
                  />
                </div>
                <div>
                  <Label htmlFor="artistLabelSplits">Artist/Label Split Information</Label>
                  <Textarea
                    id="artistLabelSplits"
                    {...form.register("artistLabelSplits")}
                    placeholder="Artist and label split details"
                    rows={1}
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullSongValue">100% Publishing Fee ($)</Label>
                  <Input
                    id="fullSongValue"
                    type="number"
                    step="0.01"
                    min="0"
                    {...form.register("fullSongValue", { valueAsNumber: true })}
                    placeholder="0.00"
                    onFocus={(e) => {
                      console.log("Publishing fee field focused - this shouldn't happen automatically");
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="ourFee">Our Fee Based on Splits ($)</Label>
                  <Input
                    id="ourFee"
                    type="number"
                    step="0.01"
                    min="0"
                    {...form.register("ourFee", { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullRecordingFee">100% Recording Fee ($)</Label>
                  <Input
                    id="fullRecordingFee"
                    type="number"
                    step="0.01"
                    min="0"
                    {...form.register("fullRecordingFee", { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="ourRecordingFee">Our Fee Based on Splits ($)</Label>
                  <Input
                    id="ourRecordingFee"
                    type="number"
                    step="0.01"
                    min="0"
                    {...form.register("ourRecordingFee", { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Additional Information */}
          <Card className="bg-green-50 border-green-200">
            <CardHeader className="bg-green-100 border-b border-green-200">
              <CardTitle className="flex items-center space-x-2 text-green-800">
                <span>📝</span>
                <span>Additional Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 bg-green-50">
              <div>
                <Label htmlFor="pitchDate">Pitch Date</Label>
                <Input
                  id="pitchDate"
                  type="date"
                  {...form.register("pitchDate")}
                />
              </div>
              
              {/* Status Change Dates */}
              <div>
                <Label className="text-sm font-medium text-green-800">Status Timeline</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <Label htmlFor="pitchedDate" className="text-xs">Pitched Date</Label>
                    <Input
                      id="pitchedDate"
                      type="datetime-local"
                      {...form.register("pitchedDate")}
                      className="text-xs"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pendingApprovalDate" className="text-xs">Pending Approval Date</Label>
                    <Input
                      id="pendingApprovalDate"
                      type="datetime-local"
                      {...form.register("pendingApprovalDate")}
                      className="text-xs"
                    />
                  </div>
                  <div>
                    <Label htmlFor="quotedDate" className="text-xs">Quoted Date</Label>
                    <Input
                      id="quotedDate"
                      type="datetime-local"
                      {...form.register("quotedDate")}
                      className="text-xs"
                    />
                  </div>
                  <div>
                    <Label htmlFor="useConfirmedDate" className="text-xs">Use Confirmed Date</Label>
                    <Input
                      id="useConfirmedDate"
                      type="datetime-local"
                      {...form.register("useConfirmedDate")}
                      className="text-xs"
                    />
                  </div>
                  <div>
                    <Label htmlFor="beingDraftedDate" className="text-xs">Being Drafted Date</Label>
                    <Input
                      id="beingDraftedDate"
                      type="datetime-local"
                      {...form.register("beingDraftedDate")}
                      className="text-xs"
                    />
                  </div>
                  <div>
                    <Label htmlFor="outForSignatureDate" className="text-xs">Out for Signature Date</Label>
                    <Input
                      id="outForSignatureDate"
                      type="datetime-local"
                      {...form.register("outForSignatureDate")}
                      className="text-xs"
                    />
                  </div>
                  <div>
                    <Label htmlFor="paymentReceivedDate" className="text-xs">Payment Received Date</Label>
                    <Input
                      id="paymentReceivedDate"
                      type="datetime-local"
                      {...form.register("paymentReceivedDate")}
                      className="text-xs"
                    />
                  </div>
                  <div>
                    <Label htmlFor="completedDate" className="text-xs">Completed Date</Label>
                    <Input
                      id="completedDate"
                      type="datetime-local"
                      {...form.register("completedDate")}
                      className="text-xs"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  {...form.register("notes")}
                  placeholder="Additional notes about this deal"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex space-x-4 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-brand-primary hover:bg-blue-700"
              disabled={createDealMutation.isPending}
              onClick={(e) => {
                console.log("Submit button clicked");
                console.log("Form is valid:", form.formState.isValid);
                console.log("Form errors:", form.formState.errors);
                console.log("Form values:", form.getValues());
              }}
            >
              {createDealMutation.isPending ? "Creating..." : "Create Deal"}
            </Button>
          </div>
        </form>
      </DialogContent>
      
      {/* Add Contact Dialog */}
      <Dialog open={showAddContact} onOpenChange={setShowAddContact}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Contact</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="newContactName">Name *</Label>
                <Input
                  id="newContactName"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  placeholder="Contact name"
                />
              </div>
              <div>
                <Label htmlFor="newContactEmail">Email *</Label>
                <Input
                  id="newContactEmail"
                  type="email"
                  value={newContactEmail}
                  onChange={(e) => setNewContactEmail(e.target.value)}
                  placeholder="contact@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="newContactPhone">Phone</Label>
                <Input
                  id="newContactPhone"
                  type="tel"
                  value={newContactPhone}
                  onChange={(e) => setNewContactPhone(formatPhoneNumber(e.target.value))}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <Label htmlFor="newContactCompany">Company</Label>
                <Input
                  id="newContactCompany"
                  value={newContactCompany}
                  onChange={(e) => setNewContactCompany(e.target.value)}
                  placeholder="Company name"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="newContactRole">Role</Label>
              <Input
                id="newContactRole"
                value={newContactRole}
                onChange={(e) => setNewContactRole(e.target.value)}
                placeholder="e.g., Music Supervisor, Producer"
              />
            </div>

            <div>
              <Label htmlFor="newContactProjects">Current Projects</Label>
              <Textarea
                id="newContactProjects"
                value={newContactProjects}
                onChange={(e) => setNewContactProjects(e.target.value)}
                placeholder="List current projects or disco links"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="newContactNotes">Additional Notes</Label>
              <Textarea
                id="newContactNotes"
                value={newContactNotes}
                onChange={(e) => setNewContactNotes(e.target.value)}
                placeholder="Any additional notes about this contact"
                rows={2}
              />
            </div>

            <div className="flex space-x-4 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowAddContact(false)} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={handleAddContact}
                className="flex-1 bg-brand-primary hover:bg-blue-700"
                disabled={createContactMutation.isPending}
              >
                {createContactMutation.isPending ? "Adding..." : "Add Contact"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}