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
  [["lidl", "tesco", "aldi", "dunnes"], "Groceries"],
  [["burger king", "mcdonalds", "kfc"], "Dining Out"],
  [["temu", "shein", "amazon", "penneys"], "Lifestyle"],
  [["dublin zoo", "netflix", "spotify"], "Entertainment"],
  [["leap card", "luas"], "Transportation"],
  [["compass group", "salary", "caireen early years ltd"], "Income"],
  [["church", "i am church"], "General"],
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

export function parseRevolutCSV(csvText: string): Array<{
  name: string;
  amount: number;
  date: string;
  category: Category;
  is_income: boolean;
}> {
  const lines = csvText.split("\n").filter((l) => l.trim());
  if (lines.length < 2) return [];

  const header = lines[0].split(",").map((h) => h.trim().replace(/"/g, "").toLowerCase());
  const dateIdx = header.findIndex((h) => h.includes("started date") || h.includes("date"));
  const descIdx = header.findIndex((h) => h.includes("description"));
  const amountIdx = header.findIndex((h) => h === "amount");

  if (dateIdx === -1 || descIdx === -1 || amountIdx === -1) return [];

  return lines.slice(1).map((line) => {
    // Handle CSV with quoted fields
    const fields: string[] = [];
    let current = "";
    let inQuotes = false;
    for (const char of line) {
      if (char === '"') { inQuotes = !inQuotes; continue; }
      if (char === "," && !inQuotes) { fields.push(current.trim()); current = ""; continue; }
      current += char;
    }
    fields.push(current.trim());

    const description = fields[descIdx] || "Unknown";
    const rawAmount = parseFloat(fields[amountIdx] || "0");
    const amount = Math.abs(rawAmount);
    const { category, isIncome } = categorizeTransaction(description);

    return {
      name: description,
      amount,
      date: new Date(fields[dateIdx] || Date.now()).toISOString(),
      category,
      is_income: rawAmount > 0 || isIncome,
    };
  }).filter((t) => t.amount > 0);
}
