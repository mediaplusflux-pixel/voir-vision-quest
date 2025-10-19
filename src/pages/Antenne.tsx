import { Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import Header from "@/components/Header";

const Antenne = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="p-8 grid grid-cols-3 gap-6">
        {/* Left Column - Program */}
        <div className="space-y-6">
          <div>
            <h2 className="text-foreground text-xl font-bold mb-4">PROGRAM (Playlist)</h2>
            <Card className="bg-card border-border p-6 space-y-4">
              <div className="text-center">
                <h3 className="text-foreground text-4xl font-bold mb-8">CONFÉRENCE</h3>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">VOD</span>
                  <span className="text-muted-foreground">0:13 / 35</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full w-1/4 bg-accent"></div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="secondary" className="flex-1">
                  Prévisualiser
                </Button>
                <Button variant="secondary" className="flex-1">
                  Supprimer
                </Button>
              </div>
            </Card>
          </div>

          <div>
            <h2 className="text-foreground text-xl font-bold mb-4">Now</h2>
            <div className="space-y-3">
              <Card className="bg-card border-border p-4">
                <div className="flex items-center gap-3">
                  <div className="text-foreground font-bold">INTRO</div>
                  <div className="text-foreground font-bold">CONFÉRENCE</div>
                </div>
                <div className="text-sm text-yellow-500 mt-1">VOD</div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-muted-foreground text-sm">1:13 / 3:00</span>
                  <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                    <div className="h-full w-1/3 bg-accent"></div>
                  </div>
                </div>
              </Card>

              <Card className="bg-accent border-accent p-4">
                <div className="flex items-center gap-3">
                  <div className="text-4xl font-bold text-foreground">-10</div>
                  <div>
                    <div className="text-foreground font-bold">INTRO</div>
                    <div className="text-sm text-muted-foreground">VOD</div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Middle Column - Controls & Streams */}
        <div className="space-y-6">
          <Card className="bg-card border-border p-8 flex flex-col items-center justify-center min-h-[300px]">
            <div className="text-9xl font-bold text-foreground mb-6">T</div>
            <div className="flex gap-3">
              <Button variant="secondary" size="lg" className="w-16 h-16 text-xl">
                C
              </Button>
              <Button variant="secondary" size="lg" className="w-16 h-16">
                <Pause className="w-8 h-8" />
              </Button>
            </div>
            <Button variant="secondary" className="mt-4">
              Dissolve
            </Button>
          </Card>

          <div>
            <h2 className="text-foreground text-xl font-bold mb-4">Streams</h2>
            <div className="space-y-2">
              <Card className="bg-card border-border p-4">
                <div className="text-foreground font-bold">CONFÉRENCE</div>
                <div className="text-yellow-500 font-bold text-sm">LIVE</div>
              </Card>
              <Card className="bg-card border-border p-4">
                <div className="text-foreground font-bold">INTRO</div>
              </Card>
            </div>
          </div>
        </div>

        {/* Right Column - Live */}
        <div className="space-y-6">
          <div>
            <h2 className="text-foreground text-xl font-bold mb-4">LIVE (Antenne)</h2>
            <Card className="bg-card border-border overflow-hidden">
              <div className="aspect-video relative">
                <img
                  src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop"
                  alt="Live"
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Button size="icon" variant="secondary">
                    <Play className="w-5 h-5" />
                  </Button>
                  <Slider defaultValue={[30]} max={100} step={1} className="flex-1" />
                  <span className="text-foreground font-mono text-sm">13:49:07</span>
                </div>
              </div>
            </Card>

            <Button className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90">
              Forcer le direct
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Antenne;
