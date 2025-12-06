import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
}

const PlaylistContext = createContext<PlaylistContextType | undefined>(undefined);

const STORAGE_KEY = 'holos_playlist_state';
const SAVED_PLAYLISTS_KEY = 'holos_saved_playlists';

export const PlaylistProvider = ({ children }: { children: ReactNode }) => {
  const [playlist, setPlaylist] = useState<MediaItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [playMode, setPlayMode] = useState<'loop' | 'manual'>('loop');
  const [savedPlaylists, setSavedPlaylists] = useState<SavedPlaylist[]>([]);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        setPlaylist(parsed.playlist || []);
        setCurrentIndex(parsed.currentIndex || 0);
        setIsPlaying(parsed.isPlaying || false);
        setIsActive(parsed.isActive || false);
        setPlayMode(parsed.playMode || 'loop');
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

  // Persist state to localStorage whenever it changes
  useEffect(() => {
    const state = { playlist, currentIndex, isPlaying, isActive, playMode };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [playlist, currentIndex, isPlaying, isActive, playMode]);

  // Auto-advance to next video when active and in loop mode
  useEffect(() => {
    if (isActive && isPlaying && playMode === 'loop' && playlist.length > 0) {
      // This will be triggered by video end events
    }
  }, [isActive, isPlaying, playMode, playlist]);

  const addToPlaylist = (item: MediaItem) => {
    if (playlist.length >= 20) {
      return;
    }
    setPlaylist(prev => [...prev, item]);
  };

  const removeFromPlaylist = (id: string) => {
    setPlaylist(prev => prev.filter(item => item.id !== id));
  };

  const clearPlaylist = () => {
    setPlaylist([]);
    setCurrentIndex(0);
    setIsPlaying(false);
    setIsActive(false);
  };

  const reorderPlaylist = (fromIndex: number, toIndex: number) => {
    setPlaylist(prev => {
      const newPlaylist = [...prev];
      const [removed] = newPlaylist.splice(fromIndex, 1);
      newPlaylist.splice(toIndex, 0, removed);
      return newPlaylist;
    });
  };

  const activatePlaylist = () => {
    if (playlist.length > 0) {
      setIsActive(true);
      setIsPlaying(true);
    }
  };

  const stopPlaylist = () => {
    setIsActive(false);
    setIsPlaying(false);
  };

  const savePlaylist = (name: string) => {
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
  };

  const loadPlaylist = (id: string) => {
    const found = savedPlaylists.find(p => p.id === id);
    if (found) {
      setPlaylist(found.items);
      setCurrentIndex(0);
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
