import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error';

export interface Toast {
  message: string;
  type: ToastType;
}

@Injectable({ providedIn: 'root' })
export class ToastService {

  private readonly _toast = signal<Toast | null>(null);
  readonly toast = this._toast.asReadonly();

  success(message: string) { this.show(message, 'success'); }
  error(message: string)   { this.show(message, 'error'); }

  private show(message: string, type: ToastType) {
    this._toast.set({ message, type });
    setTimeout(() => this._toast.set(null), 3000);
  }
}
