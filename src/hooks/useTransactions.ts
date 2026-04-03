import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useApi from './useApi';
import { toast } from 'sonner';


export function useTransactions(month: number, year: number, page: number = 1) {
    const { fetchWithAuth } = useApi();

    return useQuery({
        queryKey: ['transactions', month, year, page],
        queryFn: async () => {
            const response = await fetchWithAuth(
                `/transactions?month=${month}&year=${year}&page=${page}&limit=5`,
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
    const { fetchWithAuth } = useApi();

    return useQuery({
        queryKey: ['summary', month, year],
        queryFn: async () => {
            const response = await fetchWithAuth(
                `/transactions/summary?month=${month}&year=${year}`,
            );
            if (!response.ok) throw new Error('Error retrieving summary.');
            return response.json();
        },
    });
}

export function useCreateTransaction() {
    const { fetchWithAuth } = useApi();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (transaction: {
            name: string;
            amount: number;
            category: string;
            date: string;
        }) => {
            const response = await fetchWithAuth('/transactions', {
                method: 'POST',
                body: JSON.stringify(transaction),
            });
            if (!response.ok) throw new Error('Failed to create transaction');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['summary'] });
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            toast.success('Transaction added!');
        },
        onError: () => {
            toast.error('Failed to add transaction. Try again.');
        },
    });
}

export function useUpdateTransaction() {
    const { fetchWithAuth } = useApi();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...data }: { id: string; name: string; amount: number; category: string; date: string }) => {
            const response = await fetchWithAuth(`/transactions/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error('Failed to update transaction');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['summary'] });
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            toast.success('Transaction updated!');
        },
        onError: () => {
            toast.error('Failed to update transaction. Try again.');
        },
    });
}

export function useImportTransactions() {
    const { fetchWithAuth } = useApi();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (transactions: Array<{ name: string; amount: number; category: string; date: string; is_income: boolean }>): Promise<{ imported: number; skipped: number }> => {
            const response = await fetchWithAuth('/transactions/import', {
                method: 'POST',
                body: JSON.stringify({ transactions }),
            });
            if (!response.ok) throw new Error('Failed to import');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['summary'] });
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });
}

export function useInsertTransactions() {
    const { fetchWithAuth } = useApi();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (transactions: Array<{ name: string; amount: number; category: string; date: string }>) => {
            for (const t of transactions) {
                await fetchWithAuth('/transactions', {
                    method: 'POST',
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
    const { fetchWithAuth } = useApi();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const response = await fetchWithAuth(`/transactions/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['summary'] });
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            toast.success('Transaction deleted and balance updated!');
        },
    });
}

export function useCategoryData(month: number, year: number) {
    const { fetchWithAuth } = useApi();

    return useQuery({
        queryKey: ['categories', month, year],
        queryFn: async () => {
            const response = await fetchWithAuth(
                `/transactions/categories?month=${month}&year=${year}`,
            );
            if (!response.ok)
                throw new Error('Error retrieving data from the categories.');
            return response.json();
        },
    });
}

export function usePots() {
    const { fetchWithAuth } = useApi();

    return useQuery({
        queryKey: ['pots'],
        queryFn: async () => {
            const response = await fetchWithAuth('/pots');
            if (!response.ok) throw new Error('Error searching for pots');
            return response.json();
        },
    });
}

export function useUpdatePot() {
    const { fetchWithAuth } = useApi();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, name, targetAmount }: { id: string; name: string; targetAmount: number }) => {
            const response = await fetchWithAuth(`/pots/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ name, targetAmount }),
            });
            if (!response.ok) throw new Error('Failed to update pot');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pots'] });
            toast.success('Pot updated!');
        },
        onError: () => {
            toast.error('Failed to update pot. Try again.');
        },
    });
}

export function useCreatePot() {
    const { fetchWithAuth } = useApi();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (newPot: { name: string; targetAmount: number }) => {
            const response = await fetchWithAuth('/pots', {
                method: 'POST',
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
    const { fetchWithAuth } = useApi();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            await fetchWithAuth(`/pots/${id}`, {
                method: 'DELETE',
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pots'] });
            toast.success('Pot Deleted!');
        },
    });
}

export function useExportTransactions() {
    const { fetchWithAuth } = useApi();

    return async (month: number, year: number) => {
        const response = await fetchWithAuth(
            `/transactions?month=${month}&year=${year}&page=1&limit=9999`,
        );
        if (!response.ok) throw new Error('Failed to fetch transactions for export');
        const result = await response.json();
        return result.data as Array<{ id: string; name: string; amount: number; category: string; date: string }>;
    };
}

export function useDepositPot() {
    const { fetchWithAuth } = useApi();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, amount }: { id: string; amount: number }) => {
            const response = await fetchWithAuth(`/pots/${id}/deposit`, {
                method: 'POST',
                body: JSON.stringify({ amount }),
            });
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
