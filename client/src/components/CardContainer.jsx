import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Layout, Cpu, Wallpaper } from "lucide-react";

const CardContainer = ({ onCardClick }) => {
  const cards = [
    {
      icon: <Layout className="w-6 h-6" />,
      title: "Ship landing page",
      description:
        "Craft a sleek, high-converting landing page that captivates your audience from the first scroll.",
      type: "landing_page",
    },
    {
      icon: <Wallpaper className="w-6 h-6" />,
      title: "Ship personal website",
      description:
        "Showcase your unique story and skills with a stunning personal website that leaves a lasting impression.",
      type: "portfolio",
    },
    {
      icon: <Cpu className="w-6 h-6" />,
      title: "Ship AI agent",
      description:
        "Transform your concepts into reality with an AI-powered idea board. Visualize, organize, and bring your creative visions to life.",
      badge: "Launching Soon",
      type: "idea_board",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {cards.map((card, index) => (
        <Card
          key={index}
          className="dark relative cursor-pointer transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:bg-surface"
          onClick={() => onCardClick(card.type)}
        >
          <CardHeader>
            <div>
              {card.icon}
            </div>
            <CardTitle className="pt-4">{card.title}</CardTitle>
            <CardDescription>{card.description}</CardDescription>
            {card.badge && (
              <span className="absolute top-2 right-2 text-xs font-semibold px-2 py-1 rounded bg-gradient-to-r from-gray-800 to-gray-900 animate-shimmer">
                {card.badge}
              </span>
            )}
          </CardHeader>
        </Card>
      ))}
    </div>
  );
};

export default CardContainer;
