import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Eye, Code2 } from "lucide-react";
import { cn } from "../../utils/helpers";

interface MarkdownEditorProps {
  content: string;
  onChange: (content: string) => void;
  showPreview: boolean;
  onTogglePreview: () => void;
}

export function MarkdownEditor({
  content,
  onChange,
  showPreview,
  onTogglePreview,
}: MarkdownEditorProps) {
  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-surface-border bg-white">
      <div className="flex items-center justify-between border-b border-surface-border px-4 py-2">
        <span className="text-xs font-medium text-slate-500">Markdown</span>
        <button
          type="button"
          onClick={onTogglePreview}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors",
            showPreview
              ? "bg-brand-100 text-brand-700"
              : "text-slate-500 hover:bg-slate-100"
          )}
          aria-pressed={showPreview}
        >
          {showPreview ? (
            <>
              <Eye className="h-3.5 w-3.5" aria-hidden />
              Preview
            </>
          ) : (
            <>
              <Code2 className="h-3.5 w-3.5" aria-hidden />
              Edit
            </>
          )}
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {!showPreview && (
          <textarea
            value={content}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Write in Markdown… **bold**, *italic*, # headings, - lists"
            className="flex-1 resize-none border-none p-4 font-mono text-sm text-slate-700 focus:outline-none focus:ring-0"
            aria-label="Note content"
          />
        )}
        {showPreview && (
          <div className="markdown-preview flex-1 overflow-y-auto p-4">
            {content ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            ) : (
              <p className="text-sm italic text-slate-400">Nothing to preview yet</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
