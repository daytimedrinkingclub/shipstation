import React, { useState } from "react";
import CardContainer from "@/components/CardContainer";
import RecentlyShipped from "@/components/RecentlyShipped";
import ShipForm from "@/components/ShipForm";

const Home = () => {
  const [selectedType, setSelectedType] = useState(null);

  const handleCardClick = (type) => {
    setSelectedType(type);
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
    </div>
  );
};

export default Home;
