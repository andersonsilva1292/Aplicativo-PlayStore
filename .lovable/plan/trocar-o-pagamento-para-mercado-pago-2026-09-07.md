# Trocar o pagamento para Mercado Pago

Substituir por completo o provedor de pagamento atual pelo Mercado Pago, mantendo tudo dentro do app (sem levar o aluno para fora), com PIX e cartão na compra única de R$ 97 e assinatura mensal de R$ 29,90 no cartão.

## O que muda para o aluno

- Tela de compra continua igual: escolhe o plano (único ou mensal) e a forma de pagamento.
- **PIX**: aparece o QR Code e o código "copia e cola" dentro da própria página, com validade de 30 minutos. O acesso libera sozinho assim que o pagamento cai.
- **Cartão**: os dados são digitados em campos seguros do Mercado Pago embutidos na página; nada de cartão passa pelo app.
- **Mensal**: cobrança automática todo mês no cartão, com aviso da próxima data de cobrança.
- **Minha conta**: passa a mostrar plano, próxima cobrança, histórico de compras e um botão para cancelar a assinatura (o cancelamento passa a ser feito dentro do app, já que o Mercado Pago não tem portal do cliente como o provedor atual).
- Reembolso continua no painel de Administração, agora acionando o estorno no Mercado Pago.

## O que você precisa fornecer

1. Uma conta de vendedor no Mercado Pago (Brasil) com a chave PIX cadastrada.
2. Em "Suas integrações" no painel do Mercado Pago, criar uma aplicação e me passar, pelo formulário seguro:
   - Access Token de **teste** e Public Key de **teste**;
   - Access Token de **produção** e Public Key de **produção** (quando quiser cobrar de verdade).
3. Depois de eu publicar a nova versão, colar no painel do Mercado Pago o endereço de aviso automático (webhook) que eu vou te entregar.

## Etapas da implementação

1. **Guardar as credenciais** com segurança e criar o utilitário de comunicação com o Mercado Pago (ambiente de teste e de produção separados).
2. **Compra única (PIX e cartão)**: nova função que cria o pagamento, devolve QR Code/código do PIX ou processa o cartão, e registra a intenção de compra no histórico.
3. **Assinatura mensal**: nova função que cria a assinatura recorrente a partir do cartão informado, além de funções para cancelar e consultar.
4. **Aviso automático (webhook)**: nova função que recebe as notificações do Mercado Pago, confere a autenticidade da mensagem, consulta o pagamento na origem e então libera, renova ou bloqueia o acesso — cobrindo pagamento aprovado, recusado, estornado, contestado, renovação mensal paga e falha de renovação.
5. **Confirmação na volta da compra**: adaptar a tela de retorno para consultar o Mercado Pago até o pagamento ser reconhecido, como já funciona hoje.
6. **Telas**: adaptar a tela de compra (QR Code do PIX + campos de cartão), "Minha conta" (cancelar assinatura no lugar do portal externo) e Administração (estorno via Mercado Pago).
7. **Limpeza**: remover o código, as telas e os avisos do provedor antigo, incluindo o pacote de cartão que não será mais usado.
8. **Banco de dados**: registrar os identificadores do Mercado Pago no histórico de compras e nas assinaturas, preservando as compras antigas.
9. **E-mails**: manter os avisos de compra aprovada para o aluno e para você, agora com os dados do Mercado Pago.

## Detalhes técnicos

- Novos segredos: `MERCADOPAGO_ACCESS_TOKEN_TEST`, `MERCADOPAGO_ACCESS_TOKEN_PROD`, `MERCADOPAGO_WEBHOOK_SECRET`; chaves públicas via `VITE_MP_PUBLIC_KEY_TEST` / `VITE_MP_PUBLIC_KEY_PROD`.
- Novo `supabase/functions/_shared/mercadopago.ts`: cliente REST (`https://api.mercadopago.com`) com `X-Idempotency-Key`, seleção de ambiente e verificação da assinatura `x-signature` (HMAC-SHA256 sobre `id`, `request-id`, `ts`).
- Novas funções: `mp-create-payment` (POST `/v1/payments` com `payment_method_id: pix | card token`, `date_of_expiration` 30 min), `mp-create-subscription` (POST `/preapproval` com `card_token_id`, `auto_recurring` mensal em BRL), `mp-cancel-subscription`, `mp-sync-payment` (substitui `sync-checkout-session`), `mp-webhook` (`verify_jwt = false`).
- Frontend: SDK `@mercadopago/sdk-react` (Card Payment Brick) substituindo `@stripe/*`; `src/lib/mercadopago.ts` no lugar de `src/lib/stripe.ts`.
- Migração: em `payments` adicionar `mp_payment_id`, `mp_preference_id`, `provider` (default `mercadopago`); em `subscriptions` adicionar `mp_preapproval_id` e tornar `stripe_subscription_id` opcional; manter `environment` (`test` | `prod`). Grants e RLS já existentes preservados.
- Catálogo de produtos: o Mercado Pago não tem catálogo sincronizado — preços passam a ser definidos em uma tabela `plans` (id, nome, valor em centavos, recorrência) lida pela tela de compra e pelas funções.
- Regra de acesso em `useAccess`/`has_platform_access` permanece a mesma; só muda a origem dos dados.
- Arquivos removidos: `src/lib/stripe.ts`, `src/components/StripeEmbeddedCheckout.tsx`, `src/components/PaymentTestModeBanner.tsx`, `supabase/functions/_shared/stripe.ts`, `create-checkout`, `create-portal-session`, `sync-checkout-session`, `refund-payment` (substituída por `mp-refund-payment`), `payments-webhook`.

## Como testar na pré-visualização

1. Com as credenciais de **teste**, criar no painel do Mercado Pago um comprador de teste (usuário e senha de teste).
2. **PIX**: escolher o plano único, gerar o QR Code e aprovar o pagamento com o comprador de teste — o acesso deve liberar em segundos.
3. **Cartão aprovado**: usar `5031 4332 1540 6351`, validade `11/30`, CVV `123`, nome `APRO`, CPF `12345678909`.
4. **Cartão recusado**: mesmo cartão com nome `OTHE` — a tela deve mostrar recusa e não liberar acesso.
5. **Mensal**: assinar com o cartão aprovado e conferir em "Minha conta" o plano ativo e a data da próxima cobrança; depois cancelar e confirmar que o acesso segue até o fim do período pago.
6. **Estorno**: em Administração, estornar a compra de teste e confirmar que o histórico muda para "Reembolsado" e o acesso é bloqueado.
