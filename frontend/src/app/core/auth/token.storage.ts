const TOKEN_KEY = 'quindiostay_token';
const USER_KEY = 'quindiostay_user';

export function guardarToken(token: string): void {
  try {
    sessionStorage.setItem(TOKEN_KEY, token);
  } catch (e) {
    console.error('Error guardando token en sessionStorage', e);
  }
}

export function obtenerToken(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function eliminarToken(): void {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  } catch (e) {
    console.error('Error limpiando sesión', e);
  }
}

export function guardarUsuario(usuario: any): void {
  try {
    sessionStorage.setItem(USER_KEY, JSON.stringify(usuario));
  } catch (e) {
    console.error('Error guardando usuario en sessionStorage', e);
  }
}

export function obtenerUsuario(): any | null {
  try {
    const data = sessionStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}
