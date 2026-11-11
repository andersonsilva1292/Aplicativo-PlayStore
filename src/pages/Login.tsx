import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Mail, Lock, User, ArrowRight, Eye, EyeOff, Loader2, Bot, Cog, Coffee, FileCheck2, ClipboardCheck, Route as RouteIcon, ShieldCheck, Gauge, Check, X as XIcon, TimerReset } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { lovable } from "@/integrations/lovable/index";
import { passwordRules, isPasswordValid, passwordStrength, strengthLabels } from "@/lib/password";
import { clearAttempts, formatLock, lockMsLeft, registerFailure, MAX_ATTEMPTS } from "@/lib/login-attempts";
import FeedbackModal from "@/components/FeedbackModal";
import PrivacyPolicyModal from "@/components/PrivacyPolicyModal";
import Seo from "@/components/Seo";
import loginBg from "@/assets/login-bg.jpg";
import loginIllustration from "@/assets/login-illustration.png";

const floatingItems = [
  { icon: ShieldCheck, label: "QA", delay: 0 },
  { icon: Gauge, label: "QC", delay: 0.15 },
  { icon: Bot, label: "Automação", delay: 0.3 },
];

const highlights = [
  { icon: Cog, title: "Automação de Testes", text: "Selenium, Cucumber, JUnit", accent: "hsl(190,80%,55%)" },
  { icon: Coffee, title: "Java & Maven", text: "Projeto real, do zero ao relatório", accent: "hsl(160,60%,50%)" },
  { icon: FileCheck2, title: "Gherkin / BDD", text: "Cenários legíveis pelo negócio", accent: "hsl(265,70%,65%)" },
  { icon: ClipboardCheck, title: "Relatórios", text: "ExtentReports e evidências", accent: "hsl(190,80%,55%)" },
  { icon: ShieldCheck, title: "Simulados QA/QC", text: "Prática por capítulo com IA", accent: "hsl(160,60%,50%)" },
  { icon: RouteIcon, title: "Trilha Guiada", text: "Vídeo-aula, PDF e exercícios", accent: "hsl(265,70%,65%)" },
];


