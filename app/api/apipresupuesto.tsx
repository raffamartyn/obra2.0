import type { PresupuestoCliente } from "./types";
import { parseCSV } from "./csv";

const URL_PRESUPUESTOS =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRRSl2v5S8yfnYRJ8bUwIge1ANWsI_N5qPNmaFRP5yj9wQlmdQkWF1NQp79cVdGwoSjQA4T-VgQeW2X/pub?gid=1976738453&single=true&output=csv";

export default async function apipresupuesto(): Promise<
  PresupuestoCliente[]
> {
  try {
    const respuesta = await fetch(
      URL_PRESUPUESTOS,
      {
        cache: "no-store",
      }
    );

    if (!respuesta.ok) {
      throw new Error(
        `Error al obtener presupuestos: ${respuesta.status}`
      );
    }

    const texto = await respuesta.text();
    const filas = parseCSV(texto);

    if (filas.length <= 1) {
      return [];
    }

    return filas
      .slice(1)
      .map(
        (fila): PresupuestoCliente => ({
          ID_PRESUPUESTO:
            fila[0] ?? "",
          FECHA: fila[1] ?? "",
          CLIENTE: fila[2] ?? "",
          TELEFONO: fila[3] ?? "",
          EMAIL: fila[4] ?? "",
          DIRECCION_OBRA:
            fila[5] ?? "",
          TIPO_CAMBIO:
            Number(fila[6]) || 0,
          TOTAL_TRABAJOS_USD:
            Number(fila[7]) || 0,
          TOTAL_HONORARIOS_USD:
            Number(fila[8]) || 0,
          TOTAL_USD:
            Number(fila[9]) || 0,
          TOTAL_ARS:
            Number(fila[10]) || 0,
          ESTADO: fila[11] ?? "",
          OBSERVACIONES:
            fila[12] ?? "",
        })
      )
      .filter(
        (presupuesto) =>
          presupuesto.ID_PRESUPUESTO !== ""
      );
  } catch (error) {
    console.error(
      "Error en apipresupuesto:",
      error
    );
    return [];
  }
}