# E-mail de confirmação de pagamento

Objetivo: quando um pagamento for realmente aprovado, o aluno recebe um e-mail de confirmação com a marca da plataforma, e você recebe uma cópia. Na aba de administração cada pagamento aprovado passa a mostrar se o e-mail saiu e um botão para reenviar.

## Etapa 1 — Domínio remetente (sua ação)

Você informa o domínio que já possui na tela de configuração de e-mail. A partir dele os e-mails saem de um endereço próprio, por exemplo `pagamentos@avisos.seudominio.com.br`, com o seu Hotmail como endereço de resposta.

A configuração pede a inclusão de alguns registros no seu provedor de domínio. A verificação costuma levar de alguns minutos até algumas horas. Enquanto não estiver verificado, nada quebra: os e-mails ficam em fila e saem sozinhos assim que o domínio for aprovado.

## Etapa 2 — O e-mail de confirmação

Conteúdo enviado ao aluno:

- Confirmação de que o pagamento foi aprovado.
- Nome do aluno, produto adquirido, valor, forma de pagamento (PIX ou cartão) e data.
- Até quando o acesso está liberado.
- Botão para entrar na plataforma.
- Aviso de que dúvidas podem ser respondidas direto no e-mail.

Visual alinhado à identidade da plataforma (tons esmeralda/teal, tipografia da marca), em formato claro e legível em qualquer aplicativo de e-mail.

Você recebe uma cópia de cada confirmação em `andersonsilva1292@hotmail.com`, com os mesmos dados mais o e-mail do aluno.

## Etapa 3 — Disparo automático

O e-mail sai apenas quando o pagamento é de fato confirmado:

- PIX pago (não no momento em que o código é apenas gerado).
- Cartão aprovado.
- Assinatura mensal: na primeira cobrança aprovada.

Cada pagamento gera no máximo um envio automático, mesmo que o provedor avise duas vezes sobre a mesma compra.

## Etapa 4 — Controle na aba de administração

Na tabela de pagamentos, cada linha aprovada ganha:

- Indicação de **Enviado** com data e hora, ou **Não enviado**.
- Botão **Reenviar confirmação**, útil se o aluno apagou o e-mail ou digitou o endereço errado.
- Confirmação visual de sucesso ou de falha no reenvio.

Pagamentos aguardando ou recusados não mostram o botão.

## Detalhes técnicos

- Domínio de envio provisionado pela infraestrutura de e-mail do Lovable Cloud (fila com repetição automática, lista de bloqueios e descadastro já inclusos).
- Nova coluna `confirmation_email_sent_at` em `payments`, usada como trava de idempotência.
- Modelo `payment-confirmation` (React Email) e modelo interno `payment-notice-owner` para a sua cópia.
- Envio disparado dentro de `payments-webhook`, nos eventos `checkout.session.completed` (quando `payment_status !== "unpaid"`), `async_payment_succeeded` e `invoice.paid` da assinatura, com chave de idempotência `payment-confirmation-{stripe_session_id}`.
- Nova função `resend-payment-confirmation`, restrita ao papel `master_admin` (validação do token no servidor), consumida pelo botão de reenvio em `/administracao`.
- Página pública de descadastro no caminho gerado pela infraestrutura, com layout da plataforma.
- O e-mail de recuperação de senha e de cadastro passam a sair pelo mesmo domínio, com a marca da plataforma.

## Fora deste escopo

- Boletim informativo, promoções ou qualquer envio em massa.
- Anexos em PDF no e-mail: o material continua acessível apenas dentro da plataforma, por link.
