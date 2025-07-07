import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { insertTemplateSchema, type InsertTemplate } from "@shared/schema";

interface AddTemplateFormProps {
  open: boolean;
  onClose: () => void;
}

export default function AddTemplateForm({ open, onClose }: AddTemplateFormProps) {
  const { toast } = useToast();
  
  const form = useForm<InsertTemplate>({
    resolver: zodResolver(insertTemplateSchema),
    defaultValues: {
      name: "",
      type: "",
      content: "",
    },
  });

  const createTemplateMutation = useMutation({
    mutationFn: async (data: InsertTemplate) => {
      const response = await apiRequest("POST", "/api/templates", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Template added successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
      form.reset();
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add template",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertTemplate) => {
    createTemplateMutation.mutate(data);
  };

  const templateTypes = [
    { value: "contract", label: "Contract" },
    { value: "quote", label: "Quote" },
    { value: "invoice", label: "Invoice" },
    { value: "license", label: "License Agreement" },
    { value: "other", label: "Other" },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Template</DialogTitle>
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
              <Select onValueChange={(value) => form.setValue("type", value)}>
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
              {...form.register("content")}
              placeholder="Enter template content with placeholders (e.g., {{clientName}}, {{projectName}}, {{dealValue}})"
              rows={15}
              className="font-mono text-sm"
            />
            {form.formState.errors.content && (
              <p className="text-sm text-red-600">{form.formState.errors.content.message}</p>
            )}
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Available Placeholders:</h4>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
              <div>• {`{{clientName}}`} - Client name</div>
              <div>• {`{{projectName}}`} - Project name</div>
              <div>• {`{{songTitle}}`} - Song title</div>
              <div>• {`{{artist}}`} - Artist name</div>
              <div>• {`{{dealValue}}`} - Deal value</div>
              <div>• {`{{dueDate}}`} - Due date</div>
              <div>• {`{{usage}}`} - Usage rights</div>
              <div>• {`{{territory}}`} - Territory</div>
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
              {createTemplateMutation.isPending ? "Adding..." : "Add Template"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
