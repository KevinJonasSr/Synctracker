import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import ComprehensiveSongForm from "@/components/forms/comprehensive-song-form";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Music, Play, Edit, Trash2 } from "lucide-react";
import type { Song } from "@shared/schema";

export default function Songs() {
  const [showAddSong, setShowAddSong] = useState(false);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: songs = [], isLoading } = useQuery<Song[]>({
    queryKey: ["/api/songs", searchQuery],
    queryFn: async () => {
      const url = new URL("/api/songs", window.location.origin);
      if (searchQuery) {
        url.searchParams.set("search", searchQuery);
      }
      const response = await fetch(url.toString());
      return response.json();
    },
  });

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "N/A";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-gray-600">Loading songs...</div>
      </div>
    );
  }

  return (
    <div>
      <Header
        title="Song Database"
        description="Manage your music catalog with comprehensive metadata"
        searchPlaceholder="Search songs, artists, albums..."
        newItemLabel="Add Song"
        onSearch={setSearchQuery}
        onNewItem={() => setShowAddSong(true)}
      />
      
      <div className="p-6">
        {songs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Music className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No songs found</h3>
              <p className="text-gray-600 text-center mb-6">
                {searchQuery 
                  ? "No songs match your search criteria. Try adjusting your search terms."
                  : "Start building your music catalog by adding your first song."
                }
              </p>
              <Button onClick={() => setShowAddSong(true)} className="bg-brand-primary hover:bg-blue-700">
                Add Your First Song
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {songs.map((song) => (
              <Card key={song.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-brand-primary/10 rounded-lg flex items-center justify-center">
                        <Music className="h-8 w-8 text-brand-primary" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{song.title}</h3>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <Play className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <p className="text-gray-600 mb-2">by {song.artist}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          {song.genre && (
                            <Badge variant="secondary">{song.genre}</Badge>
                          )}
                          {song.mood && (
                            <Badge variant="outline">{song.mood}</Badge>
                          )}
                          {song.tags && song.tags.length > 0 && (
                            song.tags.map((tag, index) => (
                              <Badge key={index} variant="outline">{tag}</Badge>
                            ))
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Album:</span> {song.album || "N/A"}
                          </div>
                          <div>
                            <span className="font-medium">Duration:</span> {song.durationFormatted || formatDuration(song.duration)}
                          </div>
                          <div>
                            <span className="font-medium">BPM/Key:</span> {song.bpmKey || `${song.bpm || "N/A"} / ${song.key || "N/A"}`}
                          </div>
                          <div>
                            <span className="font-medium">Genre:</span> {song.genreSubGenre || song.genre || "N/A"}
                          </div>
                          {song.composer && (
                            <div>
                              <span className="font-medium">Composer:</span> {song.composer}
                            </div>
                          )}
                          {song.producer && (
                            <div>
                              <span className="font-medium">Producer:</span> {song.producer}
                            </div>
                          )}
                          {song.isrc && (
                            <div>
                              <span className="font-medium">ISRC:</span> {song.isrc}
                            </div>
                          )}
                          {song.publisher && (
                            <div>
                              <span className="font-medium">Publisher:</span> {song.publisher}
                            </div>
                          )}
                        </div>
                        
                        {/* Ownership Information */}
                        {(song.publishingOwnership || song.masterOwnership) && (
                          <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-center space-x-4 text-sm">
                              <div className="font-semibold text-green-800">Your Ownership:</div>
                              {song.publishingOwnership && (
                                <div className="text-green-700">
                                  <span className="font-medium">Publishing: {song.publishingOwnership}%</span>
                                </div>
                              )}
                              {song.masterOwnership && (
                                <div className="text-green-700">
                                  <span className="font-medium">Master: {song.masterOwnership}%</span>
                                </div>
                              )}
                            </div>
                            {song.splitDetails && (
                              <p className="text-xs text-green-600 mt-1">{song.splitDetails}</p>
                            )}
                          </div>
                        )}
                        
                        {song.description && (
                          <p className="text-sm text-gray-600 mt-3">{song.description}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setEditingSong(song)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add Song Form */}
      <ComprehensiveSongForm 
        open={showAddSong} 
        onClose={() => setShowAddSong(false)} 
      />
      
      {/* Edit Song Form */}
      <ComprehensiveSongForm 
        open={!!editingSong} 
        onClose={() => setEditingSong(null)} 
        song={editingSong}
      />
    </div>
  );
}
