import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

export type ContratoReporte = {
  id: string;
  contratista: string;
  tipo: string;
  descripcion: string;
  fecha: string;
  monto: number;
  pagado: number;
  saldo: number;
};

export type CobroReporte = {
  id: string;
  fecha: string;
  descripcion: string;
  monto: number;
};

export type PagoReporte = {
  id: string;
  fecha: string;
  contratista: string;
  contrato: string;
  monto: number;
};

export type ReporteObraPDFProps = {
  obra: {
    nombre: string;
    direccion: string;
    fecha: string;
    estado: string;
  };

  cliente: {
    nombre: string;
    cuit: string;
    telefono: string;
    condicionIva: string;
  };

  resumen: {
    presupuesto: number;
    cobrado: number;
    saldoCobrar: number;
    pagado: number;
    saldoContratos: number;
  };

  contratos: ContratoReporte[];
  cobros: CobroReporte[];
  pagos: PagoReporte[];
};

export default function ReporteObraPDF({
  obra,
  cliente,
  resumen,
  contratos,
  cobros,
  pagos,
}: ReporteObraPDFProps) {
  return (
    <Document
      title={`Resumen de obra - ${obra.nombre}`}
      author="Sistema Control de Obras"
      subject="Resumen económico de obra"
    >
      <Page size="A4" style={styles.pagina} wrap>
        {/* Encabezado repetido */}

        <View style={styles.encabezado} fixed>
          <View>
            <Text style={styles.empresa}>
              CONTROL DE OBRAS
            </Text>

            <Text style={styles.subtituloEmpresa}>
              Informe de gestión
            </Text>
          </View>

          <View style={styles.encabezadoDerecha}>
            <Text style={styles.fechaInforme}>
              Generado: {formatearFechaHoraActual()}
            </Text>

            <Text
              style={styles.numeroPagina}
              render={({ pageNumber, totalPages }) =>
                `Página ${pageNumber} de ${totalPages}`
              }
            />
          </View>
        </View>

        {/* Título */}

        <View style={styles.tituloContenedor}>
          <Text style={styles.titulo}>
            RESUMEN DE OBRA
          </Text>

          <Text style={styles.nombreObra}>
            Obra: {obra.nombre}
          </Text>
        </View>

        {/* Información general */}

        <View style={styles.informacionGeneral}>
          <DatoGeneral
            titulo="Dirección"
            valor={obra.direccion || "Sin dirección"}
          />

          <DatoGeneral
            titulo="Fecha"
            valor={formatearFecha(obra.fecha)}
          />

          <DatoGeneral
            titulo="Estado"
            valor={obra.estado || "Sin estado"}
          />
        </View>

        {/* Resumen económico */}

        <Seccion titulo="1. RESUMEN ECONÓMICO">
          <View style={styles.resumenFila}>
            <ResumenCard
              titulo="Presupuesto"
              valor={formatearDinero(
                resumen.presupuesto
              )}
            />

            <ResumenCard
              titulo="Cobrado"
              valor={formatearDinero(
                resumen.cobrado
              )}
            />

            <ResumenCard
              titulo="Saldo a cobrar"
              valor={formatearDinero(
                resumen.saldoCobrar
              )}
            />

            <ResumenCard
              titulo="Pagado"
              valor={formatearDinero(
                resumen.pagado
              )}
            />

            <ResumenCard
              titulo="Saldo contratos"
              valor={formatearDinero(
                resumen.saldoContratos
              )}
              ultimo
            />
          </View>
        </Seccion>

        {/* Cliente */}

        <Seccion titulo="2. CLIENTE">
          <View style={styles.clienteCaja}>
            <View style={styles.clienteColumna}>
              <DatoCliente
                titulo="Nombre"
                valor={cliente.nombre}
              />

              <DatoCliente
                titulo="Teléfono"
                valor={cliente.telefono}
              />
            </View>

            <View style={styles.separadorVertical} />

            <View style={styles.clienteColumna}>
              <DatoCliente
                titulo="CUIT"
                valor={cliente.cuit}
              />

              <DatoCliente
                titulo="Condición IVA"
                valor={cliente.condicionIva}
              />
            </View>
          </View>
        </Seccion>

        {/* Contratos */}

        <Seccion titulo="3. CONTRATOS">
          {contratos.length === 0 ? (
            <MensajeVacio texto="No hay contratos registrados." />
          ) : (
            <View style={styles.tabla}>
              <View
                style={[
                  styles.filaTabla,
                  styles.encabezadoTabla,
                ]}
                fixed
              >
                <Celda
                  texto="Contratista"
                  ancho="18%"
                  encabezado
                />

                <Celda
                  texto="Tipo"
                  ancho="12%"
                  encabezado
                />

                <Celda
                  texto="Descripción"
                  ancho="18%"
                  encabezado
                />

                <Celda
                  texto="Fecha"
                  ancho="12%"
                  encabezado
                />

                <Celda
                  texto="Monto"
                  ancho="14%"
                  encabezado
                  derecha
                />

                <Celda
                  texto="Pagado"
                  ancho="13%"
                  encabezado
                  derecha
                />

                <Celda
                  texto="Saldo"
                  ancho="13%"
                  encabezado
                  derecha
                  ultima
                />
              </View>

              {contratos.map((contrato) => (
                <View
                  key={contrato.id}
                  style={styles.filaTabla}
                  wrap={false}
                >
                  <Celda
                    texto={contrato.contratista}
                    ancho="18%"
                  />

                  <Celda
                    texto={contrato.tipo}
                    ancho="12%"
                  />

                  <Celda
                    texto={contrato.descripcion}
                    ancho="18%"
                  />

                  <Celda
                    texto={formatearFecha(
                      contrato.fecha
                    )}
                    ancho="12%"
                  />

                  <Celda
                    texto={formatearDinero(
                      contrato.monto
                    )}
                    ancho="14%"
                    derecha
                  />

                  <Celda
                    texto={formatearDinero(
                      contrato.pagado
                    )}
                    ancho="13%"
                    derecha
                  />

                  <Celda
                    texto={formatearDinero(
                      contrato.saldo
                    )}
                    ancho="13%"
                    derecha
                    ultima
                  />
                </View>
              ))}

              <View
                style={[
                  styles.filaTabla,
                  styles.filaTotal,
                ]}
                wrap={false}
              >
                <Celda
                  texto="TOTALES"
                  ancho="60%"
                  negrita
                />

                <Celda
                  texto={formatearDinero(
                    resumen.presupuesto
                  )}
                  ancho="14%"
                  derecha
                  negrita
                />

                <Celda
                  texto={formatearDinero(
                    resumen.pagado
                  )}
                  ancho="13%"
                  derecha
                  negrita
                />

                <Celda
                  texto={formatearDinero(
                    resumen.saldoContratos
                  )}
                  ancho="13%"
                  derecha
                  negrita
                  ultima
                />
              </View>
            </View>
          )}
        </Seccion>

        {/* Cobros */}

        <Seccion titulo="4. COBROS">
          {cobros.length === 0 ? (
            <MensajeVacio texto="No hay cobros registrados." />
          ) : (
            <View style={styles.tabla}>
              <View
                style={[
                  styles.filaTabla,
                  styles.encabezadoTabla,
                ]}
                fixed
              >
                <Celda
                  texto="Fecha"
                  ancho="20%"
                  encabezado
                />

                <Celda
                  texto="Descripción"
                  ancho="55%"
                  encabezado
                />

                <Celda
                  texto="Monto"
                  ancho="25%"
                  encabezado
                  derecha
                  ultima
                />
              </View>

              {cobros.map((cobro) => (
                <View
                  key={cobro.id}
                  style={styles.filaTabla}
                  wrap={false}
                >
                  <Celda
                    texto={formatearFecha(
                      cobro.fecha
                    )}
                    ancho="20%"
                  />

                  <Celda
                    texto={cobro.descripcion}
                    ancho="55%"
                  />

                  <Celda
                    texto={formatearDinero(
                      cobro.monto
                    )}
                    ancho="25%"
                    derecha
                    ultima
                  />
                </View>
              ))}

              <View
                style={[
                  styles.filaTabla,
                  styles.filaTotal,
                ]}
                wrap={false}
              >
                <Celda
                  texto="TOTAL COBRADO"
                  ancho="75%"
                  negrita
                />

                <Celda
                  texto={formatearDinero(
                    resumen.cobrado
                  )}
                  ancho="25%"
                  derecha
                  negrita
                  ultima
                />
              </View>
            </View>
          )}
        </Seccion>

        {/* Pagos */}

        <Seccion titulo="5. PAGOS A CONTRATISTAS">
          {pagos.length === 0 ? (
            <MensajeVacio texto="No hay pagos registrados." />
          ) : (
            <View style={styles.tabla}>
              <View
                style={[
                  styles.filaTabla,
                  styles.encabezadoTabla,
                ]}
                fixed
              >
                <Celda
                  texto="Fecha"
                  ancho="18%"
                  encabezado
                />

                <Celda
                  texto="Contratista"
                  ancho="32%"
                  encabezado
                />

                <Celda
                  texto="Contrato"
                  ancho="30%"
                  encabezado
                />

                <Celda
                  texto="Monto"
                  ancho="20%"
                  encabezado
                  derecha
                  ultima
                />
              </View>

              {pagos.map((pago) => (
                <View
                  key={pago.id}
                  style={styles.filaTabla}
                  wrap={false}
                >
                  <Celda
                    texto={formatearFecha(
                      pago.fecha
                    )}
                    ancho="18%"
                  />

                  <Celda
                    texto={pago.contratista}
                    ancho="32%"
                  />

                  <Celda
                    texto={pago.contrato}
                    ancho="30%"
                  />

                  <Celda
                    texto={formatearDinero(
                      pago.monto
                    )}
                    ancho="20%"
                    derecha
                    ultima
                  />
                </View>
              ))}

              <View
                style={[
                  styles.filaTabla,
                  styles.filaTotal,
                ]}
                wrap={false}
              >
                <Celda
                  texto="TOTAL PAGADO"
                  ancho="80%"
                  negrita
                />

                <Celda
                  texto={formatearDinero(
                    resumen.pagado
                  )}
                  ancho="20%"
                  derecha
                  negrita
                  ultima
                />
              </View>
            </View>
          )}
        </Seccion>

        {/* Pie repetido */}

        <View style={styles.piePagina} fixed>
          <Text>
            Informe generado desde el sistema de Control
            de Obras
          </Text>

          <Text
            render={({ pageNumber, totalPages }) =>
              `Página ${pageNumber} de ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}

function Seccion({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.seccion}>
      <Text style={styles.tituloSeccion}>
        {titulo}
      </Text>

      {children}
    </View>
  );
}

function DatoGeneral({
  titulo,
  valor,
}: {
  titulo: string;
  valor: string;
}) {
  return (
    <View style={styles.datoGeneral}>
      <Text style={styles.datoGeneralTitulo}>
        {titulo}
      </Text>

      <Text style={styles.datoGeneralValor}>
        {valor}
      </Text>
    </View>
  );
}

function DatoCliente({
  titulo,
  valor,
}: {
  titulo: string;
  valor: string;
}) {
  return (
    <View style={styles.datoCliente}>
      <Text style={styles.datoClienteTitulo}>
        {titulo}
      </Text>

      <Text style={styles.datoClienteValor}>
        {valor || "Sin información"}
      </Text>
    </View>
  );
}

function ResumenCard({
  titulo,
  valor,
  ultimo = false,
}: {
  titulo: string;
  valor: string;
  ultimo?: boolean;
}) {
  return (
    <View
      
  style={[
    styles.resumenCard,
    ...(ultimo ? [styles.resumenCardUltimo] : []),
  ]}

    >
      <Text style={styles.resumenTitulo}>
        {titulo}
      </Text>

      <Text style={styles.resumenValor}>
        {valor}
      </Text>
    </View>
  );
}

function MensajeVacio({
  texto,
}: {
  texto: string;
}) {
  return (
    <View style={styles.mensajeVacio}>
      <Text>{texto}</Text>
    </View>
  );
}

function Celda({
  texto,
  ancho,
  encabezado = false,
  derecha = false,
  ultima = false,
  negrita = false,
}: {
  texto: string;
  ancho: string;
  encabezado?: boolean;
  derecha?: boolean;
  ultima?: boolean;
  negrita?: boolean;
}) {
  return (
    <View
       style={[
    styles.celda,
    {
      width: ancho,
    },
    ...(ultima ? [styles.celdaUltima] : []),
  ]}
    >
      <Text
        style={[
    styles.textoCelda,
    ...(encabezado ? [styles.textoEncabezado] : []),
    ...(derecha ? [styles.textoDerecha] : []),
    ...(negrita ? [styles.textoNegrita] : []),
  ]}
      >
        {texto}
      </Text>
    </View>
  );
}

function formatearDinero(valor: number) {
  return new Intl.NumberFormat("es-US", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(valor || 0);
}

function formatearFecha(fecha: string) {
  if (!fecha) {
    return "Sin fecha";
  }

  const partes = fecha
    .trim()
    .split(/[/-]/)
    .map(Number);

  if (
    partes.length === 3 &&
    partes.every((parte) => !Number.isNaN(parte))
  ) {
    if (partes[0] > 31) {
      const [anio, mes, dia] = partes;

      return `${String(dia).padStart(
        2,
        "0"
      )}/${String(mes).padStart(2, "0")}/${anio}`;
    }

    const [dia, mes, anio] = partes;

    return `${String(dia).padStart(
      2,
      "0"
    )}/${String(mes).padStart(2, "0")}/${anio}`;
  }

  return fecha;
}

function formatearFechaHoraActual() {
  return new Intl.DateTimeFormat("es-US", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date());
}

const styles = StyleSheet.create({
  pagina: {
    paddingTop: 78,
    paddingRight: 30,
    paddingBottom: 48,
    paddingLeft: 30,
    backgroundColor: "#ffffff",
    color: "#0f172a",
    fontFamily: "Helvetica",
    fontSize: 8,
  },

  encabezado: {
    position: "absolute",
    top: 22,
    left: 30,
    right: 30,
    height: 42,
    borderBottomWidth: 1.5,
    borderBottomColor: "#172554",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  empresa: {
    color: "#172554",
    fontSize: 16,
    fontWeight: 700,
  },

  subtituloEmpresa: {
    marginTop: 2,
    color: "#64748b",
    fontSize: 8,
  },

  encabezadoDerecha: {
    alignItems: "flex-end",
  },

  fechaInforme: {
    color: "#475569",
    fontSize: 7,
  },

  numeroPagina: {
    marginTop: 4,
    color: "#172554",
    fontSize: 7,
    fontWeight: 700,
  },

  tituloContenedor: {
    marginBottom: 12,
  },

  titulo: {
    color: "#172554",
    fontSize: 18,
    fontWeight: 700,
  },

  nombreObra: {
    marginTop: 4,
    color: "#1e3a8a",
    fontSize: 12,
    fontWeight: 700,
  },

  informacionGeneral: {
    marginBottom: 14,
    paddingVertical: 9,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#cbd5e1",
    flexDirection: "row",
  },

  datoGeneral: {
    width: "33.33%",
    paddingRight: 10,
  },

  datoGeneralTitulo: {
    color: "#475569",
    fontSize: 7,
    fontWeight: 700,
    textTransform: "uppercase",
  },

  datoGeneralValor: {
    marginTop: 3,
    color: "#0f172a",
    fontSize: 9,
  },

  seccion: {
    marginBottom: 14,
  },

  tituloSeccion: {
    marginBottom: 7,
    color: "#172554",
    fontSize: 10,
    fontWeight: 700,
  },

  resumenFila: {
    flexDirection: "row",
  },

  resumenCard: {
    width: "19.2%",
    minHeight: 52,
    marginRight: "1%",
    padding: 7,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 5,
    justifyContent: "space-between",
  },

  resumenCardUltimo: {
    marginRight: 0,
  },

  resumenTitulo: {
    color: "#64748b",
    fontSize: 6,
    fontWeight: 700,
    textTransform: "uppercase",
  },

  resumenValor: {
    marginTop: 8,
    color: "#172554",
    fontSize: 9,
    fontWeight: 700,
  },

  clienteCaja: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 5,
    flexDirection: "row",
  },

  clienteColumna: {
    width: "50%",
    padding: 10,
  },

  separadorVertical: {
    width: 1,
    backgroundColor: "#cbd5e1",
  },

  datoCliente: {
    marginBottom: 8,
  },

  datoClienteTitulo: {
    color: "#64748b",
    fontSize: 6,
    fontWeight: 700,
    textTransform: "uppercase",
  },

  datoClienteValor: {
    marginTop: 3,
    color: "#0f172a",
    fontSize: 9,
  },

  tabla: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 4,
    overflow: "hidden",
  },

  filaTabla: {
    minHeight: 25,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    flexDirection: "row",
    alignItems: "stretch",
  },

  encabezadoTabla: {
    minHeight: 27,
    backgroundColor: "#eff6ff",
  },

  filaTotal: {
    backgroundColor: "#f1f5f9",
  },

  celda: {
    paddingHorizontal: 5,
    paddingVertical: 6,
    borderRightWidth: 1,
    borderRightColor: "#e2e8f0",
    justifyContent: "center",
  },

  celdaUltima: {
    borderRightWidth: 0,
  },

  textoCelda: {
    color: "#334155",
    fontSize: 7,
    lineHeight: 1.3,
  },

  textoEncabezado: {
    color: "#172554",
    fontWeight: 700,
    textAlign: "center",
  },

  textoDerecha: {
    textAlign: "right",
  },

  textoNegrita: {
    color: "#0f172a",
    fontWeight: 700,
  },

  mensajeVacio: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#93c5fd",
    borderRadius: 4,
    backgroundColor: "#eff6ff",
    color: "#334155",
  },

  piePagina: {
    position: "absolute",
    right: 30,
    bottom: 18,
    left: 30,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#172554",
    color: "#64748b",
    fontSize: 6,
    flexDirection: "row",
    justifyContent: "space-between",
  },
});