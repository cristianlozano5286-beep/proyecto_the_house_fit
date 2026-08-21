import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class RegisterComponent implements OnInit, OnDestroy {

  registerForm: FormGroup;
  paso: 1 | 2 = 1;
  codigoIngresado: string = '';
  codigoSimulado: string | null = null;
  mensajeVerificacion: string = '';
  correoRegistrado: string = '';

  // DEBE ESTAR DECLARADA AQUÍ:
  slideActual: number = 0;
  private intervalId: any;

  constructor(
    private router: Router, 
    private fb: FormBuilder, 
    private authService: AuthService
  ) {
    this.registerForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      apellido: ['', [Validators.required, Validators.minLength(3)]],
      correo: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required, 
        Validators.minLength(8), 
        Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/)
      ]],
      confirmarPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordsIguales
    });
  }

  ngOnInit(): void {
    // Cambia el índice del slider cada 4 segundos para mover la pista
    this.intervalId = setInterval(() => {
      this.slideActual = (this.slideActual + 1) % 3;
    }, 4000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  get nombre() { return this.registerForm.get('nombre'); }
  get apellido() { return this.registerForm.get('apellido'); }
  get correo() { return this.registerForm.get('correo'); }
  get password() { return this.registerForm.get('password'); }
  get confirmarPassword() { return this.registerForm.get('confirmarPassword'); }

  passwordsIguales(form: AbstractControl): ValidationErrors | null {
    const password = form.get('password')?.value;
    const confirmarPassword = form.get('confirmarPassword')?.value;

    if (password !== confirmarPassword) {
      return { passwordsNoCoinciden: true };
    }
    return null;
  }

  registrarUsuario(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const { nombre, apellido, correo, password } = this.registerForm.value;
    const nombreCompleto = `${nombre} ${apellido}`;

    if (this.authService.correoExiste(correo)) {
      this.mensajeVerificacion = 'Ese correo ya se encuentra registrado.';
      return;
    }

    this.authService.registrarUsuario(nombreCompleto, correo, password);
    this.codigoSimulado = this.authService.enviarCodigoVerificacion(correo);
    this.correoRegistrado = correo;
    this.paso = 2;
  }

  confirmarCodigo(): void {
    const valido = this.authService.verificarCodigo(this.correoRegistrado, this.codigoIngresado);
    if (!valido) {
      this.mensajeVerificacion = 'El código ingresado no es válido.';
      return;
    }
    alert('¡Correo verificado! Tu cuenta ha sido creada exitosamente.');
    this.router.navigate(['/login']);
  }
}