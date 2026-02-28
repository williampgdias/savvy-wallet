import { useAuth } from '@clerk/clerk-react';

export default function useApi() {
    const { getToken } = useAuth();

    const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
        const token = await getToken();

        return fetch(`http://localhost:3001${url}`, {
            ...options,
            headers: {
                ...options.headers,
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
    };
    return { fetchWithAuth };
}
