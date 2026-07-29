import type { Contratista } from "./types";
import { parseCSV } from "./csv";

const URL_CONTRATISTAS =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRRSl2v5S8yfnYRJ8bUwIge1ANWsI_N5qPNmaFRP5yj9wQlmdQkWF1NQp79cVdGwoSjQA4T-VgQeW2X/pub?gid=630527835&single=true&output=csv";

export default async function apicontratista(): Promise<
  Contratista[]
> {
  try {
    const respuesta = await fetch(URL_CONTRATISTAS, {
      cache: "no-store",
    });

    if (!respuesta.ok) {
      throw new Error(
        `Error al obtener contratistas: ${respuesta.status}`
      );
    }

    const texto = await respuesta.text();
    const filas = parseCSV(texto);

    if (filas.length <= 1) {
      return [];
    }

    return filas
      .slice(1)
      .map((fila): Contratista => ({
        ID_CONTRATISTA: fila[0] ?? "",
        NOMBRE: fila[1] ?? "",
        CUIL: fila[2] ?? "",
        CBU: fila[3] ?? "",
        TELEFONO: fila[4] ?? "",
        DOMICILIO: fila[5] ?? "",
      }))
      .filter(
        (contratista) => contratista.ID_CONTRATISTA !== ""
      );
  } catch (error) {
    console.error("Error en apicontratista:", error);
    return [];
  }
}