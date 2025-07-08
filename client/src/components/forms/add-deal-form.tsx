import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { insertDealSchema, insertContactSchema, type InsertDeal, type InsertContact, type Song, type Contact } from "@shared/schema";
import { Plus } from "lucide-react";

interface AddDealFormProps {
  open: boolean;
  onClose: () => void;
}

export default function AddDealForm({ open, onClose }: AddDealFormProps) {
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
    defaultValues: {
      projectName: "",
      projectType: "",
      projectDescription: "",
      songId: undefined,
      contactId: undefined,
      status: "pitched",
      dealValue: undefined,
      usage: "",
      territory: "worldwide",
      term: "",
      exclusivity: false,
      notes: "",
      airDate: "",
      pitchDate: undefined,
    },
  });

  const { data: songs = [] } = useQuery<Song[]>({
    queryKey: ["/api/songs"],
  });

  const { data: contacts = [] } = useQuery<Contact[]>({
    queryKey: ["/api/contacts"],
  });

  const createDealMutation = useMutation({
    mutationFn: async (data: InsertDeal) => {
      // Debug: Log the form data
      console.log("Form data:", data);
      
      // Ensure all required fields are present and properly typed
      const processedData = {
        projectName: data.projectName || "",
        projectType: data.projectType || "",
        projectDescription: data.projectDescription || null,
        songId: data.songId ? parseInt(data.songId.toString()) : null,
        contactId: data.contactId ? parseInt(data.contactId.toString()) : null,
        status: data.status || "pitched",
        dealValue: data.dealValue ? parseFloat(data.dealValue.toString()) : null,
        usage: data.usage || null,
        territory: data.territory || "worldwide",
        term: data.term || null,
        exclusivity: data.exclusivity || false,
        notes: data.notes || null,
        pitchDate: data.pitchDate ? new Date(data.pitchDate).toISOString() : null,
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
            title: `${newDeal.projectName} - Air Date`,
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
      toast({
        title: "Error",
        description: "Failed to add deal",
        variant: "destructive",
      });
    },
  });

  const createContactMutation = useMutation({
    mutationFn: async (contactData: InsertContact) => {
      const response = await apiRequest("POST", "/api/contacts", contactData);
      return response.json();
    },
    onSuccess: (newContact) => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      // Auto-select the newly created contact
      form.setValue("contactId", newContact.id);
      setShowAddContact(false);
      resetContactForm();
      toast({
        title: "Contact Created",
        description: "New contact has been added and selected"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create contact",
        variant: "destructive"
      });
    }
  });

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

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setNewContactPhone(formatted);
  };

  const resetContactForm = () => {
    setNewContactName("");
    setNewContactEmail("");
    setNewContactPhone("");
    setNewContactCompany("");
    setNewContactRole("");
    setNewContactNotes("");
    setNewContactProjects("");
  };

  const handleCreateContact = () => {
    if (!newContactName || !newContactEmail) {
      toast({
        title: "Missing Information",
        description: "Please fill in contact name and email",
        variant: "destructive"
      });
      return;
    }

    createContactMutation.mutate({
      name: newContactName,
      email: newContactEmail,
      phone: newContactPhone,
      company: newContactCompany,
      role: newContactRole,
      notes: `${newContactNotes}${newContactProjects ? '\n\nCurrent Projects:\n' + newContactProjects : ''}`
    });
  };

  const onSubmit = (data: InsertDeal) => {
    console.log("Form submitted with data:", data);
    console.log("Form errors:", form.formState.errors);
    console.log("Form values:", form.getValues());
    
    // Get current form values to check what's actually set
    const currentValues = form.getValues();
    
    // Check each required field and set specific errors
    const errors: any = {};
    
    if (!currentValues.projectName || currentValues.projectName.trim() === '') {
      errors.projectName = { message: "Project name is required" };
    }
    
    if (!currentValues.projectType) {
      errors.projectType = { message: "Project type is required" };
    }
    
    if (!currentValues.songId) {
      errors.songId = { message: "Song selection is required" };
    }
    
    if (!currentValues.contactId) {
      errors.contactId = { message: "Contact selection is required" };
    }
    
    // If there are validation errors, set them and return
    if (Object.keys(errors).length > 0) {
      Object.keys(errors).forEach(field => {
        form.setError(field as any, errors[field]);
      });
      
      toast({
        title: "Missing Required Fields",
        description: "Please fill in all required fields highlighted in red",
        variant: "destructive"
      });
      return;
    }
    
    // Process data with proper formatting and type conversion
    const processedData = {
      projectName: data.projectName,
      projectType: data.projectType,
      projectDescription: data.projectDescription || null,
      songId: typeof data.songId === 'string' ? parseInt(data.songId) : data.songId,
      contactId: typeof data.contactId === 'string' ? parseInt(data.contactId) : data.contactId,
      status: data.status || "pitched",
      dealValue: data.dealValue ? parseFloat(data.dealValue.toString()) : null,
      usage: data.usage || null,
      territory: data.territory || "worldwide",
      term: data.term || null,
      exclusivity: data.exclusivity || false,
      notes: data.notes || null,
      airDate: data.airDate ? new Date(data.airDate).toISOString() : null,
      pitchDate: null
    };
    
    console.log("Processed data:", processedData);
    
    createDealMutation.mutate(processedData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Deal</DialogTitle>
        </DialogHeader>
        
        {/* Display validation errors summary */}
        {Object.keys(form.formState.errors).length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
            <h4 className="text-sm font-medium text-red-800 mb-2">Please fix the following errors:</h4>
            <ul className="text-sm text-red-700 space-y-1">
              {Object.entries(form.formState.errors).map(([field, error]) => (
                <li key={field} className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                  {error?.message || `${field} is required`}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <form onSubmit={form.handleSubmit(onSubmit, (errors) => {
          console.log("Form validation errors:", errors);
          toast({
            title: "Form Validation Error",
            description: "Please check the required fields and try again",
            variant: "destructive"
          });
        })} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="projectName">Project Name *</Label>
              <Input
                id="projectName"
                {...form.register("projectName", { required: "Project name is required" })}
                placeholder="Enter project name"
                className={form.formState.errors.projectName ? "border-red-500 focus:border-red-500" : ""}
              />
              {form.formState.errors.projectName && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.projectName.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="projectType">Project Type *</Label>
              <Select onValueChange={(value) => {
                form.setValue("projectType", value);
                // Clear error when valid selection is made  
                form.clearErrors("projectType");
              }} value={form.watch("projectType")}>
                <SelectTrigger className={form.formState.errors.projectType ? "border-red-500 focus:border-red-500" : ""}>
                  <SelectValue placeholder="Select project type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="documentary">Documentary</SelectItem>
                  <SelectItem value="film">Film</SelectItem>
                  <SelectItem value="game">Video Game</SelectItem>
                  <SelectItem value="indie_film">Indie Film</SelectItem>
                  <SelectItem value="non_profit">Non-Profit</SelectItem>
                  <SelectItem value="podcast">Podcast</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                  <SelectItem value="streaming">Streaming Platform</SelectItem>
                  <SelectItem value="tv">TV Series</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.projectType && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.projectType.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="projectDescription">Project Description</Label>
            <Textarea
              id="projectDescription"
              {...form.register("projectDescription")}
              placeholder="Enter project description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="songId">Song *</Label>
              <Select onValueChange={(value) => {
                form.setValue("songId", parseInt(value));
                // Clear error when valid selection is made
                form.clearErrors("songId");
              }} value={form.watch("songId")?.toString()}>
                <SelectTrigger className={form.formState.errors.songId ? "border-red-500 focus:border-red-500" : ""}>
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
              <Select onValueChange={(value) => {
                if (value === "add_new") {
                  setShowAddContact(true);
                } else {
                  form.setValue("contactId", parseInt(value));
                  // Clear error when valid selection is made
                  form.clearErrors("contactId");
                }
              }} value={form.watch("contactId")?.toString()}>
                <SelectTrigger className={form.formState.errors.contactId ? "border-red-500 focus:border-red-500" : ""}>
                  <SelectValue placeholder="Select a contact" />
                </SelectTrigger>
                <SelectContent>
                  {contacts.map((contact) => (
                    <SelectItem key={contact.id} value={contact.id.toString()}>
                      {contact.name} - {contact.company}
                    </SelectItem>
                  ))}
                  <SelectItem value="add_new" className="border-t border-gray-200 mt-1 pt-1">
                    <div className="flex items-center gap-2 text-blue-600">
                      <Plus className="h-4 w-4" />
                      Add New Contact
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.contactId && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.contactId.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dealValue">Deal Value</Label>
              <Input
                id="dealValue"
                type="number"
                step="0.01"
                {...form.register("dealValue")}
                placeholder="Enter deal value"
              />
            </div>
            
            <div>
              <Label htmlFor="usage">Usage</Label>
              <Input
                id="usage"
                {...form.register("usage")}
                placeholder="e.g., Background, Opening, End Credits"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="airDate">Air Date</Label>
              <Input
                id="airDate"
                type="date"
                {...form.register("airDate")}
                placeholder="When will this air?"
              />
            </div>
            
            <div>
              <Label htmlFor="territory">Territory</Label>
              <Input
                id="territory"
                {...form.register("territory")}
                placeholder="e.g., Worldwide, US Only"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="term">Term</Label>
              <Input
                id="term"
                {...form.register("term")}
                placeholder="e.g., Perpetual, 5 years"
              />
            </div>
            
            <div className="flex items-center space-x-2 pt-8">
              <input
                type="checkbox"
                id="exclusivity"
                {...form.register("exclusivity")}
                className="rounded"
              />
              <Label htmlFor="exclusivity">Exclusive Deal</Label>
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...form.register("notes")}
              placeholder="Enter any additional notes"
              rows={3}
            />
          </div>

          <div className="flex space-x-4 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-brand-primary hover:bg-blue-700"
              disabled={createDealMutation.isPending}
            >
              {createDealMutation.isPending ? "Adding..." : "Add Deal"}
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
                  placeholder="email@company.com"
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
                  onChange={handlePhoneChange}
                  placeholder="(555) 123-4567"
                  maxLength={14}
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
                placeholder="Music Supervisor, Creative Director, etc."
              />
            </div>
            
            <div>
              <Label htmlFor="newContactProjects">Current Projects</Label>
              <Textarea
                id="newContactProjects"
                value={newContactProjects}
                onChange={(e) => setNewContactProjects(e.target.value)}
                placeholder="List current shows, films, or projects this contact is working on..."
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="newContactNotes">Notes</Label>
              <Textarea
                id="newContactNotes"
                value={newContactNotes}
                onChange={(e) => setNewContactNotes(e.target.value)}
                placeholder="Additional notes, preferences, or important information..."
                rows={3}
              />
            </div>
            
            <div className="flex space-x-4 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setShowAddContact(false);
                  resetContactForm();
                }} 
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateContact}
                className="flex-1"
                disabled={createContactMutation.isPending}
              >
                {createContactMutation.isPending ? "Creating..." : "Create Contact"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
