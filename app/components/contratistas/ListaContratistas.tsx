"use client";

import { useMemo, useState } from "react";

import ContratistaCard from "@/app/components/contratistas/ContratistaCard";

type ContratistaResumen = {
  ID_CONTRATISTA: string;
  NOMBRE: string;
  CUIL: string;
  TELEFONO: string;
  cantidadContratos: number;
  cantidadObras: number;
  totalContratado: number;
  totalPagado: number;
};

type ListaContratistasProps = {
  contratistas: ContratistaResumen[];
};

export default function ListaContratistas({
  contratistas,
}: ListaContratistasProps) {
  const [
    contratistaSeleccionado,
    setContratistaSeleccionado,
  ] = useState("todos");

  const contratistasOrdenados = useMemo(() => {
    return [...contratistas].sort((a, b) =>
      a.NOMBRE.localeCompare(b.NOMBRE, "es")
    );
  }, [contratistas]);

  const contratistasFiltrados = useMemo(() => {
    if (contratistaSeleccionado === "todos") {
      return contratistasOrdenados;
    }

    return contratistasOrdenados.filter(
      (contratista) =>
        contratista.ID_CONTRATISTA ===
        contratistaSeleccionado
    );
  }, [
    contratistaSeleccionado,
    contratistasOrdenados,
  ]);

  const limpiarFiltro = () => {
    setContratistaSeleccionado("todos");
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <label className="block w-full sm:max-w-md">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
              Filtrar por contratista
            </span>

            <select
              value={contratistaSeleccionado}
              onChange={(evento) =>
                setContratistaSeleccionado(
                  evento.target.value
                )
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
            >
              <option value="todos">
                Todos los contratistas
              </option>

              {contratistasOrdenados.map(
                (contratista) => (
                  <option
                    key={
                      contratista.ID_CONTRATISTA
                    }
                    value={
                      contratista.ID_CONTRATISTA
                    }
                  >
                    {contratista.NOMBRE}
                  </option>
                )
              )}
            </select>
          </label>

          <div className="flex items-center gap-4">
            <p className="text-sm text-slate-500">
              Mostrando{" "}
              <span className="font-bold text-slate-900">
                {contratistasFiltrados.length}
              </span>{" "}
              {contratistasFiltrados.length === 1
                ? "contratista"
                : "contratistas"}
            </p>

            <button
              type="button"
              onClick={limpiarFiltro}
              disabled={
                contratistaSeleccionado ===
                "todos"
              }
              className="rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>

      {contratistasFiltrados.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <h2 className="text-lg font-bold text-slate-900">
            No se encontró el contratista
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Probá seleccionando otro contratista.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
          {contratistasFiltrados.map(
            (contratista) => (
              <ContratistaCard
                key={
                  contratista.ID_CONTRATISTA
                }
                idContratista={
                  contratista.ID_CONTRATISTA
                }
                nombre={contratista.NOMBRE}
                cuil={contratista.CUIL}
                telefono={
                  contratista.TELEFONO
                }
                cantidadContratos={
                  contratista.cantidadContratos
                }
                cantidadObras={
                  contratista.cantidadObras
                }
                totalContratado={
                  contratista.totalContratado
                }
                totalPagado={
                  contratista.totalPagado
                }
              />
            )
          )}
        </div>
      )}
    </div>
  );
}