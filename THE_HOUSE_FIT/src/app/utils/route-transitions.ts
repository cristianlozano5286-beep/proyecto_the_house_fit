import { ActivatedRouteSnapshot, ViewTransitionInfo } from '@angular/router';

const PUBLIC_ROUTE_ORDER: Record<string, number> = {
  '': 0,
  gimnasios: 1,
  rutinas: 2,
  rutina: 2,
  tienda: 3,
  imc: 4,
  destacados: 5,
  blog: 6,
  nutricion: 7,
};

const MI_ESPACIO_ORDER: Record<string, number> = {
  entrenamiento: 0,
  'reservar-clase': 1,
  resenas: 2,
  pagos: 3,
};

const PANEL_ORDER: Record<string, number> = {
  dashboard: 0,
  perfil: 1,
  'contabilidad-membresias': 2,
  usuarios: 3,
  gimnasios: 4,
  instructores: 5,
  productos: 6,
  contenido: 7,
  noticias: 8,
  roles: 9,
};

const STUDIO_ORDER: Record<string, number> = {
  'mi-perfil': 0,
  'contabilidad-gestion': 1,
  'contabilidad-membresias': 1,
  'editar-gimnasio': 2,
  'publicar-gimnasio': 3,
  'instructores-gestion': 4,
  'productos-gestion': 5,
  'contenido-gestion': 6,
  'noticias-gestion': 7,
};

const STUDIO_ROUTES = new Set(Object.keys(STUDIO_ORDER));

const MORPHABLE_SECTIONS = new Set(['rutinas', 'tienda', 'imc']);

let pendingCardElement: HTMLElement | null = null;
let pendingTargetSegment: string | null = null;

/**
 * Marca una tarjeta (por ejemplo, un flyer en Inicio) como origen de un
 * morph compartido (View Transition) hacia el hero del apartado de destino.
 */
export function prepareCardToHeroTransition(
  event: Event | null | undefined,
  targetRoute: string
): void {
  if (typeof document === 'undefined') {
    return;
  }

  cleanupCardTransitionState();

  const currentTarget = event?.currentTarget as HTMLElement | null;
  if (!currentTarget) {
    return;
  }

  const normalized = targetRoute.replace(/^\/+/, '').split('/')[0] || '';
  currentTarget.classList.add('selected', 'vt-card-origin');
  pendingCardElement = currentTarget;
  pendingTargetSegment = normalized;
}

function cleanupCardTransitionState(): void {
  if (typeof document === 'undefined') {
    return;
  }
  if (pendingCardElement) {
    pendingCardElement.classList.remove('selected', 'vt-card-origin');
    pendingCardElement = null;
  }
  pendingTargetSegment = null;
  document.querySelectorAll('.selected.vt-card-origin').forEach((el) => {
    el.classList.remove('selected', 'vt-card-origin');
  });
}

function extractPathSegments(snapshot: ActivatedRouteSnapshot): string[] {
  const segments: string[] = [];
  let current: ActivatedRouteSnapshot | null = snapshot;
  while (current) {
    for (const seg of current.url) {
      if (seg.path) {
        segments.push(seg.path);
      }
    }
    current = current.firstChild;
  }
  return segments;
}

function getLayoutGroup(segments: string[]): 'public' | 'mi-espacio' | 'panel' | 'studio' | 'auth' {
  const root = segments[0] ?? '';
  if (root === 'mi-espacio') return 'mi-espacio';
  if (root === 'panel') return 'panel';
  if (STUDIO_ROUTES.has(root)) return 'studio';
  if (root === 'login' || root === 'register' || root === 'recuperar-password') return 'auth';
  return 'public';
}

