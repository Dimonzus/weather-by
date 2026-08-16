import type { ReactNode } from "react";

interface MetricCardProps {
  label: string;
  icon: ReactNode;
  value: string;
  subvalue?: string;
  hint?: string;
  children?: ReactNode;
}

export function MetricCard({ label, icon, value, subvalue, hint, children }: MetricCardProps) {
  return (
    <div className="bg-bg-primary rounded-2xl p-4 border border-border">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-text-secondary">{icon}</span>
        <span className="text-xs font-medium text-text-secondary uppercase tracking-wide">
          {label}
        </span>
      </div>
      <div className="text-xl font-bold text-text-primary">{value}</div>
      {subvalue && <div className="text-xs text-text-secondary mt-1">{subvalue}</div>}
      {hint && <div className="text-xs text-accent-blue font-medium mt-1">{hint}</div>}
      {children}
    </div>
  );
}