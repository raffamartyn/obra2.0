import Link from "next/link";

type ObraCardProps = {
  idObra: string;
  nombre: string;
  cliente: string;
  direccion: string;
  estado: string;
  presupuesto: number;
  cobrado: number;
};

function formatearDinero(valor: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(valor);
}

function obtenerColorEstado(estado: string) {
  const estadoNormalizado = estado.trim().toLowerCase();

  if (
    estadoNormalizado === "finalizada" ||
    estadoNormalizado === "finalizado"
  ) {
    return "bg-emerald-100 text-emerald-700";
  }

  if (
    estadoNormalizado === "en ejecución" ||
    estadoNormalizado === "en ejecucion" ||
    estadoNormalizado === "activa" ||
    estadoNormalizado === "activo"
  ) {
    return "bg-blue-100 text-blue-700";
  }

  if (
    estadoNormalizado === "pausada" ||
    estadoNormalizado === "pausado"
  ) {
    return "bg-amber-100 text-amber-700";
  }

  if (
    estadoNormalizado === "cancelada" ||
    estadoNormalizado === "cancelado"
  ) {
    return "bg-red-100 text-red-700";
  }

  return "bg-slate-100 text-slate-700";
}

export default function ObraCard({
  idObra,
  nombre,
  cliente,
  direccion,
  estado,
  presupuesto,
  cobrado,
}: ObraCardProps) {
  const saldo = presupuesto - cobrado;

  const porcentajeCobrado =
    presupuesto > 0
      ? Math.min((cobrado / presupuesto) * 100, 100)
      : 0;

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="border-b border-slate-100 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Obra
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900">
              {nombre}
            </h2>

            <p className="mt-2 text-sm font-medium text-slate-600">
              Cliente: {cliente}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              {direccion || "Sin dirección registrada"}
            </p>
          </div>

          <span
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${obtenerColorEstado(
              estado
            )}`}
          >
            {estado || "Sin estado"}
          </span>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Presupuesto
            </p>

            <p className="mt-2 text-lg font-bold text-slate-900">
              {formatearDinero(presupuesto)}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Cobrado
            </p>

            <p className="mt-2 text-lg font-bold text-emerald-700">
              {formatearDinero(cobrado)}
            </p>
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-slate-600">
              Avance de cobro
            </span>

            <span className="font-semibold text-slate-900">
              {porcentajeCobrado.toFixed(0)}%
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-slate-900 transition-all"
              style={{
                width: `${porcentajeCobrado}%`,
              }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
          <span className="text-sm font-medium text-slate-500">
            Saldo por cobrar
          </span>

          <span
            className={`font-bold ${
              saldo > 0 ? "text-amber-700" : "text-emerald-700"
            }`}
          >
            {formatearDinero(saldo)}
          </span>
        </div>

        <Link
          href={`/obras/${idObra}`}
          className="block rounded-xl bg-slate-900 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          Ver detalle
        </Link>
      </div>
    </article>
  );
}