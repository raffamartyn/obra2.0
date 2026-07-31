"use client";

import Link from "next/link";
import {
  useMemo,
  useState,
} from "react";

type Obra = {
  ID_OBRA: string;
  NOMBRE: string;
  DIRECCION: string;
};

type Contrato = {
  ID_CONTRATO: string;
  ID_OBRA: string;
  TIPO: string;
  DESCRIPCION: string;
  FECHA: string;
  DOCUMENTO: string;
  totalContrato: number;
  porcentajeComision: number;
  comisionMonto: number;
  totalContratista: number;
};

type Pago = {
  ID_PAGO: string;
  ID_CONTRATO: string;
  MONTO: number;
  FECHA: string;
  COMPROBANTE: string;
};

type Props = {
  obras: Obra[];
  contratos: Contrato[];
  pagos: Pago[];
};

export default function DetalleContratistaCliente({
  obras,
  contratos,
  pagos,
}: Props) {
  const [
    obraSeleccionada,
    setObraSeleccionada,
  ] = useState("todas");

  const contratosFiltrados =
    useMemo(() => {
      if (
        obraSeleccionada === "todas"
      ) {
        return contratos;
      }

      return contratos.filter(
        (contrato) =>
          contrato.ID_OBRA ===
          obraSeleccionada
      );
    }, [
      obraSeleccionada,
      contratos,
    ]);

  const idsContratosFiltrados =
    useMemo(
      () =>
        new Set(
          contratosFiltrados.map(
            (contrato) =>
              contrato.ID_CONTRATO
          )
        ),
      [contratosFiltrados]
    );

  const pagosFiltrados =
    useMemo(() => {
      return pagos.filter(
        (pago) =>
          idsContratosFiltrados.has(
            pago.ID_CONTRATO
          )
      );
    }, [
      pagos,
      idsContratosFiltrados,
    ]);

  const obrasFiltradas =
    useMemo(() => {
      if (
        obraSeleccionada === "todas"
      ) {
        return obras;
      }

      return obras.filter(
        (obra) =>
          obra.ID_OBRA ===
          obraSeleccionada
      );
    }, [
      obraSeleccionada,
      obras,
    ]);

  const totalContratado =
    contratosFiltrados.reduce(
      (total, contrato) =>
        total +
        contrato.totalContrato,
      0
    );

  const totalComision =
    contratosFiltrados.reduce(
      (total, contrato) =>
        total +
        contrato.comisionMonto,
      0
    );

  const totalNeto =
    contratosFiltrados.reduce(
      (total, contrato) =>
        total +
        contrato.totalContratista,
      0
    );

  const totalPagado =
    pagosFiltrados.reduce(
      (total, pago) =>
        total + pago.MONTO,
      0
    );

  const saldoPendiente =
    totalNeto - totalPagado;

  const porcentajePagado =
    totalNeto > 0
      ? Math.min(
          (totalPagado /
            totalNeto) *
            100,
          100
        )
      : 0;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <label
          htmlFor="filtro-obra"
          className="text-sm font-semibold text-slate-700"
        >
          Filtrar por obra
        </label>

        <select
          id="filtro-obra"
          value={obraSeleccionada}
          onChange={(event) =>
            setObraSeleccionada(
              event.target.value
            )
          }
          className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-500 sm:max-w-md"
        >
          <option value="todas">
            Todas las obras
          </option>

          {obras.map((obra) => (
            <option
              key={obra.ID_OBRA}
              value={obra.ID_OBRA}
            >
              {obra.NOMBRE}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ResumenCard
          titulo="Contratos"
          valor={String(
            contratosFiltrados.length
          )}
        />

        <ResumenCard
          titulo="Obras"
          valor={String(
            obrasFiltradas.length
          )}
        />

        <ResumenCard
          titulo="Total contratado"
          valor={formatearDinero(
            totalContratado
          )}
        />

        <ResumenCard
          titulo="Comisión"
          valor={formatearDinero(
            totalComision
          )}
          variante="comision"
        />

        <ResumenCard
          titulo="Neto contratista"
          valor={formatearDinero(
            totalNeto
          )}
        />

        <ResumenCard
          titulo="Total pagado"
          valor={formatearDinero(
            totalPagado
          )}
          variante="positivo"
        />

        <ResumenCard
          titulo="Saldo pendiente"
          valor={formatearDinero(
            saldoPendiente
          )}
          variante={
            saldoPendiente > 0
              ? "pendiente"
              : "positivo"
          }
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-slate-900">
              Avance de pago
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Porcentaje pagado sobre el
              neto correspondiente al
              contratista.
            </p>
          </div>

          <span className="text-2xl font-bold text-slate-900">
            {porcentajePagado.toFixed(0)}%
          </span>
        </div>

        <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-slate-900 transition-all"
            style={{
              width: `${porcentajePagado}%`,
            }}
          />
        </div>
      </div>

      <Seccion
        titulo="Obras"
        cantidad={obrasFiltradas.length}
      >
        {obrasFiltradas.length === 0 ? (
          <MensajeVacio texto="No hay obras relacionadas." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {obrasFiltradas.map(
              (obra) => {
                const contratosObra =
                  contratosFiltrados.filter(
                    (contrato) =>
                      contrato.ID_OBRA ===
                      obra.ID_OBRA
                  );

                const totalObra =
                  contratosObra.reduce(
                    (total, contrato) =>
                      total +
                      contrato.totalContrato,
                    0
                  );

                const comisionObra =
                  contratosObra.reduce(
                    (total, contrato) =>
                      total +
                      contrato.comisionMonto,
                    0
                  );

                const netoObra =
                  contratosObra.reduce(
                    (total, contrato) =>
                      total +
                      contrato.totalContratista,
                    0
                  );

                return (
                  <Link
                    key={obra.ID_OBRA}
                    href={`/obras/${obra.ID_OBRA}`}
                    className="rounded-xl border border-slate-200 p-4 transition hover:border-slate-400 hover:bg-slate-50"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Obra
                    </p>

                    <h3 className="mt-1 font-bold text-slate-900">
                      {obra.NOMBRE}
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                      {obra.DIRECCION ||
                        "Sin dirección"}
                    </p>

                    <div className="mt-4 space-y-2 border-t border-slate-100 pt-3">
                      <FilaDato
                        etiqueta="Contratado"
                        valor={formatearDinero(
                          totalObra
                        )}
                      />

                      <FilaDato
                        etiqueta="Comisión"
                        valor={formatearDinero(
                          comisionObra
                        )}
                      />

                      <FilaDato
                        etiqueta="Neto"
                        valor={formatearDinero(
                          netoObra
                        )}
                      />
                    </div>
                  </Link>
                );
              }
            )}
          </div>
        )}
      </Seccion>

      <Seccion
        titulo="Contratos"
        cantidad={
          contratosFiltrados.length
        }
      >
        {contratosFiltrados.length ===
        0 ? (
          <MensajeVacio texto="No hay contratos registrados para esta obra." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-200 text-left">
                  <Th>Obra</Th>
                  <Th>Tipo</Th>
                  <Th>Descripción</Th>
                  <Th>Fecha</Th>
                  <Th>Total</Th>
                  <Th>Comisión %</Th>
                  <Th>Comisión</Th>
                  <Th>Neto</Th>
                  <Th>Pagado</Th>
                  <Th>Saldo</Th>
                  <Th>Documento</Th>
                </tr>
              </thead>

              <tbody>
                {contratosFiltrados.map(
                  (contrato) => {
                    const obra =
                      obras.find(
                        (item) =>
                          item.ID_OBRA ===
                          contrato.ID_OBRA
                      );

                    const pagosContrato =
                      pagosFiltrados.filter(
                        (pago) =>
                          pago.ID_CONTRATO ===
                          contrato.ID_CONTRATO
                      );

                    const pagadoContrato =
                      pagosContrato.reduce(
                        (total, pago) =>
                          total +
                          pago.MONTO,
                        0
                      );

                    const saldoContrato =
                      contrato.totalContratista -
                      pagadoContrato;

                    return (
                      <tr
                        key={
                          contrato.ID_CONTRATO
                        }
                        className="border-b border-slate-100 last:border-0"
                      >
                        <Td>
                          {obra ? (
                            <Link
                              href={`/obras/${obra.ID_OBRA}`}
                              className="font-semibold text-blue-700 hover:underline"
                            >
                              {obra.NOMBRE}
                            </Link>
                          ) : (
                            "Obra no encontrada"
                          )}
                        </Td>

                        <Td>
                          {contrato.TIPO ||
                            "Sin tipo"}
                        </Td>

                        <Td>
                          {contrato.DESCRIPCION ||
                            "Sin descripción"}
                        </Td>

                        <Td>
                          {formatearFecha(
                            contrato.FECHA
                          )}
                        </Td>

                        <Td destacado>
                          {formatearDinero(
                            contrato.totalContrato
                          )}
                        </Td>

                        <Td>
                          {(
                            contrato.porcentajeComision *
                            100
                          ).toFixed(0)}
                          %
                        </Td>

                        <Td>
                          <span className="font-semibold text-violet-700">
                            {formatearDinero(
                              contrato.comisionMonto
                            )}
                          </span>
                        </Td>

                        <Td destacado>
                          {formatearDinero(
                            contrato.totalContratista
                          )}
                        </Td>

                        <Td>
                          <span className="font-semibold text-emerald-700">
                            {formatearDinero(
                              pagadoContrato
                            )}
                          </span>
                        </Td>

                        <Td>
                          <span
                            className={
                              saldoContrato > 0
                                ? "font-semibold text-amber-700"
                                : "font-semibold text-emerald-700"
                            }
                          >
                            {formatearDinero(
                              saldoContrato
                            )}
                          </span>
                        </Td>

                        <Td>
                          {contrato.DOCUMENTO ? (
                            <a
                              href={
                                contrato.DOCUMENTO
                              }
                              target="_blank"
                              rel="noreferrer"
                              className="font-semibold text-blue-700 hover:underline"
                            >
                              Ver
                            </a>
                          ) : (
                            <span className="text-slate-400">
                              —
                            </span>
                          )}
                        </Td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        )}
      </Seccion>

      <Seccion
        titulo="Pagos"
        cantidad={pagosFiltrados.length}
      >
        {pagosFiltrados.length === 0 ? (
          <MensajeVacio texto="No hay pagos registrados para esta selección." />
        ) : (
          <div className="space-y-3">
            {pagosFiltrados.map(
              (pago) => {
                const contrato =
                  contratos.find(
                    (item) =>
                      item.ID_CONTRATO ===
                      pago.ID_CONTRATO
                  );

                const obra = obras.find(
                  (item) =>
                    item.ID_OBRA ===
                    contrato?.ID_OBRA
                );

                return (
                  <div
                    key={pago.ID_PAGO}
                    className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">
                        {obra?.NOMBRE ||
                          "Obra no encontrada"}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {contrato?.TIPO ||
                          "Contrato no encontrado"}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {formatearFecha(
                          pago.FECHA
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-lg font-bold text-emerald-700">
                        {formatearDinero(
                          pago.MONTO
                        )}
                      </span>

                      {pago.COMPROBANTE ? (
                        <a
                          href={
                            pago.COMPROBANTE
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                        >
                          Ver comprobante
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400">
                          Sin comprobante
                        </span>
                      )}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}
      </Seccion>
    </div>
  );
}

type ResumenCardProps = {
  titulo: string;
  valor: string;
  variante?:
    | "normal"
    | "positivo"
    | "pendiente"
    | "comision";
};

function ResumenCard({
  titulo,
  valor,
  variante = "normal",
}: ResumenCardProps) {
  const color =
    variante === "positivo"
      ? "text-emerald-700"
      : variante === "pendiente"
        ? "text-amber-700"
        : variante === "comision"
          ? "text-violet-700"
          : "text-slate-900";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">
        {titulo}
      </p>

      <p
        className={`mt-2 text-2xl font-bold ${color}`}
      >
        {valor}
      </p>
    </div>
  );
}

function Seccion({
  titulo,
  cantidad,
  children,
}: {
  titulo: string;
  cantidad?: number;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <h2 className="text-lg font-bold text-slate-900">
          {titulo}
        </h2>

        {cantidad !== undefined && (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {cantidad}
          </span>
        )}
      </div>

      <div className="p-5">
        {children}
      </div>
    </div>
  );
}

function FilaDato({
  etiqueta,
  valor,
}: {
  etiqueta: string;
  valor: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-slate-500">
        {etiqueta}
      </span>

      <span className="font-bold text-slate-900">
        {valor}
      </span>
    </div>
  );
}

function MensajeVacio({
  texto,
}: {
  texto: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
      {texto}
    </div>
  );
}

function Th({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <th className="whitespace-nowrap px-3 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400 first:pl-0 last:pr-0">
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
      className={`whitespace-nowrap px-3 py-4 text-sm first:pl-0 last:pr-0 ${
        destacado
          ? "font-semibold text-slate-900"
          : "text-slate-600"
      }`}
    >
      {children}
    </td>
  );
}

function formatearDinero(
  valor: number
) {
  return new Intl.NumberFormat(
    "es-AR",
    {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }
  ).format(valor);
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