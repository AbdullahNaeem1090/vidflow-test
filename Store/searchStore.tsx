import { myAxios } from "@/lib/axios";
import { create } from "zustand";

type VideoSuggestion = {
  _id: string;
  type: "video";
  title: string;
  thumbnail: string;
  views: number;
  owner: {
    _id: string;
    username: string;
    avatar: string;
  };
};

type UserSuggestion = {
  _id: string;
  type: "user";
  username: string;
  avatar: string;
};

type SearchSuggestions = {
  videos: VideoSuggestion[];
  users: UserSuggestion[];
};

type SearchResult = {
  query: string;
  videos: VideoSuggestion[];
  users: UserSuggestion[];
  totalVideos: number;
  totalUsers: number;
  currentPage: number;
  totalPages: number;
};

type SearchStore = {
  suggestions: SearchSuggestions;
  searchResults: SearchResult | null;
  isLoadingSuggestions: boolean;
  isSearching: boolean;
  
  getSuggestions: (query: string) => Promise<void>;
  search: (query: string, type?: "all" | "videos" | "users", page?: number) => Promise<void>;
  clearSuggestions: () => void;
  clearSearchResults: () => void;
};

export const useSearchStore = create<SearchStore>((set) => ({
  suggestions: { videos: [], users: [] },
  searchResults: null,
  isLoadingSuggestions: false,
  isSearching: false,

  getSuggestions: async (query: string) => {
    if (!query || query.trim().length < 2) {
      set({ suggestions: { videos: [], users: [] } });
      return;
    }

    try {
      set({ isLoadingSuggestions: true });

      const { data } = await myAxios.get(`/video/suggestions`, {
        params: { query: query.trim() },
      });

      if (data.success) {
        set({ suggestions: data.suggestions });
      }
    } catch (error) {
      console.error("Failed to fetch suggestions:", error);
      set({ suggestions: { videos: [], users: [] } });
    } finally {
      set({ isLoadingSuggestions: false });
    }
  },

  search: async (query: string, type = "all", page = 1) => {
    if (!query || query.trim().length === 0) {
      set({ searchResults: null });
      return;
    }

    try {
      set({ isSearching: true });

      const { data } = await myAxios.get(`/video/search`, {
        params: { query: query.trim(), type, page },
      });

      if (data.success) {
        set({ searchResults: data });
      }
    } catch (error) {
      console.error("Search failed:", error);
      set({ searchResults: null });
    } finally {
      set({ isSearching: false });
    }
  },

  clearSuggestions: () => set({ suggestions: { videos: [], users: [] } }),
  clearSearchResults: () => set({ searchResults: null }),
}));