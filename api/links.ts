import apiClient, { ApiResponse } from './client';

export interface AccessLink {
  id: string;
  link_token: string;
  device_id: string;
  user_id: string;
  name?: string;
  expires_at: string;
  max_uses: number;
  current_uses: number;
  status: 'active' | 'expired' | 'used' | 'revoked';
  created_at: string;
  used_at?: string;
  device?: {
    id: string;
    name: string;
    serial_number: string;
    model: string;
  };
}

export interface CreateAccessLinkRequest {
  device_id: string;
  name?: string;
  expires_at: string;  // ISO 8601 datetime
  max_uses?: number;   // Default: 1
}

export interface AccessLinkResponse {
  id: string;
  link_token: string;
  device_id: string;
  user_id: string;
  name?: string;
  expires_at: string;
  max_uses: number;
  current_uses: number;
  status: string;
  created_at: string;
  shareable_url: string;
}

/**
 * Access Link API functions
 */
export class LinkAPI {
  /**
   * Create a new access link
   * POST /api/v1/links
   */
  static async createLink(data: CreateAccessLinkRequest): Promise<ApiResponse<AccessLinkResponse>> {
    return apiClient.post<AccessLinkResponse>('/links', data);
  }

  /**
   * Get all access links for the current user
   * GET /api/v1/links?device_id={deviceId}
   */
  static async getLinks(deviceId?: string): Promise<ApiResponse<AccessLink[]>> {
    const url = deviceId ? `/links?device_id=${deviceId}` : '/links';
    return apiClient.get<AccessLink[]>(url);
  }

  /**
   * Get a specific access link by ID
   * GET /api/v1/links/{link_id}
   */
  static async getLink(linkId: string): Promise<ApiResponse<AccessLink>> {
    return apiClient.get<AccessLink>(`/links/${linkId}`);
  }

  /**
   * Delete/remove an access link
   * DELETE /api/v1/links/{link_id}
   */
  static async deleteLink(linkId: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.delete<{ message: string }>(`/links/${linkId}`);
  }

  /**
   * Revoke an access link (mark as revoked)
   * POST /api/v1/links/{link_id}/revoke
   */
  static async revokeLink(linkId: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post<{ message: string }>(`/links/${linkId}/revoke`);
  }

  /**
   * Helper: Create link with duration in hours
   */
  static async createLinkWithDuration(
    deviceId: string,
    name: string,
    durationHours: number = 24,
    maxUses: number = 1
  ): Promise<ApiResponse<AccessLinkResponse>> {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + durationHours);

    return this.createLink({
      device_id: deviceId,
      name,
      expires_at: expiresAt.toISOString(),
      max_uses: maxUses,
    });
  }

  /**
   * Helper: Get active links only
   */
  static async getActiveLinks(deviceId?: string): Promise<ApiResponse<AccessLink[]>> {
    const response = await this.getLinks(deviceId);
    
    if (response.success && response.data) {
      const activeLinks = response.data.filter(link => link.status === 'active');
      return {
        ...response,
        data: activeLinks,
      };
    }
    
    return response;
  }

  /**
   * Helper: Check if link is valid
   */
  static isLinkValid(link: AccessLink): boolean {
    if (link.status !== 'active') return false;
    if (link.current_uses >= link.max_uses) return false;
    if (new Date(link.expires_at) < new Date()) return false;
    return true;
  }

  /**
   * Helper: Generate shareable URL for a link
   */
  static generateShareableURL(linkToken: string, baseURL?: string): string {
    const base = baseURL || process.env.EXPO_PUBLIC_API_BASE_URL?.replace('/api/v1', '');
    return `${base}/delivery?token=${linkToken}`;
  }
}

// Export convenience functions
export const createLink = LinkAPI.createLink;
export const getLinks = LinkAPI.getLinks;
export const getLink = LinkAPI.getLink;
export const deleteLink = LinkAPI.deleteLink;
export const revokeLink = LinkAPI.revokeLink;
export const createLinkWithDuration = LinkAPI.createLinkWithDuration;
export const getActiveLinks = LinkAPI.getActiveLinks;

export const isLinkValid = LinkAPI.isLinkValid;
export const generateShareableURL = LinkAPI.generateShareableURL;
