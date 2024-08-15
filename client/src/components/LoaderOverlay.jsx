import { useEffect, useState, useRef } from "react";
import { useSocket } from "@/context/SocketProvider";
import IframePreview, { DEVICE_FRAMES } from "./IframePreview";
import Dice from "./random/Dice";

const LoaderOverlay = ({ isOpen, type }) => {
  const { socket } = useSocket();

  const [loaderText, setLoaderText] = useState(
    "It will take around 2-4 minutes"
  );
  const [currentDevice, setCurrentDevice] = useState(DEVICE_FRAMES[0]);
  const [slug, setSlug] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const iframeRef = useRef(null);

  useEffect(() => {
    if (socket) {
      socket.on("error", ({ error }) => {
        console.error("Error:", error);
        // You can add a function to show error messages here
      });

      socket.on("progress", ({ message }) => {
        setLoaderText(message);
        if (iframeRef.current) {
          iframeRef.current.reload();
        }
      });

      socket.on("project_started", ({ slug }) => {
        setSlug(slug);
        setIsLoading(false);
      });

      return () => {
        socket.off("error");
        socket.off("progress");
        socket.off("project_started");
      };
    }
  }, [socket]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex bg-background backdrop-blur-sm overflow-hidden">
      <div className="absolute inset-0 opacity-30 bg-shimmer-gradient bg-[length:200%_100%] animate-shimmer" />
      <div className="sm:w-1/2 w-full flex flex-col items-center justify-center p-12 relative z-10">
        <h2 className="text-4xl font-bold text-white text-center leading-tight mb-4">
          {type === "portfolio"
            ? "Generating your portfolio"
            : "Generating your landing page"}
        </h2>
        <p className="text-lg text-white text-center mt-4">{loaderText}</p>
      </div>
      <div className="w-1/2 sm:flex justify-center items-center hidden relative z-10">
        <IframePreview
          device={currentDevice}
          ref={iframeRef}
          slug={slug}
          isLoading={isLoading}
        />
      </div>
      <div className="absolute bottom-8 right-8 z-20">
        <Dice
          onRoll={() =>
            setCurrentDevice(
              DEVICE_FRAMES[Math.floor(Math.random() * DEVICE_FRAMES.length)]
            )
          }
        />
      </div>
    </div>
  );
};

export default LoaderOverlay;