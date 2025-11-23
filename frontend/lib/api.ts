const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.1.5:5000/';

export interface Media {
  id: string;
  title: string;
  size: number;
  mimeType: string;
  createdAt: string;
  url: string;
}

export interface ShareLink {
  id: string;
  mediaId: string;
  shortCode: string;
  shortUrl: string;
  longUrl: string;
  expiresAt: string;
  createdAt: string;
}

export interface ShareLinkWithMedia extends ShareLink {
  hasPassword: boolean;
  isExpired: boolean;
  media?: {
    id: string;
    title: string;
    mimeType: string;
    size: number;
  };
}

export interface Analytics {
  _id: string;
  short_code: string;
  url: string;
  'total-clicks': number;
  'total_unique_clicks': number;
  'average_daily_clicks': number;
  'average_weekly_clicks': number;
  'average_monthly_clicks': number;
  'average_redirection_time': number;
  'creation-date': string;
  'creation-time': string;
  'last-click': string | null;
  'last-click-country': string | null;
  'last-click-browser': string | null;
  'last-click-os': string | null;
  country: Record<string, number>;
  browser: Record<string, number>;
  os_name: Record<string, number>;
  referrer: Record<string, number>;
}

class MediaSharingAPI {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({
          error: { message: response.statusText },
        }));
        const errorMessage = error.error?.message || response.statusText;
        
        // Preserve status code information for expiration (410)
        if (response.status === 410) {
          const expiredError = new Error(errorMessage);
          (expiredError as any).status = 410;
          (expiredError as any).expiredAt = error.error?.expiredAt;
          throw expiredError;
        }
        
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  // Media methods
  async uploadMedia(
    file: File, 
    title?: string,
    onProgress?: (progress: number) => void
  ): Promise<{ message: string; data: Media }> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append('file', file);
      if (title) {
        formData.append('title', title);
      }

      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          const percentComplete = (e.loaded / e.total) * 100;
          onProgress(percentComplete);
        }
      });

      // Handle completion
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            reject(new Error('Failed to parse response'));
          }
        } else {
          try {
            const errorData = JSON.parse(xhr.responseText);
            const error = new Error(errorData.error?.message || 'Upload failed');
            (error as any).status = xhr.status;
            (error as any).data = errorData;
            reject(error);
          } catch {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      });

      // Handle errors
      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload aborted'));
      });

      // Open and send request
      xhr.open('POST', `${this.baseURL}/api/media/upload`);
      xhr.send(formData);
    });
  }

  async getAllMedia(
    page: number = 1,
    limit: number = 100,
    search: string = ''
  ): Promise<{
    message: string;
    count: number;
    total: number;
    page: number;
    pages: number;
    data: Media[];
  }> {
    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('limit', String(limit));
    if (search) {
      params.append('search', search);
    }
    return this.request<{
      message: string;
      count: number;
      total: number;
      page: number;
      pages: number;
      data: Media[];
    }>(`/api/media?${params.toString()}`);
  }

  getMediaFileUrl(id: string): string {
    return `${this.baseURL}/api/media/${id}/file`;
  }

  async deleteMedia(id: string): Promise<{ message: string; data: { id: string } }> {
    return this.request<{ message: string; data: { id: string } }>(`/api/media/${id}`, {
      method: 'DELETE',
    });
  }

  // Share link methods
  async createShareLink(
    mediaId: string,
    expiresAt: string,
    password?: string
  ): Promise<{ message: string; data: ShareLink }> {
    return this.request<{ message: string; data: ShareLink }>('/api/share-link', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mediaId,
        expiresAt,
        password: password || null,
      }),
    });
  }

  async accessShareLink(
    shareLinkId: string,
    password?: string
  ): Promise<{
    message: string;
    data: {
      media: Media;
      shareLink: {
        id: string;
        expiresAt: string;
        createdAt: string;
      };
    };
  }> {
    const endpoint = `/api/gallery/${shareLinkId}`;
    const url = password
      ? `${endpoint}?password=${encodeURIComponent(password)}`
      : endpoint;
    return this.request(url);
  }

  async getShareLinkAnalytics(
    shareLinkId: string,
    password?: string
  ): Promise<{
    message: string;
    data: {
      shareLink: ShareLink;
      analytics: Analytics;
    };
  }> {
    const endpoint = `/api/share-link/${shareLinkId}/analytics`;
    const url = password
      ? `${endpoint}?password=${encodeURIComponent(password)}`
      : endpoint;
    return this.request(url);
  }

  async getShareLinksByMedia(
    mediaId: string,
    filters?: {
      expired?: 'true' | 'false';
      hasPassword?: 'true' | 'false';
      sortBy?: 'createdAt' | 'expiresAt';
      sortOrder?: 'asc' | 'desc';
      limit?: number;
      skip?: number;
    }
  ): Promise<{
    message: string;
    data: {
      count: number;
      total: number;
      filters: Record<string, any>;
      shareLinks: ShareLinkWithMedia[];
    };
  }> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    const queryString = params.toString();
    const endpoint = `/api/share-link/media/${mediaId}${queryString ? `?${queryString}` : ''}`;
    return this.request(endpoint);
  }
}

export const api = new MediaSharingAPI(API_BASE_URL);

