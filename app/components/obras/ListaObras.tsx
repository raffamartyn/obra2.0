"use client";

import { useMemo, useState } from "react";

import ObraCard from "@/app/components/obras/ObraCard";

type ObraResumen = {
  ID_OBRA: string;
  NOMBRE: string;
  DIRECCION: string;
  ESTADO: string;
  nombreCliente: string;
  presupuesto: number;
  cobrado: number;
};

type ListaObrasProps = {
  obras: ObraResumen[];
};

export default function ListaObras({
  obras,
}: ListaObrasProps) {
  const [obraSeleccionada, setObraSeleccionada] =
    useState("todas");

  const obrasOrdenadas = useMemo(() => {
    return [...obras].sort((a, b) =>
      a.NOMBRE.localeCompare(b.NOMBRE, "es")
    );
  }, [obras]);

  const obrasFiltradas = useMemo(() => {
    if (obraSeleccionada === "todas") {
      return obrasOrdenadas;
    }

    return obrasOrdenadas.filter(
      (obra) =>
        obra.ID_OBRA === obraSeleccionada
    );
  }, [obraSeleccionada, obrasOrdenadas]);

  const limpiarFiltro = () => {
    setObraSeleccionada("todas");
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <label className="block w-full sm:max-w-md">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
              Filtrar por obra
            </span>

            <select
              value={obraSeleccionada}
              onChange={(evento) =>
                setObraSeleccionada(
                  evento.target.value
                )
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
            >
              <option value="todas">
                Todas las obras
              </option>

              {obrasOrdenadas.map((obra) => (
                <option
                  key={obra.ID_OBRA}
                  value={obra.ID_OBRA}
                >
                  {obra.NOMBRE}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-center gap-4">
            <p className="text-sm text-slate-500">
              Mostrando{" "}
              <span className="font-bold text-slate-900">
                {obrasFiltradas.length}
              </span>{" "}
              {obrasFiltradas.length === 1
                ? "obra"
                : "obras"}
            </p>

            <button
              type="button"
              onClick={limpiarFiltro}
              disabled={
                obraSeleccionada === "todas"
              }
              className="rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>

      {obrasFiltradas.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <h2 className="text-lg font-bold text-slate-900">
            No se encontró la obra
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Probá seleccionando otra obra.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
          {obrasFiltradas.map((obra) => (
            <ObraCard
              key={obra.ID_OBRA}
              idObra={obra.ID_OBRA}
              nombre={obra.NOMBRE}
              cliente={obra.nombreCliente}
              direccion={obra.DIRECCION}
              estado={obra.ESTADO}
              presupuesto={obra.presupuesto}
              cobrado={obra.cobrado}
            />
          ))}
        </div>
      )}
    </div>
  );
}