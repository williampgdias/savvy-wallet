import { DashboardLayout } from "@/components/DashboardLayout";
import { CSVImportModal } from "@/components/CSVImportModal";
import { Upload } from "lucide-react";

export default function Import() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Import</h1>
          <p className="text-sm text-muted-foreground">Import transactions from your Revolut CSV export</p>
        </div>

        <div className="flex flex-col items-center justify-center gap-6 rounded-2xl border border-dashed border-border p-16">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          <div className="text-center">
            <h2 className="text-lg font-medium">Import Revolut Statement</h2>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Upload your Revolut CSV export. Transactions will be automatically categorized based on the description.
            </p>
          </div>
          <CSVImportModal />
        </div>
      </div>
    </DashboardLayout>
  );
}
