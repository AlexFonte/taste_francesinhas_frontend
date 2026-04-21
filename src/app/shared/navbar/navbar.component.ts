import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  enabled: boolean;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatIconModule, MatButtonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  readonly navItems: NavItem[] = [
    { label: 'Francesinhas', icon: 'lunch_dining', route: '/francesinhas', enabled: true  },
    { label: 'Restaurantes', icon: 'restaurant',  route: '/restaurants',  enabled: false },
    { label: 'Proponer',     icon: 'add_circle',   route: '/propose',      enabled: false },
    { label: 'Favoritos',    icon: 'favorite',     route: '/favorites',    enabled: false },
    { label: 'Perfil',       icon: 'person',       route: '/auth',         enabled: false },
  ];
}
