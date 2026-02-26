import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useRecurringBills } from '@/hooks/useRecurringBills';
import { Skeleton } from '@/components/ui/skeleton';
import { AddBillModal } from '@/components/AddBillModal';
import { useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';

export default function RecurringBills() {
    const { data: bills, isLoading } = useRecurringBills();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const queryClient = useQueryClient();

    const handleSave = () => {
        queryClient.invalidateQueries({ queryKey: ['recurring-bills'] });
        setIsModalOpen(false);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this bill?'))
            return;

        try {
            const response = await fetch(
                `http://localhost:3001/recurring-bills/${id}`,
                {
                    method: 'DELETE',
                },
            );

            if (response.ok) {
                queryClient.invalidateQueries({
                    queryKey: ['recurring-bills'],
                });
            } else {
                alert('Failed to delete bill');
            }
        } catch (error) {
            console.error('Error deleting bill:', error);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="">Recurring Bills</h1>
                        <p className="text-sm text-muted-foreground">
                            Manage your monthly subscriptions and fixes costs
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                        >
                            + Add Bill
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <Skeleton className="h-96 rounded-xl" />
                ) : (
                    <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
                        {bills?.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">
                                No recurring bills found. Time to add your
                                Netflix! 🍿
                            </div>
                        ) : (
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted/50 text-muted-foreground">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">
                                            Name
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Category
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Due Date
                                        </th>
                                        <th className="px-4 py-3 font-medium text-right">
                                            Amount
                                        </th>
                                        <th className="px-4 py-3 font-medium text-center">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y">
                                    {bills?.map((bill: any) => (
                                        <tr
                                            key={bill.id}
                                            className="hover:bg-muted/50 transition-colors"
                                        >
                                            <td className="px-4 py-3 font-medium">
                                                {bill.name}
                                            </td>
                                            <td className="px-4 py-3">
                                                {bill.category}
                                            </td>
                                            <td className="px-4 py-3">
                                                {bill.dueDate}
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium">
                                                €{bill.amount.toFixed(2)}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <button
                                                    onClick={() =>
                                                        handleDelete(bill.id)
                                                    }
                                                    className="text-muted-foreground hover:text-destructive transition-colors p-1.5 rounded-md hover:bg-destructive/10 inline-flex items-center justify-center"
                                                    title="Delete Bill"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </div>

            <AddBillModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
            />
        </DashboardLayout>
    );
}
