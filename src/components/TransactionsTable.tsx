import { Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CATEGORY_BADGE_CLASSES } from '@/lib/categories';
import { useDeleteTransaction } from '@/hooks/useTransactions';

interface Transaction {
    id: string;
    name: string;
    amount: number;
    category: string;
    date: string;
}

interface Props {
    transactions: Transaction[];
}

export function TransactionsTable({ transactions }: Props) {
    const deleteMutation = useDeleteTransaction();

    if (transactions.length === 0) {
        return (
            <p className="py-12 text-center text-sm text-muted-foreground">
                No transactions found.
            </p>
        );
    }

    return (
        <div className="rounded-xl border border-border/50 overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent">
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="w-10" />
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {transactions.map((t) => {
                        const isIncome = Number(t.amount) > 0;

                        return (
                            <TableRow key={t.id}>
                                <TableCell className="text-muted-foreground text-sm">
                                    {format(new Date(t.date), 'dd MMM yyyy')}
                                </TableCell>
                                <TableCell className="font-medium">
                                    {t.name}
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant="secondary"
                                        className={
                                            CATEGORY_BADGE_CLASSES[
                                                t.category as keyof typeof CATEGORY_BADGE_CLASSES
                                            ] || ''
                                        }
                                    >
                                        {t.category}
                                    </Badge>
                                </TableCell>
                                <TableCell
                                    className={`text-right font-medium ${isIncome ? 'text-emerald-500' : 'text-red-500'}`}
                                >
                                    {isIncome ? '+' : '-'}€
                                    {Math.abs(Number(t.amount)).toFixed(2)}
                                </TableCell>
                                <TableCell>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                        onClick={() =>
                                            deleteMutation.mutate(t.id)
                                        }
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
