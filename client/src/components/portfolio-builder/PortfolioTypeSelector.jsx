import React, { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Code2,
  Paintbrush,
  Camera,
  Palette,
  Music,
  Briefcase,
  Check,
  Edit2,
} from "lucide-react";

const portfolioTypes = [
  { id: "Developer", icon: Code2 },
  { id: "Designer", icon: Paintbrush },
  { id: "Photographer", icon: Camera },
  { id: "Artist", icon: Palette },
  { id: "Musician", icon: Music },
];

export default function PortfolioTypeSelector({
  portfolioType,
  setPortfolioType,
  isGenerating,
}) {
  const [customType, setCustomType] = useState("");
  const [isCustomTypeConfirmed, setIsCustomTypeConfirmed] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handlePortfolioTypeChange = (value) => {
    if (value === "Other") {
      setPortfolioType("Other");
      setCustomType("");
      setIsCustomTypeConfirmed(false);
      setIsEditing(true);
    } else {
      setPortfolioType(value);
      setCustomType("");
      setIsCustomTypeConfirmed(false);
      setIsEditing(false);
    }
  };

  const handleCustomTypeChange = (e) => {
    setCustomType(e.target.value);
    setIsCustomTypeConfirmed(false);
  };

  const confirmCustomType = () => {
    if (customType.trim() !== "") {
      setPortfolioType(customType.trim());
      setIsCustomTypeConfirmed(true);
      setIsEditing(false);
    }
  };

  const startEditing = () => {
    setIsEditing(true);
    setIsCustomTypeConfirmed(false);
  };

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-4 block">
        Select profession
      </h2>
      <RadioGroup
        value={portfolioType === customType ? "Other" : portfolioType}
        onValueChange={handlePortfolioTypeChange}
        disabled={isGenerating}
      >
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {portfolioTypes.map(({ id, icon }) => {
            const IconComponent = icon;
            return (
              <div key={id} className="relative">
                <RadioGroupItem 
                  value={id} 
                  id={id} 
                  className="peer sr-only" 
                  disabled={isGenerating}
                />
                <Label
                  htmlFor={id}
                  className={`flex items-center justify-center p-2 h-12 w-full rounded-md border transition-all duration-200 ease-in-out ${
                    isGenerating ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                  } ${
                    portfolioType === id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  <IconComponent className="h-5 w-5 mr-2" />
                  <span className="text-sm font-medium">{id}</span>
                </Label>
              </div>
            );
          })}
          <div className="relative">
            <RadioGroupItem 
              value="Other" 
              id="Other" 
              className="peer sr-only" 
              disabled={isGenerating}
            />
            <Label
              htmlFor="Other"
              className={`flex items-center justify-center p-2 h-12 w-full rounded-md border transition-all duration-200 ease-in-out ${
                isGenerating ? "cursor-not-allowed opacity-50" : "cursor-pointer"
              } ${
                portfolioType === "Other" || customType !== ""
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              {portfolioType === "Other" || customType !== "" ? (
                isCustomTypeConfirmed && !isEditing ? (
                  <div className="flex items-center justify-center w-full">
                    <Briefcase className="h-5 w-5 mr-2" />
                    <span className="text-sm font-medium text-center">
                      {customType}
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="p-1 ml-2 hover:bg-transparent"
                      onClick={startEditing}
                      disabled={isGenerating}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center w-full">
                    <Briefcase className="h-5 w-5 mr-2" />
                    <Input
                      type="text"
                      className="p-2 h-8 flex-grow text-sm font-medium bg-transparent outline-none focus-visible:ring-0 focus-visible:ring-offset-0 border-none"
                      placeholder="Enter your profession"
                      value={customType}
                      onChange={handleCustomTypeChange}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          confirmCustomType();
                        }
                      }}
                      autoFocus
                      disabled={isGenerating}
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="p-1 hover:bg-transparent"
                      onClick={confirmCustomType}
                      disabled={isGenerating}
                    >
                      <Check className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                )
              ) : (
                <>
                  <Briefcase className="h-5 w-5 mr-2" />
                  <span className="text-sm font-medium">Other</span>
                </>
              )}
            </Label>
          </div>
        </div>
      </RadioGroup>
    </div>
  );
}
