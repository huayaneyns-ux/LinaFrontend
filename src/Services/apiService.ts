export const API_BASE_URL = 'http://localhost:5081/api';

class ApiService {
    public async    request<T>(endpoint: string, options?: RequestInit): Promise<T> {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
        });

        // Handle generic error responses
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Error: ${response.status} - ${errorText}`);
        }

        // Attempt to parse JSON
        try {
            const data = await response.json();
            return data as T;
        } catch {
            // Handle cases where response is not JSON (e.g. 204 No Content)
            return {} as T;
        }
    }

    public async requestFormData<T>(endpoint: string, formData: FormData): Promise<T> {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            body: formData,
            // NO incluir Content-Type, el browser lo agrega automáticamente
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
