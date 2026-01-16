import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { FileSpreadsheet, Download } from "lucide-react";
import * as XLSX from "xlsx";

interface JonasEntry {
  name: string;
  company: string;
  jonasIncome: string;
  paymentDate: string;
  type: 'publishing' | 'recording';
}

interface ProjectGroup {
  dealId: number;
  projectName: string;
  songTitle: string;
  publishingEntries: JonasEntry[];
  recordingEntries: JonasEntry[];
}

interface IncomeReportModalProps {
  open: boolean;
  onClose: () => void;
  projectGroups: ProjectGroup[];
}

export default function IncomeReportModal({ open, onClose, projectGroups }: IncomeReportModalProps) {
  const [selectedReport, setSelectedReport] = useState<string>("pending");

  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return "$0.00";
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
  };

  const getPendingDealsData = () => {
    const rows: any[] = [];
    projectGroups.forEach(project => {
      const allEntries = [...project.publishingEntries, ...project.recordingEntries];
      const pendingEntries = allEntries.filter(e => !e.paymentDate || !e.jonasIncome);
      
      pendingEntries.forEach(entry => {
        rows.push({
          "Project Title": project.projectName,
          "Song Title": project.songTitle,
          "Writer/Artist": entry.name,
          "Type": entry.type === 'publishing' ? 'Writer' : 'Artist',
          "Fees Owed": entry.jonasIncome ? formatCurrency(entry.jonasIncome) : "TBD"
        });
      });
    });
    return rows;
  };

  const getWriterReportData = () => {
    const rows: any[] = [];
    projectGroups.forEach(project => {
      project.publishingEntries.forEach(entry => {
        rows.push({
          "Writer": entry.name,
          "Song Title": project.songTitle,
          "Project Title": project.projectName,
          "Fees Owed": entry.jonasIncome ? formatCurrency(entry.jonasIncome) : "TBD",
          "Payment Date": entry.paymentDate || "Pending"
        });
      });
    });
    return rows.sort((a, b) => a.Writer.localeCompare(b.Writer));
  };

  const getArtistReportData = () => {
    const rows: any[] = [];
    projectGroups.forEach(project => {
      project.recordingEntries.forEach(entry => {
        rows.push({
          "Artist": entry.name,
          "Song Title": project.songTitle,
          "Project Title": project.projectName,
          "Fees Owed": entry.jonasIncome ? formatCurrency(entry.jonasIncome) : "TBD",
          "Payment Date": entry.paymentDate || "Pending"
        });
      });
    });
    return rows.sort((a, b) => a.Artist.localeCompare(b.Artist));
  };

  const exportToExcel = () => {
    let data: any[] = [];
    let filename = "";

    switch (selectedReport) {
      case "pending":
        data = getPendingDealsData();
        filename = "Pending_Payment_Deals_Report.xlsx";
        break;
      case "writer":
        data = getWriterReportData();
        filename = "Writer_Income_Report.xlsx";
        break;
      case "artist":
        data = getArtistReportData();
        filename = "Artist_Income_Report.xlsx";
        break;
    }

    if (data.length === 0) {
      alert("No data available for this report.");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    
    const colWidths = Object.keys(data[0]).map(key => ({ wch: Math.max(key.length, 20) }));
    worksheet["!cols"] = colWidths;

    XLSX.writeFile(workbook, filename);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-brand-primary" />
            Generate Report
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-sm text-gray-600">Select a report type to export to Excel:</p>
          
          <RadioGroup value={selectedReport} onValueChange={setSelectedReport} className="space-y-3">
            <Card className={`cursor-pointer transition-colors ${selectedReport === 'pending' ? 'border-brand-primary bg-blue-50' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="pending" id="pending" />
                  <Label htmlFor="pending" className="cursor-pointer flex-1">
                    <div className="font-medium">Pending Payment Deals</div>
                    <div className="text-sm text-gray-500">Project, Song, Writer/Artist, Fees Owed</div>
                  </Label>
                </div>
              </CardContent>
            </Card>

            <Card className={`cursor-pointer transition-colors ${selectedReport === 'writer' ? 'border-brand-primary bg-blue-50' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="writer" id="writer" />
                  <Label htmlFor="writer" className="cursor-pointer flex-1">
                    <div className="font-medium">Writer Income Report</div>
                    <div className="text-sm text-gray-500">Writer, Song, Project, Fees Owed</div>
                  </Label>
                </div>
              </CardContent>
            </Card>

            <Card className={`cursor-pointer transition-colors ${selectedReport === 'artist' ? 'border-brand-primary bg-blue-50' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="artist" id="artist" />
                  <Label htmlFor="artist" className="cursor-pointer flex-1">
                    <div className="font-medium">Artist Income Report</div>
                    <div className="text-sm text-gray-500">Artist, Song, Project, Fees Owed</div>
                  </Label>
                </div>
              </CardContent>
            </Card>
          </RadioGroup>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={exportToExcel} className="bg-brand-primary hover:bg-blue-700">
            <Download className="mr-2 h-4 w-4" />
            Export to Excel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
