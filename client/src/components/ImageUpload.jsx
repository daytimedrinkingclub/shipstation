import React, { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import {
  Image,
  X,
  Upload,
  CheckCircle,
  ArrowDown,
  ImageIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const WaveAnimation = ({ isVisible }) => (
  <motion.div
    initial={{ opacity: 0, y: "100%" }}
    animate={{ opacity: isVisible ? 0.5 : 0, y: isVisible ? "0%" : "100%" }}
    transition={{ duration: 0.8, ease: "easeInOut" }}
    className="absolute inset-0 overflow-hidden"
  >
    <svg
      className="waves"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox="0 24 150 28"
      preserveAspectRatio="none"
      shapeRendering="auto"
    >
      <defs>
        <path
          id="gentle-wave"
          d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"
        />
      </defs>
      <g className="parallax">
        <use
          xlinkHref="#gentle-wave"
          x="48"
          y="0"
          fill="rgba(59, 130, 246, 0.7)"
        />
        <use
          xlinkHref="#gentle-wave"
          x="48"
          y="3"
          fill="rgba(59, 130, 246, 0.5)"
        />
        <use
          xlinkHref="#gentle-wave"
          x="48"
          y="5"
          fill="rgba(59, 130, 246, 0.3)"
        />
        <use
          xlinkHref="#gentle-wave"
          x="48"
          y="7"
          fill="rgba(59, 130, 246, 0.1)"
        />
      </g>
    </svg>
  </motion.div>
);

const ImageUpload = ({ onImageUpload }) => {
  const [uploadStatus, setUploadStatus] = useState("idle");
  const [previews, setPreviews] = useState([]);
  const [isDraggingOnPage, setIsDraggingOnPage] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);

  useEffect(() => {
    onImageUpload(previews);
  }, [previews, onImageUpload]);

  const onDrop = useCallback((acceptedFiles) => {
    setUploadStatus("uploading");

    const processFile = (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target.result;
          const [header, base64Data] = result.split(",");
          const mediaType = file.type || header.split(":")[1].split(";")[0];

          resolve({
            file: base64Data,
            caption: "",
            mediaType: mediaType,
            preview: URL.createObjectURL(file),
          });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    };

    Promise.all(acceptedFiles.map(processFile))
      .then((processedFiles) => {
        setPreviews((prev) => [...prev, ...processedFiles].slice(0, 5));
        setUploadStatus("success");
      })
      .catch(() => {
        setUploadStatus("error");
      });
  }, []);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [],
      "image/jpxg": [],
      "image/png": [],
      "image/gif": [],
      "image/webp": [],
    },
    maxFiles: 5,
    maxSize: 5 * 1024 * 1024,
  });

  const handleImageClick = (e, index) => {
    e.stopPropagation();
    setSelectedImageIndex(index);
  };

  const closeImagePreview = (e) => {
    e.stopPropagation();
    setSelectedImageIndex(null);
  };

  const handleCaptionChange = (index, newCaption) => {
    setPreviews((prev) => {
      const newPreviews = prev.map((p, i) =>
        i === index ? { ...p, caption: newCaption } : p
      );
      onImageUpload(newPreviews);
      return newPreviews;
    });
  };

  const removeImage = (index) => {
    setPreviews((prev) => {
      const newPreviews = prev.filter((_, i) => i !== index);
      onImageUpload(newPreviews);
      return newPreviews;
    });
    setUploadStatus(previews.length === 1 ? "idle" : "success");
  };

  const handleCaptionKeyDown = (e, index) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.target.blur();
    }
  };

  const updateCaption = (index, newCaption) => {
    setPreviews((prev) => {
      const newPreviews = prev.map((p, i) =>
        i === index ? { ...p, caption: newCaption } : p
      );
      onImageUpload(newPreviews);
      return newPreviews;
    });
  };

  useEffect(() => {
    const handleDragEnter = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDraggingOnPage(true);
    };

    const handleDragLeave = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.target === document || e.target === document.documentElement) {
        setIsDraggingOnPage(false);
      }
    };

    const handleDragOver = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDraggingOnPage(false);
    };

    const handleDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDraggingOnPage(false);
    };

    window.addEventListener("dragenter", handleDragEnter);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("drop", handleDrop);

    return () => {
      window.removeEventListener("dragenter", handleDragEnter);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("drop", handleDrop);
    };
  }, []);

  // useEffect(() => {
  //   document.documentElement.style.setProperty("--primary-rgb", "59, 130, 246");
  //   return () =>
  //     previews.forEach((preview) => URL.revokeObjectURL(preview.preview));
  // }, [previews]);

  return (
    <div className="w-full">
      <motion.div
        {...getRootProps()}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3 }}
      >
        <div
          className={`w-full mb-4 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer overflow-hidden bg-gradient-to-br from-blue-50 to-white relative
            ${
              isDragAccept
                ? "border-green-500"
                : isDragReject
                ? "border-red-500"
                : "border-gray-300"
            }`}
          style={{
            minHeight: "200px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <input {...getInputProps()} />

          <AnimatePresence>
            {(isDragActive || isDraggingOnPage) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 bg-gradient-to-br from-blue-200 to-blue-500 flex flex-col items-center justify-center"
                style={{ zIndex: 1000 }}
              >
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  className="text-center"
                >
                  <h2 className="text-white text-3xl font-bold mb-2">
                    Drop your images here
                  </h2>
                  <p className="text-blue-100 text-lg">
                    Release to upload up to 5 images
                  </p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.3 }}
                  className="mt-4 flex space-x-4"
                >
                  <motion.div
                    className="w-16 h-16 bg-white bg-opacity-20 rounded-lg flex items-center justify-center"
                    whileHover={{
                      scale: 1.05,
                      backgroundColor: "rgba(255,255,255,0.3)",
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <ImageIcon className="text-white" size={32} />
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {previews.length > 0 ? (
            <div className="relative flex flex-wrap justify-center gap-4 w-full">
              {previews.map((preview, index) => (
                <motion.div
                  key={preview.preview}
                  className="relative bg-white rounded-lg shadow-md overflow-hidden"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  onClick={(e) => handleImageClick(e, index)}
                >
                  <img
                    src={preview.preview}
                    alt={`Preview ${index + 1}`}
                    className="w-48 h-48 object-cover"
                  />
                  <div className="p-2">
                    <input
                      type="text"
                      value={preview.caption || ""}
                      onChange={(e) =>
                        handleCaptionChange(index, e.target.value)
                      }
                      onKeyDown={(e) => handleCaptionKeyDown(e, index)}
                      placeholder="Add a caption..."
                      className="w-full text-sm p-1 border-b focus:outline-none focus:border-blue-500"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(index);
                    }}
                    className="absolute top-2 right-2 bg-white p-1 rounded-full shadow-md"
                    whileHover={{ scale: 1.3 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="text-gray-700" size={16} />
                  </motion.button>
                </motion.div>
              ))}
              {/* Image Preview Modal */}
              {selectedImageIndex !== null && (
                <div
                  className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                  onClick={closeImagePreview}
                >
                  <div
                    className="bg-white p-4 rounded-lg max-w-3xl max-h-[90vh] overflow-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <img
                      src={previews[selectedImageIndex].preview}
                      alt={`Preview ${selectedImageIndex + 1}`}
                      className="max-w-full max-h-[80vh] object-contain"
                    />
                    <p className="mt-2 text-center text-gray-700">
                      {previews[selectedImageIndex].caption || "No caption"}
                    </p>
                  </div>
                </div>
              )}
              {previews.length < 5 && (
                <motion.div
                  className="w-48 h-48 border-2 border-dashed border-blue-500 rounded-lg flex items-center justify-center"
                  whileHover={{ scale: 1.05, borderColor: "#3b82f6" }}
                  transition={{ duration: 0.2 }}
                >
                  <Upload className="text-blue-500" size={32} />
                </motion.div>
              )}
            </div>
          ) : (
            <div className="relative w-full">
              {uploadStatus === "uploading" ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                >
                  <Upload className="mx-auto mb-4 text-primary" size={48} />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Image className="mx-auto mb-4 text-blue-400" size={48} />
                </motion.div>
              )}
              <motion.p
                className="text-lg font-medium mb-2 text-gray-700"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.5 }}
              >
                {uploadStatus === "uploading"
                  ? "Uploading your masterpieces..."
                  : uploadStatus === "error"
                  ? "Oops! Something went wrong. Let's try again."
                  : "Drag & drop up to 5 images here, or click to select"}
              </motion.p>
              <motion.p
                className="text-sm text-gray-500"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                Max 5 images, 5MB each
              </motion.p>
            </div>
          )}

          <WaveAnimation
            isVisible={
              !isDragActive &&
              !isDraggingOnPage &&
              previews.length === 0 &&
              uploadStatus !== "success"
            }
          />
        </div>
      </motion.div>

      <style>{`
        .waves {
          position: absolute;
          width: 100%;
          height: 100%;
          bottom: 0;
          left: 0;
          right: 0;
        }
        .parallax > use {
          animation: move-forever 25s cubic-bezier(0.55, 0.5, 0.45, 0.5)
            infinite;
        }
        .parallax > use:nth-child(1) {
          animation-delay: -2s;
          animation-duration: 7s;
        }
        .parallax > use:nth-child(2) {
          animation-delay: -3s;
          animation-duration: 10s;
        }
        .parallax > use:nth-child(3) {
          animation-delay: -4s;
          animation-duration: 13s;
        }
        .parallax > use:nth-child(4) {
          animation-delay: -5s;
          animation-duration: 20s;
        }
        @keyframes move-forever {
          0% {
            transform: translate3d(-90px, 0, 0);
          }
          100% {
            transform: translate3d(85px, 0, 0);
          }
        }
      `}</style>
    </div>
  );
};

export default ImageUpload;
