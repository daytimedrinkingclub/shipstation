import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Paperclip, X, FileIcon, Image, Info, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { sanitizeFileName } from "@/lib/utils/sanitizeFileName";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import FilePreview from "@/components/FilePreview";

export default function CustomDesignPrompt({
  customDesignPrompt,
  setCustomDesignPrompt,
  isGenerating,
  onKeyPress,
  onAssetsUpdate,
  assets,
}) {
  const [dragOver, setDragOver] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tempFiles, setTempFiles] = useState([]);
  const [resumeFile, setResumeFile] = useState(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleFiles = (files) => {
    const newFiles = Array.from(files).map((file) => {
      const sanitizedName = sanitizeFileName(file.name);
      const renamedFile = new File([file], sanitizedName, { type: file.type });
      return {
        file: renamedFile,
        forAI: false,
        forWebsite: true,
        preview: URL.createObjectURL(file),
        description: "",
      };
    });

    setTempFiles(newFiles);
    setIsDialogOpen(true);
  };

  const handleDescriptionChange = (fileName, description) => {
    setTempFiles((prevFiles) =>
      prevFiles.map((file) =>
        file.file.name === fileName ? { ...file, description } : file
      )
    );
  };

  const handleTabChange = (fileName, value) => {
    setTempFiles((prevFiles) =>
      prevFiles.map((file) =>
        file.file.name === fileName
          ? {
              ...file,
              forWebsite: value === "portfolio",
              forAI: value === "reference",
            }
          : file
      )
    );
  };

  const isSupportedImageFormat = (file) => {
    const supportedFormats = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    return supportedFormats.includes(file.type);
  };

  const handleDialogConfirm = () => {
    // Check total number of files
    if (assets.length + tempFiles.length > 5) {
      toast.error("You can upload a maximum of 5 files in total.");
      return;
    }

    // Check file sizes
    const oversizedFiles = tempFiles.filter(
      (file) => file.file.size > 5 * 1024 * 1024
    );
    if (oversizedFiles.length > 0) {
      toast.error("Each file must be 5MB or smaller.");
      return;
    }

    // Check for unsupported file formats for AI reference
    const unsupportedFiles = tempFiles.filter(
      (file) => file.forAI && !isSupportedImageFormat(file.file)
    );
    if (unsupportedFiles.length > 0) {
      const fileNames = unsupportedFiles
        .map((file) => file.file.name)
        .join(", ");
      toast.error(
        `Unsupported file format for AI reference: ${fileNames}. Use JPEG, PNG, GIF, or WebP for images.`
      );
      return;
    }

    // If all checks pass, update the assets
    onAssetsUpdate([...assets, ...tempFiles]);
    setTempFiles([]);
    setIsDialogOpen(false);
    toast.success(`${tempFiles.length} asset(s) added successfully!`);
  };

  const removeAsset = (index) => {
    const assetToRemove = assets[index];
    const updatedAssets = assets.filter((_, i) => i !== index);
    onAssetsUpdate(updatedAssets);
    
    // If the removed asset was the resume, also clear the resumeFile state
    if (assetToRemove === resumeFile) {
      setResumeFile(null);
    }
  };

  const handleRemoveFile = (fileName) => {
    setTempFiles((prevFiles) =>
      prevFiles.filter((file) => file.file.name !== fileName)
    );
  };

  const handleResumeUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      const sanitizedName = sanitizeFileName(file.name);
      const renamedFile = new File([file], sanitizedName, { type: file.type });
      const newResumeFile = {
        file: renamedFile,
        forAI: false,
        forWebsite: true,
        preview: URL.createObjectURL(file),
        description:
          "User added a resume pdf, this can be used for content of the portfolio.",
      };
      
      setResumeFile(newResumeFile);
      
      // Update assets by replacing the old resume (if any) with the new one
      const updatedAssets = assets.filter(asset => asset !== resumeFile);
      onAssetsUpdate([...updatedAssets, newResumeFile]);
      
      toast.success("Resume updated successfully!");
    } else {
      toast.error("Please upload a PDF file for your resume.");
    }
  };

  return (
    <div
      className="relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="relative border border-input rounded-md overflow-hidden">
        <Textarea
          placeholder="Describe your ideal portfolio design. You can also drag and drop your profile photo and resume here to personalize your portfolio."
          value={customDesignPrompt}
          onChange={(e) => setCustomDesignPrompt(e.target.value)}
          disabled={isGenerating}
          className="w-full h-[150px] resize-none focus:ring-0 p-4 border-none"
          onKeyDown={onKeyPress}
        />
        <div className="flex flex-col sm:flex-row justify-between bg-muted p-2 gap-2">
          <input
            type="file"
            id="resume-input"
            className="hidden"
            onChange={handleResumeUpload}
            accept=".pdf"
          />
          <button
            onClick={() => document.getElementById("resume-input").click()}
            className="flex-1 text-primary hover:text-primary/80 p-2 bg-background hover:bg-accent rounded-md shadow-sm transition-colors"
            disabled={isGenerating}
            type="button"
          >
            <span className="flex items-center justify-center gap-2 text-sm">
              <FileText className="h-4 w-4" />
              Add Resume
            </span>
          </button>
          <input
            type="file"
            id="file-input"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
            multiple
          />
          <button
            onClick={() => document.getElementById("file-input").click()}
            className="flex-1 text-primary hover:text-primary/80 p-2 bg-background hover:bg-accent rounded-md shadow-sm transition-colors"
            disabled={isGenerating}
            type="button"
          >
            <span className="flex items-center justify-center gap-2 text-sm">
              <Paperclip className="h-4 w-4" />
              Add Assets
            </span>
          </button>
        </div>
      </div>
      {dragOver && (
        <div className="absolute inset-0 bg-blue-100 bg-opacity-90 border-2 border-blue-500 rounded-md flex items-center justify-center z-10 backdrop-blur-sm px-4">
          <FileIcon className="w-6 h-6 text-blue-700 transform rotate-12 mr-2" />
          <p className="text-blue-700 text-center">
            Drop files here to add as assets to your portfolio
            <br />
            <span className="text-sm">
              Upload images, PDFs, or any other files you want to use in your
              site
            </span>
          </p>
          <Image className="w-6 h-6 text-blue-700 transform -rotate-12 ml-2" />
        </div>
      )}
      {assets.length > 0 && (
        <div className="mt-4 overflow-x-auto">
          <div className="flex space-x-4 pb-2">
            {assets.map((asset, index) => (
              <div key={index} className="relative flex-shrink-0 w-24">
                {asset.file.type.startsWith("image/") ? (
                  <img
                    src={asset.preview}
                    alt={asset.file.name}
                    className="w-24 h-24 object-cover rounded"
                  />
                ) : (
                  <div className="w-24 h-24 bg-secondary flex items-center justify-center rounded">
                    <span className="text-xs text-center break-words px-1">
                      {asset.file.name}
                    </span>
                  </div>
                )}
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6"
                  onClick={() => removeAsset(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle className="mb-2">Enter media details</DialogTitle>
            <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md flex items-center">
              <Info className="mx-2 h-5 w-5 text-primary flex-shrink-0" />
              <p className="px-2">
                If you want to show an image in your portfolio, select "Add to
                Portfolio". If you want to use it as design reference, select
                "Use as Reference".
              </p>
            </div>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-auto p-4">
            {tempFiles.map((file, index) => (
              <Card key={index} className="bg-card relative">
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6 z-10"
                  onClick={() => handleRemoveFile(file.file.name)}
                >
                  <X className="h-3 w-3" />
                </Button>
                <CardContent className="p-4 space-y-4">
                  <div className="aspect-video bg-muted rounded-md overflow-hidden">
                    <FilePreview file={file.file} />
                  </div>
                  <div>
                    <p
                      className="font-semibold truncate text-foreground"
                      title={file.file.name}
                    >
                      {file.file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(file.file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Input
                      placeholder="Describe this asset"
                      value={file.description}
                      onChange={(e) =>
                        handleDescriptionChange(file.file.name, e.target.value)
                      }
                      className="text-xs"
                    />
                    <Tabs
                      defaultValue="portfolio"
                      className="w-full"
                      onValueChange={(value) =>
                        handleTabChange(file.file.name, value)
                      }
                    >
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="portfolio">
                          Add to Portfolio
                        </TabsTrigger>
                        <TabsTrigger value="reference">
                          Use as Reference
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="portfolio">
                        <p className="text-xs text-muted-foreground">
                          This file will be added to your portfolio.
                        </p>
                      </TabsContent>
                      <TabsContent value="reference">
                        <p className="text-xs text-muted-foreground">
                          This file will be used as a reference for AI.
                        </p>
                      </TabsContent>
                    </Tabs>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <DialogFooter>
            <Button
              onClick={handleDialogConfirm}
              disabled={tempFiles.some((file) => !file.description.trim())}
            >
              Add Assets
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
