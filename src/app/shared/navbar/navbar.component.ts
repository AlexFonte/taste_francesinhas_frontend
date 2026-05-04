import { Component, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NavItemComponent } from './nav-item/nav-item.component';
import { NavItem } from '../types/nav-item.model';
import { MatIconButton } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, NavItemComponent, MatIconButton, MatIconModule, MatTooltipModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {

  private readonly authService = inject(AuthService);

  readonly isLoggedIn = this.authService.isLoggedIn;
  readonly userName   = this.authService.name;

  logout(): void { this.authService.logout(); }

  readonly navItems = computed<NavItem[]>(() => {
    const role = this.authService.role();

    if (role === 'ADMIN') {
      return [
        { label: 'Admin',  icon: 'admin_panel_settings', route: '/admin',   enabled: true },
        { label: 'Perfil', icon: 'person',                route: '/profile', enabled: true },
      ];
    }

    if (role === 'USER') {
      return [
        { label: 'Francesinhas', icon: 'lunch_dining', route: '/francesinhas', enabled: true  },
        { label: 'Restaurantes', icon: 'restaurant',   route: '/restaurants',  enabled: true  },
        { label: 'Proponer',     icon: 'add_circle',   route: '/propose',      enabled: true  },
        { label: 'Favoritos',    icon: 'favorite',     route: '/favorites',    enabled: false },
        { label: 'Perfil',       icon: 'person',       route: '/profile',      enabled: true  },
      ];
    }

    return [
      { label: 'Francesinhas', icon: 'lunch_dining', route: '/francesinhas',  enabled: true  },
      { label: 'Restaurantes', icon: 'restaurant',   route: '/restaurants',   enabled: true  },
      { label: 'Registrarse',  icon: 'person_add',   route: '/auth/register', enabled: true  },
      { label: 'Login',        icon: 'login',        route: '/auth/login',    enabled: true  },
    ];
  });
}
