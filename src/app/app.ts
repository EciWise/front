import { isPlatformBrowser } from '@angular/common';
import { Component, PLATFORM_ID, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { inject as injectAnalytics } from '@vercel/analytics';
import { injectSpeedInsights } from '@vercel/speed-insights';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly platformId = inject(PLATFORM_ID);
  protected readonly title = signal('ECIWISE-Front');

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      injectAnalytics();
      injectSpeedInsights({});
    }
  }
}
