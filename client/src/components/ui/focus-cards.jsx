import React, { useState } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import { cn } from "@/lib/utils";

import { ExternalLink } from "lucide-react";
import { Button } from "./button";

export const Card = React.memo(({ card, index, hovered, setHovered }) => (
  <div
    onMouseEnter={() => setHovered(index)}
    onMouseLeave={() => setHovered(null)}
    onClick={card.onClick}
    className={cn(
      "rounded-lg relative bg-gray-100 dark:bg-neutral-900 overflow-hidden aspect-[16/9] w-full transition-all duration-300 ease-out cursor-pointer",
      hovered !== null && hovered !== index && "blur-sm scale-[0.98]"
    )}
  >
    <LazyLoadImage
      src={card.src}
      alt="Website preview"
      effect="blur"
      wrapperClassName="absolute inset-0"
      className="object-cover w-full h-full"
    />
    <div
      className={cn(
        "absolute inset-0 bg-black/50 flex items-end py-4 px-4 transition-opacity duration-300",
        hovered === index ? "opacity-100" : "opacity-0"
      )}
    >
      <div
        className="text-sm md:text-base font-medium text-white cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          window.open(card.url, "_blank");
        }}
      >
        <Button variant="outline" className="text-white">
          <span className="flex items-center gap-2">
            View live demo <ExternalLink className="w-4 h-4" />
          </span>
        </Button>
      </div>
    </div>
    {card.likeButton && (
      <div className="absolute top-2 right-2 z-20">{card.likeButton}</div>
    )}
  </div>
));

Card.displayName = "Card";

export function FocusCards({ cards }) {
  const [hovered, setHovered] = useState(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
      {cards.map((card, index) => (
        <Card
          key={card.key || card.id || card.url || `card-${index}`}
          card={card}
          index={index}
          hovered={hovered}
          setHovered={setHovered}
        />
      ))}
    </div>
  );
}
