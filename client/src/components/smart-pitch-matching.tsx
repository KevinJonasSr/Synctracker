import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain, Target, Sparkles, Calendar, Heart, Users, Music, TrendingUp, Star, FileText, Download, Send, Zap, Filter } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Song, Deal } from "@shared/schema";

interface SyncAnalysis {
  suitability: number;
  reasoning: string;
  sceneMatches: string[];
  emotionalTones: string[];
  narrativeElements: string[];
  recommendedUsage: string[];
  targetDemographics: string[];
  similarReferences: string[];
  themes: string[];
  seasonality: string[];
  occasions: string[];
}

interface PitchRecommendation {
  songId: number;
  songTitle: string;
  matchScore: number;
  analysis: SyncAnalysis;
}

interface ProjectBrief {
  title: string;
  description: string;
  projectType: string;
  targetAudience?: string;
  sceneDescription?: string;
  desiredMood?: string;
  targetDemographics?: string;
  budget?: string;
  timeline?: string;
  brandValues?: string;
}

interface LyricsAnalysis {
  themes: string[];
  emotions: string[];
  narrative: string;
  marketability: number;
  syncPotential: string[];
}

export default function SmartPitchMatching() {
  const [showAnalysisDialog, setShowAnalysisDialog] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [projectBrief, setProjectBrief] = useState<ProjectBrief>({
    title: "",
    description: "",
    projectType: "",
    targetAudience: "",
    sceneDescription: "",
    desiredMood: "",
    targetDemographics: "",
    budget: "",
    timeline: "",
    brandValues: ""
  });
  const [recommendations, setRecommendations] = useState<PitchRecommendation[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedSongs, setSelectedSongs] = useState<number[]>([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [lyricsAnalysis, setLyricsAnalysis] = useState<Record<number, LyricsAnalysis>>({});
  const [savedRecommendations, setSavedRecommendations] = useState<PitchRecommendation[]>([]);
  const { toast } = useToast();

  const { data: songs = [] } = useQuery<Song[]>({
    queryKey: ['/api/songs'],
  });

  const analyzeMatch = async () => {
    if (!projectBrief.title || !projectBrief.description) {
      toast({
        title: "Missing Information",
        description: "Please provide project title and description",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const songsToAnalyze = selectedSongs.length > 0 
        ? songs.filter((song: Song) => selectedSongs.includes(song.id))
        : songs.slice(0, 15); // Increased from 10 to 15 songs
      
      const response = await apiRequest('/api/smart-pitch-analyze', {
        method: 'POST',
        body: {
          songs: songsToAnalyze,
          projectBrief
        }
      });
      const recommendations = await response.json() as PitchRecommendation[];
      
      setRecommendations(recommendations);
      toast({
        title: "Analysis Complete",
        description: `Generated AI recommendations for ${recommendations.length} songs`,
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Could not analyze songs for this project",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeLyrics = async (songId: number, lyrics: string) => {
    try {
      const response = await apiRequest('/api/analyze-lyrics', {
        method: 'POST',
        body: { lyrics }
      });
      const analysis = await response.json() as LyricsAnalysis;
      
      setLyricsAnalysis(prev => ({
        ...prev,
        [songId]: analysis
      }));
      
      toast({
        title: "Lyrics Analysis Complete",
        description: "AI analysis of song lyrics completed",
      });
    } catch (error) {
      toast({
        title: "Lyrics Analysis Failed",
        description: "Could not analyze song lyrics",
        variant: "destructive",
      });
    }
  };

  const exportRecommendations = () => {
    const data = {
      projectBrief,
      recommendations,
      generatedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pitch-recommendations-${projectBrief.title.replace(/\s+/g, '-').toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export Complete",
      description: "Recommendations exported successfully",
    });
  };

  const saveRecommendations = () => {
    setSavedRecommendations(recommendations);
    toast({
      title: "Recommendations Saved",
      description: "Your recommendations have been saved for later use",
    });
  };

  const toggleSongSelection = (songId: number) => {
    setSelectedSongs(prev => 
      prev.includes(songId) 
        ? prev.filter(id => id !== songId)
        : [...prev, songId]
    );
  };

  const selectAllSongs = () => {
    setSelectedSongs(songs.map((song: Song) => song.id));
  };

  const clearSelection = () => {
    setSelectedSongs([]);
  };

  const getSuitabilityColor = (score: number) => {
    if (score >= 8) return "text-green-600 bg-green-50";
    if (score >= 6) return "text-yellow-600 bg-yellow-50";
    if (score >= 4) return "text-orange-600 bg-orange-50";
    return "text-red-600 bg-red-50";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 8) return <Star className="h-4 w-4 text-green-600" />;
    if (score >= 6) return <TrendingUp className="h-4 w-4 text-yellow-600" />;
    return <Target className="h-4 w-4 text-orange-600" />;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Smart Pitch Matching
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Project Title</Label>
              <Input
                id="title"
                value={projectBrief.title}
                onChange={(e) => setProjectBrief({ ...projectBrief, title: e.target.value })}
                placeholder="e.g., Holiday Commercial for Target"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="projectType">Project Type</Label>
              <Select value={projectBrief.projectType} onValueChange={(value) => setProjectBrief({ ...projectBrief, projectType: value })}>
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
                  <SelectItem value="promos">Promos</SelectItem>
                  <SelectItem value="social">Social Media</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                  <SelectItem value="student_film">Student Film</SelectItem>
                  <SelectItem value="trailers">Trailers</SelectItem>
                  <SelectItem value="tv">TV Show</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Project Description</Label>
            <Textarea
              id="description"
              value={projectBrief.description}
              onChange={(e) => setProjectBrief({ ...projectBrief, description: e.target.value })}
              placeholder="Describe the project, its goals, and overall vision..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sceneDescription">Scene Description</Label>
              <Textarea
                id="sceneDescription"
                value={projectBrief.sceneDescription}
                onChange={(e) => setProjectBrief({ ...projectBrief, sceneDescription: e.target.value })}
                placeholder="Describe the specific scenes where music will be used..."
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desiredMood">Desired Mood</Label>
              <Input
                id="desiredMood"
                value={projectBrief.desiredMood}
                onChange={(e) => setProjectBrief({ ...projectBrief, desiredMood: e.target.value })}
                placeholder="e.g., Uplifting, Nostalgic, Energetic"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="targetAudience">Target Audience</Label>
              <Input
                id="targetAudience"
                data-testid="input-target-audience"
                value={projectBrief.targetAudience}
                onChange={(e) => setProjectBrief({ ...projectBrief, targetAudience: e.target.value })}
                placeholder="e.g., Families, Young Adults, Professionals"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetDemographics">Target Demographics</Label>
              <Input
                id="targetDemographics"
                data-testid="input-target-demographics"
                value={projectBrief.targetDemographics}
                onChange={(e) => setProjectBrief({ ...projectBrief, targetDemographics: e.target.value })}
                placeholder="e.g., 25-45, Parents, Urban"
              />
            </div>
          </div>

          {/* Advanced Fields */}
          <div className="space-y-4">
            <Button 
              type="button"
              variant="ghost" 
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="text-sm text-blue-600 hover:text-blue-800"
              data-testid="button-toggle-advanced"
            >
              <Filter className="h-4 w-4 mr-2" />
              {showAdvancedFilters ? 'Hide' : 'Show'} Advanced Options
            </Button>
            
            {showAdvancedFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="budget">Budget Range</Label>
                  <Input
                    id="budget"
                    data-testid="input-budget"
                    value={projectBrief.budget}
                    onChange={(e) => setProjectBrief({ ...projectBrief, budget: e.target.value })}
                    placeholder="e.g., $5,000 - $10,000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeline">Timeline</Label>
                  <Input
                    id="timeline"
                    data-testid="input-timeline"
                    value={projectBrief.timeline}
                    onChange={(e) => setProjectBrief({ ...projectBrief, timeline: e.target.value })}
                    placeholder="e.g., 2 weeks, ASAP"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brandValues">Brand Values</Label>
                  <Input
                    id="brandValues"
                    data-testid="input-brand-values"
                    value={projectBrief.brandValues}
                    onChange={(e) => setProjectBrief({ ...projectBrief, brandValues: e.target.value })}
                    placeholder="e.g., Sustainable, Inclusive"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Song Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Song Selection (Optional)</Label>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={selectAllSongs} data-testid="button-select-all">
                  Select All ({songs.length})
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={clearSelection} data-testid="button-clear-selection">
                  Clear
                </Button>
              </div>
            </div>
            
            {selectedSongs.length > 0 && (
              <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
                {selectedSongs.length} songs selected for analysis
              </div>
            )}
            
            <ScrollArea className="h-32 w-full border rounded-md p-2">
              <div className="grid grid-cols-1 gap-2">
                {songs.slice(0, 20).map((song: Song) => (
                  <div key={song.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`song-${song.id}`}
                      checked={selectedSongs.includes(song.id)}
                      onCheckedChange={() => toggleSongSelection(song.id)}
                      data-testid={`checkbox-song-${song.id}`}
                    />
                    <label htmlFor={`song-${song.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {song.title} - {song.artist}
                    </label>
                    {song.lyrics && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => analyzeLyrics(song.id, song.lyrics!)}
                        className="ml-auto text-xs"
                        data-testid={`button-analyze-lyrics-${song.id}`}
                      >
                        <Zap className="h-3 w-3 mr-1" />
                        Analyze Lyrics
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={analyzeMatch} 
              disabled={isAnalyzing}
              className="flex-1"
              data-testid="button-generate-recommendations"
            >
              {isAnalyzing ? "Analyzing..." : "Generate AI Recommendations"}
              <Sparkles className="ml-2 h-4 w-4" />
            </Button>
            
            {recommendations.length > 0 && (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={saveRecommendations}
                  data-testid="button-save-recommendations"
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button 
                  variant="outline" 
                  onClick={exportRecommendations}
                  data-testid="button-export-recommendations"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>AI Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendations.map((rec) => (
                <Card key={rec.songId} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-lg">{rec.songTitle}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          {getScoreIcon(rec.matchScore)}
                          <span className={`px-2 py-1 rounded-full text-sm font-medium ${getSuitabilityColor(rec.matchScore)}`}>
                            {rec.matchScore}/10 Match
                          </span>
                        </div>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            View Analysis
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>{rec.songTitle} - Sync Analysis</DialogTitle>
                          </DialogHeader>
                          <Tabs defaultValue="overview" className="w-full">
                            <TabsList className="grid w-full grid-cols-4">
                              <TabsTrigger value="overview">Overview</TabsTrigger>
                              <TabsTrigger value="themes">Themes</TabsTrigger>
                              <TabsTrigger value="usage">Usage</TabsTrigger>
                              <TabsTrigger value="references">References</TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="overview" className="space-y-4">
                              <div>
                                <h4 className="font-semibold mb-2">Match Score</h4>
                                <Progress value={rec.matchScore * 10} className="w-full" />
                                <p className="text-sm text-gray-600 mt-1">{rec.matchScore}/10</p>
                              </div>
                              
                              <div>
                                <h4 className="font-semibold mb-2">Analysis Summary</h4>
                                <p className="text-sm leading-relaxed">{rec.analysis.reasoning}</p>
                              </div>
                              
                              <div>
                                <h4 className="font-semibold mb-2">Emotional Tones</h4>
                                <div className="flex flex-wrap gap-2">
                                  {rec.analysis.emotionalTones.map((tone, idx) => (
                                    <Badge key={idx} variant="secondary">
                                      <Heart className="w-3 h-3 mr-1" />
                                      {tone}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </TabsContent>
                            
                            <TabsContent value="themes" className="space-y-4">
                              <div>
                                <h4 className="font-semibold mb-2 flex items-center gap-2">
                                  <Music className="h-4 w-4" />
                                  Core Themes
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {rec.analysis.themes.map((theme, idx) => (
                                    <Badge key={idx} variant="outline">
                                      {theme}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              
                              <Separator />
                              
                              <div>
                                <h4 className="font-semibold mb-2 flex items-center gap-2">
                                  <Calendar className="h-4 w-4" />
                                  Seasonality & Occasions
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <h5 className="font-medium mb-2">Seasonal Relevance</h5>
                                    <div className="flex flex-wrap gap-2">
                                      {rec.analysis.seasonality.map((season, idx) => (
                                        <Badge key={idx} className="bg-blue-100 text-blue-800">
                                          {season}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                  <div>
                                    <h5 className="font-medium mb-2">Special Occasions</h5>
                                    <div className="flex flex-wrap gap-2">
                                      {rec.analysis.occasions.map((occasion, idx) => (
                                        <Badge key={idx} className="bg-purple-100 text-purple-800">
                                          {occasion}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </TabsContent>
                            
                            <TabsContent value="usage" className="space-y-4">
                              <div>
                                <h4 className="font-semibold mb-2">Recommended Usage</h4>
                                <ul className="space-y-2">
                                  {rec.analysis.recommendedUsage.map((usage, idx) => (
                                    <li key={idx} className="flex items-center gap-2">
                                      <Target className="h-4 w-4 text-green-600" />
                                      <span className="text-sm">{usage}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              
                              <Separator />
                              
                              <div>
                                <h4 className="font-semibold mb-2">Scene Matches</h4>
                                <ul className="space-y-2">
                                  {rec.analysis.sceneMatches.map((scene, idx) => (
                                    <li key={idx} className="flex items-center gap-2">
                                      <Users className="h-4 w-4 text-blue-600" />
                                      <span className="text-sm">{scene}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              
                              <Separator />
                              
                              <div>
                                <h4 className="font-semibold mb-2">Target Demographics</h4>
                                <div className="flex flex-wrap gap-2">
                                  {rec.analysis.targetDemographics.map((demo, idx) => (
                                    <Badge key={idx} variant="secondary">
                                      <Users className="w-3 h-3 mr-1" />
                                      {demo}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </TabsContent>
                            
                            <TabsContent value="references" className="space-y-4">
                              <div>
                                <h4 className="font-semibold mb-2">Similar Successful Sync References</h4>
                                <ul className="space-y-3">
                                  {rec.analysis.similarReferences.map((ref, idx) => (
                                    <li key={idx} className="p-3 bg-gray-50 rounded-lg">
                                      <span className="text-sm font-medium">{ref}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              
                              <Separator />
                              
                              <div>
                                <h4 className="font-semibold mb-2">Narrative Elements</h4>
                                <ul className="space-y-2">
                                  {rec.analysis.narrativeElements.map((element, idx) => (
                                    <li key={idx} className="flex items-center gap-2">
                                      <Music className="h-4 w-4 text-purple-600" />
                                      <span className="text-sm">{element}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </TabsContent>
                          </Tabs>
                        </DialogContent>
                      </Dialog>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{rec.analysis.reasoning.substring(0, 150)}...</p>
                    
                    <div className="flex flex-wrap gap-2">
                      {rec.analysis.themes.slice(0, 3).map((theme, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {theme}
                        </Badge>
                      ))}
                      {rec.analysis.themes.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{rec.analysis.themes.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}