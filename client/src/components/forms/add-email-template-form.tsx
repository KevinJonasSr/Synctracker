import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { insertEmailTemplateSchema, type InsertEmailTemplate, type EmailTemplate } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AddEmailTemplateFormProps {
  open: boolean;
  onClose: () => void;
  template?: EmailTemplate | null;
}

const stages = [
  { value: "initial_pitch", label: "Initial Pitch" },
  { value: "follow_up", label: "Follow Up" },
  { value: "negotiation", label: "Negotiation" },
  { value: "contract_sent", label: "Contract Sent" },
  { value: "deal_confirmed", label: "Deal Confirmed" },
  { value: "payment_reminder", label: "Payment Reminder" },
  { value: "thank_you", label: "Thank You" },
];

export default function AddEmailTemplateForm({ open, onClose, template }: AddEmailTemplateFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [variables, setVariables] = useState<string[]>([]);
  const isEditing = !!template;

  const form = useForm<InsertEmailTemplate>({
    resolver: zodResolver(insertEmailTemplateSchema),
    defaultValues: {
      name: "",
      stage: "",
      subject: "",
      body: "",
      variables: [],
    },
  });

  useEffect(() => {
    if (template) {
      form.reset({
        name: template.name,
        stage: template.stage,
        subject: template.subject,
        body: template.body,
        variables: template.variables || [],
      });
      if (Array.isArray(template.variables)) {
        setVariables(template.variables.map(v => typeof v === 'string' ? v : v.name));
      }
    } else {
      form.reset({
        name: "",
        stage: "",
        subject: "",
        body: "",
        variables: [],
      });
      setVariables([]);
    }
  }, [template, form]);

  const mutation = useMutation({
    mutationFn: async (data: InsertEmailTemplate) => {
      const url = isEditing ? `/api/email-templates/${template.id}` : "/api/email-templates";
      const method = isEditing ? "PUT" : "POST";
      return await apiRequest(url, {
        method,
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/email-templates"] });
      toast({
        title: isEditing ? "Email template updated" : "Email template created",
        description: isEditing 
          ? "The email template has been successfully updated."
          : "The email template has been successfully created.",
      });
      onClose();
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'create'} email template. Please try again.`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertEmailTemplate) => {
    mutation.mutate({
      ...data,
      variables: variables.map(v => ({ name: v, description: `Variable for ${v}` })),
    });
  };

  const extractVariables = (text: string) => {
    const matches = text.match(/\{\{(\w+)\}\}/g);
    if (matches) {
      const vars = matches.map(match => match.replace(/[{}]/g, ''));
      setVariables(Array.from(new Set(vars)));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Email Template' : 'Add Email Template'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Template name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="stage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stage</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select stage" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {stages.map((stage) => (
                        <SelectItem key={stage.value} value={stage.value}>
                          {stage.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Email subject (use {{variable}} for placeholders)"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        extractVariables(e.target.value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Body</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Email body (use {{variable}} for placeholders like {{clientName}}, {{songTitle}})"
                      className="min-h-[120px]"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        extractVariables(e.target.value + form.getValues("subject"));
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {variables.length > 0 && (
              <div className="text-sm text-muted-foreground">
                <p>Detected variables: {variables.join(", ")}</p>
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending 
                  ? (isEditing ? "Updating..." : "Creating...")
                  : (isEditing ? "Update Template" : "Create Template")
                }
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}