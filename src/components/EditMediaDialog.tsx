import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface EditMediaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mediaItem: {
    id: string;
    title: string;
  } | null;
  onSave: (id: string, title: string) => void;
}

export const EditMediaDialog = ({
  open,
  onOpenChange,
  mediaItem,
  onSave,
}: EditMediaDialogProps) => {
  const [title, setTitle] = useState(mediaItem?.title || "");

  const handleSave = () => {
    if (mediaItem) {
      onSave(mediaItem.id, title);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier la vidéo</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titre</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nom de la vidéo"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave}>Enregistrer</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
