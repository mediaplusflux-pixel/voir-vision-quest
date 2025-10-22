import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import MediaCard from "@/components/MediaCard";
import VideoPlayer from "@/components/VideoPlayer";
import Header from "@/components/Header";
import { useState } from "react";

const Bibliotheque = () => {
  const [previewVideo, setPreviewVideo] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const inputs = [
    {
      id: 1,
      title: "INTRO",
      duration: "15 s",
      timeAgo: "6 min. ago",
      type: "VOD",
      thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
    },
    {
      id: 2,
      title: "SIMUL",
      duration: "3 m",
      timeAgo: "6 mn ago",
      type: "VOD",
      thumbnail: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=400&h=300&fit=crop",
    },
    {
      id: 3,
      title: "NIGHT",
      duration: "4 12",
      timeAgo: "4 mn ago",
      type: "VOD",
      thumbnail: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&h=300&fit=crop",
    },
    {
      id: 4,
      title: "BEACH",
      duration: "30 s",
      timeAgo: "5 mn. ago",
      type: "VOD",
      thumbnail: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop",
    },
    {
      id: 6,
      title: "FEED",
      duration: "30 mn.",
      timeAgo: "ago",
      type: "VOD",
      thumbnail: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=400&h=300&fit=crop",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-80 bg-sidebar-background border-r border-sidebar-border p-6 space-y-8">
          <div>
            <h2 className="text-foreground text-2xl font-bold mb-4">Bibliothèque</h2>
            <Card className="bg-card border-dashed border-2 border-border p-8 cursor-pointer hover:border-primary transition-colors">
              <div className="flex flex-col items-center gap-3 text-center">
                <Plus className="w-12 h-12 text-muted-foreground" />
                <span className="text-foreground text-sm">Obtenir une autre source...</span>
              </div>
            </Card>
          </div>

          <div>
            <h2 className="text-foreground text-2xl font-bold mb-4">Bibliothèque</h2>
            <Card className="bg-card border-border p-8">
              <div className="flex flex-col items-center gap-4">
                <div className="text-8xl font-bold text-muted-foreground/30">#</div>
                <div className="w-full space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>830</span>
                    <span>14.3s</span>
                  </div>
                  <div className="h-1 bg-muted rounded-full overflow-hidden">
                    <div className="h-full w-1/3 bg-accent"></div>
                  </div>
                </div>
                <Button variant="secondary" className="w-full">
                  Obtenir une autre source
                </Button>
              </div>
            </Card>
          </div>

          <div>
            <h2 className="text-foreground text-2xl font-bold mb-4">Channels</h2>
            <div className="space-y-2">
              <div className="text-foreground text-lg p-3 hover:bg-secondary rounded cursor-pointer">
                Channel 1
              </div>
              <div className="text-foreground text-lg p-3 hover:bg-secondary rounded cursor-pointer">
                Channel 2
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-foreground text-3xl font-bold">Inputs</h1>
            <div className="text-sm text-muted-foreground">
              Importation d'un fichier <span className="ml-2">13.45.31</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inputs.map((input) => (
              <MediaCard
                key={input.id}
                title={input.title}
                duration={input.duration}
                timeAgo={input.timeAgo}
                type={input.type}
                thumbnail={input.thumbnail}
                onPreview={() => {
                  setPreviewVideo(input.thumbnail);
                  setIsPreviewOpen(true);
                }}
                onDelete={() => console.log("Delete", input.title)}
                onAddToGrid={() => console.log("Add to grid", input.title)}
              />
            ))}

            <Card className="bg-card border-border flex items-center justify-center p-8 min-h-[300px]">
              <div className="text-center text-muted-foreground">
                <p>Press <span className="text-foreground font-semibold">play INPUT" PLUS</span> on</p>
                <p><span className="text-foreground font-semibold">Inputs</span> tab to add new...</p>
              </div>
            </Card>
          </div>

          <div className="mt-8 flex justify-center gap-2">
            <Button variant="secondary" size="sm">1</Button>
            <Button variant="secondary" size="sm">2</Button>
            <Button variant="secondary" size="sm">3</Button>
            <span className="flex items-center px-2 text-muted-foreground">...</span>
          </div>
        </main>
      </div>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Prévisualisation</DialogTitle>
          </DialogHeader>
          <VideoPlayer src={previewVideo || undefined} className="w-full aspect-video" />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Bibliotheque;
