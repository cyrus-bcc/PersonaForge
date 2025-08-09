"use client"
import { formatAssistantText } from "../lib/text-format"
import Markdown from "react-markdown"

const MarkdownComponent = ({ content }) => {
  const formattedContent = formatAssistantText(content)

  return (
    <div className="markdown-body">
      <Markdown>{formattedContent}</Markdown>
      <style jsx>{`
      /* Keep list items compact even if text contains paragraphs */
      .markdown-body li > p {
        margin-top: 0.125rem !important;
        margin-bottom: 0.125rem !important;
      }
      .markdown-body p + ul,
      .markdown-body p + ol {
        margin-top: 0.25rem;
      }
    `}</style>
    </div>
  )
}

export default MarkdownComponent
