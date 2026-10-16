import { AbstractControl, FormGroupDirective, NgForm, ValidationErrors } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';


export function clavesIguales(grupo: AbstractControl): ValidationErrors | null {
  const clave = grupo.get('clave')?.value;
  const confirmar = grupo.get('confirmar')?.value;
  return clave && confirmar && clave !== confirmar ? { clavesDistintas: true } : null;
}


export class ConfirmacionMatcher implements ErrorStateMatcher {
  isErrorState(control: AbstractControl | null, form: FormGroupDirective | NgForm | null): boolean {
    return !!(control && control.touched && (control.invalid || form?.hasError('clavesDistintas')));
  }
}
