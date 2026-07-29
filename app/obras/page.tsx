import apiobra from "@/app/api/apiobra";
import apicliente from "@/app/api/apicliente";
import apicontrato from "@/app/api/apicontrato";
import apicobro from "@/app/api/apicobro";

import ObraCard from "@/app/components/obras/ObraCard";

export default async function ObrasPage() {
  const [obras, clientes, contratos, cobros] =
    await Promise.all([
      apiobra(),
      apicliente(),
      apicontrato(),
      apicobro(),
    ]);

  const obrasConResumen = obras.map((obra) => {
    const cliente = clientes.find(
      (item) => item.ID_CLIENTE === obra.ID_CLIENTE
    );

    const contratosDeLaObra = contratos.filter(
      (contrato) => contrato.ID_OBRA === obra.ID_OBRA
    );

    const cobrosDeLaObra = cobros.filter(
      (cobro) => cobro.ID_OBRA === obra.ID_OBRA
    );

    const presupuesto = contratosDeLaObra.reduce(
      (total, contrato) => total + contrato.MONTO,
      0
    );

    const cobrado = cobrosDeLaObra.reduce(
      (total, cobro) => total + cobro.MONTO,
      0
    );

    return {
      ...obra,
      nombreCliente: cliente?.NOMBRE ?? "Cliente no encontrado",
      presupuesto,
      cobrado,
    };
  });

  const presupuestoTotal = obrasConResumen.reduce(
    (total, obra) => total + obra.presupuesto,
    0
  );

  const totalCobrado = obrasConResumen.reduce(
    (total, obra) => total + obra.cobrado,
    0
  );

  const saldoTotal = presupuestoTotal - totalCobrado;

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">
          Gestión general
        </p>

        <h1 className="mt-1 text-3xl font-bold text-slate-900">
          Obras
        </h1>

        <p className="mt-2 text-slate-500">
          Control de presupuestos, clientes y cobros por obra.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ResumenCard
          titulo="Obras"
          valor={String(obrasConResumen.length)}
        />

        <ResumenCard
          titulo="Presupuesto total"
          valor={formatearDinero(presupuestoTotal)}
        />

        <ResumenCard
          titulo="Total cobrado"
          valor={formatearDinero(totalCobrado)}
        />

        <ResumenCard
          titulo="Saldo por cobrar"
          valor={formatearDinero(saldoTotal)}
        />
      </div>

      {obrasConResumen.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <h2 className="text-lg font-bold text-slate-900">
            No hay obras registradas
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Cuando cargues obras en AppSheet, aparecerán acá.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
          {obrasConResumen.map((obra) => (
            <ObraCard
              key={obra.ID_OBRA}
              idObra={obra.ID_OBRA}
              nombre={obra.NOMBRE}
              cliente={obra.nombreCliente}
              direccion={obra.DIRECCION}
              estado={obra.ESTADO}
              presupuesto={obra.presupuesto}
              cobrado={obra.cobrado}
            />
          ))}
        </div>
      )}
    </section>
  );
}

type ResumenCardProps = {
  titulo: string;
  valor: string;
};

function ResumenCard({
  titulo,
  valor,
}: ResumenCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">
        {titulo}
      </p>

      <p className="mt-2 text-2xl font-bold text-slate-900">
        {valor}
      </p>
    </div>
  );
}

function formatearDinero(valor: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(valor);
}