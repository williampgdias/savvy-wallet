import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
    income: number;
    expenses: number;
}

export function SummaryCards({ income, expenses }: Props) {
    const net = income - expenses;

    const cards = [
        {
            label: 'Total Income',
            value: income,
            icon: TrendingUp,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10',
        },
        {
            label: 'Total Expenses',
            value: expenses,
            icon: TrendingDown,
            color: 'text-red-500',
            bg: 'bg-red-500/10',
        },
        {
            label: 'Net Balance',
            value: net,
            icon: Wallet,
            color: net >= 0 ? 'text-emerald-500' : 'text-red-500',
            bg: net >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10',
        },
    ];

    return (
        <div className="grid gap-4 sm:grid-cols-3">
            {cards.map((c) => (
                <Card key={c.label} className="border-border/50 shadow-sm">
                    <CardContent className="flex items-center gap-4 p-5">
                        <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${c.bg}`}
                        >
                            <c.icon className={`h-5 w-5 ${c.color}`} />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">
                                {c.label}
                            </p>
                            <p className="text-xl font-semibold tracking-tight">
                                €
                                {c.value.toLocaleString('en-IE', {
                                    minimumFractionDigits: 2,
                                })}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
