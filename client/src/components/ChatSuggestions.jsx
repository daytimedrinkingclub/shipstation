import React from "react";
import { Button } from "@/components/ui/button";

const suggestions = [
  "Could you please update the color theme to a purple palette?",
  "Can you change the hero text?",
  "I'd like to change the font to Inter throughout the website.",
  "Can you remove the contact form from the page?",
];

const ChatSuggestions = ({ onSuggestionClick }) => {
  return (
    <div className="mb-4">
      <p className="text-sm text-muted-foreground mb-2">
        Quick suggestions to get started:
      </p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => onSuggestionClick(suggestion)}
          >
            {suggestion}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default ChatSuggestions;
