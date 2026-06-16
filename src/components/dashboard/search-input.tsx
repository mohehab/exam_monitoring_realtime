"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setSearch } from "@/store/slices/ui-slice";

/**
 * Search box. Local state is debounced before hitting the store so typing
 * doesn't trigger a 12k-record filter pass on every keystroke.
 */
export function SearchInput() {
  const dispatch = useAppDispatch();
  const committed = useAppSelector((s) => s.ui.filters.search);
  const [value, setValue] = useState(committed);

  useEffect(() => {
    const id = setTimeout(() => dispatch(setSearch(value)), 200);
    return () => clearTimeout(id);
  }, [value, dispatch]);

  return (
    <div className="relative flex-1 sm:max-w-xs">
      <label htmlFor="session-search" className="sr-only">
        Search sessions
      </label>
      <input
        id="session-search"
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search name, ID, exam, region…"
        className="w-full rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-text placeholder:text-muted focus:border-accent focus:outline-none"
      />
    </div>
  );
}
