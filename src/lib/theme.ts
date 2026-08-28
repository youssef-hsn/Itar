export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'itar-theme';

const THEMES: readonly string[] = ['light', 'dark', 'system'];

export const isTheme = (value: unknown): value is Theme =>
  typeof value === 'string' && THEMES.includes(value);

export const resolveTheme = (theme: Theme, prefersDark: boolean): ResolvedTheme => {
  if (theme === 'system') {
    return prefersDark ? 'dark' : 'light';
  }
  return theme;
};

const listeners = new Set<() => void>();

const getPrefersDark = (): boolean => {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return false;
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

export const getTheme = (): Theme => {
  if (typeof window === 'undefined') {
    return 'system';
  }
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY);
    if (isTheme(value)) {
      return value;
    }
  } catch {
    // localStorage may throw in private browsing
  }
  return 'system';
};

export const getResolvedTheme = (): ResolvedTheme => {
  return resolveTheme(getTheme(), getPrefersDark());
};

export const applyTheme = (theme: Theme = getTheme()) => {
  if (typeof document === 'undefined') {
    return;
  }
  const resolved = resolveTheme(theme, getPrefersDark());
  document.documentElement.classList.toggle('dark', resolved === 'dark');
};

export const setTheme = (theme: Theme) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // localStorage may throw in private browsing
    }
  }
  applyTheme(theme);
  for (const listener of listeners) {
    listener();
  }
};

export const subscribe = (listener: () => void) => {
  listeners.add(listener);

  let mediaQuery: MediaQueryList | null = null;
  const onMediaChange = () => {
    if (getTheme() === 'system') {
      applyTheme('system');
      listener();
    }
  };

  if (typeof window !== 'undefined' && window.matchMedia) {
    mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', onMediaChange);
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === THEME_STORAGE_KEY) {
      applyTheme();
      listener();
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', onStorage);
  }

  return () => {
    listeners.delete(listener);
    if (mediaQuery) {
      mediaQuery.removeEventListener('change', onMediaChange);
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', onStorage);
    }
  };
};
