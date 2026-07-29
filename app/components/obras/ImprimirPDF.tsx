"use client";

type ImprimirPDFProps = {
  nombreObra: string;
};

export default function ImprimirPDF({
  nombreObra,
}: ImprimirPDFProps) {
  const imprimir = () => {
    const tituloAnterior = document.title;

    document.title = `Resumen - ${nombreObra}`;
    window.print();

    setTimeout(() => {
      document.title = tituloAnterior;
    }, 500);
  };

  return (
    <div className="no-print mb-6 flex justify-end gap-3">
      <button
        type="button"
        onClick={() => window.close()}
        className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold"
      >
        Cerrar
      </button>

      <button
        type="button"
        onClick={imprimir}
        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
      >
        Guardar como PDF
      </button>
    </div>
  );
}