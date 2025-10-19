import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface MediaCardProps {
  title: string;
  duration: string;
  timeAgo: string;
  type: string;
  thumbnail: string;
  onPreview?: () => void;
  onDelete?: () => void;
  onAddToGrid?: () => void;
}

const MediaCard = ({
  title,
  duration,
  timeAgo,
  type,
  thumbnail,
  onPreview,
  onDelete,
  onAddToGrid,
}: MediaCardProps) => {
  return (
    <Card className="bg-card overflow-hidden border-border">
      <div className="aspect-video relative overflow-hidden">
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="p-4 space-y-3">
        <div className="space-y-1">
          <h3 className="text-foreground font-bold text-lg tracking-wide">
            {title}
          </h3>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{duration} · {timeAgo}</span>
            <span className="text-muted-foreground">{type}</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          {onPreview && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onPreview}
              className="flex-1"
            >
              Prévisualiser
            </Button>
          )}
          {onDelete && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onDelete}
              className="flex-1"
            >
              Supprimer
            </Button>
          )}
          {onAddToGrid && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onAddToGrid}
              className="flex-1"
            >
              Ajouter à la grille
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default MediaCard;
