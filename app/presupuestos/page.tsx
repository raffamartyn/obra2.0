import apipresupuesto from "@/app/api/apipresupuesto";

import ListaPresupuestos from "@/app/components/presupuestos/ListaPresupuestos";

export default async function PresupuestosPage() {
  const presupuestos = await apipresupuesto();

  const totalPresupuestadoUSD = presupuestos.reduce(
    (total, presupuesto) =>
      total + convertirNumero(presupuesto.TOTAL_USD),
    0
  );

  const totalPresupuestadoARS = presupuestos.reduce(
    (total, presupuesto) =>
      total + convertirNumero(presupuesto.TOTAL_ARS),
    0
  );

  const presupuestosAprobados = presupuestos.filter(
    (presupuesto) =>
      normalizarTexto(presupuesto.ESTADO) === "aprobado" ||
      normalizarTexto(presupuesto.ESTADO) === "aprobada"
  ).length;

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">
          Presupuestos
        </p>

        <h1 className="mt-1 text-3xl font-bold text-slate-900">
          Presupuestos para clientes
        </h1>

        <p className="mt-2 text-slate-500">
          Consultá los presupuestos generados desde AppSheet.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ResumenCard
          titulo="Presupuestos"
          valor={String(presupuestos.length)}
        />

        <ResumenCard
          titulo="Aprobados"
          valor={String(presupuestosAprobados)}
          variante="positivo"
        />

        <ResumenCard
          titulo="Total en USD"
          valor={formatearUSD(totalPresupuestadoUSD)}
        />

        <ResumenCard
          titulo="Total en ARS"
          valor={formatearARS(totalPresupuestadoARS)}
        />
      </div>

      <ListaPresupuestos presupuestos={presupuestos} />
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

function convertirNumero(valor: unknown): number {
  if (typeof valor === "number") {
    return Number.isFinite(valor) ? valor : 0;
  }

  const texto = String(valor ?? "")
    .trim()
    .replace(/\$/g, "")
    .replace(/\s/g, "");

  if (!texto) {
    return 0;
  }

  let normalizado = texto;

  const tieneComa = texto.includes(",");
  const tienePunto = texto.includes(".");

  if (tieneComa && tienePunto) {
    normalizado = texto
      .replace(/\./g, "")
      .replace(",", ".");
  } else if (tieneComa) {
    normalizado = texto.replace(",", ".");
  } else if (tienePunto) {
    const partes = texto.split(".");

    const pareceSeparadorDeMiles =
      partes.length > 2 ||
      (partes.length === 2 &&
        partes[1].length === 3 &&
        partes[0] !== "0");

    if (pareceSeparadorDeMiles) {
      normalizado = texto.replace(/\./g, "");
    }
  }

  const numero = Number(normalizado);

  return Number.isFinite(numero) ? numero : 0;
}

function formatearUSD(valor: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(valor);
}

function formatearARS(valor: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(valor);
}

function normalizarTexto(valor: string) {
  return String(valor || "")
    .trim()
    .toLowerCase();
}