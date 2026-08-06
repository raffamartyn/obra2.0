import Link from "next/link";

import type { PresupuestoCliente } from "@/app/api/types";

type PresupuestoCardProps = {
  presupuesto: PresupuestoCliente;
};

export default function PresupuestoCard({
  presupuesto,
}: PresupuestoCardProps) {
  return (
    <Link
      href={`/presupuestos/${encodeURIComponent(
        presupuesto.ID_PRESUPUESTO
      )}`}
      className="group block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Presupuesto
          </p>

          <h2 className="mt-1 text-xl font-bold text-slate-900 transition group-hover:text-blue-700">
            {presupuesto.CLIENTE ||
              "Cliente sin nombre"}
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {presupuesto.DIRECCION_OBRA ||
              "Sin dirección registrada"}
          </p>
        </div>

        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${obtenerColorEstado(
            presupuesto.ESTADO
          )}`}
        >
          {presupuesto.ESTADO ||
            "Sin estado"}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
        <Dato
          etiqueta="Fecha"
          valor={formatearFecha(
            presupuesto.FECHA
          )}
        />

        <Dato
          etiqueta="Tipo de cambio"
          valor={formatearTipoCambio(
            presupuesto.TIPO_CAMBIO
          )}
        />

        <Dato
          etiqueta="Total USD"
          valor={formatearUSD(
            presupuesto.TOTAL_USD
          )}
          destacado
        />

        <Dato
          etiqueta="Total ARS"
          valor={formatearARS(
            presupuesto.TOTAL_ARS
          )}
          destacado
        />
      </div>

      <div className="mt-5 flex items-center justify-between">
        <span className="text-sm font-semibold text-blue-700">
          Ver presupuesto
        </span>

        <span className="text-lg text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-700">
          →
        </span>
      </div>
    </Link>
  );
}

function Dato({
  etiqueta,
  valor,
  destacado = false,
}: {
  etiqueta: string;
  valor: string;
  destacado?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {etiqueta}
      </p>

      <p
        className={`mt-1 ${
          destacado
            ? "font-bold text-slate-900"
            : "font-medium text-slate-700"
        }`}
      >
        {valor}
      </p>
    </div>
  );
}

function formatearUSD(valor: number) {
  const numeroSeguro =
    Number.isFinite(valor)
      ? valor
      : 0;

  return new Intl.NumberFormat(
    "es-AR",
    {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }
  ).format(numeroSeguro);
}

function formatearARS(valor: number) {
  const numeroSeguro =
    Number.isFinite(valor)
      ? valor
      : 0;

  return new Intl.NumberFormat(
    "es-AR",
    {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }
  ).format(numeroSeguro);
}

function formatearTipoCambio(
  valor: number
) {
  const numeroSeguro =
    Number.isFinite(valor)
      ? valor
      : 0;

  return new Intl.NumberFormat(
    "es-AR",
    {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 2,
    }
  ).format(numeroSeguro);
}

function formatearFecha(
  fecha: string
) {
  if (!fecha) {
    return "Sin fecha";
  }

  const partes = fecha
    .trim()
    .split(/[\/\-]/)
    .map(Number);

  if (
    partes.length === 3 &&
    partes[0] > 31
  ) {
    const [anio, mes, dia] =
      partes;

    return new Intl.DateTimeFormat(
      "es-AR"
    ).format(
      new Date(
        anio,
        mes - 1,
        dia
      )
    );
  }

  const fechaConvertida =
    new Date(fecha);

  if (
    Number.isNaN(
      fechaConvertida.getTime()
    )
  ) {
    return fecha;
  }

  return new Intl.DateTimeFormat(
    "es-AR"
  ).format(fechaConvertida);
}

function obtenerColorEstado(
  estado: string
) {
  const estadoNormalizado =
    String(estado || "")
      .trim()
      .toLowerCase();

  if (
    estadoNormalizado ===
      "aprobado" ||
    estadoNormalizado ===
      "aprobada"
  ) {
    return "bg-emerald-100 text-emerald-700";
  }

  if (
    estadoNormalizado ===
      "enviado" ||
    estadoNormalizado ===
      "enviada"
  ) {
    return "bg-blue-100 text-blue-700";
  }

  if (
    estadoNormalizado ===
      "rechazado" ||
    estadoNormalizado ===
      "rechazada"
  ) {
    return "bg-red-100 text-red-700";
  }

  if (
    estadoNormalizado ===
      "borrador"
  ) {
    return "bg-amber-100 text-amber-700";
  }

  return "bg-slate-100 text-slate-700";
}