import { useTheme } from '@/shared/theme/ThemeProvider';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="ui-button ui-button-ghost text-xs px-3 py-2"
      aria-label="Cambiar tema"
      title="Cambiar tema"
    >
      {theme === 'dark' ? 'Claro' : 'Oscuro'}
    </button>
  );
}

