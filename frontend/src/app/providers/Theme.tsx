import { useEffect } from "react";
import { usePreferences } from "../../stores/preferences";

export function Theme() {
  const theme = usePreferences((state) => state.theme);
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      document.documentElement.dataset.theme =
        theme === "system" ? (media.matches ? "dark" : "light") : theme;
    };
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [theme]);
  return null;
}
