import type { Pago } from "./types";
import { convertirNumero, parseCSV } from "./csv";

const URL_PAGOS =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRRSl2v5S8yfnYRJ8bUwIge1ANWsI_N5qPNmaFRP5yj9wQlmdQkWF1NQp79cVdGwoSjQA4T-VgQeW2X/pub?gid=603987137&single=true&output=csv";

export default async function apipago(): Promise<Pago[]> {
  try {
    const respuesta = await fetch(URL_PAGOS, {
      cache: "no-store",
    });

    if (!respuesta.ok) {
      throw new Error(
        `Error al obtener pagos: ${respuesta.status}`
      );
    }

    const texto = await respuesta.text();
    const filas = parseCSV(texto);

    if (filas.length <= 1) {
      return [];
    }

    return filas
      .slice(1)
      .map((fila): Pago => ({
        ID_PAGO: fila[0] ?? "",
        ID_CONTRATO: fila[1] ?? "",
        ID_CONTRATISTA: fila[2] ?? "",
        FECHA: fila[3] ?? "",
        MONTO: convertirNumero(fila[4] ?? ""),
        COMPROBANTE: fila[5] ?? "",
      }))
      .filter((pago) => pago.ID_PAGO !== "");
  } catch (error) {
    console.error("Error en apipago:", error);
    return [];
  }
}