import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { MonthYearFilter } from '@/components/MonthYearFilter';
import { SummaryCards } from '@/components/SummaryCards';
import { CategoryChart } from '@/components/CategoryChart';
import { TransactionsTable } from '@/components/TransactionsTable';
import { useTransactions } from '@/hooks/useTransactions';
import { Skeleton } from '@/components/ui/skeleton';

export default function Index() {
    const now = new Date();
    const [month, setMonth] = useState(now.getMonth());
    const [year, setYear] = useState(now.getFullYear());
    const { data: transactions, isLoading } = useTransactions(month, year);

    const income =
        transactions
            ?.filter((t) => t.is_income)
            .reduce((s, t) => s + Number(t.amount), 0) ?? 0;
    const expenses =
        transactions
            ?.filter((t) => !t.is_income)
            .reduce((s, t) => s + Number(t.amount), 0) ?? 0;

    const categoryData =
        transactions
            ?.filter((t) => !t.is_income)
            .reduce<Record<string, number>>((acc, t) => {
                acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
                return acc;
            }, {}) ?? {};

    const chartData = Object.entries(categoryData).map(([name, value]) => ({
        name,
        value,
    }));

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Dashboard
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Your financial overview
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <MonthYearFilter
                            month={month}
                            year={year}
                            onChange={(m, y) => {
                                setMonth(m);
                                setYear(y);
                            }}
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div className="grid gap-4 sm:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-24 rounded-xl" />
                        ))}
                    </div>
                ) : (
                    <SummaryCards income={income} expenses={expenses} />
                )}

                <div className="grid gap-6 lg:grid-cols-2">
                    <CategoryChart data={chartData} />
                    <div className="space-y-4">
                        <h2 className="text-base font-medium">
                            Recent Transactions
                        </h2>
                        {isLoading ? (
                            <Skeleton className="h-64 rounded-xl" />
                        ) : (
                            <TransactionsTable
                                transactions={transactions?.slice(0, 10) ?? []}
                            />
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
