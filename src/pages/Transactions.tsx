import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout } from '@/components/DashboardLayout';
import { MonthYearFilter } from '@/components/MonthYearFilter';
import { TransactionsTable } from '@/components/TransactionsTable';
import { CSVImportModal } from '@/components/CSVImportModal';
import { useTransactions } from '@/hooks/useTransactions';
import { Skeleton } from '@/components/ui/skeleton';
import AddTransactionModal from '@/components/AddTransactionModal';

export default function Transactions() {
    const now = new Date();
    const [month, setMonth] = useState(now.getMonth());
    const [year, setYear] = useState(now.getFullYear());
    const { data: transactions, isLoading } = useTransactions(month, year);

    const handleManualSave = async (newTransaction: any) => {
        try {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                alert('Unauthenticated user!');
                return;
            }

            const { error } = await supabase.from('transactions').insert([
                {
                    ...newTransaction,
                    user_id: user.id,
                },
            ]);

            if (error) throw error;

            window.location.reload();
        } catch (error) {
            console.error('Error saving to Supabase:', error);
            alert('Error saving transaction.');
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
                    <div className="flex gap-4">
                        <MonthYearFilter
                            month={month}
                            year={year}
                            onChange={(m, y) => {
                                setMonth(m);
                                setYear(y);
                            }}
                        />
                        <CSVImportModal />
                        <AddTransactionModal onSave={handleManualSave} />
                    </div>
                </div>

                {isLoading ? (
                    <Skeleton className="h-96 rounded-xl" />
                ) : (
                    <TransactionsTable transactions={transactions ?? []} />
                )}
            </div>
        </DashboardLayout>
    );
}
