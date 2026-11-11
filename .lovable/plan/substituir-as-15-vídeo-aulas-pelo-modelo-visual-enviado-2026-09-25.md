# Substituir as 15 vídeo-aulas pelo modelo visual enviado

## Objetivo

Produzir 15 MP4s próprios para o Curso de Automação, usando o arquivo **Arquitetura Passo a Passo** como referência de estilo — sem reutilizar os antigos slides do aplicativo.

Cada aula terá aproximadamente **7 a 10 minutos**, em português, seguindo o conteúdo, os exemplos e os objetivos que já existem no curso.

## Direção visual confirmada

- Fundo claro com textura discreta de papel quadriculado.
- Ilustrações técnicas com aparência de desenho feito à mão.
- Paleta baseada em preto, azul, amarelo e pequenos destaques verdes/vermelhos.
- Frases curtas em grande destaque, palavras importantes marcadas em amarelo e diagramas que se constroem durante a explicação.
- Alternância entre capas, comparações, passo a passo, código, fluxos e resumos visuais.
- Transições suaves de câmera e entrada progressiva dos elementos, mantendo o ritmo didático do modelo.
- Narração brasileira sincronizada e compreensão completa mesmo com o vídeo sem som.

## Produção das aulas

1. Transformar o conteúdo existente de cada uma das 15 aulas em roteiro narrado, preservando os conceitos, exemplos, questionários e sequência pedagógica atuais.
2. Dividir cada roteiro em cenas curtas, com abertura, problema, explicação, demonstração, boas práticas e resumo.
3. Criar um sistema visual reutilizável para títulos, marcações, desenhos, diagramas, comparações e blocos de código.
4. Produzir e revisar primeiro a aula `m1-a1` como referência técnica de qualidade; após a validação interna, aplicar o mesmo padrão às outras 14 sem mudar a direção escolhida.
5. Renderizar cada aula como MP4 real em 1280×720, com imagem H.264 e áudio AAC, compatível com navegadores e celulares.

## Publicação e reprodução

- Guardar os 15 MP4s na área privada de mídia da plataforma, associados corretamente às aulas `m1-a1` até `m6-a2`.
- Substituir o player antigo de slides por reprodução de vídeo real com play/pausa, progresso, volume, velocidade e tela cheia.
- Salvar o segundo exato em que o aluno parou e retomar desse ponto.
- Marcar a aula como assistida somente quando o vídeo chegar ao fim; abrir as etapas seguintes conforme as regras atuais.
- Manter o modo de desenvolvimento da conta proprietária com livre navegação durante os testes.
- Remover do fluxo ativo as chamadas que tentavam gerar slides ou narração ao abrir uma aula.

## Validação

- Conferir quadros da abertura, explicação, código e encerramento antes de finalizar cada lote.
- Verificar legibilidade, sincronização da narração, ausência de telas vazias/piscadas e continuidade visual.
- Testar a primeira, uma intermediária e a última aula no computador e no celular.
- Confirmar retomada, progresso, volume, velocidade, tela cheia, conclusão e desbloqueio da próxima etapa.
- Confirmar que nenhuma aula faz geração ao ser aberta e que os vídeos começam rapidamente a partir do arquivo já salvo.

## Observações

- O vídeo enviado será usado apenas como **referência estética e de ritmo**; não será publicado nem copiado literalmente.
- A produção usará os conteúdos atuais das 15 aulas. Não serão inventados novos módulos.
- Narração por IA pode consumir créditos do espaço de trabalho. Se o serviço bloquear por saldo insuficiente, os vídeos concluídos permanecerão preservados e a produção continuará do ponto exato após a recarga, sem refazer aulas prontas.

## Detalhes técnicos

- Composição determinística em cenas animadas, permitindo manter o mesmo padrão em todas as aulas e corrigir partes isoladas sem regenerar o vídeo inteiro.
- Renderização em segmentos e união final para suportar aulas de vários minutos com segurança.
- Catálogo privado de vídeos por `lesson_id`, com estado de publicação e caminho do MP4.
- Entrega autenticada por endereço temporário; nenhum MP4 ficará em URL pública permanente.
- Player baseado no elemento de vídeo nativo, sem o mecanismo anterior de slides e áudios separados.