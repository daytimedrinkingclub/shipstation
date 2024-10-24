import { useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getLatestShipInfoForUser } from "@/lib/utils/editorUtils";
import { setShipInfo } from "@/store/shipSlice";

export const useShipInfo = (user, userLoading, isDeploying) => {
  const [isShipInfoLoading, setIsShipInfoLoading] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const fetchShipInfo = useCallback(async () => {
    if (!userLoading && user && !isDeploying) {
      setIsShipInfoLoading(true);
      try {
        const latestShipInfo = await getLatestShipInfoForUser(user.id);
        if (latestShipInfo) {
          dispatch(setShipInfo(latestShipInfo));
        }
      } catch (error) {
        console.error("Error fetching ship info:", error);
        toast.error("An error occurred while loading your project.");
      } finally {
        setIsShipInfoLoading(false);
      }
    } else if (!userLoading && !user) {
      navigate("/");
    }
  }, [user, userLoading, isDeploying, dispatch, navigate]);

  return { isShipInfoLoading, fetchShipInfo };
};
