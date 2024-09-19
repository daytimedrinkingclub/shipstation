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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
              className="overflow-hidden transition-all duration-300 hover:shadow-lg"
            >
              <div className="aspect-square bg-gray-100 relative">
                {isImageFile(asset.fileName) ? (
                  <img
                    src={asset.url}
                    alt={asset.fileName}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                    <FileIcon className="h-16 w-16 mb-2" />
                    <span className="text-sm font-medium">
                      {getFileExtension(asset.fileName)}
                    </span>
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <h3
                  className="font-semibold text-sm mb-1 truncate"
                  title={asset.fileName}
                >
                  {asset.fileName}
                </h3>
                {asset.comment && (
                  <p
                    className="text-sm text-gray-600 truncate"
                    title={asset.comment}
                  >
                    {asset.comment}
                  </p>
                )}
              </CardContent>
              <CardFooter className="p-2 bg-gray-50 flex justify-between">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(asset.url, index)}
                        className="hover:bg-gray-200"
                      >
                        {copiedIndex === index ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{copiedIndex === index ? "Copied!" : "Copy URL"}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => window.open(asset.url, "_blank")}
                        className="hover:bg-gray-200"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Open in new tab</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
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
