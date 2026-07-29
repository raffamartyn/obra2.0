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
    (item) => item.ID_CLIENTE === obra.ID_CLIENTE
  );

  const contratosDeLaObra = contratos.filter(
    (contrato) => contrato.ID_OBRA === obra.ID_OBRA
  );

  const cobrosDeLaObra = cobros.filter(
    (cobro) => cobro.ID_OBRA === obra.ID_OBRA
  );

  const idsContratosDeLaObra = new Set(
    contratosDeLaObra.map(
      (contrato) => contrato.ID_CONTRATO
    )
  );

  const pagosDeLaObra = pagos.filter((pago) =>
    idsContratosDeLaObra.has(pago.ID_CONTRATO)
  );

  const presupuestoGeneral = contratosDeLaObra.reduce(
    (total, contrato) => total + contrato.MONTO,
    0
  );

  const totalCobrado = cobrosDeLaObra.reduce(
    (total, cobro) => total + cobro.MONTO,
    0
  );

  const totalPagado = pagosDeLaObra.reduce(
    (total, pago) => total + pago.MONTO,
    0
  );

  const saldoPorCobrar =
    presupuestoGeneral - totalCobrado;

  const saldoPorPagar =
    presupuestoGeneral - totalPagado;

  const porcentajeCobrado =
    presupuestoGeneral > 0
      ? Math.min(
          (totalCobrado / presupuestoGeneral) * 100,
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

          <span
            className={`w-fit rounded-full px-4 py-2 text-sm font-semibold ${obtenerColorEstado(
              obra.ESTADO
            )}`}
          >
            {obra.ESTADO || "Sin estado"}
          </span>
          <BotonPDF idObra={obra.ID_OBRA} />
        </div>
    
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <ResumenCard
          titulo="Presupuesto general"
          valor={formatearDinero(presupuestoGeneral)}
        />

        <ResumenCard
          titulo="Total cobrado"
          valor={formatearDinero(totalCobrado)}
          variante="positivo"
        />

        <ResumenCard
          titulo="Saldo por cobrar"
          valor={formatearDinero(saldoPorCobrar)}
          variante={
            saldoPorCobrar > 0
              ? "pendiente"
              : "positivo"
          }
        />

        <ResumenCard
          titulo="Pagado a contratistas"
          valor={formatearDinero(totalPagado)}
        />

        <ResumenCard
          titulo="Saldo de contratos"
          valor={formatearDinero(saldoPorPagar)}
          variante={
            saldoPorPagar > 0
              ? "pendiente"
              : "positivo"
          }
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Avance de cobro
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Porcentaje cobrado sobre el presupuesto general
            </p>
          </div>

          <span className="text-xl font-bold text-slate-900">
            {porcentajeCobrado.toFixed(0)}%
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
                valor={obra.ESTADO || "Sin estado"}
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
                valor={formatearFecha(obra.FECHA)}
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
              valor={cliente?.CUIT || "Sin CUIT"}
            />

            <Dato
              etiqueta="Teléfono"
              valor={
                cliente?.TELEFONO || "Sin teléfono"
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
        cantidad={contratosDeLaObra.length}
      >
        {contratosDeLaObra.length === 0 ? (
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
                  <Th>Monto</Th>
                  <Th>Pagado</Th>
                  <Th>Saldo</Th>
                  <Th>Documento</Th>
                </tr>
              </thead>

              <tbody>
                {contratosDeLaObra.map((contrato) => {
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

                  const pagadoContrato =
                    pagosDelContrato.reduce(
                      (total, pago) =>
                        total + pago.MONTO,
                      0
                    );

                  const saldoContrato =
                    contrato.MONTO - pagadoContrato;

                  return (
                    <tr
                      key={contrato.ID_CONTRATO}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <Td>
                        {contratista?.NOMBRE ||
                          "Sin contratista"}
                      </Td>

                      <Td>{contrato.TIPO}</Td>

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
                          contrato.MONTO
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
                            href={contrato.DOCUMENTO}
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
                })}
              </tbody>
            </table>
          </div>
        )}
      </Seccion>

      <div className="grid gap-6 xl:grid-cols-2">
        <Seccion
          titulo="Cobros"
          cantidad={cobrosDeLaObra.length}
        >
          {cobrosDeLaObra.length === 0 ? (
            <MensajeVacio texto="No hay cobros registrados para esta obra." />
          ) : (
            <div className="space-y-3">
              {cobrosDeLaObra.map((cobro) => (
                <Movimiento
                  key={cobro.ID_COBROS}
                  titulo="Cobro del cliente"
                  fecha={cobro.FECHA}
                  monto={cobro.MONTO}
                  comprobante={cobro.COMPROBANTE}
                  tipo="cobro"
                />
              ))}
            </div>
          )}
        </Seccion>

        <Seccion
          titulo="Pagos a contratistas"
          cantidad={pagosDeLaObra.length}
        >
          {pagosDeLaObra.length === 0 ? (
            <MensajeVacio texto="No hay pagos registrados para esta obra." />
          ) : (
            <div className="space-y-3">
              {pagosDeLaObra.map((pago) => {
                const contratista =
                  contratistas.find(
                    (item) =>
                      item.ID_CONTRATISTA ===
                      pago.ID_CONTRATISTA
                  );

                return (
                  <Movimiento
                    key={pago.ID_PAGO}
                    titulo={
                      contratista?.NOMBRE ||
                      "Contratista"
                    }
                    fecha={pago.FECHA}
                    monto={pago.MONTO}
                    comprobante={
                      pago.COMPROBANTE
                    }
                    tipo="pago"
                  />
                );
              })}
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
  variante?: "normal" | "positivo" | "pendiente";
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

      <p className={`mt-2 text-2xl font-bold ${color}`}>
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

      <div className="p-5">{children}</div>
    </div>
  );
}

type DatoProps = {
  etiqueta: string;
  valor: string;
};

function Dato({ etiqueta, valor }: DatoProps) {
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

function MensajeVacio({ texto }: { texto: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
      {texto}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
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

  if (
    partes.length === 3 &&
    partes[0] > 31
  ) {
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

function obtenerColorEstado(estado: string) {
  const estadoNormalizado = estado
    .trim()
    .toLowerCase();

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