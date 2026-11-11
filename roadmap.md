# Roadmap

## Dependency security
- [x] Update vulnerable dependencies and refresh locked transitive versions.
- [x] Verify locked versions, clean production dependency scan, successful preview build, and public route smoke checks.
- [ ] Run Vitest suite (blocked: sandbox canvas native binary is missing; test environment fails before collection).

## Pagamentos e monetização (em andamento)
- [x] Produto e preços no provedor: `acesso_completo` com `acesso_fundador_onetime` (R$ 97) e `acesso_fundador_mensal` (R$ 29,90/mês)
- [x] Banco: `subscriptions`, `payments`, `course_access`, `user_sessions`, `user_roles` (master_admin/aluno), trial de 24h em `profiles`
- [x] Edge functions `create-checkout` (PIX + cartão, checkout embutido) e `payments-webhook`
- [x] Página `/assinatura` com oferta, garantia de 7 dias, PIX (QR/copia e cola) e cartão
- [x] Bloqueio automático dos módulos após 24h sem pagamento (`AccessGuard`)
- [x] Área `/administracao` exclusiva do proprietário (cadastros, online agora, pagamentos)
- [x] Renovação mensal tratada (`invoice.paid`, `invoice.payment_succeeded`, `invoice.payment_failed`)
- [x] Reembolso e contestação encerram o acesso (`charge.refunded`, `charge.dispute.created`)
- [x] Botão de reembolso no `/administracao` (garantia de 7 dias)
- [x] Cancelamento mantém o acesso até o fim do período pago (`has_platform_access`, `useAccess`, webhook)
- [x] Página `/minha-conta` com situação do acesso, assinatura, histórico e portal de cobrança
- [x] Reconciliação de compra (`sync-checkout-session`) com nova tentativa automática no retorno do PIX
- [ ] Validação do fluxo de compra em ambiente de teste
- [ ] Go-live do provedor de pagamento (ação do proprietário) + chaves do ambiente real

## Backlog
- [x] Reformular a sala de estudo de Automação com painel EAD, roteiro curricular, objetivos K1/K2/K3 e transições suaves
- [x] Corrigir a piscada dos slides causada pela recriação do palco durante o progresso do áudio
- [x] Substituir no aplicativo o player antigo de slides por reprodução de MP4 privado já publicado
- [ ] Produzir e publicar as 15 vídeo-aulas MP4 no estilo do vídeo de referência (bloqueado: saldo de geração de IA zerado)
- [ ] Notificação por e-mail de boas-vindas e de pagamento aprovado (requer infraestrutura de e-mail)
- [ ] Modelos `payment-confirmation` e `payment-notice-owner` + página pública de descadastro

## Anderson Academy (RF/RNF Apple iOS Glass)
- [x] Preço único R$ 19,99 (PIX ou cartão), plano mensal removido da compra
- [x] Nome Anderson Academy em todo o site
- [x] Cores Apple, vidro fosco, ícones squircle, transições elásticas (RNF01–03)
- [x] Tutor de IA no topo estilo Dynamic Island (RF06)
- [x] Prova final uma questão por vez, sorteio, "Parabéns!" com justificativa, 75% (RF02–RF05)
- [x] Conclusão da etapa ao lado do Progresso do curso (RF07)
- [ ] Interface enxuta com expansão sob demanda em todas as páginas (RF08) e guias/modais em todo o sistema (RF09)
- [ ] Conectar andersonacademy.com.br (ação do proprietário) e depois trocar endereço oficial do site/sitemap (RF01)
