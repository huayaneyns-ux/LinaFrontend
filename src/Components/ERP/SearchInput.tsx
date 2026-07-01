import { useEffect, useRef } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import '../../Styles/ERP/erp-toolbar.css';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const SearchInput = ({ value, onChange, placeholder = 'Buscar...', className = '' }: SearchInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: Ctrl+K or /
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.key === 'k') || e.key === '/') {
        const active = document.activeElement;
        if (active?.tagName !== 'INPUT' && active?.tagName !== 'TEXTAREA') {
          e.preventDefault();
          inputRef.current?.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className={`erp-search-input-wrap ${className}`}>
      <FiSearch className="erp-search-icon" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="erp-search-input"
        autoComplete="off"
        spellCheck={false}
      />
      {value && (
        <button
          type="button"
          className="erp-search-clear"
          onClick={() => onChange('')}
          aria-label="Limpiar búsqueda"
        >
          <FiX />
        </button>
      )}
    </div>
  );
};

export default SearchInput;
