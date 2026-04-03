import { useState, useCallback, useEffect } from "react";
import { Upload, FileText, Loader2, PiggyBank } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { parseRevolutCSV, detectPotsFromCSV, CATEGORIES, type ParsedRow } from "@/lib/categories";
import { useImportTransactions, useCreatePot, usePots } from "@/hooks/useTransactions";
import { toast } from "sonner";

type DetectedPot = {
  name: string;
  totalDeposited: number;
};

export function CSVImportModal() {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [detectedPots, setDetectedPots] = useState<DetectedPot[]>([]);
  const [selectedPotNames, setSelectedPotNames] = useState<Set<string>>(new Set());

  const importMutation = useImportTransactions();
  const createPot = useCreatePot();
  const { data: existingPots = [] } = usePots();

  const handleFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsed = parseRevolutCSV(text);
      setRows(parsed);
    };
    reader.readAsText(file);
  }, []);

  // Detect new pots whenever rows change
  useEffect(() => {
    if (rows.length === 0) {
      setDetectedPots([]);
      setSelectedPotNames(new Set());
      return;
    }
    const allDetected = detectPotsFromCSV(rows);
    const existingNames = new Set(existingPots.map((p: { name: string }) => p.name.toLowerCase()));
    const newPots = allDetected.filter((p) => !existingNames.has(p.name.toLowerCase()));
    setDetectedPots(newPots);
    setSelectedPotNames(new Set(newPots.map((p) => p.name)));
  }, [rows, existingPots]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const updateCategory = (idx: number, category: string) => {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, category, is_income: category === "Income" } : r)));
  };

  const togglePot = (name: string) => {
    setSelectedPotNames((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const realTransactions = rows.filter((r) => !r.is_transfer);
  const transferCount = rows.length - realTransactions.length;

  const handleImport = async () => {
    try {
      // Import only real transactions (no internal transfers)
      const result = await importMutation.mutateAsync(realTransactions);

      // Create selected pots
      const potsToCreate = detectedPots.filter((p) => selectedPotNames.has(p.name));
      for (const pot of potsToCreate) {
        await createPot.mutateAsync({ name: pot.name, targetAmount: pot.totalDeposited });
      }

      // Toast summary
      const parts: string[] = [];
      if (result.skipped > 0) {
        parts.push(`${result.imported} transactions imported, ${result.skipped} duplicates skipped`);
      } else {
        parts.push(`${result.imported} transactions imported`);
      }
      if (potsToCreate.length > 0) {
        parts.push(`${potsToCreate.length} pot${potsToCreate.length > 1 ? "s" : ""} created`);
      }
      toast.success(parts.join(" · "));

      setRows([]);
      setOpen(false);
    } catch {
      toast.error("Failed to import. Please try again.");
    }
  };

  const isPending = importMutation.isPending || createPot.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-xl gap-2">
          <Upload className="h-4 w-4" /> Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Revolut CSV</DialogTitle>
        </DialogHeader>

        {rows.length === 0 ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={onDrop}
            className={`flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-12 transition-colors ${
              dragActive ? "border-primary bg-primary/5" : "border-border"
            }`}
          >
            <FileText className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Drag & drop your Revolut CSV, or</p>
            <label>
              <input type="file" accept=".csv" onChange={onFileInput} className="hidden" />
              <Button variant="outline" className="rounded-xl" asChild>
                <span>Browse files</span>
              </Button>
            </label>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {realTransactions.length} transactions to import.
              </p>
              {transferCount > 0 && (
                <p className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                  {transferCount} internal transfer{transferCount > 1 ? "s" : ""} excluded (To/From savings, deposits)
                </p>
              )}
            </div>

            <div className="rounded-xl border border-border/50 overflow-hidden max-h-[300px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Category</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {realTransactions.map((r, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-sm">{r.name}</TableCell>
                      <TableCell className={`text-sm font-medium ${r.is_income ? "text-emerald-500" : "text-red-500"}`}>
                        {r.is_income ? "+" : "-"}€{r.amount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Select value={r.category} onValueChange={(v) => updateCategory(rows.indexOf(r), v)}>
                          <SelectTrigger className="h-8 w-[140px] rounded-lg">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORIES.map((c) => (
                              <SelectItem key={c} value={c}>{c}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Detected pots section */}
            {detectedPots.length > 0 && (
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <PiggyBank className="h-4 w-4 text-primary" />
                  <p className="text-sm font-semibold text-primary">
                    {detectedPots.length} savings pot{detectedPots.length > 1 ? "s" : ""} detected
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  These savings pots were found in your CSV. Select which ones to create automatically.
                </p>
                <div className="space-y-2">
                  {detectedPots.map((pot) => (
                    <label
                      key={pot.name}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-background px-3 py-2 cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={selectedPotNames.has(pot.name)}
                          onCheckedChange={() => togglePot(pot.name)}
                        />
                        <span className="text-sm font-medium">{pot.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        €{pot.totalDeposited.toFixed(2)} deposited
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" className="rounded-xl" onClick={() => setRows([])}>
                Cancel
              </Button>
              <Button className="rounded-xl" onClick={handleImport} disabled={isPending || realTransactions.length === 0}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Import {realTransactions.length} transactions{selectedPotNames.size > 0 ? ` + ${selectedPotNames.size} pot${selectedPotNames.size > 1 ? "s" : ""}` : ""}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
