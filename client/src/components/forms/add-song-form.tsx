import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { insertSongSchema, type InsertSong, type Song } from "@shared/schema";

interface AddSongFormProps {
  open: boolean;
  onClose: () => void;
  onSongCreated?: (song: Song) => void;
}

export default function AddSongForm({ open, onClose, onSongCreated }: AddSongFormProps) {
  const { toast } = useToast();
  
  const form = useForm<InsertSong>({
    resolver: zodResolver(insertSongSchema),
    defaultValues: {
      title: "",
      artist: "",
      album: "",
      genre: "",
      mood: "",
      tempo: undefined,
      duration: undefined,
      key: "",
      bpm: undefined,
      lyrics: "",
      description: "",
      tags: [],
      filePath: "",
      publishingOwnership: undefined,
      masterOwnership: undefined,
      splitDetails: "",
    },
  });

  const createSongMutation = useMutation({
    mutationFn: async (data: InsertSong) => {
      const response = await apiRequest("/api/songs", {
        method: "POST",
        body: data,
      });
      return response.json();
    },
    onSuccess: (newSong) => {
      toast({
        title: "Success",
        description: "Song added successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/songs"] });
      form.reset();
      onClose();
      if (onSongCreated) {
        onSongCreated(newSong);
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add song",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertSong) => {
    // Convert tags string to array
    const tagsArray = data.tags?.length ? data.tags[0].split(",").map(tag => tag.trim()) : [];
    createSongMutation.mutate({
      ...data,
      tags: tagsArray,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Song</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                {...form.register("title")}
                placeholder="Enter song title"
              />
              {form.formState.errors.title && (
                <p className="text-sm text-red-600">{form.formState.errors.title.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="artist">Artist *</Label>
              <Input
                id="artist"
                {...form.register("artist")}
                placeholder="Enter artist name"
              />
              {form.formState.errors.artist && (
                <p className="text-sm text-red-600">{form.formState.errors.artist.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="album">Album</Label>
              <Input
                id="album"
                {...form.register("album")}
                placeholder="Enter album name"
              />
            </div>
            
            <div>
              <Label htmlFor="genre">Genre</Label>
              <Input
                id="genre"
                {...form.register("genre")}
                placeholder="Enter genre"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="mood">Mood</Label>
              <Input
                id="mood"
                {...form.register("mood")}
                placeholder="e.g., Upbeat, Melancholic"
              />
            </div>
            
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="key">Key</Label>
              <Input
                id="key"
                {...form.register("key")}
                placeholder="e.g., C Major, A Minor"
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

          <div>
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              {...form.register("tags.0")}
              placeholder="e.g., Electronic, Dance, Energetic"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...form.register("description")}
              placeholder="Enter song description"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="lyrics">Lyrics</Label>
            <Textarea
              id="lyrics"
              {...form.register("lyrics")}
              placeholder="Enter song lyrics (optional)"
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="filePath">File Path</Label>
            <Input
              id="filePath"
              {...form.register("filePath")}
              placeholder="Enter file path or URL"
            />
          </div>

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
            </div>
          </div>

          <div>
            <Label htmlFor="splitDetails">Split Details (Optional)</Label>
            <Textarea
              id="splitDetails"
              {...form.register("splitDetails")}
              placeholder="Detailed breakdown of ownership splits and agreements"
              rows={2}
            />
          </div>

          <div className="flex space-x-4 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-brand-primary hover:bg-blue-700"
              disabled={createSongMutation.isPending}
            >
              {createSongMutation.isPending ? "Adding..." : "Add Song"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
