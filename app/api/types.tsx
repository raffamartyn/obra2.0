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