import { useQuery } from '@tanstack/react-query';
import useApi from './useApi';

export function useRecurringBills() {
    const { fetchWithAuth } = useApi();

    return useQuery({
        queryKey: ['recurring-bills'],
        queryFn: async () => {
            const response = await fetchWithAuth('/recurring-bills');
            if (!response.ok) {
                throw new Error('Failed to fetch recurring bills');
            }
            return response.json();
        },
    });
}
