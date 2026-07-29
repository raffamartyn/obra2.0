import Link from "next/link";

type ContratistaCardProps = {
  idContratista: string;
  nombre: string;
  cuil: string;
  telefono: string;
  cantidadContratos: number;
  cantidadObras: number;
  totalContratado: number;
  totalPagado: number;
};

export default function ContratistaCard({
  idContratista,
  nombre,
  cuil,
  telefono,
  cantidadContratos,
  cantidadObras,
  totalContratado,
  totalPagado,
}: ContratistaCardProps) {
  const saldoPendiente = totalContratado - totalPagado;

  const porcentajePagado =
    totalContratado > 0
      ? Math.min((totalPagado / totalContratado) * 100, 100)
      : 0;

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="border-b border-slate-100 p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Contratista
        </p>

        <h2 className="mt-1 text-xl font-bold text-slate-900">
          {nombre}
        </h2>

        <div className="mt-3 space-y-1 text-sm text-slate-500">
          <p>
            CUIL:{" "}
            <span className="font-medium text-slate-700">
              {cuil || "Sin CUIL"}
            </span>
          </p>

          <p>
            Teléfono:{" "}
            <span className="font-medium text-slate-700">
              {telefono || "Sin teléfono"}
            </span>
          </p>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Contratos
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {cantidadContratos}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Obras
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {cantidadObras}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Contratado
            </p>

            <p className="mt-2 text-lg font-bold text-slate-900">
              {formatearDinero(totalContratado)}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Pagado
            </p>

            <p className="mt-2 text-lg font-bold text-emerald-700">
              {formatearDinero(totalPagado)}
            </p>
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-slate-600">
              Avance de pago
            </span>

            <span className="font-semibold text-slate-900">
              {porcentajePagado.toFixed(0)}%
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-slate-900 transition-all"
              style={{
                width: `${porcentajePagado}%`,
              }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
          <span className="text-sm font-medium text-slate-500">
            Saldo pendiente
          </span>

          <span
            className={`font-bold ${
              saldoPendiente > 0
                ? "text-amber-700"
                : "text-emerald-700"
            }`}
          >
            {formatearDinero(saldoPendiente)}
          </span>
        </div>

        <Link
          href={`/contratistas/${idContratista}`}
          className="block rounded-xl bg-slate-900 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          Ver detalle
        </Link>
      </div>
    </article>
  );
}

function formatearDinero(valor: number) {
  return new Intl.NumberFormat("es-US", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(valor);
}