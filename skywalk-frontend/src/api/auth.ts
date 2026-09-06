import apiClient from '../lib/api';
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
    return response.data;
  },

  login: async (data: LoginDto): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<User>('/auth/profile');
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  refresh: async (data: RefreshTokenDto): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/refresh', data);
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

  verifyEmail: async (token: string): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/auth/verify-email', { token });
    return response.data;
  },

  resendVerification: async (): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/auth/resend-verification');
    return response.data;
  },
};

export default authApi;