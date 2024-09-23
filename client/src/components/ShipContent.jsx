import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Plus,
  Minus,
  GripVertical,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { StrictModeDroppable } from "@/components/StrictModeDroppable";

export default function ShipContent({ projectType, prompt }) {
  const [sections, setSections] = useState([
    { id: "1", title: "", content: "", isOpen: true },
  ]);
  const [socialLinks, setSocialLinks] = useState([]);
  const [newSocialLink, setNewSocialLink] = useState("");

  const addSection = () => {
    setSections([
      ...sections,
      { id: Date.now().toString(), title: "", content: "", isOpen: true },
    ]);
  };

  const removeSection = (id) => {
    setSections(sections.filter((section) => section.id !== id));
  };

  const updateSection = (id, field, value) => {
    setSections(
      sections.map((section) =>
        section.id === id ? { ...section, [field]: value } : section
      )
    );
  };

  const toggleSection = (id) => {
    setSections(
      sections.map((section) =>
        section.id === id ? { ...section, isOpen: !section.isOpen } : section
      )
    );
  };

  const addSocialLink = () => {
    if (newSocialLink) {
      setSocialLinks([
        ...socialLinks,
        { id: Date.now().toString(), url: newSocialLink },
      ]);
      setNewSocialLink("");
    }
  };

  const removeSocialLink = (id) => {
    setSocialLinks(socialLinks.filter((link) => link.id !== id));
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(sections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setSections(items);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">Sections</h3>
          <Button onClick={addSection} size="sm" className="flex items-center">
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
                                updateSection(
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
                              onClick={() => removeSection(section.id)}
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
                                updateSection(
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
            onClick={addSocialLink}
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
                <img
                  src={`https://www.google.com/s2/favicons?domain=${link.url}`}
                  alt="favicon"
                  className="w-5 h-5"
                />
                <Input value={link.url} readOnly className="flex-grow" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSocialLink(link.id)}
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
