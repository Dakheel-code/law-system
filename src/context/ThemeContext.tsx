import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  applyTheme,
  defaultTheme,
  STORAGE_KEY,
  type ThemeSettings,
} from "../lib/themes";

type Ctx = {
  theme: ThemeSettings;
  setTheme: (s: ThemeSettings) => void;
  update: <K extends keyof ThemeSettings>(key: K, value: ThemeSettings[K]) => void;
  reset: () => void;
};

const ThemeContext = createContext<Ctx | undefined>(undefined);

function loadFromStorage(): ThemeSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultTheme;
    const parsed = JSON.parse(raw) as Partial<ThemeSettings>;
    return { ...defaultTheme, ...parsed };
  } catch {
    return defaultTheme;
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeSettings>(loadFromStorage);

  // Apply theme on mount and on every change
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Listen for system color-scheme changes when mode === "system"
  useEffect(() => {
    if (theme.mode !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme(theme);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  const setTheme = (s: ThemeSettings) => {
    setThemeState(s);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    } catch {
      // ignore — quota or privacy mode
    }
  };

  const update = <K extends keyof ThemeSettings>(key: K, value: ThemeSettings[K]) => {
    setTheme({ ...theme, [key]: value });
  };

  const reset = () => setTheme(defaultTheme);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, update, reset }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
