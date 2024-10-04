import React, { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { sanitizeFileName } from "@/lib/utils/sanitizeFileName";

import { useDispatch } from "react-redux";
import { setImagesForAI, setWebsiteAssets } from "@/store/onboardingSlice";

const FileUpload = ({ onFileUpload }) => {
  const dispatch = useDispatch();
  const [files, setFiles] = useState([]);

  const onDrop = useCallback((acceptedFiles) => {
    const newFiles = acceptedFiles.map((file) => {
      const sanitizedName = sanitizeFileName(file.name);
      const renamedFile = new File([file], sanitizedName, { type: file.type });
      return {
        file: renamedFile,
        forAI: true,
        forWebsite: false,
        preview: URL.createObjectURL(file),
        comment: "",
      };
    });
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
      "application/pdf": [],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  useEffect(() => {
    const imagesForAI = [];
    const websiteAssets = [];

    files.forEach((file, index) => {
      if (file.forAI) {
        imagesForAI.push({
          id: index,
          comment: file.comment,
          mediaType: file.file.type,
          fileName: file.file.name,
        });
      }
      if (file.forWebsite) {
        websiteAssets.push({
          id: index,
          fileName: file.file.name,
          fileType: file.file.type,
          fileSize: file.file.size,
          comment: file.comment,
        });
      }
    });

    dispatch(setImagesForAI(imagesForAI));
    dispatch(setWebsiteAssets(websiteAssets));
    onFileUpload(files);
  }, [files, dispatch, onFileUpload]);

  useEffect(() => {
    // Cleanup object URLs on unmount
    return () => files.forEach((file) => URL.revokeObjectURL(file.preview));
  }, [files]);

  const toggleUse = (index, use) => {
    const updatedFiles = [...files];
    updatedFiles[index][use] = !updatedFiles[index][use];
    setFiles(updatedFiles);
  };

  const updateComment = (index, comment) => {
    const updatedFiles = [...files];
    updatedFiles[index].comment = comment;
    setFiles(updatedFiles);
  };

  const removeFile = (index) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-4">
        {files.map((file, index) => (
          <Card key={index} className="overflow-hidden">
            <div className="relative aspect-video">
              {file.file.type.startsWith("image/") ? (
                <img
                  src={file.preview}
                  alt={file.file.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">{file.file.name}</span>
                </div>
              )}
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1"
                onClick={() => removeFile(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <CardContent className="space-y-2 pt-2">
              <div>
                <p className="font-semibold mb-1 text-sm">{file.file.name}</p>
                <p className="text-xs text-gray-500">
                  {(file.file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`forAI-${index}`} className="text-xs">
                    This is a reference image
                  </Label>
                  <Switch
                    id={`forAI-${index}`}
                    checked={file.forAI}
                    onCheckedChange={() => toggleUse(index, "forAI")}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  The AI will use this file to guide website design and content
                  suggestions.
                </p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`forWebsite-${index}`} className="text-xs">
                    I want to add this image to my website
                  </Label>
                  <Switch
                    id={`forWebsite-${index}`}
                    checked={file.forWebsite}
                    onCheckedChange={() => toggleUse(index, "forWebsite")}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  This file will appear on your finished website.
                </p>
              </div>
              <div>
                <Label htmlFor={`comment-${index}`} className="text-xs">
                  How do you plan to use this file?
                </Label>
                <Textarea
                  id={`comment-${index}`}
                  placeholder="e.g., As a header image, In the about section, etc."
                  value={file.comment}
                  onChange={(e) => updateComment(index, e.target.value)}
                  className="mt-1 text-xs"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-gray-300 hover:border-primary"
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto mb-2 text-gray-400" size={24} />
        <p className="text-sm text-gray-600">
          Drag & drop files here, or click to select files
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Accepts images and PDFs up to 5MB each
        </p>
      </div>
    </div>
  );
};

export default FileUpload;
