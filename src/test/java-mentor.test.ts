import { describe, it, expect } from "vitest";
import { analyzeJava } from "@/lib/java-mentor";

describe("analyzeJava", () => {
  it("flags Thread.sleep as critical", () => {
    const r = analyzeJava("void t() {\n  Thread.sleep(3000);\n}");
    expect(r.tips.find((t) => t.title.includes("Thread.sleep"))?.line).toBe(2);
  });
  it("flags test without assert", () => {
    expect(analyzeJava("@Test void a() { driver.get(x); }").tips.some((t) => t.title === "Teste sem verificação")).toBe(true);
  });
  it("clean code is Sênior", () => {
    const r = analyzeJava("@Test void a() { new WebDriverWait(d, x); assertEquals(1, 1); driver.quit(); }");
    expect(r.level).toBe("Sênior");
  });
});
