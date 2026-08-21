
import { Component } from '@angular/core';

//MODULO FORMULARIOS DE ANGULAR
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { AuthService } from '../../services/auth';


@Component({
  selector: 'app-register',
  imports: [FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class RegisterComponent {

  /** FORMULARIO PRINCIPAL DEL COMPONENTE */
  registerForm: FormGroup;

  /** Paso 1: formulario. Paso 2: verificación de correo (HU04, HU05) */
  paso: 1 | 2 = 1;
  codigoIngresado: string = '';
  codigoSimulado: string | null = null;
  mensajeVerificacion: string = '';
  correoRegistrado: string = '';

/* constructor */

  constructor(private router: Router, private fb: FormBuilder, private authService: AuthService) {
    this.registerForm = this.fb.group({
      /**PRIMER CAMPO DEL FORMULARIO */
      nombre: ['',
        [Validators.required,
        Validators.minLength(3)],
      ],

      /**SEGUNDO CAMPO DEL FORMULARIO */
      apellido: ['',
        [Validators.required,
        Validators.minLength(3)],
      ],

      /**TERCER CAMPO DEL FORMULARIO */
      correo: ['',
        [Validators.required,
        Validators.email],
      ],

      /**CUARTO CAMPO DEL FORMULARIO */
      password: ['',
        [Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/)],
      ],

      /**QUINTO CAMPO DEL FORMULARIO */
      confirmarPassword: ['',
        [
          Validators.required
        ]
      ],
    },
    {
      validators: this.passwordsIguales
    });
  }

  /**METODOS GET PAR ACCEDER A LOS DATOS EN EL HTML */

  get nombre(){
    return this.registerForm.get('nombre');
  }

  get apellido() {
    return this.registerForm.get('apellido');
  }

  get correo() {
    return this.registerForm.get('correo');
  }

  get password() {
    return this.registerForm.get('password');
  }

  get confirmarPassword() {
    return this.registerForm.get('confirmarPassword');
  }

  passwordsIguales(form: AbstractControl): ValidationErrors | null {
    const password = form.get('password')?.value;
    const confirmarPassword =form.get('confirmarPassword')?.value;

    if (password !== confirmarPassword) {
      return { passwordsNoCoinciden: true };
    }
    return null;
  }

  //MÉTODO PARA EL REGISTRO DE USUARIO (HU01, HU02, HU03)
  registrarUsuario(): void {

    /**VALIDACION SI EL FORMULARIO ES INVALIDO */
    if (this.registerForm.invalid) {

      /**MARCAR LOS CAMPOS QUE MUESTRAN ERROR */
      this.registerForm.markAllAsTouched();
      return;
    }

    const { nombre, apellido, correo, password } = this.registerForm.value;
    const nombreCompleto = `${nombre} ${apellido}`;

    if (this.authService.correoExiste(correo)) {
      this.mensajeVerificacion = 'Ese correo ya se encuentra registrado.';
      return;
    }

    // Se crea el usuario en el sistema (HU02, HU03) y se envía el código de verificación (HU04, HU05)
    this.authService.registrarUsuario(nombreCompleto, correo, password);
    this.codigoSimulado = this.authService.enviarCodigoVerificacion(correo);
    this.correoRegistrado = correo;
    this.paso = 2;
  }

  // Confirmación del código de verificación (HU04, HU05)
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
