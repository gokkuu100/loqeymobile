import apiClient, { ApiResponse } from './client';

export type LinkType = 'tracking_number' | 'access_code';
export type LinkStatus = 'active' | 'expired' | 'used' | 'revoked';

export interface AccessLink {
  id: string;
  link_token: string;
  device_id: string;
  name?: string;
  link_type: LinkType;
  tracking_number?: string;  // For tracking_number links
  expires_at: string;
  max_uses: number;
  current_uses: number;
  status: LinkStatus;
  created_at: string;
  updated_at?: string;
  used_at?: string;
  link_url?: string;
  device_name?: string;
  device_serial?: string;
  total_deliveries?: number;
}

export interface CreateAccessLinkRequest {
  device_id: string;
  link_type: LinkType;
  name?: string;
  tracking_number?: string;  // Required if link_type is 'tracking_number'
  access_code?: string;      // Required if link_type is 'access_code'
  expiry_hours?: number;     // Duration in hours (1-168)
  max_uses?: number;         // Default: 1
}

export interface AccessLinkResponse {
  id: string;
  link_token: string;
  device_id: string;
  name?: string;
  link_type: LinkType;
  tracking_number?: string;
  expires_at: string;
  max_uses: number;
  current_uses: number;
  status: LinkStatus;
  created_at: string;
  updated_at: string;
  used_at?: string;
  link_url: string;
}

export interface DeliveryRecord {
  id: string;
  tracking_number?: string;
  code_verified: boolean;
  delivery_person_name?: string;
  delivery_person_id?: string;
  courier_company?: string;
  delivery_person_phone?: string;
  attempted_at?: string;
  completed_at?: string;
  device_unlock_successful: boolean;
  delivery_notes?: string;
  device_name?: string;
  device_serial?: string;
}

export interface PaginationInfo {
  skip: number;
  limit: number;
  total: number;
  has_more: boolean;
}

export interface LinkDeliveriesResponse {
  link_id: string;
  link_name?: string;
  link_type: LinkType;
  tracking_number?: string;
  status: LinkStatus;
  expires_at: string;
  max_uses: number;
  current_uses: number;
  device_name?: string;
  total_deliveries: number;
  deliveries: DeliveryRecord[];
  pagination: PaginationInfo;
}

export interface LinksStatsResponse {
  active_links: number;
  used_expired_links: number;
  deliveries_today: number;
  total_deliveries: number;
}

export interface AllDeliveriesResponse {
  deliveries: DeliveryRecord[];
  pagination: PaginationInfo;
}

/**
 * Access Link API functions
 */
export class LinkAPI {
  /**
   * Create a new access link
   * POST /api/v1/links/
   */
  static async createLink(data: CreateAccessLinkRequest): Promise<ApiResponse<AccessLinkResponse>> {
    return apiClient.post<AccessLinkResponse>('/links/', data);
  }

