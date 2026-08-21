import { Component, Inject } from '@angular/core';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { ClaseDisponible } from '../../../models/clase.models';

export interface ConfirmarReservaData {
  clase: ClaseDisponible;
  nombreGimnasio: string;
  fecha: string;
  personas: number;
}

@Component({
  selector: 'app-confirmar-reserva-dialog',
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './confirmar-reserva-dialog.html',
  styleUrl: './confirmar-reserva-dialog.css',
})
export class ConfirmarReservaDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmarReservaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmarReservaData,
  ) {}

  confirmar(): void {
    this.dialogRef.close(true);
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }

  formatearPrecio(valor: number): string {
    return valor.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
  }
}
