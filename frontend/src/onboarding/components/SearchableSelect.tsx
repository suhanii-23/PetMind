import { useState, useRef, useEffect } from "react";
import styles from "../Onboarding.module.css";

interface Props {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export default function SearchableSelect({ options, value, onChange, placeholder }: Props) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => { setQuery(value); }, [value]);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = options.filter(o => o.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className={styles.selectWrapper} ref={ref}>
      <input
        className={styles.selectInput}
        value={query}
        placeholder={placeholder ?? "Search or type…"}
        onChange={e => { setQuery(e.target.value); setOpen(true); onChange(e.target.value); }}
        onFocus={() => setOpen(true)}
      />
      {open && filtered.length > 0 && (
        <div className={styles.dropdown}>
          {filtered.map(o => (
            <div
              key={o}
              className={`${styles.dropdownItem} ${o === value ? styles.active : ""}`}
              onMouseDown={() => { onChange(o); setQuery(o); setOpen(false); }}
            >
              {o}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
