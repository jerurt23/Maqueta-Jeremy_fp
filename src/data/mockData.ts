import { TaskData } from '../types/task';

export const JEFES_TECNICOS = [
  'Ing. Carlos Mendoza (LIMA NORTE)',
  'Ing. Valery Pascual (CONTRATISTA RED)',
  'Supervisor Juan Torres (SMP)',
  'Ing. Marco Aurelio (PLANTA EXTERNA)',
];

export const TECNICOS_POR_JEFE: Record<string, string[]> = {
  'Ing. Carlos Mendoza (LIMA NORTE)': [
    'Christian Tenazoa',
    'Rodrigo Chire',
    'Alejandro Pérez',
    'Luis Morales',
  ],
  'Ing. Valery Pascual (CONTRATISTA RED)': [
    'Christian Tenazoa',
    'Rodrigo Chire',
    'Edwin Ramos',
    'Junior Alva',
  ],
  'Supervisor Juan Torres (SMP)': [
    'Alejandro Pérez',
    'Luis Morales',
    'David Gomez',
    'Jean Pierre Cárdenas',
  ],
  'Ing. Marco Aurelio (PLANTA EXTERNA)': [
    'Christian Tenazoa',
    'Rodrigo Chire',
    'Victor Saldaña',
  ],
};

export const SAMPLE_PHOTOS = {
  fachada: [
    {
      title: 'Fachada Jr. Maracaibo 1573 (Frontis 2 Pisos)',
      url: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80',
      category: 'Frontis Vivienda',
    },
    {
      title: 'Fachada Puerta Principal y Número Municipal',
      url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
      category: 'Acceso Inmueble',
    },
  ],
  evidencias: [
    {
      title: 'Roseta Óptica FTTH y Conector SC/APC Verde',
      url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
      category: 'Roseta Interior',
    },
    {
      title: 'Router ONT ZTE F670L - Luces PON/LAN OK',
      url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80',
      category: 'ONT / CPE',
    },
    {
      title: 'Repetidor MESH Configurado y Sincronizado',
      url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
      category: 'Repetidor Wi-Fi',
    },
    {
      title: 'Prueba de Velocidad Speedtest 200 Mbps',
      url: 'https://images.unsplash.com/photo-1544717302-de2939b7ef71?auto=format&fit=crop&w=800&q=80',
      category: 'Test Velocidad',
    },
  ],
  caja: [
    {
      title: 'Caja NAP 1A - Hilo 96 y Splitter Instalado',
      url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
      category: 'Caja NAP / Poste',
    },
    {
      title: 'Etiquetado y Peinado de Fibra en NAP',
      url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      category: 'Caja NAP Interior',
    },
  ],
  potencias: [
    {
      title: 'Potencia en Caja NAP (-18.4 dBm en puerto 2)',
      url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
      category: 'Potencia Caja NAP',
    },
    {
      title: 'Potencia en Roseta Casa (-19.2 dBm en sala)',
      url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      category: 'Potencia Casa / Roseta',
    },
  ],
  kmz: [
    {
      title: 'Recorrido KMZ - Trazo Postes Jr. Maracaibo',
      url: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80',
      category: 'Ruta KMZ / Trazo',
    },
    {
      title: 'Poste Concreto y Bajada de Acometida Fibra',
      url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80',
      category: 'Poste Acometida',
    },
  ],
  materiales: [
    {
      title: 'Bobina de Fibra Drop y Conectores Rápidos',
      url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
      category: 'Fibra y Drop',
    },
    {
      title: 'Ferretería y Accesorios de Instalación',
      url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      category: 'Materiales FTTH',
    },
  ],
  equipos: [
    {
      title: 'Etiqueta MAC y SN Router ZTE F670L',
      url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80',
      category: 'Router ONT',
    },
    {
      title: 'Decodificador TV Box y Serie Posterior',
      url: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=800&q=80',
      category: 'Decodificador TV',
    },
    {
      title: 'Repetidor Mesh Dual-Band SN',
      url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
      category: 'Repetidor WiFi',
    },
    {
      title: 'Switch Gigabit 8 Puertos y Serie',
      url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
      category: 'Switch de Red',
    },
  ],
};

export const DEFAULT_MATERIALES: Record<string, number> = {
  'Conector RJ45': 0,
  'Manguito 40mm': 2,
  'Manguito 60mm': 0,
  'Grapas 8': 0,
  'Grapas': 0,
  'Cintillos': 0,
  'Roseta': 1,
  'Patchcord APC UPC': 0,
  'Pilas': 0,
  'Patchcord Verde-Verde': 1,
  'Templador': 0,
  'Pigtail': 0,
  'Utp ONT': 1,
  'Cable Aux 1mt': 0,
  'Cable HDMI 1mt': 0,
};

export interface TipoActividadConfig {
  id: 'I' | 'VT' | 'R';
  code: string;
  nombre: string;
  tituloLargo: string;
  color: string;
  badgeBg: string;
  badgeText: string;
  activeBg: string;
  activeRing: string;
  descripcion: string;
}

