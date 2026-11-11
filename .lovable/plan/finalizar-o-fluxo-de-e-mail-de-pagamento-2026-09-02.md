# Finalizar o fluxo de e-mail de pagamento

Fechar os itens abertos do roadmap que dependem apenas de código: infraestrutura de envio, modelos de e-mail, página de descadastro e deploy das funções.

## O que será feito

1. **Infraestrutura de e-mail transacional**
   - Provisionar o envio transacional do projeto e criar a função `send-transactional-email` que `_shared/payment-email.ts` já invoca (hoje ela não existe, e o envio grava erro em `confirmation_email_error`).
   - Enquanto o domínio remetente do proprietário não estiver verificado, o envio usa o remetente padrão da plataforma.

2. **Modelos de e-mail**
   - `payment-confirmation` (aluno): confirmação da compra com produto, valor, método, data em horário de Brasília, validade do acesso e botão para entrar na plataforma.
   - `payment-notice-owner` (proprietário): aviso de nova venda com nome, e-mail do aluno, valor e método.
   - Visual alinhado à identidade: tema escuro, destaque esmeralda/teal, assinatura discreta "Desenvolvido por Anderson dos Santos Silva".

3. **Página pública de descadastro**
   - Rota pública `/descadastro` com a identidade da plataforma, confirmação da ação e feedback em modal, sem exigir login.
   - Link de descadastro incluído no rodapé dos e-mails.

4. **Deploy e verificação**
   - Publicar `create-checkout`, `payments-webhook` e `resend-payment-confirmation`.
   - Testar o reenvio pela área `/administracao` e conferir os logs das funções.
   - Atualizar o `roadmap.md` marcando os itens concluídos.

## Detalhes técnicos

- Nova função `supabase/functions/send-transactional-email/index.ts` (`verify_jwt = false`, chamada apenas com a chave de serviço), com chave de idempotência já enviada por `payment-email.ts`.
- Modelos em `supabase/functions/_shared/email-templates.ts`, renderizando HTML + texto puro.
- Nova página `src/pages/Descadastro.tsx` e rota pública em `src/App.tsx`, com `Seo` e `noindex`.
- Nenhuma alteração nas regras de acesso, RLS ou no fluxo de checkout existente.

## Fora do escopo

- Verificação do domínio remetente (ação do proprietário).
- Go-live do provedor de pagamento.
- Portal do cliente para cancelar/alterar plano.
