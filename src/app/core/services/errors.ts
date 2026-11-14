import { HttpErrorResponse } from '@angular/common/http';

/** Saca un mensaje legible de un error HTTP del backend. */
export const errorMessage = (error: unknown, fallback = 'Ocurrió un error. Inténtalo de nuevo.'): string => {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) return 'No hay conexión con el servidor.';
    const message = (error.error as { message?: string } | null)?.message;
    if (message) return message;
  }
  return fallback;
};
