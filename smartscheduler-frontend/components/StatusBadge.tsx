interface StatusBadgeProps {
  variant: "success" | "warning" | "error" | "info" | "purple";
  children: React.ReactNode;
}

const variantMap = {
  success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  warning: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  error: "bg-red-500/10 text-red-400 border-red-500/20",
  info: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

export default function StatusBadge({ variant, children }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${variantMap[variant]}`}
    >
      {children}
    </span>
  );
}
