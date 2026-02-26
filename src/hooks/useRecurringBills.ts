import { useQuery } from '@tanstack/react-query';

export function useRecurringBills() {
    return useQuery({
        queryKey: ['recurring-bills'],
        queryFn: async () => {
            const response = await fetch(
                'http://localhost:3001/recurring-bills',
            );
            if (!response.ok) {
                throw new Error('Failed to fetch recurring bills');
            }
            return response.json();
        },
    });
}
