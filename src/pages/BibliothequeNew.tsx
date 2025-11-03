import { Upload, Tv, Edit, Trash2, Eye, ListPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import VideoPlayer from "@/components/VideoPlayer";
import Header from "@/components/Header";
import { EditMediaDialog } from "@/components/EditMediaDialog";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { usePlaylist } from "@/contexts/PlaylistContext";
import { useNavigate } from "react-router-dom";

interface MediaItem {
  id: string;
  title: string;
  duration: number | null;
  created_at: string;
  type: string;
  file_path: string;
  thumbnail: string | null;
}

const BibliothequeNew = () => {
  const [previewVideo, setPreviewVideo] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { playlist, addToPlaylist, removeFromPlaylist } = usePlaylist();
  const navigate = useNavigate();

  useEffect(() => {
    loadMediaItems();
  }, []);

  const loadMediaItems = async () => {
    try {
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
      const anonymousUserId = "anonymous-user";

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        if (!file.type.startsWith("video/")) {
          toast({
            title: "Type de fichier invalide",
            description: `${file.name} n'est pas une vidéo`,
            variant: "destructive",
          });
          continue;
        }

        const fileExt = file.name.split(".").pop();
        const fileName = `${anonymousUserId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("media-library")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const duration = await getVideoDuration(file);

        const { error: dbError } = await supabase
          .from("media_library")
          .insert({
            user_id: anonymousUserId,
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

  const handleEdit = (item: MediaItem) => {
    setEditingItem(item);
    setIsEditOpen(true);
  };

  const handleSaveEdit = async (id: string, title: string) => {
    try {
      const { error } = await supabase
        .from("media_library")
        .update({ title })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Vidéo modifiée",
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

  const handleDelete = async (item: MediaItem) => {
    try {
      const { error: storageError } = await supabase.storage
        .from("media-library")
        .remove([item.file_path]);

      if (storageError) throw storageError;

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

  const handleAddToPlaylist = (item: MediaItem) => {
    if (playlist.length >= 20) {
      toast({
        title: "Playlist pleine",
        description: "Maximum 20 vidéos dans la playlist",
        variant: "destructive",
      });
      return;
    }

    addToPlaylist({
      id: item.id,
      title: item.title,
      duration: item.duration,
      file_path: item.file_path,
      thumbnail: item.thumbnail,
    });

    toast({
      title: "Ajouté à la playlist",
      description: `${item.title} ajouté`,
    });
  };

  const handleSendToAntenne = () => {
    if (playlist.length === 0) {
      toast({
        title: "Playlist vide",
        description: "Ajoutez des vidéos à la playlist",
        variant: "destructive",
      });
      return;
    }

    navigate("/antenne");
    toast({
      title: "Playlist envoyée",
      description: "Direction l'antenne",
    });
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "0s";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const isInPlaylist = (id: string) => playlist.some((item) => item.id === id);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-80 bg-sidebar-background border-r border-sidebar-border p-6 space-y-6">
          <div>
            <h2 className="text-foreground text-2xl font-bold mb-4">Importer</h2>
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
                  {isUploading ? "Importation..." : "Importer des vidéos"}
                </span>
              </div>
            </Card>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-foreground text-2xl font-bold">Playlist</h2>
              <Badge variant="secondary">{playlist.length}/20</Badge>
            </div>
            <Card className="bg-card border-border p-4 max-h-[400px] overflow-y-auto">
              {playlist.length === 0 ? (
                <p className="text-muted-foreground text-center text-sm py-8">
                  Aucune vidéo dans la playlist
                </p>
              ) : (
                <div className="space-y-2">
                  {playlist.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 p-2 bg-secondary rounded">
                      <div className="flex-1 min-w-0">
                        <p className="text-foreground text-sm font-medium truncate">
                          {item.title}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {formatDuration(item.duration)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => removeFromPlaylist(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
            <Button 
              className="w-full mt-4" 
              onClick={handleSendToAntenne}
              disabled={playlist.length === 0}
            >
              <Tv className="w-4 h-4 mr-2" />
              Envoyer à l'antenne
            </Button>
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
              <Card key={item.id} className="bg-card border-border overflow-hidden group">
                <div className="relative aspect-video bg-secondary">
                  <img
                    src={item.thumbnail || "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=300&fit=crop"}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary">{item.type.toUpperCase()}</Badge>
                  </div>
                  {isInPlaylist(item.id) && (
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-primary">Dans la playlist</Badge>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-foreground font-semibold mb-1 truncate">{item.title}</h3>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                    <span>{formatDuration(item.duration)}</span>
                    <span>{formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: fr })}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => handlePreview(item)}>
                      <Eye className="w-4 h-4 mr-1" />
                      Voir
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => handleEdit(item)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => handleAddToPlaylist(item)}>
                      <ListPlus className="w-4 h-4" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(item)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}

            {mediaItems.length === 0 && (
              <Card className="bg-card border-border flex items-center justify-center p-8 min-h-[300px] col-span-full">
                <div className="text-center text-muted-foreground">
                  <p>Aucune vidéo importée</p>
                  <p className="mt-2">Cliquez sur <span className="text-foreground font-semibold">"Importer des vidéos"</span> pour commencer</p>
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

      <EditMediaDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        mediaItem={editingItem}
        onSave={handleSaveEdit}
      />
    </div>
  );
};

export default BibliothequeNew;
