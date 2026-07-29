import apiobra from "@/app/api/apiobra";
import apicontrato from "@/app/api/apicontrato";
import apicontratista from "@/app/api/apicontratista";
import apicobro from "@/app/api/apicobro";
import apipago from "@/app/api/apipago";

import ListaMovimientos from "@/app/components/movimientos/ListaMovimientos";

export default async function MovimientosPage() {
  const [
    obras,
    contratos,
    contratistas,
    cobros,
    pagos,
  ] = await Promise.all([
    apiobra(),
    apicontrato(),
    apicontratista(),
    apicobro(),
    apipago(),
  ]);

  const cobrosVista = cobros.map((cobro) => {
    const obra = obras.find(
      (item) => item.ID_OBRA === cobro.ID_OBRA
    );

    return {
      id: cobro.ID_COBROS,
      obra: obra?.NOMBRE ?? "Obra no encontrada",
      fecha: cobro.FECHA,
      monto: cobro.MONTO,
      comprobante: cobro.COMPROBANTE,
    };
  });

  const pagosVista = pagos.map((pago) => {
    const contrato = contratos.find(
      (item) =>
        item.ID_CONTRATO === pago.ID_CONTRATO
    );

    const contratista = contratistas.find(
      (item) =>
        item.ID_CONTRATISTA ===
        pago.ID_CONTRATISTA
    );

    const obra = obras.find(
      (item) =>
        item.ID_OBRA === contrato?.ID_OBRA
    );

    return {
      id: pago.ID_PAGO,
      contratista:
        contratista?.NOMBRE ??
        "Contratista no encontrado",
      obra: obra?.NOMBRE ?? "Obra no encontrada",
      contrato: contrato
        ? `${contrato.TIPO} - ${contrato.DESCRIPCION}`
        : "Contrato no encontrado",
      fecha: pago.FECHA,
      monto: pago.MONTO,
      comprobante: pago.COMPROBANTE,
    };
  });

  cobrosVista.sort(
    (a, b) =>
      obtenerTiempo(b.fecha) - obtenerTiempo(a.fecha)
  );

  pagosVista.sort(
    (a, b) =>
      obtenerTiempo(b.fecha) - obtenerTiempo(a.fecha)
  );

  const totalCobrado = cobros.reduce(
    (total, cobro) => total + cobro.MONTO,
    0
  );

  const totalPagado = pagos.reduce(
    (total, pago) => total + pago.MONTO,
    0
  );

  const diferencia = totalCobrado - totalPagado;

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">
          Control financiero
        </p>

        <h1 className="mt-1 text-3xl font-bold text-slate-900">
          Movimientos
        </h1>

        <p className="mt-2 text-slate-500">
          Historial general de cobros de clientes y
          pagos a contratistas.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ResumenCard
          titulo="Cantidad de cobros"
          valor={String(cobros.length)}
        />

        <ResumenCard
          titulo="Total cobrado"
          valor={formatearDinero(totalCobrado)}
          variante="positivo"
        />

        <ResumenCard
          titulo="Total pagado"
          valor={formatearDinero(totalPagado)}
          variante="pago"
        />

        <ResumenCard
          titulo="Diferencia"
          valor={formatearDinero(diferencia)}
          variante={
            diferencia >= 0 ? "positivo" : "negativo"
          }
        />
      </div>

      <ListaMovimientos
        cobros={cobrosVista}
        pagos={pagosVista}
      />
    </section>
  );
}

type ResumenCardProps = {
  titulo: string;
  valor: string;
  variante?:
    | "normal"
    | "positivo"
    | "pago"
    | "negativo";
};

function ResumenCard({
  titulo,
  valor,
  variante = "normal",
}: ResumenCardProps) {
  const color =
    variante === "positivo"
      ? "text-emerald-700"
      : variante === "pago"
        ? "text-amber-700"
        : variante === "negativo"
          ? "text-red-700"
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

function formatearDinero(valor: number) {
  return new Intl.NumberFormat("es-US", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(valor);
}

function obtenerTiempo(fecha: string) {
  if (!fecha) {
    return 0;
  }

  const partes = fecha
    .trim()
    .split(/[\/\-]/)
    .map(Number);

  if (partes.length === 3) {
    if (partes[0] > 31) {
      const [anio, mes, dia] = partes;
      return new Date(anio, mes - 1, dia).getTime();
    }

    const [dia, mes, anio] = partes;
    return new Date(anio, mes - 1, dia).getTime();
  }

  const fechaConvertida = new Date(fecha);

  if (Number.isNaN(fechaConvertida.getTime())) {
    return 0;
  }

  return fechaConvertida.getTime();
}