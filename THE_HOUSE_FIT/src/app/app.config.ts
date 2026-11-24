import { ApplicationConfig, LOCALE_ID, inject, provideAppInitializer, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeEsCo from '@angular/common/locales/es-CO';
import { provideRouter, withInMemoryScrolling, withViewTransitions } from '@angular/router';

registerLocaleData(localeEsCo, 'es-CO');
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MAT_DATE_LOCALE } from '@angular/material/core';

import { routes } from './app.routes';
import { tokenInterceptor } from './interceptors/token';
import { CargaInicialService } from './services/carga-inicial';
import { onAppViewTransitionCreated } from './utils/route-transitions';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',
        anchorScrolling: 'enabled',
      }),
      withViewTransitions({
        skipInitialTransition: true,
        onViewTransitionCreated: onAppViewTransitionCreated,
      })
    ),
    provideHttpClient(withInterceptors([tokenInterceptor])),
    // antes de mostrar la página se traen los datos del MID
    provideAppInitializer(() => inject(CargaInicialService).cargarTodo()),
    provideAnimationsAsync(),
    { provide: LOCALE_ID, useValue: 'es-CO' },
    { provide: MAT_DATE_LOCALE, useValue: 'es-CO' },
  ]
};
