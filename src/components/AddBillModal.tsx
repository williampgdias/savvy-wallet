/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import useApi from '@/hooks/useApi';

interface AddBillModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    billToEdit?: any;
}

export function AddBillModal({
    isOpen,
    onClose,
    onSave,
    billToEdit,
}: AddBillModalProps) {
    const { fetchWithAuth } = useApi();
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('Entertainment');
    const [dueDate, setDueDate] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (billToEdit) {
            setName(billToEdit.name);
            setAmount(billToEdit.amount.toString());
            setCategory(billToEdit.category);
            setDueDate(billToEdit.dueDate.toString());
        } else {
            setName('');
            setAmount('');
            setCategory('Entertainment');
            setDueDate('');
        }
    }, [billToEdit, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const path = billToEdit
            ? `/recurring-bills/${billToEdit.id}`
            : '/recurring-bills';

        const method = billToEdit ? 'PUT' : 'POST';

        try {
            const response = await fetchWithAuth(path, {
                method: method,
                body: JSON.stringify({
                    name,
                    amount: Number(amount),
                    category,
                    dueDate: Number(dueDate),
                }),
            });

            if (response.ok) {
                onSave();
                onClose();
            } else {
                alert('Failed to save the bill!');
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-xl bg-card p-6 shadow-lg">
                <div className="flex flex-row items-center justify-between mb-6 w-full">
                    <h2 className="text-lg font-semibold">
                        {billToEdit
                            ? 'Edit Recurring Bill'
                            : 'Add Recurring Bill'}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full p-1 hover:bg-muted shrink-0"
                    >
                        <X className="h-5 w-5 text-muted-foreground" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium mb-1 block">
                            Name (e.g., Netflix)
                        </label>
                        <input
                            required
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium mb-1 block">
                                Amount (€)
                            </label>
                            <input
                                required
                                type="number"
                                step="0.01"
                                min="0"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">
                                Due Date (Day)
                            </label>
                            <input
                                required
                                type="number"
                                min="1"
                                max="31"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="1-31"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium mb-1 block">
                            Category
                        </label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="Entertainment">Entertainment</option>
                            <option value="Utilities">Utilities</option>
                            <option value="Housing">Housing</option>
                            <option value="Gym & Health">Gym & Health</option>
                            <option value="Education">Education</option>
                            <option value="Bills">Bills</option>
                        </select>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full rounded-md border border-input bg-transparent px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                        >
                            {isSubmitting
                                ? 'Saving...'
                                : billToEdit
                                  ? 'Update Bill'
                                  : 'Save Bill'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
