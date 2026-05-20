import {ApplicationConfig, isDevMode, provideBrowserGlobalErrorListeners} from '@angular/core';
import {PreloadAllModules, provideRouter, withPreloading} from '@angular/router';
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import {provideServiceWorker} from '@angular/service-worker';

import {routes} from './app.routes';
import {authInterceptor} from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
	providers: [
		provideBrowserGlobalErrorListeners(),
		provideRouter(routes, withPreloading(PreloadAllModules)),
		provideHttpClient(withInterceptors([authInterceptor])),
		provideServiceWorker('ngsw-worker.js', {
			enabled: !isDevMode(),
			registrationStrategy: 'registerWhenStable:30000',
		}),
	],
};
