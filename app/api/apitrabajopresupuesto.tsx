import type { TrabajoPresupuesto } from "./types";
import { parseCSV } from "./csv";

const URL_TRABAJOS =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRRSl2v5S8yfnYRJ8bUwIge1ANWsI_N5qPNmaFRP5yj9wQlmdQkWF1NQp79cVdGwoSjQA4T-VgQeW2X/pub?gid=1764581606&single=true&output=csv";

export default async function apitrabajopresupuesto(): Promise<
  TrabajoPresupuesto[]
> {
  try {
    const respuesta = await fetch(URL_TRABAJOS, {
      cache: "no-store",
    });

    if (!respuesta.ok) {
      throw new Error(
        `Error al obtener trabajos: ${respuesta.status}`
      );
    }

    const texto = await respuesta.text();
    const filas = parseCSV(texto);

    if (filas.length <= 1) {
      return [];
    }

    const cabeceras = filas[0].map((cabecera) =>
      String(cabecera ?? "")
        .trim()
        .toUpperCase()
    );

    const posicion = (nombre: string) =>
      cabeceras.indexOf(nombre.toUpperCase());

    const obtener = (
      fila: string[],
      nombre: string
    ) => {
      const indice = posicion(nombre);

      return indice >= 0
        ? fila[indice] ?? ""
        : "";
    };

    return filas
      .slice(1)
      .map(
        (fila): TrabajoPresupuesto => ({
          ID_TRABAJO: obtener(
            fila,
            "ID_TRABAJO"
          ),

          ID_PRESUPUESTO: obtener(
            fila,
            "ID_PRESUPUESTO"
          ),

          ID_TIPO_TRABAJO: obtener(
            fila,
            "ID_TIPO_TRABAJO"
          ),

          NOMBRE_TRABAJO: obtener(
            fila,
            "NOMBRE_TRABAJO"
          ),

          SUPERFICIE_M2: convertirNumero(
            obtener(fila, "SUPERFICIE_M2")
          ),

          PRECIO_M2_USD: convertirNumero(
            obtener(fila, "PRECIO_M2_USD")
          ),

          SUBTOTAL_USD: convertirNumero(
            obtener(fila, "SUBTOTAL_USD")
          ),
        })
      )
      .filter(
        (trabajo) =>
          trabajo.ID_TRABAJO !== ""
      );
  } catch (error) {
    console.error(
      "Error en apitrabajopresupuesto:",
      error
    );

    return [];
  }
}

function convertirNumero(
  valor: unknown
): number {
  if (typeof valor === "number") {
    return Number.isFinite(valor)
      ? valor
      : 0;
  }

  const texto = String(valor ?? "")
    .trim()
    .replace(/USD/gi, "")
    .replace(/\$/g, "")
    .replace(/\s/g, "");

  if (!texto) {
    return 0;
  }

  let normalizado = texto;

  if (
    texto.includes(".") &&
    texto.includes(",")
  ) {
    normalizado = texto
      .replace(/\./g, "")
      .replace(",", ".");
  } else if (texto.includes(",")) {
    normalizado = texto.replace(",", ".");
  } else if (texto.includes(".")) {
    const partes = texto.split(".");

    const pareceSeparadorMiles =
      partes.length > 2 ||
      (partes.length === 2 &&
        partes[1].length === 3);

    if (pareceSeparadorMiles) {
      normalizado = texto.replace(/\./g, "");
    }
  }

  const numero = Number(normalizado);

  return Number.isFinite(numero)
    ? numero
    : 0;
}