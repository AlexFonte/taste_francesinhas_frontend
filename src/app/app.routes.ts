import {Routes} from '@angular/router';
import {authGuard} from './core/guards/auth.guard';
import {userGuard} from './core/guards/user.guard';
import {adminGuard} from './core/guards/admin.guard';
import {notAdminGuard} from './core/guards/not-admin.guard';

export const routes: Routes = [
	{path: '', redirectTo: 'francesinhas', pathMatch: 'full'},
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
		path: 'restaurants',
		canActivate: [notAdminGuard],
		loadComponent: () => import('./features/restaurants/restaurants.component').then(m => m.RestaurantsComponent)
	},
	{
		path: 'restaurants/:id',
		canActivate: [notAdminGuard],
		loadComponent: () => import('./features/restaurants/restaurant-detail/restaurant-detail.component').then(m => m.RestaurantDetailComponent)
	},
	{
		path: 'propose',
		canActivate: [userGuard],
		loadComponent: () => import('./features/propose/propose.component').then(m => m.ProposeComponent)
	},
	{
		path: 'favorites',
		canActivate: [userGuard],
		loadComponent: () => import('./features/favorites/favorites.component').then(m => m.FavoritesComponent)
	},
	{
		path: 'admin',
		canActivate: [adminGuard],
		loadComponent: () => import('./features/admin/admin-home/admin-home.component').then(m => m.AdminHomeComponent)
	},
	{
		path: 'admin/proposals',
		canActivate: [adminGuard],
		loadComponent: () => import('./features/admin/admin-proposals/admin-proposals.component').then(m => m.AdminProposalsComponent)
	},
	{
		path: 'admin/pending/:id',
		canActivate: [adminGuard],
		loadComponent: () => import('./features/admin/admin-validate/admin-validate.component').then(m => m.AdminValidateComponent)
	},
	{
		path: 'profile',
		canActivate: [authGuard],
		loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent)
	},
	{
		path: 'profile/reviews',
		canActivate: [userGuard],
		loadComponent: () => import('./features/profile/my-reviews/my-reviews.component').then(m => m.MyReviewsComponent)
	},
	{
		path: 'profile/proposals',
		canActivate: [userGuard],
		loadComponent: () => import('./features/profile/my-proposals/my-proposals.component').then(m => m.MyProposalsComponent)
	},
	{
		path: 'login',
		loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
	},
	{
		path: 'register',
		loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
	},
	// Cualquier URL no capturada por las rutas anteriores cae aqui (404).
	// IMPORTANTE: tiene que ser el ultimo elemento del array, si no captura todo.
	{
		path: '**',
		loadComponent: () => import('./features/not-found/not-found.component').then(m => m.NotFoundComponent)
	},
];
