export interface TaskHistoryEntry {
  id: string;
  date: string;
  author: string;
  diagnostico: string;
  solucion: string;
  descripcion: string;
}

export interface TaskChangeLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details?: string;
}

export interface PhotoEvidence {
  id: string;
  title: string;
  url: string;
  type: 'fachada' | 'general' | 'caja' | 'potencia' | 'kmz' | 'materiales' | 'equipos';
  timestamp: string;
  isImportant?: boolean;
  category?: string;
  // Evaluación individual de la foto (solo aplica a fotos de caja / splitter)
  evaluacion?: 'Bueno' | 'Malo' | '';
}

export interface CajaEvaluation {
  seInstaloCaja: boolean;
  fotosCaja: PhotoEvidence[];
  calificacion: 'Bueno' | 'Regular' | 'Malo' | '';
  fotosPotencia: PhotoEvidence[];
  potenciaCajaDbm: string;
  potenciaCasaDbm: string;
  fotosRecorridoKmz: PhotoEvidence[];
  bloqueado?: boolean;
}

export interface FibraMaterialesData {
  activo: boolean;
  usoFibra: boolean;
  fibraInicio: string;
  fibraFin: string;
  fibraResultado: string;
  usoUtp: boolean;
  utpInicio: string;
  utpFin: string;
  utpResultado: string;
  materiales: Record<string, number>;
  fotosMateriales?: PhotoEvidence[];
  bloqueado?: boolean;
}

export interface RegistroEquiposData {
  activo: boolean;
  fotosEquipos?: PhotoEvidence[];
  routerMac: string;
  routerSn: string;
  routerMarca?: string;
  usoDecodificador: boolean;
  decodificadores: string[];
  usoRepetidor: boolean;
  repetidores: string[];
  usoSwitch: boolean;
  switches: string[];
  bloqueado?: boolean;
}

export interface VTDañoData {
  activo: boolean;
  fotosDaño: PhotoEvidence[];
  fotosPotenciaInicial: PhotoEvidence[];
  fotosPotenciaFinal: PhotoEvidence[];
  fotosKmz: PhotoEvidence[];
  medicionInicial: string;
  medicionFinal: string;
  // Evaluación de Caja NAP (igual que Instalaciones)
  fotosCaja: PhotoEvidence[];
  calificacionCaja: 'Bueno' | 'Regular' | 'Malo' | '';
  // Evidencias de la Roseta
  fotosRoseta: PhotoEvidence[];
  evaluacionRoseta: 'Bien' | 'Regular' | 'Malo' | '';
  bloqueado?: boolean;
}

export interface VTMaterialesData {
  activo: boolean;
  fotosMateriales: PhotoEvidence[];
  materiales: Record<string, number>;
  // Metraje de Fibra Óptica (resta absoluta entre inicio y fin)
  usoFibra: boolean;
  fibraHilos: '' | '1 hilo' | '4 hilos' | '12 hilos' | '48 hilos' | '96 hilos';
  fibraInicio: string;
  fibraFin: string;
  fibraResultado: string;
  // Metraje de UTP (resta absoluta entre inicio y fin)
  usoUtp: boolean;
  utpInicio: string;
  utpFin: string;
  utpResultado: string;
  bloqueado?: boolean;
}

export interface VTEquiposData {
  activo: boolean;
  seRetiroEquipo: boolean;
  fotosRetirados: PhotoEvidence[];
  equipoRetiradoMac: string;
  equipoRetiradoSn: string;
  equipoRetiradoMarca: string;
  seActivoEquipo: boolean;
  fotosActivos: PhotoEvidence[];
  routerMac: string;
  routerSn: string;
  routerMarca: string;
  seActivoDeco: boolean;
  fotosDeco: PhotoEvidence[];
  decodificadores: string[];
  seActivoSwitch: boolean;
  fotosSwitch: PhotoEvidence[];
  switches: string[];
  seActivoRepetidor: boolean;
  fotosRepetidor: PhotoEvidence[];
  repetidores: string[];
  bloqueado?: boolean;
}

export interface VTPaso3Data {
  causaDaño: string;
  gradoAfectacion: string;
  diagnostico: string;
  solucion: string;
  fotosEvidencias: PhotoEvidence[];
  bloqueado?: boolean;
}

// ============ RETIRO (R) ============

export interface RTEquipoRetirado {
  retirado: boolean;
  serieMac: string;
  fotos: PhotoEvidence[];
}

export interface RTRetiroData {
  activo: boolean;
  router: RTEquipoRetirado;
  deco: RTEquipoRetirado;
  repetidor: RTEquipoRetirado;
  bloqueado?: boolean;
}

export type RTEstadoRetiro = 'SI' | 'No' | 'NRE';

export interface RTPaso3Data {
  retiroEquipo: RTEstadoRetiro;
  fotosEvidencias: PhotoEvidence[];
  bloqueado?: boolean;
}

export type TipoActividad = 'I' | 'VT' | 'R';

export interface TaskData {
  id: string;
  markerNumber: number;
  markerColor: 'yellow' | 'red' | 'blue';
  dni: string;
  nombre: string;
  initials: string;
  tipoActividad?: TipoActividad; // 'I' = Instalación, 'VT' = Visita Técnica, 'R' = Retiro
  codSuscri: string;
  inicio: string;
  suspBaja: string;
  ordenRatio: string;
  estado: 'REPROGRAMADO' | 'PENDIENTE' | 'EN_CURSO' | 'LIQUIDADO';
  jefeTecnico: string;
  tecAsignado: string;
  fachadaUrl: string | null;
  telefono: string;
  comentarioTelf: string;
  direccion: string;
  coordenadas: [number, number]; // [lat, lng]
  
  // Observaciones tab
  tipoTrabajo: string;
  nroTicket: string;
  obsPlanificacion: string;
  obsOperaciones: string;
  obsTecnico: string;
  notasOdoo: Array<{ id: string; fecha: string; autor: string; texto: string }>;

  // Acciones tab
  jefeSeleccionado: string;
  tecSeleccionado: string;
  horaInicio: string;
  pasos: {
    paso1: 'Pendiente' | 'En Proceso' | 'Completado';
    paso2: 'Pendiente' | 'En Proceso' | 'Completado';
    paso3: 'Pendiente' | 'En Proceso' | 'Completado';
  };

  // Fotos y Evidencias
  fotosFachada: PhotoEvidence[];
  fotosEvidencias: PhotoEvidence[];
  evaluacionCaja?: CajaEvaluation;
  fibraMateriales?: FibraMaterialesData;
  registroEquipos?: RegistroEquiposData;
  vtDaño?: VTDañoData;
  vtMateriales?: VTMaterialesData;
  vtEquipos?: VTEquiposData;
  vtPaso3?: VTPaso3Data;
  rtRetiro?: RTRetiroData;
  rtPaso3?: RTPaso3Data;
  pagoInfo?: {
    tipoPago: string;
    precio: string;
    registrado: boolean;
  };

  // Técnico tab
  troncal: string;
  odf: string;
  hilo: string;
  caja: string;
  puerto: string;
  datoOnt: string;
  macNoc: string;
  macTv: string;
  macTv2: string;
  macTv3: string;
  macTv4: string;
  marcaRepetidor: string;
  nroRepetidor: string;
  macSwitch: string;

  // Historial tab
  cambiosRegistrados: TaskChangeLog[];
  visitasPrevias: TaskHistoryEntry[];
}
