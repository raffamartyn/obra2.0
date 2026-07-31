import Link from "next/link";
import { notFound } from "next/navigation";

import apicontratista from "@/app/api/apicontratista";
import apicontrato from "@/app/api/apicontrato";
import apipago from "@/app/api/apipago";
import apiobra from "@/app/api/apiobra";

import DetalleContratistaCliente from "@/app/components/contratistas/DetalleContratistaCliente";

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

  const contratosConComision =
    contratosDelContratista.map((contrato) => {
      const datos = contrato as typeof contrato & {
        TOTAL?: unknown;
        DESCUENTOS?: unknown;
        COMISION_MONTO?: unknown;
      };

      const totalGuardado = convertirNumero(
        datos.TOTAL
      );

      const montoAnterior = convertirNumero(
        contrato.MONTO
      );

      const totalContratista =
  totalGuardado > 0
    ? totalGuardado
    : montoAnterior;

const porcentajeComision =
  convertirPorcentaje(datos.DESCUENTOS);

const comisionMonto =
  convertirNumero(datos.COMISION_MONTO);

const totalContrato =
  totalContratista + comisionMonto;

      return {
        ...contrato,
        totalContrato,
        porcentajeComision,
        comisionMonto,
        totalContratista,
      };
    });

  const idsContratos = new Set(
    contratosDelContratista.map(
      (contrato) =>
        contrato.ID_CONTRATO
    )
  );

  /*
   * Se relacionan los pagos por contrato.
   * Esto evita perder pagos si ID_CONTRATISTA
   * está vacío en la hoja de pagos.
   */
  const pagosDelContratista = pagos.filter(
    (pago) =>
      idsContratos.has(
        pago.ID_CONTRATO
      )
  );

  const idsObras = new Set(
    contratosDelContratista.map(
      (contrato) => contrato.ID_OBRA
    )
  );

  const obrasDelContratista = obras.filter(
    (obra) =>
      idsObras.has(obra.ID_OBRA)
  );

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
            Control de contratos, comisiones,
            obras y pagos.
          </p>
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
              contratista.CUIL ||
              "Sin CUIL"
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
              contratista.CBU ||
              "Sin CBU"
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

      <DetalleContratistaCliente
        obras={obrasDelContratista.map(
          (obra) => ({
            ID_OBRA: obra.ID_OBRA,
            NOMBRE: obra.NOMBRE,
            DIRECCION:
              obra.DIRECCION || "",
          })
        )}
        contratos={contratosConComision.map(
          (contrato) => ({
            ID_CONTRATO:
              contrato.ID_CONTRATO,
            ID_OBRA:
              contrato.ID_OBRA,
            TIPO:
              contrato.TIPO || "",
            DESCRIPCION:
              contrato.DESCRIPCION || "",
            FECHA:
              contrato.FECHA || "",
            DOCUMENTO:
              contrato.DOCUMENTO || "",
            totalContrato:
              contrato.totalContrato,
            porcentajeComision:
              contrato.porcentajeComision,
            comisionMonto:
              contrato.comisionMonto,
            totalContratista:
              contrato.totalContratista,
          })
        )}
        pagos={pagosDelContratista.map(
          (pago) => ({
            ID_PAGO:
              pago.ID_PAGO,
            ID_CONTRATO:
              pago.ID_CONTRATO,
            MONTO:
              convertirNumero(pago.MONTO),
            FECHA:
              pago.FECHA || "",
            COMPROBANTE:
              pago.COMPROBANTE || "",
          })
        )}
      />

      
    </section>
  );
}

type SeccionProps = {
  titulo: string;
  children: React.ReactNode;
};

function Seccion({
  titulo,
  children,
}: SeccionProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="text-lg font-bold text-slate-900">
          {titulo}
        </h2>
      </div>

      <div className="p-5">
        {children}
      </div>
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

function convertirNumero(
  valor: unknown
): number {
  if (typeof valor === "number") {
    return Number.isFinite(valor)
      ? valor
      : 0;
  }

  const texto = String(
    valor ?? ""
  ).trim();

  if (!texto) {
    return 0;
  }

  const numero = Number(
    texto
      .replace(/\$/g, "")
      .replace(/\s/g, "")
      .replace(/\./g, "")
      .replace(",", ".")
  );

  return Number.isFinite(numero)
    ? numero
    : 0;
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

  const texto = String(valor).trim();

  if (!texto) {
    return 0;
  }

  const tienePorcentaje =
    texto.includes("%");

  const numero = Number(
    texto
      .replace("%", "")
      .replace(/\s/g, "")
      .replace(",", ".")
  );

  if (!Number.isFinite(numero)) {
    return 0;
  }

  /*
   * Ejemplos:
   * "10%"  → 0.10
   * "10"   → 0.10
   * "0,10" → 0.10
   * 0.10   → 0.10
   */
  if (
    tienePorcentaje ||
    numero > 1
  ) {
    return numero / 100;
  }

  return numero;
}