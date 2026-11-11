# Novo título e destaques da tela de login

## Objetivo

Trocar o título da tela de entrada por uma identidade mais ampla (QA e QC, não só CTFL), remover os números "1000 / 65% / 6" e colocar no lugar destaques visuais que também falem de automação de testes.

## O que muda

### 1. Título principal (coluna do formulário)

- Título: **Estudos para Certificação**
- Subtítulo em destaque: **Prep — QA & QC**
- Linha de apoio menor, em duas etiquetas: `QA (Quality Assurance)` e `QC (Quality Control)`
- A hierarquia fica: título grande em gradiente, subtítulo médio, etiquetas pequenas em pill de vidro.
- O ícone atual (capelo) passa a um par de ícones (capelo + engrenagem/robô) para sinalizar estudo + automação.

### 2. Remoção dos números

Sai o bloco de estatísticas `1000 Questões · 65% Aprovação · 6 Capítulos` da coluna da ilustração.

### 3. Novos destaques com ícones (no lugar dos números)

Grade de cartões pequenos em vidro, com ícone colorido, título curto e uma linha de apoio:

- **Automação de Testes** — Selenium, Cucumber, JUnit
- **Java & Maven** — projeto real, do zero ao relatório
- **Gherkin / BDD** — cenários legíveis pelo negócio
- **Relatórios** — ExtentReports e evidências
- **Simulados QA/QC** — prática por capítulo com IA
- **Trilha Guiada** — vídeo-aula, PDF e exercícios

Cada cartão entra com animação em cascata (fade + subida) e leve realce no hover. As três pills flutuantes atuais (Capítulos / Certificação / IA Adaptativa) são substituídas por pills alinhadas ao novo posicionamento: `QA`, `QC`, `Automação`.

### 4. Visual

- Mesma linguagem já usada no app: glassmorphism, fundo com halos animados, tipografia Space Grotesk.
- Acento duplo: esmeralda (estudo/CTFL) + ciano (automação), reaproveitando os tokens de tema já existentes.
- Ícones do lucide-react (sem novas dependências); animações com framer-motion respeitando `prefers-reduced-motion`.
- Layout responsivo: 2 colunas de cartões no desktop, 1 coluna no mobile; a coluna da ilustração continua oculta em telas pequenas.

## Detalhes técnicos

- Arquivo único: `src/pages/Login.tsx`.
  - `floatingItems` reescrito; array de estatísticas removido; novo array `highlights` com `icon`, `title`, `text`.
  - Bloco do `<h1>` reestruturado (título + subtítulo + etiquetas QA/QC).
- Metadados de SEO (`Seo` em `/`) atualizados para refletir "Estudos para Certificação — QA & QC" mantendo menção a ISTQB/CTFL e automação de testes; `index.html` recebe o mesmo alinhamento de `title`/`description`/`og:*`.
- Nenhuma alteração de lógica de autenticação, rotas ou banco de dados.
