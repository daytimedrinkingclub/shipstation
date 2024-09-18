import React, { useState } from "react";
import { Copy, Check, ExternalLink, FileIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

const Assets = ({ assets }) => {
  const [copiedIndex, setCopiedIndex] = useState(null);

  const copyToClipboard = (url, index) => {
    navigator.clipboard
      .writeText(url)
      .then(() => {
        setCopiedIndex(index);
        toast.success("URL copied to clipboard");
        setTimeout(() => setCopiedIndex(null), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
        toast.error("Failed to copy URL");
      });
  };

  const getFileExtension = (fileName) => {
    return fileName.split(".").pop().toUpperCase();
  };

  const isImageFile = (fileName) => {
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "webp"];
    const extension = fileName.split(".").pop().toLowerCase();
    return imageExtensions.includes(extension);
  };

  return (
    <div className="p-4">
      {assets && assets.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {assets.map((asset, index) => (
            <Card
              key={index}
              className="h-auto hover:shadow-lg transition-shadow duration-300"
            >
              <CardHeader className="p-4 bg-gray-50">
                <div className="aspect-square bg-white rounded-md flex items-center justify-center overflow-hidden border border-gray-200">
                  {isImageFile(asset.fileName || asset.url) ? (
                    <img
                      src={asset.url}
                      alt={asset.fileName}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="text-4xl font-bold text-gray-400 flex flex-col items-center">
                      <FileIcon className="h-12 w-12 mb-2" />
                      {getFileExtension(asset.fileName || asset.url)}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="px-4 pt-2 pb-0">
                <CardTitle className="text-sm font-medium truncate">
                  {asset.fileName || asset.url.split("/").pop()}
                </CardTitle>
                <p className="text-sm text-gray-600 truncate">
                  {asset.comment}
                </p>
              </CardContent>
              <CardFooter className="py-2 px-4 flex justify-between">
                <Button
                  variant="icon"
                  size="icon"
                  onClick={() => copyToClipboard(asset.url, index)}
                >
                  {copiedIndex === index ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="icon"
                  size="icon"
                  onClick={() => window.open(asset.url, "_blank")}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500">No assets available.</div>
      )}
    </div>
  );
};

export default Assets;
