import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import ThreeDotLoader from "@/components/random/ThreeDotLoader";
import ChatSuggestions from "@/components/ChatSuggestions";
import { useSocket } from "@/context/SocketProvider";
import { supabase } from "@/lib/supabaseClient";
import {
  Copy,
  Send,
  Paperclip,
  X,
  File,
  Image,
  LoaderCircle,
  Info,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useProject } from "@/hooks/useProject";

const Chat = ({ shipId, onCodeUpdate, onAssetsUpdate }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { socket } = useSocket();
  const messagesEndRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [fileDescriptions, setFileDescriptions] = useState({});
  const { uploadAssets } = useProject(shipId);
  const [filesToUpload, setFilesToUpload] = useState([]);
  const [uploadedFileInfos, setUploadedFileInfos] = useState([]);
  const [initialMessageFetched, setInitialMessageFetched] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const initChat = async () => {
    await fetchConversationHistory();
    await fetchInitialUserMessage();
    setInitialMessageFetched(true);
  };

  useEffect(() => {
    initChat();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
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
        setMessages([]);
      }
    } catch (error) {
      console.error("Unexpected error fetching conversation history:", error);
      setMessages([]);
    }
  };

  const fetchInitialUserMessage = async () => {
    const { data, error } = await supabase
      .from("ships")
      .select("prompt")
      .eq("slug", shipId)
      .maybeSingle();

    if (data && data.prompt) {
      setMessages((prevMessages) => {
        // Check if the initial messages are already in the array
        const initialMessagesExist = prevMessages.some(
          (msg) => msg.sender === "user" && msg.text === data.prompt
        );

        if (!initialMessagesExist) {
          const userMessage = { text: data.prompt, sender: "user" };
          const aiMessage = {
            text: `Sure! Your website is live at shipstation.ai/site/${shipId}. How can I help you further with your project?`,
            sender: "assistant",
          };

          // If there are existing messages, add the new ones at the beginning
          if (prevMessages.length > 0) {
            return [userMessage, aiMessage, ...prevMessages];
          } else {
            // If there are no existing messages, just return the new ones
            return [userMessage, aiMessage];
          }
        }
        return prevMessages;
      });
    }
  };

  const handleChatResponse = (response) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { text: response.message, sender: "assistant" },
    ]);
    setIsLoading(false);
  };

  const handleCodeUpdate = (updatedCode) => {
    onCodeUpdate(updatedCode);
  };

  const handleSend = () => {
    if (input.trim() || uploadedFileInfos.length > 0) {
      setIsLoading(true);
      const userMessage = { text: input, sender: "user" };
      setMessages((prevMessages) => [...prevMessages, userMessage]);

      socket.emit("chatMessage", {
        shipId,
        message: input,
        assets: uploadedFileInfos,
      });

      setInput("");
      setUploadedFileInfos([]);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFiles = (files) => {
    const newFiles = Array.from(files);
    setFilesToUpload(newFiles);
    setFileDescriptions(
      newFiles.reduce((acc, file) => ({ ...acc, [file.name]: "" }), {})
    );
    setIsDialogOpen(true);
  };

  const handleDescriptionChange = (fileName, description) => {
    setFileDescriptions((prev) => ({
      ...prev,
      [fileName]: description,
    }));
  };

  const handleUpload = async () => {
    setIsLoading(true);
    try {
      const assetsToUpload = filesToUpload.map((file) => ({
        file,
        comment: fileDescriptions[file.name] || "",
      }));
      const uploadedAssets = await uploadAssets(assetsToUpload);

      const newFileInfos = uploadedAssets.map((asset) => ({
        name: asset.fileName,
        url: asset.url,
        comment: asset.comment,
      }));

      setUploadedFileInfos((prevFileInfos) => [
        ...prevFileInfos,
        ...newFileInfos,
      ]);
      setFilesToUpload([]);
      setFileDescriptions({});
      setIsDialogOpen(false);
      toast.success("Assets uploaded successfully");

      // Call the onAssetsUpdate callback with the new assets
      onAssetsUpdate(uploadedAssets);
    } catch (error) {
      console.error("Error uploading assets:", error);
      toast.error("Failed to upload assets");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
  };

  return (
    <div
      className="flex flex-col h-full relative"
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <div className="flex-1 overflow-y-auto p-4">
        {initialMessageFetched &&
          messages.map((message, index) => (
            <div
              key={index}
              className={`mb-2 flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <span
                className={`inline-block p-2 rounded max-w-[80%] ${
                  message.sender === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                {message.text || ""}
              </span>
            </div>
          ))}
        {isLoading && (
          <div className="flex justify-start mb-2">
            <span className="inline-block p-2 h-10 flex items-center rounded max-w-[80%] bg-secondary text-secondary-foreground">
              <ThreeDotLoader />
            </span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      {messages.length <= 2 && (
        <div className="px-4">
          <ChatSuggestions onSuggestionClick={handleSuggestionClick} />
        </div>
      )}
      <div className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center">
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex items-center text-sm text-gray-600 hover:text-gray-800"
            >
              <Paperclip className="w-4 h-4 mr-1" />
              Add assets
            </label>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
              multiple
            />
          </div>
          <span className="text-xs text-gray-500 hidden md:block">
            You can also drag and drop files here
          </span>
        </div>
        <div className="relative">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe changes or attach files/images for your website..."
            onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            disabled={isLoading}
            rows={3}
            className="pr-12"
          />
          {input.trim() && (
            <Button
              onClick={handleSend}
              disabled={isLoading}
              size="sm"
              className="absolute top-2 right-2"
            >
              {isLoading ? (
                <LoaderCircle className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>
      </div>
      {uploadedFileInfos.length > 0 && (
        <div className="px-4 pb-4 flex flex-wrap gap-2">
          {uploadedFileInfos.map((file, index) => (
            <div key={index} className="relative group">
              <Badge
                className="flex items-center px-6 h-10"
                variant={"secondary"}
              >
                {file.name}
              </Badge>
              <Button
                onClick={() => {
                  setUploadedFileInfos((prev) =>
                    prev.filter((_, i) => i !== index)
                  );
                }}
                variant="destructive"
                size="icon"
                className="absolute -top-1 -right-1 p-0 h-6 w-6 rounded-full"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
      {dragActive && (
        <div className="absolute inset-0 bg-blue-100 bg-opacity-90 border-2 border-blue-500 rounded-md flex items-center justify-center z-10 backdrop-blur-sm px-4">
          <File className="w-6 h-6 text-blue-700 transform rotate-12 mr-2" />
          <p className="text-blue-700 text-center">
            Drop files here to add as assets to your website
            <br />
            <span className="text-sm">
              Upload images, PDFs, videos, or any other files you want to use in
              your site
            </span>
          </p>
          <Image className="w-6 h-6 text-blue-700 transform -rotate-12 ml-2" />
        </div>
      )}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="mb-2">Enter Asset Descriptions</DialogTitle>
            <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md flex items-center">
              <Info className="mr-2 h-5 w-5 text-primary flex-shrink-0" />
              <p className="px-2">
                Adding descriptions to your assets helps our AI better
                understand and utilize them in your project. Please provide a
                brief description for each uploaded file.
              </p>
            </div>
          </DialogHeader>
          {Object.entries(fileDescriptions).map(
            ([fileName, description], index) => (
              <div key={index} className="mb-4">
                <p className="mb-2">{fileName}</p>
                <Input
                  placeholder="Enter description"
                  value={description}
                  onChange={(e) =>
                    handleDescriptionChange(fileName, e.target.value)
                  }
                />
              </div>
            )
          )}
          <DialogFooter>
            <Button onClick={() => setIsDialogOpen(false)} variant="outline">
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={isLoading}>
              {isLoading ? (
                <LoaderCircle className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Upload className="w-4 h-4 mr-2" />
              )}
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Chat;
