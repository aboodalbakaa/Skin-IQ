import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface FavoriteItem {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  is_out_of_stock?: boolean;
}

interface FavoritesStore {
  items: FavoriteItem[];
  isOpen: boolean;
  toggleFavorite: (item: FavoriteItem) => void;
  removeFavorite: (id: string) => void;
  clearFavorites: () => void;
  openFavorites: () => void;
  closeFavorites: () => void;
}

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      
      toggleFavorite: (item) =>
        set((state) => {
          const exists = state.items.some((i) => i.id === item.id);
          if (exists) {
            return { items: state.items.filter((i) => i.id !== item.id) };
          }
          return { items: [...state.items, item] };
        }),

      removeFavorite: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

      clearFavorites: () => set({ items: [] }),
      openFavorites: () => set({ isOpen: true }),
      closeFavorites: () => set({ isOpen: false }),
    }),
    {
      name: 'skiniq-favorites-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
