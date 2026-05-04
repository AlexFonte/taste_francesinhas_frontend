// Datos que recibe el ConfirmDialogComponent. variant cambia el color del boton primario.
export interface ConfirmDialogData {
  title:        string;
  message:      string;
  confirmLabel: string;
  cancelLabel?: string;
  variant?:     'primary' | 'danger';
  icon?:        string;
}