import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { PotsCard } from '@/components/PotsCard';
import { usePots } from '@/hooks/useTransactions';
import { Skeleton } from '@/components/ui/skeleton';
import { CreatePotModal } from '@/components/CreatePotModal';

export default function PotsPage() {
    const { data: pots = [], isLoading } = usePots();

    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Saving Pots
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Manage your savings goals and track your progress
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                >
                    + New Pot
                </button>

                {isLoading ? (
                    <Skeleton className="h-64 w-full rounded-xl" />
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <PotsCard
                            pots={pots}
                            onCreateNew={() => setIsModalOpen(true)}
                            onAddMoney={(id) => console.log('Add to pot', id)}
                        />
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
