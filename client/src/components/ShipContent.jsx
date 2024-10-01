import { useState, useContext, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  addSection,
  removeSection,
  updateSection,
  updateSectionsOrder,
  addSocialLink,
  removeSocialLink,
  setSocials,
} from "@/store/onboardingSlice";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  X,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { StrictModeDroppable } from "@/components/StrictModeDroppable";
import { AuthContext } from "@/context/AuthContext";

export default function ShipContent() {
  const dispatch = useDispatch();
  const sections = useSelector((state) => state.onboarding.sections);
  const socialLinks = useSelector((state) => state.onboarding.socialLinks);
  const { availableShips } = useContext(AuthContext);

  const [newSocialLink, setNewSocialLink] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const sectionsRef = useRef(null);

  const handleAddSection = () => {
    dispatch(addSection());
  };

  const handleRemoveSection = (id) => {
    dispatch(removeSection(id));
  };

  const handleUpdateSection = (id, field, value) => {
    dispatch(updateSection({ id, field, value }));
  };

  const handleUpdateSocialLink = (index, newValue) => {
    const updatedLinks = socialLinks.map((link, i) =>
      i === index ? newValue : link
    );
    dispatch(setSocials(updatedLinks));
  };

  const handleAddSocialLink = () => {
    if (newSocialLink.trim() !== "") {
      dispatch(setSocials([...socialLinks, newSocialLink]));
      setNewSocialLink(""); // Clear the input after adding
    }
  };

  const handleRemoveSocialLink = (index) => {
    const updatedLinks = socialLinks.filter((_, i) => i !== index);
    dispatch(setSocials(updatedLinks));
  };

  const handleUpdateSectionsOrder = (sections) => {
    dispatch(updateSectionsOrder(sections)); // Dispatch the new action
  };

  const toggleSection = (id) => {
    const updatedSections = sections.map((section) =>
      section.id === id ? { ...section, isOpen: !section.isOpen } : section
    );
    handleUpdateSectionsOrder(updatedSections);
  };

  const onDragEnd = (result) => {
    if (!result.destination) return; // Dropped outside the list

    const reorderedSections = Array.from(sections);
    const [movedSection] = reorderedSections.splice(result.source.index, 1);
    reorderedSections.splice(result.destination.index, 0, movedSection);

    handleUpdateSectionsOrder(reorderedSections);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      sectionsRef.current.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const handleFullscreenChange = () => {
    setIsFullscreen(!!document.fullscreenElement);
  };

  useEffect(() => {
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    if (sectionsRef.current) {
      sectionsRef.current.scrollTop = sectionsRef.current.scrollHeight;
    }
  }, [sections]);

  return (
    <TooltipProvider delayDuration={0}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col h-full"
      >
        <h2 className="text-2xl font-bold mb-4">Website Content and Social Links</h2>
        <Tabs defaultValue="content" className="flex-grow flex flex-col">
          <TabsList className="justify-start">
            <TabsTrigger value="content">Content Sections</TabsTrigger>
            <TabsTrigger value="social">Social Links</TabsTrigger>
          </TabsList>
          <TabsContent value="content" className="flex-grow flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Sections</h3>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={toggleFullscreen}
                  size="sm"
                  variant="outline"
                  className="flex items-center"
                >
                  {isFullscreen ? (
                    <Minimize2 className="h-4 w-4" />
                  ) : (
                    <Maximize2 className="h-4 w-4" />
                  )}
                  <span className="ml-2">
                    {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                  </span>
                </Button>
                <Button
                  onClick={handleAddSection}
                  size="sm"
                  className="flex items-center"
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Section
                </Button>
              </div>
            </div>
            <div
              ref={sectionsRef}
              className={`flex-grow overflow-y-auto border border-gray-300 rounded-lg shadow-sm scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-400 ${
                isFullscreen
                  ? "fixed inset-0 z-50 bg-background flex flex-col"
                  : ""
              }`}
            >
              {isFullscreen && (
                <div className="sticky top-0 bg-background z-10 p-4 border-b border-gray-300 flex justify-between items-center">
                  <h3 className="text-xl font-semibold">Sections</h3>
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={handleAddSection}
                      size="sm"
                      className="flex items-center"
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add Section
                    </Button>
                    <Button
                      onClick={toggleFullscreen}
                      size="sm"
                      variant="outline"
                      className="flex items-center"
                    >
                      <Minimize2 className="h-4 w-4" />
                      <span className="ml-2">Exit Fullscreen</span>
                    </Button>
                  </div>
                </div>
              )}
              <div className={`${isFullscreen ? "flex-grow p-4" : "p-4"}`}>
                <DragDropContext onDragEnd={onDragEnd}>
                  <StrictModeDroppable droppableId="sections">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-2"
                      >
                        {sections.map((section, index) => (
                          <Draggable
                            key={section.id}
                            draggableId={section.id}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className="bg-card rounded-lg shadow-sm border border-border"
                              >
                                <Collapsible open={section.isOpen}>
                                  <div className="flex items-center p-4">
                                    <div
                                      {...provided.dragHandleProps}
                                      className="mr-2 cursor-move"
                                    >
                                      <GripVertical className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <Input
                                      placeholder="Section Title"
                                      value={section.title}
                                      onChange={(e) =>
                                        handleUpdateSection(
                                          section.id,
                                          "title",
                                          e.target.value
                                        )
                                      }
                                      className="flex-grow"
                                    />
                                    <CollapsibleTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          toggleSection(section.id)
                                        }
                                        className="ml-2"
                                      >
                                        {section.isOpen ? (
                                          <ChevronUp className="h-4 w-4" />
                                        ) : (
                                          <ChevronDown className="h-4 w-4" />
                                        )}
                                      </Button>
                                    </CollapsibleTrigger>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            handleRemoveSection(section.id)
                                          }
                                          className="ml-2"
                                        >
                                          <X className="h-4 w-4 text-red-500" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        Remove this section
                                      </TooltipContent>
                                    </Tooltip>
                                  </div>
                                  <CollapsibleContent className="p-4 pt-0">
                                    <Textarea
                                      placeholder="Section Content"
                                      value={section.content}
                                      onChange={(e) =>
                                        handleUpdateSection(
                                          section.id,
                                          "content",
                                          e.target.value
                                        )
                                      }
                                      className="mt-2"
                                      rows={5}
                                    />
                                  </CollapsibleContent>
                                </Collapsible>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </StrictModeDroppable>
                </DragDropContext>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="social">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Social Links</h3>
              <div className="space-y-2 max-w-md">
                <AnimatePresence>
                  {socialLinks.map((link, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center space-x-2"
                    >
                      <img
                        src={`https://www.google.com/s2/favicons?domain=${link}`}
                        alt="favicon"
                        className="w-5 h-5"
                      />
                      <Input
                        value={link}
                        onChange={(e) =>
                          handleUpdateSocialLink(index, e.target.value)
                        }
                        className="flex-grow"
                      />

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveSocialLink(index)}
                          >
                            <X className="h-4 w-4 text-red-500" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Remove this social link</TooltipContent>
                      </Tooltip>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              <div className="flex items-center space-x-2 max-w-md">
                <Input
                  placeholder="Enter another social URL"
                  value={newSocialLink}
                  onChange={(e) => setNewSocialLink(e.target.value)}
                  className="flex-grow"
                />
                <Button
                  onClick={handleAddSocialLink}
                  size="sm"
                  className="flex items-center"
                >
                  <Plus className="mr-2 h-4 w-4" /> Add
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </TooltipProvider>
  );
}
