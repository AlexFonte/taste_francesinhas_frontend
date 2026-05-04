import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Francesinha, FrancesinhaStatus } from '../../../core/models/francesinha.model';
import { AdminService } from '../../../core/services/admin.service';
import { AdminStats } from '../../../core/models/admin.model';
import { ToastService } from '../../../shared/services/toast.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ConfirmDialogData } from '../../../shared/types/confirm-dialog.model';
import {Router} from '@angular/router';

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule,
  ],
  templateUrl: './admin-home.component.html',
  styleUrl:    './admin-home.component.scss',
})
export class AdminHomeComponent {

  private readonly adminService = inject(AdminService);
  private readonly toastService = inject(ToastService);
  private readonly dialog       = inject(MatDialog);
  private readonly router       = inject(Router);

  readonly stats        = signal<AdminStats>({ pending: 0, accepted: 0, rejected: 0, total: 0 });
  readonly pending      = signal<Francesinha[]>([]);
  readonly isLoading    = signal(false);
  readonly errorMessage = signal<string | null>(null);

  // Para deshabilitar los botones de la card concreta mientras se procesa
  readonly processingId = signal<number | null>(null);

  constructor() {
    this.loadStats();
    this.loadPending();
  }

  private loadStats(): void {
    this.adminService.getStats().subscribe({
      next: s   => this.stats.set(s),
      error: _  => { /* el banner de error de pendientes ya cubre el fallback visual */ },
    });
  }

  private loadPending(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.adminService.getPending(0, 50).subscribe({
      next: res => {
        this.pending.set(res.francesinhas as Francesinha[]);
        this.isLoading.set(false);
      },
      error: err => {
        this.errorMessage.set(err.error?.detail ?? 'No se pudieron cargar las propuestas pendientes');
        this.isLoading.set(false);
      },
    });
  }

  approve(f: Francesinha): void {
    this.openConfirm({
      title:        'Aprobar propuesta',
      message:      `¿Quieres aprobar "${f.name}" del restaurante ${f.restaurant.name}? Quedará publicada.`,
      confirmLabel: 'Aprobar',
      icon:         'done_all',
      variant:      'primary',
    }).subscribe(ok => { if (ok) this.changeStatus(f, 'ACCEPTED'); });
  }

  reject(f: Francesinha): void {
    this.openConfirm({
      title:        'Rechazar propuesta',
      message:      `¿Seguro que quieres rechazar "${f.name}"? El usuario no podrá editarla después.`,
      confirmLabel: 'Rechazar',
      icon:         'cancel',
      variant:      'danger',
    }).subscribe(ok => { if (ok) this.changeStatus(f, 'REJECTED'); });
  }

  private openConfirm(data: ConfirmDialogData) {
    return this.dialog.open<ConfirmDialogComponent, ConfirmDialogData, boolean>(
      ConfirmDialogComponent, { data, width: '360px', autoFocus: false }
    ).afterClosed();
  }

  private changeStatus(f: Francesinha, status: Extract<FrancesinhaStatus, 'ACCEPTED' | 'REJECTED'>): void {
    this.processingId.set(f.id);
    this.adminService.updateStatus(f.id, status).subscribe({
      next: () => {
        this.processingId.set(null);
        this.pending.update(list => list.filter(x => x.id !== f.id));
        // Actualizamos los contadores simulados para que la UI sea coherente
        this.stats.update(s => ({
          ...s,
          pending:  Math.max(0, s.pending - 1),
          accepted: status === 'ACCEPTED' ? s.accepted + 1 : s.accepted,
          rejected: status === 'REJECTED' ? s.rejected + 1 : s.rejected,
        }));
        this.toastService.success(status === 'ACCEPTED' ? 'Propuesta aprobada' : 'Propuesta rechazada');
      },
      error: (err: HttpErrorResponse) => {
        this.processingId.set(null);
        this.toastService.error(err.error?.detail ?? 'No se pudo actualizar la propuesta');
      },
    });
  }

  openDetail(id: number): void {
    this.router.navigate(['/admin/pending', id]);
  }
}
