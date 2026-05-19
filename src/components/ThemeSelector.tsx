import { useState, useRef, useEffect } from 'react';
import { Palette, Moon, Sun, Check } from 'lucide-react';
import { useTheme, THEMES, ThemeId, AppSpace } from '../contexts/ThemeContext';

type Props = {
  space?: AppSpace;
};

export default function ThemeSelector({ space = 'educ' }: Props) {
  const { themeId, jayThemeId, isDark, jayIsDark, setTheme, setJayTheme, toggleDark, toggleJayDark } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const activeThemeId = space === 'jay' ? jayThemeId : themeId;
  const activeIsDark = space === 'jay' ? jayIsDark : isDark;
  const handleSetTheme = space === 'jay' ? setJayTheme : setTheme;
  const handleToggleDark = space === 'jay' ? toggleJayDark : toggleDark;

  const availableThemes = THEMES.filter((t) => t.space === 'both' || t.space === space);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (id: ThemeId) => {
    handleSetTheme(id);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative flex items-center gap-2">
      <button
        onClick={handleToggleDark}
        title={activeIsDark ? 'Mode Clair' : 'Mode Sombre'}
        style={{
          background: 'var(--surface)',
          color: 'var(--text-muted)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          boxShadow: 'var(--shadow)',
        }}
        className="p-2 transition-all hover:scale-105 active:scale-95"
      >
        {activeIsDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>

      <button
        onClick={() => setOpen(!open)}
        title="Changer le thème"
        style={{
          background: 'var(--surface)',
          color: 'var(--text-muted)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          boxShadow: 'var(--shadow)',
        }}
        className="p-2 transition-all hover:scale-105 active:scale-95"
      >
        <Palette className="w-4 h-4" />
      </button>

      {open && (
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            boxShadow: 'var(--shadow-lg)',
            backdropFilter: 'var(--backdrop, none)',
            WebkitBackdropFilter: 'var(--backdrop, none)',
          }}
          className="absolute right-0 top-full mt-2 w-64 z-50 p-2"
        >
          <p
            style={{ color: 'var(--text-faint)' }}
            className="text-xs font-medium px-2 pb-2 uppercase tracking-wider"
          >
            Thème visuel
          </p>
          <div className="space-y-1">
            {availableThemes.map((theme) => {
              const active = activeThemeId === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => handleSelect(theme.id)}
                  style={{
                    background: active ? 'var(--primary-soft)' : 'transparent',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text)',
                  }}
                  className="w-full flex items-center gap-3 px-2 py-2.5 transition-all hover:opacity-80"
                >
                  <div className="flex gap-1 flex-shrink-0">
                    <span
                      className="w-5 h-5 rounded-full border border-white/30 flex-shrink-0"
                      style={{ background: theme.preview.bg, outline: '1px solid rgba(0,0,0,0.1)' }}
                    />
                    <span
                      className="w-5 h-5 rounded-full flex-shrink-0"
                      style={{ background: theme.preview.primary }}
                    />
                    <span
                      className="w-5 h-5 rounded-full flex-shrink-0"
                      style={{ background: theme.preview.accent }}
                    />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                      {theme.name}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text-faint)' }}>
                      {theme.description}
                    </div>
                  </div>
                  {active && (
                    <Check className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--primary)' }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
