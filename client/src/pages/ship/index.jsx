import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import ShipForm from "@/components/ShipForm";
import AppLayout from "@/components/layout/AppLayout";


const Ship = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const typeFromQuery = searchParams.get('type');

  const [selectedType, setSelectedType] = useState(null);

  useEffect(() => {
    if (typeFromQuery) {
      setSelectedType(typeFromQuery);
    }
  }, [typeFromQuery]);

  const handleReset = () => {
    setSelectedType(null);
    navigate('/');
  };

  return (
    <AppLayout>
      <ShipForm type={selectedType} reset={handleReset} />
    </AppLayout>
  );
};

export default Ship;
