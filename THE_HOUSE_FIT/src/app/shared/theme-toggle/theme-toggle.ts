import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ThemeService } from '../../services/theme';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      class="thf-theme-toggle-btn"
      [class.is-compact]="variante === 'compact'"
      [class.is-pill]="variante === 'pill'"
      (click)="onToggle($event)"
      [attr.title]="theme.esClaro() ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'"
    >
      <span class="thf-theme-option thf-theme-to-light">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="4"></circle>
          <path d="M12 2v2"></path>
          <path d="M12 20v2"></path>
          <path d="m4.93 4.93 1.41 1.41"></path>
          <path d="m17.66 17.66 1.41 1.41"></path>
          <path d="M2 12h2"></path>
          <path d="M20 12h2"></path>
          <path d="m6.34 17.66-1.41 1.41"></path>
          <path d="m19.07 4.93-1.41 1.41"></path>
        </svg>
        <span class="thf-sr-only">Cambiar a modo claro</span>
      </span>

      <span class="thf-theme-option thf-theme-to-dark">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
        </svg>
        <span class="thf-sr-only">Cambiar a modo oscuro</span>
      </span>
    </button>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
        align-items: center;
        flex-shrink: 0;
      }

      .thf-theme-toggle-btn {
        position: relative;
        width: 38px;
        height: 38px;
        padding: 0;
        border-radius: 11px;
        background: rgba(255, 255, 255, 0.055);
        border: 1px solid rgba(255, 255, 255, 0.09);
        color: #f4b860;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        flex-shrink: 0;
        transition:
          background-color 160ms ease,
          border-color 160ms ease,
          color 160ms ease,
          transform 150ms cubic-bezier(0.23, 1, 0.32, 1),
          box-shadow 180ms ease;
      }

      .thf-theme-toggle-btn.is-compact {
        width: 35px;
        height: 35px;
        border-radius: 10px;
      }

      .thf-theme-toggle-btn.is-pill {
        width: 38px;
        height: 38px;
        border-radius: 999px;
      }

      @media (hover: hover) and (pointer: fine) {
        .thf-theme-toggle-btn:hover {
          background: rgba(255, 255, 255, 0.11);
          border-color: rgba(255, 118, 66, 0.42);
          color: #ff8c42;
          transform: translateY(-1px);
        }
      }

      .thf-theme-toggle-btn:active {
        transform: scale(0.95);
      }

      .thf-theme-toggle-btn:focus-visible {
        outline: 2px solid #ff5520;
        outline-offset: 2px;
      }

      .thf-theme-option {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
      }

      /* Por defecto en modo claro muestra la luna (acción: cambiar a oscuro) */
      .thf-theme-to-light {
        display: none;
      }

      .thf-theme-to-dark {
        display: inline-flex;
      }

      /* En modo oscuro (por preferencia del SO o por override) muestra el sol */
      @media (prefers-color-scheme: dark) {
        :host-context(:root:not(:has(> head > meta[name='color-scheme'][content='light']))) .thf-theme-to-light {
          display: inline-flex;
        }
        :host-context(:root:not(:has(> head > meta[name='color-scheme'][content='light']))) .thf-theme-to-dark {
          display: none;
        }
      }

      :host-context(:root:has(> head > meta[name='color-scheme'][content='dark'])) .thf-theme-to-light,
      :host-context(html[data-theme='dark']) .thf-theme-to-light {
        display: inline-flex;
      }

      :host-context(:root:has(> head > meta[name='color-scheme'][content='dark'])) .thf-theme-to-dark,
      :host-context(html[data-theme='dark']) .thf-theme-to-dark {
        display: none;
      }

      :host-context(:root:has(> head > meta[name='color-scheme'][content='light'])) .thf-theme-to-light,
      :host-context(html[data-theme='light']) .thf-theme-to-light {
        display: none;
      }

      :host-context(:root:has(> head > meta[name='color-scheme'][content='light'])) .thf-theme-to-dark,
      :host-context(html[data-theme='light']) .thf-theme-to-dark {
        display: inline-flex;
      }

      /* Estilo limpio y contrastado cuando el sitio está en modo claro */
      :host-context(:root:has(> head > meta[name='color-scheme'][content='light'])) .thf-theme-toggle-btn,
      :host-context(html[data-theme='light']) .thf-theme-toggle-btn {
        background: #ffffff;
        border-color: rgba(15, 23, 42, 0.12);
        color: #1e2433;
        box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06);
      }

      @media (hover: hover) and (pointer: fine) {
        :host-context(:root:has(> head > meta[name='color-scheme'][content='light'])) .thf-theme-toggle-btn:hover,
        :host-context(html[data-theme='light']) .thf-theme-toggle-btn:hover {
          background: #fff4ef;
          border-color: rgba(255, 69, 0, 0.36);
          color: #ff4500;
        }
      }

      .thf-sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }
    `,
  ],
})
export class ThemeToggleComponent {
  @Input() variante: 'panel' | 'compact' | 'pill' = 'panel';

  constructor(public readonly theme: ThemeService) {}

  onToggle(event: MouseEvent): void {
    this.theme.alternarTema(event);
  }
}
