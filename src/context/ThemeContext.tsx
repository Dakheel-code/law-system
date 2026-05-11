import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  applyTheme,
  defaultTheme,
  type ThemeSettings,
  type ThemeKey,
  type ModeKey,
  type FontKey,
} from "../lib/themes";
import { supabase } from "../lib/supabase";

type Ctx = {
  theme: ThemeSettings;
  setTheme: (s: ThemeSettings) => void;
  update: <K extends keyof ThemeSettings>(key: K, value: ThemeSettings[K]) => void;
  reset: () => void;
};

const ThemeContext = createContext<Ctx | undefined>(undefined);

type SettingsRow = {
  id: string;
  office_name: string | null;
  short_name: string | null;
  logo_data_url: string | null;
  theme_color: string | null;
  theme_mode: string | null;
  font_family: string | null;
  sidebar_position: string | null;
  sidebar_collapsed: boolean | null;
  compact_mode: boolean | null;
  custom_primary: string | null;
  custom_accent: string | null;
};

function fromRow(row: SettingsRow): ThemeSettings {
  return {
    color: (row.theme_color as ThemeKey) ?? defaultTheme.color,
    mode: (row.theme_mode as ModeKey) ?? defaultTheme.mode,
    font: (row.font_family as FontKey) ?? defaultTheme.font,
    sidebarPosition:
      (row.sidebar_position as ThemeSettings["sidebarPosition"]) ?? "right",
    sidebarCollapsed: row.sidebar_collapsed ?? false,
    compactMode: row.compact_mode ?? false,
    officeName: row.office_name ?? defaultTheme.officeName,
    shortName: row.short_name ?? defaultTheme.shortName,
    logoDataUrl: row.logo_data_url,
    customPrimary: row.custom_primary,
    customAccent: row.custom_accent,
  };
}

function toUpdatePayload(t: ThemeSettings): Record<string, unknown> {
  return {
    theme_color: t.color,
    theme_mode: t.mode,
    font_family: t.font,
    sidebar_position: t.sidebarPosition,
    sidebar_collapsed: t.sidebarCollapsed,
    compact_mode: t.compactMode,
    office_name: t.officeName,
    short_name: t.shortName,
    logo_data_url: t.logoDataUrl,
    custom_primary: t.customPrimary ?? null,
    custom_accent: t.customAccent ?? null,
  };
}

const THEME_CACHE_KEY = "theme-cache-v1";

function loadCachedTheme(): ThemeSettings {
  try {
    const raw = localStorage.getItem(THEME_CACHE_KEY);
    if (!raw) return defaultTheme;
    const parsed = JSON.parse(raw) as Partial<ThemeSettings>;
    // Merge with defaults so any newly-added fields still get a value.
    return { ...defaultTheme, ...parsed };
  } catch {
    return defaultTheme;
  }
}

// Apply the cached theme synchronously at module import time, BEFORE React
// renders. This is what kills the FOUC — when the very first paint happens,
// the CSS variables already hold the user's chosen brand color.
if (typeof window !== "undefined") {
  try {
    applyTheme(loadCachedTheme());
  } catch {
    /* non-fatal */
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Initialize state from the cache too so React's first render matches.
  const [theme, setThemeState] = useState<ThemeSettings>(() => loadCachedTheme());
  const settingsRowId = useRef<string | null>(null);
  const skipNextSave = useRef(true);

  // Apply theme + persist to cache on every change. The cache is what we
  // read on the next page load to avoid the green-then-gold flash.
  useEffect(() => {
    applyTheme(theme);
    try {
      localStorage.setItem(THEME_CACHE_KEY, JSON.stringify(theme));
    } catch {
      /* localStorage may be full or disabled — non-fatal */
    }
  }, [theme]);

  // Load settings from Supabase on mount + subscribe to changes
  useEffect(() => {
    const sb = supabase;
    if (!sb) return;

    let cancelled = false;
    (async () => {
      const { data } = await sb
        .from("office_settings")
        .select("*")
        .limit(1)
        .maybeSingle();
      if (cancelled || !data) return;
      settingsRowId.current = (data as SettingsRow).id;
      const remote = fromRow(data as SettingsRow);
      skipNextSave.current = true;
      setThemeState(remote);
    })();

    const channel = sb
      .channel(`office-settings-${crypto.randomUUID()}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "office_settings" },
        (payload) => {
          if (payload.new) {
            settingsRowId.current = (payload.new as SettingsRow).id;
            skipNextSave.current = true;
            setThemeState(fromRow(payload.new as SettingsRow));
          }
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      sb.removeChannel(channel);
    };
  }, []);

  // Save to Supabase whenever theme changes (debounced via ref skip)
  useEffect(() => {
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    const sb = supabase;
    if (!sb || !settingsRowId.current) return;

    const t = setTimeout(() => {
      sb.from("office_settings")
        .update(toUpdatePayload(theme))
        .eq("id", settingsRowId.current)
        .then(({ error }) => {
          if (error) console.error("save settings", error);
        });
    }, 500);
    return () => clearTimeout(t);
  }, [theme]);

  // System color-scheme changes
  useEffect(() => {
    if (theme.mode !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme(theme);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  const setTheme = (s: ThemeSettings) => {
    setThemeState(s);
  };

  const update = <K extends keyof ThemeSettings>(key: K, value: ThemeSettings[K]) => {
    setThemeState((prev) => ({ ...prev, [key]: value }));
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
