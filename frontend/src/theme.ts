export type Theme = {
  bg: string;
  brand: string;
  brandDark: string;
  brandHover: string;
  brandTint: string;
};

export const DEFAULT_THEME: Theme = {
  bg: '#F4F5F8',
  brand: '#569DE6',
  brandDark: '#3A7BC2',
  brandHover: '#4585CC',
  brandTint: '#E8F0FB'
};

const STORAGE_KEY = 'knoxia.theme';
const STYLE_ID = 'knoxia-theme';

export function loadTheme(): Theme {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_THEME, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
  return DEFAULT_THEME;
}

export function saveTheme(t: Theme) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(t));
  applyTheme(t);
}

export function resetTheme(): Theme {
  localStorage.removeItem(STORAGE_KEY);
  applyTheme(DEFAULT_THEME);
  return DEFAULT_THEME;
}

export function applyTheme(t: Theme) {
  const css = `
.bg-\\[\\#F4F5F8\\] { background-color: ${t.bg} !important; }
.bg-\\[\\#569DE6\\] { background-color: ${t.brand} !important; }
.text-\\[\\#569DE6\\] { color: ${t.brand} !important; }
.border-\\[\\#569DE6\\] { border-color: ${t.brand} !important; }
.border-l-\\[\\#569DE6\\] { border-left-color: ${t.brand} !important; }
.bg-\\[\\#3A7BC2\\] { background-color: ${t.brandDark} !important; }
.text-\\[\\#3A7BC2\\] { color: ${t.brandDark} !important; }
.hover\\:bg-\\[\\#4585CC\\]:hover { background-color: ${t.brandHover} !important; }
.active\\:bg-\\[\\#3A7BC2\\]:active { background-color: ${t.brandDark} !important; }
.bg-\\[\\#E8F0FB\\] { background-color: ${t.brandTint} !important; }
.hover\\:bg-\\[\\#E8F0FB\\]:hover { background-color: ${t.brandTint} !important; }
.focus\\:border-\\[\\#569DE6\\]:focus { border-color: ${t.brand} !important; }
.focus\\:ring-\\[\\#569DE6\\]\\/30:focus { --tw-ring-color: ${t.brand}4D !important; }
.focus-visible\\:ring-\\[\\#569DE6\\]:focus-visible { --tw-ring-color: ${t.brand} !important; }
`;
  let el = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!el) {
    el = document.createElement('style');
    el.id = STYLE_ID;
    document.head.appendChild(el);
  }
  el.textContent = css;
}
