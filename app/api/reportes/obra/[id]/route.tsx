import React from "react";
import {
  renderToBuffer,
  type DocumentProps,
} from "@react-pdf/renderer";

import apiobra from "@/app/api/apiobra";
import apicliente from "@/app/api/apicliente";
import apicontrato from "@/app/api/apicontrato";
import apicobro from "@/app/api/apicobro";
import apipago from "@/app/api/apipago";
import apicontratista from "@/app/api/apicontratista";

import ReporteObraPDF from "@/app/components/reportes/ReporteObraPDF";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  request: Request,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const idObra = decodeURIComponent(id);

    const [
      obras,
      clientes,
      contratos,
      cobros,
      pagos,
      contratistas,
    ] = await Promise.all([
      apiobra(),
      apicliente(),
      apicontrato(),
      apicobro(),
      apipago(),
      apicontratista(),
    ]);

    const obra = obras.find(
      (item: any) => item.ID_OBRA === idObra
    );

    if (!obra) {
      return Response.json(
        {
          error: "Obra no encontrada",
        },
        {
          status: 404,
        }
      );
    }

    const cliente = clientes.find(
      (item: any) =>
        item.ID_CLIENTE === obra.ID_CLIENTE
    );

    const contratosObra = contratos.filter(
      (contrato: any) =>
        contrato.ID_OBRA === obra.ID_OBRA
    );

    const cobrosObra = cobros.filter(
      (cobro: any) =>
        cobro.ID_OBRA === obra.ID_OBRA
    );

    const idsContratos = new Set(
      contratosObra.map(
        (contrato: any) =>
          contrato.ID_CONTRATO
      )
    );

    const pagosObra = pagos.filter(
      (pago: any) =>
        idsContratos.has(pago.ID_CONTRATO)
    );

    const presupuesto = contratosObra.reduce(
      (total: number, contrato: any) =>
        total + convertirNumero(contrato.MONTO),
      0
    );

    const totalCobrado = cobrosObra.reduce(
      (total: number, cobro: any) =>
        total + convertirNumero(cobro.MONTO),
      0
    );

    const totalPagado = pagosObra.reduce(
      (total: number, pago: any) =>
        total + convertirNumero(pago.MONTO),
      0
    );

    const contratosReporte = contratosObra.map(
      (contrato: any) => {
        const contratista = contratistas.find(
          (item: any) =>
            item.ID_CONTRATISTA ===
            contrato.ID_CONTRATISTA
        );

        const pagosContrato = pagosObra.filter(
          (pago: any) =>
            pago.ID_CONTRATO ===
            contrato.ID_CONTRATO
        );

        const pagadoContrato = pagosContrato.reduce(
          (total: number, pago: any) =>
            total + convertirNumero(pago.MONTO),
          0
        );

        const montoContrato = convertirNumero(
          contrato.MONTO
        );

        return {
          id: String(contrato.ID_CONTRATO),
          contratista:
            contratista?.NOMBRE ||
            "Sin contratista",
          tipo:
            contrato.TIPO ||
            "Sin tipo",
          descripcion:
            contrato.DESCRIPCION ||
            "Sin descripción",
          fecha: contrato.FECHA || "",
          monto: montoContrato,
          pagado: pagadoContrato,
          saldo: montoContrato - pagadoContrato,
        };
      }
    );

    const cobrosReporte = cobrosObra.map(
      (cobro: any, index: number) => ({
        id: String(
          cobro.ID_COBRO ||
            cobro.ID_COBROS ||
            index
        ),
        fecha: cobro.FECHA || "",
        descripcion:
          cobro.DESCRIPCION ||
          cobro.CONCEPTO ||
          "Cobro del cliente",
        monto: convertirNumero(cobro.MONTO),
      })
    );

    const pagosReporte = pagosObra.map(
      (pago: any, index: number) => {
        const contrato = contratosObra.find(
          (item: any) =>
            item.ID_CONTRATO ===
            pago.ID_CONTRATO
        );

        const contratista = contratistas.find(
          (item: any) =>
            item.ID_CONTRATISTA ===
            (
              pago.ID_CONTRATISTA ||
              contrato?.ID_CONTRATISTA
            )
        );

        return {
          id: String(
            pago.ID_PAGO ||
              pago.ID_PAGOS ||
              index
          ),
          fecha: pago.FECHA || "",
          contratista:
            contratista?.NOMBRE ||
            "Sin contratista",
          contrato:
            contrato?.TIPO ||
            contrato?.DESCRIPCION ||
            "Sin contrato",
          monto: convertirNumero(pago.MONTO),
        };
      }
    );

    const documento = React.createElement(
  ReporteObraPDF,
  {
    obra: {
      nombre: obra.NOMBRE || "Sin nombre",
      direccion: obra.DIRECCION || "Sin dirección",
      fecha: obra.FECHA || "",
      estado: obra.ESTADO || "Sin estado",
    },

    cliente: {
      nombre: cliente?.NOMBRE || "Sin cliente",
      cuit: cliente?.CUIT || "Sin CUIT",
      telefono: cliente?.TELEFONO || "Sin teléfono",
      condicionIva:
        cliente?.CONDICION_IVA || "Sin información",
    },

    resumen: {
      presupuesto,
      cobrado: totalCobrado,
      saldoCobrar: presupuesto - totalCobrado,
      pagado: totalPagado,
      saldoContratos: presupuesto - totalPagado,
    },

    contratos: contratosReporte,
    cobros: cobrosReporte,
    pagos: pagosReporte,
  }
) as unknown as React.ReactElement<DocumentProps>;

    const buffer = await renderToBuffer(
      documento
    );

    const nombreArchivo = limpiarNombreArchivo(
      obra.NOMBRE ||
        
        "obra"
    );

    return new Response(
      new Uint8Array(buffer),
      {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",

          "Content-Disposition":
            `inline; filename="resumen-${nombreArchivo}.pdf"`,

          "Cache-Control":
            "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error(
      "Error generando PDF:",
      error
    );

    return Response.json(
      {
        error:
          "No se pudo generar el PDF",
      },
      {
        status: 500,
      }
    );
  }
}

function convertirNumero(valor: unknown) {
  if (typeof valor === "number") {
    return valor;
  }

  if (!valor) {
    return 0;
  }

  const limpio = String(valor)
    .replace(/\$/g, "")
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(",", ".");

  const numero = Number(limpio);

  return Number.isNaN(numero)
    ? 0
    : numero;
}

function limpiarNombreArchivo(
  nombre: string
) {
  return nombre
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}