import apiClient from './client';

export interface SupportRequestCreate {
    subject: string;
    message: string;
}

export interface SupportRequestResponse {
    id: string;
    user_id: string;
    subject: string;
    message: string;
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    user_email: string;
    user_name: string;
    user_phone?: string;
    assigned_to?: string;
    admin_notes?: string;
    resolved_at?: string;
    resolved_by?: string;
    created_at: string;
    updated_at: string;
}

export interface SuccessResponse {
    message: string;
}

export const SupportAPI = {
    /**
     * Submit a new support request
     */
    submitRequest: async (data: SupportRequestCreate): Promise<SupportRequestResponse> => {
        const response = await apiClient.post<SupportRequestResponse>(
            '/support/submit',
            data
        );
        return response.data;
    },

    /**
     * Get all support requests for the current user
     */
    getMyRequests: async (statusFilter?: string): Promise<SupportRequestResponse[]> => {
        const params = statusFilter ? { status_filter: statusFilter } : {};
        const response = await apiClient.get<SupportRequestResponse[]>(
            '/support/my-requests',
            { params }
        );
        return response.data;
    },

    /**
     * Get a specific support request by ID
     */
    getMyRequest: async (requestId: string): Promise<SupportRequestResponse> => {
        const response = await apiClient.get<SupportRequestResponse>(
            `/support/my-requests/${requestId}`
        );
        return response.data;
    },
};

