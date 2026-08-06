import type { HonorarioPresupuesto } from "./types";
import { parseCSV } from "./csv";

const URL_HONORARIOS =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRRSl2v5S8yfnYRJ8bUwIge1ANWsI_N5qPNmaFRP5yj9wQlmdQkWF1NQp79cVdGwoSjQA4T-VgQeW2X/pub?gid=1487741729&single=true&output=csv";

export default async function apihonorariopresupuesto(): Promise<
  HonorarioPresupuesto[]
> {
  try {
    const respuesta = await fetch(
      URL_HONORARIOS,
      {
        cache: "no-store",
      }
    );

    if (!respuesta.ok) {
      throw new Error(
        `Error al obtener honorarios: ${respuesta.status}`
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
        (fila): HonorarioPresupuesto => ({
          ID_HONORARIO_PRESUPUESTO:
            obtener(
              fila,
              "ID_HONORARIO_PRESUPUESTO"
            ),

          ID_PRESUPUESTO: obtener(
            fila,
            "ID_PRESUPUESTO"
          ),

          ID_HONORARIO_CONFIG: obtener(
            fila,
            "ID_HONORARIO_CONFIG"
          ),

          NOMBRE_HONORARIO: obtener(
            fila,
            "NOMBRE_HONORARIO"
          ),

          /*
           * Se conserva como texto.
           * Puede venir como "12%", "0.12" o "12".
           */
          PORCENTAJE: obtener(
            fila,
            "PORCENTAJE"
          ),

          BASE_CALCULO_USD:
            convertirNumero(
              obtener(
                fila,
                "BASE_CALCULO_USD"
              )
            ),

          MONTO_USD: convertirNumero(
            obtener(fila, "MONTO_USD")
          ),
        })
      )
      .filter(
        (honorario) =>
          honorario
            .ID_HONORARIO_PRESUPUESTO !==
          ""
      );
  } catch (error) {
    console.error(
      "Error en apihonorariopresupuesto:",
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