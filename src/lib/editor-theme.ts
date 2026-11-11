import { EditorView } from "@codemirror/view";

/** Tema escuro do editor usando os tokens do app. */
export const oneDarkTheme = EditorView.theme(
  {
    "&": { backgroundColor: "hsl(var(--background))", color: "hsl(var(--foreground))", height: "100%" },
    ".cm-gutters": { backgroundColor: "hsl(var(--muted) / 0.3)", color: "hsl(var(--muted-foreground))", border: "none" },
    ".cm-activeLine": { backgroundColor: "hsl(var(--primary) / 0.08)" },
    ".cm-activeLineGutter": { backgroundColor: "hsl(var(--primary) / 0.15)" },
    ".cm-cursor": { borderLeftColor: "hsl(var(--primary))" },
    "&.cm-focused .cm-selectionBackground, .cm-selectionBackground": { backgroundColor: "hsl(var(--primary) / 0.25)" },
    ".cm-tooltip": { backgroundColor: "hsl(var(--popover))", color: "hsl(var(--popover-foreground))" },
  },
  { dark: true },
);
