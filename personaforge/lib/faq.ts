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

  // First check if the question is finance-related
  if (!isFinanceRelated(userText)) {
    return "I'm PersonaForge AI, specialized in banking and financial services. I can only help with questions about banking, investments, loans, budgeting, savings, insurance, and other financial matters. Please ask me about your financial needs."
  }

  const t = normalize(userText)
  let best: { score: number; a: string } | null = null
  for (const item of faq) {
    const score = jaccard(normalize(item.q), t)
    if (!best || score > best.score) best = { score, a: item.a }
  }
  if (best && best.score >= threshold) return best.a
  return null
}

function isFinanceRelated(text: string): boolean {
  const financeKeywords = [
    // Core Banking
    "bank",
    "banking",
    "account",
    "deposit",
    "withdraw",
    "withdrawal",
    "transfer",
    "atm",
    "card",
    "debit",
    "credit",
    "balance",
    "statement",
    "transaction",
    "payment",
    "pay",
    "payroll",
    "remittance",
    "exchange",

    // Money & Currency
    "money",
    "peso",
    "pesos",
    "php",
    "dollar",
    "usd",
    "currency",
    "cash",
    "fund",
    "funds",
    "amount",
    "cost",
    "price",
    "expensive",
    "cheap",
    "afford",
    "budget",
    "budgeting",
    "spend",
    "spending",

    // Loans & Credit & Debt
    "loan",
    "loans",
    "borrow",
    "borrowing",
    "debt",
    "debts",
    "credit",
    "mortgage",
    "financing",
    "installment",
    "interest",
    "apr",
    "rate",
    "rates",
    "principal",
    "amortization",
    "collateral",
    "personal loan",
    "auto loan",
    "home loan",
    "business loan",
    "student loan",
    "payday loan",
    "credit card",
    "credit line",
    "credit limit",
    "credit score",
    "credit report",
    "creditworthiness",

    // Investments & Trading
    "invest",
    "investment",
    "investing",
    "stock",
    "stocks",
    "bond",
    "bonds",
    "mutual fund",
    "uitf",
    "portfolio",
    "dividend",
    "return",
    "returns",
    "roi",
    "capital",
    "equity",
    "securities",
    "trading",
    "trader",
    "market",
    "bull",
    "bear",
    "volatility",
    "risk",
    "diversification",

    // Savings & Planning
    "save",
    "saving",
    "savings",
    "emergency fund",
    "retirement",
    "pension",
    "sss",
    "pag-ibig",
    "philhealth",
    "401k",
    "ira",
    "annuity",
    "endowment",
    "time deposit",
    "cd",

    // Insurance
    "insurance",
    "coverage",
    "premium",
    "claim",
    "policy",
    "beneficiary",
    "underwriting",
    "life insurance",
    "health insurance",
    "auto insurance",
    "property insurance",
    "travel insurance",

    // Business Finance
    "business",
    "entrepreneur",
    "startup",
    "capital",
    "cash flow",
    "revenue",
    "profit",
    "loss",
    "expense",
    "expenses",
    "tax",
    "taxes",
    "vat",
    "bir",
    "accounting",
    "bookkeeping",

    // Financial Planning & Advisory
    "financial",
    "finance",
    "wealth",
    "income",
    "salary",
    "allowance",
    "bonus",
    "commission",
    "bills",
    "utilities",
    "rent",
    "mortgage",
    "lease",
    "financial advisor",
    "financial planning",

    // Problem Gambling & Financial Issues (IMPORTANT - These are financial topics!)
    "gambling",
    "gamble",
    "casino",
    "lottery",
    "betting",
    "poker",
    "slots",
    "addiction",
    "overspending",
    "impulse",
    "financial trouble",
    "bankruptcy",
    "foreclosure",
    "default",
    "collection",
    "garnishment",
    "financial stress",
    "money problems",
    "broke",
    "poor",

    // Digital Banking & Fintech
    "online banking",
    "mobile banking",
    "app",
    "digital",
    "fintech",
    "cryptocurrency",
    "crypto",
    "bitcoin",
    "blockchain",
    "e-wallet",
    "gcash",
    "paymaya",
    "grabpay",
    "shopee pay",

    // Economic Terms
    "inflation",
    "deflation",
    "recession",
    "economy",
    "economic",
    "gdp",
    "unemployment",
    "interest rate",
    "central bank",
    "bsp",
    "federal reserve",
    "monetary policy",

    // Real Estate Finance
    "property",
    "real estate",
    "house",
    "condo",
    "lot",
    "mortgage",
    "down payment",
    "equity",
    "appraisal",
    "refinance",
    "foreclosure",
    "title",
    "deed",

    // Retirement & Benefits
    "retirement",
    "pension",
    "social security",
    "medicare",
    "401k",
    "ira",
    "roth",
    "employer benefits",
    "health savings",
    "flexible spending",
  ]

  const lowerText = text.toLowerCase()

  // Check for direct keyword matches
  const hasFinanceKeyword = financeKeywords.some((keyword) => lowerText.includes(keyword))

  // Check for financial phrases and contexts
  const financePatterns = [
    /\b(how much|cost|price|expensive|cheap|afford)\b/i,
    /\b(need money|financial help|money advice)\b/i,
    /\b(pay off|paying|payment)\b/i,
    /\b(financial|money|cash|fund)\s+\w+/i,
    /\b\d+\s*(peso|php|dollar|usd|\$|₱)/i, // Currency amounts
    /\b(monthly|annual|yearly)\s+(income|salary|payment|fee)\b/i,
  ]

  const hasFinancePattern = financePatterns.some((pattern) => pattern.test(text))

  return hasFinanceKeyword || hasFinancePattern
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
