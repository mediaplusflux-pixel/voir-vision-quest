import { Copy, Trash2, Radio, Play, Square, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import type { Channel } from "@/hooks/useChannels";

interface ChannelCardProps {
  channel: Channel;
  onDelete: (id: string) => void;
  onEdit: (channel: Channel) => void;
}

const ChannelCard = ({ channel, onDelete, onEdit }: ChannelCardProps) => {
  const { toast } = useToast();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copié",
      description: `${label} copié dans le presse-papier`,
    });
  };

  const isActive = channel.status === "active";

  return (
    <Card className="relative">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Radio className="h-5 w-5 text-primary" />
            {channel.name}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={isActive ? "default" : "secondary"}>
              {isActive ? "Actif" : "Inactif"}
            </Badge>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onEdit(channel)}
              className="h-8 w-8"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onDelete(channel.id)}
              className="h-8 w-8 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Source URL */}
        {channel.source_url && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Source</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-muted px-2 py-1 rounded truncate">
                {channel.source_url}
              </code>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 shrink-0"
                onClick={() => copyToClipboard(channel.source_url!, "URL source")}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}

        {/* RTMP Output */}
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Sortie RTMP</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs bg-muted px-2 py-1 rounded truncate font-mono">
              {channel.rtmp_output_url}
            </code>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 shrink-0"
              onClick={() => copyToClipboard(channel.rtmp_output_url, "Lien RTMP")}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* HLS Output */}
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Sortie HLS</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs bg-muted px-2 py-1 rounded truncate font-mono">
              {channel.hls_output_url}
            </code>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 shrink-0"
              onClick={() => copyToClipboard(channel.hls_output_url, "Lien HLS")}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Stream Key */}
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Clé de stream</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs bg-muted px-2 py-1 rounded truncate font-mono">
              {channel.stream_key}
            </code>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 shrink-0"
              onClick={() => copyToClipboard(channel.stream_key, "Clé de stream")}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChannelCard;
