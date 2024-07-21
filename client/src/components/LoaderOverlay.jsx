import Lottie from "react-lottie-player";
import lottieAnimation from "../assets/lottie/ship.json";
import { useEffect, useState, useRef } from "react";
import { useSocket } from "@/context/SocketProvider";

const LoaderOverlay = ({ isOpen, type }) => {
  const { socket } = useSocket();

  const [loaderText, setLoaderText] = useState("");
  const [slug, setSlug] = useState(null);
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
          iframeRef.current.src = iframeRef.current.src;
        }
      });

      socket.on("project_started", ({ slug }) => {
        setSlug(slug);
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
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-90 backdrop-filter backdrop-blur-md">
      <div className="flex flex-col items-center justify-center">
        <h2 className="text-3xl font-bold mb-4 text-white text-center">{type === "portfolio" ? "Generating your portfolio" : "Generating your landing page"}</h2>
        <span className="text-lg mb-8 text-white text-center">It will take around 2-4 minutes</span>
        <p className="text-2xl font-semibold mb-6 text-white text-center">{loaderText}</p>
        <div className="h-full flex justify-center items-center">
          <div className="w-[375px] sm:w-[390px] max-w-[80%] sm:h-[700px] h-[600px] bg-white rounded-[40px] shadow-lg overflow-hidden relative">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-6 bg-black rounded-b-3xl"></div>
            {slug ? (
              <iframe
                ref={iframeRef}
                src={`${import.meta.env.VITE_BACKEND_URL}/${slug}/`}
                className="w-full h-full border-0 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100"
              ></iframe>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Lottie
                  loop
                  animationData={lottieAnimation}
                  play
                  style={{ width: 150, height: 150 }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoaderOverlay;
