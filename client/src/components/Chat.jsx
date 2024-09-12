import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSocket } from "@/context/SocketProvider";
import { createClient } from "@supabase/supabase-js";

const Chat = ({ shipId, onCodeUpdate }) => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const [supabase] = useState(() => createClient(supabaseUrl, supabaseKey));

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { socket } = useSocket();
  const messagesEndRef = useRef(null);

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
    const { data, error } = await supabase
      .from("code_refining_conversations")
      .select("messages")
      .eq("ship_id", shipId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows returned, set empty messages array
        setMessages([]);
      } else {
        console.error("Error fetching conversation history:", error);
      }
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
      socket.emit("chatMessage", { shipId, message: input });
      setInput("");
    }
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
            {isLoading ? "Sending..." : "Send"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
