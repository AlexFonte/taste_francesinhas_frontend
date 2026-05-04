export type ToastType = 'success' | 'error';

export interface Toast {
  message: string;
  type:    ToastType;
}