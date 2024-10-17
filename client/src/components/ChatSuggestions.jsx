import { Button } from "@/components/ui/button";

const suggestions = [
  "Redesign the layout using a bento grid style for a modern look.",
  "Apply a neubrutalism design language with bold colors and sharp contrasts.",
  "Implement a glassmorphism effect on card elements for a sleek appearance.",
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
            className="h-auto py-2 px-3 text-left text-wrap inline-flex items-center justify-start hover:bg-shimmer-gradient hover:animate-gradient"
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
