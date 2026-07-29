import Link from "next/link";
import { notFound } from "next/navigation";

import apicontratista from "@/app/api/apicontratista";
import apicontrato from "@/app/api/apicontrato";
import apipago from "@/app/api/apipago";
import apiobra from "@/app/api/apiobra";

type ContratistaDetallePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ContratistaDetallePage({
  params,
}: ContratistaDetallePageProps) {
  const { id } = await params;
  const idDecodificado = decodeURIComponent(id);

  const [contratistas, contratos, pagos, obras] =
    await Promise.all([
      apicontratista(),
      apicontrato(),
      apipago(),
      apiobra(),
    ]);

  const contratista = contratistas.find(
    (item) =>
      item.ID_CONTRATISTA === idDecodificado
  );

  if (!contratista) {
    notFound();
  }

  const contratosDelContratista = contratos.filter(
    (contrato) =>
      contrato.ID_CONTRATISTA ===
      contratista.ID_CONTRATISTA
  );

  const pagosDelContratista = pagos.filter(
    (pago) =>
      pago.ID_CONTRATISTA ===
      contratista.ID_CONTRATISTA
  );

  const idsObras = new Set(
    contratosDelContratista.map(
      (contrato) => contrato.ID_OBRA
    )
  );

  const obrasDelContratista = obras.filter((obra) =>
    idsObras.has(obra.ID_OBRA)
  );

  const totalContratado =
    contratosDelContratista.reduce(
      (total, contrato) =>
        total + contrato.MONTO,
      0
    );

  const totalPagado =
    pagosDelContratista.reduce(
      (total, pago) => total + pago.MONTO,
      0
    );

  const saldoPendiente =
    totalContratado - totalPagado;

  const porcentajePagado =
    totalContratado > 0
      ? Math.min(
          (totalPagado / totalContratado) * 100,
          100
        )
      : 0;

  return (
    <section className="space-y-6">
      <div>
        <Link
          href="/contratistas"
          className="no-print text-sm font-semibold text-slate-500 transition hover:text-slate-900"
        >
          ← Volver a contratistas
        </Link>

        <div className="mt-4">
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Detalle del contratista
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            {contratista.NOMBRE}
          </h1>

          <p className="mt-2 text-slate-500">
            Control de contratos, obras y pagos.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <ResumenCard
          titulo="Contratos"
          valor={String(
            contratosDelContratista.length
          )}
        />

        <ResumenCard
          titulo="Obras"
          valor={String(
            obrasDelContratista.length
          )}
        />

        <ResumenCard
          titulo="Total contratado"
          valor={formatearDinero(
            totalContratado
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
              Porcentaje pagado sobre el total
              contratado.
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

      <Seccion titulo="Datos del contratista">
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <Dato
            etiqueta="Nombre"
            valor={contratista.NOMBRE}
          />

          <Dato
            etiqueta="CUIL"
            valor={
              contratista.CUIL || "Sin CUIL"
            }
          />

          <Dato
            etiqueta="Teléfono"
            valor={
              contratista.TELEFONO ||
              "Sin teléfono"
            }
          />

          <Dato
            etiqueta="CBU"
            valor={
              contratista.CBU || "Sin CBU"
            }
          />

          <Dato
            etiqueta="Domicilio"
            valor={
              contratista.DOMICILIO ||
              "Sin domicilio"
            }
          />
        </div>
      </Seccion>

      <Seccion
        titulo="Obras"
        cantidad={obrasDelContratista.length}
      >
        {obrasDelContratista.length === 0 ? (
          <MensajeVacio texto="Este contratista todavía no tiene obras relacionadas." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {obrasDelContratista.map((obra) => {
              const contratosDeEstaObra =
                contratosDelContratista.filter(
                  (contrato) =>
                    contrato.ID_OBRA ===
                    obra.ID_OBRA
                );

              const totalObra =
                contratosDeEstaObra.reduce(
                  (total, contrato) =>
                    total + contrato.MONTO,
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

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-slate-500">
                      Contratado
                    </span>

                    <span className="font-bold text-slate-900">
                      {formatearDinero(totalObra)}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </Seccion>

      <Seccion
        titulo="Contratos"
        cantidad={
          contratosDelContratista.length
        }
      >
        {contratosDelContratista.length ===
        0 ? (
          <MensajeVacio texto="No hay contratos registrados para este contratista." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-200 text-left">
                  <Th>Obra</Th>
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
                {contratosDelContratista.map(
                  (contrato) => {
                    const obra = obras.find(
                      (item) =>
                        item.ID_OBRA ===
                        contrato.ID_OBRA
                    );

                    const pagosDelContrato =
                      pagosDelContratista.filter(
                        (pago) =>
                          pago.ID_CONTRATO ===
                          contrato.ID_CONTRATO
                      );

                    const totalPagadoContrato =
                      pagosDelContrato.reduce(
                        (total, pago) =>
                          total + pago.MONTO,
                        0
                      );

                    const saldoContrato =
                      contrato.MONTO -
                      totalPagadoContrato;

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
                            contrato.MONTO
                          )}
                        </Td>

                        <Td>
                          <span className="font-semibold text-emerald-700">
                            {formatearDinero(
                              totalPagadoContrato
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
        cantidad={pagosDelContratista.length}
      >
        {pagosDelContratista.length === 0 ? (
          <MensajeVacio texto="No hay pagos registrados para este contratista." />
        ) : (
          <div className="space-y-3">
            {pagosDelContratista.map((pago) => {
              const contrato = contratos.find(
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
                        href={pago.COMPROBANTE}
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
            })}
          </div>
        )}
      </Seccion>
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

      <div className="p-5">{children}</div>
    </div>
  );
}

function Dato({
  etiqueta,
  valor,
}: {
  etiqueta: string;
  valor: string;
}) {
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

    return new Intl.DateTimeFormat(
      "es-US"
    ).format(
      new Date(anio, mes - 1, dia)
    );
  }

  const fechaConvertida = new Date(fecha);

  if (
    Number.isNaN(fechaConvertida.getTime())
  ) {
    return fecha;
  }

  return new Intl.DateTimeFormat(
    "es-US"
  ).format(fechaConvertida);
}