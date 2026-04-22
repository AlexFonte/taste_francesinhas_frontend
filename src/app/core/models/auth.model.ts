export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken:  string;
  refreshToken: string;
  email:        string;
  role:         'ADMIN' | 'USER';
}
