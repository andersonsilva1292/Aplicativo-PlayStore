import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface QuestionTextProps {
  children: string;
  className?: string;
}

/**
 * Renderiza o enunciado da questão com suporte a Markdown (tabelas, listas,
 * negrito, código). Usa estilos do design system para se integrar ao tema
 * glassmorphism da aplicação.
 */
export default function QuestionText({ children, className = "" }: QuestionTextProps) {
  return (
    <div className={`question-md text-foreground ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ node, ...props }) => <p className="mb-3 leading-relaxed" {...props} />,
          strong: ({ node, ...props }) => <strong className="font-semibold text-foreground" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-3 space-y-1" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-3 space-y-1" {...props} />,
          code: ({ node, ...props }) => (
            <code className="px-1.5 py-0.5 rounded bg-white/10 text-xs font-mono text-foreground" {...props} />
          ),
          pre: ({ node, ...props }) => (
            <pre className="my-3 p-3 rounded-lg bg-black/40 border border-white/10 overflow-x-auto text-xs font-mono text-foreground" {...props} />
          ),
          table: ({ node, ...props }) => (
            <div className="my-3 overflow-x-auto rounded-lg border border-white/10">
              <table className="w-full text-sm border-collapse" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => <thead className="bg-white/10" {...props} />,
          tbody: ({ node, ...props }) => <tbody {...props} />,
          tr: ({ node, ...props }) => <tr className="border-b border-white/10 last:border-0" {...props} />,
          th: ({ node, ...props }) => (
            <th className="px-3 py-2 text-left font-semibold text-foreground border-r border-white/10 last:border-0" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="px-3 py-2 text-foreground/90 border-r border-white/10 last:border-0 align-top" {...props} />
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
