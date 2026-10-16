import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-lateral-admin',
  imports: [RouterLink, RouterLinkActive, MatIconModule],
  templateUrl: './lateral-admin.component.html',
})
export class LateralAdminComponent {}
