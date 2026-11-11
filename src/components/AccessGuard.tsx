import { Navigate, useLocation } from "react-router-dom";
import { useAccess } from "@/hooks/useAccess";
import { Loader2 } from "lucide-react";

/**
 * Bloqueia módulos pagos quando o teste gratuito de 24h expirou e não há
 * pagamento ativo. Sempre redireciona para a página de assinatura.
 */
export default function AccessGuard({ children }: { children: React.ReactNode }) {
  const { loading, hasAccess } = useAccess();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60dvh] grid place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!hasAccess) {
    return <Navigate to="/assinatura" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}
