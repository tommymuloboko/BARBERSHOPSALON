import { useEffect, useRef, useState } from 'react';

type Lang = { code: string; label: string; flag: string };

const LANGS: Lang[] = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'pt', label: 'Português', flag: '🇵🇹' },
  { code: 'sw', label: 'Kiswahili', flag: '🇰🇪' },
  { code: 'bem', label: 'Chibemba', flag: '🇿🇲' },
  { code: 'ny', label: 'Chinyanja', flag: '🇿🇲' }
];

const KEY = 'knoxia.lang';

function loadLang(): string {
  return localStorage.getItem(KEY) || 'en';
}

function saveLang(code: string) {
  localStorage.setItem(KEY, code);
  document.documentElement.lang = code;
}

export default function LanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState<string>(() => loadLang());
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => { document.documentElement.lang = lang; }, [lang]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const current = LANGS.find(l => l.code === lang) ?? LANGS[0];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 rounded-md border border-gray-200 px-2.5 py-1.5 text-sm text-[#393A3D] hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#569DE6]"
        title="Change language"
        aria-label="Change language"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        <span className="font-semibold uppercase text-xs tracking-wide">{current.code}</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-30 py-1 text-sm">
          {LANGS.map(l => (
            <button
              key={l.code}
              type="button"
              onClick={() => { setLang(l.code); saveLang(l.code); setOpen(false); }}
              className={[
                'w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-gray-50',
                l.code === lang ? 'bg-[#E8F0FB] text-[#3A7BC2] font-semibold' : 'text-[#393A3D]'
              ].join(' ')}
            >
              <span className="text-base leading-none">{l.flag}</span>
              <span className="flex-1">{l.label}</span>
              {l.code === lang && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-[#569DE6]"><path d="M5 12l5 5L20 7" /></svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
