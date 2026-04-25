import { Routes } from '@angular/router';
import { userGuard } from './core/guards/user.guard';
import { adminGuard } from './core/guards/admin.guard';
import { notAdminGuard } from './core/guards/not-admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'francesinhas', pathMatch: 'full' },
  {
    path: 'francesinhas',
    canActivate: [notAdminGuard],
    loadComponent: () => import('./features/francesinhas/francesinhas.component').then(m => m.FrancesinhasComponent)
  },
	{
		path: 'francesinhas/:id',
		canActivate: [notAdminGuard],
		loadComponent: () => import('./features/francesinhas/francesinha-detail/francesinha-detail.component').then(m => m.FrancesinhaDetailComponent)
	},
  {
    path: 'propose',
    canActivate: [userGuard],
    loadComponent: () => import('./features/propose/propose.component').then(m => m.ProposeComponent)
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/admin/admin-home/admin-home.component').then(m => m.AdminHomeComponent)
  },
  {
    path: 'admin/pending/:id',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/admin/admin-validate/admin-validate.component').then(m => m.AdminValidateComponent)
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
];
