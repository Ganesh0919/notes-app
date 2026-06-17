import { X } from "lucide-react";
import { cn, getTagColor } from "../../utils/helpers";

interface TagBadgeProps {
  tag: string;
  onClick?: () => void;
  onRemove?: () => void;
  active?: boolean;
  count?: number;
}

export function TagBadge({ tag, onClick, onRemove, active, count }: TagBadgeProps) {
  const colorClass = getTagColor(tag);
  const isInteractive = !!onClick;

  const content = (
    <>
      <span>{tag}</span>
      {count !== undefined && (
        <span className="ml-1 opacity-70">({count})</span>
      )}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 rounded-full p-0.5 hover:bg-black/10"
          aria-label={`Remove tag ${tag}`}
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </>
  );

  if (isInteractive) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "tag-pill",
          colorClass,
          active && "ring-2 ring-brand-400 ring-offset-1"
        )}
        aria-pressed={active}
      >
        {content}
      </button>
    );
  }

  return <span className={cn("tag-pill", colorClass)}>{content}</span>;
}

interface TagInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
}

export function TagInput({
  value,
  onChange,
  onSubmit,
  placeholder = "Add tags (comma separated)",
}: TagInputProps) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          onSubmit();
        }
      }}
      onBlur={onSubmit}
      placeholder={placeholder}
      className="input text-sm"
      aria-label="Tags input"
    />
  );
}
