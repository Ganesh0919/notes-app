import { useState, useEffect, useCallback, useRef } from "react";
import {
  Trash2,
  Check,
  AlertCircle,
  Clock,
} from "lucide-react";
import { MarkdownEditor } from "./MarkdownEditor";
import { TagBadge, TagInput } from "./TagBadge";
import { useUpdateNote } from "../../hooks/useNotes";
import { useDebouncedCallback } from "../../hooks/useDebounce";
import { parseTagsInput } from "../../utils/helpers";
import type { Note } from "../../types/note";
import { Spinner } from "../ui/Spinner";

interface NoteEditorProps {
  note: Note;
  onDelete: () => void;
  isOffline: boolean;
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

export function NoteEditor({ note, onDelete, isOffline }: NoteEditorProps) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [tags, setTags] = useState<string[]>(note.tags);
  const [tagInput, setTagInput] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  const updateNote = useUpdateNote();
  const noteIdRef = useRef(note.id);

  // Reset local state when switching notes
  useEffect(() => {
    if (noteIdRef.current !== note.id) {
      noteIdRef.current = note.id;
      setTitle(note.title);
      setContent(note.content);
      setTags(note.tags);
      setTagInput("");
      setSaveStatus("idle");
    }
  }, [note]);

  const save = useCallback(
    async (updates: { title?: string; content?: string; tags?: string[] }) => {
      if (isOffline) {
        setSaveStatus("error");
        return;
      }

      setSaveStatus("saving");
      try {
        await updateNote.mutateAsync({ id: note.id, input: updates });
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } catch {
        setSaveStatus("error");
      }
    },
    [note.id, updateNote, isOffline]
  );

  const debouncedSave = useDebouncedCallback(
    (updates: { title?: string; content?: string; tags?: string[] }) => {
      save(updates);
    },
    800
  );

  const handleTitleChange = (value: string) => {
    setTitle(value);
    debouncedSave({ title: value, content, tags });
  };

  const handleContentChange = (value: string) => {
    setContent(value);
    debouncedSave({ title, content: value, tags });
  };

  const handleTagsSubmit = () => {
    const newTags = parseTagsInput(tagInput);
    if (newTags.length === 0 && tagInput.trim() === "") return;

    const merged = [...new Set([...tags, ...newTags])];
    setTags(merged);
    setTagInput("");
    save({ title, content, tags: merged });
  };

  const removeTag = (tagToRemove: string) => {
    const filtered = tags.filter((t) => t !== tagToRemove);
    setTags(filtered);
    save({ title, content, tags: filtered });
  };

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-start justify-between gap-4 border-b border-surface-border pb-4">
        <div className="flex-1">
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Note title"
            className="w-full border-none bg-transparent text-2xl font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-0"
            aria-label="Note title"
          />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {tags.map((tag) => (
              <TagBadge key={tag} tag={tag} onRemove={() => removeTag(tag)} />
            ))}
            <div className="min-w-[200px] flex-1">
              <TagInput
                value={tagInput}
                onChange={setTagInput}
                onSubmit={handleTagsSubmit}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <SaveStatusIndicator status={saveStatus} isOffline={isOffline} />
          <button
            type="button"
            onClick={onDelete}
            className="btn-danger p-2"
            aria-label="Delete note"
            title="Delete note"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="mt-4 flex flex-1 flex-col overflow-hidden">
        <MarkdownEditor
          content={content}
          onChange={handleContentChange}
          showPreview={showPreview}
          onTogglePreview={() => setShowPreview((p) => !p)}
        />
      </div>
    </div>
  );
}

function SaveStatusIndicator({
  status,
  isOffline,
}: {
  status: SaveStatus;
  isOffline: boolean;
}) {
  if (isOffline) {
    return (
      <span className="flex items-center gap-1 text-xs text-amber-600">
        <AlertCircle className="h-3.5 w-3.5" aria-hidden />
        Offline
      </span>
    );
  }

  switch (status) {
    case "saving":
      return (
        <span className="flex items-center gap-1 text-xs text-slate-400">
          <Spinner size="sm" />
          Saving…
        </span>
      );
    case "saved":
      return (
        <span className="flex items-center gap-1 text-xs text-emerald-600">
          <Check className="h-3.5 w-3.5" aria-hidden />
          Saved
        </span>
      );
    case "error":
      return (
        <span className="flex items-center gap-1 text-xs text-red-500">
          <AlertCircle className="h-3.5 w-3.5" aria-hidden />
          Save failed
        </span>
      );
    default:
      return (
        <span className="flex items-center gap-1 text-xs text-slate-300">
          <Clock className="h-3.5 w-3.5" aria-hidden />
          Auto-save
        </span>
      );
  }
}
