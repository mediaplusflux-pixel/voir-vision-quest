import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CreateChannelDialogProps {
  onCreate: (name: string, sourceUrl?: string) => Promise<any>;
}

const CreateChannelDialog = ({ onCreate }: CreateChannelDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;

    setIsCreating(true);
    const result = await onCreate(name.trim(), sourceUrl.trim() || undefined);
    setIsCreating(false);

    if (result) {
      setName("");
      setSourceUrl("");
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nouvelle chaîne
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Créer une nouvelle chaîne</DialogTitle>
          <DialogDescription>
            Les liens de sortie RTMP et HLS seront générés automatiquement.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom de la chaîne *</Label>
            <Input
              id="name"
              placeholder="Ex: Média+1"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="source">URL source (optionnel)</Label>
            <Input
              id="source"
              placeholder="Ex: https://exemple.com/source.m3u8"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Le flux source que vous souhaitez diffuser via cette chaîne
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button onClick={handleCreate} disabled={!name.trim() || isCreating}>
            {isCreating ? "Création..." : "Créer la chaîne"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateChannelDialog;
