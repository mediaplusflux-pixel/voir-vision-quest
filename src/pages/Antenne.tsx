import { Play, Pause, Trash2, Eye, Radio, Tv, Power, SkipForward, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import VideoPlayer from "@/components/VideoPlayer";
import { HLSPlayer } from "@/components/HLSPlayer";
import Header from "@/components/Header";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePlaylist } from "@/contexts/PlaylistContext";
import { useChannelBroadcast } from "@/hooks/useChannelBroadcast";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Antenne = () => {
  const { playlist, currentIndex, setCurrentIndex, isPlaying, setIsPlaying, playMode, setPlayMode } = usePlaylist();
  const { broadcasts, isLoading, startBroadcast, stopBroadcast } = useChannelBroadcast();
  const [isLive, setIsLive] = useState(false);
  const [activeSource, setActiveSource] = useState<'playlist' | 'live'>('playlist');
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string>("");
  const { toast } = useToast();
  
  const channelId = "zeedboda";
  const broadcast = broadcasts[channelId];

  useEffect(() => {
    if (playlist.length > 0 && currentIndex < playlist.length) {
      const currentVideo = playlist[currentIndex];
      const { data } = supabase.storage
        .from("media-library")
        .getPublicUrl(currentVideo.file_path);
      setCurrentVideoUrl(data.publicUrl);
    }
  }, [playlist, currentIndex]);

  const handleActivateAntenna = async () => {
    if (playlist.length === 0) {
      toast({
        title: "Playlist vide",
        description: "Ajoutez des vidéos à la playlist depuis la bibliothèque",
        variant: "destructive",
      });
      return;
    }

    const playlistUrls = playlist.map(item => {
      const { data } = supabase.storage.from("media-library").getPublicUrl(item.file_path);
      return data.publicUrl;
    });

    await startBroadcast(channelId, 'playlist', JSON.stringify({
      urls: playlistUrls,
      loop: playMode === 'loop'
    }));
    
    setIsLive(true);
    setIsPlaying(true);
  };

  const handleStopAntenna = async () => {
    await stopBroadcast(channelId);
    setIsLive(false);
    setIsPlaying(false);
  };

  const handleNextVideo = () => {
    if (playMode === 'manual' && playlist.length > 0) {
      setCurrentIndex((currentIndex + 1) % playlist.length);
    }
  };

  const handleVideoEnd = () => {
    if (playMode === 'loop' && playlist.length > 0) {
      setCurrentIndex((currentIndex + 1) % playlist.length);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="p-8 space-y-6">
        {/* Main Broadcast Output - Top */}
        <Card className="bg-card border-border">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Tv className="w-6 h-6 text-primary" />
              <h2 className="text-foreground text-2xl font-bold">ANTENNE EN DIRECT</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className={isLive ? "text-green-500 font-semibold" : "text-destructive font-semibold"}>
                {isLive ? "● DIFFUSION EN COURS" : "HORS ANTENNE"}
              </span>
            </div>
          </div>
          <div className="p-4">
            <HLSPlayer 
              src={isLive && broadcast?.hlsUrl ? broadcast.hlsUrl : undefined}
              className="w-full aspect-video"
              autoPlay={isLive}
            />
            <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Source active:</span>
                <span className="text-foreground font-semibold">
                  {activeSource === 'playlist' ? 'Playlist' : 'Live'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Spectateurs:</span>
                <span className="text-foreground">{isLive ? "0" : "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bitrate:</span>
                <span className="text-foreground">{isLive ? "2500 kbps" : "-"}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Control Buttons */}
        <div className="flex justify-center gap-4">
          <Button 
            variant={isLive ? 'default' : 'secondary'}
            size="lg"
            onClick={handleActivateAntenna}
            disabled={isLoading || playlist.length === 0}
            className="min-w-[200px]"
          >
            <Power className="w-5 h-5 mr-2" />
            Activer l'antenne
          </Button>
          <Button 
            variant="secondary"
            size="lg"
            onClick={() => setPlayMode(playMode === 'loop' ? 'manual' : 'loop')}
            disabled={!isLive}
            className="min-w-[200px]"
          >
            {playMode === 'loop' ? 'Mode: Boucle' : 'Mode: Manuel'}
          </Button>
          {playMode === 'manual' && (
            <Button 
              variant="secondary"
              size="lg"
              onClick={handleNextVideo}
              disabled={!isLive}
              className="min-w-[200px]"
            >
              <SkipForward className="w-5 h-5 mr-2" />
              Vidéo suivante
            </Button>
          )}
          <Button 
            variant="destructive"
            size="lg"
            onClick={handleStopAntenna}
            disabled={!isLive}
            className="min-w-[200px]"
          >
            <Pause className="w-5 h-5 mr-2" />
            Arrêter l'antenne
          </Button>
        </div>

        {/* Source Previews - Below */}
        <Tabs defaultValue="playlist" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="playlist">PROGRAM (Playlist)</TabsTrigger>
            <TabsTrigger value="live">LIVE (Antenne)</TabsTrigger>
          </TabsList>
          
          <TabsContent value="playlist" className="space-y-4 mt-4">
            <div className="grid grid-cols-3 gap-6">
              <Card className="col-span-2 bg-card border-border">
                <div className="p-4 border-b border-border">
                  <h3 className="text-foreground text-xl font-bold">Aperçu Playlist</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Contenus stockés dans la bibliothèque, diffusés en temps réel par FFmpeg Cloud
                  </p>
                </div>
                <div className="p-4">
                  {playlist.length > 0 ? (
                    <>
                      <VideoPlayer 
                        src={currentVideoUrl}
                        className="w-full aspect-video"
                        autoPlay={isPlaying}
                        onEnded={handleVideoEnd}
                      />
                      <div className="mt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">En lecture:</span>
                          <span className="text-foreground font-semibold">{playlist[currentIndex]?.title}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Vidéo:</span>
                          <span className="text-foreground">{currentIndex + 1}/{playlist.length}</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="w-full aspect-video bg-muted rounded flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <List className="w-12 h-12 mx-auto mb-2" />
                        <p>Aucune playlist chargée</p>
                        <p className="text-sm mt-1">Ajoutez des vidéos depuis la bibliothèque</p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              <Card className="bg-card border-border p-6">
                <h3 className="text-foreground text-xl font-bold mb-4">Contrôles Playlist</h3>
                {playlist.length > 0 ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-foreground text-sm font-semibold mb-2">En lecture</h4>
                      <p className="text-foreground text-lg">{playlist[currentIndex]?.title || 'N/A'}</p>
                      <p className="text-muted-foreground text-sm">Vidéo {currentIndex + 1}/{playlist.length}</p>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        variant="secondary" 
                        className="flex-1"
                        onClick={() => setIsPlaying(!isPlaying)}
                        disabled={!isLive}
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                      {playMode === 'manual' && (
                        <Button 
                          variant="secondary" 
                          className="flex-1"
                          onClick={handleNextVideo}
                          disabled={!isLive}
                        >
                          <SkipForward className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="border-t border-border pt-4">
                      <h4 className="text-foreground text-sm font-semibold mb-2">Suivant</h4>
                      <p className="text-muted-foreground text-sm">
                        {playlist[(currentIndex + 1) % playlist.length]?.title || 'N/A'}
                      </p>
                    </div>

                    <div className="border-t border-border pt-4">
                      <h4 className="text-foreground text-sm font-semibold mb-2">Mode de lecture</h4>
                      <p className="text-muted-foreground text-sm">
                        {playMode === 'loop' ? 'Boucle automatique' : 'Avancement manuel'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <p>Aucune playlist chargée</p>
                  </div>
                )}
              </Card>
            </div>

            <Card className="bg-card border-border p-6">
              <h3 className="text-foreground text-xl font-bold mb-4">Programmes en playlist ({playlist.length}/20)</h3>
              {playlist.length > 0 ? (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {playlist.map((item, index) => (
                    <div 
                      key={item.id} 
                      className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                        index === currentIndex && isPlaying 
                          ? 'bg-primary/20 border-2 border-primary' 
                          : 'bg-secondary hover:bg-secondary/80'
                      }`}
                    >
                      <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <img
                        src={item.thumbnail || "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=300&fit=crop"}
                        alt={item.title}
                        className="w-20 h-14 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="text-foreground font-semibold">{item.title}</h4>
                        <p className="text-muted-foreground text-sm">
                          {item.duration ? `${Math.floor(item.duration / 60)}m ${Math.floor(item.duration % 60)}s` : 'N/A'}
                        </p>
                      </div>
                      {index === currentIndex && isPlaying && (
                        <div className="flex items-center gap-1 text-primary">
                          <Play className="w-4 h-4 fill-current" />
                          <span className="text-xs font-semibold">EN COURS</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <List className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Aucune vidéo dans la playlist</p>
                  <p className="text-sm mt-1">Ajoutez des vidéos depuis la bibliothèque</p>
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="live" className="mt-4">
            <Card className="bg-card border-border">
              <div className="p-4 border-b border-border">
                <h3 className="text-foreground text-xl font-bold">Live Stream Input</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Flux live ajouté pour retransmission directe à l'antenne
                </p>
              </div>
              <div className="p-4">
                <VideoPlayer 
                  className="w-full aspect-video"
                />
                <div className="mt-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">URL d'entrée:</span>
                    <span className="text-foreground font-mono text-xs">rtmp://...</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="text-green-500 font-semibold">● Connecté</span>
                  </div>
                  <Button variant="secondary" className="w-full">
                    Configurer le flux live
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Antenne;
