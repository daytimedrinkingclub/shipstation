import { useContext, useState } from "react";
import CardContainer from "@/components/CardContainer";
import RecentlyShipped from "@/components/RecentlyShipped";
import ShipForm from "@/components/ShipForm";
import { AuthContext } from "@/context/AuthContext";
import useDisclosure from "@/hooks/useDisclosure";
import LoginDialog from "@/components/LoginDialog";
import { useSocket } from "@/context/SocketProvider";

const Home = () => {
  const [selectedType, setSelectedType] = useState(null);
  // const { sendMessage, socket } = useSocket();

  const { user } = useContext(AuthContext);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleCardClick = (type) => {
    if (!user) {
      onOpen();
    } else {
      setSelectedType(type);
      // sendMessage("startProject", {
      //   shipType: type,
      // });
    }
  };

  return (
    <div className="flex container flex-col items-center">
      {selectedType ? (
        <ShipForm type={selectedType} reset={() => setSelectedType(null)} />
      ) : (
        <>
          <h1 className="sm:text-4xl font-bold text-white my-8 text-2xl">
            What would you like to ship?
          </h1>
          <CardContainer onCardClick={handleCardClick} />
          <RecentlyShipped />
        </>
      )}
      <LoginDialog isOpen={isOpen} onClose={onClose} createAccount />
    </div>
  );
};

export default Home;
