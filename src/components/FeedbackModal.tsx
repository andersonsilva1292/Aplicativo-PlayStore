import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Info } from "lucide-react";

type FeedbackType = "success" | "error" | "info";

interface FeedbackModalProps {
  open: boolean;
  type: FeedbackType;
  title: string;
  message: string;
  onClose: () => void;
}

const config: Record<FeedbackType, { icon: typeof CheckCircle; color: string; bg: string; glow: string }> = {
  success: {
    icon: CheckCircle,
    color: "text-primary",
    bg: "bg-primary/15",
    glow: "shadow-[0_0_80px_-10px_hsl(160,60%,42%,0.4)]",
  },
  error: {
    icon: XCircle,
    color: "text-destructive",
    bg: "bg-destructive/15",
    glow: "shadow-[0_0_80px_-10px_hsl(0,72%,55%,0.4)]",
  },
  info: {
    icon: Info,
    color: "text-accent",
    bg: "bg-accent/15",
    glow: "shadow-[0_0_80px_-10px_hsl(220,70%,55%,0.4)]",
  },
};

export default function FeedbackModal({ open, type, title, message, onClose }: FeedbackModalProps) {
  const { icon: Icon, color, bg, glow } = config[type];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-6"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`relative w-full max-w-lg rounded-3xl border border-border bg-card p-10 text-center ${glow}`}
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.15, type: "spring", damping: 12, stiffness: 200 }}
              className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full ${bg}`}
            >
              <Icon className={`h-10 w-10 ${color}`} strokeWidth={2} />
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="font-display text-2xl font-bold text-foreground mb-3"
            >
              {title}
            </motion.h2>

            {/* Message */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="text-muted-foreground text-base leading-relaxed mb-8 max-w-sm mx-auto"
            >
              {message}
            </motion.p>

            {/* Button */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onClose}
              className="w-full max-w-xs mx-auto h-12 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors"
            >
              OK
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
