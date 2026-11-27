import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

type VistaCamara3D = 'general' | 'fuerza' | 'cardio' | 'funcional';

@Component({
  selector: 'app-gym-3d-model',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="gym3d-shell"
      [class.is-dragging-file]="arrastrandoGlb"
      (dragover)="onDragOver($event)"
      (dragleave)="onDragLeave($event)"
      (drop)="onDropGlb($event)"
    >
      <div
        #canvasHost
        class="gym3d-viewport"
        role="img"
        [attr.aria-label]="
          'Maqueta interactiva en 3D del gimnasio ' +
          nombreSede +
          '. Arrastra para rotar, usa la rueda para acercar o carga un archivo GLB propio.'
        "
      ></div>

      <div class="gym3d-top-bar">
        <div class="gym3d-top-badge" aria-hidden="true">
          <span class="gym3d-live-dot"></span>
          <span>{{ etiquetaActivaVisor }}</span>
        </div>

        <div class="gym3d-top-actions">
          @if (usandoArchivoUsuario) {
            <button
              type="button"
              class="gym3d-glb-btn is-secondary"
              (click)="restaurarMaquetaBase()"
              title="Volver al modelo 3D oficial de The House Fit"
            >
              Modelo oficial
            </button>
          }
          <button
            type="button"
            class="gym3d-glb-btn"
            (click)="glbInput.click()"
            title="Cargar otro modelo 3D propio en formato .glb o .gltf (Blender, Sketchfab, Polycam)"
          >
            {{ cargandoGlb ? 'Cargando…' : 'Probar otro .glb' }}
          </button>
          <input
            #glbInput
            type="file"
            accept=".glb,.gltf"
            tabindex="-1"
            class="gym3d-hidden-input"
            aria-label="Cargar modelo 3D en formato GLB o GLTF"
            (change)="onArchivoGlbSeleccionado($event)"
          />
        </div>
      </div>

      @if (mensajeEstado) {
        <div class="gym3d-toast" role="status">{{ mensajeEstado }}</div>
      }

      <div class="gym3d-controls-bar" role="group" aria-label="Controles de cámara 3D">
        <button
          type="button"
          class="gym3d-cam-btn"
          [class.is-active]="vistaActiva === 'general'"
          (click)="enfocarVista('general')"
        >
          General
        </button>
        <button
          type="button"
          class="gym3d-cam-btn"
          [class.is-active]="vistaActiva === 'fuerza'"
          (click)="enfocarVista('fuerza')"
        >
          {{ modoEscena === 'recepcion' ? 'Mostrador & Tarifas' : 'Fuerza & Racks' }}
        </button>
        <button
          type="button"
          class="gym3d-cam-btn"
          [class.is-active]="vistaActiva === 'cardio'"
          (click)="enfocarVista('cardio')"
        >
          {{ modoEscena === 'recepcion' ? 'Acceso QR' : 'Cardio Loft' }}
        </button>
        <button
          type="button"
          class="gym3d-cam-btn"
          [class.is-active]="vistaActiva === 'funcional'"
          (click)="enfocarVista('funcional')"
        >
          {{ modoEscena === 'recepcion' ? 'Lounge & Kiosco' : 'Funcional' }}
        </button>
        <button
          type="button"
          class="gym3d-cam-btn gym3d-spin-btn"
          [class.is-active]="autoRotar"
          [attr.aria-pressed]="autoRotar"
          (click)="toggleAutoRotar()"
          title="Activar o pausar rotación automática"
        >
          {{ autoRotar ? 'Pausar' : 'Girar' }}
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        align-self: stretch;
      }

      .gym3d-shell {
        position: relative;
        width: 100%;
        max-width: 560px;
        height: 430px;
        margin: 0 auto;
        border-radius: 18px;
        overflow: hidden;
        background:
          radial-gradient(360px circle at 82% 14%, rgba(255, 85, 32, 0.16) 0%, transparent 70%),
          radial-gradient(280px circle at 16% 86%, rgba(56, 189, 248, 0.08) 0%, transparent 72%),
          linear-gradient(180deg, #161822 0%, #0e1017 100%);
        border: 1px solid rgba(255, 255, 255, 0.11);
        box-shadow:
          0 28px 56px -18px rgba(0, 0, 0, 0.82),
          inset 0 1px 0 rgba(255, 255, 255, 0.1);
        transition:
          border-color 180ms ease,
          box-shadow 180ms ease;
      }

      .gym3d-shell.is-dragging-file {
        border-color: #ff5520;
        box-shadow:
          0 28px 56px -18px rgba(0, 0, 0, 0.82),
          0 0 0 2px rgba(255, 85, 32, 0.35);
      }

      .gym3d-viewport {
        width: 100%;
        height: 100%;
        cursor: grab;
        touch-action: none;
      }

      .gym3d-viewport:active {
        cursor: grabbing;
      }

      .gym3d-top-bar {
        position: absolute;
        top: 12px;
        left: 12px;
        right: 12px;
        z-index: 3;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        pointer-events: none;
      }

      .gym3d-top-badge {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        height: 28px;
        padding: 0 11px;
        border-radius: 999px;
        background: rgba(12, 14, 20, 0.76);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.12);
        color: #e2e8f0;
        font-size: 11px;
        font-weight: 600;
        max-width: 62%;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .gym3d-live-dot {
        flex-shrink: 0;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #ff5520;
        box-shadow: 0 0 8px rgba(255, 85, 32, 0.9);
      }

      .gym3d-top-actions {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        pointer-events: auto;
      }

      .gym3d-glb-btn {
        height: 28px;
        padding: 0 10px;
        border-radius: 999px;
        border: 1px solid rgba(255, 85, 32, 0.38);
        background: rgba(255, 85, 32, 0.16);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        color: #ffd7c9;
        font-family: inherit;
        font-size: 11px;
        font-weight: 600;
        cursor: pointer;
        transition:
          background-color 150ms ease,
          border-color 150ms ease,
          color 150ms ease,
          transform 130ms ease;
      }

      .gym3d-glb-btn:hover {
        background: rgba(255, 85, 32, 0.3);
        border-color: rgba(255, 130, 90, 0.65);
        color: #ffffff;
      }

      .gym3d-glb-btn.is-secondary {
        border-color: rgba(255, 255, 255, 0.16);
        background: rgba(12, 14, 20, 0.78);
        color: #cbd5e1;
      }

      .gym3d-glb-btn.is-secondary:hover {
        background: rgba(255, 255, 255, 0.14);
        border-color: rgba(255, 255, 255, 0.28);
        color: #ffffff;
      }

      .gym3d-glb-btn:active {
        transform: scale(0.96);
      }

      .gym3d-glb-btn:focus-visible,
      .gym3d-cam-btn:focus-visible {
        outline: 2px solid #ff5520;
        outline-offset: 2px;
      }

      .gym3d-hidden-input {
        position: absolute;
        width: 1px;
        height: 1px;
        opacity: 0;
        pointer-events: none;
      }

      .gym3d-toast {
        position: absolute;
        top: 48px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 4;
        padding: 5px 12px;
        border-radius: 999px;
        background: rgba(15, 18, 26, 0.88);
        border: 1px solid rgba(255, 255, 255, 0.14);
        color: #f8fafc;
        font-size: 11px;
        font-weight: 500;
        pointer-events: none;
        white-space: nowrap;
      }

      .gym3d-controls-bar {
        position: absolute;
        left: 10px;
        right: 10px;
        bottom: 12px;
        z-index: 3;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        flex-wrap: wrap;
        pointer-events: none;
      }

      .gym3d-cam-btn {
        pointer-events: auto;
        height: 29px;
        padding: 0 11px;
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.12);
        background: rgba(12, 14, 20, 0.8);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        color: #cbd5e1;
        font-family: inherit;
        font-size: 11px;
        font-weight: 600;
        cursor: pointer;
        transition:
          background-color 150ms ease,
          border-color 150ms ease,
          color 150ms ease,
          transform 130ms ease;
      }

      .gym3d-cam-btn:hover {
        background: rgba(255, 255, 255, 0.14);
        border-color: rgba(255, 255, 255, 0.26);
        color: #ffffff;
      }

      .gym3d-cam-btn:active {
        transform: scale(0.96);
      }

      .gym3d-cam-btn.is-active {
        background: rgba(255, 85, 32, 0.9);
        border-color: rgba(255, 175, 140, 0.5);
        color: #ffffff;
      }

      @media (max-width: 560px) {
        .gym3d-shell {
          height: 350px;
        }
      }
    `,
  ],
})
export class Gym3dModelComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() nombreSede = 'The House Fit';
  @Input() modeloGlbUrl = '';
  @Input() modoEscena: 'gimnasio' | 'recepcion' = 'gimnasio';
  @ViewChild('canvasHost', { static: true }) canvasHost!: ElementRef<HTMLDivElement>;

  vistaActiva: VistaCamara3D = 'general';
  autoRotar = true;
  usandoModeloExterno = false;
  usandoArchivoUsuario = false;
  nombreArchivoExterno = '';
  cargandoGlb = false;
  arrastrandoGlb = false;
  mensajeEstado = '';

  get etiquetaActivaVisor(): string {
    if (this.usandoArchivoUsuario && this.nombreArchivoExterno) {
      return this.nombreArchivoExterno;
    }
    if (this.usandoModeloExterno) {
      return this.modoEscena === 'recepcion'
        ? 'Recepción & Tarifas · Modelo GLB'
        : 'Modelo GLB · Iluminación Horneada';
    }
    return 'Maqueta PBR 3D · Interactiva';
  }

  private renderer?: THREE.WebGLRenderer;
  private scene?: THREE.Scene;
  private camera?: THREE.PerspectiveCamera;
  private controls?: OrbitControls;
  private envRenderTarget?: THREE.WebGLRenderTarget;
  private resizeObserver?: ResizeObserver;
  private rafId: number | null = null;
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  private maquetaBaseGroup?: THREE.Group;
  private baseComunGroup?: THREE.Group;
  private modeloExternoGroup?: THREE.Group;
  private signMesh?: THREE.Mesh;
  private glbDynamicSignMesh?: THREE.Mesh;
  private signTexture?: THREE.CanvasTexture;
  private generatedTextures: THREE.Texture[] = [];
  private gltfLoader?: GLTFLoader;
  private dracoLoader?: DRACOLoader;

  private targetPos?: THREE.Vector3;
  private targetLook?: THREE.Vector3;
  private lerpCamera = false;

  constructor(
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
  ) {}

  ngAfterViewInit(): void {
    if (typeof window === 'undefined') return;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      this.autoRotar = false;
    }

    this.ngZone.runOutsideAngular(() => {
      this.inicializarEscena();
      if (this.modeloGlbUrl) {
        this.cargarModeloGlbDesdeUrl(this.modeloGlbUrl, 'Modelo 3D de la sede');
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['nombreSede'] && !changes['nombreSede'].firstChange) {
      this.actualizarLetreroPared();
    }
    if (changes['modeloGlbUrl'] && !changes['modeloGlbUrl'].firstChange && this.scene) {
      if (this.modeloGlbUrl) {
        this.cargarModeloGlbDesdeUrl(this.modeloGlbUrl, 'Modelo 3D de la sede');
      } else {
        this.restaurarMaquetaBase();
      }
    }
  }

  ngOnDestroy(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }
    this.resizeObserver?.disconnect();
    this.controls?.dispose();
    this.dracoLoader?.dispose();

    if (this.scene) {
      this.liberarRecursosGrupo(this.scene);
    }
    this.generatedTextures.forEach((tex) => tex.dispose());
    this.generatedTextures = [];
    this.signTexture?.dispose();
    this.envRenderTarget?.dispose();
    this.renderer?.dispose();
    this.renderer?.domElement?.remove();
  }

  enfocarVista(vista: VistaCamara3D): void {
    this.vistaActiva = vista;
    if (this.modoEscena === 'recepcion') {
      if (vista === 'general') {
        this.targetPos = new THREE.Vector3(7.35, 5.15, 7.55);
        this.targetLook = new THREE.Vector3(0, 0.98, 0);
      } else if (vista === 'fuerza') {
        // Mostrador & Tarifas
        this.targetPos = new THREE.Vector3(-0.05, 2.48, 4.35);
        this.targetLook = new THREE.Vector3(-0.45, 1.35, -1.65);
      } else if (vista === 'cardio') {
        // Torniquetes Acceso QR
        this.targetPos = new THREE.Vector3(4.15, 2.55, 3.85);
        this.targetLook = new THREE.Vector3(1.72, 0.95, -0.85);
      } else {
        // Lounge & Kiosco de Tarifas
        this.targetPos = new THREE.Vector3(0.65, 2.75, 5.45);
        this.targetLook = new THREE.Vector3(-0.25, 0.78, 1.55);
      }
      this.lerpCamera = true;
      return;
    }

    if (vista === 'general') {
      this.targetPos = new THREE.Vector3(7.5, 5.3, 7.7);
      this.targetLook = new THREE.Vector3(0, 1.05, 0);
    } else if (vista === 'fuerza') {
      this.targetPos = new THREE.Vector3(-0.3, 2.85, 4.95);
      this.targetLook = new THREE.Vector3(-1.55, 1.05, -0.85);
    } else if (vista === 'cardio') {
      this.targetPos = new THREE.Vector3(4.55, 4.35, 3.85);
      this.targetLook = new THREE.Vector3(1.75, 2.35, -1.55);
    } else {
      this.targetPos = new THREE.Vector3(4.95, 2.95, 5.15);
      this.targetLook = new THREE.Vector3(1.15, 0.55, 1.65);
    }
    this.lerpCamera = true;
  }

  toggleAutoRotar(): void {
    this.autoRotar = !this.autoRotar;
    if (this.controls) {
      this.controls.autoRotate = this.autoRotar;
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.arrastrandoGlb = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.arrastrandoGlb = false;
  }

  onDropGlb(event: DragEvent): void {
    event.preventDefault();
    this.arrastrandoGlb = false;
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      this.procesarArchivoGlbLocal(file);
    }
  }

  onArchivoGlbSeleccionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.procesarArchivoGlbLocal(file);
    }
    input.value = '';
  }

  restaurarMaquetaBase(): void {
    if (this.modeloGlbUrl) {
      this.usandoArchivoUsuario = false;
      this.cargarModeloGlbDesdeUrl(this.modeloGlbUrl, 'Modelo GLB · Iluminación Horneada', undefined, false);
      return;
    }
    if (this.modeloExternoGroup && this.scene) {
      this.scene.remove(this.modeloExternoGroup);
      this.liberarRecursosGrupo(this.modeloExternoGroup);
      this.modeloExternoGroup = undefined;
      this.glbDynamicSignMesh = undefined;
    }
    if (this.baseComunGroup) {
      this.baseComunGroup.visible = true;
    }
    if (this.maquetaBaseGroup) {
      this.maquetaBaseGroup.visible = true;
    }
    this.usandoModeloExterno = false;
    this.usandoArchivoUsuario = false;
    this.nombreArchivoExterno = '';
    this.enfocarVista('general');
    this.mostrarMensaje('Maqueta arquitectónica restaurada');
  }

  private procesarArchivoGlbLocal(file: File): void {
    const lower = file.name.toLowerCase();
    if (!lower.endsWith('.glb') && !lower.endsWith('.gltf')) {
      this.mostrarMensaje('Selecciona un archivo .glb o .gltf válido');
      return;
    }
    const blobUrl = URL.createObjectURL(file);
    this.cargarModeloGlbDesdeUrl(blobUrl, file.name, () => URL.revokeObjectURL(blobUrl), true);
  }

  private cargarModeloGlbDesdeUrl(
    url: string,
    etiqueta: string,
    onDone?: () => void,
    esArchivoUsuario = false,
  ): void {
    if (!this.scene) return;
    if (!this.gltfLoader) {
      this.gltfLoader = new GLTFLoader();
      this.dracoLoader = new DRACOLoader();
      this.dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
      this.gltfLoader.setDRACOLoader(this.dracoLoader);
    }

    this.cargandoGlb = true;
    this.cdr.markForCheck();

    this.ngZone.runOutsideAngular(() => {
      this.gltfLoader!.load(
        url,
        (gltf) => {
          onDone?.();
          this.ngZone.run(() => {
            if (!this.scene) return;
            if (this.modeloExternoGroup) {
              this.scene.remove(this.modeloExternoGroup);
              this.liberarRecursosGrupo(this.modeloExternoGroup);
              this.glbDynamicSignMesh = undefined;
            }

            const wrapper = new THREE.Group();
            const root = gltf.scene;
            const firstNode = root.children[0];
            const esEscalaNativaThf = !!(
              root.userData?.['thfNativeScale'] || firstNode?.userData?.['thfNativeScale']
            );

            if (!esEscalaNativaThf) {
              const box = new THREE.Box3().setFromObject(root);
              const size = box.getSize(new THREE.Vector3());
              const maxDim = Math.max(size.x, size.y, size.z, 0.001);
              const scale = 5.4 / maxDim;
              root.scale.setScalar(scale);

              const scaledBox = new THREE.Box3().setFromObject(root);
              const center = scaledBox.getCenter(new THREE.Vector3());
              root.position.x -= center.x;
              root.position.z -= center.z;
              root.position.y -= scaledBox.min.y - 0.08;
            }

            let dynamicSignFound: THREE.Mesh | undefined;
            root.traverse((child) => {
              if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                if (child.name.includes('THF_Dynamic_Sign') || child.parent?.name === 'THF_Dynamic_Sign') {
                  dynamicSignFound = child;
                }
              }
            });

            if (dynamicSignFound) {
              this.glbDynamicSignMesh = dynamicSignFound;
              this.aplicarTexturaLetreroEnMesh(dynamicSignFound);
            }

            wrapper.add(root);
            this.scene.add(wrapper);
            this.modeloExternoGroup = wrapper;

            // El modelo .glb oficial ya trae su propio basamento y piso con sombras horneadas
            if (this.baseComunGroup) {
              this.baseComunGroup.visible = !esEscalaNativaThf;
            }
            if (this.maquetaBaseGroup) {
              this.maquetaBaseGroup.visible = false;
            }

            this.cargandoGlb = false;
            this.usandoModeloExterno = true;
            this.usandoArchivoUsuario = esArchivoUsuario;
            this.nombreArchivoExterno = etiqueta;
            this.enfocarVista('general');
            if (esArchivoUsuario) {
              this.mostrarMensaje('Modelo 3D personalizado cargado');
            }
            this.cdr.markForCheck();
          });
        },
        undefined,
        () => {
          onDone?.();
          this.ngZone.run(() => {
            this.cargandoGlb = false;
            if (this.baseComunGroup) this.baseComunGroup.visible = true;
            if (this.maquetaBaseGroup) this.maquetaBaseGroup.visible = true;
            this.mostrarMensaje('No se pudo cargar el .glb; mostrando maqueta integrada');
            this.cdr.markForCheck();
          });
        },
      );
    });
  }

  private mostrarMensaje(texto: string): void {
    this.mensajeEstado = texto;
    this.cdr.markForCheck();
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }
    this.toastTimer = setTimeout(() => {
      this.mensajeEstado = '';
      this.cdr.markForCheck();
    }, 3200);
  }

  private liberarRecursosGrupo(root: THREE.Object3D): void {
    const geometries = new Set<THREE.BufferGeometry>();
    const materials = new Set<THREE.Material>();

    root.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        geometries.add(obj.geometry);
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => materials.add(m));
        } else if (obj.material) {
          materials.add(obj.material);
        }
      }
    });

    geometries.forEach((g) => g.dispose());
    materials.forEach((m) => m.dispose());
  }

  private inicializarEscena(): void {
    const container = this.canvasHost.nativeElement;
    const width = Math.max(container.clientWidth, 340);
    const height = Math.max(container.clientHeight, 300);

    const scene = new THREE.Scene();
    this.scene = scene;

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 80);
    camera.position.set(7.5, 5.3, 7.7);
    this.camera = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    container.appendChild(renderer.domElement);
    this.renderer = renderer;

    // Entorno PBR de estudio para reflejos reales en acero, cromo, espejos y cristal
    const pmrem = new THREE.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();
    const roomEnv = new RoomEnvironment();
    this.envRenderTarget = pmrem.fromScene(roomEnv, 0.04);
    scene.environment = this.envRenderTarget.texture;
    scene.environmentIntensity = 0.72;
    roomEnv.dispose();
    pmrem.dispose();

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.target.set(0, 1.05, 0);
    controls.minDistance = 4.2;
    controls.maxDistance = 14.5;
    controls.maxPolarAngle = Math.PI / 2 - 0.04;
    controls.minPolarAngle = 0.22;
    controls.autoRotate = this.autoRotar;
    controls.autoRotateSpeed = 0.75;
    controls.addEventListener('start', () => {
      this.lerpCamera = false;
    });
    this.controls = controls;

    this.agregarLucesEstudio(scene);

    const baseGroup = new THREE.Group();
    this.construirBaseComun(baseGroup);
    baseGroup.visible = !this.modeloGlbUrl;
    scene.add(baseGroup);
    this.baseComunGroup = baseGroup;

    const maquetaGroup = new THREE.Group();
    this.construirMaquetaGimnasioPro(maquetaGroup);
    maquetaGroup.visible = !this.modeloGlbUrl;
    scene.add(maquetaGroup);
    this.maquetaBaseGroup = maquetaGroup;

    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        const w = Math.max(container.clientWidth, 260);
        const h = Math.max(container.clientHeight, 240);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      });
      this.resizeObserver.observe(container);
    }

    const animar = () => {
      this.rafId = requestAnimationFrame(animar);
      if (this.lerpCamera && this.targetPos && this.targetLook) {
        camera.position.lerp(this.targetPos, 0.085);
        controls.target.lerp(this.targetLook, 0.085);
        if (camera.position.distanceTo(this.targetPos) < 0.035) {
          this.lerpCamera = false;
        }
      }
      controls.update();
      renderer.render(scene, camera);
    };
    animar();
  }

  private agregarLucesEstudio(scene: THREE.Scene): void {
    const hemi = new THREE.HemisphereLight(0xe2e8f0, 0x0b0d14, 0.65);
    scene.add(hemi);

    const keyLight = new THREE.DirectionalLight(0xfff4ea, 2.15);
    keyLight.position.set(6.5, 11.2, 7.5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(2048, 2048);
    keyLight.shadow.camera.near = 1.5;
    keyLight.shadow.camera.far = 26;
    const d = 5.4;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.0004;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    // Acento cálido de marca sobre zona de fuerza y espejos
    const brandGlow = new THREE.PointLight(0xff5a24, 3.6, 11, 1.5);
    brandGlow.position.set(-2.0, 2.9, -1.2);
    scene.add(brandGlow);

    // Luz cálida arquitectónica bajo el mezzanine (zona lockers)
    const underLoftLight = new THREE.PointLight(0xffb38a, 1.8, 5.5, 1.6);
    underLoftLight.position.set(1.85, 1.62, -2.1);
    scene.add(underLoftLight);

    // Contraluz fría sutil sobre el Cardio Loft y zona funcional
    const coolRim = new THREE.PointLight(0x38bdf8, 2.2, 12, 1.5);
    coolRim.position.set(2.9, 3.7, 1.8);
    scene.add(coolRim);
  }

  private construirBaseComun(scene: THREE.Object3D): void {
    const plinthMat = new THREE.MeshStandardMaterial({
      color: 0x0b0d13,
      roughness: 0.72,
      metalness: 0.28,
    });
    const rubberTex = this.crearTexturaCaucho();
    const floorMat = new THREE.MeshStandardMaterial({
      map: rubberTex,
      roughness: 0.84,
      metalness: 0.08,
    });
    const baseLedMat = new THREE.MeshStandardMaterial({
      color: 0xff6a33,
      emissive: 0xff5520,
      emissiveIntensity: 1.5,
      roughness: 0.25,
    });

    // Basamento arquitectónico biselado
    const plinth = new THREE.Mesh(new RoundedBoxGeometry(6.96, 0.28, 6.96, 4, 0.06), plinthMat);
    plinth.position.set(0, -0.1, 0);
    plinth.receiveShadow = true;
    scene.add(plinth);

    // Filete perimetral LED sutil en la base
    const trim = new THREE.Mesh(new THREE.BoxGeometry(6.82, 0.022, 6.82), baseLedMat);
    trim.position.set(0, -0.02, 0);
    scene.add(trim);

    // Piso principal de caucho EPDM de alto impacto
    const floor = new THREE.Mesh(new RoundedBoxGeometry(6.56, 0.08, 6.56, 3, 0.02), floorMat);
    floor.position.set(0, 0.04, 0);
    floor.receiveShadow = true;
    scene.add(floor);
  }

  private construirMaquetaGimnasioPro(root: THREE.Group): void {
    // Paleta PBR coherente con The House Fit
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x161924, roughness: 0.76, metalness: 0.12 });
    const concreteMat = new THREE.MeshStandardMaterial({ color: 0x1d2130, roughness: 0.82, metalness: 0.08 });
    const darkSteelMat = new THREE.MeshStandardMaterial({ color: 0x202532, roughness: 0.34, metalness: 0.86 });
    const gunmetalMat = new THREE.MeshStandardMaterial({ color: 0x32394a, roughness: 0.28, metalness: 0.88 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.12, metalness: 0.96 });
    const urethaneMat = new THREE.MeshStandardMaterial({ color: 0x12141c, roughness: 0.62, metalness: 0.15 });
    const leatherMat = new THREE.MeshStandardMaterial({ color: 0x151821, roughness: 0.46, metalness: 0.12 });
    const woodSlatMat = new THREE.MeshStandardMaterial({ color: 0x6f472c, roughness: 0.64, metalness: 0.06 });
    const orangePowderMat = new THREE.MeshStandardMaterial({
      color: 0xff5520,
      emissive: 0x551604,
      emissiveIntensity: 0.28,
      roughness: 0.32,
      metalness: 0.36,
    });
    const bluePlateMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.48, metalness: 0.18 });
    const emeraldMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.55, metalness: 0.12 });
    const neonOrangeMat = new THREE.MeshStandardMaterial({
      color: 0xff7847,
      emissive: 0xff5520,
      emissiveIntensity: 2.2,
      roughness: 0.18,
    });
    const warmLedMat = new THREE.MeshStandardMaterial({
      color: 0xfff3e6,
      emissive: 0xffd9b3,
      emissiveIntensity: 1.9,
      roughness: 0.2,
    });
    const mirrorMat = new THREE.MeshPhysicalMaterial({
      color: 0xdbeafe,
      roughness: 0.05,
      metalness: 0.94,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
    });
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x7dd3fc,
      transparent: true,
      opacity: 0.24,
      roughness: 0.08,
      metalness: 0.12,
      clearcoat: 0.9,
    });

    // 1. PAREDES CUTAWAY + ACABADOS ARQUITECTÓNICOS
    const wallLeft = new THREE.Mesh(new RoundedBoxGeometry(0.18, 3.62, 6.56, 3, 0.025), wallMat);
    wallLeft.position.set(-3.19, 1.85, 0);
    wallLeft.castShadow = true;
    wallLeft.receiveShadow = true;
    root.add(wallLeft);

    const wallBack = new THREE.Mesh(new RoundedBoxGeometry(6.56, 3.62, 0.18, 3, 0.025), concreteMat);
    wallBack.position.set(0, 1.85, -3.19);
    wallBack.castShadow = true;
    wallBack.receiveShadow = true;
    root.add(wallBack);

    // Listones acústicos de nogal en pared izquierda (extremos arquitectónicos)
    const slatGeo = new THREE.BoxGeometry(0.035, 3.25, 0.055);
    for (let i = 0; i < 11; i++) {
      const s1 = new THREE.Mesh(slatGeo, woodSlatMat);
      s1.position.set(-3.08, 1.72, -3.0 + i * 0.12);
      s1.castShadow = true;
      root.add(s1);
    }
    for (let i = 0; i < 6; i++) {
      const s2 = new THREE.Mesh(slatGeo, woodSlatMat);
      s2.position.set(-3.08, 1.72, 2.42 + i * 0.12);
      s2.castShadow = true;
      root.add(s2);
    }

    // 3 Paneles de espejo retroiluminados en zona de peso libre
    const mirrorBackglow = new THREE.Mesh(new THREE.BoxGeometry(0.02, 2.02, 3.36), neonOrangeMat);
    mirrorBackglow.position.set(-3.09, 1.38, 0.55);
    root.add(mirrorBackglow);

    const mirrorGeo = new RoundedBoxGeometry(0.03, 1.94, 1.06, 2, 0.01);
    [-0.56, 0.55, 1.66].forEach((mz) => {
      const mirror = new THREE.Mesh(mirrorGeo, mirrorMat);
      mirror.position.set(-3.065, 1.38, mz);
      root.add(mirror);
    });

    // Tira LED arquitectónica superior izquierda
    const topLedLeft = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 6.2), neonOrangeMat);
    topLedLeft.position.set(-3.07, 3.52, 0);
    root.add(topLedLeft);

    // Letrero luminoso dinámico en pared trasera (THE HOUSE FIT / nombreSede)
    this.signTexture = this.crearTexturaLetrero(this.nombreSede);
    const signFrame = new THREE.Mesh(new RoundedBoxGeometry(2.44, 0.62, 0.06, 3, 0.02), darkSteelMat);
    signFrame.position.set(-1.18, 2.86, -3.07);
    signFrame.castShadow = true;
    root.add(signFrame);

    const signFaceMat = new THREE.MeshStandardMaterial({
      map: this.signTexture,
      emissiveMap: this.signTexture,
      emissive: 0xffffff,
      emissiveIntensity: 0.92,
      roughness: 0.25,
    });
    this.signMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.34, 0.52), signFaceMat);
    this.signMesh.position.set(-1.18, 2.86, -3.035);
    root.add(this.signMesh);

    // Ventanal industrial en el Cardio Loft (pared trasera derecha)
    const winX = 1.72;
    const winY = 2.74;
    const winGlass = new THREE.Mesh(new THREE.BoxGeometry(2.58, 1.18, 0.03), glassMat);
    winGlass.position.set(winX, winY, -3.07);
    root.add(winGlass);

    // Marcos y parteluces metálicos del ventanal
    root.add(this.cajaSimple(2.64, 0.05, 0.06, darkSteelMat, winX, winY + 0.6, -3.06));
    root.add(this.cajaSimple(2.64, 0.05, 0.06, darkSteelMat, winX, winY - 0.6, -3.06));
    [-1.3, -0.43, 0.43, 1.3].forEach((wx) => {
      root.add(this.cajaSimple(0.04, 1.22, 0.06, darkSteelMat, winX + wx, winY, -3.06));
    });
    root.add(this.cajaSimple(2.64, 0.04, 0.05, neonOrangeMat, winX, winY + 0.66, -3.05));

    // Luminarias lineales LED suspendidas en el techo
    this.agregarLuminariaSuspendida(root, -1.45, 3.48, 0.2, darkSteelMat, warmLedMat, chromeMat);
    this.agregarLuminariaSuspendida(root, 1.85, 3.48, 1.45, darkSteelMat, warmLedMat, chromeMat);

    // 2. ZONA FUERZA PESADA: PLATAFORMA OLÍMPICA + POWER RACK + POLEA DOBLE + BANCOS
    this.agregarPlataformaOlimpica(root, -1.92, 0.08, -1.62, darkSteelMat, urethaneMat, orangePowderMat);
    this.agregarPowerRackPro(
      root,
      -1.92,
      0.125,
      -1.62,
      darkSteelMat,
      gunmetalMat,
      chromeMat,
      orangePowderMat,
      bluePlateMat,
      urethaneMat,
    );

    // Torre de Poleas Doble (Dual Adjustable Pulley / Functional Trainer)
    this.agregarTorrePoleasDoble(
      root,
      -0.25,
      0.08,
      -2.55,
      darkSteelMat,
      gunmetalMat,
      chromeMat,
      orangePowderMat,
      urethaneMat,
    );

    // Press de Banca Olímpico frente al espejo central
    this.agregarPressBancaPro(
      root,
      -1.88,
      0.08,
      0.42,
      darkSteelMat,
      leatherMat,
      chromeMat,
      orangePowderMat,
      bluePlateMat,
      urethaneMat,
    );

    // Banco Inclinado Ajustable frente al tercer espejo
    this.agregarBancoInclinadoPro(root, -1.98, 0.08, 1.82, darkSteelMat, leatherMat, chromeMat, orangePowderMat);

    // Rack Comercial de 2 Niveles con 16 Mancuernas Redondas de Uretano
    this.agregarRackMancuernasPro(root, -0.32, 0.08, 2.48, darkSteelMat, chromeMat, urethaneMat, orangePowderMat);

    // 3. MEZZANINE CARDIO LOFT + LOCKERS BAJO ENTREPISO + ESCALERA CON ACCESO REAL
    this.agregarMezzanineYLockers(
      root,
      darkSteelMat,
      gunmetalMat,
      chromeMat,
      orangePowderMat,
      glassMat,
      woodSlatMat,
    );

    // 2 Cintas de Correr Comerciales mirando hacia la planta principal (+Z)
    const hudTex1 = this.crearTexturaConsolaCardio('14.2', '152', '04:13');
    const hudTex2 = this.crearTexturaConsolaCardio('11.8', '138', '05:05');
    this.agregarCintaCorrerPro(root, 1.05, 1.92, -1.42, darkSteelMat, gunmetalMat, urethaneMat, orangePowderMat, hudTex1);
    this.agregarCintaCorrerPro(root, 1.88, 1.92, -1.42, darkSteelMat, gunmetalMat, urethaneMat, orangePowderMat, hudTex2);

    // 2 Bicicletas de Spinning Studio en el Cardio Loft
    this.agregarBicicletaSpinningPro(root, 2.66, 1.92, -1.22, darkSteelMat, chromeMat, leatherMat, orangePowderMat);
    this.agregarBicicletaSpinningPro(root, 2.66, 1.92, -2.28, darkSteelMat, chromeMat, leatherMat, orangePowderMat);

    // 4. ZONA FUNCIONAL: PISTA SPRINT TURF + BATTLE ROPES + KETTLEBELLS + PLYO BOXES
    this.agregarZonaFuncionalPro(
      root,
      darkSteelMat,
      chromeMat,
      urethaneMat,
      orangePowderMat,
      emeraldMat,
      bluePlateMat,
      woodSlatMat,
    );
  }

  private agregarLuminariaSuspendida(
    parent: THREE.Group,
    x: number,
    y: number,
    z: number,
    frameMat: THREE.Material,
    ledMat: THREE.Material,
    wireMat: THREE.Material,
  ): void {
    const g = new THREE.Group();
    g.position.set(x, y, z);

    const housing = new THREE.Mesh(new RoundedBoxGeometry(1.65, 0.045, 0.14, 2, 0.01), frameMat);
    g.add(housing);

    const diffuser = new THREE.Mesh(new THREE.BoxGeometry(1.58, 0.02, 0.1), ledMat);
    diffuser.position.y = -0.02;
    g.add(diffuser);

    const wireGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.22, 6);
    [-0.68, 0.68].forEach((wx) => {
      const wire = new THREE.Mesh(wireGeo, wireMat);
      wire.position.set(wx, 0.12, 0);
      g.add(wire);
    });

    parent.add(g);
  }

  private agregarPlataformaOlimpica(
    parent: THREE.Group,
    x: number,
    y: number,
    z: number,
    frameMat: THREE.Material,
    rubberMat: THREE.Material,
    accentMat: THREE.Material,
  ): void {
    const g = new THREE.Group();
    g.position.set(x, y, z);

    const woodTex = this.crearTexturaMaderaPlataforma();
    const oakMat = new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.42, metalness: 0.05 });

    const baseFrame = new THREE.Mesh(new RoundedBoxGeometry(2.04, 0.042, 1.96, 2, 0.012), frameMat);
    baseFrame.position.y = 0.021;
    baseFrame.receiveShadow = true;
    g.add(baseFrame);

    const centerWood = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.046, 1.88), oakMat);
    centerWood.position.y = 0.023;
    centerWood.receiveShadow = true;
    g.add(centerWood);

    const dropGeo = new THREE.BoxGeometry(0.55, 0.046, 1.88);
    [-0.71, 0.71].forEach((rx) => {
      const pad = new THREE.Mesh(dropGeo, rubberMat);
      pad.position.set(rx, 0.023, 0);
      pad.receiveShadow = true;
      g.add(pad);
    });

    // Filo frontal naranja de seguridad
    g.add(this.cajaSimple(2.04, 0.024, 0.025, accentMat, 0, 0.022, 0.985));
    parent.add(g);
  }

  private agregarPowerRackPro(
    parent: THREE.Group,
    x: number,
    y: number,
    z: number,
    steelMat: THREE.Material,
    gunmetalMat: THREE.Material,
    chromeMat: THREE.Material,
    orangeMat: THREE.Material,
    blueMat: THREE.Material,
    rubberMat: THREE.Material,
  ): void {
    const g = new THREE.Group();
    g.position.set(x, y, z);

    const w = 0.56;
    const d = 0.52;
    const h = 2.18;

    // Rieles base inferiores laterales
    const baseRailGeo = new RoundedBoxGeometry(0.08, 0.07, 1.24, 2, 0.015);
    [-w, w].forEach((bx) => {
      const rail = new THREE.Mesh(baseRailGeo, steelMat);
      rail.position.set(bx, 0.035, 0);
      rail.castShadow = true;
      g.add(rail);
    });

    // 4 Columnas principales perforadas
    const postGeo = new RoundedBoxGeometry(0.075, h, 0.075, 2, 0.014);
    const holeGeo = new THREE.CylinderGeometry(0.009, 0.009, 0.082, 8);
    [
      [-w, -d],
      [w, -d],
      [-w, d],
      [w, d],
    ].forEach(([px, pz]) => {
      const post = new THREE.Mesh(postGeo, steelMat);
      post.position.set(px, h / 2, pz);
      post.castShadow = true;
      g.add(post);

      // Detalle sutil de perforaciones cromadas Westside en postes frontales
      if (pz > 0) {
        for (let hi = 0; hi < 7; hi++) {
          const pin = new THREE.Mesh(holeGeo, gunmetalMat);
          pin.rotation.x = Math.PI / 2;
          pin.position.set(px, 0.55 + hi * 0.18, pz);
          g.add(pin);
        }
      }
    });

    // Travesaños superiores y puente de marca naranja
    g.add(this.cajaBiselada(1.2, 0.11, 0.07, orangeMat, 0, h - 0.06, -d));
    g.add(this.cajaBiselada(0.075, 0.08, 1.12, steelMat, -w, h - 0.05, 0));
    g.add(this.cajaBiselada(0.075, 0.08, 1.12, steelMat, w, h - 0.05, 0));

    // Barra de dominadas multi-agarre frontal
    const pullBar = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.12, 14), chromeMat);
    pullBar.rotation.z = Math.PI / 2;
    pullBar.position.set(0, h - 0.04, d);
    g.add(pullBar);

    [-0.22, 0.22].forEach((gx) => {
      const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.22, 10), chromeMat);
      grip.rotation.x = Math.PI / 2;
      grip.position.set(gx, h - 0.04, d + 0.08);
      g.add(grip);
    });

    // Brazos de seguridad (Spotter Arms) y J-Cups
    [-w, w].forEach((sx) => {
      const spotter = this.cajaBiselada(0.065, 0.05, 0.44, gunmetalMat, sx, 0.78, d + 0.2);
      spotter.castShadow = true;
      g.add(spotter);
      g.add(this.cajaSimple(0.068, 0.015, 0.42, rubberMat, sx, 0.81, d + 0.2));

      // J-Cup a altura de sentadilla
      g.add(this.cajaSimple(0.07, 0.12, 0.06, orangeMat, sx, 1.34, d + 0.04));
      g.add(this.cajaSimple(0.07, 0.04, 0.08, rubberMat, sx, 1.29, d + 0.08));
    });

    // Soportes traseros con discos almacenados
    const hornGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.22, 12);
    const sparePlateGeo = new THREE.CylinderGeometry(0.19, 0.19, 0.038, 24);
    [-w, w].forEach((hx) => {
      const dir = hx < 0 ? -1 : 1;
      [0.42, 0.92].forEach((hy, idx) => {
        const horn = new THREE.Mesh(hornGeo, chromeMat);
        horn.rotation.z = Math.PI / 2;
        horn.position.set(hx + dir * 0.11, hy, -d);
        g.add(horn);

        const p = new THREE.Mesh(sparePlateGeo, idx === 0 ? orangeMat : blueMat);
        p.rotation.z = Math.PI / 2;
        p.position.set(hx + dir * 0.09, hy, -d);
        p.castShadow = true;
        g.add(p);
      });
    });

    // Barra Olímpica cargada sobre los J-Cups
    this.agregarBarraOlimpicaCompleta(g, 0, 1.34, d + 0.08, 0, chromeMat, orangeMat, blueMat, rubberMat);

    parent.add(g);
  }

  private agregarBarraOlimpicaCompleta(
    parent: THREE.Group,
    x: number,
    y: number,
    z: number,
    rotY: number,
    chromeMat: THREE.Material,
    orangeMat: THREE.Material,
    blueMat: THREE.Material,
    rubberMat: THREE.Material,
  ): void {
    const bg = new THREE.Group();
    bg.position.set(x, y, z);
    bg.rotation.y = rotY;

    // Eje moleteado + manguitos olímpicos giratorios de 50mm
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 1.32, 14), chromeMat);
    shaft.rotation.z = Math.PI / 2;
    shaft.castShadow = true;
    bg.add(shaft);

    const sleeveGeo = new THREE.CylinderGeometry(0.026, 0.026, 0.36, 16);
    const flangeGeo = new THREE.CylinderGeometry(0.038, 0.038, 0.022, 16);
    [-1, 1].forEach((side) => {
      const sleeve = new THREE.Mesh(sleeveGeo, chromeMat);
      sleeve.rotation.z = Math.PI / 2;
      sleeve.position.x = side * 0.83;
      bg.add(sleeve);

      const flange = new THREE.Mesh(flangeGeo, chromeMat);
      flange.rotation.z = Math.PI / 2;
      flange.position.x = side * 0.65;
      bg.add(flange);

      // 3 Discos calibrados por lado (25kg naranja, 20kg azul, 10kg caucho) + collarín
      const plates: Array<{ r: number; w: number; dx: number; mat: THREE.Material }> = [
        { r: 0.225, w: 0.046, dx: 0.695, mat: orangeMat },
        { r: 0.225, w: 0.04, dx: 0.745, mat: blueMat },
        { r: 0.175, w: 0.032, dx: 0.788, mat: rubberMat },
      ];
      plates.forEach((pl) => {
        const disc = new THREE.Mesh(new THREE.CylinderGeometry(pl.r, pl.r, pl.w, 28), pl.mat);
        disc.rotation.z = Math.PI / 2;
        disc.position.x = side * pl.dx;
        disc.castShadow = true;
        bg.add(disc);

        const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, pl.w + 0.004, 16), chromeMat);
        hub.rotation.z = Math.PI / 2;
        hub.position.x = side * pl.dx;
        bg.add(hub);
      });

      const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.042, 0.035, 16), orangeMat);
      collar.rotation.z = Math.PI / 2;
      collar.position.x = side * 0.828;
      bg.add(collar);
    });

    parent.add(bg);
  }

  private agregarTorrePoleasDoble(
    parent: THREE.Group,
    x: number,
    y: number,
    z: number,
    steelMat: THREE.Material,
    gunmetalMat: THREE.Material,
    chromeMat: THREE.Material,
    orangeMat: THREE.Material,
    rubberMat: THREE.Material,
  ): void {
    const g = new THREE.Group();
    g.position.set(x, y, z);

    const h = 2.12;
    const span = 0.62;
    const rodGeo = new THREE.CylinderGeometry(0.011, 0.011, h - 0.18, 10);
    const stackPlateGeo = new RoundedBoxGeometry(0.22, 0.032, 0.11, 2, 0.006);

    [-span, span].forEach((sx) => {
      const rot = sx < 0 ? 0.22 : -0.22;
      const col = new THREE.Group();
      col.position.set(sx, 0, 0);
      col.rotation.y = rot;

      // Base y marco posterior de la columna
      col.add(this.cajaBiselada(0.32, 0.05, 0.48, steelMat, 0, 0.025, 0.06));
      const backFrame = this.cajaBiselada(0.28, h, 0.06, steelMat, 0, h / 2, -0.14);
      backFrame.castShadow = true;
      col.add(backFrame);
      col.add(this.cajaBiselada(0.3, 0.06, 0.36, steelMat, 0, h - 0.03, 0.02));

      // Guías cromadas verticales + placas de peso apiladas
      [-0.065, 0.065].forEach((rx) => {
        const rod = new THREE.Mesh(rodGeo, chromeMat);
        rod.position.set(rx, h / 2, -0.02);
        col.add(rod);
      });

      for (let pi = 0; pi < 10; pi++) {
        const plate = new THREE.Mesh(stackPlateGeo, pi === 9 ? orangeMat : rubberMat);
        plate.position.set(0, 0.14 + pi * 0.042, -0.02);
        plate.castShadow = true;
        col.add(plate);
      }

      // Tubo frontal cromado de ajuste + carro de polea naranja + maneral en D
      const frontTube = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, h - 0.12, 12), chromeMat);
      frontTube.position.set(0, h / 2, 0.16);
      col.add(frontTube);

      const carriage = this.cajaBiselada(0.075, 0.14, 0.09, orangeMat, 0, 1.32, 0.18);
      col.add(carriage);

      const pulleyWheel = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.022, 16), gunmetalMat);
      pulleyWheel.rotation.z = Math.PI / 2;
      pulleyWheel.position.set(0, 1.32, 0.24);
      col.add(pulleyWheel);

      // Cable tensado y agarre estribo
      const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.72, 6), gunmetalMat);
      cable.position.set(0, 1.66, 0.22);
      col.add(cable);

      const handle = new THREE.Mesh(new THREE.TorusGeometry(0.048, 0.009, 8, 16), rubberMat);
      handle.position.set(0, 1.18, 0.25);
      col.add(handle);

      g.add(col);
    });

    // Puente superior arqueado con agarres de dominadas
    const bridge = this.cajaBiselada(span * 2 + 0.12, 0.09, 0.12, steelMat, 0, h - 0.04, 0.02);
    bridge.castShadow = true;
    g.add(bridge);
    g.add(this.cajaSimple(0.56, 0.045, 0.13, orangeMat, 0, h - 0.04, 0.025));

    [-0.18, 0.18].forEach((cx) => {
      const chin = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.2, 10), chromeMat);
      chin.rotation.z = cx < 0 ? 0.45 : -0.45;
      chin.position.set(cx, h - 0.12, 0.12);
      g.add(chin);
    });

    parent.add(g);
  }

  private agregarPressBancaPro(
    parent: THREE.Group,
    x: number,
    y: number,
    z: number,
    steelMat: THREE.Material,
    leatherMat: THREE.Material,
    chromeMat: THREE.Material,
    orangeMat: THREE.Material,
    blueMat: THREE.Material,
    rubberMat: THREE.Material,
  ): void {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    // Orientado mirando hacia +X (cabeza cerca del espejo en -X)
    g.rotation.y = Math.PI / 2;

    // Bastidor inferior en H + patas con topes de goma
    g.add(this.cajaBiselada(0.96, 0.055, 0.07, steelMat, 0, 0.03, -0.48));
    g.add(this.cajaBiselada(0.52, 0.055, 0.07, steelMat, 0, 0.03, 0.56));
    g.add(this.cajaBiselada(0.07, 0.055, 1.08, steelMat, 0, 0.03, 0.04));

    // Soportes verticales de barra con diseño inclinado
    [-0.44, 0.44].forEach((ux) => {
      const upright = this.cajaBiselada(0.068, 0.98, 0.068, steelMat, ux, 0.49, -0.48);
      upright.rotation.x = 0.06;
      upright.castShadow = true;
      g.add(upright);

      // Gancho J superior y pin de seguridad inferior
      g.add(this.cajaSimple(0.072, 0.06, 0.09, orangeMat, ux, 0.94, -0.44));
      g.add(this.cajaSimple(0.07, 0.035, 0.24, steelMat, ux, 0.66, -0.36));
    });

    // Postes del tapizado + almohadilla ergonómica dividida (asiento + respaldo)
    g.add(this.cajaBiselada(0.08, 0.38, 0.08, steelMat, 0, 0.21, -0.22));
    g.add(this.cajaBiselada(0.08, 0.38, 0.08, steelMat, 0, 0.21, 0.44));

    const backPad = new THREE.Mesh(new RoundedBoxGeometry(0.31, 0.075, 0.84, 4, 0.022), leatherMat);
    backPad.position.set(0, 0.43, -0.08);
    backPad.castShadow = true;
    g.add(backPad);

    const seatPad = new THREE.Mesh(new RoundedBoxGeometry(0.3, 0.075, 0.32, 4, 0.022), leatherMat);
    seatPad.position.set(0, 0.43, 0.53);
    seatPad.castShadow = true;
    g.add(seatPad);

    // Costura naranja bajo el tapizado
    g.add(this.cajaSimple(0.28, 0.012, 1.14, orangeMat, 0, 0.39, 0.12));

    // Barra olímpica cargada en el soporte
    this.agregarBarraOlimpicaCompleta(g, 0, 0.98, -0.44, 0, chromeMat, orangeMat, blueMat, rubberMat);

    parent.add(g);
  }

  private agregarBancoInclinadoPro(
    parent: THREE.Group,
    x: number,
    y: number,
    z: number,
    steelMat: THREE.Material,
    leatherMat: THREE.Material,
    chromeMat: THREE.Material,
    orangeMat: THREE.Material,
  ): void {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    g.rotation.y = Math.PI / 2;

    // Base trípode con ruedas traseras y asa frontal cromada
    g.add(this.cajaBiselada(0.52, 0.048, 0.065, steelMat, 0, 0.025, -0.42));
    g.add(this.cajaBiselada(0.36, 0.048, 0.065, steelMat, 0, 0.025, 0.46));
    g.add(this.cajaBiselada(0.065, 0.05, 0.92, steelMat, 0, 0.03, 0.02));

    const wheelGeo = new THREE.CylinderGeometry(0.038, 0.038, 0.025, 14);
    [-0.24, 0.24].forEach((wx) => {
      const wheel = new THREE.Mesh(wheelGeo, orangeMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(wx, 0.04, -0.47);
      g.add(wheel);
    });

    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.2, 10), chromeMat);
    handle.rotation.z = Math.PI / 2;
    handle.position.set(0, 0.045, 0.52);
    g.add(handle);

    // Columna articulada y arco escalonado de inclinación
    g.add(this.cajaBiselada(0.07, 0.36, 0.07, steelMat, 0, 0.2, 0.16));
    const propArm = this.cajaBiselada(0.045, 0.48, 0.045, chromeMat, 0, 0.42, -0.18);
    propArm.rotation.x = 0.38;
    g.add(propArm);

    // Asiento ligeramente elevado + respaldo a 36°
    const seat = new THREE.Mesh(new RoundedBoxGeometry(0.29, 0.07, 0.31, 4, 0.02), leatherMat);
    seat.position.set(0, 0.41, 0.28);
    seat.rotation.x = -0.22;
    seat.castShadow = true;
    g.add(seat);

    const backrest = new THREE.Mesh(new RoundedBoxGeometry(0.3, 0.072, 0.78, 4, 0.022), leatherMat);
    backrest.position.set(0, 0.65, -0.14);
    backrest.rotation.x = 0.62;
    backrest.castShadow = true;
    g.add(backrest);

    parent.add(g);
  }

  private agregarRackMancuernasPro(
    parent: THREE.Group,
    x: number,
    y: number,
    z: number,
    steelMat: THREE.Material,
    chromeMat: THREE.Material,
    urethaneMat: THREE.Material,
    orangeMat: THREE.Material,
  ): void {
    const g = new THREE.Group();
    g.position.set(x, y, z);

    const width = 1.66;
    // Costados curvados / inclinados tipo A-frame comercial
    [-width / 2, width / 2].forEach((lx) => {
      const legBack = this.cajaBiselada(0.06, 0.76, 0.08, steelMat, lx, 0.38, 0.14);
      legBack.rotation.x = -0.15;
      legBack.castShadow = true;
      g.add(legBack);

      const legFront = this.cajaBiselada(0.06, 0.56, 0.08, steelMat, lx, 0.28, -0.14);
      legFront.rotation.x = 0.24;
      legFront.castShadow = true;
      g.add(legFront);

      g.add(this.cajaBiselada(0.07, 0.045, 0.52, steelMat, lx, 0.022, 0));
    });

    // 2 Bandejas inclinadas con labio protector de caucho
    const tiers = [
      { ty: 0.38, tz: -0.05, scaleBase: 0.95 },
      { ty: 0.68, tz: 0.06, scaleBase: 0.76 },
    ];

    const handleGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.13, 10);

    tiers.forEach((tier, tIdx) => {
      const tray = this.cajaBiselada(width, 0.035, 0.24, steelMat, 0, tier.ty, tier.tz);
      tray.rotation.x = -0.18;
      tray.castShadow = true;
      g.add(tray);

      const lip = this.cajaSimple(width, 0.028, 0.022, orangeMat, 0, tier.ty - 0.005, tier.tz - 0.11);
      g.add(lip);

      // 8 Mancuernas redondas de uretano por bandeja (16 en total)
      for (let i = 0; i < 8; i++) {
        const dx = -0.68 + i * 0.194;
        const headRadius = (0.052 + i * 0.0045) * tier.scaleBase;
        const headWidth = 0.044 + i * 0.002;

        const db = new THREE.Group();
        db.position.set(dx, tier.ty + headRadius + 0.012, tier.tz);
        db.rotation.x = -0.18;

        const handle = new THREE.Mesh(handleGeo, chromeMat);
        handle.rotation.x = Math.PI / 2;
        db.add(handle);

        const headGeo = new THREE.CylinderGeometry(headRadius, headRadius, headWidth, 16);
        const capGeo = new THREE.CylinderGeometry(headRadius * 0.58, headRadius * 0.58, headWidth + 0.004, 14);
        [-0.068, 0.068].forEach((hz) => {
          const head = new THREE.Mesh(headGeo, urethaneMat);
          head.rotation.x = Math.PI / 2;
          head.position.z = hz;
          head.castShadow = true;
          db.add(head);

          const cap = new THREE.Mesh(capGeo, (i + tIdx) % 2 === 0 ? orangeMat : chromeMat);
          cap.rotation.x = Math.PI / 2;
          cap.position.z = hz;
          db.add(cap);
        });

        g.add(db);
      }
    });

    parent.add(g);
  }

  private agregarMezzanineYLockers(
    parent: THREE.Group,
    steelMat: THREE.Material,
    gunmetalMat: THREE.Material,
    chromeMat: THREE.Material,
    orangeMat: THREE.Material,
    glassMat: THREE.Material,
    woodMat: THREE.Material,
  ): void {
    // Plataforma estructural del entrepiso (x: 0.45..3.10, z: -3.10..-0.45, tope en y = 1.92)
    const deck = this.cajaBiselada(2.65, 0.16, 2.65, steelMat, 1.775, 1.84, -1.775);
    deck.castShadow = true;
    deck.receiveShadow = true;
    parent.add(deck);

    // Fascia frontal naranja en el canto de la viga I del entrepiso
    parent.add(this.cajaSimple(2.66, 0.032, 0.02, orangeMat, 1.775, 1.84, -0.445));
    parent.add(this.cajaSimple(0.02, 0.032, 2.66, orangeMat, 0.445, 1.84, -1.775));

    // Columnas de acero estructurales
    [
      [0.54, -0.54],
      [3.0, -0.54],
      [0.54, -2.98],
    ].forEach(([cx, cz]) => {
      const col = this.cajaBiselada(0.13, 1.78, 0.13, steelMat, cx, 0.93, cz);
      col.castShadow = true;
      parent.add(col);
    });

    // Baranda frontal de cristal templado (+Z) con montantes cromados
    const frontGlass = new THREE.Mesh(new THREE.BoxGeometry(2.62, 0.68, 0.03), glassMat);
    frontGlass.position.set(1.78, 2.28, -0.47);
    parent.add(frontGlass);
    parent.add(this.cajaBiselada(2.65, 0.04, 0.055, chromeMat, 1.78, 2.63, -0.47));

    [0.52, 1.36, 2.2, 3.04].forEach((px) => {
      parent.add(this.cajaSimple(0.03, 0.72, 0.04, gunmetalMat, px, 2.27, -0.47));
    });

    // Baranda lateral izquierda (-X) dejando abertura real (z: -0.82..-1.56) para el desembarco de la escalera
    const sideGlassBack = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.68, 1.48), glassMat);
    sideGlassBack.position.set(0.47, 2.28, -2.32);
    parent.add(sideGlassBack);
    parent.add(this.cajaBiselada(0.055, 0.04, 1.5, chromeMat, 0.47, 2.63, -2.32));

    const sideGlassFront = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.68, 0.34), glassMat);
    sideGlassFront.position.set(0.47, 2.28, -0.64);
    parent.add(sideGlassFront);
    parent.add(this.cajaBiselada(0.055, 0.04, 0.36, chromeMat, 0.47, 2.63, -0.64));

    // Escalera flotante industrial (sube de x = -0.68 en planta baja hasta x = 0.45 en el loft, centrada en z = -1.19)
    const stairs = new THREE.Group();
    const stepsCount = 7;
    for (let i = 0; i < stepsCount; i++) {
      const sx = -0.62 + i * 0.165;
      const sy = 0.28 + i * 0.245;
      const tread = this.cajaBiselada(0.24, 0.05, 0.68, gunmetalMat, sx, sy, -1.19);
      tread.castShadow = true;
      tread.receiveShadow = true;
      stairs.add(tread);

      // Filo antideslizante naranja
      stairs.add(this.cajaSimple(0.022, 0.052, 0.66, orangeMat, sx - 0.11, sy, -1.19));
    }

    // Zancas laterales inclinadas + pasamanos cromado alineado exactamente con los peldaños
    [-1.5, -0.88].forEach((sz) => {
      const stringer = this.cajaBiselada(1.78, 0.085, 0.04, steelMat, -0.12, 0.98, sz);
      stringer.rotation.z = 0.978;
      stringer.castShadow = true;
      stairs.add(stringer);
    });

    const handrail = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 1.78, 12), chromeMat);
    handrail.rotation.z = -0.593;
    handrail.position.set(-0.125, 1.695, -0.86);
    stairs.add(handrail);

    [-0.62, 0.37].forEach((hx, idx) => {
      const post = this.cajaSimple(0.028, 0.68, 0.028, gunmetalMat, hx, idx === 0 ? 0.62 : 2.09, -0.86);
      stairs.add(post);
    });
    parent.add(stairs);

    // Lockers ejecutivos de madera y acero + banca bajo el mezzanine
    const lockerBank = new THREE.Group();
    lockerBank.position.set(1.88, 0.08, -2.78);

    const cabinet = this.cajaBiselada(1.96, 1.52, 0.44, steelMat, 0, 0.76, 0);
    cabinet.castShadow = true;
    lockerBank.add(cabinet);

    const doorGeo = new RoundedBoxGeometry(0.35, 0.68, 0.025, 2, 0.008);
    for (let col = 0; col < 5; col++) {
      for (let row = 0; row < 2; row++) {
        const dx = -0.76 + col * 0.38;
        const dy = 0.42 + row * 0.71;
        const door = new THREE.Mesh(doorGeo, woodMat);
        door.position.set(dx, dy, 0.225);
        lockerBank.add(door);

        // Cerradura digital cromada
        lockerBank.add(this.cajaSimple(0.022, 0.055, 0.015, chromeMat, dx + 0.12, dy, 0.24));
      }
    }

    // Banca de vestidor frente a los lockers
    const benchTop = this.cajaBiselada(1.36, 0.05, 0.32, woodMat, 0, 0.4, 0.62);
    benchTop.castShadow = true;
    lockerBank.add(benchTop);
    lockerBank.add(this.cajaSimple(0.06, 0.38, 0.28, steelMat, -0.52, 0.19, 0.62));
    lockerBank.add(this.cajaSimple(0.06, 0.38, 0.28, steelMat, 0.52, 0.19, 0.62));

    parent.add(lockerBank);
  }

  private agregarCintaCorrerPro(
    parent: THREE.Group,
    x: number,
    y: number,
    z: number,
    steelMat: THREE.Material,
    gunmetalMat: THREE.Material,
    beltMat: THREE.Material,
    orangeMat: THREE.Material,
    hudTexture: THREE.CanvasTexture,
  ): void {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    // Orientada mirando hacia +Z (vista panorámica hacia el gimnasio a través del cristal)

    // Cubierta del motor frontal (+Z)
    const motorHood = this.cajaBiselada(0.72, 0.18, 0.34, steelMat, 0, 0.11, 0.56);
    motorHood.castShadow = true;
    g.add(motorHood);
    g.add(this.cajaSimple(0.66, 0.025, 0.02, orangeMat, 0, 0.14, 0.735));

    // Banda de trote + rieles laterales antideslizantes
    const belt = this.cajaBiselada(0.5, 0.08, 1.38, beltMat, 0, 0.065, -0.22);
    belt.castShadow = true;
    g.add(belt);

    [-0.31, 0.31].forEach((rx) => {
      const sideRail = this.cajaBiselada(0.11, 0.1, 1.42, gunmetalMat, rx, 0.075, -0.22);
      sideRail.castShadow = true;
      g.add(sideRail);
      g.add(this.cajaSimple(0.018, 0.02, 1.34, orangeMat, rx + (rx < 0 ? -0.045 : 0.045), 0.125, -0.22));
    });

    // Rodillo trasero expuesto
    const roller = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.52, 14), orangeMat);
    roller.rotation.z = Math.PI / 2;
    roller.position.set(0, 0.065, -0.91);
    g.add(roller);

    // Mástiles aerodinámicos inclinados + pasamanos envolventes
    [-0.31, 0.31].forEach((mx) => {
      const mast = this.cajaBiselada(0.065, 1.02, 0.095, steelMat, mx, 0.58, 0.54);
      mast.rotation.x = -0.18;
      mast.castShadow = true;
      g.add(mast);

      const arm = this.cajaBiselada(0.055, 0.055, 0.44, gunmetalMat, mx, 0.94, 0.34);
      g.add(arm);
    });

    // Consola inclinada con pantalla táctil iluminada alineada al corredor
    const consoleGroup = new THREE.Group();
    consoleGroup.position.set(0, 1.12, 0.46);
    consoleGroup.rotation.x = 0.42;

    const consoleBody = this.cajaBiselada(0.7, 0.32, 0.11, steelMat, 0, 0, 0);
    consoleBody.castShadow = true;
    consoleGroup.add(consoleBody);

    const screenMat = new THREE.MeshStandardMaterial({
      map: hudTexture,
      emissiveMap: hudTexture,
      emissive: 0xffffff,
      emissiveIntensity: 0.95,
      roughness: 0.18,
    });
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.56, 0.23), screenMat);
    screen.position.set(0, 0, -0.058);
    screen.rotation.y = Math.PI;
    consoleGroup.add(screen);

    g.add(consoleGroup);

    parent.add(g);
  }

  private agregarBicicletaSpinningPro(
    parent: THREE.Group,
    x: number,
    y: number,
    z: number,
    steelMat: THREE.Material,
    chromeMat: THREE.Material,
    leatherMat: THREE.Material,
    orangeMat: THREE.Material,
  ): void {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    // Mirando hacia -X (hacia la vista panorámica del loft)
    g.rotation.y = -Math.PI / 2;

    // Estabilizadores delantero y trasero
    g.add(this.cajaBiselada(0.46, 0.045, 0.07, steelMat, 0, 0.025, 0.44));
    g.add(this.cajaBiselada(0.46, 0.045, 0.07, steelMat, 0, 0.025, -0.44));
    g.add(this.cajaBiselada(0.06, 0.045, 0.88, steelMat, 0, 0.03, 0));

    // Disco de inercia delantero (Flywheel cromado con aro perimetral naranja)
    const flywheel = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.042, 28), chromeMat);
    flywheel.rotation.z = Math.PI / 2;
    flywheel.position.set(0, 0.29, 0.36);
    flywheel.castShadow = true;
    g.add(flywheel);

    const flyRim = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.016, 10, 28), orangeMat);
    flyRim.rotation.y = Math.PI / 2;
    flyRim.position.set(0.024, 0.29, 0.36);
    g.add(flyRim);

    // Cuadro en V + carenado de transmisión por correa
    const downTube = this.cajaBiselada(0.055, 0.68, 0.075, steelMat, 0, 0.38, 0.16);
    downTube.rotation.x = 0.52;
    downTube.castShadow = true;
    g.add(downTube);

    const seatTube = this.cajaBiselada(0.055, 0.66, 0.07, steelMat, 0, 0.38, -0.16);
    seatTube.rotation.x = -0.34;
    seatTube.castShadow = true;
    g.add(seatTube);

    const beltGuard = this.cajaBiselada(0.065, 0.18, 0.42, orangeMat, 0.035, 0.22, -0.05);
    g.add(beltGuard);

    // Tija cromada + sillín deportivo
    const seatPost = this.cajaSimple(0.036, 0.26, 0.04, chromeMat, 0, 0.75, -0.27);
    seatPost.rotation.x = -0.34;
    g.add(seatPost);

    const saddle = new THREE.Mesh(new RoundedBoxGeometry(0.15, 0.055, 0.26, 3, 0.02), leatherMat);
    saddle.position.set(0, 0.87, -0.31);
    g.add(saddle);

    // Mástil de manubrio + cuernos de ruta + pantalla compacta
    const headPost = this.cajaSimple(0.038, 0.34, 0.042, chromeMat, 0, 0.78, 0.31);
    headPost.rotation.x = 0.28;
    g.add(headPost);

    const handlebar = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.42, 12), leatherMat);
    handlebar.rotation.z = Math.PI / 2;
    handlebar.position.set(0, 0.94, 0.35);
    g.add(handlebar);

    [-0.19, 0.19].forEach((hx) => {
      const horn = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.18, 10), leatherMat);
      horn.rotation.x = 1.25;
      horn.position.set(hx, 0.97, 0.42);
      g.add(horn);
    });

    // Bielas y pedales
    [-0.08, 0.08].forEach((px, idx) => {
      const dir = idx === 0 ? 1 : -1;
      g.add(this.cajaSimple(0.02, 0.15, 0.03, chromeMat, px, 0.2 + dir * 0.05, -0.05));
      g.add(this.cajaSimple(0.08, 0.022, 0.09, steelMat, px + (idx === 0 ? -0.04 : 0.04), 0.2 + dir * 0.12, -0.05));
    });

    parent.add(g);
  }

  private agregarZonaFuncionalPro(
    parent: THREE.Group,
    steelMat: THREE.Material,
    chromeMat: THREE.Material,
    rubberMat: THREE.Material,
    orangeMat: THREE.Material,
    emeraldMat: THREE.Material,
    blueMat: THREE.Material,
    woodMat: THREE.Material,
  ): void {
    // Pista de césped sintético con marcas de yardaje
    const turfTex = this.crearTexturaPistaTurf();
    const turfMat = new THREE.MeshStandardMaterial({
      map: turfTex,
      roughness: 0.92,
      metalness: 0.04,
    });
    const turf = new THREE.Mesh(new RoundedBoxGeometry(1.98, 0.028, 2.74, 2, 0.01), turfMat);
    turf.position.set(1.95, 0.094, 1.54);
    turf.receiveShadow = true;
    parent.add(turf);

    // Anclaje + Cuerdas de Batalla (Battle Ropes) onduladas sobre el césped
    const anchor = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.014, 8, 16), steelMat);
    anchor.position.set(1.78, 0.12, 0.28);
    parent.add(anchor);

    [-1, 1].forEach((side) => {
      const pts: THREE.Vector3[] = [];
      for (let s = 0; s <= 12; s++) {
        const t = s / 12;
        const rx = 1.78 + side * (0.04 + t * 0.18) + Math.sin(t * Math.PI * 3.5 + side) * 0.065;
        const rz = 0.3 + t * 1.68;
        const ry = 0.128 + Math.abs(Math.sin(t * Math.PI * 4)) * 0.045 * (1 - t * 0.35);
        pts.push(new THREE.Vector3(rx, ry, rz));
      }
      const curve = new THREE.CatmullRomCurve3(pts);
      const ropeGeo = new THREE.TubeGeometry(curve, 36, 0.019, 8, false);
      const rope = new THREE.Mesh(ropeGeo, rubberMat);
      rope.castShadow = true;
      parent.add(rope);

      // Empuñadura termoencogible naranja en el extremo
      const last = pts[pts.length - 1];
      const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.14, 10), orangeMat);
      tip.rotation.x = Math.PI / 2;
      tip.position.copy(last);
      parent.add(tip);
    });

    // 2 Cajones Pliométricos (Plyo Boxes) de madera y borde reforzado
    const box24 = this.cajaBiselada(0.52, 0.56, 0.46, woodMat, 2.58, 0.38, 2.48);
    box24.castShadow = true;
    parent.add(box24);
    parent.add(this.cajaSimple(0.53, 0.03, 0.47, steelMat, 2.58, 0.65, 2.48));

    const box18 = this.cajaBiselada(0.46, 0.4, 0.42, orangeMat, 2.58, 0.3, 1.88);
    box18.castShadow = true;
    parent.add(box18);

    // Rack de Kettlebells de Competición (3 niveles de color)
    const kbStand = new THREE.Group();
    kbStand.position.set(1.22, 0.1, 2.52);
    kbStand.add(this.cajaBiselada(0.82, 0.04, 0.28, steelMat, 0, 0.28, 0));
    kbStand.add(this.cajaBiselada(0.06, 0.28, 0.26, steelMat, -0.36, 0.14, 0));
    kbStand.add(this.cajaBiselada(0.06, 0.28, 0.26, steelMat, 0.36, 0.14, 0));

    const kbColors = [emeraldMat, blueMat, orangeMat];
    [-0.24, 0, 0.24].forEach((kx, idx) => {
      const r = 0.082 + idx * 0.01;
      const body = new THREE.Mesh(new THREE.SphereGeometry(r, 18, 16), rubberMat);
      body.position.set(kx, 0.3 + r * 0.85, 0);
      body.castShadow = true;
      kbStand.add(body);

      const ring = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.96, r * 0.96, 0.025, 18), kbColors[idx]);
      ring.position.set(kx, 0.3 + r * 1.15, 0);
      kbStand.add(ring);

      const kbHandle = new THREE.Mesh(new THREE.TorusGeometry(r * 0.62, 0.014, 10, 18, Math.PI * 1.15), chromeMat);
      kbHandle.rotation.z = -0.22;
      kbHandle.position.set(kx, 0.3 + r * 1.62, 0);
      kbStand.add(kbHandle);
    });
    parent.add(kbStand);

    // Estación de Movilidad & Yoga (Mat + Foam Roller)
    const yogaMat = new THREE.Mesh(new RoundedBoxGeometry(0.62, 0.022, 1.48, 2, 0.008), emeraldMat);
    yogaMat.position.set(0.32, 0.092, 0.92);
    yogaMat.receiveShadow = true;
    parent.add(yogaMat);

    const roller = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.068, 0.44, 18), orangeMat);
    roller.rotation.z = Math.PI / 2;
    roller.position.set(0.32, 0.17, 0.34);
    roller.castShadow = true;
    parent.add(roller);
  }

  private aplicarTexturaLetreroEnMesh(targetMesh: THREE.Mesh, flipGlbY = true): void {
    if (typeof document === 'undefined') return;
    const tex = this.crearTexturaLetrero(this.nombreSede);
    if (flipGlbY) {
      // PlaneGeometry exportada en GLB conserva sus UVs de Three.js (flipY = true)
      tex.flipY = true;
    }
    this.generatedTextures.push(tex);
    targetMesh.material = new THREE.MeshStandardMaterial({
      map: tex,
      emissiveMap: tex,
      emissive: 0xffffff,
      emissiveIntensity: 0.96,
      roughness: 0.22,
    });
  }

  private actualizarLetreroPared(): void {
    if (typeof document === 'undefined') return;
    if (this.glbDynamicSignMesh) {
      this.aplicarTexturaLetreroEnMesh(this.glbDynamicSignMesh, true);
    }
    if (!this.signMesh) return;
    const oldTex = this.signTexture;
    const newTex = this.crearTexturaLetrero(this.nombreSede);
    this.signTexture = newTex;

    const mat = this.signMesh.material as THREE.MeshStandardMaterial;
    mat.map = newTex;
    mat.emissiveMap = newTex;
    mat.needsUpdate = true;
    oldTex?.dispose();
  }

  private crearTexturaCaucho(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#141720';
    ctx.fillRect(0, 0, 512, 512);

    // Moteado EPDM sutil de caucho de gimnasio comercial
    for (let i = 0; i < 2400; i++) {
      const px = (i * 73) % 512;
      const py = (i * 137 + Math.floor(i / 7) * 29) % 512;
      ctx.fillStyle = i % 9 === 0 ? 'rgba(255, 102, 51, 0.22)' : 'rgba(148, 163, 184, 0.11)';
      ctx.fillRect(px, py, 2, 2);
    }

    // Juntas limpias de baldosas de caucho (2x2 por repetición)
    ctx.strokeStyle = 'rgba(7, 9, 14, 0.72)';
    ctx.lineWidth = 3;
    ctx.strokeRect(1.5, 1.5, 253, 253);
    ctx.strokeRect(257.5, 1.5, 253, 253);
    ctx.strokeRect(1.5, 257.5, 253, 253);
    ctx.strokeRect(257.5, 257.5, 253, 253);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(5, 5);
    tex.anisotropy = 8;
    this.generatedTextures.push(tex);
    return tex;
  }

  private crearTexturaMaderaPlataforma(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#8b5a36';
    ctx.fillRect(0, 0, 256, 512);

    const planks = 8;
    const pw = 256 / planks;
    for (let i = 0; i < planks; i++) {
      ctx.fillStyle = i % 2 === 0 ? 'rgba(255, 224, 190, 0.07)' : 'rgba(30, 16, 8, 0.1)';
      ctx.fillRect(i * pw, 0, pw - 1, 512);
      ctx.strokeStyle = 'rgba(40, 20, 10, 0.35)';
      ctx.strokeRect(i * pw, 0, pw, 512);
    }

    // Logo sutil central en la tarima
    ctx.fillStyle = 'rgba(20, 24, 33, 0.55)';
    ctx.font = '800 22px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('THF LIFT', 128, 264);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    this.generatedTextures.push(tex);
    return tex;
  }

  private crearTexturaPistaTurf(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 768;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#0f3d2e';
    ctx.fillRect(0, 0, 512, 768);

    // Textura fina de césped sintético
    for (let i = 0; i < 3200; i++) {
      const gx = (i * 97) % 512;
      const gy = (i * 151 + Math.floor(i / 11) * 43) % 768;
      ctx.fillStyle = i % 3 === 0 ? 'rgba(16, 185, 129, 0.14)' : 'rgba(6, 38, 28, 0.32)';
      ctx.fillRect(gx, gy, 2, 4);
    }

    // Carriles blancos y marcas de distancia
    ctx.strokeStyle = 'rgba(248, 250, 252, 0.72)';
    ctx.lineWidth = 6;
    ctx.strokeRect(28, 28, 456, 712);

    ctx.fillStyle = 'rgba(248, 250, 252, 0.78)';
    ctx.font = '800 34px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';

    const marks = [
      { y: 175, label: '15' },
      { y: 384, label: '10' },
      { y: 593, label: '05' },
    ];
    marks.forEach((m) => {
      ctx.fillRect(28, m.y - 3, 72, 6);
      ctx.fillRect(412, m.y - 3, 72, 6);
      ctx.fillText(m.label, 256, m.y + 12);
    });

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    this.generatedTextures.push(tex);
    return tex;
  }

  private crearTexturaLetrero(nombre: string): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#0d1018';
    ctx.fillRect(0, 0, 1024, 256);

    ctx.strokeStyle = '#ff5520';
    ctx.lineWidth = 8;
    ctx.strokeRect(14, 14, 996, 228);

    // Punto luminoso de marca
    ctx.fillStyle = '#ff5520';
    ctx.beginPath();
    ctx.arc(84, 128, 18, 0, Math.PI * 2);
    ctx.fill();

    const titulo = (nombre || 'THE HOUSE FIT').trim().toUpperCase().slice(0, 24);
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 66px system-ui, -apple-system, Segoe UI, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(titulo, 128, 134);

    ctx.fillStyle = '#ff8a65';
    ctx.font = '700 24px system-ui, -apple-system, Segoe UI, sans-serif';
    const subtitulo =
      this.modoEscena === 'recepcion'
        ? 'RECEPCIÓN  •  TARIFAS & ACCESO QR'
        : 'PERFORMANCE SANCTUARY  •  3D STUDIO';
    ctx.fillText(subtitulo, 130, 182);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return tex;
  }

  private crearTexturaConsolaCardio(vel: string, bpm: string, pace: string): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 220;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#0b0e16';
    ctx.fillRect(0, 0, 512, 220);

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
    ctx.lineWidth = 4;
    ctx.strokeRect(8, 8, 496, 204);

    // Barras de intervalo en naranja y cian
    for (let i = 0; i < 12; i++) {
      const bh = 28 + ((i * 19) % 68);
      ctx.fillStyle = i > 7 ? '#ff5520' : '#38bdf8';
      ctx.fillRect(30 + i * 22, 178 - bh, 14, bh);
    }

    ctx.fillStyle = '#f8fafc';
    ctx.font = '800 44px system-ui, sans-serif';
    ctx.fillText(vel + ' km/h', 300, 92);

    ctx.fillStyle = '#ff6a33';
    ctx.font = '700 28px system-ui, sans-serif';
    ctx.fillText('♥ ' + bpm + ' BPM', 300, 138);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 22px system-ui, sans-serif';
    ctx.fillText('PACE ' + pace, 300, 174);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    this.generatedTextures.push(tex);
    return tex;
  }

  private cajaBiselada(
    w: number,
    h: number,
    d: number,
    mat: THREE.Material,
    x: number,
    y: number,
    z: number,
  ): THREE.Mesh {
    const radius = Math.min(w, h, d) * 0.16;
    const mesh = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 2, radius), mat);
    mesh.position.set(x, y, z);
    return mesh;
  }

  private cajaSimple(
    w: number,
    h: number,
    d: number,
    mat: THREE.Material,
    x: number,
    y: number,
    z: number,
  ): THREE.Mesh {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    mesh.position.set(x, y, z);
    return mesh;
  }
}
