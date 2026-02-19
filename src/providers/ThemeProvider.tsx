import React, { useEffect } from "react";

const THEME_STORAGE_KEY = "theme_mode";

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    const resolved = stored === "light" || stored === "dark" ? stored : "dark";
    document.documentElement.classList.toggle("dark", resolved === "dark");
  }, []);

  return <>{children}</>;
};
