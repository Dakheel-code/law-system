// Color themes — values as space-separated RGB for use with CSS rgb()/Tailwind opacity
// Reference: Tailwind CSS default palette

export type ThemeKey =
  | "teal"
  | "blue"
  | "purple"
  | "rose"
  | "amber"
  | "emerald"
  | "slate"
  | "indigo";

type Shade =
  | "50"
  | "100"
  | "200"
  | "300"
  | "400"
  | "500"
  | "600"
  | "700"
  | "800"
  | "900";

export const colorThemes: { key: ThemeKey; name: string; preview: string }[] = [
  { key: "teal", name: "أخضر مزرق", preview: "#1e9a8a" },
  { key: "blue", name: "أزرق", preview: "#3b82f6" },
  { key: "purple", name: "بنفسجي", preview: "#8b5cf6" },
  { key: "rose", name: "وردي", preview: "#f43f5e" },
  { key: "amber", name: "عسلي", preview: "#f59e0b" },
  { key: "emerald", name: "أخضر", preview: "#10b981" },
  { key: "slate", name: "رمادي", preview: "#475569" },
  { key: "indigo", name: "نيلي", preview: "#6366f1" },
];

export const themes: Record<ThemeKey, Record<Shade, string>> = {
  teal: {
    "50": "236 250 247",
    "100": "207 242 235",
    "200": "163 229 216",
    "300": "110 209 191",
    "400": "62 184 163",
    "500": "30 154 138",
    "600": "23 124 112",
    "700": "19 99 90",
    "800": "17 78 72",
    "900": "15 65 60",
  },
  blue: {
    "50": "239 246 255",
    "100": "219 234 254",
    "200": "191 219 254",
    "300": "147 197 253",
    "400": "96 165 250",
    "500": "59 130 246",
    "600": "37 99 235",
    "700": "29 78 216",
    "800": "30 64 175",
    "900": "30 58 138",
  },
  purple: {
    "50": "245 243 255",
    "100": "237 233 254",
    "200": "221 214 254",
    "300": "196 181 253",
    "400": "167 139 250",
    "500": "139 92 246",
    "600": "124 58 237",
    "700": "109 40 217",
    "800": "91 33 182",
    "900": "76 29 149",
  },
  rose: {
    "50": "255 241 242",
    "100": "255 228 230",
    "200": "254 205 211",
    "300": "253 164 175",
    "400": "251 113 133",
    "500": "244 63 94",
    "600": "225 29 72",
    "700": "190 18 60",
    "800": "159 18 57",
    "900": "136 19 55",
  },
  amber: {
    "50": "255 251 235",
    "100": "254 243 199",
    "200": "253 230 138",
    "300": "252 211 77",
    "400": "251 191 36",
    "500": "245 158 11",
    "600": "217 119 6",
    "700": "180 83 9",
    "800": "146 64 14",
    "900": "120 53 15",
  },
  emerald: {
    "50": "236 253 245",
    "100": "209 250 229",
    "200": "167 243 208",
    "300": "110 231 183",
    "400": "52 211 153",
    "500": "16 185 129",
    "600": "5 150 105",
    "700": "4 120 87",
    "800": "6 95 70",
    "900": "6 78 59",
  },
  slate: {
    "50": "248 250 252",
    "100": "241 245 249",
    "200": "226 232 240",
    "300": "203 213 225",
    "400": "148 163 184",
    "500": "100 116 139",
    "600": "71 85 105",
    "700": "51 65 85",
    "800": "30 41 59",
    "900": "15 23 42",
  },
  indigo: {
    "50": "238 242 255",
    "100": "224 231 255",
    "200": "199 210 254",
    "300": "165 180 252",
    "400": "129 140 248",
    "500": "99 102 241",
    "600": "79 70 229",
    "700": "67 56 202",
    "800": "55 48 163",
    "900": "49 46 129",
  },
};

export type ModeKey = "light" | "dark" | "system";
export type FontKey = "tajawal" | "cairo" | "ibm" | "noto";

export const fonts: { key: FontKey; name: string; family: string; googleHref: string }[] = [
  {
    key: "tajawal",
    name: "Tajawal",
    family: "'Tajawal', system-ui, sans-serif",
    googleHref: "https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800&display=swap",
  },
  {
    key: "cairo",
    name: "Cairo",
    family: "'Cairo', system-ui, sans-serif",
    googleHref: "https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;700;800&display=swap",
  },
  {
    key: "ibm",
    name: "IBM Plex Sans Arabic",
    family: "'IBM Plex Sans Arabic', system-ui, sans-serif",
    googleHref:
      "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;700&display=swap",
  },
  {
    key: "noto",
    name: "Noto Sans Arabic",
    family: "'Noto Sans Arabic', system-ui, sans-serif",
    googleHref:
      "https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@300;400;500;700;800&display=swap",
  },
];

export type ThemeSettings = {
  color: ThemeKey;
  mode: ModeKey;
  font: FontKey;
  sidebarPosition: "right" | "left";
  sidebarCollapsed: boolean;
  compactMode: boolean;
  officeName: string;
  shortName: string;
};

export const defaultTheme: ThemeSettings = {
  color: "teal",
  mode: "light",
  font: "tajawal",
  sidebarPosition: "right",
  sidebarCollapsed: false,
  compactMode: false,
  officeName: "شركة ناصر طريد للمحاماة",
  shortName: "ناصر طريد",
};

export const STORAGE_KEY = "law-system-theme";

const loadedFonts = new Set<FontKey>(["tajawal"]); // tajawal already in index.css

export function loadFont(key: FontKey) {
  if (loadedFonts.has(key)) return;
  const font = fonts.find((f) => f.key === key);
  if (!font) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = font.googleHref;
  document.head.appendChild(link);
  loadedFonts.add(key);
}

export function applyTheme(settings: ThemeSettings) {
  const root = document.documentElement;

  // Color theme — set CSS variables
  const palette = themes[settings.color];
  Object.entries(palette).forEach(([shade, value]) => {
    root.style.setProperty(`--brand-${shade}`, value);
  });

  // Dark mode
  const wantsDark =
    settings.mode === "dark" ||
    (settings.mode === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  root.classList.toggle("dark", wantsDark);

  // Font
  loadFont(settings.font);
  const font = fonts.find((f) => f.key === settings.font);
  if (font) {
    root.style.setProperty("--font-family", font.family);
  }

  // Layout
  root.style.setProperty("--sidebar-side", settings.sidebarPosition);
  root.classList.toggle("compact", settings.compactMode);

  // Document title
  document.title = settings.officeName;
}
