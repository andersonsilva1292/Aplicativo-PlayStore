# Finalizar troca para Mercado Pago + proteção dos arquivos de aula

## Contexto

A troca de provedor de pagamento para o Mercado Pago foi aprovada e já está parcialmente implementada. O que falta é publicar as novas funções do backend, receber as credenciais e corrigir a proteção do armazenamento de aulas.

## O que já foi feito

- **Banco de dados**: tabela `plans` com os dois planos (`acesso_fundador_onetime` R$ 97 e `acesso_fundador_mensal` R$ 29,90/mês); colunas do Mercado Pago adicionadas em `payments` e `subscriptions`.
- **Backend**: criadas as funções `mp-config`, `mp-create-payment`, `mp-create-subscription`, `mp-cancel-subscription`, `mp-sync-payment`, `mp-webhook` e `mp-refund-payment`, além do utilitário compartilhado `supabase/functions/_shared/mercadopago.ts`.
- **Frontend**: nova tela de checkout (`MercadoPagoCheckout`) com PIX (QR Code + copia e cola) e cartão embutido; "Minha conta" atualizada para cancelar assinatura dentro do app; reembolso da Administração aponta para a nova função.
- **Limpeza**: código do provedor antigo removido (`stripe.ts`, componentes de checkout e funções antigas).

## O que falta fazer

1. **Receber as credenciais de teste do Mercado Pago** para que o formulário de pagamento apareça na pré-visualização.
2. **Publicar as 7 novas edge functions** (`mp-config`, `mp-create-payment`, `mp-create-subscription`, `mp-cancel-subscription`, `mp-sync-payment`, `mp-webhook`, `mp-refund-payment`).
3. **Criar as políticas de acesso** aos arquivos de aula no armazenamento: somente alunos com acesso liberado podem ler; apenas o proprietário pode enviar/alterar/apagar. Isso depende do armazenamento ser inicializado na nuvem.
4. **Testar os fluxos** na pré-visualização com as credenciais de teste.

## Como testar depois de publicado

1. **PIX**: escolher o plano único, gerar o QR Code e aprovar o pagamento com o comprador de teste do Mercado Pago — o acesso libera sozinho.
2. **Cartão aprovado**: usar `5031 4332 1540 6351`, validade `11/30`, CVV `123`, nome `APRO`, CPF `12345678909`.
3. **Cartão recusado**: mesmo cartão com nome `OTHE` — a tela deve mostrar a recusa.
4. **Mensal**: assinar com o cartão aprovado, conferir em "Minha conta" o plano ativo e a próxima cobrança; cancelar e confirmar que o acesso continua até o fim do período pago.
5. **Estorno**: em "Administração", estornar a compra de teste e confirmar que o histórico muda para "Reembolsado" e o acesso é bloqueado.

## Nota sobre segurança

A correção das permissões de acesso aos arquivos de aula não pôde ser aplicada porque o armazenamento de arquivos ainda não está inicializado no projeto. Assim que for ativado, aplicarei as políticas de leitura para alunos com acesso e escrita apenas para o proprietário.
