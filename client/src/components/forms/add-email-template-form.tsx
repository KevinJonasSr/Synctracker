import { useState } from "react";
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
import { insertEmailTemplateSchema, type InsertEmailTemplate } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AddEmailTemplateFormProps {
  open: boolean;
  onClose: () => void;
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

export default function AddEmailTemplateForm({ open, onClose }: AddEmailTemplateFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [variables, setVariables] = useState<string[]>([]);

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

  const mutation = useMutation({
    mutationFn: async (data: InsertEmailTemplate) => {
      return await apiRequest("/api/email-templates", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/email-templates"] });
      toast({
        title: "Email template created",
        description: "The email template has been successfully created.",
      });
      onClose();
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create email template. Please try again.",
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
      setVariables([...new Set(vars)]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Email Template</DialogTitle>
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
                {mutation.isPending ? "Creating..." : "Create Template"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}