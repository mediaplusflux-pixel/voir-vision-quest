import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BroadcastStatus {
  channelId: string;
  status: 'idle' | 'starting' | 'live' | 'stopping' | 'stopped';
  hlsUrl?: string;
  iframeUrl?: string;
  duration?: number;
  source?: string;
}

export const useChannelBroadcast = () => {
  const [broadcasts, setBroadcasts] = useState<Record<string, BroadcastStatus>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const startBroadcast = async (channelId: string, source: 'playlist' | 'live', sourceUrl?: string) => {
    setIsLoading(true);
    setBroadcasts(prev => ({
      ...prev,
      [channelId]: { ...prev[channelId], channelId, status: 'starting' }
    }));

    try {
      const { data, error } = await supabase.functions.invoke('ffmpeg-start', {
        body: { channelId, source, sourceUrl }
      });

      if (error) throw error;

      if (data.success) {
        // Construire les URLs basées sur le channelId
        const hlsUrl = `https://media-plus.app/streams/${channelId}.m3u8`;
        const iframeUrl = `https://media-plus.app/embed/channel/${channelId}`;
        
        setBroadcasts(prev => ({
          ...prev,
          [channelId]: {
            channelId,
            status: 'live',
            hlsUrl,
            iframeUrl,
          }
        }));

        toast({
          title: 'Diffusion démarrée',
          description: `La chaîne ${channelId} est maintenant en direct`,
        });
      } else {
        throw new Error(data.error || 'Erreur inconnue');
      }
    } catch (error: any) {
      console.error('Error starting broadcast:', error);
      setBroadcasts(prev => ({
        ...prev,
        [channelId]: { ...prev[channelId], status: 'idle' }
      }));
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de démarrer la diffusion',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const stopBroadcast = async (channelId: string) => {
    setIsLoading(true);
    setBroadcasts(prev => ({
      ...prev,
      [channelId]: { ...prev[channelId], status: 'stopping' }
    }));

    try {
      const { data, error } = await supabase.functions.invoke('ffmpeg-stop', {
        body: { channelId }
      });

      if (error) throw error;

      if (data.success) {
        setBroadcasts(prev => ({
          ...prev,
          [channelId]: { channelId, status: 'stopped' }
        }));

        toast({
          title: 'Diffusion arrêtée',
          description: `La chaîne ${channelId} a été arrêtée`,
        });
      } else {
        throw new Error(data.error || 'Erreur inconnue');
      }
    } catch (error: any) {
      console.error('Error stopping broadcast:', error);
      setBroadcasts(prev => ({
        ...prev,
        [channelId]: { ...prev[channelId], status: 'live' }
      }));
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible d\'arrêter la diffusion',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatus = async (channelId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('ffmpeg-status', {
        body: { channelId }
      });

      if (error) throw error;

      if (data.success) {
        setBroadcasts(prev => ({
          ...prev,
          [channelId]: {
            channelId,
            status: data.status === 'live' ? 'live' : 'stopped',
            hlsUrl: data.hlsUrl,
            iframeUrl: data.iframeUrl,
            duration: data.duration,
            source: data.source,
          }
        }));
      }
    } catch (error: any) {
      console.error('Error getting status:', error);
    }
  };

  const configureTransmission = async (channelId: string, protocol: string, url: string) => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ffmpeg-transmit', {
        body: { channelId, protocol, url }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: 'Transmission configurée',
          description: `La transmission ${protocol.toUpperCase()} a été configurée`,
        });
      } else {
        throw new Error(data.error || 'Erreur inconnue');
      }
    } catch (error: any) {
      console.error('Error configuring transmission:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de configurer la transmission',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    broadcasts,
    isLoading,
    startBroadcast,
    stopBroadcast,
    getStatus,
    configureTransmission,
  };
};
