import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FileUploadForm from "@/components/forms/file-upload-form";
import { Download, File, FileText, Image, Music, Video, Archive, Upload, Trash2 } from "lucide-react";
import type { Attachment } from "@shared/schema";

interface AttachmentsListProps {
  entityType: string;
  entityId: number;
  title?: string;
}

export default function AttachmentsList({ entityType, entityId, title = "Attachments" }: AttachmentsListProps) {
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const { data: attachments = [], isLoading } = useQuery<Attachment[]>({
    queryKey: ["/api/attachments", { entityType, entityId }],
    queryFn: () => `/api/attachments?entityType=${entityType}&entityId=${entityId}`,
  });

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return Image;
    if (mimeType.startsWith('audio/')) return Music;
    if (mimeType.startsWith('video/')) return Video;
    if (mimeType.includes('pdf')) return FileText;
    if (mimeType.includes('zip') || mimeType.includes('rar')) return Archive;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleDownload = (attachment: Attachment) => {
    window.open(`/api/files/${attachment.filename}`, '_blank');
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 p-3 border rounded-lg animate-pulse">
                <div className="h-8 w-8 bg-muted rounded"></div>
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-3 bg-muted rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <Button
            onClick={() => setIsUploadOpen(true)}
            size="sm"
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            Upload File
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {attachments.length === 0 ? (
          <div className="text-center py-8">
            <File className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">
              No attachments yet. Upload files related to this {entityType}.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {attachments.map((attachment) => {
              const FileIcon = getFileIcon(attachment.mimeType);
              return (
                <div key={attachment.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                  <div className="flex items-center space-x-3">
                    <FileIcon className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{attachment.originalName}</p>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <span>{formatFileSize(attachment.size)}</span>
                        <span>•</span>
                        <span>{new Date(attachment.createdAt).toLocaleDateString()}</span>
                      </div>
                      {attachment.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {attachment.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(attachment)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      <FileUploadForm
        open={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        entityType={entityType}
        entityId={entityId}
      />
    </Card>
  );
}