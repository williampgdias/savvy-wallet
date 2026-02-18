import { Target, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useDepositPot, useDeletePot } from '@/hooks/useTransactions';

interface Pot {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
}

interface Props {
    pot: Pot;
    variant?: 'default' | 'compact';
}

export function PotsCard({ pot, variant = 'default' }: Props) {
    const depositPot = useDepositPot();
    const deletePot = useDeletePot();

    if (!pot) return null;

    const percentage = Math.min(
        (pot.currentAmount / pot.targetAmount) * 100,
        100,
    );

    const handleDeposit = () => {
        const amount = prompt(
            `How much do you want to store in "${pot.name}"?`,
        );
        if (amount && !isNaN(Number(amount)) && Number(amount) > 0) {
            depositPot.mutate({ id: pot.id, amount: Number(amount) });
        }
    };

    // Compact PotsCard
    if (variant === 'compact') {
        return (
            <div className="space-y-2 p-1">
                <div className="flex justify-between text-sm font-medium">
                    <span>{pot.name}</span>
                    <span className="text-muted-foreground">
                        {percentage.toFixed(0)}%
                    </span>
                </div>
                <Progress value={percentage} className="h-2" />
                <div className="flex justify-between text-[10px] text-muted-foreground italic">
                    <span>Saved: €{pot.currentAmount.toFixed(2)}</span>
                    <span>Target: €{pot.currentAmount.toFixed(2)}</span>
                </div>
            </div>
        );
    }

    // Default PotsCard
    return (
        <Card className="relative border-border/50 shadow-sm hover:shadow-md transition-all">
            <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                onClick={() => {
                    if (
                        confirm(`Are you want to delete the pot "${pot.name}"?`)
                    )
                        deletePot.mutate(pot.id);
                }}
                disabled={deletePot.isPending}
            >
                <Trash2 className="h-4 w-4" />
            </Button>

            <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    <CardTitle className="text-base font-semibold">
                        {pot.name}
                    </CardTitle>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Saved</span>
                    <span className="font-medium text-primary">
                        €{pot.currentAmount.toFixed(2)}
                    </span>
                </div>

                <Progress value={percentage} className="h-2" />

                <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>{percentage.toFixed(0)}% reached</span>
                    <span className="text-right">
                        Target: {pot.targetAmount.toFixed(2)}
                    </span>
                </div>

                <Button
                    className="w-full mt-2 gap-2"
                    variant="secondary"
                    onClick={handleDeposit}
                    disabled={depositPot.isPending}
                >
                    <Plus className="h-4 w-4" />
                    {depositPot.isPending ? 'Saving...' : 'Add Money'}
                </Button>
            </CardContent>
        </Card>
    );
}
