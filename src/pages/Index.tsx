/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { Repeat, Bot, Send, Sparkles } from 'lucide-react';
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
    const [aiQuestion, setAiQuestion] = useState('');
    const [aiAnswer, setAiAnswer] = useState('');
    const [isAskingAI, setIsAskingAI] = useState(false);

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

    const handleAskAi = async () => {
        if (!aiQuestion.trim()) return;

        setIsAskingAI(true);
        setAiAnswer('');

        try {
            const response = await fetch('http://localhost:3001/api/advisor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question: aiQuestion }),
            });

            const data = await response.json();

            if (response.ok) {
                setAiAnswer(data.answer);
            } else {
                setAiAnswer(
                    'Oops! I think my brain is offline. Try again later.',
                );
            }
        } catch (error) {
            console.error(error);
            setAiAnswer('Error connecting to the AI Advisor.');
        } finally {
            setIsAskingAI(false);
            setAiQuestion('');
        }
    };

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

                {/* AI Advisor starts */}
                <div className="bg-gradient-to-br from-primary/10 via-background to-background border border-primary/20 rounded-xl overflow-hidden mb-6 shadow-sm">
                    <div className="p-5 border-b border-border/50 bg-card/50 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary">
                            <Bot className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                                AI Financial Advisor{' '}
                                <Sparkles className="h-3 w-3 text-amber-500" />
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                Ask me anything about your finances.
                            </p>
                        </div>
                    </div>

                    <div className="p-5 space-y-4">
                        {isAskingAI && (
                            <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground animate-pulse border border-border/50">
                                Analyzing your balance and bills...
                            </div>
                        )}

                        {!isAskingAI && aiAnswer && (
                            <div className="bg-primary/5 rounded-lg p-4 text-sm text-foreground border border-primary/10 leading-relaxed whitespace-pre-wrap">
                                {aiAnswer}
                            </div>
                        )}

                        {/* Questions area */}
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={aiQuestion}
                                onChange={(e) => setAiQuestion(e.target.value)}
                                onKeyDown={(e) =>
                                    e.key === 'Enter' && handleAskAi()
                                }
                                placeholder="Ex: Can I buy a €500 PS5 this month?"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus:visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 flex-1"
                            />

                            <button
                                onClick={handleAskAi}
                                disabled={isAskingAI || !aiQuestion.trim()}
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 shrink-0"
                            >
                                <Send className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* AI Advisor finishes */}

                <div className="grid gap-6 lg:grid-cols-2">
                    {isChartLoading ? (
                        <Skeleton className="h-[300px] w-full rounded-xl" />
                    ) : (
                        <div className="space-y-6">
                            <CategoryChart data={chartData ?? []} />
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

                        {/* Upcoming Bills container */}
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
                                                .map((bill: any) => {
                                                    const today =
                                                        new Date().getDate();
                                                    const daysLeft =
                                                        bill.dueDate - today;

                                                    let statusText = '';
                                                    let statusColor = '';

                                                    if (daysLeft < 0) {
                                                        statusText =
                                                            'Processed';
                                                        statusColor =
                                                            'bg-muted text-muted-foreground';
                                                    } else if (daysLeft === 0) {
                                                        statusText =
                                                            'Due Today';
                                                        statusColor =
                                                            'bg-destructive/10 text-destructive border-destructive/20 border';
                                                    } else if (
                                                        daysLeft > 0 &&
                                                        daysLeft <= 3
                                                    ) {
                                                        statusText = `In ${daysLeft} days`;
                                                        statusColor =
                                                            'bg-amber-50/10 text-amber-600 border-primary/20 border';
                                                    }

                                                    return (
                                                        <div
                                                            key={bill.id}
                                                            className="flex items-center justify-between p-4 hover:bg-muted/10 transition-colors"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                                                                    <Repeat className="h-4 w-4" />
                                                                </div>
                                                                <div className="flex items-center space-x-3">
                                                                    <p className="text-sm font-medium leading-none mb-1 text-foreground">
                                                                        {
                                                                            bill.name
                                                                        }
                                                                    </p>
                                                                    <span
                                                                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColor}`}
                                                                    >
                                                                        {
                                                                            statusText
                                                                        }
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="text-sm font-medium text-foreground">
                                                                €
                                                                {bill.amount.toFixed(
                                                                    2,
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
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
