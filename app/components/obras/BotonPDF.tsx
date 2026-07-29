"use client";

import { useState } from "react";

type BotonPDFProps = {
  idObra: string;
};

export default function BotonPDF({
  idObra,
}: BotonPDFProps) {
  const [abriendo, setAbriendo] =
    useState(false);

  const abrirPDF = () => {
    try {
      setAbriendo(true);

      const url =
        `/api/reportes/obra/${encodeURIComponent(
          idObra
        )}`;

      window.open(
        url,
        "_blank",
        "noopener,noreferrer"
      );
    } finally {
      setTimeout(() => {
        setAbriendo(false);
      }, 1000);
    }
  };

  return (
    <button
      type="button"
      onClick={abrirPDF}
      disabled={abriendo}
      className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-wait disabled:opacity-60"
    >
      {abriendo
        ? "Generando..."
        : "Generar PDF"}
    </button>
  );
}