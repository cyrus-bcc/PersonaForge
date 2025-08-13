"use client"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

type MarkdownProps = {
  children: string
  className?: string
}

export default function Markdown({ children, className = "" }: MarkdownProps) {
  return (
    <div className={["markdown-body", className].join(" ")}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Headings
          h1: (p) => <h1 className="mb-3 text-2xl font-semibold" {...p} />,
          h2: (p) => <h2 className="mb-2 text-lg font-semibold" {...p} />,
          h3: (p) => <h3 className="mb-2 text-base font-semibold" {...p} />,
          // Text
          p: (p) => <p className="mb-2 leading-relaxed last:mb-0" {...p} />,
          strong: (p) => <strong className="font-semibold" {...p} />,
          em: (p) => <em className="italic" {...p} />,
          // Lists
          ul: (p) => <ul className="mb-2 list-disc space-y-1 pl-5" {...p} />,
          ol: (p) => <ol className="mb-2 list-decimal space-y-1 pl-5" {...p} />,
          li: (p) => <li className="leading-relaxed" {...p} />,
          // Links (force default app font; avoid serif/Times)
          a: (p) => (
            <a
              className="text-primary underline underline-offset-2 hover:text-primary/50 break-words font-medium"
              target="_blank"
              rel="noreferrer"
              {...p}
            />
          ),
          // Code
          code: (p) => <code className="rounded bg-muted px-1 py-0.5 text-xl" {...p} />,
          pre: ({ children }) => (
            <pre className="mb-2 overflow-x-auto rounded bg-muted p-3 text-base font-serif">
              {children}
            </pre>
          ),
          // Quotes / rules
          blockquote: (p) => <blockquote className="mb-2 border-l-2 pl-3 italic text-muted-foreground" {...p} />,
          hr: () => <hr className="my-3 border-muted-foreground/20" />,
        }}
      >
        {children}
      </ReactMarkdown>

      <style jsx>{`
        /* Tighten paragraphs inside list items to remove big gaps after 1., 2., 3. */
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
