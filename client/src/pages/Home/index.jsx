import { useContext, useState } from "react";
import CardContainer from "@/components/CardContainer";
import RecentlyShipped from "@/components/RecentlyShipped";
import ShipForm from "@/components/ShipForm";
import { AuthContext } from "@/context/AuthContext";
import useDisclosure from "@/hooks/useDisclosure";
import LoginDialog from "@/components/LoginDialog";

const Home = () => {
  const [selectedType, setSelectedType] = useState(null);

  const { user } = useContext(AuthContext);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleCardClick = (type) => {
    if (!user) {
      onOpen();
    } else {
      setSelectedType(type);
    }
  };

  return (
    <div className="flex-grow flex flex-col items-center justify-center">
      {selectedType ? (
        <ShipForm type={selectedType} />
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
