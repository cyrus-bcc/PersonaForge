export function formatAssistantText(input: string): string {
  let t = input.trim()

  // Ensure bullet points are on their own lines
  t = t.replace(/\s-\s/g, "\n- ")

  // If a sentence introduces a list with a colon, add a blank line before the first item
  t = t.replace(/:\s*(\d+)\.\s/g, ":\n\n$1. ")

  // Put numbered items on their own lines (1. .. 2. .. 3. ..)
  for (let i = 1; i <= 10; i++) {
    const re = new RegExp(`\\s${i}\\.\\s`, "g")
    t = t.replace(re, `\n${i}. `)
  }

  // Normalize multiple blank lines
  t = t.replace(/\n{3,}/g, "\n\n")

  // If text still has long run-ons, break at sentence boundaries before list items
  t = t.replace(/\. (?=[-0-9])/g, ".\n")

  return t
}
