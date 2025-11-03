import { Play, Pause, Trash2, Tv, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import VideoPlayer from "@/components/VideoPlayer";
import Header from "@/components/Header";
import { useState, useEffect } from "react";
import { usePlaylist } from "@/contexts/PlaylistContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useChannelBroadcast } from "@/hooks/useChannelBroadcast";

const AntenneNew = () => {
  const [isLive, setIsLive] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string>("");
  const { playlist, playlistMode, setPlaylistMode, removeFromPlaylist } = usePlaylist();
  const { toast } = useToast();
  const { startBroadcast, stopBroadcast, broadcasts, isLoading } = useChannelBroadcast();
  const channelId = "channel-1"; // ID de l'antenne

  useEffect(() => {
    if (playlist.length > 0 && currentVideoIndex < playlist.length) {
      const currentVideo = playlist[currentVideoIndex];
      const { data } = supabase.storage
        .from("media-library")
        .getPublicUrl(currentVideo.file_path);
      setCurrentVideoUrl(data.publicUrl);
    }
  }, [currentVideoIndex, playlist]);

  const handleStartBroadcast = async () => {
    if (playlist.length === 0) {
      toast({
        title: "Playlist vide",
        description: "Ajoutez des vidéos à la playlist depuis la bibliothèque",
        variant: "destructive",
      });
      return;
    }

    try {
      await startBroadcast(channelId, "playlist", currentVideoUrl);
      setIsLive(true);
      toast({
        title: "Diffusion lancée",
        description: "La playlist est en cours de diffusion",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleStopBroadcast = async () => {
    try {
      await stopBroadcast(channelId);
      setIsLive(false);
      toast({
        title: "Diffusion arrêtée",
        description: "L'antenne est hors service",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleNextVideo = () => {
    if (playlistMode === "manual") {
      if (currentVideoIndex < playlist.length - 1) {
        setCurrentVideoIndex(currentVideoIndex + 1);
      }
    } else if (playlistMode === "loop") {
      if (currentVideoIndex < playlist.length - 1) {
        setCurrentVideoIndex(currentVideoIndex + 1);
      } else {
        setCurrentVideoIndex(0);
      }
    }
  };

  const handlePreviousVideo = () => {
    if (currentVideoIndex > 0) {
      setCurrentVideoIndex(currentVideoIndex - 1);
    } else if (playlistMode === "loop") {
      setCurrentVideoIndex(playlist.length - 1);
    }
  };

  const handleVideoEnd = () => {
    if (playlistMode === "loop") {
      if (currentVideoIndex < playlist.length - 1) {
        setCurrentVideoIndex(currentVideoIndex + 1);
      } else {
        setCurrentVideoIndex(0);
      }
    } else {
      // Mode manuel: attendre l'action de l'utilisateur
      if (currentVideoIndex < playlist.length - 1) {
        // Préparer la prochaine vidéo mais ne pas la lancer
        setCurrentVideoIndex(currentVideoIndex + 1);
      }
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const currentBroadcast = broadcasts[channelId];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="p-8 space-y-6">
        {/* Antenne en direct */}
        <Card className="bg-card border-border">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Tv className="w-6 h-6 text-primary" />
              <h2 className="text-foreground text-2xl font-bold">ANTENNE EN DIRECT</h2>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant={isLive ? "default" : "secondary"} className="text-sm">
                {isLive ? "● EN DIRECT" : "HORS LIGNE"}
              </Badge>
              {playlist.length > 0 && (
                <Badge variant="outline">
                  Vidéo {currentVideoIndex + 1}/{playlist.length}
                </Badge>
              )}
            </div>
          </div>
          <div className="p-4">
            {currentVideoUrl && playlist.length > 0 ? (
              <VideoPlayer 
                src={currentVideoUrl}
                className="w-full aspect-video"
                onEnded={handleVideoEnd}
              />
            ) : (
              <div className="w-full aspect-video bg-secondary flex items-center justify-center">
                <p className="text-muted-foreground">Aucune vidéo dans la playlist</p>
              </div>
            )}
            {currentBroadcast && (
              <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="text-foreground font-semibold">{currentBroadcast.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Durée:</span>
                  <span className="text-foreground">{currentBroadcast.duration || "0:00"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">HLS URL:</span>
                  <span className="text-foreground font-mono text-xs truncate">
                    {currentBroadcast.hlsUrl ? "Disponible" : "-"}
                  </span>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Contrôles */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contrôles de diffusion */}
          <Card className="bg-card border-border p-6">
            <h3 className="text-foreground text-xl font-bold mb-4">Contrôles</h3>
            <div className="space-y-4">
              <Button 
                variant={isLive ? "secondary" : "default"}
                size="lg"
                className="w-full"
                onClick={handleStartBroadcast}
                disabled={isLoading || isLive || playlist.length === 0}
              >
                <Radio className="w-5 h-5 mr-2" />
                Démarrer la diffusion
              </Button>
              <Button 
                variant="destructive"
                size="lg"
                className="w-full"
                onClick={handleStopBroadcast}
                disabled={isLoading || !isLive}
              >
                <Pause className="w-5 h-5 mr-2" />
                Arrêter la diffusion
              </Button>

              <div className="border-t border-border pt-4">
                <label className="text-sm text-muted-foreground mb-2 block">
                  Mode de lecture
                </label>
                <Select
                  value={playlistMode}
                  onValueChange={(value: "loop" | "manual") => setPlaylistMode(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="loop">Boucle automatique</SelectItem>
                    <SelectItem value="manual">Avancement manuel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {playlistMode === "manual" && (
                <div className="flex gap-2">
                  <Button 
                    variant="secondary" 
                    className="flex-1"
                    onClick={handlePreviousVideo}
                    disabled={!isLive}
                  >
                    Précédent
                  </Button>
                  <Button 
                    variant="secondary" 
                    className="flex-1"
                    onClick={handleNextVideo}
                    disabled={!isLive}
                  >
                    Suivant
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* Vidéo en cours */}
          <Card className="bg-card border-border p-6">
            <h3 className="text-foreground text-xl font-bold mb-4">En lecture</h3>
            {playlist.length > 0 && playlist[currentVideoIndex] ? (
              <div className="space-y-3">
                <div className="aspect-video bg-secondary rounded overflow-hidden">
                  <img
                    src={playlist[currentVideoIndex].thumbnail || "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=300&fit=crop"}
                    alt={playlist[currentVideoIndex].title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-foreground font-semibold">
                    {playlist[currentVideoIndex].title}
                  </h4>
                  <p className="text-muted-foreground text-sm">
                    Durée: {formatDuration(playlist[currentVideoIndex].duration)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                Aucune vidéo sélectionnée
              </div>
            )}
          </Card>

          {/* Suivant */}
          <Card className="bg-card border-border p-6">
            <h3 className="text-foreground text-xl font-bold mb-4">Suivant</h3>
            {playlist.length > currentVideoIndex + 1 ? (
              <div className="space-y-3">
                <div className="aspect-video bg-secondary rounded overflow-hidden">
                  <img
                    src={playlist[currentVideoIndex + 1].thumbnail || "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=300&fit=crop"}
                    alt={playlist[currentVideoIndex + 1].title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-foreground font-semibold">
                    {playlist[currentVideoIndex + 1].title}
                  </h4>
                  <p className="text-muted-foreground text-sm">
                    Durée: {formatDuration(playlist[currentVideoIndex + 1].duration)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                {playlistMode === "loop" && playlist.length > 0
                  ? "Retour au début de la playlist"
                  : "Fin de la playlist"}
              </div>
            )}
          </Card>
        </div>

        {/* Playlist complète */}
        <Card className="bg-card border-border p-6">
          <h3 className="text-foreground text-xl font-bold mb-4">
            Programme en playlist ({playlist.length}/20)
          </h3>
          {playlist.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <p>Aucune vidéo dans la playlist</p>
              <p className="mt-2 text-sm">Allez dans la bibliothèque pour ajouter des vidéos</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {playlist.map((video, index) => (
                <div 
                  key={video.id} 
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    index === currentVideoIndex 
                      ? "bg-primary/20 border border-primary" 
                      : "bg-secondary hover:bg-secondary/80"
                  }`}
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-foreground font-semibold text-sm">{index + 1}</span>
                  </div>
                  <img
                    src={video.thumbnail || "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=300&fit=crop"}
                    alt={video.title}
                    className="w-20 h-14 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-foreground font-semibold truncate">{video.title}</h4>
                    <p className="text-muted-foreground text-sm">
                      {formatDuration(video.duration)}
                    </p>
                  </div>
                  {index === currentVideoIndex && (
                    <Badge variant="default">En lecture</Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFromPlaylist(video.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AntenneNew;
