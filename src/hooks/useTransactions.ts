/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_URL = 'http://localhost:3001/transactions';

export function useTransactions(month: number, year: number, page: number = 1) {
    return useQuery({
        queryKey: ['transactions', month, year, page],
        queryFn: async () => {
            const response = await fetch(
                `${API_URL}?month=${month}&year=${year}&page=${page}&limit=5`,
            );
            if (!response.ok)
                throw new Error(
                    'Error retrieving transactions from the server.',
                );

            const result = await response.json();
            return result;
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

export function useCategoryData(month: number, year: number) {
    return useQuery({
        queryKey: ['categories', month, year],
        queryFn: async () => {
            const response = await fetch(
                `http://localhost:3001/transactions/categories?month=${month}&year=${year}`,
            );
            if (!response.ok)
                throw new Error('Error retrieving data from the categories.');
            return response.json();
        },
    });
}

export function usePots() {
    return useQuery({
        queryKey: ['pots'],
        queryFn: async () => {
            const response = await fetch('http://localhost:3001/pots');
            if (!response.ok) throw new Error('Error searching for pots');
            return response.json();
        },
    });
}
