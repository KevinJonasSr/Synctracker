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
  deal?: any; // For editing existing deals
}

export default function ComprehensiveAddDealForm({ open, onClose, deal }: ComprehensiveAddDealFormProps) {
  const { toast } = useToast();
  const isEditing = !!deal;
  const [showAddContact, setShowAddContact] = useState(false);
  const [showAddLicenseeContact, setShowAddLicenseeContact] = useState(false);
  const [showAddClearanceContact, setShowAddClearanceContact] = useState(false);
  const [newContactName, setNewContactName] = useState("");
  const [newContactEmail, setNewContactEmail] = useState("");
  const [newContactPhone, setNewContactPhone] = useState("");
  const [newContactCompany, setNewContactCompany] = useState("");
  const [newContactRole, setNewContactRole] = useState("");
  const [newContactNotes, setNewContactNotes] = useState("");
  const [newContactProjects, setNewContactProjects] = useState("");
  
  const form = useForm<InsertDeal>({
    // Remove strict validation for now
    // resolver: zodResolver(insertDealSchema),
    shouldFocusError: false, // Prevent auto-focus on validation errors
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
      clearanceCompanyAddress: deal?.clearanceCompanyAddress || "",
      clearanceCompanyContactName: deal?.clearanceCompanyContactName || "",
      clearanceCompanyContactEmail: deal?.clearanceCompanyContactEmail || "",
      clearanceCompanyContactPhone: deal?.clearanceCompanyContactPhone || "",
      
      status: deal?.status || "new_request",
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
      media: deal?.media || "",
      territory: deal?.territory || "worldwide",
      term: deal?.term || "",
      exclusivity: deal?.exclusivity || false,
      exclusivityRestrictions: deal?.exclusivityRestrictions || "",
      
      // Song Information
      writers: deal?.writers || "",
      publishingInfo: deal?.publishingInfo || "",
      splits: deal?.splits || "",
      artist: deal?.artist || "",
      label: deal?.label || "",
      artistLabelSplits: deal?.artistLabelSplits || "",
      
      notes: deal?.notes || "",
      airDate: deal?.airDate ? new Date(deal.airDate).toISOString().split('T')[0] : "",
      pitchDate: deal?.pitchDate ? new Date(deal.pitchDate).toISOString().split('T')[0] : undefined,
    },
  });

  // Reset form when deal prop changes
  useEffect(() => {
    form.reset({
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
      clearanceCompanyAddress: deal?.clearanceCompanyAddress || "",
      clearanceCompanyContactName: deal?.clearanceCompanyContactName || "",
      clearanceCompanyContactEmail: deal?.clearanceCompanyContactEmail || "",
      clearanceCompanyContactPhone: deal?.clearanceCompanyContactPhone || "",
      
      status: deal?.status || "new_request",
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
      media: deal?.media || "",
      territory: deal?.territory || "worldwide",
      term: deal?.term || "",
      exclusivity: deal?.exclusivity || false,
      exclusivityRestrictions: deal?.exclusivityRestrictions || "",
      
      // Song Information
      writers: deal?.writers || "",
      publishingInfo: deal?.publishingInfo || "",
      splits: deal?.splits || "",
      artist: deal?.artist || "",
      label: deal?.label || "",
      artistLabelSplits: deal?.artistLabelSplits || "",
      
      notes: deal?.notes || "",
      airDate: deal?.airDate ? new Date(deal.airDate).toISOString().split('T')[0] : "",
      pitchDate: deal?.pitchDate ? new Date(deal.pitchDate).toISOString().split('T')[0] : undefined,
    });
  }, [deal, form]);

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
      const response = await apiRequest('/api/contacts', { method: 'POST', body: contactData });
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
      const endpoint = isEditing ? `/api/deals/${deal.id}` : "/api/deals";
      const method = isEditing ? "PUT" : "POST";
      const response = await apiRequest(endpoint, { method, body: processedData });
      return response.json();
    },
    onSuccess: async (newDeal) => {
      queryClient.invalidateQueries({ queryKey: ["/api/deals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      
      // Auto-create calendar event if airdate is set
      if (newDeal.airDate) {
        try {
          await apiRequest("/api/calendar-events", {
            method: "POST",
            body: {
              title: `Air Date: ${newDeal.projectName}`,
              description: `Air date for ${newDeal.projectName}`,
              eventDate: newDeal.airDate,
              entityType: "deal",
              entityId: newDeal.id
            }
          });
          queryClient.invalidateQueries({ queryKey: ["/api/calendar-events"] });
        } catch (error) {
          console.log("Failed to create calendar event:", error);
        }
      }
      
      form.reset();
      onClose();
      toast({
        title: isEditing ? "Deal Updated" : "Deal Added",
        description: isEditing 
          ? "Deal has been successfully updated"
          : (newDeal.airDate 
              ? "Deal has been added to the pipeline and calendar event created for air date"
              : "Deal has been successfully added to the pipeline")
      });
    },
    onError: (error) => {
      console.error("Error creating deal:", error);
      toast({
        title: isEditing ? "Error Updating Deal" : "Error Creating Deal",
        description: isEditing 
          ? "There was an error updating the deal. Please try again."
          : "There was an error creating the deal. Please try again.",
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

  // Function to parse splits percentage from text
  const parseOurSplitPercentage = (splitsText: string): number => {
    if (!splitsText) return 50; // Default to 50% if no splits info
    
    // Common patterns to look for our percentage
    const patterns = [
      /our\s*(?:share|split|percentage|%):?\s*(\d+)%?/i,
      /we\s*(?:get|receive|own):?\s*(\d+)%?/i,
      /(\d+)%?\s*(?:our|ours|us)/i,
      /(\d+)%?\s*writer/i, // Assuming we're the writer
      /(\d+)%?\s*publisher/i, // Assuming we're the publisher
    ];
    
    for (const pattern of patterns) {
      const match = splitsText.match(pattern);
      if (match && match[1]) {
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
    const ourPercentage = parseOurSplitPercentage(splitsText);
    return (fullFee * ourPercentage) / 100;
  };

  const onSubmit = (data: InsertDeal) => {
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
                    onValueChange={(value) => {
                      form.setValue("status", value);
                      
                      // Auto-populate corresponding status date
                      const now = new Date().toISOString().slice(0, 16); // Format for datetime-local
                      
                      // Clear all status dates first
                      form.setValue("pitchedDate", null);
                      form.setValue("pendingApprovalDate", null);
                      form.setValue("quotedDate", null);
                      form.setValue("useConfirmedDate", null);
                      form.setValue("beingDraftedDate", null);
                      form.setValue("outForSignatureDate", null);
                      form.setValue("paymentReceivedDate", null);
                      form.setValue("completedDate", null);
                      
                      // Set the appropriate status date
                      if (value === 'new request') {
                        form.setValue("pitchedDate", now);
                      } else if (value === 'pending approval') {
                        form.setValue("pendingApprovalDate", now);
                      } else if (value === 'quoted') {
                        form.setValue("quotedDate", now);
                      } else if (value === 'use confirmed') {
                        form.setValue("useConfirmedDate", now);
                      } else if (value === 'being drafted') {
                        form.setValue("beingDraftedDate", now);
                      } else if (value === 'out for signature') {
                        form.setValue("outForSignatureDate", now);
                      } else if (value === 'payment received') {
                        form.setValue("paymentReceivedDate", now);
                      } else if (value === 'completed') {
                        form.setValue("completedDate", now);
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
                    <div className="flex space-x-2">
                      <Select
                        value=""
                        onValueChange={(value) => {
                          const contactId = parseInt(value);
                          const selectedContact = contacts.find(c => c.id === contactId);
                          if (selectedContact) {
                            // Auto-fill all fields from selected contact
                            form.setValue("licenseeCompanyName", selectedContact.company || "");
                            form.setValue("licenseeContactName", selectedContact.name);
                            form.setValue("licenseeContactEmail", selectedContact.email || "");
                            form.setValue("licenseeContactPhone", selectedContact.phone || "");
                            // Use notes as address if available
                            const addressMatch = selectedContact.notes?.match(/Address:\s*(.+?)(?:\n|$)/i);
                            if (addressMatch) {
                              form.setValue("licenseeAddress", addressMatch[1]);
                            }
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Contact Name" />
                        </SelectTrigger>
                        <SelectContent>
                          {contacts
                            .filter(contact => contact.company) // Only show contacts with companies
                            .map((contact) => (
                            <SelectItem key={contact.id} value={contact.id.toString()}>
                              {contact.name} - {contact.company}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowAddLicenseeContact(true)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
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
                    <Label htmlFor="contactId">Supervisor Name *</Label>
                    <div className="flex space-x-2">
                      <Select
                        value={form.watch("contactId")?.toString() || ""}
                        onValueChange={(value) => {
                          const contactId = parseInt(value);
                          form.setValue("contactId", contactId);
                          
                          // Auto-populate music supervisor fields with selected contact
                          const selectedContact = contacts.find(c => c.id === contactId);
                          if (selectedContact) {
                            form.setValue("musicSupervisorName", selectedContact.name);
                            form.setValue("musicSupervisorContactName", selectedContact.company || "");
                            form.setValue("musicSupervisorContactEmail", selectedContact.email || "");
                            form.setValue("musicSupervisorContactPhone", selectedContact.phone || "");
                            // Use notes as address if available
                            const addressMatch = selectedContact.notes?.match(/Address:\s*(.+?)(?:\n|$)/i);
                            if (addressMatch) {
                              form.setValue("musicSupervisorAddress", addressMatch[1]);
                            }
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select supervisor" />
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
                    <div className="flex space-x-2">
                      <Select
                        value=""
                        onValueChange={(value) => {
                          const contactId = parseInt(value);
                          const selectedContact = contacts.find(c => c.id === contactId);
                          if (selectedContact) {
                            // Auto-fill all fields from selected contact
                            form.setValue("clearanceCompanyName", selectedContact.company || "");
                            form.setValue("clearanceCompanyContactName", selectedContact.name);
                            form.setValue("clearanceCompanyContactEmail", selectedContact.email || "");
                            form.setValue("clearanceCompanyContactPhone", selectedContact.phone || "");
                            // Use notes as address if available
                            const addressMatch = selectedContact.notes?.match(/Address:\s*(.+?)(?:\n|$)/i);
                            if (addressMatch) {
                              form.setValue("clearanceCompanyAddress", addressMatch[1]);
                            }
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Contact Name" />
                        </SelectTrigger>
                        <SelectContent>
                          {contacts
                            .filter(contact => contact.company) // Only show contacts with companies
                            .map((contact) => (
                            <SelectItem key={contact.id} value={contact.id.toString()}>
                              {contact.name} - {contact.company}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowAddClearanceContact(true)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
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
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="songId">Song Title *</Label>
                  <Select
                    value={form.watch("songId")?.toString()}
                    onValueChange={(value) => {
                      const songId = parseInt(value);
                      form.setValue("songId", songId);
                      
                      // Auto-populate song information fields
                      const selectedSong = songs.find(s => s.id === songId);
                      if (selectedSong) {
                        // Auto-populate Writers field
                        if (selectedSong.composer) {
                          form.setValue("writers", selectedSong.composer);
                        }
                        
                        // Auto-populate Publishing Information
                        if (selectedSong.publisher) {
                          form.setValue("publishingInfo", selectedSong.publisher);
                        }
                        
                        // Auto-populate Artist field
                        if (selectedSong.artist) {
                          form.setValue("artist", selectedSong.artist);
                        }
                        
                        // Auto-populate Label field from producer field
                        if (selectedSong.producer) {
                          form.setValue("label", selectedSong.producer);
                        }
                        
                        // Set splits to default 50/50 if not specified
                        if (!form.watch("splits")) {
                          form.setValue("splits", "50% Writer / 50% Publisher");
                        }
                        
                        // Set artist/label splits to default if not specified
                        if (!form.watch("artistLabelSplits")) {
                          form.setValue("artistLabelSplits", "50% Artist / 50% Label");
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
                    {...form.register("splits", {
                      onChange: (e) => {
                        // Recalculate fees when splits change
                        const splitsText = e.target.value;
                        const fullPublishingFee = form.watch("fullSongValue") || 0;
                        const fullRecordingFee = form.watch("fullRecordingFee") || 0;
                        
                        if (fullPublishingFee > 0) {
                          const ourPublishingFee = calculateOurFee(fullPublishingFee, splitsText);
                          form.setValue("ourFee", Math.round(ourPublishingFee * 100) / 100);
                        }
                        
                        if (fullRecordingFee > 0) {
                          const ourRecordingFee = calculateOurFee(fullRecordingFee, splitsText);
                          form.setValue("ourRecordingFee", Math.round(ourRecordingFee * 100) / 100);
                        }
                      }
                    })}
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
                    {...form.register("fullSongValue", { 
                      valueAsNumber: true,
                      onChange: (e) => {
                        const fullFee = parseFloat(e.target.value) || 0;
                        const splitsText = form.watch("splits") || "";
                        const ourFee = calculateOurFee(fullFee, splitsText);
                        form.setValue("ourFee", Math.round(ourFee * 100) / 100); // Round to 2 decimal places
                      }
                    })}
                    placeholder="0.00"
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
                    {...form.register("fullRecordingFee", { 
                      valueAsNumber: true,
                      onChange: (e) => {
                        const fullFee = parseFloat(e.target.value) || 0;
                        const splitsText = form.watch("splits") || "";
                        const ourFee = calculateOurFee(fullFee, splitsText);
                        form.setValue("ourRecordingFee", Math.round(ourFee * 100) / 100);
                      }
                    })}
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
              {/* Status Change Dates */}
              <div>
                <Label className="text-sm font-medium text-green-800">Status Timeline</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <Label htmlFor="pitchedDate" className="text-xs">New Request Date</Label>
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

            >
              {createDealMutation.isPending 
                ? (isEditing ? "Updating..." : "Creating...") 
                : (isEditing ? "Update Deal" : "Create Deal")}
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

      {/* Add Licensee Contact Dialog */}
      <Dialog open={showAddLicenseeContact} onOpenChange={setShowAddLicenseeContact}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Licensee/Production Company Contact</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="newLicenseeContactName">Contact Name *</Label>
                <Input
                  id="newLicenseeContactName"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  placeholder="Contact person name"
                />
              </div>
              <div>
                <Label htmlFor="newLicenseeCompanyName">Company Name *</Label>
                <Input
                  id="newLicenseeCompanyName"
                  value={newContactCompany}
                  onChange={(e) => setNewContactCompany(e.target.value)}
                  placeholder="Production company name"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="newLicenseeEmail">Email *</Label>
                <Input
                  id="newLicenseeEmail"
                  type="email"
                  value={newContactEmail}
                  onChange={(e) => setNewContactEmail(e.target.value)}
                  placeholder="contact@company.com"
                />
              </div>
              <div>
                <Label htmlFor="newLicenseePhone">Phone</Label>
                <Input
                  id="newLicenseePhone"
                  type="tel"
                  value={newContactPhone}
                  onChange={(e) => setNewContactPhone(formatPhoneNumber(e.target.value))}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="newLicenseeNotes">Address</Label>
              <Textarea
                id="newLicenseeNotes"
                value={newContactNotes}
                onChange={(e) => setNewContactNotes(e.target.value)}
                placeholder="Company address"
                rows={2}
              />
            </div>

            <div className="flex space-x-4 pt-4">
              <Button type="button" variant="outline" onClick={() => {
                setShowAddLicenseeContact(false);
                setNewContactName("");
                setNewContactEmail("");
                setNewContactPhone("");
                setNewContactCompany("");
                setNewContactNotes("");
              }} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  if (!newContactName.trim() || !newContactEmail.trim() || !newContactCompany.trim()) {
                    toast({
                      title: "Missing required fields",
                      description: "Please provide contact name, email, and company name.",
                      variant: "destructive",
                    });
                    return;
                  }

                  const contactData = {
                    name: newContactName.trim(),
                    email: newContactEmail.trim(),
                    phone: newContactPhone.trim() || null,
                    company: newContactCompany.trim(),
                    role: "Licensee Contact",
                    notes: `Address: ${newContactNotes.trim()}`.trim() || null,
                  };

                  createContactMutation.mutate(contactData);
                  
                  // Auto-populate licensee fields
                  form.setValue("licenseeCompanyName", newContactCompany.trim());
                  form.setValue("licenseeContactName", newContactName.trim());
                  form.setValue("licenseeContactEmail", newContactEmail.trim());
                  form.setValue("licenseeContactPhone", newContactPhone.trim());
                  form.setValue("licenseeAddress", newContactNotes.trim());
                  
                  setShowAddLicenseeContact(false);
                  setNewContactName("");
                  setNewContactEmail("");
                  setNewContactPhone("");
                  setNewContactCompany("");
                  setNewContactNotes("");
                }}
                className="flex-1 bg-brand-primary hover:bg-blue-700"
                disabled={createContactMutation.isPending}
              >
                {createContactMutation.isPending ? "Adding..." : "Add Contact"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Clearance Company Contact Dialog */}
      <Dialog open={showAddClearanceContact} onOpenChange={setShowAddClearanceContact}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Clearance Company Contact</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="newClearanceContactName">Contact Name *</Label>
                <Input
                  id="newClearanceContactName"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  placeholder="Contact person name"
                />
              </div>
              <div>
                <Label htmlFor="newClearanceCompanyName">Company Name *</Label>
                <Input
                  id="newClearanceCompanyName"
                  value={newContactCompany}
                  onChange={(e) => setNewContactCompany(e.target.value)}
                  placeholder="Clearance company name"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="newClearanceEmail">Email *</Label>
                <Input
                  id="newClearanceEmail"
                  type="email"
                  value={newContactEmail}
                  onChange={(e) => setNewContactEmail(e.target.value)}
                  placeholder="contact@clearance.com"
                />
              </div>
              <div>
                <Label htmlFor="newClearancePhone">Phone</Label>
                <Input
                  id="newClearancePhone"
                  type="tel"
                  value={newContactPhone}
                  onChange={(e) => setNewContactPhone(formatPhoneNumber(e.target.value))}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="newClearanceNotes">Address</Label>
              <Textarea
                id="newClearanceNotes"
                value={newContactNotes}
                onChange={(e) => setNewContactNotes(e.target.value)}
                placeholder="Company address"
                rows={2}
              />
            </div>

            <div className="flex space-x-4 pt-4">
              <Button type="button" variant="outline" onClick={() => {
                setShowAddClearanceContact(false);
                setNewContactName("");
                setNewContactEmail("");
                setNewContactPhone("");
                setNewContactCompany("");
                setNewContactNotes("");
              }} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  if (!newContactName.trim() || !newContactEmail.trim() || !newContactCompany.trim()) {
                    toast({
                      title: "Missing required fields",
                      description: "Please provide contact name, email, and company name.",
                      variant: "destructive",
                    });
                    return;
                  }

                  const contactData = {
                    name: newContactName.trim(),
                    email: newContactEmail.trim(),
                    phone: newContactPhone.trim() || null,
                    company: newContactCompany.trim(),
                    role: "Clearance Contact",
                    notes: `Address: ${newContactNotes.trim()}`.trim() || null,
                  };

                  createContactMutation.mutate(contactData);
                  
                  // Auto-populate clearance fields
                  form.setValue("clearanceCompanyName", newContactCompany.trim());
                  form.setValue("clearanceCompanyContactName", newContactName.trim());
                  form.setValue("clearanceCompanyContactEmail", newContactEmail.trim());
                  form.setValue("clearanceCompanyContactPhone", newContactPhone.trim());
                  form.setValue("clearanceCompanyAddress", newContactNotes.trim());
                  
                  setShowAddClearanceContact(false);
                  setNewContactName("");
                  setNewContactEmail("");
                  setNewContactPhone("");
                  setNewContactCompany("");
                  setNewContactNotes("");
                }}
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