export const TIPOS_ACTIVIDAD: TipoActividadConfig[] = [
  {
    id: 'I',
    code: 'I',
    nombre: 'Instalación',
    tituloLargo: 'I = INSTALACIÓN',
    color: 'blue',
    badgeBg: 'bg-blue-600',
    badgeText: 'text-white',
    activeBg: 'bg-blue-600 text-white shadow-md shadow-blue-500/20',
    activeRing: 'ring-2 ring-blue-500',
    descripcion: 'Instalación nueva de fibra óptica, tendido, caja, materiales y equipos router/deco.',
  },
  {
    id: 'VT',
    code: 'VT',
    nombre: 'Visita Técnica',
    tituloLargo: 'VT = VISITA TÉCNICA',
    color: 'amber',
    badgeBg: 'bg-amber-500',
    badgeText: 'text-white',
    activeBg: 'bg-amber-500 text-white shadow-md shadow-amber-500/20',
    activeRing: 'ring-2 ring-amber-500',
    descripcion: 'Atención técnica por falla, soporte en domicilio, verificación de potencia o reubicación.',
  },
  {
    id: 'R',
    code: 'R',
    nombre: 'Retiro',
    tituloLargo: 'R = RETIRO',
    color: 'rose',
    badgeBg: 'bg-rose-600',
    badgeText: 'text-white',
    activeBg: 'bg-rose-600 text-white shadow-md shadow-rose-500/20',
    activeRing: 'ring-2 ring-rose-500',
    descripcion: 'Retiro de equipos instalados (ONT, decodificadores, repetidores) y suspensión/baja de servicio.',
  },
];

