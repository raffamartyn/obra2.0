import type { Obra } from "./types";
import { parseCSV } from "./csv";

const URL_OBRAS =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRRSl2v5S8yfnYRJ8bUwIge1ANWsI_N5qPNmaFRP5yj9wQlmdQkWF1NQp79cVdGwoSjQA4T-VgQeW2X/pub?gid=1843835080&single=true&output=csv";

export default async function apiobra(): Promise<Obra[]> {
  try {
    const respuesta = await fetch(URL_OBRAS, {
      cache: "no-store",
    });

    if (!respuesta.ok) {
      throw new Error(
        `Error al obtener obras: ${respuesta.status}`
      );
    }

    const texto = await respuesta.text();
    const filas = parseCSV(texto);

    if (filas.length <= 1) {
      return [];
    }

    return filas
      .slice(1)
      .map((fila): Obra => ({
        ID_OBRA: fila[0] ?? "",
        ID_CLIENTE: fila[1] ?? "",
        NOMBRE: fila[2] ?? "",
        DIRECCION: fila[3] ?? "",
        FECHA: fila[4] ?? "",
        ESTADO: fila[5] ?? "",
        DOCUMENTO: fila[6] ?? "",
      }))
      .filter((obra) => obra.ID_OBRA !== "");
  } catch (error) {
    console.error("Error en apiobra:", error);
    return [];
  }
}