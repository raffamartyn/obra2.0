import type { Cobro } from "./types";
import { convertirNumero, parseCSV } from "./csv";

const URL_COBROS =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRRSl2v5S8yfnYRJ8bUwIge1ANWsI_N5qPNmaFRP5yj9wQlmdQkWF1NQp79cVdGwoSjQA4T-VgQeW2X/pub?gid=1348607482&single=true&output=csv";

export default async function apicobro(): Promise<Cobro[]> {
  try {
    const respuesta = await fetch(URL_COBROS, {
      cache: "no-store",
    });

    if (!respuesta.ok) {
      throw new Error(
        `Error al obtener cobros: ${respuesta.status}`
      );
    }

    const texto = await respuesta.text();
    const filas = parseCSV(texto);

    if (filas.length <= 1) {
      return [];
    }

    return filas
      .slice(1)
      .map((fila): Cobro => ({
        ID_COBROS: fila[0] ?? "",
        ID_OBRA: fila[1] ?? "",
        FECHA: fila[2] ?? "",
        MONTO: convertirNumero(fila[3] ?? ""),
        COMPROBANTE: fila[4] ?? "",
      }))
      .filter((cobro) => cobro.ID_COBROS !== "");
  } catch (error) {
    console.error("Error en apicobro:", error);
    return [];
  }
}