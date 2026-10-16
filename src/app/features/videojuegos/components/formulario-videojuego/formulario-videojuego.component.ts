import { Component, effect, inject, input, output } from '@angular/core';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {
  DatosVideojuego,
  GENEROS,
  PLATAFORMAS,
  Plataforma,
  Videojuego,
} from '../../../../core/models/videojuego.model';


function fechaValida(control: AbstractControl<string>): ValidationErrors | null {
  if (!control.value) {
    return null; 
  }
  const fecha = new Date(control.value);
  const anio = fecha.getFullYear();
  return Number.isNaN(fecha.getTime()) || anio < 1970 || anio > 2100
    ? { fechaInvalida: true }
    : null;
}


@Component({
  selector: 'app-formulario-videojuego',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  templateUrl: './formulario-videojuego.component.html',
  styleUrl: './formulario-videojuego.component.css',
})
export class FormularioVideojuegoComponent {
  private readonly fb = inject(NonNullableFormBuilder);

  
  videojuego = input<Videojuego | null>(null);
  guardando = input(false);

  guardar = output<DatosVideojuego>();
  cancelar = output<void>();

  protected readonly generos = GENEROS;
  protected readonly plataformas = PLATAFORMAS;

  protected readonly formulario = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(80)]],
    genero: ['', Validators.required],
    plataforma: ['', Validators.required],
    precio: this.fb.control<number | null>(null, [Validators.required, Validators.min(0)]),
    imagen: [
      '',
      [Validators.required, Validators.maxLength(500), Validators.pattern(/^https?:\/\/\S+$/i)],
    ],
    descripcion: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
    fechaLanzamiento: ['', [Validators.required, fechaValida]],
  });

  constructor() {
    
    effect(() => {
      const videojuego = this.videojuego();
      if (videojuego) {
        this.formulario.patchValue({
          nombre: videojuego.nombre,
          genero: videojuego.genero,
          plataforma: videojuego.plataforma,
          precio: videojuego.precio,
          imagen: videojuego.imagen,
          descripcion: videojuego.descripcion,
          fechaLanzamiento: videojuego.fechaLanzamiento,
        });
      }
    });
  }

  protected enviar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched(); 
      return;
    }
    const valores = this.formulario.getRawValue();
    this.guardar.emit({
      ...valores,
      precio: Number(valores.precio),
      plataforma: valores.plataforma as Plataforma,
    });
  }

  
  protected mensajeError(campo: string): string {
    const errores = this.formulario.get(campo)?.errors;
    if (!errores) {
      return '';
    }
    if (errores['required']) return 'Este campo es obligatorio.';
    if (errores['maxlength']) return `Máximo ${errores['maxlength'].requiredLength} caracteres.`;
    if (errores['minlength']) return `Mínimo ${errores['minlength'].requiredLength} caracteres.`;
    if (errores['min']) return 'El precio no puede ser negativo.';
    if (errores['pattern']) return 'Ingresá una URL válida que empiece con http:// o https://.';
    if (errores['fechaInvalida']) return 'Ingresá una fecha válida (entre 1970 y 2100).';
    return 'El valor ingresado no es válido.';
  }
}
