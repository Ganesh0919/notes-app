import { AlertCircle, WifiOff, RefreshCw } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-red-200 bg-red-50/50 p-8 text-center"
      role="alert"
    >
      <div className="rounded-full bg-red-100 p-3">
        <AlertCircle className="h-6 w-6 text-red-500" aria-hidden />
      </div>
      <div>
        <h3 className="font-semibold text-red-800">{title}</h3>
        <p className="mt-1 text-sm text-red-600">{message}</p>
      </div>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn-secondary">
          <RefreshCw className="h-4 w-4" aria-hidden />
          Try again
        </button>
      )}
    </div>
  );
}

export function OfflineBanner() {
  return (
    <div
      className="flex items-center justify-center gap-2 bg-amber-500 px-4 py-2 text-sm font-medium text-white"
      role="status"
      aria-live="polite"
    >
      <WifiOff className="h-4 w-4" aria-hidden />
      You&apos;re offline — changes won&apos;t sync until you reconnect
    </div>
  );
}
