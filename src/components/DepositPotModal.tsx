import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDepositPot } from '@/hooks/useTransactions';
import { toast } from 'sonner';

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

export function DepositPotModal({ isOpen, onClose, pot }: Props) {
    const [amount, setAmount] = useState('');
    const depositPot = useDepositPot();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!pot || !amount) return;

        try {
            await depositPot.mutateAsync({ id: pot.id, amount: Number(amount) });
            setAmount('');
            onClose();
        } catch {
            toast.error('Insufficient balance or invalid amount.');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { setAmount(''); onClose(); } }}>
            <DialogContent className="sm:max-w-[360px]">
                <DialogHeader>
                    <DialogTitle>Add Money to "{pot?.name}"</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="deposit-amount">Amount (€)</Label>
                        <Input
                            id="deposit-amount"
                            type="number"
                            min="0.01"
                            step="0.01"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>
                    <div className="flex gap-3">
                        <Button type="button" variant="outline" className="flex-1" onClick={() => { setAmount(''); onClose(); }}>
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1" disabled={depositPot.isPending}>
                            {depositPot.isPending ? 'Saving...' : 'Add Money'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
