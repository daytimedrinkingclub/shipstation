import React, { useContext, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Ship } from "lucide-react";
import { useSocket } from "@/context/SocketProvider";
import useDisclosure from "@/hooks/useDisclosure";
import ChoosePaymentOptionDialog from "./ChoosePaymentOptionDialog";
import { AuthContext } from "@/context/AuthContext";
import { toast } from "./ui/use-toast";
import LoaderOverlay from "./LoaderOverlay";
import SuccessOverlay from "./SuccessOverlay";

const ShipForm = ({ type }) => {
  const [requirements, setRequirements] = useState("");
  const { sendMessage, socket } = useSocket();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isLoaderOpen,
    onOpen: onLoaderOpen,
    onClose: onLoaderClose,
  } = useDisclosure();
  const {
    isOpen: isSuccessOpen,
    onOpen: onSuccessOpen,
    onClose: onSuccessClose,
  } = useDisclosure();
  const { availableShips, anthropicKey, setAnthropicKey } =
    useContext(AuthContext);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (availableShips <= 0) {
      onOpen();
    } else {
      sendMessage("startProject", {
        type: "prompt",
        apiKey: anthropicKey,
        message: requirements,
      });
    }
  };

  const handleSubmitAnthropicKey = () => {
    sendMessage("anthropicKey", { anthropicKey });
  };

  useEffect(() => {
    socket.on("apiKeyStatus", (response) => {
      if (response.success) {
        setAnthropicKey(response.key);
        sendMessage("startProject", {
          type: "prompt",
          apiKey: anthropicKey,
          message: requirements,
        });
        toast({
          title: "Success",
          description: "Anthropic key is valid, starting generation!",
        });
      } else {
        toast({
          title: "Error",
          description: response.message,
          variant: "destructive",
        });
      }
    });

    socket.on("showPaymentOptions", ({ error }) => {
      onOpen();
    });

    return () => {
      socket.off("apiKeyStatus");
      socket.off("showPaymentOptions");
    };
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <h1 className="text-4xl font-bold text-white mb-6">
        What will you ship today?
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col items-center">
        <Textarea
          className="w-full h-40 bg-gray-800 text-white border-gray-700 mb-4"
          placeholder={`Enter your ${type} requirements...\nDescribe the layout, sections, and copy in detail.\nYou can also include brand guidelines and color palette.`}
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
        />
        <Button type="submit" className="bg-white text-black hover:bg-gray-200">
          Ship it! <Ship className="ml-2 h-4 w-4" />
        </Button>
      </form>
      <ChoosePaymentOptionDialog
        isOpen={isOpen}
        onClose={onClose}
        onSubmitKey={handleSubmitAnthropicKey}
        anthropicKey={anthropicKey}
        setAnthropicKey={setAnthropicKey}
      />
      <LoaderOverlay isOpen={isLoaderOpen} />
      <SuccessOverlay
        isOpen={isSuccessOpen}
        onClose={onSuccessClose}
        websiteName={"websiteName"}
      />
    </div>
  );
};

export default ShipForm;