function computeDirection(
  fromSegments: string[],
  toSegments: string[]
): 'forward' | 'backward' | 'cross-portal' {
  const fromGroup = getLayoutGroup(fromSegments);
  const toGroup = getLayoutGroup(toSegments);

  if (fromGroup !== toGroup) {
    return 'cross-portal';
  }

  if (fromGroup === 'mi-espacio') {
    const fromSub = MI_ESPACIO_ORDER[fromSegments[1] ?? 'entrenamiento'] ?? 0;
    const toSub = MI_ESPACIO_ORDER[toSegments[1] ?? 'entrenamiento'] ?? 0;
    return toSub >= fromSub ? 'forward' : 'backward';
  }

  if (fromGroup === 'panel') {
    const fromSub = PANEL_ORDER[fromSegments[1] ?? 'dashboard'] ?? 0;
    const toSub = PANEL_ORDER[toSegments[1] ?? 'dashboard'] ?? 0;
    return toSub >= fromSub ? 'forward' : 'backward';
  }

  if (fromGroup === 'studio') {
    const fromSub = STUDIO_ORDER[fromSegments[0] ?? 'mi-perfil'] ?? 0;
    const toSub = STUDIO_ORDER[toSegments[0] ?? 'mi-perfil'] ?? 0;
    return toSub >= fromSub ? 'forward' : 'backward';
  }

  const fromRoot = fromSegments[0] ?? '';
  const toRoot = toSegments[0] ?? '';
  const fromOrder = PUBLIC_ROUTE_ORDER[fromRoot];
  const toOrder = PUBLIC_ROUTE_ORDER[toRoot];

  if (fromOrder !== undefined && toOrder !== undefined && fromOrder !== toOrder) {
    return toOrder > fromOrder ? 'forward' : 'backward';
  }

  return 'forward';
}

function routeAccessibilityFocusAfterTransition(): void {
  if (typeof document === 'undefined') {
    return;
  }

  const heading = document.querySelector<HTMLElement>(
    'main.public-content h1, main.user-studio-stage h1, main.layout-content h1, .wizard-viewport h1, main h1'
  );
  if (heading) {
    if (!heading.hasAttribute('tabindex')) {
      heading.setAttribute('tabindex', '-1');
    }
    heading.focus({ preventScroll: true });
    return;
  }

  const mainContainer = document.querySelector<HTMLElement>(
    'main.public-content, main.user-studio-stage, main.layout-content, .wizard-viewport, main'
  );
  if (mainContainer) {
    if (!mainContainer.hasAttribute('tabindex')) {
      mainContainer.setAttribute('tabindex', '-1');
    }
    mainContainer.focus({ preventScroll: true });
  }
}

/**
 * Callback para `withViewTransitions` de Angular Router.
 * Aplica tipos direccionales (`forward` / `backward` / `cross-portal`),
 * morph de tarjeta a hero y enrutamiento de foco accesible al finalizar la transición GPU.
 */
export function onAppViewTransitionCreated(info: ViewTransitionInfo): void {
  if (typeof document === 'undefined') {
    return;
  }

  const fromSegments = extractPathSegments(info.from);
  const toSegments = extractPathSegments(info.to);

  if (fromSegments.join('/') === toSegments.join('/')) {
    info.transition.skipTransition();
    cleanupCardTransitionState();
    return;
  }

  const fromRoot = fromSegments[0] ?? '';
  const toRoot = toSegments[0] ?? '';
  const direction = computeDirection(fromSegments, toSegments);
  const rootEl = document.documentElement;

  const transitionWithTypes = info.transition as ViewTransition & {
    types?: { add: (t: string) => void };
  };
  transitionWithTypes.types?.add(direction);

  if (
    pendingCardElement &&
    fromRoot === '' &&
    pendingTargetSegment === toRoot &&
    MORPHABLE_SECTIONS.has(toRoot)
  ) {
    rootEl.dataset['vtTarget'] = toRoot;
    transitionWithTypes.types?.add('card-portal');
  } else {
    cleanupCardTransitionState();
  }

  rootEl.dataset['vtDirection'] = direction;
  rootEl.classList.add('vt-active');

  info.transition.finished.finally(() => {
    rootEl.classList.remove('vt-active');
    delete rootEl.dataset['vtDirection'];
    delete rootEl.dataset['vtTarget'];
    cleanupCardTransitionState();
    routeAccessibilityFocusAfterTransition();
  });
}