export const INITIAL_TASKS: TaskData[] = [
  {
    id: 'task-9',
    markerNumber: 9,
    markerColor: 'yellow',
    dni: '40037594',
    nombre: 'HUACACOLQUE LOZANO VALERY PASCUAL',
    initials: 'I',
    tipoActividad: 'I',
    codSuscri: 'SUB44377',
    inicio: '-',
    suspBaja: '2025-03-20',
    ordenRatio: '1/1',
    estado: 'REPROGRAMADO',
    jefeTecnico: '-',
    tecAsignado: 'Sin Asignar',
    fachadaUrl: null,
    telefono: '937 785 585',
    comentarioTelf: 'Sin comentarios',
    direccion: 'JR MARACAIBO 1573 PERU PISO 1',
    coordenadas: [-12.02983, -77.05445],

    // Observaciones
    tipoTrabajo: 'TRASLADO INTERNO',
    nroTicket: 'VFP273001',
    obsPlanificacion: 'TRASLADO INTERNO SIN COSTO, SE LE INDICÓ LAS ESPECIFICACIONES, VALIDAR POTENCIA CON EL NOC',
    obsOperaciones: '-',
    obsTecnico: '-',
    notasOdoo: [],

    // Acciones
    jefeSeleccionado: '',
    tecSeleccionado: '',
    horaInicio: 'Pendiente',
    pasos: {
      paso1: 'Pendiente',
      paso2: 'Pendiente',
      paso3: 'Pendiente',
    },

    fotosFachada: [],
    fotosEvidencias: [],
    evaluacionCaja: {
      seInstaloCaja: true,
      fotosCaja: [],
      calificacion: '',
      fotosPotencia: [],
      potenciaCajaDbm: '-18.4',
      potenciaCasaDbm: '-19.2',
      fotosRecorridoKmz: [],
    },
    fibraMateriales: {
      activo: true,
      usoFibra: true,
      fibraInicio: '1540',
      fibraFin: '1625',
      fibraResultado: '85',
      usoUtp: false,
      utpInicio: '0',
      utpFin: '0',
      utpResultado: '0',
      materiales: { ...DEFAULT_MATERIALES },
    },
    pagoInfo: {
      tipoPago: '',
      precio: '',
      registrado: false,
    },

    // Técnico
    troncal: 'SMP-TOMAS VALLE 49-96',
    odf: '-',
    hilo: '96',
    caja: '1A',
    puerto: '2',
    datoOnt: '2B ROUTER - ZTE ZXHN F670L',
    macNoc: '5A544547D6DDF359',
    macTv: '-',
    macTv2: '-',
    macTv3: '-',
    macTv4: '-',
    marcaRepetidor: 'MESH',
    nroRepetidor: '1CAEBF95188',
    macSwitch: '-',

    // Historial
    cambiosRegistrados: [],
    visitasPrevias: [
      {
        id: 'hist-1',
        date: '2026-01-28',
        author: 'Christian.Tenazoa',
        diagnostico: 'EQUIPOS MAL CONFIGURADOS',
        solucion: 'CAMBIO DE EQUIPO Y OTROS',
        descripcion:
          '40037594 SE VALIDA PLAN CONTRATADO SIN PERDIDAS DE PAQUETES Y PARAMETROS ESTABLES POR WIFI. SE CAMBIO DE ROUTER A MODO DE DESCARTE Y SE INFORMO AL USUARIO COMPROBAR LA EXISTENCIA DE INTERMITENCIA DESCONECTANDO REPETIDOR HUAWEI MESH MAS ADELANTE. ADICIONAL, USUARIO INDICA USAR MAGIS TV Y PRESENTAR PAUSAS, SE INFORMO SOBRE LA POCA CONFIABILIDAD DE LA APP Y AL SER UN SERVICIO DE TERCERO NO SE GARANTIZA LA ESTABILIDAD. SE DEJO SERVICIO OPERATIVO NUMERO DE CONTACTO: 971 235 125 ALEJANDRO',
      },
      {
        id: 'hist-2',
        date: '2025-06-11',
        author: 'Rodrigo.Chire',
        diagnostico: 'ATENUACION DE PATCH CORD',
        solucion: 'CONEXIÓN CORRECTA DE PATCH CORD',
        descripcion:
          '40037594 se encontró a cliente con patch cord ligeramente atenuado, se libero y se conecto al equipo, se mando a verificar y quedó ok, Cliente cuenta con servicio operativo.',
      },
      {
        id: 'hist-3',
        date: '2025-02-14',
        author: 'Edwin.Ramos',
        diagnostico: 'BAJA POTENCIA ÓPTICA',
        solucion: 'REFUSIÓN EN CAJA NAP 1A',
        descripcion:
          'Potencia en roseta registraba -28.4 dBm. Se limpió conector y se calibró splitter en troncal SMP-TOMAS VALLE. Potencia final quedó en -19.2 dBm.',
      },
    ],
  },
  {
    id: 'task-1',
    markerNumber: 1,
    markerColor: 'red',
    dni: '42881903',
    nombre: 'QUISPE MENDOZA FLOR DE MARIA',
    initials: 'VT',
    tipoActividad: 'VT',
    codSuscri: 'SUB39218',
    inicio: '-',
    suspBaja: '2025-03-22',
    ordenRatio: '1/2',
    estado: 'LIQUIDADO',
    jefeTecnico: 'Ing. Carlos Mendoza (LIMA NORTE)',
    tecAsignado: 'Rodrigo Chire',
    fachadaUrl: null,
    telefono: '984 112 344',
    comentarioTelf: 'Llamar 30 mins antes de llegar',
    direccion: 'AV ZARUMILLA 480 PERU PISO 2',
    coordenadas: [-12.03541, -77.04288], // Zarumilla / Panamericana Norte, Lima

    tipoTrabajo: 'AVERIA / SIN SERVICIO',
    nroTicket: 'VFP273088',
    obsPlanificacion: 'CLIENTE REPORTA LOS ROJO EN ONT DESDE LA MAÑANA. PRIORIDAD ALTA.',
    obsOperaciones: 'SE ASIGNÓ A CUADRILLA 4 NORTE',
    obsTecnico: '-',
    notasOdoo: [],

    jefeSeleccionado: 'Ing. Carlos Mendoza (LIMA NORTE)',
    tecSeleccionado: 'Rodrigo Chire',
    horaInicio: '09:30 AM',
    horaFin: '17/10/2026 11:42',
    pasos: {
      paso1: 'Completado',
      paso2: 'Completado',
      paso3: 'Completado',
    },

    fotosFachada: [],
    fotosEvidencias: [],
    pagoInfo: {
      tipoPago: '',
      precio: '',
      registrado: false,
    },

    troncal: 'SMP-ZARUMILLA 12-24',
    odf: 'ODF-01',
    hilo: '12',
    caja: '3B',
    puerto: '4',
    datoOnt: 'HUAWEI HG8145V5',
    macNoc: '48570D03F19A2B',
    macTv: '-',
    macTv2: '-',
    macTv3: '-',
    macTv4: '-',
    marcaRepetidor: 'HUAWEI',
    nroRepetidor: 'HW20249811',
    macSwitch: '-',

    cambiosRegistrados: [],
    visitasPrevias: [
      {
        id: 'hist-10',
        date: '2025-11-04',
        author: 'Rodrigo.Chire',
        diagnostico: 'CONECTOR SUCIO',
        solucion: 'LIMPIEZA CON ONE-CLICK CLEANER',
        descripcion: 'Se realizó limpieza de férula SC/APC en roseta óptica. Se normalizó la potencia a -18.5 dBm.',
      },
    ],
  },
];

export interface EquipmentCatalogItem {
  sn: string;
  mac: string;
  marca: string;
}

export const EQUIPMENT_CATALOG: EquipmentCatalogItem[] = [
  {
    sn: '4857544397BBAFB',
    mac: '68962ECA0ABE',
    marca: 'Huawei 6 wifi',
  },
  {
    sn: '5A544547D6DDF359',
    mac: '2B ROUTER',
    marca: 'ZTE ZXHN F670L',
  },
  {
    sn: 'ZTEGC7A12BC3',
    mac: 'A42B8C1D2E3F',
    marca: 'ZTE F670L Wifi 6',
  },
  {
    sn: 'ZTEGC9B44F12',
    mac: '94282EAA12B3',
    marca: 'ZTE F660',
  },
  {
    sn: '48570D03F19A2B',
    mac: '485702A1B2C3',
    marca: 'Huawei HG8145V5',
  },
  {
    sn: 'FHTT12345678',
    mac: '000A17B4C5D6',
    marca: 'FiberHome AN5506',
  },
];
