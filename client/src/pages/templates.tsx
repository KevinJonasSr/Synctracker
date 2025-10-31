import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Download, Edit, Trash2 } from "lucide-react";
import type { Template } from "@shared/schema";

export default function Templates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editContent, setEditContent] = useState("");

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/templates");
      const data = await res.json();
      setTemplates(data);
    } catch {
      alert("❌ Failed to load templates.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const copyTemplate = async (id: number) => {
    try {
      const res = await fetch(`/api/templates/${id}/copy`, { method: "POST" });
      if (!res.ok) throw new Error("Copy failed");
      alert("✅ Template copied successfully!");
      fetchTemplates();
    } catch (err) {
      alert("❌ Copy failed");
    }
  };

  const downloadTemplate = async (id: number) => {
    try {
      const res = await fetch(`/api/templates/${id}/download`);
      if (!res.ok) throw new Error("Download failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `template-${id}.txt`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("❌ Download failed");
    }
  };

  const deleteTemplate = async (id: number) => {
    if (!confirm("Are you sure you want to delete this template?")) return;
    try {
      const res = await fetch(`/api/templates/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      alert("🗑️ Template deleted successfully!");
      fetchTemplates();
    } catch (err) {
      alert("❌ Delete failed");
    }
  };

  const startEdit = (template: Template) => {
    setEditingId(template.id);
    setEditName(template.name);
    setEditContent(template.content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditContent("");
  };

  const saveEdit = async (id: number) => {
    try {
      const res = await fetch(`/api/templates/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, type: templates.find(t => t.id === id)?.type || "", content: editContent }),
      });
      if (!res.ok) throw new Error("Update failed");
      alert("✅ Template updated!");
      setEditingId(null);
      fetchTemplates();
    } catch (err) {
      alert("❌ Update failed");
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Templates</h1>
        <p className="text-muted-foreground">Manage document templates for contracts, quotes, and licensing</p>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading templates...</p>
      ) : templates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="text-muted-foreground">No templates found. Create your first template to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <Card key={template.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                {editingId === template.id ? (
                  <>
                    <Input
                      className="mb-2"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Template name"
                      data-testid="edit-template-name"
                    />
                    <Textarea
                      className="mb-2 min-h-[150px] font-mono text-sm"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      placeholder="Template content"
                      data-testid="edit-template-content"
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={cancelEdit} data-testid="cancel-edit">
                        Cancel
                      </Button>
                      <Button size="sm" onClick={() => saveEdit(template.id)} data-testid="save-edit">
                        Save
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-foreground">
                        {template.name || "(Untitled Template)"}
                      </h3>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => copyTemplate(template.id)}
                          title="Copy template"
                          data-testid={`copy-template-${template.id}`}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => downloadTemplate(template.id)}
                          title="Download template"
                          data-testid={`download-template-${template.id}`}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => startEdit(template)}
                          title="Edit template"
                          data-testid={`edit-template-${template.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-destructive hover:text-destructive/90"
                          onClick={() => deleteTemplate(template.id)}
                          title="Delete template"
                          data-testid={`delete-template-${template.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-3">
                      Updated: {new Date(template.updatedAt).toLocaleDateString()}
                    </p>
                    
                    <div className="bg-muted rounded p-3 border border-border">
                      <p className="text-xs text-muted-foreground mb-1 font-medium">Preview:</p>
                      <div className="text-sm text-foreground font-mono whitespace-pre-wrap line-clamp-4">
                        {template.content.slice(0, 150)}
                        {template.content.length > 150 && "..."}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
