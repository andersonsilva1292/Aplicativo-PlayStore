import { jsPDF } from "jspdf";

export interface MaterialExercise {
  statement: string;
  solution: string;
}

export interface LessonMaterial {
  version?: number;
  subtitle: string;
  summary?: string;
  keyTakeaways?: string[];
  sections: { heading: string; paragraphs: string[]; bullets: string[] }[];
  checklist: string[];
  /** Formato novo: enunciado + resolução. O formato antigo (string) continua aceito. */
  exercises: (MaterialExercise | string)[];
  glossary?: { term: string; definition: string }[];
}

export function isLessonMaterial(value: unknown): value is LessonMaterial {
  const m = value as LessonMaterial | undefined;
  return !!m && Array.isArray(m.sections) && Array.isArray(m.checklist) && Array.isArray(m.exercises);
}

const asExercise = (e: MaterialExercise | string): MaterialExercise =>
  typeof e === "string" ? { statement: e, solution: "" } : e;

/** Monta a apostila em PDF no navegador (capa, sumário, conteúdo, exercícios resolvidos e glossário). */
export function buildLessonPdf(
  title: string,
  material: LessonMaterial,
  owner: string,
  courseLabel = "Curso de Automação de Testes · Projeto Central Automation"
): Uint8Array {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 56;
  let y = M;
  let page = 1;

  const stamp = (withWatermark = true) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Material exclusivo · ${owner} · uso pessoal`, M, H - 26);
    doc.text(String(page), W - M, H - 26, { align: "right" });
    if (withWatermark) {
      doc.setTextColor(228);
      doc.setFontSize(34);
      doc.text("CONFIDENCIAL", W / 2, H / 2, { align: "center", angle: 32 });
    }
    doc.setTextColor(40);
  };

  const newPage = () => {
    stamp();
    doc.addPage();
    page += 1;
    y = M;
  };

  const ensure = (needed: number) => {
    if (y + needed > H - 64) newPage();
  };

  const write = (text: string, size: number, style: "normal" | "bold" | "italic" = "normal", gap = 6, indent = 0) => {
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
    doc.splitTextToSize(text, W - M * 2 - indent).forEach((line: string) => {
      ensure(size + gap);
      doc.setFont("helvetica", style);
      doc.setFontSize(size);
      doc.text(line, M + indent, y);
      y += size + gap;
    });
  };

  const rule = () => {
    ensure(14);
    doc.setDrawColor(210);
    doc.line(M, y, W - M, y);
    y += 14;
  };

  // ---------- Capa ----------
  doc.setFillColor(16, 24, 34);
  doc.rect(0, 0, W, 210, "F");
  doc.setTextColor(255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("APOSTILA DE ESTUDO", M, 78);
  doc.setFontSize(24);
  doc.splitTextToSize(title, W - M * 2).forEach((line: string, i: number) => doc.text(line, M, 116 + i * 28));
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(courseLabel, M, 186);
  doc.setTextColor(40);

  y = 250;
  write(material.subtitle, 12, "italic", 10);
  if (material.summary) {
    write("Resumo da aula", 13, "bold", 8);
    write(material.summary, 10.5, "normal", 6);
  }
  if (material.keyTakeaways?.length) {
    y += 6;
    write("O que você deve dominar", 13, "bold", 8);
    material.keyTakeaways.forEach((k) => write(`•  ${k}`, 10.5, "normal", 5, 8));
  }
  y += 10;
  write(`Aluno: ${owner}`, 9, "normal", 4);
  write(`Gerado em ${new Date().toLocaleDateString("pt-BR")}`, 9, "normal", 4);

  // ---------- Sumário ----------
  newPage();
  write("Sumário", 16, "bold", 12);
  const toc = [
    ...material.sections.map((s) => s.heading),
    "Checklist da etapa",
    "Exercícios resolvidos",
    ...(material.glossary?.length ? ["Glossário"] : []),
  ];
  toc.forEach((item, i) => write(`${i + 1}.  ${item}`, 11, "normal", 7));
  rule();

  // ---------- Conteúdo ----------
  material.sections.forEach((s, i) => {
    y += 10;
    write(`${i + 1}. ${s.heading}`, 14, "bold", 8);
    s.paragraphs.forEach((p) => write(p, 10.5, "normal", 6));
    s.bullets.forEach((b) => write(`•  ${b}`, 10.5, "normal", 5, 8));
  });

  // ---------- Checklist ----------
  newPage();
  write("Checklist da etapa", 15, "bold", 10);
  material.checklist.forEach((c) => write(`[  ]  ${c}`, 10.5, "normal", 6));

  // ---------- Exercícios resolvidos ----------
  y += 14;
  write("Exercícios resolvidos", 15, "bold", 10);
  material.exercises.map(asExercise).forEach((e, i) => {
    y += 6;
    write(`Exercício ${i + 1}`, 12, "bold", 6);
    write(e.statement, 10.5, "normal", 6);
    if (e.solution) {
      write("Resolução comentada:", 10.5, "bold", 5);
      write(e.solution, 10.5, "normal", 6, 8);
    }
  });

  // ---------- Glossário ----------
  if (material.glossary?.length) {
    y += 14;
    write("Glossário", 15, "bold", 10);
    material.glossary.forEach((g) => {
      write(g.term, 11, "bold", 4);
      write(g.definition, 10.5, "normal", 6, 8);
    });
  }

  stamp();
  return new Uint8Array(doc.output("arraybuffer"));
}

export function safeFileName(title: string, fallback: string) {
  return `${title.replace(/[^\p{L}\p{N}\s-]/gu, "").trim().slice(0, 70) || fallback}.pdf`;
}

export function downloadBytes(bytes: Uint8Array, fileName: string, mime = "application/pdf") {
  const url = URL.createObjectURL(new Blob([bytes as unknown as BlobPart], { type: mime }));
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
