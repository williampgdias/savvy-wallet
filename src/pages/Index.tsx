import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { MonthYearFilter } from '@/components/MonthYearFilter';
import { SummaryCards } from '@/components/SummaryCards';
import { CategoryChart } from '@/components/CategoryChart';
import { TransactionsTable } from '@/components/TransactionsTable';
import { useTransactions, useSummary } from '@/hooks/useTransactions';
import { Skeleton } from '@/components/ui/skeleton';

interface Transaction {
    id: string;
    name: string;
    amount: number;
    category: string;
    date: string;
}

export default function Index() {
    const now = new Date();
    const [month, setMonth] = useState(now.getMonth());
    const [year, setYear] = useState(now.getFullYear());

    const { data: transactions, isLoading: isTransactionsLoading } =
        useTransactions(month, year);
    const { data: summary, isLoading: isSummaryLoading } = useSummary(
        month,
        year,
    );
    const categoryData =
        ((transactions as Transaction[]) || [])
            .filter((t) => Number(t.amount) < 0)
            .reduce<Record<string, number>>((acc, t) => {
                const category = t.category || 'General';
                acc[category] =
                    (acc[category] || 0) + Math.abs(Number(t.amount));
                return acc;
            }, {}) ?? {};

    const chartData = Object.entries(categoryData).map(([name, value]) => ({
        name,
        value: Number(value),
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
                            Your financies overview
                        </p>
                    </div>
                    <MonthYearFilter
                        month={month}
                        year={year}
                        onChange={(m, y) => {
                            setMonth(m);
                            setYear(y);
                        }}
                    />
                </div>

                {isSummaryLoading ? (
                    <div className="grid gap-4 sm:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-24 rounded-xl" />
                        ))}
                    </div>
                ) : (
                    <SummaryCards
                        income={Number(summary?.income) || 0}
                        expenses={Number(summary?.expenses) || 0}
                    />
                )}

                <div className="grid gap-6 lg:grid-cols-2">
                    <CategoryChart data={chartData} />
                    <div className="space-y-4">
                        <h2 className="text-base font-medium">
                            Recent Transactions
                        </h2>
                        {isTransactionsLoading ? (
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
