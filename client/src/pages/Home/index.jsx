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
  const { sendMessage, socket } = useSocket();

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
    <div className="container flex flex-col items-center justify-center">
      {selectedType ? (
        <ShipForm type={selectedType} reset={() => setSelectedType(null)} />
      ) : (
        <>
          <CardContainer onCardClick={handleCardClick} />
          <RecentlyShipped />
        </>
      )}
      <LoginDialog isOpen={isOpen} onClose={onClose} />
    </div>
  );
};

export default Home;
