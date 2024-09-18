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
    <div>
      <p className="text-sm text-muted-foreground mb-2">
        Quick suggestions to get started:
      </p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            className="h-auto py-2 px-3 text-left text-wrap inline-flex items-center justify-start"
            onClick={() => onSuggestionClick(suggestion)}
          >
            <span className="text-sm">{suggestion}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default ChatSuggestions;
