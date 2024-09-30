import React, { useState, useEffect } from "react";
import { FileIcon } from "lucide-react";

const FilePreview = ({ file }) => {
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  }, [file]);

  const isImageFile = (fileName) => {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);
  };

  const getFileExtension = (fileName) => {
    return fileName.split(".").pop().toUpperCase();
  };

  return (
    <div className="aspect-square bg-gray-100 relative overflow-hidden">
      {isImageFile(file.name) ? (
        <img
          src={preview || "/api/placeholder/200/200"}
          alt={file.name}
          className="object-cover w-full h-full"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
          <FileIcon className="h-16 w-16 mb-2" />
          <span className="text-sm font-medium">
            {getFileExtension(file.name)}
          </span>
        </div>
      )}
    </div>
  );
};

export default FilePreview;
