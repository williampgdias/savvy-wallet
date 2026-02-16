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
            is_income: formData.type === 'income',
        });

        setIsOpen(false);
        setFormData({ ...formData, name: '', amount: '' });
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-semibold hover:bg-zinc-800 transition-colos shadow-sm"
            >
                <Plus size={18} />
                Add Manual
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative animate-in zoom-in-95 duration-200">
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
                            <div className="flex bg-gray-100 p-1 rounded-lg">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setFormData({
                                            ...formData,
                                            type: 'expense',
                                        })
                                    }
                                    className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${formData.type === 'expense' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
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
                                    className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${formData.type === 'income' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    Income
                                </button>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                />
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                    />
                                </div>
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white"
                                >
                                    <option>General</option>
                                    <option>Groceries</option>
                                    <option>Dining Out</option>
                                    <option>Entertainment</option>
                                    <option>Transportation</option>
                                    <option>Lifestyle</option>
                                    <option>Income</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                className="w-full mt-2 px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-semibold hover:bg-zinc-800 transition-colors"
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
