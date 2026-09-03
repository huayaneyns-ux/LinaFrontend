export const API_BASE_URL = 'http://localhost:5081/api';

class ApiService {
    private async readErrorMessage(response: Response): Promise<string> {
        const errorText = await response.text();

        if (!errorText) {
            return `API Error: ${response.status}`;
        }

        try {
            const parsed = JSON.parse(errorText) as Record<string, unknown>;
            const message = parsed.mensaje ?? parsed.message ?? parsed.detail ?? parsed.error;
            if (typeof message === 'string' && message.trim()) {
                return message.trim();
            }
        } catch {
            // Keep the raw response text below.
        }

        return errorText;
    }

    public async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
        });

        // Handle generic error responses
        if (!response.ok) {
            const errorMessage = await this.readErrorMessage(response);
            throw new Error(errorMessage);
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
            const errorMessage = await this.readErrorMessage(response);
            throw new Error(errorMessage);
        }

        try {
            return await response.json();
        } catch {
            return {} as T;
        }
    }
}

export const api = new ApiService();
