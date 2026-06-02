import { WifiOff, RefreshCw } from "lucide-react";

interface ApiErrorProps {
  message?: string;
  onRetry?: () => void;
}

export default function ApiError({
  message = "Backend bağlantısı kurulamadı",
  onRetry,
}: ApiErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-fadeIn">
      <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
        <WifiOff size={24} className="text-red-400" />
      </div>
      <h3 className="text-base font-semibold text-white mb-1">{message}</h3>
      <p className="text-sm text-white/40 mb-5 max-w-xs">
        API sunucusunun çalıştığından emin olun:{" "}
        <code className="text-white/60 bg-white/[0.06] px-1.5 py-0.5 rounded text-xs">
          http://localhost:5000
        </code>
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-white/70 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <RefreshCw size={14} />
          Tekrar Dene
        </button>
      )}
    </div>
  );
}
