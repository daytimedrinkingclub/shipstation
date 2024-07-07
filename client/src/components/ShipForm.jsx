import React, { useContext, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Ship } from "lucide-react";
import { useSocket } from "@/context/SocketProvider";
import useDisclosure from "@/hooks/useDisclosure";
import ChoosePaymentOptionDialog from "./ChoosePaymentOptionDialog";
import { AuthContext } from "@/context/AuthContext";

const ShipForm = ({ type }) => {
  const [requirements, setRequirements] = useState("");
  const { sendMessage } = useSocket();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { availableShips } = useContext(AuthContext);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (availableShips <= 0) {
      onOpen();
    } else {
      sendMessage(requirements, "prompt");
    }
  };

  const handleSubmitAnthropicKey = () => {
    // validate api key
    // sendMessage(requirements, "prompt");
  };

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
      />
    </div>
  );
};

export default ShipForm;
