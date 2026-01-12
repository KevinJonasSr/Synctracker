import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Save, X } from "lucide-react";

interface SearchCriteria {
  query: string;
  genres: string[];
  moods: string[];
  bpmRange: [number, number];
  keySignature: string;
  vocalType: string;
  explicitContent: boolean | null;
  duration: string;
  composer: string;
  publisher: string;
  hasISRC: boolean | null;
  hasLyrics: boolean | null;
}

interface AdvancedSearchProps {
  open: boolean;
  onClose: () => void;
  onSearch: (criteria: SearchCriteria) => void;
  onSaveSearch?: (name: string, criteria: SearchCriteria) => void;
}

const genreOptions = [
  "Electronic", "Pop", "Rock", "Hip Hop", "Classical", "Jazz", "Country", 
  "Folk", "R&B", "Reggae", "Blues", "Funk", "Metal", "Punk", "Alternative",
  "Indie", "Cinematic", "Ambient", "Techno", "House", "Trance"
];

const moodOptions = [
  "Uplifting", "Energetic", "Calm", "Melancholic", "Romantic", "Aggressive",
  "Peaceful", "Dramatic", "Mysterious", "Playful", "Epic", "Nostalgic",
  "Dark", "Bright", "Atmospheric", "Driving", "Contemplative", "Celebratory"
];

const keyOptions = [
  "C Major", "C Minor", "C# Major", "C# Minor", "D Major", "D Minor",
  "D# Major", "D# Minor", "E Major", "E Minor", "F Major", "F Minor",
  "F# Major", "F# Minor", "G Major", "G Minor", "G# Major", "G# Minor",
  "A Major", "A Minor", "A# Major", "A# Minor", "B Major", "B Minor"
];

const vocalOptions = [
  "Male Vocals", "Female Vocals", "Mixed Vocals", "Instrumental", 
  "Vocal Samples", "Spoken Word", "Rap/Hip Hop", "Choir"
];

