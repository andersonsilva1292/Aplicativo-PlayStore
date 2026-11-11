# Bateria de testes do app (incluindo as vídeo-aulas)

## Observação importante sobre "vídeo"

O app não usa arquivos MP4. A vídeo-aula é gerada por IA em tempo real: a função `generate-lesson-lecture` cria slides + narração em áudio (TTS), o `LessonVideoPlayer` sincroniza slide e áudio e conta como "vídeo assistido". Então o teste de vídeo é o teste dessa geração + player + registro de progresso.

Há um bloqueio: hoje não existe sessão ativa no preview (`signed_out`), e vídeo, PDF, trajetória e admin exigem login. Para o teste ponta a ponta, é preciso entrar na conta na janela de visualização; sem isso só é possível validar as rotas públicas e a saúde do backend.

## Escopo dos testes

### 1. Backend / geração de mídia
- `generate-lesson-lecture`: chamar com uma aula real e conferir retorno de slides, narração e `audioUrl` assinado; verificar cache em `lesson_media` (`kind=video`, `status=ready`) e os arquivos `lecture/{lessonId}/slide-N.mp3` no bucket privado.
- Segunda chamada da mesma aula: deve responder do cache (mais rápido, sem nova cobrança de IA).
- `generate-lesson-pdf`: conferir seções, checklist, exercícios, marca d'água com nome/e-mail e base64 válido.
- Erros de gateway de IA (402 crédito, 429 limite) devem aparecer como mensagem clara na tela, não como tela branca.
- Logs das funções revisados após cada chamada.

### 2. Fluxo da Trajetória (logado)
- `/inicio`: seleção de curso, tema aplicado, botão "Iniciar/Continuar Trajetória".
- `/trajetoria`: player de vídeo-aula (play/pause, velocidade, retomada de posição), PDF protegido (abre no visualizador, sem download/impressão), questionário com gate de 70%, exercício com casos de teste, conclusão e desbloqueio da próxima etapa.
- Rascunhos: código e respostas salvos e restaurados ao reabrir a aula.
- Registro de progresso e atividade diária gravados no banco.

### 3. Demais telas
- Login novo (título QA & QC, destaques com ícones), cadastro, recuperação de senha, Política de Privacidade e exclusão de conta.
- Simulados (embaralhamento de alternativas, tabelas e figuras em K2/K3), Trilhas, Relatórios, Chat com IA, Syllabus, Automação e `/admin` (visível só para admin).
- Console sem erros, requisições de rede sem 4xx/5xx inesperados.

### 4. Verificações técnicas
- Tipos: `tsgo --noEmit`.
- Linter de segurança do backend (o aviso conhecido de `has_role` é esperado e ignorado).

## Entrega

Relatório curto por item: passou / falhou, com evidência (captura de tela, resposta da função ou log) e correção imediata de tudo que falhar.

## Detalhes técnicos

- Playwright headless em `/tmp/browser/`, viewport 1280×1800, restaurando a sessão do preview via variáveis de ambiente injetadas.
- Funções testadas com `curl_edge_functions` usando o token da sessão do preview.
- Consultas de leitura ao banco para confirmar `automation_progress`, `lesson_media` e `automation_activity`.
