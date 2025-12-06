import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BroadcastState {
  status: 'idle' | 'starting' | 'live' | 'stopping' | 'stopped';
  hlsUrl?: string;
  playerUrl?: string;
  iframeCode?: string;
  ipHttpUrl?: string;
  viewers?: number;
  duration?: string;
  bitrate?: string;
  streamId?: string;
}

export const useChannelBroadcast = () => {
  const [broadcast, setBroadcast] = useState<BroadcastState>({ status: 'idle' });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const startBroadcast = async () => {
    setIsLoading(true);
    setBroadcast(prev => ({ ...prev, status: 'starting' }));

    try {
      const { data, error } = await supabase.functions.invoke('ffmpeg-start', {
        body: { 
          channelId: 'main',
          source: 'playlist'
        }
      });

      if (error) throw error;

      if (data.success) {
        console.log('[useChannelBroadcast] Broadcast started, received data:', data);
        setBroadcast({
          status: 'live',
          hlsUrl: data.hlsUrl || '',
          playerUrl: data.playerUrl || '',
          iframeCode: data.iframeCode || '',
          ipHttpUrl: data.ipHttpUrl || '',
          streamId: data.streamId,
          viewers: 0,
          duration: '00:00:00',
          bitrate: '0',
        });

        toast({
          title: 'Diffusion démarrée',
          description: 'Votre chaîne est maintenant en direct',
        });
      } else {
        throw new Error(data.error || 'Erreur lors du démarrage');
      }
    } catch (error: any) {
      console.error('Error starting broadcast:', error);
      setBroadcast({ status: 'idle' });
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de démarrer la diffusion',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const stopBroadcast = async () => {
    setIsLoading(true);
    setBroadcast(prev => ({ ...prev, status: 'stopping' }));

    try {
      const { data, error } = await supabase.functions.invoke('ffmpeg-stop', {
        body: { streamId: broadcast.streamId }
      });

      if (error) throw error;

      if (data.success) {
        setBroadcast({ status: 'stopped' });
        toast({
          title: 'Diffusion arrêtée',
          description: 'Votre chaîne a été mise hors ligne',
        });
      } else {
        throw new Error(data.error || 'Erreur lors de l\'arrêt');
      }
    } catch (error: any) {
      console.error('Error stopping broadcast:', error);
      setBroadcast(prev => ({ ...prev, status: 'live' }));
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible d\'arrêter la diffusion',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Poll for status updates when live
  useEffect(() => {
    if (broadcast.status !== 'live' || !broadcast.streamId) return;

    const interval = setInterval(async () => {
      try {
        const { data } = await supabase.functions.invoke('ffmpeg-status', {
          body: { streamId: broadcast.streamId }
        });

        if (data?.success && data.status) {
          setBroadcast(prev => ({
            ...prev,
            viewers: data.viewers || prev.viewers,
            duration: data.duration || prev.duration,
            bitrate: data.bitrate || prev.bitrate,
          }));
        }
      } catch (error) {
        console.error('Error polling status:', error);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [broadcast.status, broadcast.streamId]);

  return {
    broadcast,
    isLoading,
    startBroadcast,
    stopBroadcast,
  };
};