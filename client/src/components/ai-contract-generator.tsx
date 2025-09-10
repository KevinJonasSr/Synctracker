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
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { FileText, Download, Send, Brain, Sparkles, CheckCircle, AlertCircle, Copy, Edit } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Deal, Song, Contact } from "@shared/schema";

interface ContractData {
  songTitle: string;
  artist: string;
  licenseType: string;
  territory: string;
  term: string;
  fee: number;
  usage: string;
  clientName: string;
  projectTitle: string;
  exclusivity?: boolean;
  mediaType?: string;
  deliveryFormat?: string;
  creditRequirements?: string;
  additionalTerms?: string;
}

interface GeneratedContract {
  contract: string;
  generatedAt: string;
  metadata: {
    wordCount: number;
    sections: string[];
    estimatedReviewTime: string;
  };
}

export default function AIContractGenerator() {
  const [contractData, setContractData] = useState<ContractData>({
    songTitle: "",
    artist: "",
    licenseType: "sync",
    territory: "worldwide",
    term: "perpetual",
    fee: 0,
    usage: "background",
    clientName: "",
    projectTitle: "",
    exclusivity: false,
    mediaType: "all",
    deliveryFormat: "wav",
    creditRequirements: "",
    additionalTerms: ""
  });
  
  const [selectedDeal, setSelectedDeal] = useState<number | null>(null);
  const [templateType, setTemplateType] = useState("standard");
  const [generatedContract, setGeneratedContract] = useState<GeneratedContract | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  const { toast } = useToast();

  const { data: deals = [] } = useQuery<Deal[]>({
    queryKey: ['/api/deals'],
  });

  const { data: songs = [] } = useQuery<Song[]>({
    queryKey: ['/api/songs'],
  });

  const { data: contacts = [] } = useQuery<Contact[]>({
    queryKey: ['/api/contacts'],
  });

  const generateContractMutation = useMutation({
    mutationFn: async (data: { dealData: ContractData; templateType: string }) => {
      return apiRequest('/api/generate-contract', {
        method: 'POST',
        body: data
      });
    },
    onSuccess: (response: any) => {
      const contractWithMetadata: GeneratedContract = {
        contract: response.contract,
        generatedAt: new Date().toISOString(),
        metadata: {
          wordCount: response.contract.split(/\s+/).length,
          sections: extractSections(response.contract),
          estimatedReviewTime: estimateReviewTime(response.contract)
        }
      };
      
      setGeneratedContract(contractWithMetadata);
      setShowPreview(true);
      
      toast({
        title: "Contract Generated",
        description: "AI-powered contract has been generated successfully",
        duration: 3000,
      });
    },
    onError: () => {
      toast({
        title: "Generation Failed",
        description: "Could not generate contract. Please try again.",
        variant: "destructive",
      });
    }
  });

  const extractSections = (contract: string): string[] => {
    const sections = contract.match(/^\d+\.\s+[A-Z][^.]*$/gm) || [];
    return sections.map(section => section.replace(/^\d+\.\s+/, ''));
  };

  const estimateReviewTime = (contract: string): string => {
    const wordCount = contract.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / 200); // Assuming 200 words per minute reading speed
    return `${minutes} minutes`;
  };

  const loadFromDeal = (dealId: number) => {
    const deal = deals.find((d: Deal) => d.id === dealId);
    if (!deal) return;

    const song = songs.find((s: Song) => s.id === deal.songId);
    const contact = contacts.find((c: Contact) => c.id === deal.contactId);

    setContractData({
      songTitle: song?.title || "",
      artist: song?.artist || "",
      licenseType: "sync",
      territory: deal.territory || "worldwide",
      term: deal.term || "perpetual",
      fee: Number(deal.dealValue) || 0,
      usage: deal.usage || "background",
      clientName: contact?.company || contact?.name || "",
      projectTitle: deal.projectName || "",
      exclusivity: deal.exclusivity || false,
      mediaType: deal.media || "all",
      deliveryFormat: "wav",
      creditRequirements: "",
      additionalTerms: deal.notes || ""
    });

    setSelectedDeal(dealId);
  };

  const generateContract = () => {
    if (!contractData.songTitle || !contractData.clientName || !contractData.projectTitle) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    generateContractMutation.mutate({
      dealData: contractData,
      templateType
    });
  };

  const copyToClipboard = async () => {
    if (!generatedContract) return;
    
    try {
      await navigator.clipboard.writeText(generatedContract.contract);
      toast({
        title: "Copied to Clipboard",
        description: "Contract text copied successfully",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const downloadContract = () => {
    if (!generatedContract) return;
    
    const blob = new Blob([generatedContract.contract], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sync-license-${contractData.projectTitle.replace(/\s+/g, '-').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download Started",
      description: "Contract file download has started",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Contract Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Load from existing deal */}
          <div className="space-y-2">
            <Label>Load from Existing Deal (Optional)</Label>
            <Select 
              value={selectedDeal?.toString() || ""} 
              onValueChange={(value) => value && loadFromDeal(parseInt(value))}
            >
              <SelectTrigger data-testid="select-existing-deal">
                <SelectValue placeholder="Select a deal to auto-fill contract details" />
              </SelectTrigger>
              <SelectContent>
                {deals.map((deal: Deal) => (
                  <SelectItem key={deal.id} value={deal.id.toString()}>
                    {deal.projectName} - ${deal.dealValue}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Contract Details Form */}
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Terms</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
              <TabsTrigger value="template">Template</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="songTitle">Song Title *</Label>
                  <Input
                    id="songTitle"
                    data-testid="input-song-title"
                    value={contractData.songTitle}
                    onChange={(e) => setContractData({ ...contractData, songTitle: e.target.value })}
                    placeholder="Enter song title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="artist">Artist *</Label>
                  <Input
                    id="artist"
                    data-testid="input-artist"
                    value={contractData.artist}
                    onChange={(e) => setContractData({ ...contractData, artist: e.target.value })}
                    placeholder="Enter artist name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clientName">Client Name *</Label>
                  <Input
                    id="clientName"
                    data-testid="input-client-name"
                    value={contractData.clientName}
                    onChange={(e) => setContractData({ ...contractData, clientName: e.target.value })}
                    placeholder="Enter client/company name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="projectTitle">Project Title *</Label>
                  <Input
                    id="projectTitle"
                    data-testid="input-project-title"
                    value={contractData.projectTitle}
                    onChange={(e) => setContractData({ ...contractData, projectTitle: e.target.value })}
                    placeholder="Enter project name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="licenseType">License Type</Label>
                  <Select 
                    value={contractData.licenseType} 
                    onValueChange={(value) => setContractData({ ...contractData, licenseType: value })}
                  >
                    <SelectTrigger data-testid="select-license-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sync">Synchronization</SelectItem>
                      <SelectItem value="master">Master Recording</SelectItem>
                      <SelectItem value="both">Sync + Master</SelectItem>
                      <SelectItem value="mechanical">Mechanical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="territory">Territory</Label>
                  <Select 
                    value={contractData.territory} 
                    onValueChange={(value) => setContractData({ ...contractData, territory: value })}
                  >
                    <SelectTrigger data-testid="select-territory">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="worldwide">Worldwide</SelectItem>
                      <SelectItem value="north-america">North America</SelectItem>
                      <SelectItem value="usa">United States</SelectItem>
                      <SelectItem value="canada">Canada</SelectItem>
                      <SelectItem value="europe">Europe</SelectItem>
                      <SelectItem value="uk">United Kingdom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="term">Term</Label>
                  <Select 
                    value={contractData.term} 
                    onValueChange={(value) => setContractData({ ...contractData, term: value })}
                  >
                    <SelectTrigger data-testid="select-term">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="perpetual">Perpetual</SelectItem>
                      <SelectItem value="1-year">1 Year</SelectItem>
                      <SelectItem value="2-years">2 Years</SelectItem>
                      <SelectItem value="5-years">5 Years</SelectItem>
                      <SelectItem value="10-years">10 Years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fee">License Fee ($)</Label>
                  <Input
                    id="fee"
                    type="number"
                    data-testid="input-fee"
                    value={contractData.fee}
                    onChange={(e) => setContractData({ ...contractData, fee: Number(e.target.value) })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="usage">Usage Type</Label>
                  <Select 
                    value={contractData.usage} 
                    onValueChange={(value) => setContractData({ ...contractData, usage: value })}
                  >
                    <SelectTrigger data-testid="select-usage">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="background">Background</SelectItem>
                      <SelectItem value="featured">Featured</SelectItem>
                      <SelectItem value="theme">Theme Song</SelectItem>
                      <SelectItem value="opening">Opening Credits</SelectItem>
                      <SelectItem value="closing">Closing Credits</SelectItem>
                      <SelectItem value="trailer">Trailer/Promo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="advanced" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mediaType">Media Type</Label>
                  <Select 
                    value={contractData.mediaType} 
                    onValueChange={(value) => setContractData({ ...contractData, mediaType: value })}
                  >
                    <SelectTrigger data-testid="select-media-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Media</SelectItem>
                      <SelectItem value="tv">Television</SelectItem>
                      <SelectItem value="film">Film</SelectItem>
                      <SelectItem value="streaming">Streaming</SelectItem>
                      <SelectItem value="digital">Digital Only</SelectItem>
                      <SelectItem value="theatrical">Theatrical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deliveryFormat">Delivery Format</Label>
                  <Select 
                    value={contractData.deliveryFormat} 
                    onValueChange={(value) => setContractData({ ...contractData, deliveryFormat: value })}
                  >
                    <SelectTrigger data-testid="select-delivery-format">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wav">WAV (24-bit/48kHz)</SelectItem>
                      <SelectItem value="aiff">AIFF</SelectItem>
                      <SelectItem value="mp3">MP3 (320kbps)</SelectItem>
                      <SelectItem value="stems">Stems/Multitrack</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="exclusivity"
                  checked={contractData.exclusivity}
                  onCheckedChange={(checked) => setContractData({ ...contractData, exclusivity: checked })}
                  data-testid="switch-exclusivity"
                />
                <Label htmlFor="exclusivity">Exclusive License</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="creditRequirements">Credit Requirements</Label>
                <Textarea
                  id="creditRequirements"
                  data-testid="textarea-credit-requirements"
                  value={contractData.creditRequirements}
                  onChange={(e) => setContractData({ ...contractData, creditRequirements: e.target.value })}
                  placeholder="Specify how the song/artist should be credited..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="additionalTerms">Additional Terms & Notes</Label>
                <Textarea
                  id="additionalTerms"
                  data-testid="textarea-additional-terms"
                  value={contractData.additionalTerms}
                  onChange={(e) => setContractData({ ...contractData, additionalTerms: e.target.value })}
                  placeholder="Any additional terms, restrictions, or special conditions..."
                  rows={3}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="template" className="space-y-4">
              <div className="space-y-2">
                <Label>Contract Template</Label>
                <Select 
                  value={templateType} 
                  onValueChange={setTemplateType}
                >
                  <SelectTrigger data-testid="select-template-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard Sync License</SelectItem>
                    <SelectItem value="simple">Simple/Basic License</SelectItem>
                    <SelectItem value="comprehensive">Comprehensive License</SelectItem>
                    <SelectItem value="exclusive">Exclusive License</SelectItem>
                    <SelectItem value="work-for-hire">Work for Hire</SelectItem>
                    <SelectItem value="festival">Film Festival License</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Template Preview</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  {templateType === "standard" && (
                    <div>
                      <p>• Standard synchronization license terms</p>
                      <p>• Balanced rights and restrictions</p>
                      <p>• Industry-standard clauses</p>
                    </div>
                  )}
                  {templateType === "simple" && (
                    <div>
                      <p>• Simplified terms for easy understanding</p>
                      <p>• Minimal legal complexity</p>
                      <p>• Ideal for smaller projects</p>
                    </div>
                  )}
                  {templateType === "comprehensive" && (
                    <div>
                      <p>• Detailed terms and conditions</p>
                      <p>• Extensive rights and restrictions</p>
                      <p>• Suitable for major productions</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex gap-3">
            <Button 
              onClick={generateContract} 
              disabled={isGenerating || generateContractMutation.isPending}
              className="flex-1"
              data-testid="button-generate-contract"
            >
              {isGenerating || generateContractMutation.isPending ? "Generating..." : "Generate AI Contract"}
              <Sparkles className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Generated Contract Preview */}
      {generatedContract && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Generated Contract
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copyToClipboard} data-testid="button-copy-contract">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button variant="outline" size="sm" onClick={downloadContract} data-testid="button-download-contract">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Contract Metadata */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  {generatedContract.metadata.wordCount} words
                </div>
                <div className="flex items-center gap-1">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  {generatedContract.metadata.sections.length} sections
                </div>
                <div className="flex items-center gap-1">
                  <Brain className="h-4 w-4 text-purple-600" />
                  Est. review time: {generatedContract.metadata.estimatedReviewTime}
                </div>
              </div>
              
              <Separator />
              
              {/* Contract Content */}
              <ScrollArea className="h-96 w-full border rounded-md p-4">
                <div className="whitespace-pre-wrap text-sm leading-relaxed font-mono">
                  {generatedContract.contract}
                </div>
              </ScrollArea>
              
              {/* Contract Sections */}
              <div>
                <h4 className="font-medium mb-2">Contract Sections</h4>
                <div className="flex flex-wrap gap-2">
                  {generatedContract.metadata.sections.map((section, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {section}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}