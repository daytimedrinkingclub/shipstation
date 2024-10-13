import React, { useState, useEffect } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Code2,
  Paintbrush,
  Camera,
  Palette,
  Music,
  Briefcase,
  Check,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  isMobile = false,
  onKeyPress,
}) {
  const [customType, setCustomType] = useState("");

  useEffect(() => {
    if (portfolioType === "Other") {
      setCustomType("");
    } else if (!portfolioTypes.some((type) => type.id === portfolioType)) {
      setCustomType(portfolioType);
    }
  }, [portfolioType]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (onKeyPress) {
        onKeyPress(event);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onKeyPress]);

  const handlePortfolioTypeChange = (value) => {
    setPortfolioType(value);
    if (value !== "Other") {
      setCustomType("");
    }
  };

  const handleCustomTypeChange = (e) => {
    const value = e.target.value;
    setCustomType(value);
    setPortfolioType(value || "Other");
  };

  const renderDesktopView = () => (
    <RadioGroup
      value={portfolioType}
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
                  isGenerating
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer"
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
              <div className="flex items-center w-full">
                <Briefcase className="h-5 w-5 mr-2" />
                <Input
                  type="text"
                  className="p-2 h-8 flex-grow text-sm font-medium bg-transparent outline-none focus-visible:ring-0 focus-visible:ring-offset-0 border-none"
                  placeholder="Enter your profession"
                  value={customType}
                  onChange={handleCustomTypeChange}
                  disabled={isGenerating}
                  autoFocus
                />
              </div>
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
  );

  const renderMobileView = () => (
    <>
      <Select
        value={portfolioType}
        onValueChange={handlePortfolioTypeChange}
        disabled={isGenerating}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select your profession" />
        </SelectTrigger>
        <SelectContent>
          {portfolioTypes.map(({ id, icon }) => {
            const IconComponent = icon;
            return (
              <SelectItem key={id} value={id}>
                <div className="flex items-center">
                  <IconComponent className="h-4 w-4 mr-2" />
                  {id}
                </div>
              </SelectItem>
            );
          })}
          <SelectItem value="Other">
            <div className="flex items-center">
              <Briefcase className="h-4 w-4 mr-2" />
              Other
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
      {(portfolioType === "Other" || customType !== "") && (
        <div className="mt-4">
          <Input
            type="text"
            className="w-full"
            placeholder="Enter your profession"
            value={customType}
            onChange={handleCustomTypeChange}
            disabled={isGenerating}
          />
        </div>
      )}
    </>
  );

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-4 block">Select profession</h2>
      {isMobile ? renderMobileView() : renderDesktopView()}
    </div>
  );
}
