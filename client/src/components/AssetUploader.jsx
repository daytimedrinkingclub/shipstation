import React, { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Info, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { LoaderCircle } from "lucide-react";
import { useProject } from "@/hooks/useProject";
import { createClient } from "@supabase/supabase-js";

const AssetUploader = ({ shipId }) => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const [supabase] = useState(() => createClient(supabaseUrl, supabaseKey));

  const [assets, setAssets] = useState([]);
  const [uploadedAssets, setUploadedAssets] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const { uploadAssets } = useProject(shipId);

  const onDrop = useCallback((acceptedFiles) => {
    setAssets((prevAssets) => [
      ...prevAssets,
      ...acceptedFiles.map((file) => ({ file, comment: "" })),
    ]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const removeAsset = (index) => {
    setAssets((prevAssets) => prevAssets.filter((_, i) => i !== index));
  };

  const updateComment = (index, comment) => {
    setAssets((prevAssets) =>
      prevAssets.map((asset, i) =>
        i === index ? { ...asset, comment } : asset
      )
    );
  };

  const handleUploadAssets = async () => {
    setIsUploading(true);
    try {
      const newUploadedAssets = await uploadAssets(assets);
      setUploadedAssets((prev) => [...prev, ...newUploadedAssets]);
      setAssets([]);
      toast.success("Assets uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload assets");
    } finally {
      setIsUploading(false);
    }
  };

  const copyToClipboard = (url, index) => {
    navigator.clipboard
      .writeText(url)
      .then(() => {
        setCopiedIndex(index);
        toast.success("URL copied to clipboard");
        setTimeout(() => setCopiedIndex(null), 2000); // Reset after 2 seconds
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
        toast.error("Failed to copy URL");
      });
  };

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const { data, error } = await supabase
          .from("ships")
          .select("assets")
          .eq("slug", shipId)
          .single();

        if (error) throw error;

        if (data && data.assets) {
          if (Array.isArray(data.assets)) {
            setUploadedAssets(data.assets);
          } else if (typeof data.assets === "string") {
            try {
              const parsedAssets = JSON.parse(data.assets);
              setUploadedAssets(
                Array.isArray(parsedAssets) ? parsedAssets : []
              );
            } catch (parseError) {
              console.error("Error parsing assets JSON:", parseError);
              setUploadedAssets([]);
            }
          } else if (
            typeof data.assets === "object" &&
            Object.keys(data.assets).length === 0
          ) {
            setUploadedAssets([]);
          } else {
            console.error("Unexpected assets format:", data.assets);
            setUploadedAssets([]);
          }
        } else {
          setUploadedAssets([]);
        }
      } catch (error) {
        console.error("Error fetching assets:", error);
        toast.error("Failed to fetch assets");
      }
    };

    fetchAssets();
  }, [shipId, supabase]);

  return (
    <div className="p-4">
      <div className="mb-4 text-sm text-muted-foreground bg-muted p-3 rounded-md flex items-center">
        <Info className="mr-2 h-5 w-5 text-primary flex-shrink-0" />
        <p>
          Adding comments to your assets helps our AI better understand and
          utilize them in your project. Please provide a brief description for
          each uploaded file.
        </p>
      </div>

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

      {uploadedAssets.length > 0 ? (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Uploaded Assets:</h3>
          <ul className="space-y-2">
            {uploadedAssets.map((asset, index) => (
              <li
                key={index}
                className="flex items-center justify-between bg-gray-100 p-2 rounded"
              >
                <div>
                  <a
                    href={asset.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {asset.fileName || asset.url.split("/").pop()}
                  </a>
                  <p className="text-sm text-gray-600">{asset.comment}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(asset.url, index)}
                  className="ml-2 text-xs"
                >
                  {copiedIndex === index ? (
                    <>
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy URL
                    </>
                  )}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="mt-4 text-center text-gray-500">
          No assets uploaded yet.
        </div>
      )}

      {assets.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Selected Assets:</h3>
          <ul className="space-y-4">
            {assets.map((asset, index) => (
              <li
                key={index}
                className="flex items-center justify-between bg-gray-100 p-4 rounded"
              >
                <div className="flex-grow mr-4">
                  <p className="font-medium">{asset.file.name}</p>
                  <Input
                    type="text"
                    placeholder="Add a comment for this asset"
                    value={asset.comment}
                    onChange={(e) => updateComment(index, e.target.value)}
                    className="mt-2"
                  />
                </div>
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
          <Button
            className="mt-4"
            onClick={handleUploadAssets}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                Uploading{" "}
                <LoaderCircle className="inline-block ml-1 animate-spin" />
              </>
            ) : (
              "Upload Assets"
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default AssetUploader;
