import { create } from "zustand";
import { persist } from "zustand/middleware";
type Theme = "light" | "dark" | "system";
export const usePreferences = create<{
  theme: Theme;
  setTheme: (theme: Theme) => void;
}>()(
  persist((set) => ({ theme: "system", setTheme: (theme) => set({ theme }) }), {
    name: "peopleos-preferences",
  }),
);
