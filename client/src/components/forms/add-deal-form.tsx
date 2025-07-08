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
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Deal added successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/deals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      form.reset();
      onClose();
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
    // Validate required fields before submission
    if (!data.projectName || !data.projectType || !data.songId || !data.contactId) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in all required fields: Project Name, Project Type, Song, and Contact",
        variant: "destructive"
      });
      return;
    }
    
    createDealMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Deal</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="projectName">Project Name *</Label>
              <Input
                id="projectName"
                {...form.register("projectName")}
                placeholder="Enter project name"
              />
              {form.formState.errors.projectName && (
                <p className="text-sm text-red-600">{form.formState.errors.projectName.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="projectType">Project Type *</Label>
              <Select onValueChange={(value) => form.setValue("projectType", value)}>
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
                  <SelectItem value="podcast">Podcast</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                  <SelectItem value="streaming">Streaming Platform</SelectItem>
                  <SelectItem value="tv">TV Series</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
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
              <Select onValueChange={(value) => form.setValue("songId", parseInt(value))}>
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
            </div>
            
            <div>
              <Label htmlFor="contactId">Contact *</Label>
              <Select onValueChange={(value) => {
                if (value === "add_new") {
                  setShowAddContact(true);
                } else {
                  form.setValue("contactId", parseInt(value));
                }
              }}>
                <SelectTrigger>
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
              <Label htmlFor="territory">Territory</Label>
              <Input
                id="territory"
                {...form.register("territory")}
                placeholder="e.g., Worldwide, US Only"
              />
            </div>
            
            <div>
              <Label htmlFor="term">Term</Label>
              <Input
                id="term"
                {...form.register("term")}
                placeholder="e.g., Perpetual, 5 years"
              />
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
                  onChange={(e) => setNewContactPhone(e.target.value)}
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
