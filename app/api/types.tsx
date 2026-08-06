export interface Cliente {
  ID_CLIENTE: string;
  NOMBRE: string;
  CUIT: string;
  TELEFONO: string;
  CONDICION_IVA: string;
}

export interface Obra {
  ID_OBRA: string;
  ID_CLIENTE: string;
  NOMBRE: string;
  DIRECCION: string;
  FECHA: string;
  ESTADO: string;
  DOCUMENTO: string;
}

export interface Contratista {
  ID_CONTRATISTA: string;
  NOMBRE: string;
  CUIL: string;
  CBU: string;
  TELEFONO: string;
  DOMICILIO: string;
}

export interface Contrato {
  ID_CONTRATO: string;
  ID_OBRA: string;
  ID_CONTRATISTA: string;
  TIPO: string;
  DESCRIPCION: string;
  MONTO: number;
  FECHA: string;
  DOCUMENTO: string;
  DESCUENTOS: string;
  TOTAL: number;
  COMISION_MONTO: number;
}

export interface Pago {
  ID_PAGO: string;
  ID_CONTRATO: string;
  ID_CONTRATISTA: string;
  FECHA: string;
  MONTO: number;
  COMPROBANTE: string;
}

export interface Cobro {
  ID_COBROS: string;
  ID_OBRA: string;
  FECHA: string;
  MONTO: number;
  COMPROBANTE: string;
}
export interface PresupuestoCliente {
  ID_PRESUPUESTO: string;
  FECHA: string;
  CLIENTE: string;
  TELEFONO: string;
  EMAIL: string;
  DIRECCION_OBRA: string;
  TIPO_CAMBIO: number;
  TOTAL_TRABAJOS_USD: number;
  TOTAL_HONORARIOS_USD: number;
  TOTAL_USD: number;
  TOTAL_ARS: number;
  ESTADO: string;
  OBSERVACIONES: string;
}

export interface TrabajoPresupuesto {
  ID_TRABAJO: string;
  ID_PRESUPUESTO: string;
  ID_TIPO_TRABAJO: string;
  SUPERFICIE_M2: number;
  PRECIO_M2_USD: number;
  SUBTOTAL_USD: number;
  NOMBRE_TRABAJO: string;
}

export interface HonorarioPresupuesto {
  ID_HONORARIO_PRESUPUESTO: string;
  ID_PRESUPUESTO: string;
  ID_HONORARIO_CONFIG: string;
  PORCENTAJE: string | number;
  BASE_CALCULO_USD: number;
  MONTO_USD: number;
  NOMBRE_HONORARIO: string;
}