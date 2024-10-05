import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Columns2, Smartphone, Maximize2 } from "lucide-react";

const ViewOptions = ({ currentView, onViewChange }) => {
  const views = [
    { id: "horizontal", icon: Columns2, tooltip: "Horizontal View" },
    { id: "mobile", icon: Smartphone, tooltip: "Mobile View" },
    { id: "fullscreen", icon: Maximize2, tooltip: "Fullscreen View" },
  ];

  return (
    <div className="flex">
      {views.map((view, index) => (
        <Tooltip key={view.id}>
          <TooltipTrigger asChild>
            <Button
              variant={currentView === view.id ? "default" : "outline"}
              size="icon"
              onClick={() => onViewChange(view.id)}
              className={`w-10 h-10 px-2 ${
                index === 0
                  ? "rounded-l-md rounded-r-none"
                  : index === views.length - 1
                  ? "rounded-r-md rounded-l-none"
                  : "rounded-none"
              } ${index !== 0 ? "-ml-px" : ""}`}
            >
              <view.icon className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{view.tooltip}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
};

export default ViewOptions;
