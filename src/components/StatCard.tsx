import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  gradient?: "primary" | "success" | "warm";
}

export default function StatCard({ title, value, subtitle, icon: Icon, gradient = "primary" }: StatCardProps) {
  const gradientClass = gradient === "primary" ? "gradient-primary" : gradient === "success" ? "gradient-success" : "gradient-warm";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="rounded-xl glass-card shadow-card p-5 flex items-start gap-4 hover:shadow-glow transition-shadow duration-300"
    >
      <div className={`${gradientClass} rounded-xl p-2.5 shrink-0 shadow-lg`}>
        <Icon className="h-5 w-5 text-primary-foreground" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-display font-bold text-foreground">{value}</p>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
    </motion.div>
  );
}
