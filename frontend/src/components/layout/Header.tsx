import { StickyNote, HelpCircle } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-surface-border bg-white/70 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 p-2 shadow-md">
            <StickyNote className="h-5 w-5 text-white" aria-hidden />
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-brand-600 to-accent-600 bg-clip-text text-transparent">
              Notes
            </h1>
            <p className="text-xs text-slate-400 hidden sm:block">
              Capture · Organize · Find
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            window.dispatchEvent(new KeyboardEvent("keydown", { key: "?" }));
          }}
          className="btn-secondary py-1.5 px-3 text-xs"
          aria-label="Show keyboard shortcuts"
        >
          <HelpCircle className="h-3.5 w-3.5" aria-hidden />
          <span className="hidden sm:inline">Shortcuts</span>
        </button>
      </div>
    </header>
  );
}
