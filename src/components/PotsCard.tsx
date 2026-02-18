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
    pots: Pot[];
    onAddMoney: (id: string) => void;
    onCreateNew: () => void;
}

export function PotsCard({ pots, onAddMoney, onCreateNew }: Props) {
    return (
        <Card className="border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-medium">
                    My savings Pots
                </CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-6">
                {pots.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic py-4">
                        No pots created yet. Start saving for a goal!
                    </p>
                ) : (
                    pots.map((pot) => {
                        const percentage = Math.min(
                            (pot.currentAmount / pot.targetAmount) * 100,
                            100,
                        );

                        return (
                            <div key={pot.id} className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium">
                                        {pot.name}
                                    </span>
                                    <span className="text-muted-foreground">
                                        €{pot.currentAmount.toFixed(2)} / €
                                        {pot.targetAmount.toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Progress
                                        value={percentage}
                                        className="h-2"
                                    />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 shrink-0"
                                        onClick={() => onAddMoney(pot.id)}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        );
                    })
                )}
                <Button
                    className="w-full mt-2"
                    variant="outline"
                    size="sm"
                    onClick={onCreateNew}
                >
                    Create New Pot
                </Button>
            </CardContent>
        </Card>
    );
}
