import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSocket } from "@/context/SocketProvider";
import { supabase } from "@/lib/supabaseClient";
import { Checkbox } from "@/components/ui/checkbox";

const Chat = ({ shipId, onCodeUpdate, assetCount, onChangeTab }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { socket } = useSocket();
  const messagesEndRef = useRef(null);
  const [useAllAssets, setUseAllAssets] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchConversationHistory();

    if (socket) {
      socket.on("chatResponse", handleChatResponse);
      socket.on("codeUpdate", handleCodeUpdate);

      return () => {
        socket.off("chatResponse", handleChatResponse);
        socket.off("codeUpdate", handleCodeUpdate);
      };
    }
  }, [socket, onCodeUpdate, shipId]);

  const fetchConversationHistory = async () => {
    try {
      const { data, error } = await supabase
        .from("code_refining_conversations")
        .select("messages")
        .eq("ship_slug", shipId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching conversation history:", error);
        setMessages([]);
      } else if (data) {
        const displayMessages = data.messages
          .filter(
            (msg) =>
              msg.role === "user" ||
              (msg.role === "assistant" &&
                msg.content.some((c) => c.type === "text"))
          )
          .map((msg) => ({
            text:
              msg.role === "user"
                ? msg.content
                : msg.content.find((c) => c.type === "text").text,
            sender: msg.role,
          }));
        setMessages(displayMessages);
      } else {
        // No data found, set empty messages array
        setMessages([]);
      }
    } catch (error) {
      console.error("Unexpected error fetching conversation history:", error);
      setMessages([]);
    }
  };

  const handleChatResponse = (response) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { text: response.updatedMessage, sender: "assistant" },
    ]);
    setIsLoading(false);
  };

  const handleCodeUpdate = (updatedCode) => {
    onCodeUpdate(updatedCode);
  };

  const handleSend = () => {
    if (input.trim()) {
      setIsLoading(true);
      const userMessage = { text: input, sender: "user" };
      setMessages((prevMessages) => [...prevMessages, userMessage]);
      socket.emit("chatMessage", { shipId, message: input, useAllAssets });
      setInput("");
    }
  };

  const handleAssetClick = () => {
    onChangeTab("assets");
  };

  const ThreeDotLoader = () => {
    return (
      <div className="flex space-x-2">
        <div
          className="w-2 h-2 bg-white rounded-full animate-bounce"
          style={{ animationDelay: "0s" }}
        ></div>
        <div
          className="w-2 h-2 bg-white rounded-full animate-bounce"
          style={{ animationDelay: "0.2s" }}
        ></div>
        <div
          className="w-2 h-2 bg-white rounded-full animate-bounce"
          style={{ animationDelay: "0.4s" }}
        ></div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-scroll p-4 pt-4 max-h-[calc(100vh-120px)]">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-2 ${
              message.sender === "user" ? "text-right" : "text-left"
            }`}
          >
            <span
              className={`inline-block p-2 rounded ${
                message.sender === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              {message.text}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-border">
        {assetCount > 0 && (
          <div className="mb-4 p-4 bg-blue-100 rounded-md">
            <p>
              You have{" "}
              <span
                className="relative inline-block cursor-pointer text-blue-600 hover:text-blue-800 transition-colors duration-300 ease-in-out"
                onClick={handleAssetClick}
              >
                <span className="underline">
                  {assetCount} asset{assetCount !== 1 ? "s" : ""}
                </span>
              </span>{" "}
              available.
            </p>
            <div className="flex items-center mt-2">
              <Checkbox
                id="useAllAssets"
                checked={useAllAssets}
                onCheckedChange={setUseAllAssets}
              />
              <label htmlFor="useAllAssets" className="ml-2 text-sm">
                Use all available assets
              </label>
            </div>
          </div>
        )}
        <div className="flex flex-col space-y-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            disabled={isLoading}
            rows={3}
          />
          <Button onClick={handleSend} disabled={isLoading}>
            {isLoading ? <ThreeDotLoader /> : "Send"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
