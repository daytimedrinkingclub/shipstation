import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useProject } from "@/hooks/useProject";
import { setShipInfo } from "@/store/shipSlice";

const SlugChangeDialog = ({ open, onOpenChange }) => {
  const dispatch = useDispatch();
  const shipInfo = useSelector((state) => state.ship);
  const [newSlug, setNewSlug] = useState("");
  const [isChangingSlug, setIsChangingSlug] = useState(false);
  const { changeSlug } = useProject(shipInfo.slug);
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    setPreviewUrl(
      `${import.meta.env.VITE_MYPROFILE_URL}/${newSlug || shipInfo.slug}`
    );
  }, [newSlug, shipInfo.slug]);

  const cleanSlug = (input) => {
    // Remove any characters that aren't a-z, 0-9, or dash
    return input.toLowerCase().replace(/[^a-z0-9-]/g, "");
  };

  const handleSlugChange = async () => {
    setIsChangingSlug(true);
    try {
      const response = await changeSlug(shipInfo.id, shipInfo.slug, newSlug);
      if (response.success) {
        dispatch(setShipInfo({ ...shipInfo, slug: newSlug }));
        toast.success("Slug changed successfully");
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error changing slug:", error);
      if (error.response && error.response.status === 400) {
        toast.error("This slug is already in use. Please try another one.");
      } else {
        toast.error("Failed to change slug. Please try again later.");
      }
    } finally {
      setIsChangingSlug(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle className="text-left">Change Slug</DialogTitle>
          <DialogDescription className="text-muted-foreground text-left">
            Enter a new slug for your project. This will change the URL of your
            website.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="slug" className="text-right text-foreground pt-2">
              Slug
            </Label>
            <div className="col-span-3 space-y-2">
              <Input
                id="slug"
                value={newSlug}
                onChange={(e) => setNewSlug(cleanSlug(e.target.value))}
                placeholder="Enter new slug"
                className="text-foreground"
              />
              <p className="text-xs text-muted-foreground">
                Only lowercase letters, numbers, and dashes are allowed
              </p>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right text-foreground">Preview</Label>
            <div className="col-span-3 text-sm break-all text-muted-foreground">
              {previewUrl}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="text-foreground"
          >
            Cancel
          </Button>
          <Button onClick={handleSlugChange} disabled={isChangingSlug}>
            {isChangingSlug ? "Changing..." : "Change Slug"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SlugChangeDialog;
