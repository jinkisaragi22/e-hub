import { useEffect, useState } from 'react';

export default function SearchBar({ onSearch, placeholder = 'Search…' }) {
  const [value, setValue] = useState('');

  useEffect(() => {
    const t = setTimeout(() => onSearch(value.trim()), 400);
    return () => clearTimeout(t);
  }, [value, onSearch]);

  return (
    <input
      type="search"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder={placeholder}
      className="w-full max-w-sm rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-current dark:border-tide dark:bg-depth dark:text-foam"
    />
  );
}
