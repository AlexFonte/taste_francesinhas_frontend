import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ConfirmDialogData } from '../../types/confirm-dialog.model';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './confirm-dialog.component.html',
  styleUrl:    './confirm-dialog.component.scss',
})
export class ConfirmDialogComponent {

  readonly data      = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
  private readonly ref = inject(MatDialogRef<ConfirmDialogComponent, boolean>);

  // Por defecto el boton de confirmar es naranja (primary). El consumidor puede pedir 'danger'.
  readonly variant = this.data.variant ?? 'primary';

  cancel():  void { this.ref.close(false); }
  confirm(): void { this.ref.close(true); }
}