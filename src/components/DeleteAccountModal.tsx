import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Trash2, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function DeleteAccountModal({ open, onClose }: Props) {
  const { user, signOut } = useAuth();
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const canDelete = confirmText === "EXCLUIR";

  const handleDelete = async () => {
    if (!user || !canDelete) return;
    setLoading(true);
    setError("");
    try {
      // Call edge function to delete user account
      const { error: fnError } = await supabase.functions.invoke("delete-user-account");
      if (fnError) throw fnError;
      await signOut();
    } catch (e: any) {
      setError(e.message || "Erro ao excluir conta. Tente novamente.");
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md rounded-2xl border border-destructive/30 bg-[hsl(220,30%,12%)] shadow-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-destructive/20 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <h2 className="font-display text-lg font-bold text-white">Excluir Conta</h2>
            </div>
            <button onClick={onClose} aria-label="Fechar" className="text-white/40 hover:text-white transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-white/70">
              Esta ação é <strong className="text-destructive">irreversível</strong>. Todos os seus dados serão permanentemente excluídos:
            </p>
            <ul className="text-sm text-white/60 space-y-1 list-disc list-inside">
              <li>Perfil e informações pessoais</li>
              <li>Histórico de simulados e resultados</li>
              <li>Progresso de estudo</li>
            </ul>

            <div>
              <label className="text-xs text-white/40 mb-1 block">
                Digite <strong className="text-destructive">EXCLUIR</strong> para confirmar
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="EXCLUIR"
                className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-destructive focus:ring-1 focus:ring-destructive transition-all"
              />
            </div>

            {error && <p className="text-xs text-destructive">{error}</p>}

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 h-12 rounded-xl border border-white/10 text-white/70 font-medium text-sm hover:bg-white/5 transition-colors"
              >
                Cancelar
              </button>
              <motion.button
                whileHover={canDelete ? { scale: 1.01 } : {}}
                whileTap={canDelete ? { scale: 0.98 } : {}}
                onClick={handleDelete}
                disabled={!canDelete || loading}
                className="flex-1 h-12 rounded-xl bg-destructive text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-40 transition-opacity"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Trash2 className="h-4 w-4" /> Excluir Conta</>}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
