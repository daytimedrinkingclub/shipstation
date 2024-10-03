import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Wand2, Paintbrush } from "lucide-react";

const designApproaches = [
  {
    id: "custom",
    title: "Describe your design",
    description: "Let AI generate a unique design based on your description",
    icon: <Wand2 className="h-6 w-6" />,
  },
  {
    id: "preset",
    title: "Select from presets",
    description: "Choose from our curated collection of design templates",
    icon: <Paintbrush className="h-6 w-6" />,
  },
];

export default function DesignApproachSelector({
  designChoice,
  setDesignChoice,
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4 block">
        Choose Design Approach
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {designApproaches.map((approach) => (
          <Card
            key={approach.id}
            className={`cursor-pointer transition-all duration-300 ${
              designChoice === approach.id
                ? "border-primary shadow-md"
                : "border-muted hover:border-primary hover:shadow-md"
            }`}
            onClick={() => setDesignChoice(approach.id)}
          >
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {approach.icon}
                <span>{approach.title}</span>
              </CardTitle>
              <CardDescription>{approach.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
