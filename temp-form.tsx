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

// Currency formatting functions
const formatCurrency = (value: string | number) => {
  if (!value || value === 0) return '';
  const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]+/g, '')) : value;
  if (isNaN(numValue) || numValue === 0) return '';
  return numValue.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

const parseCurrency = (value: string) => {
  if (!value || value.trim() === '') return null;
  const numValue = parseFloat(value.replace(/[^0-9.-]+/g, ''));
  return isNaN(numValue) ? null : numValue;
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
        dealValue: data.dealValue !== null && data.dealValue !== undefined ? parseFloat(data.dealValue.toString()) : null,
        fullSongValue: data.fullSongValue !== null && data.fullSongValue !== undefined ? parseFloat(data.fullSongValue.toString()) : null,
        ourFee: data.ourFee !== null && data.ourFee !== undefined ? parseFloat(data.ourFee.toString()) : null,
        fullRecordingFee: data.fullRecordingFee !== null && data.fullRecordingFee !== undefined ? parseFloat(data.fullRecordingFee.toString()) : null,
        ourRecordingFee: data.ourRecordingFee !== null && data.ourRecordingFee !== undefined ? parseFloat(data.ourRecordingFee.toString()) : null,
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
              startDate: newDeal.airDate,
              endDate: newDeal.airDate,
              entityType: "deal",
              entityId: newDeal.id,
              status: "scheduled"
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
    if (!fullFee || fullFee === 0) return 0;
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
        
