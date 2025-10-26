import { Play, Pause, Trash2, Eye, Radio, Tv } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import VideoPlayer from "@/components/VideoPlayer";
import Header from "@/components/Header";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Antenne = () => {
  const [isLive, setIsLive] = useState(false);
  const [activeSource, setActiveSource] = useState<'playlist' | 'live'>('playlist');

  const programs = [
    {
      id: 1,
      title: "INTRO",
      duration: "15 s",
      thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
    },
    {
      id: 2,
      title: "CONFÉRENCE",
      duration: "35 m",
      thumbnail: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=400&h=300&fit=crop",
    },
    {
      id: 3,
      title: "SIMUL",
      duration: "3 m",
      thumbnail: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&h=300&fit=crop",
    },
  ];

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
            <VideoPlayer 
              className="w-full aspect-video"
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
            variant={activeSource === 'playlist' ? 'default' : 'secondary'}
            size="lg"
            onClick={() => {
              setActiveSource('playlist');
              setIsLive(true);
            }}
            className="min-w-[200px]"
          >
            <Radio className="w-5 h-5 mr-2" />
            Playlist à l'antenne
          </Button>
          <Button 
            variant={activeSource === 'live' ? 'default' : 'secondary'}
            size="lg"
            onClick={() => {
              setActiveSource('live');
              setIsLive(true);
            }}
            className="min-w-[200px]"
          >
            <Radio className="w-5 h-5 mr-2" />
            Live à l'antenne
          </Button>
          <Button 
            variant="destructive"
            size="lg"
            onClick={() => setIsLive(false)}
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
                  <VideoPlayer 
                    src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                    className="w-full aspect-video"
                  />
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">En lecture:</span>
                      <span className="text-foreground font-semibold">INTRO</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Durée:</span>
                      <span className="text-foreground">15 s</span>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="bg-card border-border p-6">
                <h3 className="text-foreground text-xl font-bold mb-4">Contrôles Playlist</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-foreground text-sm font-semibold mb-2">En lecture</h4>
                    <p className="text-foreground text-lg">INTRO</p>
                    <p className="text-muted-foreground text-sm">15 s restantes</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground mb-1">
                      <span>0:05</span>
                      <span>0:15</span>
                    </div>
                    <Slider defaultValue={[33]} max={100} step={1} />
                  </div>

                  <div className="flex gap-2">
                    <Button variant="secondary" className="flex-1">
                      <Play className="w-4 h-4" />
                    </Button>
                    <Button variant="secondary" className="flex-1">
                      <Pause className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="border-t border-border pt-4">
                    <h4 className="text-foreground text-sm font-semibold mb-2">Suivant</h4>
                    <p className="text-muted-foreground text-sm">SIMUL - 3m 0s</p>
                  </div>
                </div>
              </Card>
            </div>

            <Card className="bg-card border-border p-6">
              <h3 className="text-foreground text-xl font-bold mb-4">Programmes en playlist</h3>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {programs.map((program) => (
                  <div key={program.id} className="flex items-center gap-3 p-3 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors">
                    <img
                      src={program.thumbnail}
                      alt={program.title}
                      className="w-20 h-14 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="text-foreground font-semibold">{program.title}</h4>
                      <p className="text-muted-foreground text-sm">{program.duration}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
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
