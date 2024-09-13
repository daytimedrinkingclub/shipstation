import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const AssetUploader = ({ shipId }) => {
  const [assets, setAssets] = useState([]);

  const onDrop = useCallback((acceptedFiles) => {
    setAssets((prevAssets) => [...prevAssets, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const removeAsset = (index) => {
    setAssets((prevAssets) => prevAssets.filter((_, i) => i !== index));
  };

  const uploadAssets = async () => {
    const formData = new FormData();
    assets.forEach((asset) => {
      formData.append("assets", asset);
    });
    formData.append("shipId", shipId);

    try {
      const response = await fetch("/api/upload-assets", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        toast.success("Assets uploaded successfully");
        setAssets([]);
      } else {
        toast.error("Failed to upload assets");
      }
    } catch (error) {
      console.error("Error uploading assets:", error);
      toast.error("Error uploading assets");
    }
  };

  return (
    <div className="p-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer ${
          isDragActive ? "border-primary" : "border-gray-300"
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          Drag 'n' drop some files here, or click to select files
        </p>
      </div>
      {assets.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Selected Assets:</h3>
          <ul className="space-y-2">
            {assets.map((asset, index) => (
              <li
                key={index}
                className="flex items-center justify-between bg-gray-100 p-2 rounded"
              >
                <span>{asset.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeAsset(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
          <Button className="mt-4" onClick={uploadAssets}>
            Upload Assets
          </Button>
        </div>
      )}
    </div>
  );
};

export default AssetUploader;
