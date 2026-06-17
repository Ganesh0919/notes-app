import { cn, formatRelativeDate, truncate } from "../../utils/helpers";
import { TagBadge } from "./TagBadge";
import type { Note } from "../../types/note";

interface NoteCardProps {
  note: Note;
  isSelected: boolean;
  onClick: () => void;
}

export function NoteCard({ note, isSelected, onClick }: NoteCardProps) {
  const preview = note.content.replace(/[#*`>\-\[\]]/g, "").trim();

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-xl border p-4 text-left transition-all duration-200",
        isSelected
          ? "border-brand-300 bg-gradient-to-r from-brand-50 to-accent-50 shadow-card"
          : "border-surface-border bg-white hover:border-brand-200 hover:shadow-sm"
      )}
      aria-current={isSelected ? "true" : undefined}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-slate-800 line-clamp-1">
          {note.title || "Untitled"}
        </h3>
        <time
          className="shrink-0 text-xs text-slate-400"
          dateTime={note.updatedAt}
        >
          {formatRelativeDate(note.updatedAt)}
        </time>
      </div>
      {preview && (
        <p className="mt-1.5 text-sm text-slate-500 line-clamp-2">
          {truncate(preview, 120)}
        </p>
      )}
      {note.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {note.tags.slice(0, 3).map((tag) => (
            <TagBadge key={tag} tag={tag} />
          ))}
          {note.tags.length > 3 && (
            <span className="text-xs text-slate-400">
              +{note.tags.length - 3}
            </span>
          )}
        </div>
      )}
    </button>
  );
}
