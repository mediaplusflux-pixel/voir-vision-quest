import { createContext, useContext, useState, ReactNode } from "react";

interface PlaylistItem {
  id: string;
  title: string;
  duration: number | null;
  file_path: string;
  thumbnail: string | null;
}

interface PlaylistContextType {
  playlist: PlaylistItem[];
  addToPlaylist: (item: PlaylistItem) => void;
  removeFromPlaylist: (id: string) => void;
  clearPlaylist: () => void;
  playlistMode: "loop" | "manual";
  setPlaylistMode: (mode: "loop" | "manual") => void;
}

const PlaylistContext = createContext<PlaylistContextType | undefined>(undefined);

export const PlaylistProvider = ({ children }: { children: ReactNode }) => {
  const [playlist, setPlaylist] = useState<PlaylistItem[]>([]);
  const [playlistMode, setPlaylistMode] = useState<"loop" | "manual">("loop");

  const addToPlaylist = (item: PlaylistItem) => {
    if (playlist.length >= 20) {
      return; // Max 20 items
    }
    if (!playlist.find((p) => p.id === item.id)) {
      setPlaylist([...playlist, item]);
    }
  };

  const removeFromPlaylist = (id: string) => {
    setPlaylist(playlist.filter((item) => item.id !== id));
  };

  const clearPlaylist = () => {
    setPlaylist([]);
  };

  return (
    <PlaylistContext.Provider
      value={{
        playlist,
        addToPlaylist,
        removeFromPlaylist,
        clearPlaylist,
        playlistMode,
        setPlaylistMode,
      }}
    >
      {children}
    </PlaylistContext.Provider>
  );
};

export const usePlaylist = () => {
  const context = useContext(PlaylistContext);
  if (!context) {
    throw new Error("usePlaylist must be used within PlaylistProvider");
  }
  return context;
};
