import { Routes } from '@angular/router';
import { userGuard } from './core/guards/user.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'francesinhas', pathMatch: 'full' },
  {
    path: 'francesinhas',
    loadComponent: () => import('./features/francesinhas/francesinhas.component').then(m => m.FrancesinhasComponent)
  },
  {
    path: 'propose',
    canActivate: [userGuard],
    loadComponent: () => import('./features/propose/propose.component').then(m => m.ProposeComponent)
  },
  {
    path: 'auth',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  },
  {
    path: 'auth/login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'francesinhas/:id',
    loadComponent: () => import('./features/francesinhas/francesinha-detail/francesinha-detail.component').then(m => m.FrancesinhaDetailComponent)
  },
];