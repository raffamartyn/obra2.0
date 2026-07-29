import type { Contrato } from "./types";
import { convertirNumero, parseCSV } from "./csv";

const URL_CONTRATOS =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRRSl2v5S8yfnYRJ8bUwIge1ANWsI_N5qPNmaFRP5yj9wQlmdQkWF1NQp79cVdGwoSjQA4T-VgQeW2X/pub?gid=230530850&single=true&output=csv";

export default async function apicontrato(): Promise<Contrato[]> {
  try {
    const respuesta = await fetch(URL_CONTRATOS, {
      cache: "no-store",
    });

    if (!respuesta.ok) {
      throw new Error(
        `Error al obtener contratos: ${respuesta.status}`
      );
    }

    const texto = await respuesta.text();
    const filas = parseCSV(texto);

    if (filas.length <= 1) {
      return [];
    }

    return filas
      .slice(1)
      .map((fila): Contrato => ({
        ID_CONTRATO: fila[0] ?? "",
        ID_OBRA: fila[1] ?? "",
        ID_CONTRATISTA: fila[2] ?? "",
        TIPO: fila[3] ?? "",
        DESCRIPCION: fila[4] ?? "",
        MONTO: convertirNumero(fila[5] ?? ""),
        FECHA: fila[6] ?? "",
        DOCUMENTO: fila[7] ?? "",
      }))
      .filter((contrato) => contrato.ID_CONTRATO !== "");
  } catch (error) {
    console.error("Error en apicontrato:", error);
    return [];
  }
}