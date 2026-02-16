/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { Plus, X } from 'lucide-react';

export default function AddTransactionModal({
    onSave,
}: {
    onSave: (data: any) => void;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        amount: '',
        category: 'General',
        date: new Date().toISOString().split('T')[0],
        type: 'expense',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        let finalAmount = parseFloat(formData.amount);

        if (formData.type === 'expense') {
            finalAmount = -Math.abs(finalAmount);
        } else {
            finalAmount = Math.abs(finalAmount);
        }

        onSave({
            name: formData.name,
            amount: finalAmount,
            category: formData.category,
            date: formData.date,
        });

        setIsOpen(false);
        setFormData({ ...formData, name: '', amount: '' });
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition-all shadow-sm"
            >
                <Plus size={18} />
                Add Manual
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-card text-card-foreground rounded-2xl shadow-2xl w-full max-w-md p-6 relative border border-border animate-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X size={20} />
                        </button>

                        <h3 className="text-xl font-bold text-gray-900 mb-6">
                            New Transaction
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Type (Income / Expense) */}
                            <div className="flex bg-muted p-1 rounded-lg border border-border">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setFormData({
                                            ...formData,
                                            type: 'expense',
                                        })
                                    }
                                    className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
                                        formData.type === 'expense'
                                            ? 'bg-destructive text-destructive-foreground shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    Expense
                                </button>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setFormData({
                                            ...formData,
                                            type: 'income',
                                        })
                                    }
                                    className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
                                        formData.type === 'income'
                                            ? 'bg-success text-success-foreground shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    Income
                                </button>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1 italic">
                                    Description
                                </label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. Coffee at Kaph"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            name: e.target.value,
                                        })
                                    }
                                    className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                                />
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-muted-foreground mb-1 italic">
                                        Amount (€)
                                    </label>
                                    <input
                                        required
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="0.00"
                                        value={formData.amount}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                amount: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-muted-foreground mb-1 italic">
                                        Date
                                    </label>
                                    <input
                                        required
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                date: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                                    />
                                </div>
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1 italic">
                                    Category
                                </label>
                                <select
                                    value={formData.category}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            category: e.target.value,
                                        })
                                    }
                                    className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                                >
                                    <option value="General">General</option>
                                    <option value="Groceries">
                                        Groceries (Lidl/Tesco)
                                    </option>
                                    <option value="Dining Out">
                                        Dining Out (Restaurants/Pubs)
                                    </option>
                                    <option value="Transportation">
                                        Transportation (Leap Card/Luas)
                                    </option>
                                    <option value="Lifestyle">
                                        Lifestyle (Shopping/Gym)
                                    </option>
                                    <option value="Entertainment">
                                        Entertainment (Netflix/Events)
                                    </option>
                                    <option value="Health">
                                        Health (Pharmacy/GP)
                                    </option>
                                    <option value="Utilities">
                                        Utilities (Electric/Bins)
                                    </option>
                                    <option value="Income">
                                        Income (Salary/Refunds)
                                    </option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                className="w-full mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition-all"
                            >
                                Save Transaction
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
