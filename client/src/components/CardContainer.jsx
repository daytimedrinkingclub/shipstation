import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Layout, User, Cpu } from "lucide-react";

const CardContainer = ({ onCardClick }) => {
  const cards = [
    {
      icon: <Layout className="w-6 h-6" />,
      title: "Ship Landing Page",
      description:
        "Craft a sleek, high-converting landing page that captivates your audience from the first scroll.",
      type: "landing_page",
    },
    {
      icon: <User className="w-6 h-6" />,
      title: "Ship Personal Websites",
      description:
        "Showcase your unique story and skills with a stunning personal website that leaves a lasting impression.",
      type: "personal_website",
    },
    {
      icon: <Cpu className="w-6 h-6" />,
      title: "Ship Idea Board",
      description:
        "Transform your concepts into reality with an AI-powered idea board. Visualize, organize, and bring your creative visions to life.",
      badge: "Shipping Soon",
      type: "idea_board",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
      {cards.map((card, index) => (
        <Card
          key={index}
          className="bg-foreground text-primary-foreground relative cursor-pointer"
          onClick={() => onCardClick(card.type)}
        >
          <CardHeader>
            {card.icon}
            <CardTitle className="">{card.title}</CardTitle>
            <CardDescription>{card.description}</CardDescription>
            {card.badge && (
              <span className="absolute top-2 right-2 text-xs font-semibold px-2 py-1 rounded">
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
