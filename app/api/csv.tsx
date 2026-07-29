export function parseCSV(texto: string): string[][] {
  const filas: string[][] = [];

  let filaActual: string[] = [];
  let campoActual = "";
  let dentroDeComillas = false;

  const textoLimpio = texto.replace(/\r/g, "");

  for (let i = 0; i < textoLimpio.length; i++) {
    const caracter = textoLimpio[i];
    const siguiente = textoLimpio[i + 1];

    if (caracter === '"') {
      if (dentroDeComillas && siguiente === '"') {
        campoActual += '"';
        i++;
      } else {
        dentroDeComillas = !dentroDeComillas;
      }
    } else if (caracter === "," && !dentroDeComillas) {
      filaActual.push(campoActual.trim());
      campoActual = "";
    } else if (caracter === "\n" && !dentroDeComillas) {
      filaActual.push(campoActual.trim());

      if (filaActual.some((campo) => campo !== "")) {
        filas.push(filaActual);
      }

      filaActual = [];
      campoActual = "";
    } else {
      campoActual += caracter;
    }
  }

  if (campoActual !== "" || filaActual.length > 0) {
    filaActual.push(campoActual.trim());

    if (filaActual.some((campo) => campo !== "")) {
      filas.push(filaActual);
    }
  }

  return filas;
}

export function convertirNumero(valor: string): number {
  if (!valor) return 0;

  let limpio = valor
    .replace(/\$/g, "")
    .replace(/\s/g, "")
    .trim();

  /*
   * Permite interpretar:
   * 1.500.000
   * 1500000
   * 1.500.000,50
   * 1500000.50
   */
  if (limpio.includes(",") && limpio.includes(".")) {
    limpio = limpio.replace(/\./g, "").replace(",", ".");
  } else if (limpio.includes(",")) {
    limpio = limpio.replace(",", ".");
  }

  const numero = Number(limpio);

  return Number.isNaN(numero) ? 0 : numero;
}