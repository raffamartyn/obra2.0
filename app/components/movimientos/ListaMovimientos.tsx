"use client";

import { useMemo, useState } from "react";

type CobroVista = {
  id: string;
  obra: string;
  fecha: string;
  monto: number;
  comprobante: string;
};

type PagoVista = {
  id: string;
  contratista: string;
  obra: string;
  contrato: string;
  fecha: string;
  monto: number;
  comprobante: string;
};

type ListaMovimientosProps = {
  cobros: CobroVista[];
  pagos: PagoVista[];
};

type TipoFiltro =
  | "todos"
  | "cobros"
  | "pagos";

type MovimientoVista = {
  id: string;
  tipo: "Cobro" | "Pago";
  obra: string;
  contratista: string;
  contrato: string;
  fecha: string;
  monto: number;
  comprobante: string;
};

export default function ListaMovimientos({
  cobros,
  pagos,
}: ListaMovimientosProps) {
  const [tipoSeleccionado, setTipoSeleccionado] =
    useState<TipoFiltro>("todos");

  const [obraSeleccionada, setObraSeleccionada] =
    useState("todas");

  const [
    contratistaSeleccionado,
    setContratistaSeleccionado,
  ] = useState("todos");

  const [fechaDesde, setFechaDesde] =
    useState("");

  const [fechaHasta, setFechaHasta] =
    useState("");

  /*
   * Unimos cobros y pagos en una sola lista.
   */
  const movimientos = useMemo<
    MovimientoVista[]
  >(() => {
    const listaCobros =
      cobros.map(
        (cobro): MovimientoVista => ({
          id: `cobro-${cobro.id}`,
          tipo: "Cobro",
          obra: cobro.obra,
          contratista: "",
          contrato: "",
          fecha: cobro.fecha,
          monto: cobro.monto,
          comprobante:
            cobro.comprobante,
        })
      );

    const listaPagos =
      pagos.map(
        (pago): MovimientoVista => ({
          id: `pago-${pago.id}`,
          tipo: "Pago",
          obra: pago.obra,
          contratista:
            pago.contratista,
          contrato: pago.contrato,
          fecha: pago.fecha,
          monto: pago.monto,
          comprobante:
            pago.comprobante,
        })
      );

    return [
      ...listaCobros,
      ...listaPagos,
    ].sort((a, b) => {
      const fechaA =
        convertirFechaAClave(a.fecha);

      const fechaB =
        convertirFechaAClave(b.fecha);

      return fechaB.localeCompare(
        fechaA
      );
    });
  }, [cobros, pagos]);

  const obrasDisponibles = useMemo(() => {
    const nombres = movimientos
      .map((movimiento) =>
        movimiento.obra.trim()
      )
      .filter(Boolean);

    return Array.from(
      new Set(nombres)
    ).sort((a, b) =>
      a.localeCompare(b, "es")
    );
  }, [movimientos]);

  const contratistasDisponibles =
    useMemo(() => {
      const nombres = pagos
        .map((pago) =>
          pago.contratista.trim()
        )
        .filter(Boolean);

      return Array.from(
        new Set(nombres)
      ).sort((a, b) =>
        a.localeCompare(b, "es")
      );
    }, [pagos]);

  const movimientosFiltrados =
    useMemo(() => {
      return movimientos.filter(
        (movimiento) => {
          const coincideTipo =
            tipoSeleccionado ===
              "todos" ||
            (tipoSeleccionado ===
              "cobros" &&
              movimiento.tipo ===
                "Cobro") ||
            (tipoSeleccionado ===
              "pagos" &&
              movimiento.tipo ===
                "Pago");

          const coincideObra =
            obraSeleccionada ===
              "todas" ||
            movimiento.obra ===
              obraSeleccionada;

          /*
           * El filtro de contratista solamente
           * afecta a los pagos.
           *
           * Si elegimos un contratista, los
           * cobros no aparecen porque no tienen
           * contratista.
           */
          const coincideContratista =
            contratistaSeleccionado ===
              "todos" ||
            movimiento.contratista ===
              contratistaSeleccionado;

          const fechaMovimiento =
            convertirFechaAClave(
              movimiento.fecha
            );

          const coincideDesde =
            !fechaDesde ||
            (fechaMovimiento !== "" &&
              fechaMovimiento >=
                fechaDesde);

          const coincideHasta =
            !fechaHasta ||
            (fechaMovimiento !== "" &&
              fechaMovimiento <=
                fechaHasta);

          return (
            coincideTipo &&
            coincideObra &&
            coincideContratista &&
            coincideDesde &&
            coincideHasta
          );
        }
      );
    }, [
      movimientos,
      tipoSeleccionado,
      obraSeleccionada,
      contratistaSeleccionado,
      fechaDesde,
      fechaHasta,
    ]);

  const totalCobrosFiltrados =
    movimientosFiltrados
      .filter(
        (movimiento) =>
          movimiento.tipo === "Cobro"
      )
      .reduce(
        (total, movimiento) =>
          total + movimiento.monto,
        0
      );

  const totalPagosFiltrados =
    movimientosFiltrados
      .filter(
        (movimiento) =>
          movimiento.tipo === "Pago"
      )
      .reduce(
        (total, movimiento) =>
          total + movimiento.monto,
        0
      );

  const hayFiltros =
    tipoSeleccionado !== "todos" ||
    obraSeleccionada !== "todas" ||
    contratistaSeleccionado !==
      "todos" ||
    fechaDesde !== "" ||
    fechaHasta !== "";

  const limpiarFiltros = () => {
    setTipoSeleccionado("todos");
    setObraSeleccionada("todas");
    setContratistaSeleccionado(
      "todos"
    );
    setFechaDesde("");
    setFechaHasta("");
  };

  const cambiarTipo = (
    tipo: TipoFiltro
  ) => {
    setTipoSeleccionado(tipo);

    if (tipo === "cobros") {
      setContratistaSeleccionado(
        "todos"
      );
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Filtrar movimientos
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Seleccioná el tipo, la obra y
              el período que querés consultar.
            </p>
          </div>

          <div className="text-sm text-slate-500">
            Mostrando{" "}
            <span className="font-bold text-slate-900">
              {
                movimientosFiltrados.length
              }
            </span>{" "}
            movimientos
          </div>
        </div>

        <div className="mt-4 grid gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2 xl:grid-cols-6">
          <CampoFiltro etiqueta="Tipo">
            <select
              value={tipoSeleccionado}
              onChange={(evento) =>
                cambiarTipo(
                  evento.target
                    .value as TipoFiltro
                )
              }
              className={estiloCampo}
            >
              <option value="todos">
                Todos los movimientos
              </option>

              <option value="cobros">
                Solamente cobros
              </option>

              <option value="pagos">
                Solamente pagos
              </option>
            </select>
          </CampoFiltro>

          <CampoFiltro etiqueta="Obra">
            <select
              value={obraSeleccionada}
              onChange={(evento) =>
                setObraSeleccionada(
                  evento.target.value
                )
              }
              className={estiloCampo}
            >
              <option value="todas">
                Todas las obras
              </option>

              {obrasDisponibles.map(
                (obra) => (
                  <option
                    key={obra}
                    value={obra}
                  >
                    {obra}
                  </option>
                )
              )}
            </select>
          </CampoFiltro>

          {tipoSeleccionado !==
            "cobros" && (
            <CampoFiltro etiqueta="Contratista">
              <select
                value={
                  contratistaSeleccionado
                }
                onChange={(evento) =>
                  setContratistaSeleccionado(
                    evento.target.value
                  )
                }
                className={estiloCampo}
              >
                <option value="todos">
                  Todos los contratistas
                </option>

                {contratistasDisponibles.map(
                  (contratista) => (
                    <option
                      key={contratista}
                      value={contratista}
                    >
                      {contratista}
                    </option>
                  )
                )}
              </select>
            </CampoFiltro>
          )}

          <CampoFiltro etiqueta="Fecha desde">
            <input
              type="date"
              value={fechaDesde}
              onChange={(evento) =>
                setFechaDesde(
                  evento.target.value
                )
              }
              className={estiloCampo}
            />
          </CampoFiltro>

          <CampoFiltro etiqueta="Fecha hasta">
            <input
              type="date"
              value={fechaHasta}
              min={fechaDesde || undefined}
              onChange={(evento) =>
                setFechaHasta(
                  evento.target.value
                )
              }
              className={estiloCampo}
            />
          </CampoFiltro>

          <div className="flex items-end">
            <button
              type="button"
              onClick={limpiarFiltros}
              disabled={!hayFiltros}
              className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <ResumenCard
          titulo="Cobros mostrados"
          valor={formatearDinero(
            totalCobrosFiltrados
          )}
          variante="cobro"
        />

        <ResumenCard
          titulo="Pagos mostrados"
          valor={formatearDinero(
            totalPagosFiltrados
          )}
          variante="pago"
        />
      </div>

      <TablaMovimientos
        movimientos={
          movimientosFiltrados
        }
      />
    </div>
  );
}

function TablaMovimientos({
  movimientos,
}: {
  movimientos: MovimientoVista[];
}) {
  if (movimientos.length === 0) {
    return (
      <MensajeVacio texto="No se encontraron movimientos con los filtros seleccionados." />
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left">
              <Th>Tipo</Th>
              <Th>Fecha</Th>
              <Th>Obra</Th>
              <Th>Contratista</Th>
              <Th>Contrato</Th>
              <Th>Monto</Th>
              <Th>Comprobante</Th>
            </tr>
          </thead>

          <tbody>
            {movimientos.map(
              (movimiento) => (
                <tr
                  key={movimiento.id}
                  className="border-b border-slate-100 transition last:border-0 hover:bg-slate-50"
                >
                  <Td>
                    <EtiquetaTipo
                      tipo={
                        movimiento.tipo
                      }
                    />
                  </Td>

                  <Td>
                    {formatearFecha(
                      movimiento.fecha
                    )}
                  </Td>

                  <Td destacado>
                    {movimiento.obra ||
                      "Sin obra"}
                  </Td>

                  <Td>
                    {movimiento.contratista ||
                      "—"}
                  </Td>

                  <Td>
                    {movimiento.contrato ||
                      "—"}
                  </Td>

                  <Td>
                    <span
                      className={
                        movimiento.tipo ===
                        "Cobro"
                          ? "font-bold text-emerald-700"
                          : "font-bold text-amber-700"
                      }
                    >
                      {formatearDinero(
                        movimiento.monto
                      )}
                    </span>
                  </Td>

                  <Td>
                    <Comprobante
                      url={
                        movimiento.comprobante
                      }
                    />
                  </Td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EtiquetaTipo({
  tipo,
}: {
  tipo: "Cobro" | "Pago";
}) {
  const estilo =
    tipo === "Cobro"
      ? "bg-emerald-100 text-emerald-700"
      : "bg-amber-100 text-amber-700";

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${estilo}`}
    >
      {tipo}
    </span>
  );
}

function ResumenCard({
  titulo,
  valor,
  variante,
}: {
  titulo: string;
  valor: string;
  variante: "cobro" | "pago";
}) {
  const color =
    variante === "cobro"
      ? "text-emerald-700"
      : "text-amber-700";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">
        {titulo}
      </p>

      <p
        className={`mt-2 text-2xl font-bold ${color}`}
      >
        {valor}
      </p>
    </div>
  );
}

function CampoFiltro({
  etiqueta,
  children,
}: {
  etiqueta: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
        {etiqueta}
      </span>

      {children}
    </label>
  );
}

const estiloCampo =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400";

function Comprobante({
  url,
}: {
  url: string;
}) {
  if (!url) {
    return (
      <span className="text-sm text-slate-400">
        Sin comprobante
      </span>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="inline-flex rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
    >
      Ver comprobante
    </a>
  );
}

function MensajeVacio({
  texto,
}: {
  texto: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
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
    <th className="whitespace-nowrap px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
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
      className={`whitespace-nowrap px-5 py-4 text-sm ${
        destacado
          ? "font-semibold text-slate-900"
          : "text-slate-600"
      }`}
    >
      {children}
    </td>
  );
}

function formatearDinero(
  valor: number
) {
  return new Intl.NumberFormat(
    "es-AR",
    {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }
  ).format(valor);
}

function formatearFecha(
  fecha: string
) {
  const clave =
    convertirFechaAClave(fecha);

  if (!clave) {
    return fecha || "Sin fecha";
  }

  const [anio, mes, dia] = clave
    .split("-")
    .map(Number);

  return new Intl.DateTimeFormat(
    "es-AR"
  ).format(
    new Date(anio, mes - 1, dia)
  );
}

function convertirFechaAClave(
  fecha: string
): string {
  if (!fecha) {
    return "";
  }

  const texto = fecha.trim();

  const soloFecha =
    texto.split("T")[0].split(" ")[0];

  const partes = soloFecha.split(
    /[\/\-]/
  );

  if (partes.length === 3) {
    const primero = Number(
      partes[0]
    );

    const segundo = Number(
      partes[1]
    );

    const tercero = Number(
      partes[2]
    );

    if (
      Number.isFinite(primero) &&
      Number.isFinite(segundo) &&
      Number.isFinite(tercero)
    ) {
      if (partes[0].length === 4) {
        return `${rellenar(
          primero,
          4
        )}-${rellenar(
          segundo
        )}-${rellenar(tercero)}`;
      }

      if (partes[2].length === 4) {
        return `${rellenar(
          tercero,
          4
        )}-${rellenar(
          segundo
        )}-${rellenar(primero)}`;
      }
    }
  }

  const fechaConvertida =
    new Date(texto);

  if (
    Number.isNaN(
      fechaConvertida.getTime()
    )
  ) {
    return "";
  }

  return `${rellenar(
    fechaConvertida.getFullYear(),
    4
  )}-${rellenar(
    fechaConvertida.getMonth() + 1
  )}-${rellenar(
    fechaConvertida.getDate()
  )}`;
}

function rellenar(
  numero: number,
  longitud = 2
) {
  return String(numero).padStart(
    longitud,
    "0"
  );
}