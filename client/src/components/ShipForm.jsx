import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Ship } from "lucide-react";
import { useSocket } from "@/context/SocketProvider";
import useDisclosure from "@/hooks/useDisclosure";
import ChoosePaymentOptionDialog from "./ChoosePaymentOptionDialog";

const ShipForm = ({ type }) => {
  const [requirements, setRequirements] = useState("");
  const { sendMessage } = useSocket();

  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleSubmit = (e) => {
    e.preventDefault();
    onOpen();
    // sendMessage(requirements, "prompt");
    // You can add additional logic here, such as showing a loading state
  };

  const handleSubmitKey = () => {
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
        onSubmitKey={handleSubmitKey}
      />
    </div>
  );
};

export default ShipForm;
