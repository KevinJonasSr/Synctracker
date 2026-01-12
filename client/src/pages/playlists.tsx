import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Music, Users, Folder, Play, Edit, Trash2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Playlist, InsertPlaylist, Contact, Song } from "@shared/schema";
import { insertPlaylistSchema } from "@shared/schema";

export default function Playlists() {
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [showSongs, setShowSongs] = useState(false);
  const { toast } = useToast();

  const { data: playlists = [], isLoading } = useQuery<Playlist[]>({
    queryKey: ["/api/playlists"],
  });

  const { data: contacts = [] } = useQuery<Contact[]>({
    queryKey: ["/api/contacts"],
  });

  const { data: songs = [] } = useQuery<Song[]>({
    queryKey: ["/api/songs"],
  });

  const { data: playlistSongs = [] } = useQuery<any[]>({
    queryKey: ["/api/playlist-songs", selectedPlaylist?.id],
    enabled: !!selectedPlaylist,
  });

  const createPlaylistMutation = useMutation({
    mutationFn: async (data: InsertPlaylist) => {
      const response = await apiRequest("/api/playlists", { method: "POST", body: data });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Playlist created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/playlists"] });
      setShowCreatePlaylist(false);
      form.reset();
    },
  });

  const form = useForm<InsertPlaylist>({
    resolver: zodResolver(insertPlaylistSchema),
    defaultValues: {
      name: "",
      description: "",
      type: "custom",
      clientId: undefined,
      isPublic: false,
    },
  });

  const getPlaylistIcon = (type: string) => {
    switch (type) {
      case 'client': return Users;
      case 'genre': return Music;
      case 'mood': return Folder;
      default: return Folder;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'client': return 'bg-blue-100 text-blue-800';
      case 'genre': return 'bg-green-100 text-green-800';
      case 'mood': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-gray-600">Loading playlists...</div>
      </div>
    );
  }

  return (
    <div>
      <Header
        title="Playlists"
        description="Organize songs into collections for pitching and management"
        newItemLabel="Create Playlist"
        onNewItem={() => setShowCreatePlaylist(true)}
      />

      <div className="p-6">
        {playlists.length === 0 ? (
          <div className="text-center py-12">
            <Folder className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No playlists yet</h3>
            <p className="text-gray-600 mb-4">
              Create playlists to organize your songs for specific clients, genres, or projects.
            </p>
            <Button onClick={() => setShowCreatePlaylist(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Playlist
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {playlists.map((playlist) => {
              const PlaylistIcon = getPlaylistIcon(playlist.type);
              const client = contacts.find(c => c.id === playlist.clientId);
              
              return (
                <Card key={playlist.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <PlaylistIcon className="h-5 w-5 text-gray-600" />
                        <CardTitle className="text-lg">{playlist.name}</CardTitle>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedPlaylist(playlist);
                            setShowSongs(true);
                          }}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge className={getTypeColor(playlist.type)}>
                          {playlist.type.charAt(0).toUpperCase() + playlist.type.slice(1)}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          0 songs {/* TODO: Add song count */}
                        </span>
                      </div>
                      
                      {client && (
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Client:</span> {client.name}
                        </div>
                      )}
                      
                      {playlist.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {playlist.description}
                        </p>
                      )}
                      
                      <div className="text-xs text-gray-500">
                        Created {new Date(playlist.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Playlist Dialog */}
      <Dialog open={showCreatePlaylist} onOpenChange={setShowCreatePlaylist}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Playlist</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit((data) => createPlaylistMutation.mutate(data))} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <Input
                {...form.register("name")}
                placeholder="Playlist name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <Select value={form.watch("type")} onValueChange={(value) => form.setValue("type", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">Custom</SelectItem>
                  <SelectItem value="client">Client Specific</SelectItem>
                  <SelectItem value="genre">Genre Collection</SelectItem>
                  <SelectItem value="mood">Mood Collection</SelectItem>
                  <SelectItem value="project">Project Based</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {form.watch("type") === "client" && (
              <div>
                <label className="block text-sm font-medium mb-1">Client</label>
                <Select 
                  value={form.watch("clientId")?.toString() || ""} 
                  onValueChange={(value) => form.setValue("clientId", parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {contacts.map((contact) => (
                      <SelectItem key={contact.id} value={contact.id.toString()}>
                        {contact.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Textarea
                {...form.register("description")}
                placeholder="Describe this playlist..."
                rows={3}
              />
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowCreatePlaylist(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createPlaylistMutation.isPending}>
                {createPlaylistMutation.isPending ? "Creating..." : "Create Playlist"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Playlist Songs Dialog */}
      <Dialog open={showSongs} onOpenChange={setShowSongs}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedPlaylist?.name} - Songs</DialogTitle>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            {playlistSongs.length === 0 ? (
              <div className="text-center py-8">
                <Music className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-gray-600">No songs in this playlist yet.</p>
                <Button className="mt-4">Add Songs</Button>
              </div>
            ) : (
              <div className="space-y-2">
                {playlistSongs.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{item.song?.title}</h4>
                      <p className="text-sm text-gray-600">{item.song?.artist}</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}