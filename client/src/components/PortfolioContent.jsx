import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  addSection,
  removeSection,
  updateSection,
  updateSectionsOrder, // Import the new action
  addSocialLink,
  removeSocialLink,
} from "@/store/onboardingSlice";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Minus,
  GripVertical,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { StrictModeDroppable } from "@/components/StrictModeDroppable";
// import { parseResume } from "@/utils/resumeParser"; // Utility function to parse resume

export default function PortfolioContent() {
  const dispatch = useDispatch();
  const sections = useSelector((state) => state.onboarding.sections);
  const socialLinks = useSelector((state) => state.onboarding.socialLinks);
  const [newSocialLink, setNewSocialLink] = useState("");
  const [resume, setResume] = useState(null);
  const [profession, setProfession] = useState("");
  const [developerType, setDeveloperType] = useState("");

  const handleAddSection = () => {
    dispatch(addSection());
  };

  const handleUpdateSection = (id, field, value) => {
    dispatch(updateSection({ id, field, value }));
  };

  const handleAddSocialLink = () => {
    if (newSocialLink.trim() !== "") {
      dispatch(addSocialLink(newSocialLink));
      setNewSocialLink("");
    }
  };

  const handleRemoveSocialLink = (id) => {
    dispatch(removeSocialLink(id));
  };

  const handleResumeUpload = async (event) => {
    const file = event.target.files[0];
    setResume(file);
    const parsedData = await parseResume(file);
    // Send parsed data to Anthropic API and update sections and social links
  };

  const handleProfessionChange = (event) => {
    setProfession(event.target.value);
  };

  const handleDeveloperTypeChange = (event) => {
    setDeveloperType(event.target.value);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Portfolio Setup</h3>
        <div className="space-y-2">
          <Input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleResumeUpload}
          />
          <Input
            placeholder="Enter your profession"
            value={profession}
            onChange={handleProfessionChange}
          />
          {profession.toLowerCase() === "developer" && (
            <Input
              placeholder="Type of developer (frontend, backend, full stack)"
              value={developerType}
              onChange={handleDeveloperTypeChange}
            />
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">Sections</h3>
          <Button
            onClick={handleAddSection}
            size="sm"
            className="flex items-center"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Section
          </Button>
        </div>
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
                                onClick={() => toggleSection(section.id)}
                                className="ml-2"
                              >
                                {section.isOpen ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button>
                            </CollapsibleTrigger>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveSection(section.id)}
                              className="ml-2"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
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

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Social Links</h3>
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Enter social link URL"
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
        <div className="space-y-2">
          <AnimatePresence>
            {socialLinks.map((link, index) => (
              <motion.div
                key={link.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center space-x-2"
              >
                <Input value={link.url} readOnly className="flex-grow" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveSocialLink(link.id)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
