import { useState } from 'react';
import { format } from 'date-fns';
import { Download } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { MonthYearFilter } from '@/components/MonthYearFilter';
import { TransactionsTable } from '@/components/TransactionsTable';
import { CSVImportModal } from '@/components/CSVImportModal';
import { useTransactions, useCreateTransaction, useExportTransactions } from '@/hooks/useTransactions';
import { Skeleton } from '@/components/ui/skeleton';
import AddTransactionModal from '@/components/AddTransactionModal';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function Transactions() {
    const now = new Date();
    const [month, setMonth] = useState(now.getMonth());
    const [year, setYear] = useState(now.getFullYear());
    const { data: transactionsResult, isLoading } = useTransactions(
        month,
        year,
    );
    const createTransaction = useCreateTransaction();
    const exportTransactions = useExportTransactions();
    const [isExporting, setIsExporting] = useState(false);

    const handleManualSave = (newTransaction: { name: string; amount: number; category: string; date: string }) => {
        createTransaction.mutate(newTransaction);
    };

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const data = await exportTransactions(month, year);
            if (data.length === 0) {
                toast.info('No transactions to export for this period.');
                return;
            }
            const headers = ['Date', 'Description', 'Category', 'Amount'];
            const rows = data.map((t) => [
                format(new Date(t.date), 'yyyy-MM-dd'),
                `"${t.name.replace(/"/g, '""')}"`,
                t.category,
                t.amount.toFixed(2),
            ]);
            const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `transactions-${year}-${String(month + 1).padStart(2, '0')}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        } catch {
            toast.error('Failed to export transactions.');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Transactions
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            All transactions for the selected period
                        </p>
                    </div>
                    <div className="flex gap-4 flex-wrap">
                        <MonthYearFilter
                            month={month}
                            year={year}
                            onChange={(m, y) => {
                                setMonth(m);
                                setYear(y);
                            }}
                        />
                        <Button
                            variant="outline"
                            className="gap-2"
                            onClick={handleExport}
                            disabled={isExporting}
                        >
                            <Download className="h-4 w-4" />
                            {isExporting ? 'Exporting...' : 'Export CSV'}
                        </Button>
                        <CSVImportModal />
                        <AddTransactionModal onSave={handleManualSave} />
                    </div>
                </div>

                {isLoading ? (
                    <Skeleton className="h-96 rounded-xl" />
                ) : (
                    <TransactionsTable
                        transactions={transactionsResult?.data ?? []}
                    />
                )}
            </div>
        </DashboardLayout>
    );
}
