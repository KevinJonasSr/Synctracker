import { useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { insertTemplateSchema, type InsertTemplate, type Template } from "@shared/schema";

interface AddTemplateFormProps {
  open: boolean;
  onClose: () => void;
  template?: Template | null;
}

const placeholders = [
  { category: "Project Details", items: [
    { name: "productionCompany", label: "Production Company" },
    { name: "projectName", label: "Project Name" },
    { name: "projectType", label: "Project Type" },
    { name: "episodeNumber", label: "Episode Number" },
    { name: "airDate", label: "Air Date" },
    { name: "synopsis", label: "Synopsis" },
  ]},
  { category: "Song Information", items: [
    { name: "songTitle", label: "Song Title" },
    { name: "artist", label: "Artist" },
    { name: "composer", label: "Composer" },
    { name: "label", label: "Record Label" },
    { name: "writersPublishing", label: "Writers/Publishing" },
  ]},
  { category: "Usage Details", items: [
    { name: "useTiming", label: "Use/Timing" },
    { name: "sceneDescription", label: "Scene Description" },
    { name: "media", label: "Media Rights" },
  ]},
  { category: "Deal Terms", items: [
    { name: "term", label: "Term" },
    { name: "territory", label: "Territory" },
    { name: "fee", label: "Fee" },
    { name: "feePerSide", label: "Fee Per Side" },
    { name: "fullSongValue", label: "Full Song Value" },
    { name: "ourFee", label: "Our Fee" },
    { name: "fullRecordingFee", label: "Full Recording Fee" },
    { name: "ourRecordingFee", label: "Our Recording Fee" },
    { name: "dealValue", label: "Deal Value" },
  ]},
  { category: "Contact Information", items: [
    { name: "clientName", label: "Client Name" },
    { name: "contactName", label: "Contact Name" },
    { name: "contactEmail", label: "Contact Email" },
    { name: "musicSupervisorName", label: "Music Supervisor" },
    { name: "licenseeCompanyName", label: "Licensee Company" },
  ]},
  { category: "Dates", items: [
    { name: "quotedDate", label: "Quoted Date" },
    { name: "dueDate", label: "Due Date" },
    { name: "deadline", label: "Deadline" },
  ]},
];

export default function AddTemplateForm({ open, onClose, template }: AddTemplateFormProps) {
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isEditing = !!template;
  
  const form = useForm<InsertTemplate>({
    resolver: zodResolver(insertTemplateSchema),
    defaultValues: {
      name: "",
      type: "",
      content: "",
    },
  });

  useEffect(() => {
    if (template) {
      form.reset({
        name: template.name,
        type: template.type,
        content: template.content,
      });
    } else {
      form.reset({
        name: "",
        type: "",
        content: "",
      });
    }
  }, [template, form]);

  const createTemplateMutation = useMutation({
    mutationFn: async (data: InsertTemplate) => {
      const url = isEditing ? `/api/templates/${template.id}` : "/api/templates";
      const method = isEditing ? "PUT" : "POST";
      return await apiRequest(url, {
        method,
        body: data,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: isEditing ? "Template updated successfully" : "Template added successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
      form.reset();
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: isEditing ? "Failed to update template" : "Failed to add template",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertTemplate) => {
    createTemplateMutation.mutate(data);
  };

  const insertPlaceholder = (placeholderName: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const placeholder = `{{${placeholderName}}}`;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentValue = form.getValues("content") || "";
    
    const newValue = currentValue.substring(0, start) + placeholder + currentValue.substring(end);
    
    form.setValue("content", newValue, { shouldValidate: true });
    
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + placeholder.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const templateTypes = [
    { value: "contract", label: "Contract" },
    { value: "quote", label: "Quote" },
    { value: "invoice", label: "Invoice" },
    { value: "license", label: "License Agreement" },
    { value: "approval_request", label: "Approval Request" },
    { value: "other", label: "Other" },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Template' : 'Add New Template'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Template Name *</Label>
              <Input
                id="name"
                {...form.register("name")}
                placeholder="Enter template name"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="type">Type *</Label>
              <Select 
                value={form.watch("type")}
                onValueChange={(value) => form.setValue("type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select template type" />
                </SelectTrigger>
                <SelectContent>
                  {templateTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.type && (
                <p className="text-sm text-red-600">{form.formState.errors.type.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="content">Template Content *</Label>
            <Textarea
              id="content"
              ref={textareaRef}
              value={form.watch("content")}
              onChange={(e) => form.setValue("content", e.target.value)}
              placeholder="Enter template content with placeholders. Click or drag placeholders below to insert them."
              rows={12}
              className="font-mono text-sm"
              onDrop={(e) => {
                e.preventDefault();
                const placeholder = e.dataTransfer.getData("text/plain");
                const textarea = textareaRef.current;
                if (!textarea) return;
                
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                const currentValue = form.getValues("content") || "";
                
                const newValue = currentValue.substring(0, start) + placeholder + currentValue.substring(end);
                form.setValue("content", newValue, { shouldValidate: true });
                
                setTimeout(() => {
                  textarea.focus();
                  const newCursorPos = start + placeholder.length;
                  textarea.setSelectionRange(newCursorPos, newCursorPos);
                }, 0);
              }}
              onDragOver={(e) => e.preventDefault()}
            />
            {form.formState.errors.content && (
              <p className="text-sm text-red-600">{form.formState.errors.content.message}</p>
            )}
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-purple-600">✨</span>
              Available Placeholders:
              <span className="text-xs text-gray-500 font-normal">(Click to insert)</span>
            </h4>
            <div className="grid grid-cols-2 gap-4 max-h-64 overflow-y-auto">
              {placeholders.map((category) => (
                <div key={category.category}>
                  <h5 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                    {category.category}
                  </h5>
                  <div className="flex flex-wrap gap-1.5">
                    {category.items.map((item) => (
                      <Badge
                        key={item.name}
                        variant="outline"
                        className="cursor-pointer hover:bg-purple-100 hover:border-purple-300 transition-colors text-xs"
                        onClick={() => insertPlaceholder(item.name)}
                        data-testid={`placeholder-${item.name}`}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData("text/plain", `{{${item.name}}}`);
                        }}
                      >
                        {`{{${item.name}}}`}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex space-x-4 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-brand-primary hover:bg-blue-700"
              disabled={createTemplateMutation.isPending}
            >
              {createTemplateMutation.isPending 
                ? (isEditing ? "Updating..." : "Adding...")
                : (isEditing ? "Update Template" : "Add Template")
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
