import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_URL = 'http://localhost:3001/transactions';

export function useTransactions(month: number, year: number) {
    return useQuery({
        queryKey: ['transactions', month, year],
        queryFn: async () => {
            const response = await fetch(
                `${API_URL}?month=${month}&year=${year}`,
            );
            if (!response.ok)
                throw new Error(
                    'Error retrieving transactions from the server.',
                );
            return response.json();
        },
    });
}

export function useSummary(month: number, year: number) {
    return useQuery({
        queryKey: ['summary', month, year],
        queryFn: async () => {
            const response = await fetch(
                `http://localhost:3001/transactions/summary?month=${month}&year=${year}`,
            );
            if (!response.ok) throw new Error('Error retrieving summary.');
            return response.json();
        },
    });
}

export function useInsertTransactions() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (transactions: any[]) => {
            for (const t of transactions) {
                await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(t),
                });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
        },
    });
}

export function useDeleteTransaction() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Error deleting transaction');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
        },
    });
}