export default function Login() {
  const [isSignup, setIsSignup] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [lockLeft, setLockLeft] = useState(() => lockMsLeft());
  const [feedback, setFeedback] = useState<{ open: boolean; type: "success" | "error" | "info"; title: string; message: string }>({ open: false, type: "info", title: "", message: "" });
  const [showPrivacy, setShowPrivacy] = useState(false);
  const navigate = useNavigate();
  const { signIn, signUp, user, signInWithGoogle } = useAuth();

  const showFeedback = (type: "success" | "error" | "info", title: string, message: string) => {
    setFeedback({ open: true, type, title, message });
  };

  // Contador do bloqueio temporário por tentativas erradas.
  useEffect(() => {
    if (lockLeft <= 0) return;
    const id = setInterval(() => setLockLeft(lockMsLeft()), 1000);
    return () => clearInterval(id);
  }, [lockLeft]);

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      const result = await signInWithGoogle();
      if (result.error) {
        showFeedback("error", "Erro com o Google", "Não foi possível entrar com o Google: " + result.error);
        return;
      }
      navigate("/inicio");
    } finally {
      setGoogleLoading(false);
    }
  };

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/inicio", { replace: true });
    }
  }, [user, navigate]);

  if (user) {
    return null;
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      showFeedback("error", "Campo obrigatório", "Informe seu e-mail para recuperar a senha.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await (await import("@/integrations/supabase/client")).supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        showFeedback("error", "Erro ao enviar", "Não foi possível enviar o e-mail. Verifique o endereço e tente novamente.");
      } else {
        showFeedback("success", "E-mail enviado!", "Enviamos um link de recuperação para seu e-mail. Verifique sua caixa de entrada e spam.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const locked = lockMsLeft();
    if (locked > 0) {
      setLockLeft(locked);
      showFeedback(
        "error",
        "Acesso bloqueado temporariamente",
        `Muitas tentativas incorretas. Tente novamente em ${formatLock(locked)} ou recupere sua senha.`
      );
      return;
    }

    if (!email || !password) {
      showFeedback("error", "Campos obrigatórios", "Preencha todos os campos para continuar.");
      return;
    }
    if (isSignup) {
      if (!name.trim()) {
        showFeedback("error", "Nome obrigatório", "Preencha seu nome para criar a conta.");
        return;
      }
      if (!isPasswordValid(password)) {
        showFeedback("error", "Senha fraca", "A senha precisa ter no mínimo 8 caracteres, com pelo menos uma letra e um número.");
        return;
      }
      if (password !== confirmPassword) {
        showFeedback("error", "Senhas diferentes", "A confirmação não corresponde à senha digitada.");
        return;
      }
      if (!acceptedPrivacy) {
        showFeedback("error", "Consentimento necessário", "Para criar a conta é preciso aceitar a Política de Privacidade (LGPD).");
        return;
      }
    }

    setLoading(true);
    try {
      if (isSignup) {
        const { error } = await signUp(email.trim(), password, name.trim());
        if (error) {
          if (error.includes("already registered") || error.includes("already been registered")) {
            showFeedback("error", "E-mail já cadastrado", "Este e-mail já está em uso. Tente fazer login ou use outro e-mail.");
          } else if (error.toLowerCase().includes("weak") || error.toLowerCase().includes("known to be")) {
            showFeedback("error", "Senha comprometida", "Essa senha já apareceu em vazamentos públicos. Escolha uma senha diferente e exclusiva desta plataforma.");
          } else if (error.toLowerCase().includes("rate limit")) {
            showFeedback("error", "Muitas tentativas", "Aguarde alguns minutos antes de tentar novamente.");
          } else {
            showFeedback("error", "Erro ao criar conta", error);
          }
        } else {
          showFeedback("success", "Conta criada com sucesso! 🎉", "Bem-vindo(a) ao Anderson Academy! Enviamos um e-mail de confirmação. Verifique sua caixa de entrada para ativar sua conta.");
        }
      } else {
        const { error } = await signIn(email.trim(), password);
        if (error) {
          if (error.includes("Invalid login credentials")) {
            const { attemptsLeft, lockedMs } = registerFailure();
            if (lockedMs > 0) {
              setLockLeft(lockedMs);
              showFeedback(
                "error",
                "Acesso bloqueado temporariamente",
                `Foram ${MAX_ATTEMPTS} tentativas incorretas. Aguarde ${formatLock(lockedMs)} ou use "Esqueci minha senha".`
              );
            } else {
              showFeedback(
                "error",
                "Credenciais inválidas",
                `E-mail ou senha incorretos. Você ainda tem ${attemptsLeft} tentativa(s) antes do bloqueio temporário.`
              );
            }
          } else if (error.includes("Email not confirmed")) {
            showFeedback("info", "E-mail não confirmado", "Sua conta ainda não foi ativada. Verifique sua caixa de entrada e clique no link de confirmação.");
          } else {
            showFeedback("error", "Erro de autenticação", "Não foi possível validar suas credenciais. Tente novamente mais tarde.");
          }
        } else {
          clearAttempts();
          navigate("/inicio");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      <Seo
        title="Entrar ou criar conta | Anderson Academy — Simulados CTFL"
        description="Acesse sua conta ou cadastre-se grátis para estudar para a certificação ISTQB CTFL com simulados, trilhas guiadas e curso de automação de testes."
        path="/"
      />

      <div className="absolute inset-0">
        <img src={loginBg} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-[hsl(220,30%,8%)]/80" />
      </div>

      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-[120px]"
        style={{ background: "hsl(160, 60%, 40%)" }}
        animate={{ scale: [1, 1.2, 1], x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-15 blur-[100px]"
        style={{ background: "hsl(220, 70%, 45%)" }}
        animate={{ scale: [1, 1.3, 1], x: [0, -25, 0], y: [0, 25, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Left - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 relative z-10 flex-col justify-center items-center p-12">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-lg text-center">
          <motion.img src={loginIllustration} alt="Estudante preparando-se para a certificação CTFL" className="w-80 h-80 mx-auto mb-8 drop-shadow-2xl" animate={{ y: [0, -12, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} />
          <h2 className="font-display text-3xl font-bold text-white mb-3">
            Sua jornada para a <span className="text-[hsl(160,60%,50%)]">certificação</span> começa aqui
          </h2>
          <p className="text-white/60 text-lg mb-8">Estude com inteligência artificial, simulados adaptativos e trilhas personalizadas</p>
          <div className="flex justify-center gap-4">
            {floatingItems.map((item) => (
              <motion.div key={item.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + item.delay, duration: 0.5 }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                <item.icon className="h-4 w-4 text-[hsl(160,60%,50%)]" />
                <span className="text-sm text-white/80 font-medium">{item.label}</span>
              </motion.div>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-10 text-left">
            {highlights.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + i * 0.08, duration: 0.45 }}
                whileHover={{ y: -4 }}
                className="flex items-start gap-3 px-4 py-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/25 transition-colors"
              >
                <span className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-lg" style={{ background: `${item.accent.replace("hsl(", "hsla(").replace(")", ", 0.15)")}` }}>
                  <item.icon className="h-4.5 w-4.5" style={{ color: item.accent, width: 18, height: 18 }} />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-white/90 leading-tight">{item.title}</span>
                  <span className="block text-xs text-white/45 mt-0.5">{item.text}</span>
                </span>
              </motion.div>
            ))}
          </div>

        </motion.div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-8 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-md">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }} className="text-center mb-10">
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[hsl(160,60%,40%)] to-[hsl(160,60%,30%)] shadow-lg shadow-[hsl(160,60%,40%)]/25">
                <GraduationCap className="h-7 w-7 text-white" />
              </span>
              <span className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[hsl(190,80%,45%)] to-[hsl(265,70%,45%)] shadow-lg shadow-[hsl(190,80%,45%)]/25">
                <Bot className="h-7 w-7 text-white" />
              </span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[hsl(160,60%,60%)] via-white to-[hsl(190,80%,65%)] bg-clip-text text-transparent">
              Estudos para Certificação
            </h1>
            <p className="font-display text-lg text-white/70 mt-1.5 tracking-wide">Prep — QA &amp; QC</p>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {[
                { icon: ShieldCheck, label: "QA (Quality Assurance)" },
                { icon: Gauge, label: "QC (Quality Control)" },
              ].map((tag) => (
                <span key={tag.label} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-[11px] text-white/70">
                  <tag.icon className="h-3.5 w-3.5 text-[hsl(160,60%,55%)]" />
                  {tag.label}
                </span>
              ))}
            </div>
          </motion.div>


          <motion.div layout className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl">
            <AnimatePresence mode="wait">
              <motion.div key={isForgotPassword ? "forgot" : isSignup ? "signup" : "login"} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                
                {isForgotPassword ? (
                  <>
                    <h2 className="font-display text-xl font-bold text-white mb-1">Recuperar senha</h2>
                    <p className="text-white/40 text-sm mb-6">Informe seu e-mail para receber o link de recuperação</p>
                    <form onSubmit={handleForgotPassword} className="space-y-4">
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                        <input type="email" placeholder="Seu e-mail cadastrado" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full h-12 pl-11 pr-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-[hsl(160,60%,40%)] focus:ring-1 focus:ring-[hsl(160,60%,40%)] transition-all" aria-label="E-mail para recuperação" />
                      </div>
                      <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} className="w-full h-12 rounded-xl bg-gradient-to-r from-[hsl(160,60%,40%)] to-[hsl(160,60%,50%)] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[hsl(160,60%,40%)]/20 hover:shadow-[hsl(160,60%,40%)]/30 transition-shadow disabled:opacity-60">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Enviar link <ArrowRight className="h-4 w-4" /></>}
                      </motion.button>
                    </form>
                    <p className="text-center text-sm text-white/40 mt-6">
                      <button onClick={() => setIsForgotPassword(false)} className="text-[hsl(160,60%,50%)] font-medium hover:underline">
                        Voltar ao login
                      </button>
                    </p>
                  </>
                ) : (
                  <>
                    <h2 className="font-display text-xl font-bold text-white mb-1">{isSignup ? "Criar Conta" : "Entrar"}</h2>
                    <p className="text-white/40 text-sm mb-6">{isSignup ? "Comece sua jornada de estudos agora" : "Continue sua preparação para o CTFL"}</p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <AnimatePresence>
                        {isSignup && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <div className="relative mb-4">
                              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                              <input placeholder="Seu nome" value={name} onChange={(e) => setName(e.target.value)} className="w-full h-12 pl-11 pr-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-[hsl(160,60%,40%)] focus:ring-1 focus:ring-[hsl(160,60%,40%)] transition-all" aria-label="Nome" />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full h-12 pl-11 pr-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-[hsl(160,60%,40%)] focus:ring-1 focus:ring-[hsl(160,60%,40%)] transition-all" aria-label="E-mail" />
                      </div>

                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                        <input type={showPassword ? "text" : "password"} autoComplete={isSignup ? "new-password" : "current-password"} placeholder={isSignup ? "Senha (mín. 8 caracteres)" : "Senha"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full h-12 pl-11 pr-12 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-[hsl(160,60%,40%)] focus:ring-1 focus:ring-[hsl(160,60%,40%)] transition-all" aria-label="Senha" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors" aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}>
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>

                      {isSignup && (
                        <>
                          <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                            <input
                              type={showPassword ? "text" : "password"}
                              autoComplete="new-password"
                              placeholder="Confirme a senha"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              className="w-full h-12 pl-11 pr-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-[hsl(160,60%,40%)] focus:ring-1 focus:ring-[hsl(160,60%,40%)] transition-all"
                              aria-label="Confirmar senha"
                            />
                          </div>

                          {password.length > 0 && (
                            <div className="rounded-xl border border-white/10 bg-white/5 p-3 space-y-2">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                                  <motion.div
                                    className="h-full rounded-full bg-gradient-to-r from-[hsl(160,60%,40%)] to-[hsl(190,80%,55%)]"
                                    animate={{ width: `${((passwordStrength(password) + 1) / 5) * 100}%` }}
                                    transition={{ duration: 0.3 }}
                                  />
                                </div>
                                <span className="text-[11px] text-white/50">{strengthLabels[passwordStrength(password)]}</span>
                              </div>
                              <ul className="space-y-1">
                                {passwordRules.map((rule) => {
                                  const ok = rule.test(password);
                                  return (
                                    <li key={rule.key} className="flex items-center gap-2 text-[11px]">
                                      {ok ? (
                                        <Check className="h-3.5 w-3.5 text-[hsl(160,60%,55%)]" />
                                      ) : (
                                        <XIcon className="h-3.5 w-3.5 text-white/30" />
                                      )}
                                      <span className={ok ? "text-white/70" : "text-white/40"}>{rule.label}</span>
                                    </li>
                                  );
                                })}
                                <li className="flex items-center gap-2 text-[11px]">
                                  {confirmPassword.length > 0 && confirmPassword === password ? (
                                    <Check className="h-3.5 w-3.5 text-[hsl(160,60%,55%)]" />
                                  ) : (
                                    <XIcon className="h-3.5 w-3.5 text-white/30" />
                                  )}
                                  <span className={confirmPassword.length > 0 && confirmPassword === password ? "text-white/70" : "text-white/40"}>
                                    Confirmação igual à senha
                                  </span>
                                </li>
                              </ul>
                              <p className="text-[11px] text-white/35">
                                Senhas já expostas em vazamentos públicos são recusadas automaticamente.
                              </p>
                            </div>
                          )}

                          <label className="flex items-start gap-2.5 text-[11px] text-white/50 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={acceptedPrivacy}
                              onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                              className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/5 accent-[hsl(160,60%,45%)]"
                              aria-label="Aceito a Política de Privacidade"
                            />
                            <span>
                              Li e aceito a{" "}
                              <button type="button" onClick={() => setShowPrivacy(true)} className="text-[hsl(160,60%,55%)] underline">
                                Política de Privacidade (LGPD)
                              </button>{" "}
                              e o tratamento dos meus dados para uso da plataforma.
                            </span>
                          </label>
                        </>
                      )}

                      {!isSignup && (
                        <div className="text-right">
                          <button type="button" onClick={() => setIsForgotPassword(true)} className="text-xs text-[hsl(160,60%,50%)] hover:underline">
                            Esqueci minha senha
                          </button>
                        </div>
                      )}

                      {lockLeft > 0 && (
                        <div className="flex items-center gap-2 rounded-xl border border-[hsl(0,72%,55%)]/30 bg-[hsl(0,72%,55%)]/10 px-3 py-2.5 text-[11px] text-white/70">
                          <TimerReset className="h-4 w-4 text-[hsl(0,72%,65%)] shrink-0" />
                          <span>Muitas tentativas incorretas. Novo login liberado em {formatLock(lockLeft)}.</span>
                        </div>
                      )}

                      <motion.button type="submit" disabled={loading || lockLeft > 0} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} className="w-full h-12 rounded-xl bg-gradient-to-r from-[hsl(160,60%,40%)] to-[hsl(160,60%,50%)] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[hsl(160,60%,40%)]/20 hover:shadow-[hsl(160,60%,40%)]/30 transition-shadow disabled:opacity-60">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>{isSignup ? "Cadastrar" : "Entrar"}<ArrowRight className="h-4 w-4" /></>}
                      </motion.button>
                    </form>

                    <div className="flex items-center gap-3 my-5">
                      <span className="h-px flex-1 bg-white/10" />
                      <span className="text-[11px] uppercase tracking-wide text-white/30">ou</span>
                      <span className="h-px flex-1 bg-white/10" />
                    </div>

                    <motion.button
                      type="button"
                      onClick={handleGoogle}
                      disabled={googleLoading}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full h-12 rounded-xl border border-white/15 bg-white/5 text-white font-medium text-sm flex items-center justify-center gap-2.5 hover:bg-white/10 transition-colors disabled:opacity-60"
                    >
                      {googleLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <svg className="h-4 w-4" viewBox="0 0 48 48" aria-hidden="true">
                            <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.6 30.2.5 24 .5 14.6.5 6.5 5.9 2.6 13.7l7.8 6.1C12.3 13.5 17.6 9.5 24 9.5z" />
                            <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.6c-.5 3-2.2 5.5-4.7 7.2l7.6 5.9c4.4-4.1 7-10.1 7-17.6z" />
                            <path fill="#FBBC05" d="M10.4 28.2c-.5-1.5-.8-3-.8-4.7s.3-3.2.8-4.7l-7.8-6.1C1 16 0 19.9 0 23.5s1 7.5 2.6 10.8l7.8-6.1z" />
                            <path fill="#34A853" d="M24 47.5c6.2 0 11.5-2 15.5-5.6l-7.6-5.9c-2.1 1.4-4.8 2.3-7.9 2.3-6.4 0-11.7-4-13.6-9.6l-7.8 6.1C6.5 42.1 14.6 47.5 24 47.5z" />
                          </svg>
                          Continuar com Google
                        </>
                      )}
                    </motion.button>


                    <p className="text-center text-sm text-white/40 mt-6">
                      {isSignup ? "Já tem conta?" : "Não tem conta?"}{" "}
                      <button onClick={() => setIsSignup(!isSignup)} className="text-[hsl(160,60%,50%)] font-medium hover:underline">
                        {isSignup ? "Entrar" : "Cadastre-se"}
                      </button>
                    </p>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>

          <div className="lg:hidden mt-8 flex justify-center gap-3">
            {floatingItems.map((item) => (
              <div key={item.label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                <item.icon className="h-3.5 w-3.5 text-[hsl(160,60%,50%)]" />
                <span className="text-xs text-white/60">{item.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
        <div className="flex flex-col items-center gap-2 mt-10 relative z-10">
          <button onClick={() => setShowPrivacy(true)} className="text-xs text-white/30 hover:text-white/60 underline transition-colors">
            Política de Privacidade
          </button>
          <p className="text-xs"><Link to="/preparacao-ctfl" className="text-white/60 hover:text-white underline">Conheça a preparação para o CTFL 4.0</Link> · <Link to="/syllabus" className="text-white/60 hover:text-white underline">Guia do Syllabus</Link></p>
          <p className="text-xs text-white/20">Desenvolvido por Anderson dos Santos Silva</p>
        </div>
      </div>
      <PrivacyPolicyModal open={showPrivacy} onClose={() => setShowPrivacy(false)} />
      <FeedbackModal
        open={feedback.open}
        type={feedback.type}
        title={feedback.title}
        message={feedback.message}
        onClose={() => setFeedback((f) => ({ ...f, open: false }))}
      />
    </div>
  );
}
