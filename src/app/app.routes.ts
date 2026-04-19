import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'francesinhas', pathMatch: 'full' },
  {
    path: 'francesinhas',
    loadComponent: () => import('./features/francesinhas/francesinhas.component').then(m => m.FrancesinhasComponent)
  },
];