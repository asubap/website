import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';

interface SponsorMultiSelectProps {
  value: string[];
  onChange: (sponsors: string[]) => void;
  label?: string;
}

const SponsorMultiSelect: React.FC<SponsorMultiSelectProps> = ({ value, onChange, label = 'Sponsors Attending' }) => {
  const [sponsors, setSponsors] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [filtered, setFiltered] = useState<string[]>([]);
  const [hoveredSponsor, setHoveredSponsor] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/sponsors/names`)
      .then(res => res.json())
      .then(data => {
        const names = data.map((item: { company_name: string }) => item.company_name);
        setSponsors(names);
        setFiltered(names);
      });
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(sponsors);
    } else {
      setFiltered(sponsors.filter(s => s.toLowerCase().includes(search.toLowerCase())));
    }
  }, [search, sponsors]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const toggleSponsor = (s: string) => {
    if (value.includes(s)) {
      onChange(value.filter(v => v !== s));
    } else {
      onChange([...value, s]);
    }
  };

  const removeSponsor = (s: string) => {
    onChange(value.filter(v => v !== s));
  };

  return (
    <div className="mb-6 relative" ref={containerRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div
        className="w-full border border-gray-300 rounded-lg p-2 flex flex-wrap gap-2 min-h-[44px] cursor-pointer focus-within:ring-2 focus-within:ring-bapred bg-white relative"
        tabIndex={0}
        onClick={() => setOpen(o => !o)}
        style={{ minHeight: '44px' }}
      >
        {value.length === 0 && (
          <span className="text-gray-400 select-none">e.g., Deloitte, KPMG (comma-separated)</span>
        )}
        {value.map(s => (
          <span key={s} className="flex items-center bg-bapred text-white rounded px-2 py-1 text-xs mr-1 mb-1">
            {s}
            <button
              type="button"
              className="ml-1 focus:outline-none"
              onClick={e => { e.stopPropagation(); removeSponsor(s); }}
              aria-label={`Remove ${s}`}
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <span className="ml-auto flex items-center">
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </span>
      </div>
      {open && (
        <div className="absolute left-0 right-0 w-full z-40 mt-1 mb-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 max-w-auto overflow-y-auto">
          <div className="p-2">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search sponsors..."
              className="w-full border border-gray-200 rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-bapred"
              autoFocus
              onClick={e => e.stopPropagation()}
            />
          </div>
          <ul>
            {filtered.length === 0 && (
              <li className="px-4 py-2 text-gray-400 text-sm">No sponsors found</li>
            )}
            {filtered.map(s => (
              <li
                key={s}
                className="flex items-center px-4 py-2 cursor-pointer hover:bg-bapred hover:text-white"
                onClick={e => { e.stopPropagation(); toggleSponsor(s); }}
                onMouseEnter={() => setHoveredSponsor(s)}
                onMouseLeave={() => setHoveredSponsor(null)}
              >
                <span className="mr-2">
                  {value.includes(s) ? (
                    <Check className={`w-4 h-4 ${hoveredSponsor === s ? 'text-white' : 'text-bapred'}`} />
                  ) : (
                    <span className="inline-block w-4 h-4 border border-gray-300 rounded" />
                  )}
                </span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SponsorMultiSelect; 