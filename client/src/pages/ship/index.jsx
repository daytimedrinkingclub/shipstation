import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ShipForm from "@/components/ShipForm";


const Ship = () => {
  const [searchParams] = useSearchParams();
  const typeFromQuery = searchParams.get('type');

  const [selectedType, setSelectedType] = useState(null);

  useEffect(() => {
    if (typeFromQuery) {
      setSelectedType(typeFromQuery);
    }
  }, [typeFromQuery]);

  return (
    <div className="flex container flex-col items-center">
      <ShipForm type={selectedType} reset={() => setSelectedType(null)} />
    </div>
  );
};

export default Ship;
