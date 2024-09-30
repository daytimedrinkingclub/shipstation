import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import ShipOnboarding from "@/components/ShipOnboarding";
import AppLayout from "@/components/layout/AppLayout";
import { useDispatch } from "react-redux";
import { setShipType } from "@/store/onboardingSlice";

const Ship = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const typeFromQuery = searchParams.get("type");

  const [selectedType, setSelectedType] = useState(null);

  useEffect(() => {
    if (typeFromQuery) {
      setSelectedType(typeFromQuery);
      dispatch(setShipType(typeFromQuery));
    }
  }, [typeFromQuery]);

  const handleReset = () => {
    setSelectedType(null);
    navigate("/");
  };

  return <ShipOnboarding type={selectedType} reset={handleReset} />;
};

export default Ship;
