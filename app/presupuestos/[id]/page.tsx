import Link from "next/link";
import { notFound } from "next/navigation";

import apipresupuesto from "@/app/api/apipresupuesto";
import apitrabajopresupuesto from "@/app/api/apitrabajopresupuesto";
import apihonorariopresupuesto from "@/app/api/apihonorariopresupuesto";
import BotonPDF from "@/app/components/presupuestos/BotonPDF";

type PresupuestoDetallePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PresupuestoDetallePage({
  params,
}: PresupuestoDetallePageProps) {
  const { id } = await params;
  const idDecodificado = decodeURIComponent(id);

  const [
    presupuestos,
    trabajos,
    honorarios,
  ] = await Promise.all([
    apipresupuesto(),
    apitrabajopresupuesto(),
    apihonorariopresupuesto(),
  ]);

  const presupuesto = presupuestos.find(
    (item) =>
      item.ID_PRESUPUESTO === idDecodificado
  );

  if (!presupuesto) {
    notFound();
  }

  const trabajosDelPresupuesto = trabajos.filter(
    (trabajo) =>
      trabajo.ID_PRESUPUESTO ===
      presupuesto.ID_PRESUPUESTO
  );

  const honorariosDelPresupuesto = honorarios.filter(
    (honorario) =>
      honorario.ID_PRESUPUESTO ===
      presupuesto.ID_PRESUPUESTO
  );

  return (
    <section className="space-y-6">
      <div>
        <Link
          href="/presupuestos"
          className="text-sm font-semibold text-slate-500 transition hover:text-slate-900"
        >
          ← Volver a presupuestos
        </Link>

        <div className="mt-4 flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              Detalle del presupuesto
            </p>

            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              {presupuesto.CLIENTE ||
                "Cliente sin nombre"}
            </h1>

            <p className="mt-2 text-slate-500">
              {presupuesto.DIRECCION_OBRA ||
                "Sin dirección registrada"}
            </p>
          </div>

          <span
            className={`w-fit rounded-full px-4 py-2 text-sm font-semibold ${obtenerColorEstado(
              presupuesto.ESTADO
            )}`}
          >
            {presupuesto.ESTADO ||
              "Sin estado"}
          </span>
          <BotonPDF
    idPresupuesto={
      presupuesto.ID_PRESUPUESTO
    }
  />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ResumenCard
          titulo="Trabajos USD"
          valor={formatearUSD(
            presupuesto.TOTAL_TRABAJOS_USD
          )}
        />

        <ResumenCard
          titulo="Honorarios USD"
          valor={formatearUSD(
            presupuesto.TOTAL_HONORARIOS_USD
          )}
        />

        <ResumenCard
          titulo="Total USD"
          valor={formatearUSD(
            presupuesto.TOTAL_USD
          )}
          variante="positivo"
        />

        <ResumenCard
          titulo="Total ARS"
          valor={formatearARS(
            presupuesto.TOTAL_ARS
          )}
          variante="positivo"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <Seccion titulo="Datos del cliente">
            <div className="grid gap-5 sm:grid-cols-2">
              <Dato
                etiqueta="Cliente"
                valor={
                  presupuesto.CLIENTE ||
                  "Sin nombre"
                }
              />

              <Dato
                etiqueta="Fecha"
                valor={formatearFecha(
                  presupuesto.FECHA
                )}
              />

              <Dato
                etiqueta="Teléfono"
                valor={
                  presupuesto.TELEFONO ||
                  "Sin teléfono"
                }
              />

              <Dato
                etiqueta="Email"
                valor={
                  presupuesto.EMAIL ||
                  "Sin email"
                }
              />

              <Dato
                etiqueta="Dirección de obra"
                valor={
                  presupuesto.DIRECCION_OBRA ||
                  "Sin dirección"
                }
              />

              <Dato
                etiqueta="Estado"
                valor={
                  presupuesto.ESTADO ||
                  "Sin estado"
                }
              />
            </div>
          </Seccion>
        </div>

        <Seccion titulo="Conversión">
          <div className="space-y-4">
            <Dato
              etiqueta="Tipo de cambio"
              valor={formatearARS(
                presupuesto.TIPO_CAMBIO
              )}
            />

            <Dato
              etiqueta="Total USD"
              valor={formatearUSD(
                presupuesto.TOTAL_USD
              )}
            />

            <Dato
              etiqueta="Total ARS"
              valor={formatearARS(
                presupuesto.TOTAL_ARS
              )}
            />
          </div>
        </Seccion>
      </div>

      <Seccion
        titulo="Trabajos"
        cantidad={trabajosDelPresupuesto.length}
      >
        {trabajosDelPresupuesto.length === 0 ? (
          <MensajeVacio texto="No hay trabajos registrados." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-200 text-left">
                  <Th>Tipo de trabajo</Th>
                  <Th>Superficie</Th>
                  <Th>Precio m² USD</Th>
                  <Th>Subtotal USD</Th>
                </tr>
              </thead>

              <tbody>
                {trabajosDelPresupuesto.map(
                  (trabajo) => (
                    <tr
                      key={trabajo.ID_TRABAJO}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <Td>
                        {trabajo.NOMBRE_TRABAJO || "Sin tipo"}
                      </Td>

                      <Td>
                        {formatearMetros(
                          trabajo.SUPERFICIE_M2
                        )}
                      </Td>

                      <Td>
                        {formatearUSD(
                          trabajo.PRECIO_M2_USD
                        )}
                      </Td>

                      <Td destacado>
                        {formatearUSD(
                          trabajo.SUBTOTAL_USD
                        )}
                      </Td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </Seccion>

      <Seccion
        titulo="Honorarios"
        cantidad={honorariosDelPresupuesto.length}
      >
        {honorariosDelPresupuesto.length === 0 ? (
          <MensajeVacio texto="No hay honorarios registrados." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-200 text-left">
                  <Th>Honorario</Th>
                  <Th>Porcentaje</Th>
                  <Th>Base USD</Th>
                  <Th>Monto USD</Th>
                </tr>
              </thead>

              <tbody>
                {honorariosDelPresupuesto.map(
                  (honorario) => (
                    <tr
                      key={
                        honorario.ID_HONORARIO_PRESUPUESTO
                      }
                      className="border-b border-slate-100 last:border-0"
                    >
                      <Td>
                        {honorario.NOMBRE_HONORARIO || "Sin honorario"}
                      </Td>

                      <Td>
                        {formatearPorcentaje(
                          honorario.PORCENTAJE
                        )}
                      </Td>

                      <Td>
                        {formatearUSD(
                          honorario.BASE_CALCULO_USD
                        )}
                      </Td>

                      <Td destacado>
                        {formatearUSD(
                          honorario.MONTO_USD
                        )}
                      </Td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </Seccion>

      {presupuesto.OBSERVACIONES && (
        <Seccion titulo="Observaciones">
          <p className="whitespace-pre-line text-sm leading-6 text-slate-600">
            {presupuesto.OBSERVACIONES}
          </p>
        </Seccion>
      )}
    </section>
  );
}

type ResumenCardProps = {
  titulo: string;
  valor: string;
  variante?: "normal" | "positivo";
};

function ResumenCard({
  titulo,
  valor,
  variante = "normal",
}: ResumenCardProps) {
  const color =
    variante === "positivo"
      ? "text-emerald-700"
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

function formatearUSD(valor: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(Number(valor) || 0);
}

function formatearARS(valor: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(Number(valor) || 0);
}

function formatearMetros(valor: number) {
  return `${new Intl.NumberFormat("es-AR", {
    maximumFractionDigits: 2,
  }).format(Number(valor) || 0)} m²`;
}

function formatearPorcentaje(
  valor: string | number
) {
  if (typeof valor === "string") {
    const texto = valor.trim();

    if (texto.includes("%")) {
      return texto;
    }

    const numero = Number(
      texto.replace(",", ".")
    );

    if (!Number.isFinite(numero)) {
      return "0%";
    }

    return numero > 1
      ? `${numero}%`
      : `${numero * 100}%`;
  }

  if (!Number.isFinite(valor)) {
    return "0%";
  }

  return valor > 1
    ? `${valor}%`
    : `${valor * 100}%`;
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
      "es-AR"
    ).format(
      new Date(anio, mes - 1, dia)
    );
  }

  const fechaConvertida = new Date(fecha);

  if (Number.isNaN(fechaConvertida.getTime())) {
    return fecha;
  }

  return new Intl.DateTimeFormat(
    "es-AR"
  ).format(fechaConvertida);
}

function obtenerColorEstado(
  estado: string
) {
  const estadoNormalizado = String(
    estado || ""
  )
    .trim()
    .toLowerCase();

  if (
    estadoNormalizado === "aprobado" ||
    estadoNormalizado === "aprobada"
  ) {
    return "bg-emerald-100 text-emerald-700";
  }

  if (
    estadoNormalizado === "enviado" ||
    estadoNormalizado === "enviada"
  ) {
    return "bg-blue-100 text-blue-700";
  }

  if (
    estadoNormalizado === "rechazado" ||
    estadoNormalizado === "rechazada"
  ) {
    return "bg-red-100 text-red-700";
  }

  if (estadoNormalizado === "borrador") {
    return "bg-amber-100 text-amber-700";
  }

  return "bg-slate-100 text-slate-700";
}