"use client"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { formatAssistantText } from "../lib/text-format"

type MarkdownProps = {
  children: string
  className?: string
}

export default function Markdown({ children, className = "" }: MarkdownProps) {
  const formattedContent = formatAssistantText(children)

  return (
    <div className={["markdown-body", className].join(" ")}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Headings
          h1: (p) => <h1 className="mb-3 text-2xl font-semibold" {...p} />,
          h2: (p) => <h2 className="mb-2 text-lg font-semibold" {...p} />,
          h3: (p) => <h3 className="mb-2 text-base font-medium" {...p} />,
          // Text
          p: (p) => <p className="mb-2 leading-relaxed last:mb-0" {...p} />,
          strong: (p) => <strong className="font-semibold" {...p} />,
          em: (p) => <em className="italic" {...p} />,
          // Lists
          ul: (p) => <ul className="mb-2 list-disc space-y-1 pl-5" {...p} />,
          ol: (p) => <ol className="mb-2 list-decimal space-y-1 pl-5" {...p} />,
          li: (p) => <li className="leading-relaxed" {...p} />,
          // Links
          a: (p) => <a className="underline underline-offset-2" target="_blank" rel="noreferrer" {...p} />,
          // Code
          code: (p) => <code className="rounded bg-muted px-1 py-0.5 text-sm" {...p} />,
          pre: ({ children }) => (
            <pre className="mb-2 overflow-x-auto rounded bg-muted p-3 text-xs leading-relaxed">{children}</pre>
          ),
          // Others
          blockquote: (p) => <blockquote className="mb-2 border-l-2 pl-3 italic text-muted-foreground" {...p} />,
          hr: () => <hr className="my-3 border-muted-foreground/20" />,
        }}
      >
        {formattedContent}
      </ReactMarkdown>

      <style jsx>{`
        /* Tighten paragraphs inside list items (prevents big gaps after 1., 2., 3.) */
        .markdown-body li > p {
          margin-top: 0.125rem !important;
          margin-bottom: 0.125rem !important;
        }
        /* Slightly tighten nested list spacing */
        .markdown-body li > ul,
        .markdown-body li > ol {
          margin-top: 0.25rem;
          margin-bottom: 0.25rem;
        }
      `}</style>
    </div>
  )
}