    /**
   * Get all access links (optionally filter by device)
   * GET /api/v1/links/
   */
  static async getLinks(deviceId?: string): Promise<ApiResponse<AccessLink[]>> {
    const url = deviceId ? `/links/?device_id=${deviceId}` : '/links/';
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
   * Get links and delivery statistics
   * GET /api/v1/links/stats/summary
   */
  static async getStats(): Promise<ApiResponse<LinksStatsResponse>> {
    return apiClient.get<LinksStatsResponse>('/links/stats/summary');
  }

  /**
   * Get delivery records for a specific link with pagination
   * GET /api/v1/links/{link_id}/deliveries
   * @param linkId - The access link ID
   * @param skip - Number of records to skip (default: 0)
   * @param limit - Number of records to return (default: 10, max: 50)
   */
  static async getLinkDeliveries(
    linkId: string, 
    skip: number = 0, 
    limit: number = 10
  ): Promise<ApiResponse<LinkDeliveriesResponse>> {
    return apiClient.get<LinkDeliveriesResponse>(
      `/links/${linkId}/deliveries?skip=${skip}&limit=${limit}`
    );
  }

  /**
   * Get ALL delivery records for the current user across all links
   * GET /api/v1/links/deliveries/all
   * Much more efficient than fetching deliveries per link
   * @param skip - Number of records to skip (default: 0)
   * @param limit - Number of records to return (default: 50, max: 200)
   */
  static async getAllDeliveries(
    skip: number = 0,
    limit: number = 50
  ): Promise<ApiResponse<AllDeliveriesResponse>> {
    return apiClient.get<AllDeliveriesResponse>(
      `/links/deliveries/all?skip=${skip}&limit=${limit}`
    );
  }

  /**
   * Helper: Create tracking number link
   */
  static async createTrackingNumberLink(
    deviceId: string,
    trackingNumber: string,
    name?: string,
    expiryHours: number = 168, // Default 7 days
    maxUses: number = 1
  ): Promise<ApiResponse<AccessLinkResponse>> {
    return LinkAPI.createLink({
      device_id: deviceId,
      link_type: 'tracking_number',
      tracking_number: trackingNumber,
      name: name || `Tracking: ${trackingNumber}`,
      expiry_hours: expiryHours,
      max_uses: maxUses,
    });
  }

  /**
   * Helper: Create access code link
   */
  static async createAccessCodeLink(
    deviceId: string,
    accessCode: string,
    name?: string,
    expiryHours: number = 24,
    maxUses: number = 1
  ): Promise<ApiResponse<AccessLinkResponse>> {
    return LinkAPI.createLink({
      device_id: deviceId,
      link_type: 'access_code',
      access_code: accessCode,
      name: name || 'Courier Delivery',
      expiry_hours: expiryHours,
      max_uses: maxUses,
    });
  }

  /**
   * Helper: Create link with duration in hours (legacy support)
   * @deprecated Use createAccessCodeLink or createTrackingNumberLink instead
   */
  static async createLinkWithDuration(
    deviceId: string,
    name: string,
    durationHours: number = 24,
    maxUses: number = 1,
    accessCode: string = '1234'
  ): Promise<ApiResponse<AccessLinkResponse>> {
    return LinkAPI.createAccessCodeLink(deviceId, accessCode, name, durationHours, maxUses);
  }

  /**
   * Helper: Get active links only
   */
  static async getActiveLinks(deviceId?: string): Promise<ApiResponse<AccessLink[]>> {
    const response = await LinkAPI.getLinks(deviceId);
    
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
    return `${base}/api/v1/delivery/${linkToken}`;
  }

  /**
   * Helper: Format instructions for tracking number links
   */
  static formatTrackingInstructions(link: AccessLink, deliveryURL?: string): string {
    const url = deliveryURL || link.link_url || LinkAPI.generateShareableURL(link.link_token);
    return `Delivery Instructions:\n\nPlease use this link to unlock the delivery box:\n${url}\n\nYour tracking number: ${link.tracking_number}\n\nThis link expires on ${new Date(link.expires_at).toLocaleDateString()}`;
  }

  /**
   * Helper: Format instructions for access code links
   */
  static formatAccessCodeInstructions(link: AccessLink, accessCode: string, deliveryURL?: string): string {
    const url = deliveryURL || link.link_url || LinkAPI.generateShareableURL(link.link_token);
    return `Delivery Access Link:\n${url}\n\nAccess Code: ${accessCode}\n\nPlease provide this code to the delivery person.\n\nValid until: ${new Date(link.expires_at).toLocaleDateString()}`;
  }
}

// Export convenience functions
export const createLink = LinkAPI.createLink;
export const getLinks = LinkAPI.getLinks;
export const getDeviceLinks = LinkAPI.getLinks; // Alias for getLinks with deviceId
export const getLink = LinkAPI.getLink;
export const deleteLink = LinkAPI.deleteLink;
export const revokeLink = LinkAPI.revokeLink;

// New methods
export const createTrackingNumberLink = LinkAPI.createTrackingNumberLink;
export const createAccessCodeLink = LinkAPI.createAccessCodeLink;

// Legacy method
export const createLinkWithDuration = LinkAPI.createLinkWithDuration;
export const getActiveLinks = LinkAPI.getActiveLinks;

export const isLinkValid = LinkAPI.isLinkValid;
export const generateShareableURL = LinkAPI.generateShareableURL;
export const formatTrackingInstructions = LinkAPI.formatTrackingInstructions;
export const formatAccessCodeInstructions = LinkAPI.formatAccessCodeInstructions;
export const getStats = LinkAPI.getStats;
export const getLinkDeliveries = LinkAPI.getLinkDeliveries;
export const getAllDeliveries = LinkAPI.getAllDeliveries;
