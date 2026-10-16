
const ITERACIONES = 100_000;

function aHexadecimal(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function generarSal(): string {
  return aHexadecimal(crypto.getRandomValues(new Uint8Array(16)));
}

export async function hashear(texto: string, sal: string): Promise<string> {
  const codificador = new TextEncoder();
  const material = await crypto.subtle.importKey('raw', codificador.encode(texto), 'PBKDF2', false, [
    'deriveBits',
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: codificador.encode(sal), iterations: ITERACIONES },
    material,
    256,
  );
  return aHexadecimal(new Uint8Array(bits));
}
