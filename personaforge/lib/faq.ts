export async function loadFaq(path: string): Promise<{ q: string; a: string }[]> {
  try {
    const res = await fetch(path, { cache: "no-store" })
    if (!res.ok) return []
    const csv = await res.text()
    return parseCsvFaq(csv)
  } catch {
    return []
  }
}

function parseCsvFaq(csv: string): { q: string; a: string }[] {
  const lines = csv
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
  const out: { q: string; a: string }[] = []
  for (const line of lines) {
    // naive CSV: "question","answer"
    const match = line.match(/^"(.+?)","([\s\S]+)"$/)
    if (match) {
      out.push({ q: match[1], a: match[2] })
    } else {
      const parts = line.split(",").map((p) => p.replace(/^"|"$/g, ""))
      if (parts.length >= 2) out.push({ q: parts[0], a: parts.slice(1).join(",") })
    }
  }
  return out
}

export function findFaqAnswer(userText: string, faq: { q: string; a: string }[], threshold = 0.4): string | null {
  if (!faq.length) return null
  const t = normalize(userText)
  let best: { score: number; a: string } | null = null
  for (const item of faq) {
    const score = jaccard(normalize(item.q), t)
    if (!best || score > best.score) best = { score, a: item.a }
  }
  if (best && best.score >= threshold) return best.a
  return null
}

function normalize(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
}

function jaccard(a: string[], b: string[]) {
  const A = new Set(a)
  const B = new Set(b)
  const inter = new Set([...A].filter((x) => B.has(x)))
  const union = new Set([...A, ...B])
  return inter.size / Math.max(1, union.size)
}
