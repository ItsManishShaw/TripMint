import { create } from "zustand";
import { persist } from "zustand/middleware";

type AppState = {
  apiBase: string;
  cartId?: string;
  selectedFlightId?: string;
  authToken?: string;
  user?: { id: string; email: string; name?: string | null };
  setCart: (cartId: string, flightId: string) => void;
  clearCart: () => void;
  setAuth: (token: string, user: { id: string; email: string; name?: string | null }) => void;
  clearAuth: () => void;
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      apiBase: process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:4000",
      cartId: undefined,
      selectedFlightId: undefined,
      authToken: undefined,
      user: undefined,
      setCart: (cartId, flightId) => set({ cartId, selectedFlightId: flightId }),
      clearCart: () => set({ cartId: undefined, selectedFlightId: undefined }),
      setAuth: (authToken, user) => set({ authToken, user }),
      clearAuth: () => set({ authToken: undefined, user: undefined }),
    }),
    { name: "travel-mvp" },
  ),
);
