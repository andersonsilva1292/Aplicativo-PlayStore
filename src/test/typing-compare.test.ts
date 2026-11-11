// @vitest-environment node
import { describe, it, expect } from "vitest";
import { compareTyping } from "@/lib/typing-compare";

const model = `public class Main {\n    int x = 1;\n}`;

describe("compareTyping", () => {
  it("100% quando igual (ignora espaços)", () => {
    expect(compareTyping("public class Main {\nint x = 1;\n}", model).accuracy).toBe(100);
  });
  it("aponta ponto e vírgula faltando", () => {
    const r = compareTyping("public class Main {\nint x = 1\n}", model);
    expect(r.issues.some((i) => i.line === 2 && i.message.includes(";"))).toBe(true);
  });
  it("aponta chave sem fechar", () => {
    const r = compareTyping("public class Main {\nint x = 1;", model);
    expect(r.issues[0].message).toContain("sem fechar");
  });
});
