/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { Repeat } from 'lucide-react';
import { Link } from 'react-router-dom';

import { DashboardLayout } from '@/components/DashboardLayout';
import { MonthYearFilter } from '@/components/MonthYearFilter';
import { SummaryCards } from '@/components/SummaryCards';
import { CategoryChart } from '@/components/CategoryChart';
import { TransactionsTable } from '@/components/TransactionsTable';
import { PotsCard } from '@/components/PotsCard';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

import {
    useTransactions,
    useSummary,
    useCategoryData,
    usePots,
} from '@/hooks/useTransactions';
import { useRecurringBills } from '@/hooks/useRecurringBills';

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
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [page, setPage] = useState(1);

    const { data: transactions, isLoading: isTransactionsLoading } =
        useTransactions(month, year, page);
    const { data: summary, isLoading: isSummaryLoading } = useSummary(
        month,
        year,
    );
    const { data: chartData, isLoading: isChartLoading } = useCategoryData(
        month,
        year,
    );
    const { data: pots = [] } = usePots();
    const { data: recurringBills, isLoading: isBillsLoading } =
        useRecurringBills();

    const filteredTransactions =
        ((transactions?.data as Transaction[]) || [])?.filter(
            (t) =>
                selectedCategory === 'All' || t.category === selectedCategory,
        ) ?? [];

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
                    {isChartLoading ? (
                        <Skeleton className="h-[300px] w-full rounded-xl" />
                    ) : (
                        <div className="space-y-6">
                            <CategoryChart data={chartData ?? []} />
                            {/* <PotsCard pot={pots[0]} /> */}
                            {/* POTS */}
                            <div className="bg-card border border-border/50 rounded-xl p-6 space-y-6">
                                <h2 className="text-base font-medium">
                                    Savings Progress
                                </h2>
                                <div className="space-y-6">
                                    {pots.slice(0, 3).map((pot) => (
                                        <PotsCard
                                            key={pot.id}
                                            pot={pot}
                                            variant="compact"
                                        />
                                    ))}
                                </div>
                                <Button
                                    variant="ghost"
                                    className="w-full text-xs text-muted-foreground hover:text-primary"
                                    asChild
                                >
                                    <Link to="/pots">View all goals →</Link>
                                </Button>
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base font-medium text-foreground">
                                Recent Transactions
                            </h2>
                            <select
                                value={selectedCategory}
                                onChange={(e) =>
                                    setSelectedCategory(e.target.value)
                                }
                                className="text-sm bg-transparent border border-border/50 rounded-md px-2 py-1 focus:outline-none italic text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <option value="All">All Categories</option>
                                <option value="Groceries">Groceries</option>
                                <option value="Dining Out">Dining Out</option>
                                <option value="Transportation">
                                    Transportation
                                </option>
                                <option value="Lifestyle">Lifestyle</option>
                                <option value="Entertainment">
                                    Entertainment
                                </option>
                                <option value="Health">Health</option>
                                <option value="Utilities">Utilities</option>
                                <option value="Income">Income</option>
                                <option value="General">General</option>
                            </select>
                        </div>
                        {isTransactionsLoading ? (
                            <Skeleton className="h-64 rounded-xl" />
                        ) : (
                            <>
                                <TransactionsTable
                                    transactions={filteredTransactions}
                                />

                                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                                    <p className="text-xs text-muted-foreground italic">
                                        Page {page} of{' '}
                                        {transactions?.totalPages || 1}
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            disabled={page === 1}
                                            onClick={() =>
                                                setPage((prev) => prev - 1)
                                            }
                                            className="px-3 py-1 text-xs font-semibold bg-secondary text-secondary-foreground rounded-md disabled:opacity-30 hover:bg-secondary/80 transition-all"
                                        >
                                            Previous
                                        </button>
                                        <button
                                            disabled={
                                                page >=
                                                (transactions?.totalPages || 1)
                                            }
                                            onClick={() =>
                                                setPage((prev) => prev + 1)
                                            }
                                            className="px-3 py-1 text-xs font-semibold bg-secondary text-secondary-foreground rounded-md disabled:opacity-30 hover:bg-secondary/80 transition-all"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                        <div className="pt-6 mt-6 border-t border-border/50">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-base font-medium text-foreground">
                                    Upcoming Bills
                                </h2>
                                <Button variant="ghost">
                                    <Link to="/recurring-bills">
                                        View all →
                                    </Link>
                                </Button>
                            </div>

                            {isBillsLoading ? (
                                <Skeleton className="h-48 rounded-xl" />
                            ) : (
                                <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
                                    {!recurringBills ||
                                    recurringBills.length === 0 ? (
                                        <div className="p-6 text-center text-sm text-muted-foreground italic">
                                            No upcoming bills.
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-border/50">
                                            {recurringBills
                                                .slice(0, 5)
                                                .map((bill: any) => (
                                                    <div
                                                        key={bill.id}
                                                        className="flex items-center justify-between p-4 hover:bg-muted/10 transition-colors"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                                                                <Repeat className="h-4 w-4" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium leading-none mb-1 text-foreground">
                                                                    {bill.name}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    Due on day{' '}
                                                                    {
                                                                        bill.dueDate
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="text-sm font-medium text-foreground">
                                                            €
                                                            {bill.amount.toFixed(
                                                                2,
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
