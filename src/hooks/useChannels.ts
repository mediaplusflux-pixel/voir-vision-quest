import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface Channel {
  id: string;
  name: string;
  source_url: string | null;
  stream_key: string;
  rtmp_output_url: string;
  hls_output_url: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export const useChannels = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchChannels = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("channels")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setChannels(data || []);
    } catch (error: any) {
      console.error("Error fetching channels:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les chaînes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createChannel = async (name: string, sourceUrl?: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("channels")
        .insert({
          user_id: user.id,
          name,
          source_url: sourceUrl || null,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Chaîne créée",
        description: `La chaîne "${name}" a été créée avec ses liens de sortie`,
      });

      await fetchChannels();
      return data;
    } catch (error: any) {
      console.error("Error creating channel:", error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la chaîne",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateChannel = async (id: string, updates: Partial<Pick<Channel, "name" | "source_url" | "status">>) => {
    try {
      const { error } = await supabase
        .from("channels")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Chaîne mise à jour",
        description: "Les modifications ont été enregistrées",
      });

      await fetchChannels();
      return true;
    } catch (error: any) {
      console.error("Error updating channel:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la chaîne",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteChannel = async (id: string) => {
    try {
      const { error } = await supabase
        .from("channels")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Chaîne supprimée",
        description: "La chaîne a été supprimée",
      });

      await fetchChannels();
      return true;
    } catch (error: any) {
      console.error("Error deleting channel:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la chaîne",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchChannels();
  }, [user]);

  return {
    channels,
    isLoading,
    createChannel,
    updateChannel,
    deleteChannel,
    refetch: fetchChannels,
  };
};
