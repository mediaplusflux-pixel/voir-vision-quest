import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Json } from '@/integrations/supabase/types';

interface MediaItem {
  id: string;
  title: string;
  duration: number | null;
  file_path: string;
  thumbnail: string | null;
}

interface SavedPlaylist {
  id: string;
  name: string;
  items: MediaItem[];
  createdAt: string;
}

interface PlaylistContextType {
  playlist: MediaItem[];
  currentIndex: number;
  isPlaying: boolean;
  isActive: boolean;
  playMode: 'loop' | 'manual';
  savedPlaylists: SavedPlaylist[];
  addToPlaylist: (item: MediaItem) => void;
  removeFromPlaylist: (id: string) => void;
  setCurrentIndex: (index: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setPlayMode: (mode: 'loop' | 'manual') => void;
  clearPlaylist: () => void;
  reorderPlaylist: (fromIndex: number, toIndex: number) => void;
  activatePlaylist: () => void;
  stopPlaylist: () => void;
  savePlaylist: (name: string) => void;
  loadPlaylist: (id: string) => void;
  deleteSavedPlaylist: (id: string) => void;
  loadActivePlaylistFromDB: () => Promise<void>;
}

const PlaylistContext = createContext<PlaylistContextType | undefined>(undefined);

const STORAGE_KEY = 'holos_playlist_state';
const SAVED_PLAYLISTS_KEY = 'holos_saved_playlists';

// Helper function to convert MediaItem[] to Json
const mediaItemsToJson = (items: MediaItem[]): Json => {
  return items.map(item => ({
    id: item.id,
    title: item.title,
    duration: item.duration,
    file_path: item.file_path,
    thumbnail: item.thumbnail
  })) as Json;
};

// Helper function to convert Json to MediaItem[]
const jsonToMediaItems = (json: Json | null): MediaItem[] => {
  if (!json || !Array.isArray(json)) return [];
  return json.map((item: any) => ({
    id: item.id || '',
    title: item.title || '',
    duration: item.duration || null,
    file_path: item.file_path || '',
    thumbnail: item.thumbnail || null
  }));
};

export const PlaylistProvider = ({ children }: { children: ReactNode }) => {
  const [playlist, setPlaylist] = useState<MediaItem[]>([]);
  const [currentIndex, setCurrentIndexState] = useState(0);
  const [isPlaying, setIsPlayingState] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [playMode, setPlayModeState] = useState<'loop' | 'manual'>('loop');
  const [savedPlaylists, setSavedPlaylists] = useState<SavedPlaylist[]>([]);
  const [activePlaylistId, setActivePlaylistId] = useState<string | null>(null);
  const { user } = useAuth();

  // Load state from localStorage on mount (for non-authenticated users)
  useEffect(() => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        setPlaylist(parsed.playlist || []);
        setCurrentIndexState(parsed.currentIndex || 0);
        setIsPlayingState(parsed.isPlaying || false);
        setIsActive(parsed.isActive || false);
        setPlayModeState(parsed.playMode || 'loop');
      } catch (e) {
        console.error('Failed to parse playlist state:', e);
      }
    }

