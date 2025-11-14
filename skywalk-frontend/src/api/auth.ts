import apiClient, { tokenService } from '../lib/api';
import type {
  AuthResponse,
  LoginDto,
  RegisterDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  User,
} from '../types/auth';

export const authApi = {
  register: async (data: RegisterDto): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    const { access_token, refresh_token } = response.data;
    tokenService.setTokens(access_token, refresh_token);
    return response.data;
  },

  login: async (data: LoginDto): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    const { access_token, refresh_token } = response.data;
    tokenService.setTokens(access_token, refresh_token);
    return response.data;
  },

  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<User>('/auth/profile');
    return response.data;
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      tokenService.clearTokens();
    }
  },

  refresh: async (data: RefreshTokenDto): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/refresh', data);
    const { access_token, refresh_token } = response.data;
    tokenService.setTokens(access_token, refresh_token);
    return response.data;
  },

  forgotPassword: async (data: ForgotPasswordDto): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/auth/forgot-password', data);
    return response.data;
  },

  resetPassword: async (data: ResetPasswordDto): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/auth/reset-password', data);
    return response.data;
  },
};

export default authApi;