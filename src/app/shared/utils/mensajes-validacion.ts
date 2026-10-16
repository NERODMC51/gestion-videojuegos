import { AbstractControl } from '@angular/forms';


export function mensajeDeError(
  control: AbstractControl | null,
  mensajePatron = 'El formato no es válido.',
): string {
  const errores = control?.errors;
  if (!errores) {
    return '';
  }
  if (errores['required']) return 'Este campo es obligatorio.';
  if (errores['minlength']) return `Mínimo ${errores['minlength'].requiredLength} caracteres.`;
  if (errores['maxlength']) return `Máximo ${errores['maxlength'].requiredLength} caracteres.`;
  if (errores['pattern']) return mensajePatron;
  return 'El valor ingresado no es válido.';
}

export function mensajeConfirmacion(grupo: AbstractControl): string {
  return grupo.hasError('clavesDistintas')
    ? 'Las contraseñas no coinciden.'
    : mensajeDeError(grupo.get('confirmar'));
}
