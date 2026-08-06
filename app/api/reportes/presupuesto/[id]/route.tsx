import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";

import apipresupuesto from "@/app/api/apipresupuesto";
import apitrabajopresupuesto from "@/app/api/apitrabajopresupuesto";
import apihonorariopresupuesto from "@/app/api/apihonorariopresupuesto";

import ReportePresupuestoPDF from "@/app/components/reportes/ReportePresupuestoPDF";

type RouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _request: Request,
  { params }: RouteProps
) {
  try {
    const { id } = await params;

    const idDecodificado =
      decodeURIComponent(id);

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
        item.ID_PRESUPUESTO ===
        idDecodificado
    );

    if (!presupuesto) {
      return NextResponse.json(
        {
          error:
            "Presupuesto no encontrado",
        },
        {
          status: 404,
        }
      );
    }

    const trabajosDelPresupuesto =
      trabajos.filter(
        (trabajo) =>
          trabajo.ID_PRESUPUESTO ===
          presupuesto.ID_PRESUPUESTO
      );

    const honorariosDelPresupuesto =
      honorarios.filter(
        (honorario) =>
          honorario.ID_PRESUPUESTO ===
          presupuesto.ID_PRESUPUESTO
      );

    const documento = (
      <ReportePresupuestoPDF
        presupuesto={presupuesto}
        trabajos={
          trabajosDelPresupuesto
        }
        honorarios={
          honorariosDelPresupuesto
        }
      />
    );

    /*
     * renderToBuffer devuelve un Buffer de Node.
     * Lo convertimos a Uint8Array para que
     * NextResponse lo acepte como cuerpo.
     */
    const bufferPDF =
      await renderToBuffer(documento);

    const contenidoPDF =
      new Uint8Array(bufferPDF);

    const nombreCliente =
      limpiarNombreArchivo(
        presupuesto.CLIENTE ||
          presupuesto.ID_PRESUPUESTO
      );

    return new NextResponse(
      contenidoPDF,
      {
        status: 200,
        headers: {
          "Content-Type":
            "application/pdf",

          "Content-Disposition":
            `inline; filename="Presupuesto-${nombreCliente}.pdf"`,

          "Cache-Control":
            "no-store",
        },
      }
    );
  } catch (error) {
    console.error(
      "Error al generar el PDF del presupuesto:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Error al generar el PDF del presupuesto",
      },
      {
        status: 500,
      }
    );
  }
}

function limpiarNombreArchivo(
  valor: string
) {
  return String(valor || "cliente")
    .trim()
    .replace(
      /[<>:"/\\|?*\u0000-\u001F]/g,
      "-"
    )
    .replace(/\s+/g, "-")
    .slice(0, 80);
}