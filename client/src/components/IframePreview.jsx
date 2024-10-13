import React, {
  useRef,
  useImperativeHandle,
  forwardRef,
  useState,
  useEffect,
} from "react";
import { DeviceFrameset } from "react-device-frameset";
import Lottie from "react-lottie-player";
import lottieAnimation from "../assets/lottie/ship.json";
import "react-device-frameset/styles/marvel-devices.min.css";

export const DEVICE_FRAMES = [
  "iPhone X",
  "iPhone 8",
  "iPhone 8 Plus",
  "iPhone 5s",
  "iPhone 5c",
  "iPhone 4s",
  "Galaxy Note 8",
  "Nexus 5",
  "Lumia 920",
  "Samsung Galaxy S5",
  "HTC One",
];
export const HAS_NOTCH = ["iPhone X"];

const IframePreview = forwardRef(
  ({ slug, isLoading, isDeploying, device = null, currentView }, ref) => {
    const iframeRef = useRef(null);
    const containerRef = useRef(null);
    const [isFocused, setIsFocused] = useState(false);

    useImperativeHandle(ref, () => ({
      reload: () => {
        if (iframeRef.current) {
          iframeRef.current.src = iframeRef.current.src;
        }
      },
    }));

    useEffect(() => {
      const container = containerRef.current;
      const iframe = iframeRef.current;

      const handleMouseEnter = () => {
        if (iframe) {
          iframe.focus();
          setIsFocused(true);
        }
      };

      const handleMouseLeave = () => {
        setIsFocused(false);
      };

      const handleWheel = (e) => {
        if (
          currentView !== "fullscreen" &&
          currentView !== "mobile" &&
          !isFocused
        ) {
          e.preventDefault();
        }
      };

      if (container && iframe) {
        container.addEventListener("mouseenter", handleMouseEnter);
        container.addEventListener("mouseleave", handleMouseLeave);
        container.addEventListener("wheel", handleWheel, { passive: false });
      }

      return () => {
        if (container) {
          container.removeEventListener("mouseenter", handleMouseEnter);
          container.removeEventListener("mouseleave", handleMouseLeave);
          container.removeEventListener("wheel", handleWheel);
        }
      };
    }, [currentView, isFocused]);

    const content =
      isLoading || isDeploying ? (
        <div className="w-full h-full flex flex-col items-center justify-center">
          <Lottie
            loop
            animationData={lottieAnimation}
            play
            style={{ width: 150, height: 150 }}
          />
          {isDeploying && (
            <p className="mt-4 text-lg font-semibold">
              Generating your portfolio...
            </p>
          )}
        </div>
      ) : slug ? (
        <iframe
          ref={iframeRef}
          src={`${import.meta.env.VITE_MAIN_URL}/site/${slug}/`}
          className={`w-full h-full border-0 ${
            device && HAS_NOTCH.includes(device) ? "pt-8 bg-black" : ""
          }`}
        ></iframe>
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-400">
          No preview available
        </div>
      );

    const wrapperClass = `w-full h-full ${
      currentView !== "fullscreen" && currentView !== "mobile"
        ? "overflow-auto"
        : ""
    } ${currentView === "mobile" ? "flex items-center justify-center" : ""}`;

    if (device) {
      return (
        <div ref={containerRef} className={wrapperClass}>
          <div className="w-full h-full flex items-center justify-center">
            <div className="max-w-full max-h-full overflow-hidden">
              <div
                className="transform-gpu"
                style={{ transform: 'scale(0.8)', transformOrigin: 'center' }}
              >
                <DeviceFrameset device={device}>{content}</DeviceFrameset>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div ref={containerRef} className={wrapperClass}>
        {content}
      </div>
    );
  }
);

export default IframePreview;
