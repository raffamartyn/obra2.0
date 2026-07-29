"use client";

import { useMemo, useState } from "react";

type CobroVista = {
  id: string;
  obra: string;
  fecha: string;
  monto: number;
  comprobante: string;
};

type PagoVista = {
  id: string;
  contratista: string;
  obra: string;
  contrato: string;
  fecha: string;
  monto: number;
  comprobante: string;
};

type ListaMovimientosProps = {
  cobros: CobroVista[];
  pagos: PagoVista[];
};

type Pestaña = "cobros" | "pagos";

export default function ListaMovimientos({
  cobros,
  pagos,
}: ListaMovimientosProps) {
  const [pestaña, setPestaña] =
    useState<Pestaña>("cobros");

  const [busqueda, setBusqueda] = useState("");

  const cobrosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    if (!texto) {
      return cobros;
    }

    return cobros.filter((cobro) =>
      [
        cobro.obra,
        cobro.fecha,
        String(cobro.monto),
      ].some((valor) =>
        valor.toLowerCase().includes(texto)
      )
    );
  }, [busqueda, cobros]);

  const pagosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    if (!texto) {
      return pagos;
    }

    return pagos.filter((pago) =>
      [
        pago.contratista,
        pago.obra,
        pago.contrato,
        pago.fecha,
        String(pago.monto),
      ].some((valor) =>
        valor.toLowerCase().includes(texto)
      )
    );
  }, [busqueda, pagos]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="flex rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => {
              setPestaña("cobros");
              setBusqueda("");
            }}
            className={`flex-1 rounded-lg px-5 py-2.5 text-sm font-semibold transition sm:flex-none ${
              pestaña === "cobros"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Cobros ({cobros.length})
          </button>

          <button
            type="button"
            onClick={() => {
              setPestaña("pagos");
              setBusqueda("");
            }}
            className={`flex-1 rounded-lg px-5 py-2.5 text-sm font-semibold transition sm:flex-none ${
              pestaña === "pagos"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Pagos ({pagos.length})
          </button>
        </div>

        <input
          type="search"
          value={busqueda}
          onChange={(evento) =>
            setBusqueda(evento.target.value)
          }
          placeholder={
            pestaña === "cobros"
              ? "Buscar por obra, fecha o monto..."
              : "Buscar por contratista, obra o contrato..."
          }
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 sm:max-w-md"
        />
      </div>

      {pestaña === "cobros" ? (
        <TablaCobros cobros={cobrosFiltrados} />
      ) : (
        <TablaPagos pagos={pagosFiltrados} />
      )}
    </div>
  );
}

function TablaCobros({
  cobros,
}: {
  cobros: CobroVista[];
}) {
  if (cobros.length === 0) {
    return (
      <MensajeVacio texto="No se encontraron cobros." />
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left">
              <Th>Fecha</Th>
              <Th>Obra</Th>
              <Th>Monto</Th>
              <Th>Comprobante</Th>
            </tr>
          </thead>

          <tbody>
            {cobros.map((cobro) => (
              <tr
                key={cobro.id}
                className="border-b border-slate-100 transition last:border-0 hover:bg-slate-50"
              >
                <Td>{formatearFecha(cobro.fecha)}</Td>

                <Td destacado>{cobro.obra}</Td>

                <Td>
                  <span className="font-bold text-emerald-700">
                    {formatearDinero(cobro.monto)}
                  </span>
                </Td>

                <Td>
                  <Comprobante
                    url={cobro.comprobante}
                  />
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TablaPagos({
  pagos,
}: {
  pagos: PagoVista[];
}) {
  if (pagos.length === 0) {
    return (
      <MensajeVacio texto="No se encontraron pagos." />
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left">
              <Th>Fecha</Th>
              <Th>Contratista</Th>
              <Th>Obra</Th>
              <Th>Contrato</Th>
              <Th>Monto</Th>
              <Th>Comprobante</Th>
            </tr>
          </thead>

          <tbody>
            {pagos.map((pago) => (
              <tr
                key={pago.id}
                className="border-b border-slate-100 transition last:border-0 hover:bg-slate-50"
              >
                <Td>{formatearFecha(pago.fecha)}</Td>

                <Td destacado>
                  {pago.contratista}
                </Td>

                <Td>{pago.obra}</Td>

                <Td>{pago.contrato}</Td>

                <Td>
                  <span className="font-bold text-amber-700">
                    {formatearDinero(pago.monto)}
                  </span>
                </Td>

                <Td>
                  <Comprobante
                    url={pago.comprobante}
                  />
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Comprobante({ url }: { url: string }) {
  if (!url) {
    return (
      <span className="text-sm text-slate-400">
        Sin comprobante
      </span>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="inline-flex rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
    >
      Ver comprobante
    </a>
  );
}

function MensajeVacio({ texto }: { texto: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
      {texto}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="whitespace-nowrap px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
      {children}
    </th>
  );
}

function Td({
  children,
  destacado = false,
}: {
  children: React.ReactNode;
  destacado?: boolean;
}) {
  return (
    <td
      className={`whitespace-nowrap px-5 py-4 text-sm ${
        destacado
          ? "font-semibold text-slate-900"
          : "text-slate-600"
      }`}
    >
      {children}
    </td>
  );
}

function formatearDinero(valor: number) {
  return new Intl.NumberFormat("es-US", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(valor);
}

function formatearFecha(fecha: string) {
  if (!fecha) {
    return "Sin fecha";
  }

  const partes = fecha
    .trim()
    .split(/[\/\-]/)
    .map(Number);

  if (partes.length === 3 && partes[0] > 31) {
    const [anio, mes, dia] = partes;

    return new Intl.DateTimeFormat("es-US").format(
      new Date(anio, mes - 1, dia)
    );
  }

  const fechaConvertida = new Date(fecha);

  if (Number.isNaN(fechaConvertida.getTime())) {
    return fecha;
  }

  return new Intl.DateTimeFormat("es-US").format(
    fechaConvertida
  );
}