import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

import ThreeDotLoader from "@/components/random/ThreeDotLoader";
import ChatSuggestions from "@/components/ChatSuggestions";
import { useSocket } from "@/context/SocketProvider";
import { supabase } from "@/lib/supabaseClient";
import {
  Copy,
  Send,
  Paperclip,
  X,
  File as FileIcon,
  Image,
  LoaderCircle,
  Info,
  CheckCheck,
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
import FilePreview from "@/components/FilePreview";
import { useProject } from "@/hooks/useProject";

import { useSelector, useDispatch } from "react-redux";
import {
  setFilesToUpload,
  addFilesToUpload,
  removeFileToUpload,
} from "@/store/fileUploadSlice";

import convertUrlsToLinks from "@/lib/utils/urlsToLinks";
import { sanitizeFileName } from "@/lib/utils/sanitizeFileName";

const Chat = ({ shipId, onCodeUpdate, onAssetsUpdate }) => {
  const { socket } = useSocket();
  const { uploadAssets } = useProject(shipId);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [fileDescriptions, setFileDescriptions] = useState({});
  const [isUploadDisabled, setIsUploadDisabled] = useState(true);
  const [initialMessageFetched, setInitialMessageFetched] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);

  const [tempFiles, setTempFiles] = useState([]);
  const dispatch = useDispatch();
  const filesToUpload = useSelector((state) => state.fileUpload.filesToUpload);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const initChat = async () => {
    setIsLoadingMessages(true);
    await fetchConversationHistory();
    await fetchInitialUserMessage();
    setInitialMessageFetched(true);
    setIsLoadingMessages(false);
  };

  useEffect(() => {
    const allDescriptionsFilled = tempFiles.every(
      (file) => file.description?.trim() !== ""
    );
    setIsUploadDisabled(!allDescriptionsFilled);
  }, [fileDescriptions, tempFiles]);

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
          .map((msg) => {
            if (msg.role === "user") {
              return {
                text:
                  typeof msg.content === "string"
                    ? msg.content
                    : msg.content.text,
                sender: msg.role,
                assetInfo: msg.assetInfo || null,
              };
            } else {
              return {
                text: msg.content.find((c) => c.type === "text").text,
                sender: msg.role,
              };
            }
          });
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
            text: `Sure! Your website is live at https://shipstation.ai/site/${shipId} How can I help you further with your project?`,
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

  const handleSend = async () => {
    if (input.trim() || filesToUpload.length > 0) {
      setIsLoading(true);
      try {
        let uploadedAssets = [];
        if (filesToUpload.length > 0) {
          const assetsToUpload = filesToUpload.map((file) => ({
            file: file.file,
            comment: file.description || "",
            forAI: file.forAI,
            forWebsite: file.forWebsite,
          }));
          uploadedAssets = await uploadAssets(assetsToUpload);
        }

        onAssetsUpdate(uploadedAssets);

        const assetInfo =
          uploadedAssets.length > 0
            ? `${uploadedAssets.length} asset${
                uploadedAssets.length === 1 ? "" : "s"
              } added`
            : "";

        const userMessage = {
          text: input,
          sender: "user",
          assetInfo: assetInfo,
        };
        setMessages((prevMessages) => [...prevMessages, userMessage]);

        socket.emit("chatMessage", {
          shipId,
          message: input,
          assetInfo: assetInfo,
          assets: uploadedAssets,
        });

        setInput("");
        dispatch(setFilesToUpload([]));
        setFileDescriptions({});
      } catch (error) {
        console.error("Error uploading assets or sending message:", error);
        toast.error("Failed to send message with assets");
      }
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
    const newFiles = Array.from(files).map((file) => {
      const sanitizedName = sanitizeFileName(file.name);
      const renamedFile = new File([file], sanitizedName, { type: file.type });
      return {
        file: renamedFile,
        forAI: false,
        forWebsite: true,
        preview: URL.createObjectURL(file),
        description: "",
      };
    });
    setTempFiles(newFiles);
    setIsDialogOpen(true);
  };

  const handleDescriptionChange = (fileName, description) => {
    setTempFiles((prevFiles) =>
      prevFiles.map((file) =>
        file.file.name === fileName ? { ...file, description } : file
      )
    );
  };

  const toggleUse = (fileName, use) => {
    setTempFiles((prevFiles) =>
      prevFiles.map((file) =>
        file.file.name === fileName ? { ...file, [use]: !file[use] } : file
      )
    );
  };

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
  };

  const handleDialogConfirm = () => {
    dispatch(addFilesToUpload(tempFiles));
    console.log("Updated filesToUpload:", filesToUpload);
    setTempFiles([]);
    setIsDialogOpen(false);
  };

  return (
    <div
      className="flex flex-col h-[calc(100vh-12rem)] md:h-[calc(100vh-10rem)] relative"
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <div className="flex-1 overflow-y-auto p-4">
        {isLoadingMessages ? (
          // Skeleton loader
          <>
            <div className="flex justify-end mb-2">
              <Skeleton className="h-10 w-3/4 rounded" />
            </div>
            <div className="flex justify-start mb-2">
              <Skeleton className="h-20 w-3/4 rounded" />
            </div>
            <div className="flex justify-end mb-2">
              <Skeleton className="h-10 w-2/4 rounded" />
            </div>
          </>
        ) : (
          initialMessageFetched &&
          messages.map((message, index) => (
            <div
              key={index}
              className={`mb-2 flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`flex flex-col ${
                  message.sender === "user" ? "items-end" : "items-start"
                }`}
              >
                <span
                  className={`inline-block p-2 rounded max-w-[80%] ${
                    message.sender === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {convertUrlsToLinks(message.text || "")}
                </span>
                {message.assetInfo && (
                  <span className="text-sm text-muted-foreground mt-1">
                    {message.assetInfo}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
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
              className="absolute bottom-2 right-2"
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
      {filesToUpload.length > 0 && (
        <div className="px-4 pb-4 flex flex-wrap gap-2">
          {filesToUpload.map((file, index) => (
            <div key={index} className="relative group">
              <Badge
                className="flex items-center px-6 h-10"
                variant={"secondary"}
              >
                {file.file.name}
              </Badge>
              <Button
                onClick={() => dispatch(removeFileToUpload(index))}
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
          <FileIcon className="w-6 h-6 text-blue-700 transform rotate-12 mr-2" />
          <p className="text-blue-700 text-center">
            Drop files here to add as assets to your website
            <br />
            <span className="text-sm">
              Upload images, PDFs, or any other files you want to use in your
              site
            </span>
          </p>
          <Image className="w-6 h-6 text-blue-700 transform -rotate-12 ml-2" />
        </div>
      )}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle className="mb-2">Enter asset details</DialogTitle>
            <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md flex items-center">
              <Info className="mx-2 h-5 w-5 text-primary flex-shrink-0" />
              <p className="px-2">
                Describe your assets and set their usage to help our AI
                understand and use them effectively in your project. All
                descriptions are required.
              </p>
            </div>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-auto p-4">
            {tempFiles.map((file, index) => (
              <Card key={index} className="bg-gray-50">
                <CardContent className="p-4 space-y-4">
                  <div className="aspect-video bg-gray-200 rounded-md overflow-hidden">
                    <FilePreview file={file.file} />
                  </div>
                  <div>
                    <p
                      className="font-semibold truncate"
                      title={file.file.name}
                    >
                      {file.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(file.file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <div>
                    <Label
                      htmlFor={`description-${index}`}
                      className="text-xs mb-1 block"
                    >
                      Description (required)
                    </Label>
                    <Input
                      id={`description-${index}`}
                      placeholder="Enter description"
                      value={file.description}
                      onChange={(e) =>
                        handleDescriptionChange(file.file.name, e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`forAI-${index}`} className="text-xs">
                        Show to AI for ideas
                      </Label>
                      <Switch
                        id={`forAI-${index}`}
                        checked={file.forAI}
                        onCheckedChange={() =>
                          toggleUse(file.file.name, "forAI")
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor={`forWebsite-${index}`}
                        className="text-xs"
                      >
                        Add to my website
                      </Label>
                      <Switch
                        id={`forWebsite-${index}`}
                        checked={file.forWebsite}
                        onCheckedChange={() =>
                          toggleUse(file.file.name, "forWebsite")
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <DialogFooter className="flex flex-col md:flex-row gap-2">
            <Button
              onClick={handleDialogConfirm}
              disabled={tempFiles.some((file) => !file.description.trim())}
              className="w-full md:w-auto"
            >
              <CheckCheck className="w-4 h-4 mr-2" />
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Chat;
