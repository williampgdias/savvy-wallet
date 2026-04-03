import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUpdatePot } from '@/hooks/useTransactions';

interface Pot {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    pot: Pot | null;
}

export function EditPotModal({ isOpen, onClose, pot }: Props) {
    const [name, setName] = useState('');
    const [target, setTarget] = useState('');
    const updatePot = useUpdatePot();

    useEffect(() => {
        if (pot) {
            setName(pot.name);
            setTarget(pot.targetAmount.toString());
        }
    }, [pot]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!pot || !name || !target) return;

        await updatePot.mutateAsync(
            { id: pot.id, name, targetAmount: Number(target) },
        );
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Savings Pot</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="edit-name">Goal Name</Label>
                        <Input
                            id="edit-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit-target">Target Amount (€)</Label>
                        <Input
                            id="edit-target"
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={target}
                            onChange={(e) => setTarget(e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1" disabled={updatePot.isPending}>
                            {updatePot.isPending ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
