import { create } from 'zustand';

interface POSState {
  currentCategory: string | null;
  searchQuery: string;
  setCategory: (category: string | null) => void;
  setSearchQuery: (query: string) => void;
}

export const usePOSStore = create<POSState>((set) => ({
  currentCategory: null,
  searchQuery: '',
  setCategory: (category: string | null) => set({ currentCategory: category }),
  setSearchQuery: (query: string) => set({ searchQuery: query }),
}));
