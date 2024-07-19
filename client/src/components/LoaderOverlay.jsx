import Lottie from "react-lottie-player";
import lottieAnimation from "../assets/lottie/ship.json";
import { useEffect, useState } from "react";
import { useSocket } from "@/context/SocketProvider";

const LoaderOverlay = ({ isOpen }) => {
  const { socket } = useSocket();

  const [loaderText, setLoaderText] = useState("Generating your website...");

  useEffect(() => {
    if (socket) {
      socket.on("error", ({ error }) => {
        console.error("Error:", error);
        // You can add a function to show error messages here
      });

      socket.on("progress", ({ message }) => {
        setLoaderText(message);
        // You can add a function to update progress here
      });

      return () => {
        socket.off("error");
        socket.off("progress");
      };
    }
  }, [socket]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-90 backdrop-filter backdrop-blur-md">
      <div className="flex flex-col items-center justify-center">
        <Lottie
          loop
          animationData={lottieAnimation}
          play
          style={{ width: 256, height: 256 }}
        />
        <p className="text-2xl font-semibold mt-6 text-white text-center">{loaderText}</p>
      </div>
    </div>
  );
};

export default LoaderOverlay;
