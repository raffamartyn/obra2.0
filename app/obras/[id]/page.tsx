import Link from "next/link";
import { notFound } from "next/navigation";

import apiobra from "@/app/api/apiobra";
import apicliente from "@/app/api/apicliente";
import apicontrato from "@/app/api/apicontrato";
import apicobro from "@/app/api/apicobro";
import apipago from "@/app/api/apipago";
import apicontratista from "@/app/api/apicontratista";

import BotonPDF from "@/app/components/obras/BotonPDF";

type ObraDetallePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ObraDetallePage({
  params,
}: ObraDetallePageProps) {
  const { id } = await params;
  const idDecodificado = decodeURIComponent(id);

  const [
    obras,
    clientes,
    contratos,
    cobros,
    pagos,
    contratistas,
  ] = await Promise.all([
    apiobra(),
    apicliente(),
    apicontrato(),
    apicobro(),
    apipago(),
    apicontratista(),
  ]);

  const obra = obras.find(
    (item) => item.ID_OBRA === idDecodificado
  );

  if (!obra) {
    notFound();
  }

  const cliente = clientes.find(
    (item) =>
      item.ID_CLIENTE === obra.ID_CLIENTE
  );

  const contratosDeLaObra =
    contratos.filter(
      (contrato) =>
        contrato.ID_OBRA === obra.ID_OBRA
    );

  /*
   * AppSheet guarda:
   *
   * MONTO = importe bruto del contrato
   * TOTAL = neto del contratista, con comisión descontada
   * COMISION_MONTO = comisión calculada
   * DESCUENTOS = porcentaje de comisión
   */
  const contratosConComision =
    contratosDeLaObra.map(
      (contrato) => {
        const contratoConCamposNuevos =
          contrato as typeof contrato & {
            TOTAL?: unknown;
            DESCUENTOS?: unknown;
            COMISION_MONTO?: unknown;
          };

        const montoBrutoGuardado =
          convertirNumero(
            contrato.MONTO
          );

        const totalNetoGuardado =
          convertirNumero(
            contratoConCamposNuevos.TOTAL
          );

        const porcentajeComision =
          convertirPorcentaje(
            contratoConCamposNuevos.DESCUENTOS
          );

        const comisionGuardada =
          convertirNumero(
            contratoConCamposNuevos.COMISION_MONTO
          );

        /*
         * Si AppSheet todavía no guardó la comisión,
         * se calcula como respaldo usando MONTO.
         */
        const comisionMonto =
          comisionGuardada > 0
            ? comisionGuardada
            : montoBrutoGuardado *
              porcentajeComision;

        /*
         * TOTAL ya viene con la comisión descontada.
         * No volvemos a descontarla en la app web.
         */
        const totalContratista =
          totalNetoGuardado > 0
            ? totalNetoGuardado
            : Math.max(
                montoBrutoGuardado -
                  comisionMonto,
                0
              );

        /*
         * El bruto normalmente viene desde MONTO.
         * Como respaldo, se reconstruye sumando
         * neto + comisión.
         */
        const totalContrato =
          montoBrutoGuardado > 0
            ? montoBrutoGuardado
            : totalContratista +
              comisionMonto;

        return {
          ...contrato,
          totalContrato,
          porcentajeComision,
          comisionMonto,
          totalContratista,
        };
      }
    );

  const cobrosDeLaObra =
    cobros.filter(
      (cobro) =>
        cobro.ID_OBRA === obra.ID_OBRA
    );

  const idsContratosDeLaObra =
    new Set(
      contratosDeLaObra.map(
        (contrato) =>
          contrato.ID_CONTRATO
      )
    );

  /*
   * Solamente se toman pagos que tengan
   * un contrato perteneciente a esta obra.
   */
  const pagosDeLaObra =
    pagos.filter(
      (pago) =>
        pago.ID_CONTRATO &&
        idsContratosDeLaObra.has(
          pago.ID_CONTRATO
        )
    );

  /*
   * Presupuesto bruto de la obra.
   * La comisión no modifica este total.
   */
  const presupuestoGeneral =
    contratosConComision.reduce(
      (total, contrato) =>
        total +
        contrato.totalContrato,
      0
    );

  /*
   * Total neto que corresponde pagar
   * a todos los contratistas.
   */
  const totalNetoContratistas =
    contratosConComision.reduce(
      (total, contrato) =>
        total +
        contrato.totalContratista,
      0
    );

  /*
   * Comisión total de la obra.
   * Se muestra como información adicional.
   */
  const totalComisiones =
    contratosConComision.reduce(
      (total, contrato) =>
        total +
        contrato.comisionMonto,
      0
    );

  const totalCobrado =
    cobrosDeLaObra.reduce(
      (total, cobro) =>
        total +
        convertirNumero(cobro.MONTO),
      0
    );

  /*
   * Este valor solamente suma registros
   * existentes en la tabla de pagos.
   */
  const totalPagado =
    pagosDeLaObra.reduce(
      (total, pago) =>
        total +
        convertirNumero(pago.MONTO),
      0
    );

  const saldoPorCobrar =
    presupuestoGeneral -
    totalCobrado;

  /*
   * El saldo a contratistas se calcula
   * sobre el neto, no sobre el bruto.
   */
  const saldoPorPagar =
    totalNetoContratistas -
    totalPagado;

  const porcentajeCobrado =
    presupuestoGeneral > 0
      ? Math.min(
          (totalCobrado /
            presupuestoGeneral) *
            100,
          100
        )
      : 0;

  return (
    <section className="space-y-6">
      <div>
        <Link
          href="/obras"
          className="text-sm font-semibold text-slate-500 transition hover:text-slate-900"
        >
          ← Volver a obras
        </Link>

        <div className="mt-4 flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              Detalle de obra
            </p>

            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              {obra.NOMBRE}
            </h1>

            <p className="mt-2 text-slate-500">
              {obra.DIRECCION ||
                "Sin dirección registrada"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`w-fit rounded-full px-4 py-2 text-sm font-semibold ${obtenerColorEstado(
                obra.ESTADO
              )}`}
            >
              {obra.ESTADO ||
                "Sin estado"}
            </span>

            <BotonPDF
              idObra={obra.ID_OBRA}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <ResumenCard
          titulo="Presupuesto general"
          valor={formatearDinero(
            presupuestoGeneral
          )}
        />

        <ResumenCard
          titulo="Total cobrado"
          valor={formatearDinero(
            totalCobrado
          )}
          variante="positivo"
        />

        <ResumenCard
          titulo="Saldo por cobrar"
          valor={formatearDinero(
            saldoPorCobrar
          )}
          variante={
            saldoPorCobrar > 0
              ? "pendiente"
              : "positivo"
          }
        />

        <ResumenCard
          titulo="Pagado a contratistas"
          valor={formatearDinero(
            totalPagado
          )}
          variante={
            totalPagado > 0
              ? "positivo"
              : "normal"
          }
        />

        <ResumenCard
          titulo="Saldo de contratos"
          valor={formatearDinero(
            saldoPorPagar
          )}
          variante={
            saldoPorPagar > 0
              ? "pendiente"
              : "positivo"
          }
        />

        <ResumenCard
          titulo="Total comisión"
          valor={formatearDinero(
            totalComisiones
          )}
          variante="positivo"
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-2 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Avance de cobro
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Porcentaje cobrado sobre el
              presupuesto general
            </p>
          </div>

          <span className="text-xl font-bold text-slate-900">
            {porcentajeCobrado.toFixed(
              0
            )}
            %
          </span>
        </div>

        <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-slate-900 transition-all"
            style={{
              width: `${porcentajeCobrado}%`,
            }}
          />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <Seccion titulo="Datos generales">
            <div className="grid gap-4 sm:grid-cols-2">
              <Dato
                etiqueta="Nombre de la obra"
                valor={obra.NOMBRE}
              />

              <Dato
                etiqueta="Estado"
                valor={
                  obra.ESTADO ||
                  "Sin estado"
                }
              />

              <Dato
                etiqueta="Dirección"
                valor={
                  obra.DIRECCION ||
                  "Sin dirección registrada"
                }
              />

              <Dato
                etiqueta="Fecha"
                valor={formatearFecha(
                  obra.FECHA
                )}
              />
            </div>

            {obra.DOCUMENTO && (
              <div className="mt-5">
                <a
                  href={obra.DOCUMENTO}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
                >
                  Ver documento de la obra
                </a>
              </div>
            )}
          </Seccion>
        </div>

        <Seccion titulo="Cliente">
          <div className="space-y-4">
            <Dato
              etiqueta="Nombre"
              valor={
                cliente?.NOMBRE ||
                "Cliente no encontrado"
              }
            />

            <Dato
              etiqueta="CUIT"
              valor={
                cliente?.CUIT ||
                "Sin CUIT"
              }
            />

            <Dato
              etiqueta="Teléfono"
              valor={
                cliente?.TELEFONO ||
                "Sin teléfono"
              }
            />

            <Dato
              etiqueta="Condición IVA"
              valor={
                cliente?.CONDICION_IVA ||
                "Sin información"
              }
            />
          </div>
        </Seccion>
      </div>

      <Seccion
        titulo="Contratos"
        cantidad={
          contratosConComision.length
        }
      >
        {contratosConComision.length ===
        0 ? (
          <MensajeVacio texto="Esta obra todavía no tiene contratos." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-200 text-left">
                  <Th>Contratista</Th>
                  <Th>Tipo</Th>
                  <Th>Descripción</Th>
                  <Th>Fecha</Th>
                  <Th>Total contrato</Th>
                  <Th>Comisión %</Th>
                  <Th>Comisión</Th>
                  <Th>Neto contratista</Th>
                  <Th>Pagado</Th>
                  <Th>Saldo</Th>
                  <Th>Documento</Th>
                </tr>
              </thead>

              <tbody>
                {contratosConComision.map(
                  (contrato) => {
                    const contratista =
                      contratistas.find(
                        (item) =>
                          item.ID_CONTRATISTA ===
                          contrato.ID_CONTRATISTA
                      );

                    const pagosDelContrato =
                      pagosDeLaObra.filter(
                        (pago) =>
                          pago.ID_CONTRATO ===
                          contrato.ID_CONTRATO
                      );

                    /*
                     * Solamente suma pagos reales
                     * asociados a este contrato.
                     */
                    const pagadoContrato =
                      pagosDelContrato.reduce(
                        (total, pago) =>
                          total +
                          convertirNumero(
                            pago.MONTO
                          ),
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
                          {contratista?.NOMBRE ||
                            "Sin contratista"}
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
                          {formatearPorcentaje(
                            contrato.porcentajeComision
                          )}
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
                                : saldoContrato < 0
                                  ? "font-semibold text-red-700"
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

      <div className="grid gap-6 xl:grid-cols-2">
        <Seccion
          titulo="Cobros"
          cantidad={
            cobrosDeLaObra.length
          }
        >
          {cobrosDeLaObra.length ===
          0 ? (
            <MensajeVacio texto="No hay cobros registrados para esta obra." />
          ) : (
            <div className="space-y-3">
              {cobrosDeLaObra.map(
                (cobro) => (
                  <Movimiento
                    key={
                      cobro.ID_COBROS
                    }
                    titulo="Cobro del cliente"
                    fecha={cobro.FECHA}
                    monto={convertirNumero(
                      cobro.MONTO
                    )}
                    comprobante={
                      cobro.COMPROBANTE
                    }
                    tipo="cobro"
                  />
                )
              )}
            </div>
          )}
        </Seccion>

        <Seccion
          titulo="Pagos a contratistas"
          cantidad={
            pagosDeLaObra.length
          }
        >
          {pagosDeLaObra.length ===
          0 ? (
            <MensajeVacio texto="No hay pagos registrados para esta obra." />
          ) : (
            <div className="space-y-3">
              {pagosDeLaObra.map(
                (pago) => {
                  const contratoDelPago =
                    contratosDeLaObra.find(
                      (contrato) =>
                        contrato.ID_CONTRATO ===
                        pago.ID_CONTRATO
                    );

                  const contratista =
                    contratistas.find(
                      (item) =>
                        item.ID_CONTRATISTA ===
                        (pago.ID_CONTRATISTA ||
                          contratoDelPago?.ID_CONTRATISTA)
                    );

                  return (
                    <Movimiento
                      key={pago.ID_PAGO}
                      titulo={
                        contratista?.NOMBRE ||
                        "Contratista"
                      }
                      fecha={pago.FECHA}
                      monto={convertirNumero(
                        pago.MONTO
                      )}
                      comprobante={
                        pago.COMPROBANTE
                      }
                      tipo="pago"
                    />
                  );
                }
              )}
            </div>
          )}
        </Seccion>
      </div>
    </section>
  );
}

type ResumenCardProps = {
  titulo: string;
  valor: string;
  variante?:
    | "normal"
    | "positivo"
    | "pendiente";
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

type SeccionProps = {
  titulo: string;
  cantidad?: number;
  children: React.ReactNode;
};

function Seccion({
  titulo,
  cantidad,
  children,
}: SeccionProps) {
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

type DatoProps = {
  etiqueta: string;
  valor: string;
};

function Dato({
  etiqueta,
  valor,
}: DatoProps) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {etiqueta}
      </p>

      <p className="mt-1 font-medium text-slate-900">
        {valor}
      </p>
    </div>
  );
}

type MovimientoProps = {
  titulo: string;
  fecha: string;
  monto: number;
  comprobante: string;
  tipo: "cobro" | "pago";
};

function Movimiento({
  titulo,
  fecha,
  monto,
  comprobante,
  tipo,
}: MovimientoProps) {
  return (
    <div className="flex flex-col justify-between gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center">
      <div>
        <p className="font-semibold text-slate-900">
          {titulo}
        </p>

        <p className="mt-1 text-sm text-slate-500">
          {formatearFecha(fecha)}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <span
          className={`font-bold ${
            tipo === "cobro"
              ? "text-emerald-700"
              : "text-slate-900"
          }`}
        >
          {formatearDinero(monto)}
        </span>

        {comprobante ? (
          <a
            href={comprobante}
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

function formatearPorcentaje(
  valor: number
) {
  const porcentaje =
    Number.isFinite(valor)
      ? valor * 100
      : 0;

  return `${porcentaje.toLocaleString(
    "es-AR",
    {
      maximumFractionDigits: 2,
    }
  )}%`;
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
      "finalizada" ||
    estadoNormalizado ===
      "finalizado"
  ) {
    return "bg-emerald-100 text-emerald-700";
  }

  if (
    estadoNormalizado ===
      "en ejecución" ||
    estadoNormalizado ===
      "en ejecucion" ||
    estadoNormalizado === "activa" ||
    estadoNormalizado === "activo"
  ) {
    return "bg-blue-100 text-blue-700";
  }

  if (
    estadoNormalizado ===
      "pausada" ||
    estadoNormalizado ===
      "pausado"
  ) {
    return "bg-amber-100 text-amber-700";
  }

  if (
    estadoNormalizado ===
      "cancelada" ||
    estadoNormalizado ===
      "cancelado"
  ) {
    return "bg-red-100 text-red-700";
  }

  return "bg-slate-100 text-slate-700";
}

function convertirNumero(
  valor: unknown
): number {
  if (typeof valor === "number") {
    return Number.isFinite(valor)
      ? valor
      : 0;
  }

  if (
    valor === null ||
    valor === undefined
  ) {
    return 0;
  }

  const texto = String(valor)
    .trim()
    .replace(/\$/g, "")
    .replace(/\s/g, "");

  if (!texto) {
    return 0;
  }

  let textoNormalizado = texto;

  const tieneComa =
    texto.includes(",");

  const tienePunto =
    texto.includes(".");

  if (tieneComa && tienePunto) {
    textoNormalizado = texto
      .replace(/\./g, "")
      .replace(",", ".");
  } else if (tieneComa) {
    textoNormalizado =
      texto.replace(",", ".");
  } else if (tienePunto) {
    const partes =
      texto.split(".");

    const pareceSeparadorDeMiles =
      partes.length > 2 ||
      (partes.length === 2 &&
        partes[1].length === 3 &&
        partes[0] !== "0");

    if (pareceSeparadorDeMiles) {
      textoNormalizado =
        texto.replace(/\./g, "");
    }
  }

  const numero =
    Number(textoNormalizado);

  return Number.isNaN(numero)
    ? 0
    : numero;
}

function convertirPorcentaje(
  valor: unknown
): number {
  if (typeof valor === "number") {
    if (!Number.isFinite(valor)) {
      return 0;
    }

    return valor > 1
      ? valor / 100
      : valor;
  }

  if (
    valor === null ||
    valor === undefined
  ) {
    return 0;
  }

  const texto =
    String(valor).trim();

  if (!texto) {
    return 0;
  }

  const contieneSimbolo =
    texto.includes("%");

  const numero = Number(
    texto
      .replace("%", "")
      .replace(",", ".")
      .trim()
  );

  if (Number.isNaN(numero)) {
    return 0;
  }

  if (
    contieneSimbolo ||
    numero > 1
  ) {
    return numero / 100;
  }

  return numero;
}