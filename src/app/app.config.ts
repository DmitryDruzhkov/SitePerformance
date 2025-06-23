import { ApplicationConfig, LOCALE_ID, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { APP_BASE_HREF, registerLocaleData } from '@angular/common';

import localeRu from '@angular/common/locales/ru';

registerLocaleData(localeRu, 'ru');

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimations(),
    { provide: APP_BASE_HREF, useValue: '/SitePerformance/' },
    { provide: LOCALE_ID, useValue: 'ru' }
  ],
};
