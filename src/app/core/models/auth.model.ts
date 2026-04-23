export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name:     string;
  email:    string;
  password: string;
}

export interface LoginResponse {
  accessToken:  string;
  refreshToken: string;
  name:         string;
  email:        string;
  role:         'ADMIN' | 'USER';
}
