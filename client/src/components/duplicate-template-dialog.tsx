import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy } from "lucide-react";

interface DuplicateTemplateDialogProps {
  open: boolean;
  onClose: () => void;
  templateId: number;
  templateName: string;
  onSuccess: () => void;
}

export default function DuplicateTemplateDialog({
  open,
  onClose,
  templateId,
  templateName,
  onSuccess
}: DuplicateTemplateDialogProps) {
  const [newName, setNewName] = useState(`${templateName} (Copy)`);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDuplicate = async () => {
    if (!newName.trim()) {
      alert("Please enter a template name");
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch(`/api/templates/${templateId}/duplicate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newName })
      });

      if (!response.ok) {
        throw new Error('Failed to duplicate template');
      }

      onSuccess();
      onClose();
      setNewName(`${templateName} (Copy)`);
    } catch (error) {
      alert("Failed to duplicate template. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      setNewName(`${templateName} (Copy)`);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Duplicate Template</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="template-name">New Template Name</Label>
            <Input
              id="template-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter template name"
              data-testid="input-duplicate-name"
              disabled={isProcessing}
            />
          </div>
          <div className="flex justify-start space-x-2">
            <Button 
              onClick={handleDuplicate}
              disabled={!newName.trim() || isProcessing}
              data-testid="button-confirm-duplicate"
            >
              {isProcessing ? (
                <>Processing...</>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </>
              )}
            </Button>
            <Button variant="outline" onClick={handleClose} disabled={isProcessing}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
