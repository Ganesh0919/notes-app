import { StickyNote, Plus, Search } from "lucide-react";

interface EmptyStateProps {
  hasFilters: boolean;
  onCreateNote: () => void;
}

export function EmptyState({ hasFilters, onCreateNote }: EmptyStateProps) {
  if (hasFilters) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <div className="rounded-2xl bg-brand-50 p-4">
          <Search className="h-8 w-8 text-brand-400" aria-hidden />
        </div>
        <div>
          <h3 className="font-semibold text-slate-700">No notes found</h3>
          <p className="mt-1 text-sm text-slate-500">
            Try adjusting your search or filters
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-16 text-center">
      <div className="relative">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-brand-400 to-accent-400 opacity-20 blur-2xl" />
        <div className="relative rounded-3xl bg-gradient-to-br from-brand-500 to-accent-500 p-6 shadow-glow">
          <StickyNote className="h-12 w-12 text-white" aria-hidden />
        </div>
      </div>
      <div>
        <h3 className="text-xl font-bold text-slate-800">Your canvas awaits</h3>
        <p className="mt-2 max-w-xs text-sm text-slate-500">
          Capture ideas, organize with tags, and find them instantly. Start with
          your first note!
        </p>
      </div>
      <button type="button" onClick={onCreateNote} className="btn-primary">
        <Plus className="h-4 w-4" aria-hidden />
        Create your first note
      </button>
    </div>
  );
}
