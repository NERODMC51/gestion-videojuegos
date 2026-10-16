import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, RouterLink } from '@angular/router';


@Component({
  selector: 'app-pagina-mensaje',
  imports: [RouterLink, MatButtonModule, MatIconModule],
  templateUrl: './pagina-mensaje.component.html',
  styleUrl: './pagina-mensaje.component.css',
})
export class PaginaMensajeComponent {
  protected readonly datos = inject(ActivatedRoute).snapshot.data;
}
