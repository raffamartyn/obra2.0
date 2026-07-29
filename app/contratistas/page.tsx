import apicontratista from "@/app/api/apicontratista";
import apicontrato from "@/app/api/apicontrato";
import apipago from "@/app/api/apipago";

import ContratistaCard from "@/app/components/contratistas/ContratistaCard";

export default async function ContratistasPage() {
  const [contratistas, contratos, pagos] = await Promise.all([
    apicontratista(),
    apicontrato(),
    apipago(),
  ]);

  const contratistasConResumen = contratistas.map(
    (contratista) => {
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

      const totalContratado =
        contratosDelContratista.reduce(
          (total, contrato) => total + contrato.MONTO,
          0
        );

      const totalPagado = pagosDelContratista.reduce(
        (total, pago) => total + pago.MONTO,
        0
      );

      const idsObras = new Set(
        contratosDelContratista
          .map((contrato) => contrato.ID_OBRA)
          .filter(Boolean)
      );

      return {
        ...contratista,
        cantidadContratos: contratosDelContratista.length,
        cantidadObras: idsObras.size,
        totalContratado,
        totalPagado,
      };
    }
  );

  const totalContratadoGeneral =
    contratistasConResumen.reduce(
      (total, contratista) =>
        total + contratista.totalContratado,
      0
    );

  const totalPagadoGeneral = contratistasConResumen.reduce(
    (total, contratista) =>
      total + contratista.totalPagado,
    0
  );

  const saldoGeneral =
    totalContratadoGeneral - totalPagadoGeneral;

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">
          Gestión general
        </p>

        <h1 className="mt-1 text-3xl font-bold text-slate-900">
          Contratistas
        </h1>

        <p className="mt-2 text-slate-500">
          Control de contratos, obras y pagos por
          contratista.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ResumenCard
          titulo="Contratistas"
          valor={String(contratistasConResumen.length)}
        />

        <ResumenCard
          titulo="Total contratado"
          valor={formatearDinero(totalContratadoGeneral)}
        />

        <ResumenCard
          titulo="Total pagado"
          valor={formatearDinero(totalPagadoGeneral)}
          variante="positivo"
        />

        <ResumenCard
          titulo="Saldo pendiente"
          valor={formatearDinero(saldoGeneral)}
          variante={
            saldoGeneral > 0 ? "pendiente" : "positivo"
          }
        />
      </div>

      {contratistasConResumen.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <h2 className="text-lg font-bold text-slate-900">
            No hay contratistas registrados
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Cuando cargues contratistas en AppSheet,
            aparecerán acá.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
          {contratistasConResumen.map((contratista) => (
            <ContratistaCard
              key={contratista.ID_CONTRATISTA}
              idContratista={
                contratista.ID_CONTRATISTA
              }
              nombre={contratista.NOMBRE}
              cuil={contratista.CUIL}
              telefono={contratista.TELEFONO}
              cantidadContratos={
                contratista.cantidadContratos
              }
              cantidadObras={contratista.cantidadObras}
              totalContratado={
                contratista.totalContratado
              }
              totalPagado={contratista.totalPagado}
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

function formatearDinero(valor: number) {
  return new Intl.NumberFormat("es-US", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(valor);
}