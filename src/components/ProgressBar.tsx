import { motion } from "framer-motion";

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showPercent?: boolean;
  variant?: "primary" | "success" | "warning" | "destructive";
  size?: "sm" | "md";
}

export default function ProgressBar({
  value,
  max = 100,
  label,
  showPercent = true,
  variant = "primary",
  size = "md",
}: ProgressBarProps) {
  const percent = Math.min(Math.round((value / max) * 100), 100);

  const colors = {
    primary: "gradient-primary",
    success: "gradient-success",
    warning: "gradient-warm",
    destructive: "bg-destructive",
  };

  return (
    <div>
      {(label || showPercent) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-sm text-muted-foreground">{label}</span>}
          {showPercent && <span className="text-sm font-medium text-foreground">{percent}%</span>}
        </div>
      )}
      <div className={`${size === "sm" ? "h-2" : "h-3"} bg-white/5 rounded-full overflow-hidden`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full rounded-full ${colors[variant]}`}
        />
      </div>
    </div>
  );
}
