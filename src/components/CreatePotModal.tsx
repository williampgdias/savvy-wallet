import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreatePot } from '@/hooks/useTransactions';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export function CreatePotModal({ isOpen, onClose }: Props) {
    const [name, setName] = useState('');
    const [target, setTarget] = useState('');
    const createPot = useCreatePot();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !target) return;

        await createPot.mutateAsync({
            name,
            targetAmount: Number(target),
        });

        setName('');
        setTarget('');
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New Savings Pot</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">
                            Goal Name (e.g., New Car, Trip)
                        </Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Trip to Italy"
                            required
                        />
                        <div className="space-y-2">
                            <Label htmlFor="target">Target Amount (€)</Label>
                            <Input
                                id="target"
                                type="number"
                                value={target}
                                onChange={(e) => setTarget(e.target.value)}
                                placeholder="1500"
                                required
                            />
                        </div>
                        <DialogFooter>
                            <Button
                                type="submit"
                                disabled={createPot.isPending}
                            >
                                {createPot.isPending
                                    ? 'Creating...'
                                    : 'Create Pot'}
                            </Button>
                        </DialogFooter>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
