import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileSpreadsheet, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { queryClient } from "@/lib/queryClient";

interface ImportDealsDialogProps {
  open: boolean;
  onClose: () => void;
}

interface ParsedData {
  headers: string[];
  preview: any[];
  data: any[];
  totalRows: number;
}

interface ColumnMapping {
  projectName?: string;
  projectType?: string;
  songTitle?: string;
  songArtist?: string;
  songComposer?: string;
  songPublisher?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactCompany?: string;
  status?: string;
  territory?: string;
  exclusivity?: string;
  projectDescription?: string;
  term?: string;
  usage?: string;
  totalFee?: string;
  publishingFee?: string;
  recordingFee?: string;
  notes?: string;
  airDate?: string;
}

export default function ImportDealsDialog({ open, onClose }: ImportDealsDialogProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<'upload' | 'map' | 'import' | 'results'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [mapping, setMapping] = useState<ColumnMapping>({});
  const [autoCreateSongs, setAutoCreateSongs] = useState(true);
  const [autoCreateContacts, setAutoCreateContacts] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResults, setImportResults] = useState<any>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv'
      ];
      
      if (!validTypes.includes(selectedFile.type) && !selectedFile.name.match(/\.(xlsx|xls|csv)$/i)) {
        toast({
          title: "Invalid file type",
          description: "Please upload an Excel (.xlsx, .xls) or CSV (.csv) file",
          variant: "destructive"
        });
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const handleFileUpload = async () => {
    if (!file) return;

    setIsProcessing(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/deals/import/parse', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to parse file');
      }

      const data = await response.json();
      setParsedData(data);
      setStep('map');
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to parse the uploaded file. Please check the format and try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = async () => {
    if (!parsedData || !mapping.projectName) {
      toast({
        title: "Missing required mapping",
        description: "Please map at least the Project Name column",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setStep('import');

    try {
      const response = await fetch('/api/deals/import/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: parsedData.data, // Send full dataset, not just preview
          mapping,
          autoCreateSongs,
          autoCreateContacts
        })
      });

      if (!response.ok) {
        throw new Error('Failed to import deals');
      }

      const results = await response.json();
      setImportResults(results);
      setStep('results');
      
      // Refresh deals list
      queryClient.invalidateQueries({ queryKey: ['/api/deals'] });
      
      toast({
        title: "Import completed",
        description: `Successfully imported ${results.created} deals${results.failed > 0 ? ` (${results.failed} failed)` : ''}`,
      });
    } catch (error) {
      toast({
        title: "Import failed",
        description: "Failed to import deals. Please try again.",
        variant: "destructive"
      });
      setStep('map');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setStep('upload');
    setFile(null);
    setParsedData(null);
    setMapping({});
    setImportResults(null);
    onClose();
  };

  const fieldOptions = [
    { value: 'projectName', label: 'Project Name (Required)' },
    { value: 'projectType', label: 'Project Type' },
    { value: 'songTitle', label: 'Song Title' },
    { value: 'songArtist', label: 'Song Artist' },
    { value: 'songComposer', label: 'Song Composer' },
    { value: 'songPublisher', label: 'Song Publisher' },
    { value: 'contactName', label: 'Contact Name' },
    { value: 'contactEmail', label: 'Contact Email' },
    { value: 'contactPhone', label: 'Contact Phone' },
    { value: 'contactCompany', label: 'Contact Company' },
    { value: 'status', label: 'Deal Status' },
    { value: 'territory', label: 'Territory' },
    { value: 'exclusivity', label: 'Exclusivity' },
    { value: 'projectDescription', label: 'Description' },
    { value: 'term', label: 'Term' },
    { value: 'usage', label: 'Usage' },
    { value: 'totalFee', label: 'Total Fee' },
    { value: 'publishingFee', label: 'Publishing Fee' },
    { value: 'recordingFee', label: 'Recording Fee' },
    { value: 'notes', label: 'Notes' },
    { value: 'airDate', label: 'Air Date' }
  ];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Deals from Excel/CSV</DialogTitle>
        </DialogHeader>

        {step === 'upload' && (
          <div className="space-y-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <FileSpreadsheet className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <Label htmlFor="file-upload" className="cursor-pointer">
                <span className="text-sm text-gray-600">
                  {file ? file.name : 'Click to upload Excel or CSV file'}
                </span>
                <input
                  id="file-upload"
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileSelect}
                  className="hidden"
                  data-testid="input-import-file"
                />
              </Label>
            </div>

            {file && (
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setFile(null)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleFileUpload} 
                  disabled={isProcessing}
                  data-testid="button-upload-file"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload & Parse
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}

        {step === 'map' && parsedData && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Map Your Columns</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  Found {parsedData.totalRows} rows. Map your spreadsheet columns to deal fields:
                </p>
                
                <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  {parsedData.headers.map((header) => (
                    <div key={header} className="space-y-2">
                      <Label className="text-sm font-medium">{header}</Label>
                      <Select
                        value={Object.entries(mapping).find(([_, value]) => value === header)?.[0] || ''}
                        onValueChange={(value) => {
                          setMapping(prev => ({ ...prev, [value]: header }));
                        }}
                      >
                        <SelectTrigger data-testid={`select-mapping-${header}`}>
                          <SelectValue placeholder="Skip this column" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="skip">Skip this column</SelectItem>
                          {fieldOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="auto-create-songs"
                      checked={autoCreateSongs}
                      onCheckedChange={(checked) => setAutoCreateSongs(checked as boolean)}
                      data-testid="checkbox-auto-create-songs"
                    />
                    <Label htmlFor="auto-create-songs" className="cursor-pointer">
                      Automatically create songs if they don't exist
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="auto-create-contacts"
                      checked={autoCreateContacts}
                      onCheckedChange={(checked) => setAutoCreateContacts(checked as boolean)}
                      data-testid="checkbox-auto-create-contacts"
                    />
                    <Label htmlFor="auto-create-contacts" className="cursor-pointer">
                      Automatically create contacts if they don't exist
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleImport}
                disabled={!mapping.projectName}
                data-testid="button-start-import"
              >
                Import {parsedData.totalRows} Deals
              </Button>
            </div>
          </div>
        )}

        {step === 'import' && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg font-medium">Importing deals...</p>
            <p className="text-sm text-gray-600">This may take a moment</p>
          </div>
        )}

        {step === 'results' && importResults && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Import Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-medium">{importResults.created} deals created</span>
                  </div>
                  {importResults.failed > 0 && (
                    <div className="flex items-center space-x-2 text-red-600">
                      <XCircle className="h-5 w-5" />
                      <span className="font-medium">{importResults.failed} deals failed</span>
                    </div>
                  )}
                </div>

                {importResults.errors && importResults.errors.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Errors:</Label>
                    <div className="max-h-48 overflow-y-auto space-y-1 bg-red-50 p-3 rounded">
                      {importResults.errors.map((error: any, index: number) => (
                        <div key={index} className="text-sm text-red-800">
                          Row {error.row}: {error.error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={handleClose} data-testid="button-close-results">
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
