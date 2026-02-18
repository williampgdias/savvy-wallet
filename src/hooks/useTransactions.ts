/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

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
            if (!response.ok) throw new Error('Failed to delete');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['summary'] });
            queryClient.invalidateQueries({ queryKey: ['categoryData'] });

            toast.success('Transaction deleted and balance updated!');
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

export function useCreatePot() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (newPot: { name: string; targetAmount: number }) => {
            const response = await fetch('http://localhost:3001/pots', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newPot),
            });
            if (!response.ok) throw new Error('Failed to create pot');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pots'] });
            toast.success('New savings pot created!');
        },
        onError: () => {
            toast.error('Error creating pot. Try again.');
        },
    });
}

export function useDeletePot() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            await fetch(`http://localhost:3001/pots/${id}`, {
                method: 'DELETE',
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pots'] });
            toast.success('Pot Deleted!');
        },
    });
}

export function useDepositPot() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, amount }: { id: string; amount: number }) => {
            const response = await fetch(
                `http://localhost:3001/pots/${id}/deposit`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ amount }),
                },
            );
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pots'] });
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['summary'] });
            toast.success('Money saved and balance updated! 💸');
        },
    });
}
