export const CATEGORIES = [
  "Groceries",
  "Dining Out",
  "Lifestyle",
  "Entertainment",
  "Transportation",
  "Income",
  "General",
  "Uncategorized",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_COLORS: Record<string, string> = {
  Groceries: "hsl(var(--chart-2))",
  "Dining Out": "hsl(var(--chart-3))",
  Lifestyle: "hsl(var(--chart-5))",
  Entertainment: "hsl(var(--chart-1))",
  Transportation: "hsl(var(--chart-6))",
  Income: "hsl(var(--chart-2))",
  General: "hsl(var(--chart-7))",
  Uncategorized: "hsl(var(--muted-foreground))",
};

export const CATEGORY_BADGE_CLASSES: Record<string, string> = {
  Groceries: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  "Dining Out": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Lifestyle: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  Entertainment: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Transportation: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  Income: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  General: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  Uncategorized: "bg-muted text-muted-foreground",
};

const KEYWORD_MAP: [string[], Category][] = [
  [["lidl", "tesco", "aldi", "dunnes", "centra"], "Groceries"],
  [["burger king", "mcdonalds", "kfc", "camile thai", "elephant and castle", "just eat", "apache", "akaka", "hasu izakaya", "happy pear", "sonny's bbq", "insomnia", "brambles", "mark falconers", "brew with a view", "buoys kitchen", "forty foot", "fat fox", "burger boy"], "Dining Out"],
  [["temu", "shein", "amazon", "penneys", "currys", "flying tiger", "butlers chocolates", "art and hobby", "woodie's", "boots", "chemist warehouse", "holland & barrett"], "Lifestyle"],
  [["dublin zoo", "netflix", "spotify", "apple", "canva", "zoom adventure"], "Entertainment"],
  [["leap card", "luas", "transport for ireland", "tfi", "dublinbikes", "moby move", "free now", "gocar", "irish rail", "circle k", "wicklow county tourism"], "Transportation"],
  [["compass group", "salary", "caireen early years ltd"], "Income"],
  [["church", "i am church", "vodafone", "go gym", "project pay", "aiapply", "anthropic", "lvps car park", "dundrum car parking"], "General"],
];

export function categorizeTransaction(description: string): { category: Category; isIncome: boolean } {
  const lower = description.toLowerCase();

  for (const [keywords, category] of KEYWORD_MAP) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return { category, isIncome: category === "Income" };
    }
  }

  return { category: "Uncategorized", isIncome: false };
}

export type ParsedRow = {
  name: string;
  amount: number;
  date: string;
  category: Category | "Transfer";
  is_income: boolean;
  is_transfer: boolean;
};

function isInternalTransfer(description: string): boolean {
  return (
    /^(To|From) EUR .+$/i.test(description) ||
    /^Deposit to '.+?'$/i.test(description) ||
    /^To pocket EUR .+ from EUR$/i.test(description) ||
    /^Pocket Withdrawal$/i.test(description) ||
    /^To investment account$/i.test(description) ||
    /^From Instant Access Savings$/i.test(description)
  );
}

function isInterestPayment(description: string): boolean {
  return (
    /^Net Interest Paid/i.test(description) ||
    /^Interest earned/i.test(description)
  );
}

function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;
  for (const char of line) {
    if (char === '"') { inQuotes = !inQuotes; continue; }
    if (char === "," && !inQuotes) { fields.push(current.trim()); current = ""; continue; }
    current += char;
  }
  fields.push(current.trim());
  return fields;
}

// Strips currency symbols (including â¬ which is € with broken encoding) and thousand separators
function parseAmount(raw: string): number {
  const cleaned = raw.replace(/[^\d.-]/g, "");
  return parseFloat(cleaned) || 0;
}

