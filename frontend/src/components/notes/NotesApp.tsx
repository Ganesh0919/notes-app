import { useRef, useState, useCallback, useMemo } from "react";
import { Plus, StickyNote, Keyboard } from "lucide-react";
import { NoteCard } from "./NoteCard";
import { NoteEditor } from "./NoteEditor";
import { SearchBar, SortControls } from "./SearchBar";
import { TagBadge } from "./TagBadge";
import { EmptyState } from "../ui/EmptyState";
import { LoadingScreen } from "../ui/Spinner";
import { ErrorState } from "../ui/ErrorState";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import {
  useNotes,
  useTags,
  useCreateNote,
  useDeleteNote,
} from "../../hooks/useNotes";
import { useDebounce, useKeyboardShortcuts } from "../../hooks/useDebounce";
import type { NotesFilters, SortField, SortOrder } from "../../types/note";

interface NotesAppProps {
  isOffline: boolean;
}

export function NotesApp({ isOffline }: NotesAppProps) {
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sort, setSort] = useState<SortField>("updatedAt");
  const [order, setOrder] = useState<SortOrder>("desc");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const debouncedSearch = useDebounce(search, 300);

  const filters: Partial<NotesFilters> = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      tag: selectedTag ?? undefined,
      sort,
      order,
    }),
    [debouncedSearch, selectedTag, sort, order]
  );

  const { data, isLoading, isError, error, refetch } = useNotes(filters);
  const { data: tags } = useTags();
  const createNote = useCreateNote();
  const deleteNote = useDeleteNote();

  const notes = data?.data ?? [];
  const selectedNote = notes.find((n) => n.id === selectedId) ?? null;

  const handleCreateNote = useCallback(async () => {
    if (isOffline) return;
    const note = await createNote.mutateAsync({
      title: "",
      content: "",
      tags: [],
    });
    setSelectedId(note.id);
  }, [createNote, isOffline]);

  const handleDelete = useCallback(async () => {
    if (!deleteConfirm) return;
    await deleteNote.mutateAsync(deleteConfirm);
    setDeleteConfirm(null);
    if (selectedId === deleteConfirm) {
      setSelectedId(null);
    }
  }, [deleteConfirm, deleteNote, selectedId]);

  useKeyboardShortcuts(
    useMemo(
      () => ({
        "mod+n": handleCreateNote,
        "mod+k": () => searchInputRef.current?.focus(),
        delete: () => {
          if (selectedId) setDeleteConfirm(selectedId);
        },
        "?": () => setShowShortcuts((s) => !s),
      }),
      [handleCreateNote, selectedId]
    )
  );

  const hasFilters = !!(debouncedSearch || selectedTag);

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col lg:flex-row">
      {/* Sidebar */}
      <aside
        className="flex w-full flex-col border-b border-surface-border bg-white/80 backdrop-blur-sm lg:w-96 lg:border-b-0 lg:border-r"
        aria-label="Notes list"
      >
        <div className="space-y-3 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-600">
              {data?.pagination.total ?? 0} notes
            </h2>
            <button
              type="button"
              onClick={handleCreateNote}
              disabled={createNote.isPending || isOffline}
              className="btn-primary py-1.5 px-3 text-xs"
              aria-label="Create new note"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden />
              New
            </button>
          </div>

          <SearchBar
            value={search}
            onChange={setSearch}
            inputRef={searchInputRef}
          />

          <SortControls
            sort={sort}
            order={order}
            onSortChange={(v) => setSort(v as SortField)}
            onOrderChange={(v) => setOrder(v as SortOrder)}
          />

          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by tag">
              {tags.map(({ name, count }) => (
                <TagBadge
                  key={name}
                  tag={name}
                  count={count}
                  active={selectedTag === name}
                  onClick={() =>
                    setSelectedTag((t) => (t === name ? null : name))
                  }
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {isLoading && <LoadingScreen />}
          {isError && (
            <ErrorState
              message={(error as Error)?.message ?? "Failed to load notes"}
              onRetry={() => refetch()}
            />
          )}
          {!isLoading && !isError && notes.length === 0 && (
            <EmptyState hasFilters={hasFilters} onCreateNote={handleCreateNote} />
          )}
          {!isLoading && !isError && notes.length > 0 && (
            <div className="space-y-2" role="list">
              {notes.map((note) => (
                <div key={note.id} role="listitem">
                  <NoteCard
                    note={note}
                    isSelected={selectedId === note.id}
                    onClick={() => setSelectedId(note.id)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* Main editor */}
      <main className="flex flex-1 flex-col overflow-hidden p-4 lg:p-6">
        {selectedNote ? (
          <NoteEditor
            key={selectedNote.id}
            note={selectedNote}
            onDelete={() => setDeleteConfirm(selectedNote.id)}
            isOffline={isOffline}
          />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="rounded-2xl bg-brand-50 p-4">
              <StickyNote className="h-10 w-10 text-brand-400" aria-hidden />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-slate-700">
              Select a note to edit
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Or press{" "}
              <kbd className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono">
                ⌘N
              </kbd>{" "}
              to create one
            </p>
          </div>
        )}
      </main>

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        title="Delete this note?"
        message="This action cannot be undone. The note will be permanently removed."
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
        isLoading={deleteNote.isPending}
      />

      {showShortcuts && (
        <ShortcutsModal onClose={() => setShowShortcuts(false)} />
      )}
    </div>
  );
}

function ShortcutsModal({ onClose }: { onClose: () => void }) {
  const shortcuts = [
    { keys: "⌘/Ctrl + N", action: "New note" },
    { keys: "⌘/Ctrl + K", action: "Focus search" },
    { keys: "Delete", action: "Delete selected note" },
    { keys: "?", action: "Show shortcuts" },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
    >
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} aria-hidden />
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center gap-2">
          <Keyboard className="h-5 w-5 text-brand-500" aria-hidden />
          <h2 id="shortcuts-title" className="font-semibold text-slate-800">
            Keyboard shortcuts
          </h2>
        </div>
        <ul className="mt-4 space-y-2">
          {shortcuts.map(({ keys, action }) => (
            <li key={keys} className="flex items-center justify-between text-sm">
              <span className="text-slate-600">{action}</span>
              <kbd className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs">
                {keys}
              </kbd>
            </li>
          ))}
        </ul>
        <button type="button" onClick={onClose} className="btn-secondary mt-4 w-full">
          Close
        </button>
      </div>
    </div>
  );
}
