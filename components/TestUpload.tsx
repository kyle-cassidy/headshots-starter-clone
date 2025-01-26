"use client";

import { useState } from "react";
import { upload } from "@vercel/blob/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export default function TestUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/token",
        clientPayload: JSON.stringify({ test: "payload" }),
      });

      toast({
        title: "Upload successful",
        description: `File uploaded to: ${blob.url}`,
      });
      console.log("Upload response:", blob);
    } catch (error) {
      console.error("Upload failed:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <h2 className="text-lg font-semibold">Test Upload Component</h2>
      <div className="flex flex-col gap-2">
        <input
          type="file"
          onChange={handleFileChange}
          accept="image/jpeg,image/png,image/gif"
          className="border p-2 rounded"
        />
        <Button 
          onClick={handleUpload} 
          disabled={!file || isUploading}
        >
          {isUploading ? "Uploading..." : "Upload File"}
        </Button>
      </div>
      {file && (
        <div className="text-sm">
          Selected file: {file.name} ({Math.round(file.size / 1024)}KB)
        </div>
      )}
    </div>
  );
} 