import { useCallback, useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'dalka-theme';
const THEME_EVENT = 'dalka-theme-change';

function isPreviewPath(): boolean {
  return typeof window !== 'undefined' && window.location.pathname.startsWith('/__preview');
}

function readInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light';
  if (isPreviewPath()) {
    const modeParam = new URLSearchParams(window.location.search).get('mode');
    return modeParam === 'dark' ? 'dark' : 'light';
  }
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
  } catch {
    // Ignore storage read error
  }
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

function applyThemeToDom(theme: ThemeMode): void {
  const isDark = theme === 'dark';
  document.documentElement.classList.toggle('dark', isDark);
  document.documentElement.style.colorScheme = theme;

  const themeMeta = document.querySelector('meta[name="theme-color"]');
  if (themeMeta) {
    themeMeta.setAttribute('content', isDark ? '#161B22' : '#4648D4');
  }
}

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeMode>(readInitialTheme);

  useEffect(() => {
    applyThemeToDom(theme);
  }, [theme]);

  useEffect(() => {
    if (isPreviewPath()) return;
    function handleSync(event: Event) {
      const custom = event as CustomEvent<ThemeMode>;
      if (custom.detail === 'light' || custom.detail === 'dark') {
        setThemeState(custom.detail);
      }
    }
    window.addEventListener(THEME_EVENT, handleSync);
    return () => window.removeEventListener(THEME_EVENT, handleSync);
  }, []);

  const setTheme = useCallback((next: ThemeMode, notifyParent = false) => {
    setThemeState(next);
    applyThemeToDom(next);
    if (isPreviewPath()) {
      if (notifyParent && window.parent !== window) {
        window.parent.postMessage(
          { type: 'DALKA_PREVIEW_MODE_CHANGED', mode: next },
          window.location.origin,
        );
      }
      return;
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Ignore storage write error
    }
    window.dispatchEvent(new CustomEvent<ThemeMode>(THEME_EVENT, { detail: next }));
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark', true);
  }, [theme, setTheme]);

  return {
    theme,
    isDark: theme === 'dark',
    setTheme,
    toggleTheme,
  };
}
