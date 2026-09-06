const API_BASE_URL = 'http://localhost:7146/api';
const API_KEY = 'UNFV_FIIS2026';

class ApiService {
    public async request<T>(
        endpoint: string,
        options?: RequestInit
    ): Promise<T> {

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': API_KEY,
                ...options?.headers,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Error: ${response.status} - ${errorText}`);
        }

        try {
            const data = await response.json();
            return data as T;
        } catch {
            return {} as T;
        }
    }

    public async requestFormData<T>(
        endpoint: string,
        formData: FormData
    ): Promise<T> {

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'X-Api-Key': API_KEY,
            },
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Error: ${response.status} - ${errorText}`);
        }

        try {
            return await response.json();
        } catch {
            return {} as T;
        }
    }
}

export const api = new ApiService();
