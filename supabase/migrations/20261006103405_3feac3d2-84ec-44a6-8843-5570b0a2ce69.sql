UPDATE public.lesson_media AS m SET script = m.script || jsonb_build_object('fileName', v.n)
FROM (VALUES
('m1-a1','Aula 01 - Central Automation v2.0.mp4'),('m1-a2','Aula 02 - Ambiente de Desenvolvimento.mp4'),
('m1-a3','Aula 03 - Configuração do Projeto Maven.mp4'),('m2-a1','Aula 04 - Infraestrutura e DriverFactory.mp4'),
('m2-a2','Aula 05 - Infraestrutura Resiliente.mp4'),('m2-a3','Aula 06 - Elementos e Métodos de Ação.mp4'),
('m3-a1','Aula 07 - Ciclo de Execução e Relatórios.mp4'),('m3-a2','Aula 08 - Execução Local e Pipeline.mp4'),
('m3-a3','Aula 09 - Guia de Erros.mp4'),('m4-a1','Aula 10 - Arquitetura Passo a Passo.mp4')
) AS v(id,n) WHERE m.lesson_id = v.id AND m.kind = 'video';