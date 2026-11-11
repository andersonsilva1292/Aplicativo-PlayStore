# Etapas em páginas separadas com navegação

Hoje a tela de estudos (`/trajetoria`) mostra tudo numa única rolagem enorme: vídeo, material, questionário, tutor e exercício. A proposta é transformar cada etapa em uma "página" própria, com botões **Voltar** e **Avançar**, além da navegação entre os módulos/aulas.

## Como vai funcionar

Cada aula passa a ter 4 páginas internas, uma por vez na tela:

```text
[1] Vídeo-aula  →  [2] Material  →  [3] Questionário  →  [4] Exercício
        ^                                                     |
        └────────── Voltar / Avançar ─────────────────────────┘
```

- Uma barra de páginas no topo (1·2·3·4) mostra em qual etapa o aluno está, quais já foram concluídas e quais estão bloqueadas.
- Rodapé fixo de navegação com **Voltar** e **Avançar**. O Avançar só libera quando o requisito da página é cumprido (vídeo assistido, questionário aprovado etc.), igual às regras atuais.
- Na última página, o botão passa a ser **Ir para a próxima aula**, indo para a página 1 da aula seguinte. Na primeira página, **Voltar** leva à última página da aula anterior (se já liberada).
- A navegação entre módulos/aulas continua disponível no topo (trilha de etapas), e ganha setas **Aula anterior / Próxima aula**.
- O tutor de IA fica acessível em todas as páginas, como painel recolhível no rodapé, para não ocupar espaço da etapa.
- A página atual é guardada na URL, então recarregar ou voltar pelo navegador mantém o aluno no mesmo ponto.
- Aulas sem exercício avaliado exibem apenas 3 páginas.
- Layout responsivo: barra de páginas compacta no celular, botões de navegação em largura total.

## Detalhes técnicos

- `src/pages/Trajetoria.tsx`: adicionar estado `step` sincronizado com o query param `step` (junto do `lesson` já existente). Renderizar apenas o bloco da etapa ativa, mantendo os mesmos componentes (`LessonVideoPlayer`, `ProtectedPdfViewer` + `AutomationDiagram` + `EnvironmentSetup`, questionário, `CodeSandbox`) e a mesma lógica de progresso (`markVideoWatched`, `submitQuiz`, `upsert`, `saveDraft`).
- Novo componente `src/components/StepPager.tsx`: indicador de páginas + botões Voltar/Avançar, recebendo `steps`, `current`, `canAdvance`, `onChange`.
- Regras de liberação reaproveitadas: página 2 e 3 exigem `video_watched_at`; página 4 exige `quiz_passed`. Trocar os cartões "bloqueado" pela desativação da navegação com dica do motivo.
- `JourneyStepper` continua para escolher a aula; `selectLesson` passa a resetar `step` para 1 e a rolagem para o topo.
- `LessonTutorChat` envolvido em um bloco recolhível, mantendo props atuais (`missedQuestion`, `suggestions`).
- Sem mudanças de banco de dados, edge functions ou conteúdo das aulas.
