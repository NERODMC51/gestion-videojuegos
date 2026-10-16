import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from '@angular/material/dialog';

export interface DatosConfirmacion {
  titulo: string;
  mensaje: string;
  textoConfirmar: string;
}


@Component({
  selector: 'app-confirmar-dialogo',
  imports: [MatButtonModule, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose],
  templateUrl: './confirmar-dialogo.component.html',
})
export class ConfirmarDialogoComponent {
  protected readonly datos = inject<DatosConfirmacion>(MAT_DIALOG_DATA);
}
