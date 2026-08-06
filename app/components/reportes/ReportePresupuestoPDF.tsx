import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

import type {
  PresupuestoCliente,
  TrabajoPresupuesto,
  HonorarioPresupuesto,
} from "@/app/api/types";

type Props = {
  presupuesto: PresupuestoCliente;

  trabajos: TrabajoPresupuesto[];

  honorarios: HonorarioPresupuesto[];
};

export default function ReportePresupuestoPDF({
  presupuesto,
  trabajos,
  honorarios,
}: Props) {
  return (
    <Document>
      <Page
        size="A4"
        style={styles.page}
      >
        {/* CABECERA */}

        <View style={styles.header}>
          <Text style={styles.titulo}>
            PRESUPUESTO
          </Text>

          <Text style={styles.subtitulo}>
            Presupuesto para cliente
          </Text>
        </View>

        {/* DATOS */}

        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>
            Datos del cliente
          </Text>

          <View style={styles.grid}>
            <Dato
              titulo="Cliente"
              valor={presupuesto.CLIENTE}
            />

            <Dato
              titulo="Fecha"
              valor={presupuesto.FECHA}
            />

            <Dato
              titulo="Teléfono"
              valor={presupuesto.TELEFONO}
            />

            <Dato
              titulo="Email"
              valor={presupuesto.EMAIL}
            />

            <Dato
              titulo="Dirección"
              valor={
                presupuesto.DIRECCION_OBRA
              }
            />

            <Dato
              titulo="Estado"
              valor={presupuesto.ESTADO}
            />
          </View>
        </View>

        {/* TRABAJOS */}

        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>
            Trabajos
          </Text>

          <TablaCabecera
            columnas={[
              "Trabajo",
              "m²",
              "USD/m²",
              "Subtotal",
            ]}
          />

          {trabajos.map((trabajo) => (
            <Fila
              key={trabajo.ID_TRABAJO}
              valores={[
                trabajo.NOMBRE_TRABAJO,
                trabajo.SUPERFICIE_M2.toString(),
                usd(
                  trabajo.PRECIO_M2_USD
                ),
                usd(
                  trabajo.SUBTOTAL_USD
                ),
              ]}
            />
          ))}
        </View>

        {/* HONORARIOS */}

        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>
            Honorarios
          </Text>

          <TablaCabecera
            columnas={[
              "Concepto",
              "%",
              "Base",
              "Monto",
            ]}
          />

          {honorarios.map(
            (honorario) => (
              <Fila
                key={
                  honorario.ID_HONORARIO_PRESUPUESTO
                }
                valores={[
                  honorario.NOMBRE_HONORARIO,
                  porcentaje(
                    honorario.PORCENTAJE
                  ),
                  usd(
                    honorario.BASE_CALCULO_USD
                  ),
                  usd(
                    honorario.MONTO_USD
                  ),
                ]}
              />
            )
          )}
        </View>

        {/* RESUMEN */}

        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>
            Resumen
          </Text>

          <Resumen
            titulo="Trabajos USD"
            valor={usd(
              presupuesto.TOTAL_TRABAJOS_USD
            )}
          />

          <Resumen
            titulo="Honorarios USD"
            valor={usd(
              presupuesto.TOTAL_HONORARIOS_USD
            )}
          />

          <Resumen
            titulo="TOTAL USD"
            valor={usd(
              presupuesto.TOTAL_USD
            )}
            negrita
          />

          <Resumen
            titulo="Tipo de cambio"
            valor={ars(
              presupuesto.TIPO_CAMBIO
            )}
          />

          <Resumen
            titulo="TOTAL ARS"
            valor={ars(
              presupuesto.TOTAL_ARS
            )}
            negrita
          />
        </View>

        {presupuesto.OBSERVACIONES ? (
          <View style={styles.seccion}>
            <Text
              style={styles.seccionTitulo}
            >
              Observaciones
            </Text>

            <Text
              style={styles.texto}
            >
              {
                presupuesto.OBSERVACIONES
              }
            </Text>
          </View>
        ) : null}
      </Page>
    </Document>
  );
}

/* COMPONENTES */

function Dato({
  titulo,
  valor,
}: {
  titulo: string;
  valor: string;
}) {
  return (
    <View style={styles.dato}>
      <Text style={styles.label}>
        {titulo}
      </Text>

      <Text style={styles.valor}>
        {valor || "-"}
      </Text>
    </View>
  );
}

function TablaCabecera({
  columnas,
}: {
  columnas: string[];
}) {
  return (
    <View style={styles.cabeceraTabla}>
      {columnas.map((c) => (
        <Text
          key={c}
          style={styles.celdaCabecera}
        >
          {c}
        </Text>
      ))}
    </View>
  );
}

function Fila({
  valores,
}: {
  valores: string[];
}) {
  return (
    <View style={styles.fila}>
      {valores.map((v, i) => (
        <Text
          key={i}
          style={styles.celda}
        >
          {v}
        </Text>
      ))}
    </View>
  );
}

function Resumen({
  titulo,
  valor,
  negrita = false,
}: {
  titulo: string;
  valor: string;
  negrita?: boolean;
}) {
  return (
    <View style={styles.resumen}>
      <Text
        style={
          negrita
            ? styles.total
            : styles.texto
        }
      >
        {titulo}
      </Text>

      <Text
        style={
          negrita
            ? styles.total
            : styles.texto
        }
      >
        {valor}
      </Text>
    </View>
  );
}

/* FORMATOS */

function usd(n: number) {
  return new Intl.NumberFormat(
    "es-AR",
    {
      style: "currency",
      currency: "USD",
    }
  ).format(n);
}

function ars(n: number) {
  return new Intl.NumberFormat(
    "es-AR",
    {
      style: "currency",
      currency: "ARS",
    }
  ).format(n);
}

function porcentaje(
  valor: string | number
) {
  return `${valor}`;
}

/* ESTILOS */

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
  },

  header: {
    marginBottom: 20,
  },

  titulo: {
    fontSize: 24,
    fontWeight: "bold",
  },

  subtitulo: {
    color: "#666",
  },

  seccion: {
    marginBottom: 18,
  },

  seccionTitulo: {
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 8,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  dato: {
    width: "50%",
    marginBottom: 8,
  },

  label: {
    color: "#777",
    fontSize: 8,
  },

  valor: {
    fontSize: 10,
  },

  cabeceraTabla: {
    flexDirection: "row",
    backgroundColor: "#ececec",
    padding: 5,
  },

  fila: {
    flexDirection: "row",
    borderBottom: 1,
    borderBottomColor: "#ddd",
    padding: 5,
  },

  celdaCabecera: {
    flex: 1,
    fontWeight: "bold",
  },

  celda: {
    flex: 1,
  },

  resumen: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },

  total: {
    fontWeight: "bold",
    fontSize: 11,
  },

  texto: {
    fontSize: 10,
  },
});