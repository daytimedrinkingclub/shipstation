import { useEffect, useState } from "react";
import { Droppable } from "@hello-pangea/dnd";

export const StrictModeDroppable = ({
  children,
  type = "DEFAULT_TYPE",
  ...props
}) => {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));
    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);

  if (!enabled) {
    return null;
  }

  return (
    <Droppable type={type} {...props}>
      {children}
    </Droppable>
  );
};
