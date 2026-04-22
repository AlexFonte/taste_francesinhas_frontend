import { Component, inject, computed } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { NavItemComponent, NavItem } from './nav-item/nav-item.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [NavItemComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {

  private readonly authService = inject(AuthService);

  private readonly staticItems: NavItem[] = [
    { label: 'Francesinhas', icon: 'lunch_dining', route: '/francesinhas', enabled: true  },
    { label: 'Restaurantes', icon: 'restaurant',   route: '/restaurants',  enabled: false },
    { label: 'Proponer',     icon: 'add_circle',    route: '/propose',      enabled: false },
    { label: 'Favoritos',    icon: 'favorite',      route: '/favorites',    enabled: false },
  ];

  readonly navItems = computed<NavItem[]>(() => [
    ...this.staticItems,
    this.authService.isLoggedIn()
      ? { label: 'Perfil', icon: 'person', route: '/profile', enabled: true }
      : { label: 'Login',  icon: 'login',  route: '/auth/login', enabled: true },
  ]);
}
