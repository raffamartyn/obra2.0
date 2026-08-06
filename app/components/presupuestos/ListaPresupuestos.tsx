import PresupuestoCard from "./PresupuestoCard";

import type { PresupuestoCliente } from "@/app/api/types";

type ListaPresupuestosProps = {
  presupuestos: PresupuestoCliente[];
};

export default function ListaPresupuestos({
  presupuestos,
}: ListaPresupuestosProps) {
  if (presupuestos.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
        <p className="text-lg font-semibold text-slate-700">
          No hay presupuestos registrados
        </p>

        <p className="mt-2 text-sm text-slate-500">
          Los presupuestos creados en AppSheet aparecerán acá.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {presupuestos.map((presupuesto) => (
        <PresupuestoCard
          key={presupuesto.ID_PRESUPUESTO}
          presupuesto={presupuesto}
        />
      ))}
    </div>
  );
}