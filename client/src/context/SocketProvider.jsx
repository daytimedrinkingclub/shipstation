import { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";
import { AuthContext } from "./AuthContext";
import { toast } from "@/components/ui/use-toast";

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [conversation, setConversation] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const newSocket = io("https://shipstation.ai");
    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on("connect", () => {
        if (!roomId) {
          const newRoomId = "room_" + Math.random().toString(36).substr(2, 9);
          setRoomId(newRoomId);
          socket.emit("joinRoom", newRoomId);
        }
      });

      socket.on("newMessage", ({ conversation: messages }) => {
        if (messages) {
          setConversation(messages);
        }
      });

      socket.on("error", ({ error }) => {
        console.error("Error:", error);
        // You can add a function to show error messages here
      });

      socket.on("websiteDeployed", ({ slug }) => {
        const deployedUrl = `${window.location.protocol}//${window.location.host}/${slug}`;
        // You can add a function to show success message here
      });

      socket.on("progress", ({ message }) => {
        // You can add a function to update progress here
      });
    }
  }, [socket, roomId]);

  const sendMessage = (event, data) => {
    debugger;
    if (socket) {
      const userId = user?.id;
      socket.emit(event, {
        roomId,
        userId,
        ...data,
      });
    }
  };

  const value = {
    socket,
    roomId,
    conversation,
    sendMessage,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};
