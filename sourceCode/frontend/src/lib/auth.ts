import api from './api';

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  role: string;
  userId?: number;
  username?: string;
  email?: string;
}

export const authService = {
  async register(data: RegisterData): Promise<{ message: string }> {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  async login(data: LoginData): Promise<LoginResponse> {
    // Clear any existing tokens first to prevent token mixing
    if (typeof window !== 'undefined') {
      console.log('🧹 Clearing old tokens before login...');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }

    const response = await api.post<LoginResponse>('/auth/login', data);
    const { accessToken, refreshToken, role } = response.data;

    console.log('💾 Storing new tokens...');
    console.log('🔑 New access token (first 20 chars):', accessToken.substring(0, 20) + '...');
    console.log('👤 User role:', role);

    // Store tokens in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
    }

    return response.data;
  },

  async logout(): Promise<void> {
    // Clear tokens from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  },

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await api.put('/me/password', { oldPassword, newPassword });
  },

  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('accessToken');
  },

  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
  },
};
