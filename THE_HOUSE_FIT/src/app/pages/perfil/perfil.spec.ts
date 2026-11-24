import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PerfilComponent } from './perfil';
import { AuthService } from '../../services/auth';

describe('PerfilComponent', () => {
  let component: PerfilComponent;
  let fixture: ComponentFixture<PerfilComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerfilComponent],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            obtenerUsuario: () => ({
              id: 23,
              nombre: 'Daniel Suarez',
              correo: 'pilodaniel4000@gmail.com',
              rol: 'Usuario',
              fotoPerfil: '',
            }),
            obtenerFotoPerfil: () => '',
            sincronizarPerfil: () => Promise.resolve(null),
            actualizarPerfil: (_cambios: { nombre?: string; fotoPerfil?: string }) =>
              Promise.resolve({
                error: null,
                usuario: {
                  id: 23,
                  nombre: 'Daniel Suarez',
                  correo: 'pilodaniel4000@gmail.com',
                  rol: 'Usuario',
                  fotoPerfil: _cambios.fotoPerfil ?? '',
                },
              }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PerfilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load user profile data', () => {
    expect(component).toBeTruthy();
    expect(component.nombre).toBe('Daniel Suarez');
    expect(component.rol).toBe('Usuario');
  });

  it('allows selecting a preset avatar and saving it', async () => {
    const preset = component.presets[0];
    await component.elegirPreset(preset);
    expect(component.fotoPerfil).toBe(preset.dataUrl);
    expect(component.mensajeExito).toContain(preset.etiqueta);
  });
});

