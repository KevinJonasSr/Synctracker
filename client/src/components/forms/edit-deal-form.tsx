import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { insertDealSchema, type InsertDeal, type Song, type Contact, type DealWithRelations } from "@shared/schema";

interface EditDealFormProps {
  deal: DealWithRelations | null;
  open: boolean;
  onClose: () => void;
}

export default function EditDealForm({ deal, open, onClose }: EditDealFormProps) {
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
      fullSongValue: undefined,
      ourFee: undefined,
      usage: "",
      territory: "worldwide",
      term: "",
      exclusivity: false,
      notes: "",
      airDate: "",
      pitchDate: undefined,
    },
  });

  // Update form values when deal changes
  useEffect(() => {
    if (deal) {
      form.reset({
        projectName: deal.projectName || "",
        projectType: deal.projectType || "",
        projectDescription: deal.projectDescription || "",
        songId: deal.songId,
        contactId: deal.contactId,
        status: deal.status,
        dealValue: deal.dealValue || undefined,
        fullSongValue: deal.fullSongValue || undefined,
        ourFee: deal.ourFee || undefined,
        usage: deal.usage || "",
        territory: deal.territory || "worldwide",
        term: deal.term || "",
        exclusivity: deal.exclusivity || false,
        notes: deal.notes || "",
        airDate: deal.airDate ? new Date(deal.airDate).toISOString().split('T')[0] : "",
        pitchDate: deal.pitchDate ? new Date(deal.pitchDate).toISOString().split('T')[0] : undefined,
      });
    }
  }, [deal, form]);

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

  const updateDealMutation = useMutation({
    mutationFn: async (dealData: InsertDeal) => {
      if (!deal) return;
      const response = await apiRequest('PUT', `/api/deals/${deal.id}`, dealData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/deals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['/api/calendar-events'] });
      toast({
        title: "Deal updated successfully",
        description: "The deal has been updated.",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error updating deal",
        description: "Failed to update the deal. Please try again.",
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
    // Format dates properly
    const formattedData = {
      ...data,
      airDate: data.airDate ? new Date(data.airDate).toISOString() : null,
      pitchDate: data.pitchDate ? new Date(data.pitchDate).toISOString() : null,
    };

    updateDealMutation.mutate(formattedData);
  };

  if (!deal) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Deal: {deal.projectName}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
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
              <Label htmlFor="projectType">Project Type *</Label>
              <Select 
                value={form.watch("projectType")} 
                onValueChange={(value) => form.setValue("projectType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select project type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tv">TV Show</SelectItem>
                  <SelectItem value="film">Film</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="game">Video Game</SelectItem>
                  <SelectItem value="documentary">Documentary</SelectItem>
                  <SelectItem value="podcast">Podcast</SelectItem>
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
              placeholder="Brief description of the project"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="songId">Song *</Label>
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
            </div>
            <div>
              <Label htmlFor="contactId">Contact *</Label>
              <div className="flex space-x-2">
                <Select
                  value={form.watch("contactId")?.toString()}
                  onValueChange={(value) => form.setValue("contactId", parseInt(value))}
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
                  Add New
                </Button>
              </div>
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
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="fullSongValue">100% Song Value ($)</Label>
              <Input
                id="fullSongValue"
                type="number"
                step="0.01"
                min="0"
                {...form.register("fullSongValue", { valueAsNumber: true })}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
              <Label htmlFor="usage">Usage</Label>
              <Input
                id="usage"
                {...form.register("usage")}
                placeholder="e.g., Background music, Main theme"
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="term">Term</Label>
              <Input
                id="term"
                {...form.register("term")}
                placeholder="e.g., 5 years, In perpetuity"
              />
            </div>
            <div className="flex items-center space-x-2 pt-6">
              <Switch
                id="exclusivity"
                checked={form.watch("exclusivity")}
                onCheckedChange={(checked) => form.setValue("exclusivity", checked)}
              />
              <Label htmlFor="exclusivity">Exclusive</Label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="airDate">Air Date</Label>
              <Input
                id="airDate"
                type="date"
                {...form.register("airDate")}
              />
            </div>
            <div>
              <Label htmlFor="pitchDate">Pitch Date</Label>
              <Input
                id="pitchDate"
                type="date"
                {...form.register("pitchDate")}
              />
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

          <div className="flex space-x-4 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-brand-primary hover:bg-blue-700"
              disabled={updateDealMutation.isPending}
            >
              {updateDealMutation.isPending ? "Updating..." : "Update Deal"}
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