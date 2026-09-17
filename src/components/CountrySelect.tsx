"use client";

import { useMemo, useState } from "react";
import { COUNTRIES, filterCountries } from "@/lib/countries";

type CountrySelectProps = {
  name: string;
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
};

export function CountrySelect({ name, value, onChange, error }: CountrySelectProps) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);

  const matches = useMemo(() => filterCountries(query), [query]);
  const selectedExact = COUNTRIES.some((country) => country.toLowerCase() === query.trim().toLowerCase());

  return (
    <div className="relative">
      <input
        id={name}
        name={name}
        autoComplete="off"
        className={`field ${error ? "field-error" : ""}`}
        placeholder="Search or scroll all countries"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          onChange(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          window.setTimeout(() => setOpen(false), 120);
        }}
      />
      {open ? (
        <ul className="bezel absolute z-20 mt-2 max-h-80 w-full overflow-auto p-2">
          {matches.length === 0 ? (
            <li className="px-3 py-2 text-sm font-bold text-[var(--muted)]">
              {query.trim().toLowerCase() === "india"
                ? "India is not listed. Enter the country of residence outside India."
                : "No matching country."}
            </li>
          ) : (
            matches.map((country) => (
              <li key={country}>
                <button
                  type="button"
                  className={`w-full rounded-2xl px-3 py-2 text-left text-sm font-bold text-[var(--text)] hover:bg-[#efe4d4] ${
                    country === value ? "bg-[#efe4d4]" : ""
                  }`}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    setQuery(country);
                    onChange(country);
                    setOpen(false);
                  }}
                >
                  {country}
                </button>
              </li>
            ))
          )}
          {matches.length > 0 ? (
            <li className="px-3 py-2 text-xs font-bold text-[var(--muted)]">
              {selectedExact ? `${COUNTRIES.length} countries` : `${matches.length} match${matches.length === 1 ? "" : "es"}`}
              {" · scroll for the full list"}
            </li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}
