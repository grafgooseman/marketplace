const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
}

interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  expires_in: number;
}

interface User {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    phone?: string;
    avatar_url?: string;
  };
}

interface Ad {
  id: string;
  title: string;
  description: string;
  price: number;
  image?: string;
  location?: string;
  seller?: string;
  rating?: number;
  is_favorite?: boolean;
  status: 'active' | 'sold' | 'inactive';
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface Session {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  expires_in: number;
  user: User;
}

class ApiClient {
  private baseURL: string;
  private accessToken: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    this.loadTokenFromStorage();
  }

  private loadTokenFromStorage() {
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('access_token');
    }
  }

  private saveTokenToStorage(tokens: AuthTokens) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', tokens.access_token);
      localStorage.setItem('refresh_token', tokens.refresh_token);
      
      // Handle expires_at - calculate from expires_in if not provided
      let expiresAt = tokens.expires_at;
      if (!expiresAt && tokens.expires_in) {
        // Calculate expires_at from current time + expires_in (in seconds)
        expiresAt = Math.floor(Date.now() / 1000) + tokens.expires_in;
      }
      
      if (expiresAt) {
        localStorage.setItem('expires_at', expiresAt.toString());
      }
      
      // Update internal token reference
      this.accessToken = tokens.access_token;
    }
  }

  private removeTokenFromStorage() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('expires_at');
      this.accessToken = null;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      method: 'GET', // Default to GET if not specified
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add authorization header if token exists
    if (this.accessToken) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${this.accessToken}`,
      };
    }

    // Debug logging
    console.log('Request URL:', url);
    console.log('Request method:', config.method);
    console.log('Request headers:', config.headers);
    console.log('Request body:', config.body);
    console.log('Request body type:', typeof config.body);
    console.log('Request body length:', config.body ? 'has body' : 'no body');
    console.log('Request ID from headers:', (config.headers as any)?.['X-Request-ID'] || 'none');

    try {
      const response = await fetch(url, config);
      
      // Debug: Log the raw response
      console.log('Raw HTTP response status:', response.status);
      console.log('Raw HTTP response headers:', [...response.headers.entries()]);
      
      // Clone the response so we can read it twice (once for logging, once for parsing)
      const responseClone = response.clone();
      const rawText = await responseClone.text();
      console.log('Raw HTTP response body:', rawText);
      
      const data = await response.json();
      console.log('Parsed JSON data:', data);

      if (!response.ok) {
        // Handle token expiration
        if (response.status === 401 && this.accessToken) {
          const refreshed = await this.refreshToken();
          if (refreshed) {
            // Retry the original request with new token
            return this.request<T>(endpoint, options);
          } else {
            // Refresh failed, redirect to login
            this.removeTokenFromStorage();
            throw new Error('Session expired. Please login again.');
          }
        }

        throw new Error(data.message || `HTTP Error: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication methods
  async login(email: string, password: string): Promise<{ user: User; session: Session }> {
    const response = await this.request<{ user: User; session: Session }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    console.log('Frontend received response:', response);
    console.log('Response session:', (response as any).session);

    if ((response as any).session) {
      console.log('Session properties:', Object.keys((response as any).session));
      console.log('access_token value:', (response as any).session.access_token);
      console.log('refresh_token value:', (response as any).session.refresh_token);

      // Try different possible property names that Supabase might use
      const accessToken = (response as any).session.access_token || (response as any).session.accessToken || (response as any).session.token;
      const refreshToken = (response as any).session.refresh_token || (response as any).session.refreshToken;
      const expiresIn = (response as any).session.expires_in || (response as any).session.expiresIn || 3600;
      const expiresAt = (response as any).session.expires_at || (response as any).session.expiresAt;
      
      console.log('Extracted values:', { accessToken, refreshToken, expiresIn, expiresAt });

      // Create a safe token object with fallbacks
      const tokenData = {
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: expiresAt || 0,
        expires_in: expiresIn,
      };
      
      console.log('Final tokenData being saved:', tokenData);
      
      this.saveTokenToStorage(tokenData);
    } else {
      console.log('No session in response!');
    }

    return response as { user: User; session: Session };
  }

  async register(
    email: string,
    password: string,
    user_metadata?: { full_name?: string; phone?: string }
  ): Promise<{ user: User; session: Session | null }> {
    const response = await this.request<{ user: User; session: Session | null }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, user_metadata }),
    });

    if ((response as any).session) {
      // Create a safe token object with fallbacks
      const tokenData = {
        access_token: (response as any).session.access_token,
        refresh_token: (response as any).session.refresh_token,
        expires_at: (response as any).session.expires_at || 0,
        expires_in: (response as any).session.expires_in || 3600, // Default to 1 hour
      };
      
      this.saveTokenToStorage(tokenData);
    }

    return response as { user: User; session: Session | null };
  }

  async logout(): Promise<void> {
    try {
      await this.request('/api/auth/logout', {
        method: 'POST',
      });
    } finally {
      this.removeTokenFromStorage();
    }
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.request<{ user: User }>('/api/auth/profile');
    return (response as any).user;
  }

  async updateProfile(data: {
    email?: string;
    user_metadata?: { full_name?: string; phone?: string; avatar_url?: string };
  }): Promise<User> {
    const response = await this.request<{ user: User }>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return (response as any).user;
  }

  // Ads API methods
  async getAds(params?: {
    category?: string | string[];
    price_min?: number;
    price_max?: number;
    search?: string;
    sort?: string;
    page?: number;
    limit?: number;
  }): Promise<{ ads: Ad[]; total: number; page: number; limit: number }> {
    const queryParams = new URLSearchParams();
    if (params?.category) {
      const categoryParam = Array.isArray(params.category) 
        ? params.category.join(',') 
        : params.category;
      queryParams.append('category', categoryParam);
    }
    if (params?.price_min) queryParams.append('price_min', params.price_min.toString());
    if (params?.price_max) queryParams.append('price_max', params.price_max.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sort) queryParams.append('sort', params.sort);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const endpoint = `/api/ads${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await this.request<{ ads: Ad[]; total: number; page: number; limit: number }>(endpoint);
    return response as { ads: Ad[]; total: number; page: number; limit: number };
  }

  async getAd(id: string): Promise<Ad> {
    const requestId = Math.random().toString(36).substr(2, 9);
    console.log(`API: [${requestId}] Calling getAd for ID:`, id);
    
    const response = await this.request<{ ad: Ad }>(`/api/ads/${id}`, {
      headers: {
        'X-Request-ID': requestId
      }
    });
    
    console.log(`API: [${requestId}] getAd raw response:`, response);
    console.log(`API: [${requestId}] getAd ad data:`, (response as any).ad);
    
    // Handle different response formats
    if ((response as any).ad) {
      return (response as any).ad;
    } else if ((response as any).data) {
      // In case the response is wrapped in a data property
      return (response as any).data;
    } else if ((response as any).id) {
      // In case the ad is returned directly
      return response as any;
    } else {
      console.error(`API: [${requestId}] Unexpected response format:`, response);
      throw new Error('Invalid response format from getAd');
    }
  }

  async createAd(data: {
    title: string;
    description: string;
    price: number;
    image?: string;
    location?: string;
    seller?: string;
    rating?: number;
    is_favorite?: boolean;
  }): Promise<Ad> {
    const response = await this.request<{ ad: Ad }>('/api/ads', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return (response as any).ad;
  }

  async updateAd(id: string, data: Partial<{
    title: string;
    description: string;
    price: number;
    image: string;
    location: string;
    seller: string;
    rating: number;
    is_favorite: boolean;
    status: 'active' | 'sold' | 'inactive';
  }>): Promise<Ad> {
    const response = await this.request<{ ad: Ad }>(`/api/ads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return (response as any).ad;
  }

  async deleteAd(id: string): Promise<void> {
    await this.request(`/api/ads/${id}`, {
      method: 'DELETE',
    });
  }

  async getUserAds(params?: {
    status?: 'active' | 'sold' | 'inactive';
    page?: number;
    limit?: number;
  }): Promise<{ ads: Ad[]; total: number; page: number; limit: number }> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const endpoint = `/api/ads/my/ads${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await this.request<{ ads: Ad[]; total: number; page: number; limit: number }>(endpoint);
    return response as { ads: Ad[]; total: number; page: number; limit: number };
  }

  private async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        return false;
      }

      const response = await fetch(`${this.baseURL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      if (data.session) {
        // Create a safe token object with fallbacks
        const tokenData = {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at || 0,
          expires_in: data.session.expires_in || 3600, // Default to 1 hour
        };
        
        this.saveTokenToStorage(tokenData);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  // Utility method to check if user is authenticated
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false; // Server-side rendering
    if (!this.accessToken) return false;
    
    const expiresAt = localStorage.getItem('expires_at');
    if (!expiresAt) return false;
    
    return Date.now() < parseInt(expiresAt) * 1000;
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Export types for use in components
export type { User, Session, ApiResponse, Ad }; 