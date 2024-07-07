import Lottie from "react-lottie-player";
import lottieAnimation from "../assets/lottie/ship.json";
import { useEffect, useState } from "react";
import { useSocket } from "@/context/SocketProvider";

const LoaderOverlay = ({ isOpen }) => {
  const { socket } = useSocket();

  const [loaderText, setLoaderText] = useState("Generating your website...");

  useEffect(() => {
    socket.on("error", ({ error }) => {
      console.error("Error:", error);
      // You can add a function to show error messages here
    });

    socket.on("websiteDeployed", ({ slug }) => {
      const deployedUrl = `${window.location.protocol}//${window.location.host}/${slug}`;
      // You can add a function to show success message here
    });

    socket.on("progress", ({ message }) => {
      setLoaderText(message);
      // You can add a function to update progress here
    });

    return () => {
      socket.off("error");
      socket.off("websiteDeployed");
      socket.off("progress");
    };
  }, [socket]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-90 backdrop-filter backdrop-blur-md">
      <div className="text-center">
        <Lottie
          loop
          animationData={lottieAnimation}
          play
          style={{ width: 256, height: 256 }}
        />
        <p className="text-2xl font-semibold mt-6 text-white">{loaderText}</p>
      </div>
    </div>
  );
};

export default LoaderOverlay;
