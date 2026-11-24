// Modelos relacionados con el Módulo 2 (Gimnasios) y Módulo 3 (Servicios)

export interface Gimnasio {
  propietarioId?: number | null;
  id: number;
  nombre: string;
  direccion: string;
  barrio: string;
  ciudad: string;
  departamento?: string;
  pais: string;
  apartamentoPiso?: string;
  codigoPostal?: string;
  telefono: string;
  horario: string;
  descripcion: string;
  imagen: string;
  fotos: string[];
  precio: number;
  moneda: string;
  servicios: string[];
  activo: boolean;
  lat?: number;
  lng?: number;

  // Campos extendidos del asistente de creación / edición completa
  tipoEspacio?: string;
  tipoAcceso?: string;
  mostrarUbicacionExacta?: boolean;
  marcadorX?: number;
  marcadorY?: number;
  aforoMaximo?: number;
  zonasEntrenamiento?: number;
  entrenadoresPlanta?: number;
  duchasVestidores?: number;
  lockersDisponibles?: number;
  comodidades?: string[];
  aspectosDestacados?: string[];
  tipoReservacion?: 'aprobar_primeras' | 'inmediata';
  ajusteFinDeSemanaPorcentaje?: number;
  descuentoPromocionActivo?: boolean;
  descuentoUltimoMinutoActivo?: boolean;
  descuentoSemanalActivo?: boolean;
  tieneCamaraExterior?: boolean;
  descripcionCamarasSeguridad?: string;
  tieneMonitorRuido?: boolean;
  tieneArmasOPropiedad?: boolean;
  paisFiscal?: string;
  direccionFiscal?: string;
  apartamentoFiscal?: string;
  ciudadFiscal?: string;
  departamentoFiscal?: string;
  codigoPostalFiscal?: string;
  esEmpresa?: boolean;
}

export interface Instructor {
  id: number;
  nombre: string;
  correo: string;
  telefono: string;
  especialidad: string;
  experiencia: number; // años
  biografia: string;
  imagen: string;
  gimnasioId: number | null;
  activo: boolean;
}

export interface Producto {
  id: number;
  nombre: string;
  categoria: 'Suplemento' | 'Implemento' | 'Ropa deportiva';
  precio: number;
  stock: number;
  descripcion: string;
  guiaNutricional: string;
  imagen: string;
}
