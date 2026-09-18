import React from 'react';

export const THEME_STORAGE_KEY = 'mock-kine-theme';
const themeOptions = ['system', 'light', 'dark'];
const systemQuery = () => window.matchMedia('(prefers-color-scheme: dark)');

function savedTheme() {
  const value = window.localStorage.getItem(THEME_STORAGE_KEY);
  return themeOptions.includes(value) ? value : 'system';
}

function applyTheme(theme) {
  const isDark = theme === 'dark' || (theme === 'system' && systemQuery().matches);
  document.documentElement.classList.toggle('dark', isDark);
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', isDark ? '#15181b' : '#f3f1ed');
}

export function useTheme() {
  const [theme, setTheme] = React.useState(savedTheme);

  React.useEffect(() => {
    applyTheme(theme);
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    if (theme !== 'system') return undefined;

    const query = systemQuery();
    const handleChange = () => applyTheme('system');
    query.addEventListener('change', handleChange);
    return () => query.removeEventListener('change', handleChange);
  }, [theme]);

  return { theme, setTheme };
}
