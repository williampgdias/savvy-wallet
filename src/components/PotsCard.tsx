import { Target, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

interface Pot {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
}

interface Props {
    pot: Pot;
    onAddMoney: (id: string) => void;
    // onCreateNew: () => void;
}

export function PotsCard({ pot, onAddMoney }: Props) {
    const percentage = Math.min(
        (pot.currentAmount / pot.targetAmount) * 100,
        100,
    );

    return (
        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-semibold">
                    {pot.name}
                </CardTitle>
                <Target className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Saved</span>
                    <span className="font-medium">
                        €{pot.currentAmount.toFixed(2)}
                    </span>
                </div>

                <Progress value={percentage} className="h-2" />

                <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">
                        {percentage.toFixed(0)}% reached
                    </span>
                    <span className="text-muted-foreground text-right">
                        Target: {pot.targetAmount.toFixed(2)}
                    </span>
                </div>

                <Button
                    className="w-full mt-2 gap-2"
                    variant="secondary"
                    onClick={() => onAddMoney(pot.id)}
                >
                    <Plus className="h-4 w-4" /> Add Money
                </Button>
            </CardContent>
        </Card>
    );
}
