import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const AssetUploader = ({ assets }) => {
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

  return (
    <div className="p-4">
      {assets && assets.length > 0 ? (
        <div>
          <ul className="space-y-2">
            {assets.map((asset, index) => (
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
                  variant="icon"
                  size="sm"
                  onClick={() => copyToClipboard(asset.url, index)}
                  className="ml-2 text-xs"
                >
                  {copiedIndex === index ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="text-center text-gray-500">No assets available.</div>
      )}
    </div>
  );
};

export default AssetUploader;
