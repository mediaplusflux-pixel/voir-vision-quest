import React, { createContext, useContext, useState, ReactNode } from 'react';

interface MediaItem {
  id: string;
  title: string;
  duration: number | null;
  file_path: string;
  thumbnail: string | null;
}

interface PlaylistContextType {
  playlist: MediaItem[];
  currentIndex: number;
  isPlaying: boolean;
  playMode: 'loop' | 'manual';
  addToPlaylist: (item: MediaItem) => void;
  removeFromPlaylist: (id: string) => void;
  setCurrentIndex: (index: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setPlayMode: (mode: 'loop' | 'manual') => void;
  clearPlaylist: () => void;
  reorderPlaylist: (fromIndex: number, toIndex: number) => void;
}

const PlaylistContext = createContext<PlaylistContextType | undefined>(undefined);

export const PlaylistProvider = ({ children }: { children: ReactNode }) => {
  const [playlist, setPlaylist] = useState<MediaItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playMode, setPlayMode] = useState<'loop' | 'manual'>('loop');

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
  };

  const reorderPlaylist = (fromIndex: number, toIndex: number) => {
    setPlaylist(prev => {
      const newPlaylist = [...prev];
      const [removed] = newPlaylist.splice(fromIndex, 1);
      newPlaylist.splice(toIndex, 0, removed);
      return newPlaylist;
    });
  };

  return (
    <PlaylistContext.Provider
      value={{
        playlist,
        currentIndex,
        isPlaying,
        playMode,
        addToPlaylist,
        removeFromPlaylist,
        setCurrentIndex,
        setIsPlaying,
        setPlayMode,
        clearPlaylist,
        reorderPlaylist,
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
