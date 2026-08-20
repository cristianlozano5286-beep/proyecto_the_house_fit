import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  ReactiveFormsModule, 
  FormBuilder, 
  FormGroup, 
  Validators, 
  AbstractControl, 
  ValidationErrors 
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    RouterLink
  ],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  // --- Propiedades requeridas por la plantilla HTML ---
  paso: number = 1;
  codigoVerificacion: string = '';
  mensajeVerificacion: string = '';

  // Definición del formulario con validaciones
  registerForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    correo: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  // Validador personalizado para verificar que las contraseñas coincidan
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  // Método al enviar el formulario inicial (Paso 1)
  onSubmit(): void {
    if (this.registerForm.valid) {
      console.log('Datos de registro:', this.registerForm.value);
      // Cambiamos al paso 2 (verificación de código)
      this.paso = 2;
    } else {
      this.registerForm.markAllAsTouched();
    }
  }

  // --- Método para confirmar el código (Paso 2) ---
  confirmarCodigo(): void {
    if (!this.codigoVerificacion) {
      this.mensajeVerificacion = 'Por favor ingresa el código enviado a tu correo.';
      return;
    }

    // Lógica ficticia o conexión con AuthService
    console.log('Código a verificar:', this.codigoVerificacion);
    this.mensajeVerificacion = 'Código verificado con éxito.';
    
    // Redirección al login tras completar el flujo
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 1500);
  }
}