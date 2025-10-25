import { Plus, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import MediaCard from "@/components/MediaCard";
import VideoPlayer from "@/components/VideoPlayer";
import Header from "@/components/Header";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface MediaItem {
  id: string;
  title: string;
  duration: number | null;
  created_at: string;
  type: string;
  file_path: string;
  thumbnail: string | null;
}

const Bibliotheque = () => {
  const [previewVideo, setPreviewVideo] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadMediaItems();
  }, []);

  const loadMediaItems = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("media_library")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMediaItems(data || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les médias",
        variant: "destructive",
      });
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Utilisateur non authentifié");

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file type
        if (!file.type.startsWith("video/")) {
          toast({
            title: "Type de fichier invalide",
            description: `${file.name} n'est pas une vidéo`,
            variant: "destructive",
          });
          continue;
        }

        // Create unique file path
        const fileExt = file.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from("media-library")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Get video duration
        const duration = await getVideoDuration(file);

        // Save metadata to database
        const { error: dbError } = await supabase
          .from("media_library")
          .insert({
            user_id: user.id,
            title: file.name.replace(/\.[^/.]+$/, ""),
            file_path: fileName,
            file_size: file.size,
            duration,
            type: "video",
          });

        if (dbError) throw dbError;
      }

      toast({
        title: "Succès",
        description: `${files.length} fichier(s) importé(s)`,
      });

      loadMediaItems();
    } catch (error: any) {
      toast({
        title: "Erreur d'importation",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const getVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        resolve(video.duration);
      };
      video.onerror = () => resolve(0);
      video.src = URL.createObjectURL(file);
    });
  };

  const handlePreview = (item: MediaItem) => {
    const { data } = supabase.storage
      .from("media-library")
      .getPublicUrl(item.file_path);
    
    setPreviewVideo(data.publicUrl);
    setIsPreviewOpen(true);
  };

  const handleDelete = async (item: MediaItem) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("media-library")
        .remove([item.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from("media_library")
        .delete()
        .eq("id", item.id);

      if (dbError) throw dbError;

      toast({
        title: "Supprimé",
        description: "Le média a été supprimé",
      });

      loadMediaItems();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "0s";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-80 bg-sidebar-background border-r border-sidebar-border p-6 space-y-8">
          <div>
            <h2 className="text-foreground text-2xl font-bold mb-4">Bibliothèque</h2>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
            <Card 
              className="bg-card border-dashed border-2 border-border p-8 cursor-pointer hover:border-primary transition-colors"
              onClick={handleFileSelect}
            >
              <div className="flex flex-col items-center gap-3 text-center">
                <Upload className="w-12 h-12 text-muted-foreground" />
                <span className="text-foreground text-sm">
                  {isUploading ? "Importation en cours..." : "Importer des vidéos locales"}
                </span>
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
            <h1 className="text-foreground text-3xl font-bold">Mes Vidéos</h1>
            <div className="text-sm text-muted-foreground">
              {mediaItems.length} vidéo(s)
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mediaItems.map((item) => (
              <MediaCard
                key={item.id}
                title={item.title}
                duration={formatDuration(item.duration)}
                timeAgo={formatDistanceToNow(new Date(item.created_at), { 
                  addSuffix: true, 
                  locale: fr 
                })}
                type={item.type.toUpperCase()}
                thumbnail={item.thumbnail || "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=300&fit=crop"}
                onPreview={() => handlePreview(item)}
                onDelete={() => handleDelete(item)}
                onAddToGrid={() => console.log("Add to grid", item.title)}
              />
            ))}

            {mediaItems.length === 0 && (
              <Card className="bg-card border-border flex items-center justify-center p-8 min-h-[300px] col-span-full">
                <div className="text-center text-muted-foreground">
                  <p>Aucune vidéo importée</p>
                  <p className="mt-2">Cliquez sur <span className="text-foreground font-semibold">"Importer des vidéos locales"</span> pour commencer</p>
                </div>
              </Card>
            )}
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
