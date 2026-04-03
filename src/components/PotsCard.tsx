import { useState } from 'react';
import { Target, Plus, Trash2, Pencil } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useDeletePot } from '@/hooks/useTransactions';
import { DepositPotModal } from '@/components/DepositPotModal';
import { EditPotModal } from '@/components/EditPotModal';

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
    const deletePot = useDeletePot();
    const [depositOpen, setDepositOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);

    if (!pot) return null;

    const percentage = Math.min(
        (pot.currentAmount / pot.targetAmount) * 100,
        100,
    );

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
                    <span>Target: €{pot.targetAmount.toFixed(2)}</span>
                </div>
            </div>
        );
    }

    return (
        <>
            <Card className="relative border-border/50 shadow-sm hover:shadow-md transition-all">
                <div className="absolute top-2 right-2 flex gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                        onClick={() => setEditOpen(true)}
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        onClick={() => deletePot.mutate(pot.id)}
                        disabled={deletePot.isPending}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>

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
                            Target: €{pot.targetAmount.toFixed(2)}
                        </span>
                    </div>

                    <Button
                        className="w-full mt-2 gap-2"
                        variant="secondary"
                        onClick={() => setDepositOpen(true)}
                    >
                        <Plus className="h-4 w-4" />
                        Add Money
                    </Button>
                </CardContent>
            </Card>

            <DepositPotModal
                isOpen={depositOpen}
                onClose={() => setDepositOpen(false)}
                pot={pot}
            />
            <EditPotModal
                isOpen={editOpen}
                onClose={() => setEditOpen(false)}
                pot={pot}
            />
        </>
    );
}
