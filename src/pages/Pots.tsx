import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { PotsCard } from '@/components/PotsCard';
import { usePots } from '@/hooks/useTransactions';
import { Skeleton } from '@/components/ui/skeleton';
import { CreatePotModal } from '@/components/CreatePotModal';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function PotsPage() {
    const { data: pots = [], isLoading } = usePots();
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Saving Pots
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Manage your savings goals and track your progress
                        </p>
                    </div>
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        className="gap-2"
                    >
                        <Plus className="h-4 w-4" /> New Pot
                    </Button>
                </div>

                {isLoading ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-48 rounded-xl" />
                        ))}
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {pots.map((pot) => (
                            <PotsCard
                                key={pot.id}
                                pot={pot}
                                onAddMoney={(id) =>
                                    console.log('Depositar no:', id)
                                }
                            />
                        ))}
                    </div>
                )}
            </div>

            <CreatePotModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </DashboardLayout>
    );
}
