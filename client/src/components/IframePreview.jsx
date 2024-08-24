import { useRef, useImperativeHandle, forwardRef } from "react";
import { DeviceFrameset } from 'react-device-frameset'
import Lottie from "react-lottie-player";
import lottieAnimation from "../assets/lottie/ship.json";
import 'react-device-frameset/styles/marvel-devices.min.css'

export const DEVICE_FRAMES = ["iPhone X", "iPhone 8", "iPhone 8 Plus", "iPhone 5s", "iPhone 5c", "iPhone 4s", "Galaxy Note 8", "Nexus 5", "Lumia 920", "Samsung Galaxy S5", "HTC One"]
export const HAS_NOTCH = ["iPhone X"];

const IframePreview = forwardRef(({ slug, isLoading, device = 'iPhone X' }, ref) => {
  const iframeRef = useRef(null);

  useImperativeHandle(ref, () => ({
    reload: () => {
      if (iframeRef.current) {
        iframeRef.current.src = iframeRef.current.src;
      }
    },
  }));

  const content = isLoading ? (
    <div className="w-full h-full flex items-center justify-center">
      <Lottie
        loop
        animationData={lottieAnimation}
        play
        style={{ width: 150, height: 150 }}
      />
    </div>
  ) : slug ? (
    <iframe
      ref={iframeRef}
      src={`${import.meta.env.VITE_BACKEND_URL}/site/${slug}/`}
      className={`w-full h-full border-0  ${HAS_NOTCH.includes(device) ? 'pt-8 bg-black' : ''}`}
    ></iframe>
  ) : (
    <div className="w-full h-full flex items-center justify-center text-gray-400">
      No preview available
    </div>
  );



  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="scale-[0.7]">
        <DeviceFrameset device={device}  >
          {content}
        </DeviceFrameset>
      </div>
    </div>
  );
});

export default IframePreview;