// Revolut main account CSV (Type, Product, Started Date, Description, Amount, State, ...)
// May contain multiple products: Current, Deposit (savings mirror), Savings (Pockets)
function parseRevolutStandardCSV(lines: string[]): ParsedRow[] {
  const header = lines[0].split(",").map((h) => h.trim().replace(/"/g, "").toLowerCase());
  const dateIdx = header.findIndex((h) => h.includes("started date"));
  const descIdx = header.findIndex((h) => h.includes("description"));
  const amountIdx = header.findIndex((h) => h === "amount");
  const productIdx = header.findIndex((h) => h === "product");
  const stateIdx = header.findIndex((h) => h === "state");

  if (dateIdx === -1 || descIdx === -1 || amountIdx === -1) return [];

  const results: ParsedRow[] = [];

  for (const line of lines.slice(1)) {
    const fields = parseCsvLine(line);

    // Skip reverted/failed transactions
    if (stateIdx !== -1 && fields[stateIdx] === "REVERTED") continue;

    const product = productIdx !== -1 ? (fields[productIdx] || "").toLowerCase() : "current";

    // Skip Deposit rows — they're a mirror of the savings account (importable via separate CSV)
    if (product === "deposit") continue;

    const description = fields[descIdx] || "Unknown";
    const rawAmount = parseFloat(fields[amountIdx] || "0");
    const amount = Math.abs(rawAmount);

    if (amount === 0) continue;

    const transfer = isInternalTransfer(description);
    const interest = isInterestPayment(description);

    // Savings product = Pocket account
    // Only import real outgoing expenses (negative, non-transfer)
    // Positive rows are pocket deposits (already filtered as Transfer from Current)
    if (product === "savings") {
      if (rawAmount >= 0 || transfer) continue;
    }

    const { category, isIncome } = categorizeTransaction(description);

    let finalCategory: ParsedRow["category"];
    if (transfer) finalCategory = "Transfer";
    else if (interest) finalCategory = "Income";
    else finalCategory = category;

    results.push({
      name: description,
      amount,
      date: new Date(fields[dateIdx] || Date.now()).toISOString(),
      category: finalCategory,
      is_income: !transfer && (rawAmount > 0 || interest),
      is_transfer: transfer,
    });
  }

  return results;
}

// Revolut savings account CSV (columns: Date, Description, Money out, Money in, Balance)
function parseRevolutSavingsCSV(csvText: string): ParsedRow[] {
  const sectionStart = csvText.search(/^Date,Description/m);
  if (sectionStart === -1) return [];

  const lines = csvText.slice(sectionStart).split("\n").filter((l) => l.trim());
  if (lines.length < 2) return [];

  const header = lines[0].split(",").map((h) => h.trim().replace(/"/g, "").toLowerCase());
  const dateIdx = header.findIndex((h) => h === "date");
  const descIdx = header.findIndex((h) => h === "description");
  const moneyOutIdx = header.findIndex((h) => h.includes("money out"));
  const moneyInIdx = header.findIndex((h) => h.includes("money in"));

  if (dateIdx === -1 || descIdx === -1) return [];

  return lines.slice(1).map((line) => {
    const fields = parseCsvLine(line);
    const description = fields[descIdx] || "Unknown";
    const moneyOut = parseAmount(fields[moneyOutIdx] ?? "");
    const moneyIn = parseAmount(fields[moneyInIdx] ?? "");
    const isIncome = moneyIn > 0;
    const amount = isIncome ? moneyIn : moneyOut;
    const transfer = isInternalTransfer(description);
    const interest = isInterestPayment(description);
    const { category } = categorizeTransaction(description);

    let finalCategory: ParsedRow["category"];
    if (transfer) finalCategory = "Transfer";
    else if (interest) finalCategory = "Income";
    else finalCategory = isIncome ? "Income" : category;

    return {
      name: description,
      amount,
      date: new Date(fields[dateIdx] || Date.now()).toISOString(),
      category: finalCategory,
      is_income: interest || (!transfer && isIncome),
      is_transfer: transfer,
    };
  }).filter((t) => t.amount > 0);
}

export function detectPotsFromCSV(rows: ParsedRow[]): Array<{ name: string; totalDeposited: number }> {
  const potMap = new Map<string, number>();
  for (const row of rows) {
    // "To EUR Laura's savings" → "Laura's savings"
    const matchToEur = row.name.match(/^To EUR (.+)$/i);
    // "Deposit to 'Olívia's Savings'" → "Olívia's Savings"
    const matchDeposit = row.name.match(/^Deposit to '(.+?)'$/i);
    // "To pocket EUR Pagamentos automáticos from EUR" → "Pagamentos automáticos"
    const matchPocket = row.name.match(/^To pocket EUR (.+?) from EUR$/i);

    const match = matchToEur || matchDeposit || matchPocket;
    if (!match) continue;

    const name = match[1].trim();
    if (name.toLowerCase() === "savings") continue;
    potMap.set(name, (potMap.get(name) || 0) + row.amount);
  }
  return Array.from(potMap.entries()).map(([name, totalDeposited]) => ({ name, totalDeposited }));
}

export function parseRevolutCSV(csvText: string): ParsedRow[] {
  // Savings account format: starts with Date,Description,Money out,...
  if (/^Date,Description,Money out/m.test(csvText)) {
    return parseRevolutSavingsCSV(csvText);
  }

  const lines = csvText.split("\n").filter((l) => l.trim());
  if (lines.length < 2) return [];
  return parseRevolutStandardCSV(lines);
}
