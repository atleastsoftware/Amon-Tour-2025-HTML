import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const SITE_PAGES = [
  { path: '/', label: 'Accueil' },
  { path: '/tours', label: 'Tours' },
  { path: '/experiences', label: 'Expériences' },
  { path: '/tour-cards', label: 'Cartes de Tours' },
  { path: '/stays', label: 'Hébergements' },
  { path: '/custom-tour', label: 'Tour Personnalisé' },
  { path: '/external-stays', label: 'Hébergements Externes' },
  { path: '/krabi-celebration', label: 'Krabi Celebration' },
  { path: '/become-partner', label: 'Devenir Partenaire' },
  { path: '/group-corporate', label: 'Groupes & Entreprises' },
  { path: '/brochure', label: 'Brochure' },
  { path: '/villas-krabi', label: 'Villas Krabi' },
  { path: '/contact', label: 'Contact' },
  { path: '/blog', label: 'Blog' },
  { path: '/legal-notice', label: 'Mentions Légales' },
  { path: '/privacy-policy', label: 'Politique de Confidentialité' },
  { path: '/terms-conditions', label: 'Conditions Générales' }
];

interface URLInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function URLInput({ label = 'URL', value, onChange, placeholder }: URLInputProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredPages, setFilteredPages] = useState(SITE_PAGES);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Fermer le dropdown si on clique en dehors
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Afficher le dropdown quand "/" est tapé
    if (value === '/') {
      setShowDropdown(true);
      setFilteredPages(SITE_PAGES);
    } else if (value.startsWith('/') && value.length > 1) {
      // Filtrer les pages selon la saisie
      const filtered = SITE_PAGES.filter(page =>
        page.path.toLowerCase().includes(value.toLowerCase()) ||
        page.label.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredPages(filtered);
      setShowDropdown(filtered.length > 0);
    } else {
      setShowDropdown(false);
    }
  }, [value]);

  const handleSelectPage = (path: string) => {
    onChange(path);
    setShowDropdown(false);
    inputRef.current?.blur();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Label className="text-sm">{label}</Label>
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      <p className="text-xs text-gray-500 mt-1">
        Tapez "/" pour sélectionner une page du site
      </p>

      {showDropdown && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {filteredPages.map((page) => (
            <button
              key={page.path}
              type="button"
              onClick={() => handleSelectPage(page.path)}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
            >
              <div className="font-medium text-sm">{page.label}</div>
              <div className="text-xs text-gray-500">{page.path}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
