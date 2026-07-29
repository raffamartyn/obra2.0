import type { Cliente } from "./types";
import { parseCSV } from "./csv";

const URL_CLIENTES =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRRSl2v5S8yfnYRJ8bUwIge1ANWsI_N5qPNmaFRP5yj9wQlmdQkWF1NQp79cVdGwoSjQA4T-VgQeW2X/pub?gid=0&single=true&output=csv";

export default async function apicliente(): Promise<Cliente[]> {
  try {
    const respuesta = await fetch(URL_CLIENTES, {
      cache: "no-store",
    });

    if (!respuesta.ok) {
      throw new Error(
        `Error al obtener clientes: ${respuesta.status}`
      );
    }

    const texto = await respuesta.text();
    const filas = parseCSV(texto);

    if (filas.length <= 1) {
      return [];
    }

    return filas
      .slice(1)
      .map((fila): Cliente => ({
        ID_CLIENTE: fila[0] ?? "",
        NOMBRE: fila[1] ?? "",
        CUIT: fila[2] ?? "",
        TELEFONO: fila[3] ?? "",
        CONDICION_IVA: fila[4] ?? "",
      }))
      .filter((cliente) => cliente.ID_CLIENTE !== "");
  } catch (error) {
    console.error("Error en apicliente:", error);
    return [];
  }
}