export default function AdvancedSearch({ open, onClose, onSearch, onSaveSearch }: AdvancedSearchProps) {
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [searchName, setSearchName] = useState("");
  
  const form = useForm<SearchCriteria>({
    defaultValues: {
      query: "",
      genres: [],
      moods: [],
      bpmRange: [60, 180],
      keySignature: "",
      vocalType: "",
      explicitContent: null,
      duration: "",
      composer: "",
      publisher: "",
      hasISRC: null,
      hasLyrics: null,
    },
  });

  const handleSubmit = (data: SearchCriteria) => {
    onSearch(data);
    onClose();
  };

  const handleSaveSearch = () => {
    if (searchName.trim() && onSaveSearch) {
      onSaveSearch(searchName, form.getValues());
      setShowSaveDialog(false);
      setSearchName("");
    }
  };

  const toggleGenre = (genre: string) => {
    const currentGenres = form.getValues("genres");
    const newGenres = currentGenres.includes(genre)
      ? currentGenres.filter(g => g !== genre)
      : [...currentGenres, genre];
    form.setValue("genres", newGenres);
  };

  const toggleMood = (mood: string) => {
    const currentMoods = form.getValues("moods");
    const newMoods = currentMoods.includes(mood)
      ? currentMoods.filter(m => m !== mood)
      : [...currentMoods, mood];
    form.setValue("moods", newMoods);
  };

  const clearForm = () => {
    form.reset();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Advanced Search
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Basic Search */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="query">Search Query</Label>
                <Input
                  id="query"
                  {...form.register("query")}
                  placeholder="Search across all fields..."
                />
              </div>
            </div>

            {/* Genre Selection */}
            <div className="space-y-3">
              <Label>Genres</Label>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto border rounded-lg p-3">
                {genreOptions.map((genre) => (
                  <Badge
                    key={genre}
                    variant={form.watch("genres").includes(genre) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleGenre(genre)}
                  >
                    {genre}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Mood Selection */}
            <div className="space-y-3">
              <Label>Moods</Label>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto border rounded-lg p-3">
                {moodOptions.map((mood) => (
                  <Badge
                    key={mood}
                    variant={form.watch("moods").includes(mood) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleMood(mood)}
                  >
                    {mood}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Technical Criteria */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label>BPM Range: {form.watch("bpmRange")[0]} - {form.watch("bpmRange")[1]}</Label>
                <Slider
                  value={form.watch("bpmRange")}
                  onValueChange={(value) => form.setValue("bpmRange", value as [number, number])}
                  min={60}
                  max={200}
                  step={1}
                  className="w-full"
                />
              </div>

              <div>
                <Label htmlFor="keySignature">Key Signature</Label>
                <Select value={form.watch("keySignature")} onValueChange={(value) => form.setValue("keySignature", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select key" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any Key</SelectItem>
                    {keyOptions.map((key) => (
                      <SelectItem key={key} value={key}>{key}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="vocalType">Vocal Type</Label>
                <Select value={form.watch("vocalType")} onValueChange={(value) => form.setValue("vocalType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vocal type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any Vocal Type</SelectItem>
                    {vocalOptions.map((vocal) => (
                      <SelectItem key={vocal} value={vocal}>{vocal}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="duration">Duration</Label>
                <Select value={form.watch("duration")} onValueChange={(value) => form.setValue("duration", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any Duration</SelectItem>
                    <SelectItem value="short">Short (&lt; 2 min)</SelectItem>
                    <SelectItem value="medium">Medium (2-4 min)</SelectItem>
                    <SelectItem value="long">Long (&gt; 4 min)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Metadata Criteria */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="composer">Composer</Label>
                <Input
                  id="composer"
                  {...form.register("composer")}
                  placeholder="Search by composer"
                />
              </div>

              <div>
                <Label htmlFor="publisher">Publisher</Label>
                <Input
                  id="publisher"
                  {...form.register("publisher")}
                  placeholder="Search by publisher"
                />
              </div>
            </div>

            {/* Boolean Filters */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="explicitContent">Explicit Content</Label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="explicitContent"
                      checked={form.watch("explicitContent") === true}
                      onChange={() => form.setValue("explicitContent", true)}
                    />
                    <span>Yes</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="explicitContent"
                      checked={form.watch("explicitContent") === false}
                      onChange={() => form.setValue("explicitContent", false)}
                    />
                    <span>No</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="explicitContent"
                      checked={form.watch("explicitContent") === null}
                      onChange={() => form.setValue("explicitContent", null)}
                    />
                    <span>Any</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="hasISRC">Has ISRC</Label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="hasISRC"
                      checked={form.watch("hasISRC") === true}
                      onChange={() => form.setValue("hasISRC", true)}
                    />
                    <span>Yes</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="hasISRC"
                      checked={form.watch("hasISRC") === false}
                      onChange={() => form.setValue("hasISRC", false)}
                    />
                    <span>No</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="hasISRC"
                      checked={form.watch("hasISRC") === null}
                      onChange={() => form.setValue("hasISRC", null)}
                    />
                    <span>Any</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="hasLyrics">Has Lyrics</Label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="hasLyrics"
                      checked={form.watch("hasLyrics") === true}
                      onChange={() => form.setValue("hasLyrics", true)}
                    />
                    <span>Yes</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="hasLyrics"
                      checked={form.watch("hasLyrics") === false}
                      onChange={() => form.setValue("hasLyrics", false)}
                    />
                    <span>No</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="hasLyrics"
                      checked={form.watch("hasLyrics") === null}
                      onChange={() => form.setValue("hasLyrics", null)}
                    />
                    <span>Any</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-6 border-t">
              <div className="flex space-x-2">
                <Button type="button" variant="outline" onClick={clearForm}>
                  <X className="mr-2 h-4 w-4" />
                  Clear
                </Button>
                {onSaveSearch && (
                  <Button type="button" variant="outline" onClick={() => setShowSaveDialog(true)}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Search
                  </Button>
                )}
              </div>
              <div className="flex space-x-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit">
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Save Search Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Search</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="searchName">Search Name</Label>
              <Input
                id="searchName"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                placeholder="Enter a name for this search"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveSearch} disabled={!searchName.trim()}>
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}