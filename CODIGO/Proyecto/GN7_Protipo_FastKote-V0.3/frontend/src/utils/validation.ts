/**
 * Valida si una identificación es una cédula ecuatoriana válida o un RUC ecuatoriano válido.
 * Utiliza el algoritmo de validación del último dígito (módulo 10 para personas naturales y módulo 11 para jurídicas/públicas).
 */
export function validateEcuadorianId(id: string): boolean {
  if (!/^\d+$/.test(id)) return false;
  if (id.length !== 10 && id.length !== 13) return false;

  const province = parseInt(id.substring(0, 2), 10);
  // Las provincias en Ecuador van de 01 a 24, más la 30 para ecuatorianos registrados en el exterior.
  if (province < 1 || (province > 24 && province !== 30)) return false;

  if (id.length === 13 && !id.endsWith('001')) {
    return false;
  }

  const thirdDigit = parseInt(id[2], 10);

  if (thirdDigit < 6) {
    // Persona natural (Cédula o RUC natural)
    const cedula = id.substring(0, 10);
    const digits = cedula.split('').map(Number);
    const checkDigit = digits[9];
    let sum = 0;
    const coefficients = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    for (let i = 0; i < 9; i++) {
      let value = digits[i] * coefficients[i];
      if (value >= 10) value -= 9;
      sum += value;
    }
    const remainder = sum % 10;
    const calculatedCheck = remainder === 0 ? 0 : 10 - remainder;
    return calculatedCheck === checkDigit;
  } else if (thirdDigit === 9) {
    // Persona jurídica privada (RUC de 13 dígitos)
    if (id.length !== 13) return false;
    const digits = id.split('').map(Number);
    const checkDigit = digits[9];
    const coefficients = [4, 3, 2, 5, 4, 3, 2, 1, 0];
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += digits[i] * coefficients[i];
    }
    const remainder = sum % 11;
    const calculatedCheck = remainder === 0 ? 0 : 11 - remainder;
    return calculatedCheck === checkDigit;
  } else if (thirdDigit === 6) {
    // Institución pública (RUC de 13 dígitos)
    if (id.length !== 13) return false;
    const digits = id.split('').map(Number);
    const checkDigit = digits[8];
    const coefficients = [3, 2, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < 8; i++) {
      sum += digits[i] * coefficients[i];
    }
    const remainder = sum % 11;
    const calculatedCheck = remainder === 0 ? 0 : 11 - remainder;
    return calculatedCheck === checkDigit;
  }

  return false;
}

/**
 * Remueve números y caracteres especiales, permitiendo solo letras, acentos en español, ñ y espacios.
 */
export function cleanName(val: string): string {
  return val.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '');
}

/**
 * Remueve cualquier caracter que no sea dígito.
 */
export function cleanDigits(val: string): string {
  return val.replace(/[^0-9]/g, '');
}
