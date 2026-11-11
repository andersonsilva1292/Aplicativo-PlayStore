import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import AccessGuard from "@/components/AccessGuard";
import Materiais from "./pages/Materiais";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Chat from "./pages/Chat";
import Trilhas from "./pages/Trilhas";
import Simulados from "./pages/Simulados";
import Relatorios from "./pages/Relatorios";
import Syllabus from "./pages/Syllabus";
import PreparacaoCtfl from "./pages/PreparacaoCtfl";
import Inicio from "./pages/Inicio";
import Automacao from "./pages/Automacao";
import Trajetoria from "./pages/Trajetoria";
import BancoQuestoes from "./pages/BancoQuestoes";
import LaboratorioJava from "./pages/LaboratorioJava";
import PraticaDigitacao from "./pages/PraticaDigitacao";
import Assinatura from "./pages/Assinatura";
import MinhaConta from "./pages/MinhaConta";
import AdminSite from "./pages/AdminSite";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/inicio" element={<ProtectedRoute><Inicio /></ProtectedRoute>} />
            <Route path="/trajetoria" element={<ProtectedRoute><AccessGuard><Trajetoria /></AccessGuard></ProtectedRoute>} />
            <Route path="/banco-questoes" element={<ProtectedRoute><AccessGuard><BancoQuestoes /></AccessGuard></ProtectedRoute>} />
            <Route path="/laboratorio-java" element={<ProtectedRoute><AccessGuard><LaboratorioJava /></AccessGuard></ProtectedRoute>} />
            <Route path="/pratica-digitacao" element={<ProtectedRoute><AccessGuard><PraticaDigitacao /></AccessGuard></ProtectedRoute>} />
            <Route path="/automacao" element={<ProtectedRoute><AccessGuard><Automacao /></AccessGuard></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><AccessGuard><Dashboard /></AccessGuard></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><AccessGuard><Chat /></AccessGuard></ProtectedRoute>} />
            <Route path="/trilhas" element={<ProtectedRoute><AccessGuard><Trilhas /></AccessGuard></ProtectedRoute>} />
            <Route path="/simulados" element={<ProtectedRoute><AccessGuard><Simulados /></AccessGuard></ProtectedRoute>} />
            <Route path="/relatorios" element={<ProtectedRoute><AccessGuard><Relatorios /></AccessGuard></ProtectedRoute>} />
            <Route path="/assinatura" element={<ProtectedRoute><Assinatura /></ProtectedRoute>} />
            <Route path="/minha-conta" element={<ProtectedRoute><MinhaConta /></ProtectedRoute>} />
            <Route path="/administracao" element={<ProtectedRoute><AdminSite /></ProtectedRoute>} />
            <Route path="/syllabus" element={<Syllabus />} />
            <Route path="/preparacao-ctfl" element={<PreparacaoCtfl />} />
            <Route path="/materiais" element={<ProtectedRoute><AccessGuard><Materiais /></AccessGuard></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
