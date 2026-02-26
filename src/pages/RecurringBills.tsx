/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useRecurringBills } from '@/hooks/useRecurringBills';
import { Skeleton } from '@/components/ui/skeleton';
import { AddBillModal } from '@/components/AddBillModal';
import { useQueryClient } from '@tanstack/react-query';
import { Trash2, Pencil } from 'lucide-react';

export default function RecurringBills() {
    const { data: bills, isLoading } = useRecurringBills();
    const totalAmount =
        bills?.reduce(
            (acc: number, bill: any) => acc + Number(bill.amount),
            0,
        ) || 0;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBill, setEditingBill] = useState<any>(null);
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
                    <div className="flex items-center gap-4">
                        {/* Total box */}
                        <div className="bg-muted/30 px-4 py-2 rounded-lg border border-border/50 text-right">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-0.5">
                                Total Monthly
                            </p>
                            <p className="text-lg font-bold leading-none text-foreground mt-1">
                                €{totalAmount.toFixed(2)}
                            </p>
                        </div>

                        {/* Add Bill Button */}
                        <button
                            onClick={() => {
                                setEditingBill(null);
                                setIsModalOpen(true);
                            }}
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

                                <tbody className="divide-y border-t">
                                    {bills?.map((bill: any) => {
                                        const today = new Date().getDate();
                                        const daysLeft = bill.dueDate - today;

                                        let statusText = '';
                                        let statusColor = '';

                                        if (daysLeft < 0) {
                                            statusText = 'Processed';
                                            statusColor =
                                                'bg-muted text-muted-foreground';
                                        } else if (daysLeft === 0) {
                                            statusText = 'Due Today';
                                            statusColor =
                                                'bg-destructive/10 text-destructive border-destructive/20 border';
                                        } else if (
                                            daysLeft > 0 &&
                                            daysLeft <= 3
                                        ) {
                                            statusText = `In ${daysLeft} days`;
                                            statusColor =
                                                'bg-amber-500/10 text-amber-600 border-amber-500/20 border dark:text-amber-400';
                                        } else {
                                            statusText = 'Upcoming';
                                            statusColor =
                                                'bg-primary/10 text-primary border-primary/20 border';
                                        }

                                        return (
                                            <tr
                                                key={bill.id}
                                                className="hover:bg-muted/50 transition-colors"
                                            >
                                                <td className="px-4 py-3 font-medium">
                                                    {bill.name}
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {bill.category}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <span>
                                                            Day {bill.dueDate}
                                                        </span>

                                                        {/* Color Tag */}
                                                        <span
                                                            className={`inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColor}`}
                                                        >
                                                            {statusText}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-right font-medium">
                                                    €{bill.amount.toFixed(2)}
                                                </td>
                                                <td className="px-4 py-3 text-center space-x-2">
                                                    {/* Edit Button */}
                                                    <button
                                                        onClick={() => {
                                                            setEditingBill(
                                                                bill,
                                                            );
                                                            setIsModalOpen(
                                                                true,
                                                            );
                                                        }}
                                                        className="text-muted-foreground hover:text-primary transition-colors p-1.5 rounded-md hover:bg-primary/10 inline-flex items-center justify-center"
                                                        title="Edit Bill"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </button>

                                                    {/* Delete Button */}
                                                    <button
                                                        onClick={() =>
                                                            handleDelete(
                                                                bill.id,
                                                            )
                                                        }
                                                        className="text-muted-foreground hover:text-destructive transition-colors p-1.5 rounded-md hover:bg-destructive/10 inline-flex items-center justify-center"
                                                        title="Delete Bill"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </div>

            <AddBillModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingBill(null);
                }}
                onSave={handleSave}
                billToEdit={editingBill}
            />
        </DashboardLayout>
    );
}