    const savedPlaylistsData = localStorage.getItem(SAVED_PLAYLISTS_KEY);
    if (savedPlaylistsData) {
      try {
        setSavedPlaylists(JSON.parse(savedPlaylistsData));
      } catch (e) {
        console.error('Failed to parse saved playlists:', e);
      }
    }
  }, []);

  // Load active playlist from database when user logs in
  useEffect(() => {
    if (user) {
      loadActivePlaylistFromDB();
    }
  }, [user]);

  // Subscribe to realtime updates for active playlist
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('active-playlist-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'active_playlists',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            const data = payload.new as any;
            setPlaylist(jsonToMediaItems(data.items));
            setCurrentIndexState(data.current_index || 0);
            setIsPlayingState(data.is_playing || false);
            setIsActive(data.is_playing || false);
            setPlayModeState(data.play_mode || 'loop');
            setActivePlaylistId(data.id);
          } else if (payload.eventType === 'DELETE') {
            setIsActive(false);
            setIsPlayingState(false);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Persist state to localStorage whenever it changes
  useEffect(() => {
    const state = { playlist, currentIndex, isPlaying, isActive, playMode };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [playlist, currentIndex, isPlaying, isActive, playMode]);

  // Sync active playlist to database
  const syncToDatabase = async (updates: {
    items?: MediaItem[];
    current_index?: number;
    is_playing?: boolean;
    play_mode?: string;
    name?: string;
  }) => {
    if (!user || !activePlaylistId) return;

    try {
      const dbUpdates: Record<string, any> = {
        updated_at: new Date().toISOString()
      };
      
      if (updates.items !== undefined) {
        dbUpdates.items = mediaItemsToJson(updates.items);
      }
      if (updates.current_index !== undefined) {
        dbUpdates.current_index = updates.current_index;
      }
      if (updates.is_playing !== undefined) {
        dbUpdates.is_playing = updates.is_playing;
      }
      if (updates.play_mode !== undefined) {
        dbUpdates.play_mode = updates.play_mode;
      }
      if (updates.name !== undefined) {
        dbUpdates.name = updates.name;
      }

      await supabase
        .from('active_playlists')
        .update(dbUpdates)
        .eq('id', activePlaylistId);
    } catch (error) {
      console.error('Error syncing playlist to database:', error);
    }
  };

  const loadActivePlaylistFromDB = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('active_playlists')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_playing', true)
        .maybeSingle();

      if (error) {
        console.error('Error loading active playlist:', error);
        return;
      }

      if (data) {
        setPlaylist(jsonToMediaItems(data.items));
        setCurrentIndexState(data.current_index || 0);
        setIsPlayingState(data.is_playing || false);
        setIsActive(data.is_playing || false);
        setPlayModeState((data.play_mode as 'loop' | 'manual') || 'loop');
        setActivePlaylistId(data.id);
      }
    } catch (error) {
      console.error('Error loading active playlist:', error);
    }
  };

  const addToPlaylist = (item: MediaItem) => {
    if (playlist.length >= 20) {
      return;
    }
    const newPlaylist = [...playlist, item];
    setPlaylist(newPlaylist);
    if (isActive) {
      syncToDatabase({ items: newPlaylist });
    }
  };

  const removeFromPlaylist = (id: string) => {
    const newPlaylist = playlist.filter(item => item.id !== id);
    setPlaylist(newPlaylist);
    if (isActive) {
      syncToDatabase({ items: newPlaylist });
    }
  };

  const setCurrentIndex = (index: number) => {
    setCurrentIndexState(index);
    if (isActive) {
      syncToDatabase({ current_index: index });
    }
  };

  const setIsPlaying = (playing: boolean) => {
    setIsPlayingState(playing);
    if (isActive) {
      syncToDatabase({ is_playing: playing });
    }
  };

  const setPlayMode = (mode: 'loop' | 'manual') => {
    setPlayModeState(mode);
    if (isActive) {
      syncToDatabase({ play_mode: mode });
    }
  };

  const clearPlaylist = () => {
    setPlaylist([]);
    setCurrentIndexState(0);
    setIsPlayingState(false);
    setIsActive(false);
    if (activePlaylistId && user) {
      supabase
        .from('active_playlists')
        .delete()
        .eq('id', activePlaylistId)
        .then(() => setActivePlaylistId(null));
    }
  };

  const reorderPlaylist = (fromIndex: number, toIndex: number) => {
    const newPlaylist = [...playlist];
    const [removed] = newPlaylist.splice(fromIndex, 1);
    newPlaylist.splice(toIndex, 0, removed);
    setPlaylist(newPlaylist);
    if (isActive) {
      syncToDatabase({ items: newPlaylist });
    }
  };

  const activatePlaylist = async () => {
    if (playlist.length > 0) {
      setIsActive(true);
      setIsPlayingState(true);
      
      if (user) {
        try {
          // Check if there's an existing active playlist
          const { data: existing } = await supabase
            .from('active_playlists')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle();

          if (existing) {
            // Update existing
            await supabase
              .from('active_playlists')
              .update({
                items: mediaItemsToJson(playlist),
                current_index: currentIndex,
                is_playing: true,
                play_mode: playMode,
                updated_at: new Date().toISOString()
              })
              .eq('id', existing.id);
            setActivePlaylistId(existing.id);
          } else {
            // Create new
            const { data, error } = await supabase
              .from('active_playlists')
              .insert({
                user_id: user.id,
                items: mediaItemsToJson(playlist),
                current_index: currentIndex,
                is_playing: true,
                play_mode: playMode,
                name: 'Playlist active'
              })
              .select('id')
              .single();

            if (!error && data) {
              setActivePlaylistId(data.id);
            }
          }
        } catch (error) {
          console.error('Error activating playlist in database:', error);
        }
      }
    }
  };

  const stopPlaylist = async () => {
    setIsActive(false);
    setIsPlayingState(false);
    
    if (activePlaylistId && user) {
      await syncToDatabase({ is_playing: false });
    }
  };

  const savePlaylist = async (name: string) => {
    if (playlist.length === 0) return;
    
    const newSavedPlaylist: SavedPlaylist = {
      id: crypto.randomUUID(),
      name,
      items: [...playlist],
      createdAt: new Date().toISOString(),
    };
    
    const updated = [...savedPlaylists, newSavedPlaylist];
    setSavedPlaylists(updated);
    localStorage.setItem(SAVED_PLAYLISTS_KEY, JSON.stringify(updated));

    // Also save to database for persistence across sessions
    if (user) {
      try {
        await supabase
          .from('active_playlists')
          .insert({
            user_id: user.id,
            name,
            items: mediaItemsToJson(playlist),
            current_index: currentIndex,
            is_playing: isActive,
            play_mode: playMode
          });
      } catch (error) {
        console.error('Error saving playlist to database:', error);
      }
    }
  };

  const loadPlaylist = (id: string) => {
    const found = savedPlaylists.find(p => p.id === id);
    if (found) {
      setPlaylist(found.items);
      setCurrentIndexState(0);
    }
  };

  const deleteSavedPlaylist = (id: string) => {
    const updated = savedPlaylists.filter(p => p.id !== id);
    setSavedPlaylists(updated);
    localStorage.setItem(SAVED_PLAYLISTS_KEY, JSON.stringify(updated));
  };

  return (
    <PlaylistContext.Provider
      value={{
        playlist,
        currentIndex,
        isPlaying,
        isActive,
        playMode,
        savedPlaylists,
        addToPlaylist,
        removeFromPlaylist,
        setCurrentIndex,
        setIsPlaying,
        setPlayMode,
        clearPlaylist,
        reorderPlaylist,
        activatePlaylist,
        stopPlaylist,
        savePlaylist,
        loadPlaylist,
        deleteSavedPlaylist,
        loadActivePlaylistFromDB,
      }}
    >
      {children}
    </PlaylistContext.Provider>
  );
};

export const usePlaylist = () => {
  const context = useContext(PlaylistContext);
  if (context === undefined) {
    throw new Error('usePlaylist must be used within a PlaylistProvider');
  }
  return context;
};
