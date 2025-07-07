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
import { insertDealSchema, type InsertDeal, type Song, type Contact } from "@shared/schema";

interface AddDealFormProps {
  open: boolean;
  onClose: () => void;
}

export default function AddDealForm({ open, onClose }: AddDealFormProps) {
  const { toast } = useToast();
  
  const form = useForm<InsertDeal>({
    resolver: zodResolver(insertDealSchema),
    defaultValues: {
      projectName: "",
      projectType: "",
      projectDescription: "",
      songId: 0,
      contactId: 0,
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
      // Convert date fields to proper ISO strings
      const processedData = {
        ...data,
        pitchDate: data.pitchDate ? new Date(data.pitchDate).toISOString() : new Date().toISOString(),
        dealValue: data.dealValue ? parseFloat(data.dealValue.toString()) : undefined,
      };
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

  const onSubmit = (data: InsertDeal) => {
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
                  <SelectItem value="film">Film</SelectItem>
                  <SelectItem value="tv">TV Series</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="game">Video Game</SelectItem>
                  <SelectItem value="streaming">Streaming Platform</SelectItem>
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
              <Select onValueChange={(value) => form.setValue("contactId", parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a contact" />
                </SelectTrigger>
                <SelectContent>
                  {contacts.map((contact) => (
                    <SelectItem key={contact.id} value={contact.id.toString()}>
                      {contact.name} - {contact.company}
                    </SelectItem>
                  ))}
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
    </Dialog>
  );
}
