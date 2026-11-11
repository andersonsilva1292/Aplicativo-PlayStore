# Trilha guiada: tela inicial temática, vídeo-aula por IA e material em PDF protegido

## 1. Tela inicial adaptativa

- Os dois cartões ("Estudo CTFL" e "Automação de Testes") passam a ser selecionáveis: ao escolher um, a página inteira se adapta — título, subtítulo, selo, ícones, cor de destaque, benefícios e imagem de fundo mudam para a identidade daquele curso (CTFL: esmeralda/certificação; Automação: ciano-violeta/engenharia).
- Cada tema é definido como conjunto de tokens no design system (nada de cor fixa no componente), com transição animada ao alternar entre cursos.
- Botão principal **"Iniciar Trajetória"**: leva para a etapa pendente mais avançada do curso escolhido (ou a etapa 1, se o aluno é novo). Para o CTFL, o botão continua levando ao painel de estudo atual.
- A escolha do curso fica salva no perfil do aluno, então ao voltar a plataforma abre já no tema certo.

## 2. Jornada linear e progressiva (curso de Automação)

- Nova página de trajetória com uma etapa por tela, na ordem do curso: vídeo-aula → material em PDF → questionário → exercício no sandbox.
- Regra de liberação: a etapa seguinte só abre quando a atual estiver concluída (vídeo assistido até o fim + questionário aprovado no gate de 70% + exercício entregue, quando houver).
- Barra de trajetória no topo com todas as etapas: as concluídas são clicáveis para revisão livre (voltar e avançar), a atual fica destacada e as futuras aparecem bloqueadas com o motivo.
- Navegação "Etapa anterior / Próxima etapa" no rodapé, com atalho para retomar de onde parou.
- Cada avanço, vídeo assistido e revisão continua alimentando o progresso e o mapa de atividade diária já existentes (e aparece no painel de administração).

## 3. Vídeo-aula gerada por IA

- Player próprio de vídeo-aula narrada: sequência de slides animados da aula (título, tópicos, passo a passo prático, código e diagramas) sincronizados com narração em português gerada por IA.
- Controles reais: play/pause, barra de progresso, avançar/voltar slide, velocidade, legendas do roteiro e retomada do ponto onde parou.
- O roteiro e a narração de cada aula são gerados uma única vez pela IA e guardados no backend; a partir daí todos os alunos reutilizam o mesmo material (sem custo por aluno).
- Conclusão do vídeo só é marcada quando o aluno chega ao fim, e é isso que libera a etapa seguinte.

## 4. Material complementar em PDF protegido

- Cada etapa tem um material de apoio em PDF gerado por IA a partir do conteúdo da aula (resumo teórico, passo a passo, boas práticas, checklist e exercícios).
- Gerado sob demanda na primeira abertura, guardado em área privada do backend e servido apenas por link temporário assinado — nunca por URL pública.
- Visualização exclusiva dentro da plataforma: leitor embutido paginado, sem botão de download, sem impressão, menu de contexto desabilitado e marca d'água discreta com o nome e e-mail do aluno em todas as páginas.
- O leitor aparece na etapa de estudo e também numa aba "Materiais" da página de acompanhamento, listando os PDFs já liberados.

## 5. Escopo

- Jornada linear completa (vídeo + PDF + desbloqueio) apenas no Curso de Automação nesta etapa.
- O CTFL recebe agora a tela inicial temática e o botão "Iniciar Trajetória"; a jornada linear dele fica para uma fase seguinte.

## Detalhes técnicos

- **Banco:** `automation_progress` ganha `video_watched_at`, `video_position_seconds` e `pdf_opened_at`. Nova tabela `lesson_media` (lesson_id, kind `video`/`pdf`, script jsonb, storage_path, status, generated_at) com leitura para `authenticated` e escrita só por `service_role`. `profiles` ganha `preferred_track`.
- **Storage:** bucket privado `lesson-media` (áudio de narração e PDFs), acesso apenas por URL assinada de curta duração emitida por edge function após checar sessão e liberação da etapa.
- **Edge functions:** `generate-lesson-lecture` (roteiro de slides via Lovable AI + narração TTS, gravado no bucket, com cache por aula) e `generate-lesson-pdf` (conteúdo via Lovable AI, PDF montado no servidor com marca d'água do aluno, cache do layout base). Ambas validam JWT, validam entrada com Zod e tratam os status 402/429 do gateway com mensagem clara na UI.
- **Front-end:** `src/data/track-themes.ts` (tokens por curso), `LessonVideoPlayer.tsx`, `ProtectedPdfViewer.tsx` (render em canvas via pdf.js, sem controles de download), `JourneyStepper.tsx`, página `src/pages/Trajetoria.tsx` com rota protegida, e extensão de `useAutomationProgress` com `isStepUnlocked`, `markVideoWatched` e `nextPendingLesson`.
- **Design:** temas por curso via variáveis HSL no `index.css`, animações com framer-motion respeitando `prefers-reduced-motion`; a página da trajetória entra no sitemap com `noindex` por ser área logada.
