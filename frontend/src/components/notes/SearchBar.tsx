import { Search, X } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

export function SearchBar({ value, onChange, inputRef }: SearchBarProps) {
  return (
    <div className="relative">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        aria-hidden
      />
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search notes… (⌘K)"
        className="input pl-10 pr-10"
        aria-label="Search notes"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

interface SortControlsProps {
  sort: string;
  order: string;
  onSortChange: (sort: string) => void;
  onOrderChange: (order: string) => void;
}

export function SortControls({
  sort,
  order,
  onSortChange,
  onOrderChange,
}: SortControlsProps) {
  return (
    <div className="flex gap-2">
      <select
        value={sort}
        onChange={(e) => onSortChange(e.target.value)}
        className="input py-1.5 text-xs"
        aria-label="Sort by"
      >
        <option value="updatedAt">Updated</option>
        <option value="createdAt">Created</option>
        <option value="title">Title</option>
      </select>
      <select
        value={order}
        onChange={(e) => onOrderChange(e.target.value)}
        className="input py-1.5 text-xs"
        aria-label="Sort order"
      >
        <option value="desc">Newest first</option>
        <option value="asc">Oldest first</option>
      </select>
    </div>
  );
}
