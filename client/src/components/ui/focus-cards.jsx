import React, { useState } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import { cn } from "@/lib/utils";

import { ExternalLink } from "lucide-react";
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
        <span className="flex items-center gap-2">
          Explore this design <ExternalLink className="w-4 h-4" />
        </span>
      </div>
    </div>
  </div>
));

Card.displayName = "Card";

export function FocusCards({ cards }) {
  const [hovered, setHovered] = useState(null);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
      {cards.map((card, index) => (
        <Card
          key={card.url}
          card={card}
          index={index}
          hovered={hovered}
          setHovered={setHovered}
        />
      ))}
    </div>
  );
}
