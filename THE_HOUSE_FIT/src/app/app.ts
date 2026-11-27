import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WompiCheckoutModalComponent } from './shared/wompi-checkout-modal/wompi-checkout-modal';
import { ThemeService } from './services/theme';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, WompiCheckoutModalComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend_proyecto');
  private readonly themeService = inject(ThemeService);
}
