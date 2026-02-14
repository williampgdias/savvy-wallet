import { useState, useCallback } from "react";
import { Upload, FileText, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { parseRevolutCSV, CATEGORIES, CATEGORY_BADGE_CLASSES } from "@/lib/categories";
import { useInsertTransactions } from "@/hooks/useTransactions";
import { toast } from "sonner";

type ParsedRow = {
  name: string;
  amount: number;
  date: string;
  category: string;
  is_income: boolean;
};

export function CSVImportModal() {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const insertMutation = useInsertTransactions();

  const handleFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsed = parseRevolutCSV(text);
      setRows(parsed);
    };
    reader.readAsText(file);
  }, []);

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

  const handleImport = async () => {
    try {
      await insertMutation.mutateAsync(rows);
      toast.success(`${rows.length} transactions imported!`);
      setRows([]);
      setOpen(false);
    } catch {
      toast.error("Failed to import transactions.");
    }
  };

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
            <p className="text-sm text-muted-foreground">{rows.length} transactions parsed. Review categories below.</p>
            <div className="rounded-xl border border-border/50 overflow-hidden max-h-[400px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Category</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-sm">{r.name}</TableCell>
                      <TableCell className={`text-sm font-medium ${r.is_income ? "text-emerald-500" : "text-red-500"}`}>
                        {r.is_income ? "+" : "-"}€{r.amount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Select value={r.category} onValueChange={(v) => updateCategory(i, v)}>
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
            <div className="flex justify-end gap-2">
              <Button variant="outline" className="rounded-xl" onClick={() => setRows([])}>
                Cancel
              </Button>
              <Button className="rounded-xl" onClick={handleImport} disabled={insertMutation.isPending}>
                {insertMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Import {rows.length} transactions
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
