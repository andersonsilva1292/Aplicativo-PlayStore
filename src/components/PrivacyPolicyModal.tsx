import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, X, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Props {
  open: boolean;
  onClose: () => void;
  showDeleteOption?: boolean;
}

export default function PrivacyPolicyModal({ open, onClose, showDeleteOption = false }: Props) {
  const { user, signOut } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  if (!open) return null;

  const handleDeleteAccount = async () => {
    if (!user) return;
    setDeleting(true);
    setDeleteError("");
    try {
      const { error } = await supabase.functions.invoke("delete-user-account");
      if (error) throw error;
      await signOut();
    } catch (e: any) {
      setDeleteError(e.message || "Erro ao excluir conta. Tente novamente.");
      setDeleting(false);
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
          className="w-full max-w-2xl max-h-[85vh] rounded-2xl border border-white/10 bg-[hsl(220,30%,12%)] shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(160,60%,40%)] to-[hsl(160,60%,30%)] flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-white">Política de Privacidade</h2>
                <p className="text-xs text-white/40">Versão 1.1 – Em conformidade com a LGPD</p>
              </div>
            </div>
            <button onClick={onClose} aria-label="Fechar" className="text-white/40 hover:text-white transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto p-6 space-y-5 text-sm text-white/70 leading-relaxed flex-1">
            {/* Resumo LGPD */}
            <div className="p-4 rounded-xl bg-[hsl(160,60%,40%)]/10 border border-[hsl(160,60%,40%)]/20">
              <p className="text-white/90 font-medium text-sm">
                🛡️ Valorizamos sua privacidade. Seus dados são coletados apenas para a prestação de nossos serviços e tratados com segurança. De acordo com a <strong>Lei Geral de Proteção de Dados (Lei nº 13.709/2018)</strong>, você tem o direito de acessar, corrigir ou excluir suas informações a qualquer momento.
              </p>
            </div>

            <section>
              <h3 className="text-white font-semibold mb-2">1. Informações Gerais</h3>
              <p>
                Esta política explica como o <strong className="text-white/90">Simulador CTFL</strong> trata as informações coletadas através do nosso site e aplicativo. 
                Nosso objetivo é fornecer uma ferramenta de estudo interativa para a certificação ISTQB CTFL 4.0 com total transparência, em conformidade com a LGPD.
              </p>
            </section>

            <section>
              <h3 className="text-white font-semibold mb-2">2. Coleta de Dados e Finalidade</h3>
              <p className="mb-2">Os dados coletados têm como base legal o consentimento do usuário e a execução do serviço contratado (Art. 7º, I e V da LGPD):</p>
              <ul className="space-y-2 list-disc list-inside">
                <li>
                  <strong className="text-white/90">Dados de Cadastro:</strong> Nome, e-mail e senha (criptografada) para autenticação e personalização da experiência.
                </li>
                <li>
                  <strong className="text-white/90">Dados de Simulado:</strong> Armazenamos seu progresso nas questões (acertos, erros e tempo de resposta) para exibir seu desempenho e gerar relatórios de estudo.
                </li>
                <li>
                  <strong className="text-white/90">Armazenamento Local:</strong> Utilizamos tecnologias como LocalStorage para salvar preferências de estudo e progresso atual no dispositivo.
                </li>
                <li>
                  <strong className="text-white/90">Identificadores de Dispositivo:</strong> Informações anônimas de hardware para garantir a compatibilidade da interface responsiva.
                </li>
              </ul>
            </section>

            <section>
              <h3 className="text-white font-semibold mb-2">3. Seus Direitos (LGPD – Art. 18)</h3>
              <p className="mb-2">Conforme a Lei Geral de Proteção de Dados, você tem direito a:</p>
              <ul className="space-y-1.5 list-disc list-inside">
                <li>Confirmação da existência de tratamento de dados</li>
                <li>Acesso aos seus dados pessoais</li>
                <li>Correção de dados incompletos, inexatos ou desatualizados</li>
                <li>Anonimização, bloqueio ou eliminação de dados desnecessários</li>
                <li>Portabilidade dos dados a outro fornecedor</li>
                <li>Eliminação dos dados pessoais tratados com consentimento</li>
                <li>Revogação do consentimento a qualquer momento</li>
              </ul>
            </section>

            <section>
              <h3 className="text-white font-semibold mb-2">4. Segurança dos Dados</h3>
              <p>
                O site opera integralmente sob protocolo <strong className="text-white/90">HTTPS</strong>, garantindo que toda a interação entre o aplicativo e o servidor seja criptografada. 
                Senhas são armazenadas com hash criptográfico e nunca em texto plano. Adotamos medidas técnicas e administrativas aptas a proteger os dados pessoais conforme Art. 46 da LGPD.
              </p>
            </section>

            <section>
              <h3 className="text-white font-semibold mb-2">5. Permissões do Aplicativo</h3>
              <p>O aplicativo solicita apenas as permissões estritamente necessárias:</p>
              <ul className="mt-2 list-disc list-inside">
                <li><strong className="text-white/90">Acesso à Internet:</strong> Necessário para carregar o banco de questões e atualizações do simulador.</li>
              </ul>
            </section>

            <section>
              <h3 className="text-white font-semibold mb-2">6. Exclusão de Dados e Conta</h3>
              <p>
                O usuário pode solicitar a exclusão completa de sua conta e todos os dados associados a qualquer momento, 
                conforme garantido pela LGPD. Ao excluir a conta, <strong className="text-destructive">todos os dados serão apagados permanentemente</strong> de nossos servidores, incluindo perfil, histórico de simulados e resultados.
              </p>
              <p className="mt-2">
                A exclusão pode ser feita diretamente nas configurações do aplicativo (menu lateral → "Excluir Conta") ou solicitada pelo e-mail de contato abaixo.
              </p>
            </section>

            <section>
              <h3 className="text-white font-semibold mb-2">7. Encarregado de Dados (DPO)</h3>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <p><strong className="text-white/90">Nome:</strong> Anderson dos Santos Silva</p>
                <p><strong className="text-white/90">E-mail:</strong> <span className="text-[hsl(160,60%,50%)]">andersonsilva1292@hotmail.com</span></p>
                <p><strong className="text-white/90">WhatsApp:</strong> <span className="text-[hsl(160,60%,50%)]">+55 62 99817-5021</span></p>
              </div>
            </section>

            <section>
              <h3 className="text-white font-semibold mb-2">8. Alterações nesta Política</h3>
              <p>
                Reservamo-nos o direito de atualizar esta política a qualquer momento. Notificaremos os usuários sobre mudanças significativas por meio do aplicativo.
              </p>
            </section>

            {/* Delete Account Section */}
            {showDeleteOption && user && (
              <section className="pt-4 border-t border-white/10">
                <h3 className="text-destructive font-semibold mb-3">⚙️ Exclusão de Conta</h3>
                {!showDeleteConfirm ? (
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive font-semibold text-sm hover:bg-destructive/20 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    🗑️ Excluir Minha Conta
                  </motion.button>
                ) : (
                  <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 space-y-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-white font-semibold text-sm">⚠️ Atenção: Esta ação é irreversível!</p>
                        <p className="text-white/70 text-sm mt-2">
                          Você tem certeza de que deseja excluir sua conta? Ao confirmar, <strong className="text-destructive">todos os seus dados pessoais e históricos serão apagados permanentemente</strong> de nossos servidores, conforme a LGPD. Esta ação não poderá ser desfeita.
                        </p>
                      </div>
                    </div>
                    {deleteError && <p className="text-xs text-destructive">{deleteError}</p>}
                    <div className="flex gap-3">
                      <button
                        onClick={() => { setShowDeleteConfirm(false); setDeleteError(""); }}
                        className="flex-1 h-11 rounded-xl border border-white/10 text-white/70 font-medium text-sm hover:bg-white/5 transition-colors"
                      >
                        CANCELAR
                      </button>
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleDeleteAccount}
                        disabled={deleting}
                        className="flex-1 h-11 rounded-xl bg-destructive text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-opacity"
                      >
                        {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "CONFIRMAR EXCLUSÃO"}
                      </motion.button>
                    </div>
                  </div>
                )}
              </section>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/10">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-[hsl(160,60%,40%)] to-[hsl(160,60%,50%)] text-white font-semibold text-sm shadow-lg"
            >
              Entendi
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
