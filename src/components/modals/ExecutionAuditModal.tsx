import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  X,
  Camera,
  Image as ImageIcon,
  FileText,
  RotateCw,
  Clock,
  CloudUpload,
  Trash2,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Save,
  Move,
  Maximize2,
  Sparkles,
  Box,
  Activity,
  Map,
  ThumbsUp,
  AlertTriangle,
  ThumbsDown,
  ChevronDown,
  ChevronUp,
  Cable,
  Wrench,
  Plus,
  Minus,
  Search,
  Package,
  Check,
  Lock,
  Unlock,
  ZoomIn,
  Layers,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Router,
  Tv,
  Wifi,
} from 'lucide-react';
import { TaskData, PhotoEvidence, CajaEvaluation, FibraMaterialesData, RegistroEquiposData, TipoActividad, VTDañoData, VTMaterialesData, VTEquiposData, VTPaso3Data } from '../../types/task';
import { SAMPLE_PHOTOS, DEFAULT_MATERIALES, EQUIPMENT_CATALOG } from '../../data/mockData';
import { PhotoLightboxViewer } from './PhotoLightboxViewer';
import { VTModal } from './VTModal';
import { RetiroModal } from './RetiroModal';
import { HoraFinalField, formatFechaHoraFin } from './wizardShared';

interface SaveLockButtonProps {
  isLocked: boolean;
  onSave: () => void;
  onUnlock: () => void;
  label?: string;
  lockedLabel?: string;
}

const SaveLockButton: React.FC<SaveLockButtonProps> = ({
  isLocked,
  onSave,
  onUnlock,
  label = 'Guardar',
  lockedLabel = 'Guardado y Protegido',
}) => {
  const [isLocking, setIsLocking] = useState<boolean>(false);

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLocked) return;
    setIsLocking(true);
    setTimeout(() => {
      setIsLocking(false);
      onSave();
    }, 550);
  };

  const handleUnlockClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUnlock();
  };

  if (isLocked) {
    return (
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl px-3 py-1.5 shadow-2xs animate-in fade-in duration-200"
      >
        <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-800">
          <div className="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Lock className="w-3.5 h-3.5" />
          </div>
          <span>{lockedLabel}</span>
        </div>
        <button
          type="button"
          onClick={handleUnlockClick}
          className="ml-2 px-2.5 py-1 bg-white hover:bg-emerald-100 text-emerald-700 hover:text-emerald-900 border border-emerald-300 rounded-lg text-xs font-black flex items-center gap-1 cursor-pointer transition-all shadow-2xs hover:shadow-xs active:scale-95"
          title="Desbloquear para realizar modificaciones"
        >
          <Unlock className="w-3.5 h-3.5 text-emerald-600" />
          <span>Desbloquear</span>
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleSaveClick}
      disabled={isLocking}
      className={`group flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black text-white transition-all shadow-sm cursor-pointer select-none active:scale-95 ${
        isLocking
          ? 'bg-emerald-600 ring-2 ring-emerald-300 scale-98'
          : 'bg-[#0284c7] hover:bg-[#0369a1]'
      }`}
      title="Guardar y asegurar datos"
    >
      {/* Candado animado: arco abierto que baja y se cierra */}
      <div className="relative w-4 h-4 flex items-center justify-center shrink-0">
        <svg
          viewBox="0 0 24 24"
          className="w-4 h-4 text-white overflow-visible"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Arco del candado con animación de cierre */}
          <path
            d={isLocking ? "M7 11V7a5 5 0 0 1 10 0v4" : "M7 11V7a5 5 0 0 1 9.5-2.2"}
            className="transition-all duration-300 ease-out origin-bottom-left"
          />
          {/* Cuerpo del candado */}
          <rect
            x="4"
            y="11"
            width="16"
            height="11"
            rx="2.5"
            ry="2.5"
            fill="currentColor"
            fillOpacity="0.25"
          />
          {/* Ojo de la cerradura */}
          <circle cx="12" cy="15.5" r="1.2" fill="currentColor" />
          <path d="M12 16.7v1.8" strokeWidth="2" />
        </svg>
      </div>
      <span>{isLocking ? 'Asegurando y Guardando...' : label}</span>
    </button>
  );
};

interface ExecutionAuditModalProps {
  task: TaskData;
  isOpen: boolean;
  initialStep?: 1 | 2 | 3;
  onClose: () => void;
  onUpdateTask: (updated: Partial<TaskData>) => void;
  onShowToast: (message: string) => void;
}

export const ExecutionAuditModal: React.FC<ExecutionAuditModalProps> = ({
  task,
  isOpen,
  initialStep = 1,
  onClose,
  onUpdateTask,
  onShowToast,
}) => {
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(initialStep);

  const currentActividad: TipoActividad =
    task.tipoActividad || (task.initials === 'VT' ? 'VT' : task.initials === 'R' ? 'R' : 'I');

  const handleSelectActividad = (act: TipoActividad) => {
    onUpdateTask({
      tipoActividad: act,
      initials: act,
    });
    const desc = act === 'I' ? 'I = INSTALACIÓN' : act === 'VT' ? 'VT = VISITA TÉCNICA' : 'R = RETIRO';
    onShowToast(`Actividad cambiada a: ${desc}`);
  };

  useEffect(() => {
    if (isOpen) {
      setActiveStep(initialStep);
    }
  }, [isOpen, initialStep]);
  const [draggedPhoto, setDraggedPhoto] = useState<PhotoEvidence | null>(null);
  const [selectedTipoPago, setSelectedTipoPago] = useState<string>(task.pagoInfo?.tipoPago || '');
  const [precio, setPrecio] = useState<string>(task.pagoInfo?.precio || '');
  const [viewerState, setViewerState] = useState<{
    isOpen: boolean;
    photos: PhotoEvidence[];
    initialIndex: number;
  }>({
    isOpen: false,
    photos: [],
    initialIndex: 0,
  });
  const [isCajaContentExpanded, setIsCajaContentExpanded] = useState<boolean>(true);
  const [isMaterialesContentExpanded, setIsMaterialesContentExpanded] = useState<boolean>(true);
  const [isEquiposContentExpanded, setIsEquiposContentExpanded] = useState<boolean>(true);
  const [materialSearch, setMaterialSearch] = useState<string>('');
  const [customMaterialName, setCustomMaterialName] = useState<string>('');

  // Initial evaluation state with defaults
  const evalCaja: CajaEvaluation = task.evaluacionCaja || {
    seInstaloCaja: true,
    fotosCaja: [],
    calificacion: '',
    fotosPotencia: [],
    potenciaCajaDbm: '-18.4',
    potenciaCasaDbm: '-19.2',
    fotosRecorridoKmz: [],
    bloqueado: false,
  };

  // Fibra y Materiales state with defaults
  const fibraMat: FibraMaterialesData = task.fibraMateriales || {
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
    fotosMateriales: [],
    bloqueado: false,
  };

  const updateFibraMat = (patch: Partial<FibraMaterialesData>) => {
    const updated = { ...fibraMat, ...patch };
    onUpdateTask({ fibraMateriales: updated });
  };

  // Registro de Equipos state with defaults
  const initialRouterMarca = () => {
    if (task.registroEquipos?.routerMarca !== undefined) {
      return task.registroEquipos.routerMarca;
    }
    const cleanSn = task.registroEquipos?.routerSn
      ? task.registroEquipos.routerSn.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
      : task.datoOnt
      ? task.datoOnt.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
      : '';
    const cleanMac = task.registroEquipos?.routerMac
      ? task.registroEquipos.routerMac.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
      : task.macNoc
      ? task.macNoc.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
      : '';
    if (!cleanSn && !cleanMac) return '';
    const match = EQUIPMENT_CATALOG.find(
      (eq) =>
        (cleanSn && eq.sn.replace(/[^A-Za-z0-9]/g, '').toUpperCase() === cleanSn) ||
        (cleanMac && eq.mac.replace(/[^A-Za-z0-9]/g, '').toUpperCase() === cleanMac)
    );
    if (match) return match.marca;
    return 'Equipo no existe';
  };

  const regEquipos: RegistroEquiposData = task.registroEquipos || {
    activo: true,
    fotosEquipos: [],
    routerMac: task.macNoc || '',
    routerSn: task.datoOnt || '',
    routerMarca: initialRouterMarca(),
    usoDecodificador: !!(task.macTv || task.macTv2),
    decodificadores: [
      task.macTv || '',
      task.macTv2 || '',
      task.macTv3 || '',
      task.macTv4 || '',
    ].filter(Boolean).length > 0
      ? [task.macTv, task.macTv2, task.macTv3, task.macTv4].filter(Boolean)
      : [''],
    usoRepetidor: !!task.nroRepetidor,
    repetidores: task.nroRepetidor ? [task.nroRepetidor] : [''],
    usoSwitch: !!task.macSwitch,
    switches: task.macSwitch ? [task.macSwitch] : [''],
    bloqueado: false,
  };

  const updateRegEquipos = (patch: Partial<RegistroEquiposData>) => {
    const updated = { ...regEquipos, ...patch };
    onUpdateTask({
      registroEquipos: updated,
      ...(patch.routerMac !== undefined ? { macNoc: patch.routerMac } : {}),
      ...(patch.routerSn !== undefined ? { datoOnt: patch.routerSn } : {}),
      ...(patch.decodificadores !== undefined ? {
        macTv: patch.decodificadores[0] || '',
        macTv2: patch.decodificadores[1] || '',
        macTv3: patch.decodificadores[2] || '',
        macTv4: patch.decodificadores[3] || '',
      } : {}),
      ...(patch.repetidores !== undefined ? { nroRepetidor: patch.repetidores[0] || '' } : {}),
      ...(patch.switches !== undefined ? { macSwitch: patch.switches[0] || '' } : {}),
    });
  };

  // ============================================================
  // VT STATE VARIABLES
  // ============================================================
  const [isVTDañoExpanded, setIsVTDañoExpanded] = useState<boolean>(true);
  const [isVTMaterialesExpanded, setIsVTMaterialesExpanded] = useState<boolean>(true);
  const [isVTEquiposExpanded, setIsVTEquiposExpanded] = useState<boolean>(true);
  const [isVTPaso3Expanded, setIsVTPaso3Expanded] = useState<boolean>(true);

  const vtDaño: VTDañoData = task.vtDaño || {
    activo: true,
    fotosDaño: [],
    fotosPotenciaInicial: [],
    fotosPotenciaFinal: [],
    fotosKmz: [],
    medicionInicial: '',
    medicionFinal: '',
    fotosCaja: [],
    calificacionCaja: '',
    fotosRoseta: [],
    evaluacionRoseta: '',
    bloqueado: false,
  };

  const vtMateriales: VTMaterialesData = task.vtMateriales || {
    activo: true,
    fotosMateriales: [],
    materiales: { ...DEFAULT_MATERIALES },
    usoFibra: true,
    fibraHilos: '',
    fibraInicio: '',
    fibraFin: '',
    fibraResultado: '0',
    usoUtp: false,
    utpInicio: '',
    utpFin: '',
    utpResultado: '0',
    bloqueado: false,
  };

  const vtEquipos: VTEquiposData = task.vtEquipos || {
    activo: true,
    seRetiroEquipo: false,
    fotosRetirados: [],
    equipoRetiradoMac: '',
    equipoRetiradoSn: '',
    equipoRetiradoMarca: '',
    seActivoEquipo: false,
    fotosActivos: [],
    routerMac: task.macNoc || '',
    routerSn: task.datoOnt || '',
    routerMarca: '',
    seActivoDeco: false,
    fotosDeco: [],
    decodificadores: [''],
    seActivoSwitch: false,
    fotosSwitch: [],
    switches: [''],
    seActivoRepetidor: false,
    fotosRepetidor: [],
    repetidores: [''],
    bloqueado: false,
  };

  const vtPaso3: VTPaso3Data = task.vtPaso3 || {
    causaDaño: '',
    gradoAfectacion: '',
    diagnostico: '',
    solucion: '',
    fotosEvidencias: [],
    bloqueado: false,
  };

  const updateVTDaño = (patch: Partial<VTDañoData>) => {
    const updated = { ...vtDaño, ...patch };
    onUpdateTask({ vtDaño: updated });
  };

  const updateVTMateriales = (patch: Partial<VTMaterialesData>) => {
    const updated = { ...vtMateriales, ...patch };
    onUpdateTask({ vtMateriales: updated });
  };

  const updateVTEquipos = (patch: Partial<VTEquiposData>) => {
    const updated = { ...vtEquipos, ...patch };
    onUpdateTask({ vtEquipos: updated });
  };

  const updateVTPaso3 = (patch: Partial<VTPaso3Data>) => {
    const updated = { ...vtPaso3, ...patch };
    onUpdateTask({ vtPaso3: updated });
  };

  const normalizeCode = (val?: string) => (val ? val.replace(/[^A-Za-z0-9]/g, '').toUpperCase() : '');

  // Lógica de detección bidireccional de Router ONT
  const handleSnChange = (newSnRaw: string) => {
    const snVal = newSnRaw.toUpperCase();
    const cleanSn = normalizeCode(snVal);

    if (!cleanSn) {
      const cleanMac = normalizeCode(regEquipos.routerMac);
      if (!cleanMac) {
        updateRegEquipos({ routerSn: snVal, routerMac: '', routerMarca: '' });
      } else {
        const match = EQUIPMENT_CATALOG.find((eq) => normalizeCode(eq.mac) === cleanMac);
        if (match) {
          updateRegEquipos({ routerSn: snVal, routerMarca: match.marca });
        } else {
          updateRegEquipos({ routerSn: snVal, routerMarca: 'Equipo no existe' });
        }
      }
      return;
    }

    // Buscar en catálogo por SN
    const match = EQUIPMENT_CATALOG.find((eq) => normalizeCode(eq.sn) === cleanSn);

    if (match) {
      // Si el SN reconoce la serie, autocompleta la MAC y marca de equipo
      updateRegEquipos({
        routerSn: snVal,
        routerMac: match.mac,
        routerMarca: match.marca,
      });
    } else {
      // Si no reconoce la serie, no aparece nada en la mac y marca sale: Equipo no existe
      updateRegEquipos({
        routerSn: snVal,
        routerMac: '',
        routerMarca: 'Equipo no existe',
      });
    }
  };

  const handleMacChange = (newMacRaw: string) => {
    const macVal = newMacRaw.toUpperCase();
    const cleanMac = normalizeCode(macVal);

    if (!cleanMac) {
      const cleanSn = normalizeCode(regEquipos.routerSn);
      if (!cleanSn) {
        updateRegEquipos({ routerMac: macVal, routerSn: '', routerMarca: '' });
      } else {
        const match = EQUIPMENT_CATALOG.find((eq) => normalizeCode(eq.sn) === cleanSn);
        if (match) {
          updateRegEquipos({ routerMac: macVal, routerMarca: match.marca });
        } else {
          updateRegEquipos({ routerMac: macVal, routerMarca: 'Equipo no existe' });
        }
      }
      return;
    }

    // Buscar en catálogo por MAC
    const match = EQUIPMENT_CATALOG.find((eq) => normalizeCode(eq.mac) === cleanMac);

    if (match) {
      // Si la MAC reconoce la serie, autocompleta el SN y marca de equipo
      updateRegEquipos({
        routerMac: macVal,
        routerSn: match.sn,
        routerMarca: match.marca,
      });
    } else {
      // Si no reconoce la mac, no aparece nada en el sn y marca sale: Equipo no existe
      updateRegEquipos({
        routerMac: macVal,
        routerSn: '',
        routerMarca: 'Equipo no existe',
      });
    }
  };

  // El inicio y fin de fibra y utp siempre será una resta / diferencia absoluta,
  // sin importar en cuál campo coloque el usuario el número mayor
  const handleFibraChange = (inicio: string, fin: string) => {
    const numIni = parseFloat(inicio) || 0;
    const numFin = parseFloat(fin) || 0;
    const hasValues = inicio.trim() !== '' || fin.trim() !== '';
    const diff = hasValues ? Math.abs(numFin - numIni) : 0;
    const formatted = diff % 1 === 0 ? `${diff}` : diff.toFixed(2);
    updateFibraMat({
      fibraInicio: inicio,
      fibraFin: fin,
      fibraResultado: hasValues ? formatted : '0',
    });
  };

  const handleUtpChange = (inicio: string, fin: string) => {
    const numIni = parseFloat(inicio) || 0;
    const numFin = parseFloat(fin) || 0;
    const hasValues = inicio.trim() !== '' || fin.trim() !== '';
    const diff = hasValues ? Math.abs(numFin - numIni) : 0;
    const formatted = diff % 1 === 0 ? `${diff}` : diff.toFixed(2);
    updateFibraMat({
      utpInicio: inicio,
      utpFin: fin,
      utpResultado: hasValues ? formatted : '0',
    });
  };

  const getFibraDiffDisplay = () => {
    if (fibraMat.fibraInicio.trim() !== '' || fibraMat.fibraFin.trim() !== '') {
      const a = parseFloat(fibraMat.fibraInicio) || 0;
      const b = parseFloat(fibraMat.fibraFin) || 0;
      const diff = Math.abs(b - a);
      return diff % 1 === 0 ? `${diff}` : diff.toFixed(2);
    }
    return fibraMat.fibraResultado || '0';
  };

  const getUtpDiffDisplay = () => {
    if (fibraMat.utpInicio.trim() !== '' || fibraMat.utpFin.trim() !== '') {
      const a = parseFloat(fibraMat.utpInicio) || 0;
      const b = parseFloat(fibraMat.utpFin) || 0;
      const diff = Math.abs(b - a);
      return diff % 1 === 0 ? `${diff}` : diff.toFixed(2);
    }
    return fibraMat.utpResultado || '0';
  };

  const handleMaterialChange = (materialName: string, delta: number) => {
    const current =
      fibraMat.materiales[materialName] !== undefined ? fibraMat.materiales[materialName] : 0;
    const nextVal = Math.max(0, Number((current + delta).toFixed(2)));
    updateFibraMat({
      materiales: {
        ...fibraMat.materiales,
        [materialName]: nextVal,
      },
    });
  };

  const handleMaterialSet = (materialName: string, val: string) => {
    const num = Math.max(0, parseFloat(val) || 0);
    updateFibraMat({
      materiales: {
        ...fibraMat.materiales,
        [materialName]: num,
      },
    });
  };

  const fileInputFachadaRef = useRef<HTMLInputElement>(null);
  const fileInputEvidenciasRef = useRef<HTMLInputElement>(null);
  const fileInputCajaRef = useRef<HTMLInputElement>(null);
  const fileInputPotenciasRef = useRef<HTMLInputElement>(null);
  const fileInputKmzRef = useRef<HTMLInputElement>(null);


  const fotosFachada = task.fotosFachada || [];
  const fotosEvidencias = task.fotosEvidencias || [];

  // Recopilar todas las fotos del modal/tarea para navegación continua
  const allModalPhotos = useMemo(() => {
    const list: PhotoEvidence[] = [];
    const seen = new Set<string>();

    const addUnique = (items: PhotoEvidence[], fallbackCategory: string) => {
      items.forEach((p, idx) => {
        const key = p.id || `${p.url}-${idx}`;
        if (!seen.has(key)) {
          seen.add(key);
          list.push({
            ...p,
            category: p.category || fallbackCategory,
          });
        }
      });
    };

    addUnique(fotosFachada, 'Foto Fachada');
    addUnique(fotosEvidencias, 'Evidencia General');
    addUnique(evalCaja.fotosCaja, 'Caja NAP');
    addUnique(evalCaja.fotosPotencia, 'Medición Potencia');
    addUnique(evalCaja.fotosRecorridoKmz, 'Recorrido KMZ');
    addUnique(fibraMat.fotosMateriales || [], 'Fibra / Materiales');
    addUnique(regEquipos.fotosEquipos || [], 'Registro de Equipos');
    addUnique(vtDaño.fotosDaño || [], 'Evidencia de Daño VT');
    addUnique(vtMateriales.fotosMateriales || [], 'Materiales VT');
    addUnique(vtEquipos.fotosRetirados || [], 'Equipo Retirado VT');
    addUnique(vtEquipos.fotosActivos || [], 'Equipo Activo VT');
    addUnique(vtEquipos.fotosDeco || [], 'Decodificador VT');
    addUnique(vtEquipos.fotosSwitch || [], 'Switch VT');
    addUnique(vtEquipos.fotosRepetidor || [], 'Repetidor VT');
    addUnique(vtPaso3.fotosEvidencias || [], 'Evidencia Final VT');

    return list;
  }, [fotosFachada, fotosEvidencias, evalCaja, fibraMat.fotosMateriales, regEquipos.fotosEquipos, vtDaño.fotosDaño, vtMateriales.fotosMateriales, vtEquipos.fotosRetirados, vtEquipos.fotosActivos, vtEquipos.fotosDeco, vtEquipos.fotosSwitch, vtEquipos.fotosRepetidor, vtPaso3.fotosEvidencias]);

  const openPhotoViewer = (
    target: PhotoEvidence | string,
    specificList?: PhotoEvidence[]
  ) => {
    const listToUse =
      specificList && specificList.length > 0 ? specificList : allModalPhotos;
    const targetUrl = typeof target === 'string' ? target : target.url;
    let idx = listToUse.findIndex(
      (p) => p.url === targetUrl || (typeof target !== 'string' && p.id === target.id)
    );

    if (idx === -1) {
      if (typeof target === 'string') {
        const fallbackPhoto: PhotoEvidence = {
          id: `pv-${Date.now()}`,
          url: target,
          title: 'Foto de Evidencia',
          type: 'general',
          timestamp: '',
          category: 'Evidencia',
        };
        setViewerState({
          isOpen: true,
          photos: [fallbackPhoto, ...listToUse],
          initialIndex: 0,
        });
        return;
      }
      idx = 0;
    }

    setViewerState({
      isOpen: true,
      photos: listToUse,
      initialIndex: idx,
    });
  };

  // Wrapper para compatibilidad total con llamadas a setPreviewPhotoUrl
  const setPreviewPhotoUrl = (url: string | null) => {
    if (url) {
      openPhotoViewer(url);
    } else {
      setViewerState((prev) => ({ ...prev, isOpen: false }));
    }
  };

  const paso1Ok = task.pasos.paso1 === 'Completado' || fotosFachada.length > 0;
  const paso2Ok =
    task.pasos.paso2 === 'Completado' ||
    fotosEvidencias.length > 0 ||
    evalCaja.fotosCaja.length > 0;
  const paso3Ok = task.pasos.paso3 === 'Completado' || !!task.pagoInfo?.registrado;

  // Update evaluation helper
  const updateEvalCaja = (patch: Partial<CajaEvaluation>) => {
    const updatedEval = { ...evalCaja, ...patch };
    onUpdateTask({
      evaluacionCaja: updatedEval,
      pasos: {
        ...task.pasos,
        paso2: 'Completado',
      },
    });
  };

  // Handlers for Paso 1 (Fachada)
  const handleUploadFachada = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        const newPhoto: PhotoEvidence = {
          id: `fachada-${Date.now()}`,
          title: file.name.replace(/\.[^/.]+$/, ''),
          url: result,
          type: 'fachada',
          timestamp: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
          category: 'Foto Fachada Frontis',
        };

        const updatedFachada = [newPhoto, ...fotosFachada];
        const nowTime = new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

        onUpdateTask({
          fotosFachada: updatedFachada,
          fachadaUrl: result,
          horaInicio: task.horaInicio === 'Pendiente' || task.horaInicio === 'No iniciada' ? nowTime : task.horaInicio,
          pasos: {
            ...task.pasos,
            paso1: 'Completado',
          },
        });

        onShowToast('Foto de fachada registrada y Paso 1 completado');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddSampleFachada = (sample: { title: string; url: string; category: string }) => {
    const newPhoto: PhotoEvidence = {
      id: `sample-fachada-${Date.now()}`,
      title: sample.title,
      url: sample.url,
      type: 'fachada',
      timestamp: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
      category: sample.category,
    };

    const updatedFachada = [newPhoto, ...fotosFachada];
    const nowTime = new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

    onUpdateTask({
      fotosFachada: updatedFachada,
      fachadaUrl: sample.url,
      horaInicio: task.horaInicio === 'Pendiente' || task.horaInicio === 'No iniciada' ? nowTime : task.horaInicio,
      pasos: {
        ...task.pasos,
        paso1: 'Completado',
      },
    });

    onShowToast('Foto de ejemplo de fachada cargada');
  };

  const handleDeleteFachada = (id: string) => {
    const updated = fotosFachada.filter((f) => f.id !== id);
    onUpdateTask({
      fotosFachada: updated,
      fachadaUrl: updated.length > 0 ? updated[0].url : null,
      pasos: {
        ...task.pasos,
        paso1: updated.length > 0 ? 'Completado' : 'Pendiente',
      },
    });
    onShowToast('Foto de fachada eliminada');
  };

  // Handlers for Paso 2 (Fotos Generales)
  const handleUploadEvidencias = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newItems: PhotoEvidence[] = [];
      Array.from(files).forEach((file, idx) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          newItems.push({
            id: `evidencia-${Date.now()}-${idx}`,
            title: file.name.replace(/\.[^/.]+$/, ''),
            url: result,
            type: 'general',
            timestamp: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
            category: 'Evidencia General',
          });

          if (newItems.length === files.length) {
            const updated = [...newItems, ...fotosEvidencias];
            onUpdateTask({
              fotosEvidencias: updated,
              pasos: {
                ...task.pasos,
                paso2: 'Completado',
              },
            });
            onShowToast(`${files.length} foto(s) de evidencia subida(s)`);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleAddSampleEvidencia = (sample: { title: string; url: string; category: string }) => {
    const newPhoto: PhotoEvidence = {
      id: `sample-ev-${Date.now()}-${Math.random()}`,
      title: sample.title,
      url: sample.url,
      type: 'general',
      timestamp: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
      category: sample.category,
    };

    const updated = [newPhoto, ...fotosEvidencias];
    onUpdateTask({
      fotosEvidencias: updated,
      pasos: {
        ...task.pasos,
        paso2: 'Completado',
      },
    });
    onShowToast(`Evidencia agregada: ${sample.title}`);
  };

  const handleDeleteEvidencia = (photoId: string) => {
    const updated = fotosEvidencias.filter((p) => p.id !== photoId);
    onUpdateTask({ fotosEvidencias: updated });
    onShowToast('Foto general eliminada');
  };

  // Kanban Drag and Drop from Fotos Generales to Evaluación de Caja
  const handleDragStart = (e: React.DragEvent, photo: PhotoEvidence) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(photo));
    setDraggedPhoto(photo);
  };

  const handleDropOnCaja = (e: React.DragEvent) => {
    e.preventDefault();
    let photo = draggedPhoto;
    try {
      const data = e.dataTransfer.getData('text/plain');
      if (data) photo = JSON.parse(data);
    } catch {
      // fallback to state
    }

    if (!photo) return;

    // Add to fotosCaja if not present
    if (!evalCaja.fotosCaja.some((f) => f.id === photo?.id)) {
      const updatedCaja = [{ ...photo, type: 'caja' as const }, ...evalCaja.fotosCaja];
      // remove from fotosGenerales
      const updatedGenerales = fotosEvidencias.filter((p) => p.id !== photo?.id);

      updateEvalCaja({ fotosCaja: updatedCaja });
      onUpdateTask({
        fotosEvidencias: updatedGenerales,
        evaluacionCaja: {
          ...evalCaja,
          fotosCaja: updatedCaja,
        },
      });
      onShowToast(`Foto "${photo.title}" arrastrada a Evaluación de Caja`);
    }
    setDraggedPhoto(null);
  };

  const handleDropOnKmz = (e: React.DragEvent) => {
    e.preventDefault();
    let photo = draggedPhoto;
    try {
      const data = e.dataTransfer.getData('text/plain');
      if (data) photo = JSON.parse(data);
    } catch {
      // fallback
    }

    if (!photo) return;

    if (!evalCaja.fotosRecorridoKmz.some((f) => f.id === photo?.id)) {
      const updatedKmz = [
        { ...photo, type: 'kmz' as const, category: 'Recorrido KMZ' },
        ...evalCaja.fotosRecorridoKmz,
      ];
      const updatedGenerales = fotosEvidencias.filter((p) => p.id !== photo?.id);

      updateEvalCaja({ fotosRecorridoKmz: updatedKmz });
      onUpdateTask({
        fotosEvidencias: updatedGenerales,
        evaluacionCaja: {
          ...evalCaja,
          fotosRecorridoKmz: updatedKmz,
        },
      });
      onShowToast(`Foto "${photo.title}" asignada a Recorrido KMZ 📍`);
    }
    setDraggedPhoto(null);
  };

  const handleDropOnPotencias = (e: React.DragEvent) => {
    e.preventDefault();
    let photo = draggedPhoto;
    try {
      const data = e.dataTransfer.getData('text/plain');
      if (data) photo = JSON.parse(data);
    } catch {
      // fallback
    }

    if (!photo) return;

    if (!evalCaja.fotosPotencia.some((f) => f.id === photo?.id)) {
      const updatedPot = [
        { ...photo, type: 'potencia' as const, category: 'Medición Potencia' },
        ...evalCaja.fotosPotencia,
      ];
      const updatedGenerales = fotosEvidencias.filter((p) => p.id !== photo?.id);

      updateEvalCaja({ fotosPotencia: updatedPot });
      onUpdateTask({
        fotosEvidencias: updatedGenerales,
        evaluacionCaja: {
          ...evalCaja,
          fotosPotencia: updatedPot,
        },
      });
      onShowToast(`Foto "${photo.title}" asignada a Mediciones de Potencia ⚡`);
    }
    setDraggedPhoto(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropOnMateriales = (e: React.DragEvent) => {
    e.preventDefault();
    let photo = draggedPhoto;
    try {
      const data = e.dataTransfer.getData('text/plain');
      if (data) photo = JSON.parse(data);
    } catch {
      // fallback
    }

    if (!photo) return;

    const currentFotos = fibraMat.fotosMateriales || [];
    if (!currentFotos.some((f) => f.id === photo?.id)) {
      const updatedFotos = [
        { ...photo, type: 'materiales' as const, category: 'Fibra / Materiales' },
        ...currentFotos,
      ];
      const updatedGenerales = fotosEvidencias.filter((p) => p.id !== photo?.id);

      updateFibraMat({ fotosMateriales: updatedFotos });
      onUpdateTask({
        fotosEvidencias: updatedGenerales,
        fibraMateriales: {
          ...fibraMat,
          fotosMateriales: updatedFotos,
        },
      });
      onShowToast(`Foto "${photo.title}" arrastrada a Fibra y Materiales 📦`);
    }
    setDraggedPhoto(null);
  };

  const handleAddSampleMateriales = (sample: { title: string; url: string; category: string }) => {
    const newPhoto: PhotoEvidence = {
      id: `sample-mat-${Date.now()}-${Math.random()}`,
      title: sample.title,
      url: sample.url,
      type: 'materiales',
      timestamp: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
      category: sample.category,
    };
    const currentFotos = fibraMat.fotosMateriales || [];
    updateFibraMat({ fotosMateriales: [newPhoto, ...currentFotos] });
    onShowToast('Foto agregada a Fibra y Materiales');
  };

  // Lock and Save handlers
  const handleSaveCaja = () => {
    updateEvalCaja({ bloqueado: true });
    onShowToast('Evaluación de Caja guardada y asegurada 🔒');
  };

  const handleUnlockCaja = () => {
    updateEvalCaja({ bloqueado: false });
    onShowToast('Evaluación de Caja desbloqueada para edición 🔓');
  };

  const handleSaveMateriales = () => {
    updateFibraMat({ bloqueado: true });
    onShowToast('Fibra y Materiales guardados y asegurados 🔒');
  };

  const handleUnlockMateriales = () => {
    updateFibraMat({ bloqueado: false });
    onShowToast('Fibra y Materiales desbloqueados para edición 🔓');
  };

  const handleDropOnEquipos = (e: React.DragEvent) => {
    e.preventDefault();
    let photo = draggedPhoto;
    try {
      const data = e.dataTransfer.getData('text/plain');
      if (data) photo = JSON.parse(data);
    } catch {
      // fallback
    }

    if (!photo) return;

    const currentFotos = regEquipos.fotosEquipos || [];
    if (!currentFotos.some((f) => f.id === photo?.id)) {
      const updatedFotos = [
        { ...photo, type: 'equipos' as const, category: 'Registro de Equipos' },
        ...currentFotos,
      ];
      const updatedGenerales = fotosEvidencias.filter((p) => p.id !== photo?.id);

      updateRegEquipos({ fotosEquipos: updatedFotos });
      onUpdateTask({
        fotosEvidencias: updatedGenerales,
        registroEquipos: {
          ...regEquipos,
          fotosEquipos: updatedFotos,
        },
      });
      onShowToast(`Foto "${photo.title}" arrastrada a Registro de Equipos 📡`);
    }
    setDraggedPhoto(null);
  };

  const handleAddSampleEquipos = (sample: { title: string; url: string; category: string }) => {
    const newPhoto: PhotoEvidence = {
      id: `sample-eq-${Date.now()}-${Math.random()}`,
      title: sample.title,
      url: sample.url,
      type: 'equipos',
      timestamp: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
      category: sample.category,
    };
    const currentFotos = regEquipos.fotosEquipos || [];
    updateRegEquipos({ fotosEquipos: [newPhoto, ...currentFotos] });
    onShowToast('Foto de equipo agregada a Registro de Equipos');
  };

  const handleSaveEquipos = () => {
    updateRegEquipos({ bloqueado: true });
    onShowToast('Registro de Equipos guardado y asegurado 🔒');
  };

  const handleUnlockEquipos = () => {
    updateRegEquipos({ bloqueado: false });
    onShowToast('Registro de Equipos desbloqueado para edición 🔓');
  };

  // ============================================================
  // VT DRAG AND DROP HANDLERS
  // ============================================================
  const handleDropOnVTDaño = (e: React.DragEvent) => {
    e.preventDefault();
    let photo = draggedPhoto;
    try {
      const data = e.dataTransfer.getData('text/plain');
      if (data) photo = JSON.parse(data);
    } catch { /* fallback */ }
    if (!photo) return;
    const currentFotos = vtDaño.fotosDaño;
    if (!currentFotos.some((f) => f.id === photo?.id)) {
      const updatedFotos = [{ ...photo, type: 'general' as const, category: 'Evidencia de Daño' }, ...currentFotos];
      const updatedGenerales = fotosEvidencias.filter((p) => p.id !== photo?.id);
      updateVTDaño({ fotosDaño: updatedFotos });
      onUpdateTask({
        fotosEvidencias: updatedGenerales,
        vtDaño: { ...vtDaño, fotosDaño: updatedFotos },
      });
      onShowToast(`Foto "${photo.title}" arrastrada a Evidencias de Daño`);
    }
    setDraggedPhoto(null);
  };

  const handleDropOnVTMateriales = (e: React.DragEvent) => {
    e.preventDefault();
    let photo = draggedPhoto;
    try {
      const data = e.dataTransfer.getData('text/plain');
      if (data) photo = JSON.parse(data);
    } catch { /* fallback */ }
    if (!photo) return;
    const currentFotos = vtMateriales.fotosMateriales;
    if (!currentFotos.some((f) => f.id === photo?.id)) {
      const updatedFotos = [{ ...photo, type: 'materiales' as const, category: 'Materiales VT' }, ...currentFotos];
      const updatedGenerales = fotosEvidencias.filter((p) => p.id !== photo?.id);
      updateVTMateriales({ fotosMateriales: updatedFotos });
      onUpdateTask({
        fotosEvidencias: updatedGenerales,
        vtMateriales: { ...vtMateriales, fotosMateriales: updatedFotos },
      });
      onShowToast(`Foto "${photo.title}" arrastrada a Materiales y Fibra`);
    }
    setDraggedPhoto(null);
  };

  const handleDropOnVTRetirados = (e: React.DragEvent) => {
    e.preventDefault();
    let photo = draggedPhoto;
    try {
      const data = e.dataTransfer.getData('text/plain');
      if (data) photo = JSON.parse(data);
    } catch { /* fallback */ }
    if (!photo) return;
    const currentFotos = vtEquipos.fotosRetirados;
    if (!currentFotos.some((f) => f.id === photo?.id)) {
      const updatedFotos = [{ ...photo, type: 'equipos' as const, category: 'Equipo Retirado' }, ...currentFotos];
      const updatedGenerales = fotosEvidencias.filter((p) => p.id !== photo?.id);
      updateVTEquipos({ fotosRetirados: updatedFotos });
      onUpdateTask({
        fotosEvidencias: updatedGenerales,
        vtEquipos: { ...vtEquipos, fotosRetirados: updatedFotos },
      });
      onShowToast(`Foto "${photo.title}" arrastrada a Equipos Retirados`);
    }
    setDraggedPhoto(null);
  };

  const handleDropOnVTActivos = (e: React.DragEvent) => {
    e.preventDefault();
    let photo = draggedPhoto;
    try {
      const data = e.dataTransfer.getData('text/plain');
      if (data) photo = JSON.parse(data);
    } catch { /* fallback */ }
    if (!photo) return;
    const currentFotos = vtEquipos.fotosActivos;
    if (!currentFotos.some((f) => f.id === photo?.id)) {
      const updatedFotos = [{ ...photo, type: 'equipos' as const, category: 'Equipo Activo' }, ...currentFotos];
      const updatedGenerales = fotosEvidencias.filter((p) => p.id !== photo?.id);
      updateVTEquipos({ fotosActivos: updatedFotos });
      onUpdateTask({
        fotosEvidencias: updatedGenerales,
        vtEquipos: { ...vtEquipos, fotosActivos: updatedFotos },
      });
      onShowToast(`Foto "${photo.title}" arrastrada a Equipos Activos`);
    }
    setDraggedPhoto(null);
  };

  const handleDropOnVTDeco = (e: React.DragEvent) => {
    e.preventDefault();
    let photo = draggedPhoto;
    try {
      const data = e.dataTransfer.getData('text/plain');
      if (data) photo = JSON.parse(data);
    } catch { /* fallback */ }
    if (!photo) return;
    const currentFotos = vtEquipos.fotosDeco;
    if (!currentFotos.some((f) => f.id === photo?.id)) {
      const updatedFotos = [{ ...photo, type: 'equipos' as const, category: 'Decodificador' }, ...currentFotos];
      const updatedGenerales = fotosEvidencias.filter((p) => p.id !== photo?.id);
      updateVTEquipos({ fotosDeco: updatedFotos });
      onUpdateTask({
        fotosEvidencias: updatedGenerales,
        vtEquipos: { ...vtEquipos, fotosDeco: updatedFotos },
      });
      onShowToast(`Foto "${photo.title}" arrastrada a Decodificadores`);
    }
    setDraggedPhoto(null);
  };

  const handleDropOnVTSwitch = (e: React.DragEvent) => {
    e.preventDefault();
    let photo = draggedPhoto;
    try {
      const data = e.dataTransfer.getData('text/plain');
      if (data) photo = JSON.parse(data);
    } catch { /* fallback */ }
    if (!photo) return;
    const currentFotos = vtEquipos.fotosSwitch;
    if (!currentFotos.some((f) => f.id === photo?.id)) {
      const updatedFotos = [{ ...photo, type: 'equipos' as const, category: 'Switch' }, ...currentFotos];
      const updatedGenerales = fotosEvidencias.filter((p) => p.id !== photo?.id);
      updateVTEquipos({ fotosSwitch: updatedFotos });
      onUpdateTask({
        fotosEvidencias: updatedGenerales,
        vtEquipos: { ...vtEquipos, fotosSwitch: updatedFotos },
      });
      onShowToast(`Foto "${photo.title}" arrastrada a Switches`);
    }
    setDraggedPhoto(null);
  };

  const handleDropOnVTRepetidor = (e: React.DragEvent) => {
    e.preventDefault();
    let photo = draggedPhoto;
    try {
      const data = e.dataTransfer.getData('text/plain');
      if (data) photo = JSON.parse(data);
    } catch { /* fallback */ }
    if (!photo) return;
    const currentFotos = vtEquipos.fotosRepetidor;
    if (!currentFotos.some((f) => f.id === photo?.id)) {
      const updatedFotos = [{ ...photo, type: 'equipos' as const, category: 'Repetidor' }, ...currentFotos];
      const updatedGenerales = fotosEvidencias.filter((p) => p.id !== photo?.id);
      updateVTEquipos({ fotosRepetidor: updatedFotos });
      onUpdateTask({
        fotosEvidencias: updatedGenerales,
        vtEquipos: { ...vtEquipos, fotosRepetidor: updatedFotos },
      });
      onShowToast(`Foto "${photo.title}" arrastrada a Repetidores`);
    }
    setDraggedPhoto(null);
  };

  const handleDropOnVTPaso3 = (e: React.DragEvent) => {
    e.preventDefault();
    let photo = draggedPhoto;
    try {
      const data = e.dataTransfer.getData('text/plain');
      if (data) photo = JSON.parse(data);
    } catch { /* fallback */ }
    if (!photo) return;
    const currentFotos = vtPaso3.fotosEvidencias;
    if (!currentFotos.some((f) => f.id === photo?.id)) {
      const updatedFotos = [{ ...photo, type: 'general' as const, category: 'Evidencia Final' }, ...currentFotos];
      const updatedGenerales = fotosEvidencias.filter((p) => p.id !== photo?.id);
      updateVTPaso3({ fotosEvidencias: updatedFotos });
      onUpdateTask({
        fotosEvidencias: updatedGenerales,
        vtPaso3: { ...vtPaso3, fotosEvidencias: updatedFotos },
      });
      onShowToast(`Foto "${photo.title}" arrastrada a Evidencias de Finalización`);
    }
    setDraggedPhoto(null);
  };

  // VT Save/Lock handlers
  const handleSaveVTDaño = () => {
    updateVTDaño({ bloqueado: true });
    onShowToast('Evidencias de Daño guardadas y aseguradas 🔒');
  };
  const handleUnlockVTDaño = () => {
    updateVTDaño({ bloqueado: false });
    onShowToast('Evidencias de Daño desbloqueadas para edición 🔓');
  };
  const handleSaveVTMateriales = () => {
    updateVTMateriales({ bloqueado: true });
    onShowToast('Materiales VT guardados y asegurados 🔒');
  };
  const handleUnlockVTMateriales = () => {
    updateVTMateriales({ bloqueado: false });
    onShowToast('Materiales VT desbloqueados para edición 🔓');
  };
  const handleSaveVTEquipos = () => {
    updateVTEquipos({ bloqueado: true });
    onShowToast('Registro de Equipos VT guardado y asegurado 🔒');
  };
  const handleUnlockVTEquipos = () => {
    updateVTEquipos({ bloqueado: false });
    onShowToast('Registro de Equipos VT desbloqueado para edición 🔓');
  };
  const handleSaveVTPaso3 = () => {
    updateVTPaso3({ bloqueado: true });
    onShowToast('Evidencias de Finalización guardadas y aseguradas 🔒');
  };
  const handleUnlockVTPaso3 = () => {
    updateVTPaso3({ bloqueado: false });
    onShowToast('Evidencias de Finalización desbloqueadas para edición 🔓');
  };

  // Handlers for specific Caja, Potencia, KMZ uploads
  const handleAddSampleCaja = (sample: { title: string; url: string; category: string }) => {
    const newPhoto: PhotoEvidence = {
      id: `sample-caja-${Date.now()}-${Math.random()}`,
      title: sample.title,
      url: sample.url,
      type: 'caja',
      timestamp: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
      category: sample.category,
    };
    updateEvalCaja({ fotosCaja: [newPhoto, ...evalCaja.fotosCaja] });
    onShowToast('Foto de caja cargada a Evaluación de Caja');
  };

  const handleAddSamplePotencia = (sample: { title: string; url: string; category: string }) => {
    const newPhoto: PhotoEvidence = {
      id: `sample-pot-${Date.now()}-${Math.random()}`,
      title: sample.title,
      url: sample.url,
      type: 'potencia',
      timestamp: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
      category: sample.category,
    };
    updateEvalCaja({ fotosPotencia: [newPhoto, ...evalCaja.fotosPotencia] });
    onShowToast('Foto de potencia registrada');
  };

  const handleAddSampleKmz = (sample: { title: string; url: string; category: string }) => {
    const newPhoto: PhotoEvidence = {
      id: `sample-kmz-${Date.now()}-${Math.random()}`,
      title: sample.title,
      url: sample.url,
      type: 'kmz',
      timestamp: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
      category: sample.category,
    };
    updateEvalCaja({ fotosRecorridoKmz: [newPhoto, ...evalCaja.fotosRecorridoKmz] });
    onShowToast('Foto de recorrido KMZ registrada');
  };

  // Paso 3 (Cierre)
  const handleTipoPagoChange = (tipo: string) => {
    setSelectedTipoPago(tipo);
    if (tipo === 'Sin Costo / Garantía' || tipo === 'Traslado Interno Promocional') {
      setPrecio('S/ 0.00');
    } else if (tipo === 'Efectivo' || tipo === 'Yape / Plin' || tipo === 'Transferencia') {
      setPrecio('S/ 50.00');
    } else if (tipo === 'Cargo en Recibo') {
      setPrecio('S/ 60.00');
    } else {
      setPrecio('');
    }
  };

  const handleGuardarCierre = () => {
    if (!selectedTipoPago) {
      onShowToast('Por favor selecciona un tipo de pago para cerrar la orden');
      return;
    }

    const nowLog = {
      id: `cierre-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
      user: task.tecAsignado !== 'Sin Asignar' ? task.tecAsignado : 'Admin Ops',
      action: 'Cierre y Liquidación de Tarea',
      details: `Tipo de Pago: ${selectedTipoPago} (${precio || 'S/ 0.00'}) · Caja: ${evalCaja.calificacion || 'No calificada'}`,
    };

    onUpdateTask({
      pagoInfo: {
        tipoPago: selectedTipoPago,
        precio: precio || 'S/ 0.00',
        registrado: true,
      },
      estado: 'LIQUIDADO',
      horaFin: formatFechaHoraFin(),
      pasos: {
        ...task.pasos,
        paso3: 'Completado',
      },
      cambiosRegistrados: [nowLog, ...(task.cambiosRegistrados || [])],
    });

    onShowToast('Cierre técnico guardado y orden liquidada con éxito en Odoo');
  };

  const handleGuardarCierreVT = () => {
    if (!selectedTipoPago) {
      onShowToast('Por favor selecciona un tipo de pago para cerrar la orden');
      return;
    }

    const nowLog = {
      id: `cierre-vt-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
      user: task.tecAsignado !== 'Sin Asignar' ? task.tecAsignado : 'Admin Ops',
      action: 'Cierre de Visita Técnica',
      details: `Causa: ${vtPaso3.causaDaño || 'N/A'} · Diagnóstico: ${vtPaso3.diagnostico || 'N/A'} · Pago: ${selectedTipoPago} (${precio || 'S/ 0.00'})`,
    };

    onUpdateTask({
      pagoInfo: {
        tipoPago: selectedTipoPago,
        precio: precio || 'S/ 0.00',
        registrado: true,
      },
      estado: 'LIQUIDADO',
      horaFin: formatFechaHoraFin(),
      pasos: {
        ...task.pasos,
        paso3: 'Completado',
      },
      cambiosRegistrados: [nowLog, ...(task.cambiosRegistrados || [])],
    });

    onShowToast('Cierre de Visita Técnica guardado y orden liquidada con éxito en Odoo');
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh]">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0 gap-4 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-900/10 flex items-center justify-center text-blue-900 shrink-0">
              <FileText className="w-5 h-5 text-[#1e3a8a]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-extrabold text-[#0f172a] text-lg tracking-tight">
                  Ejecución y Validación de Tarea
                </h2>
                <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-xs font-mono font-bold">
                  {task.nroTicket}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium truncate">
                {task.nombre} · {task.direccion}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* 3 Tipos de Actividades: I = INSTALACION, VT = VISITA TECNICA, R = RETIRO */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl border border-slate-200 shadow-2xs">
              {/* I = INSTALACION */}
              <button
                type="button"
                onClick={() => handleSelectActividad('I')}
                title="I = INSTALACIÓN (Fotos, materiales, fibra y registro de equipos)"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer active:scale-95 ${
                  currentActividad === 'I'
                    ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-400 scale-102'
                    : 'bg-white text-slate-600 hover:text-blue-600 hover:bg-blue-50 border border-slate-200'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-lg flex items-center justify-center text-[11px] font-black ${
                    currentActividad === 'I' ? 'bg-white text-blue-700' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  I
                </span>
                <span className="hidden sm:inline">INSTALACIÓN</span>
              </button>

              {/* VT = VISITA TECNICA */}
              <button
                type="button"
                onClick={() => handleSelectActividad('VT')}
                title="VT = VISITA TÉCNICA (Diagnóstico de avería y soporte)"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer active:scale-95 ${
                  currentActividad === 'VT'
                    ? 'bg-[#f97316] text-white shadow-sm ring-2 ring-orange-400 scale-102'
                    : 'bg-white text-slate-600 hover:text-orange-600 hover:bg-orange-50 border border-slate-200'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-black ${
                    currentActividad === 'VT' ? 'bg-white text-orange-700' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  VT
                </span>
                <span className="hidden sm:inline">VISITA TÉCNICA</span>
              </button>

              {/* R = RETIRO */}
              <button
                type="button"
                onClick={() => handleSelectActividad('R')}
                title="R = RETIRO (Devolución de equipos y baja)"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer active:scale-95 ${
                  currentActividad === 'R'
                    ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-400 scale-102'
                    : 'bg-white text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-lg flex items-center justify-center text-[11px] font-black ${
                    currentActividad === 'R' ? 'bg-white text-rose-700' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  R
                </span>
                <span className="hidden sm:inline">RETIRO</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              title="Cerrar"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Dynamic Activity Navigation Bar */}
        {currentActividad === 'I' ? (
          /* 3 Step Tabs Navigation Bar (EXCLUSIVO PARA I = INSTALACION) */
          <div className="px-6 py-3 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between gap-3 overflow-x-auto shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveStep(1)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer border ${
                  activeStep === 1
                    ? 'bg-[#0284c7] text-white border-[#0284c7] shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <Camera className="w-4 h-4 shrink-0" />
                <span>Paso 1: Fachada</span>
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ml-1 ${
                    paso1Ok
                      ? 'bg-emerald-600 text-white'
                      : activeStep === 1
                      ? 'bg-slate-900/80 text-white'
                      : 'bg-slate-600 text-white'
                  }`}
                >
                  {paso1Ok ? 'OK' : 'Pendiente'}
                </span>
              </button>

              <button
                onClick={() => setActiveStep(2)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer border ${
                  activeStep === 2
                    ? 'bg-[#0284c7] text-white border-[#0284c7] shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <ImageIcon className="w-4 h-4 shrink-0" />
                <span>Paso 2: Fotos Tarea</span>
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ml-1 ${
                    paso2Ok
                      ? 'bg-emerald-600 text-white'
                      : activeStep === 2
                      ? 'bg-slate-900/80 text-white'
                      : 'bg-slate-600 text-white'
                  }`}
                >
                  {paso2Ok ? 'OK' : 'Pendiente'}
                </span>
              </button>

              <button
                onClick={() => setActiveStep(3)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer border ${
                  activeStep === 3
                    ? 'bg-[#0284c7] text-white border-[#0284c7] shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <FileText className="w-4 h-4 shrink-0" />
                <span>Paso 3: Cierre y Obs.</span>
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ml-1 ${
                    paso3Ok
                      ? 'bg-emerald-600 text-white'
                      : activeStep === 3
                      ? 'bg-slate-900/80 text-white'
                      : 'bg-slate-600 text-white'
                  }`}
                >
                  {paso3Ok ? 'OK' : 'Pendiente'}
                </span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-xs font-black">
                ACTIVIDAD: I · INSTALACIÓN
              </span>
            </div>
          </div>
        ) : currentActividad === 'VT' ? (
          /* VT 3 Step Tabs Navigation Bar */
          <div className="px-6 py-3 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between gap-3 overflow-x-auto shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveStep(1)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer border ${
                  activeStep === 1
                    ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <Camera className="w-4 h-4 shrink-0" />
                <span>Paso 1: Fachada</span>
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ml-1 ${
                    paso1Ok
                      ? 'bg-emerald-600 text-white'
                      : activeStep === 1
                      ? 'bg-slate-900/80 text-white'
                      : 'bg-slate-600 text-white'
                  }`}
                >
                  {paso1Ok ? 'OK' : 'Pendiente'}
                </span>
              </button>

              <button
                onClick={() => setActiveStep(2)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer border ${
                  activeStep === 2
                    ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <Wrench className="w-4 h-4 shrink-0" />
                <span>Paso 2: Evidencias Técnicas</span>
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ml-1 ${
                    paso2Ok
                      ? 'bg-emerald-600 text-white'
                      : activeStep === 2
                      ? 'bg-slate-900/80 text-white'
                      : 'bg-slate-600 text-white'
                  }`}
                >
                  {paso2Ok ? 'OK' : 'Pendiente'}
                </span>
              </button>

              <button
                onClick={() => setActiveStep(3)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer border ${
                  activeStep === 3
                    ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <FileText className="w-4 h-4 shrink-0" />
                <span>Paso 3: Cierre y Obs.</span>
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ml-1 ${
                    paso3Ok
                      ? 'bg-emerald-600 text-white'
                      : activeStep === 3
                      ? 'bg-slate-900/80 text-white'
                      : 'bg-slate-600 text-white'
                  }`}
                >
                  {paso3Ok ? 'OK' : 'Pendiente'}
                </span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 text-xs font-black">
                ACTIVIDAD: VT · VISITA TÉCNICA
              </span>
            </div>
          </div>
        ) : (
          /* R Subheader Bar */
          <div className="px-6 py-3 bg-rose-50/70 border-b border-rose-200/90 flex items-center justify-between gap-3 overflow-x-auto shrink-0">
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-xl bg-rose-600 text-white text-xs font-black shadow-xs">
                R = RETIRO
              </span>
              <span className="text-xs text-rose-900 font-semibold hidden sm:inline">
                Recuperación de equipos, desconexión de red drop y suspensión/baja
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleSelectActividad('I')}
              className="text-xs font-bold text-rose-800 hover:text-rose-950 underline cursor-pointer"
            >
              Volver a I (Instalación)
            </button>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-slate-50/50">
          {currentActividad === 'I' ? (
            <>
              <div className="bg-white border-2 border-blue-500 rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
                {/* STEP 1: FACHADA */}
            {activeStep === 1 && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-[#0284c7] text-white font-extrabold text-lg flex items-center justify-center shrink-0 shadow-xs">
                    1
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight">
                      Paso 1: Foto de Fachada / Inicio
                    </h3>
                  </div>
                </div>

                <div className="bg-white border border-slate-200/90 rounded-2xl p-4 flex items-center justify-between text-xs sm:text-sm shadow-2xs">
                  <div className="flex items-center gap-2 font-bold text-slate-800">
                    <Clock className="w-4 h-4 text-slate-500" />
                    <span>Hora inicio de actividad</span>
                  </div>
                  <span className="font-bold text-slate-700">
                    {task.horaInicio && task.horaInicio !== 'No iniciada'
                      ? task.horaInicio
                      : 'Pendiente'}
                  </span>
                </div>

                <div className="bg-white border border-slate-200/90 rounded-2xl p-4.5 space-y-4 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-slate-900 text-xs sm:text-sm">
                      <Camera className="w-4 h-4 text-slate-600" />
                      <span>Fotos de Fachada Registradas</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onShowToast('Lista de fotos de fachada actualizada')}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-[#0284c7] font-bold text-xs rounded-xl transition-all cursor-pointer shadow-2xs"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                        <span>Recargar</span>
                      </button>

                      <button
                        onClick={() => fileInputFachadaRef.current?.click()}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-2xs"
                      >
                        <CloudUpload className="w-3.5 h-3.5" />
                        <span>Subir Foto</span>
                      </button>
                    </div>
                  </div>

                  <input
                    ref={fileInputFachadaRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleUploadFachada}
                  />

                  {fotosFachada.length === 0 ? (
                    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center flex flex-col items-center justify-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <Camera className="w-6 h-6" />
                      </div>
                      <p className="text-slate-500 text-xs sm:text-sm font-medium">
                        No hay fotos de fachada registradas aún para esta tarea.
                      </p>
                      <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                        <span className="text-[11px] font-bold text-slate-400">
                          Imágenes de ejemplo:
                        </span>
                        {SAMPLE_PHOTOS.fachada.map((sample, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleAddSampleFachada(sample)}
                            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-[#0284c7] border border-blue-200/80 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Sparkles className="w-3 h-3 text-amber-500" />
                            <span>{sample.title.slice(0, 26)}...</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {fotosFachada.map((photo) => (
                        <div
                          key={photo.id}
                          className="relative group rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-sm"
                        >
                          <img
                            src={photo.url}
                            alt={photo.title}
                            className="w-full h-44 object-cover cursor-pointer"
                            onClick={() => openPhotoViewer(photo)}
                          />
                          <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 via-black/40 to-transparent p-3 text-white flex items-center justify-between">
                            <div>
                              <p className="text-xs font-bold leading-tight truncate max-w-[200px]">
                                {photo.title}
                              </p>
                              <span className="text-[10px] text-slate-300 font-medium">
                                {photo.timestamp}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => setPreviewPhotoUrl(photo.url)}
                                className="p-1.5 bg-white/20 hover:bg-white/40 rounded-lg text-white"
                              >
                                <Maximize2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteFachada(photo.id)}
                                className="p-1.5 bg-red-600/80 hover:bg-red-600 rounded-lg text-white"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Navegación al Paso 2 */}
                <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">
                    Paso 1 de 3: Foto de Fachada / Inicio
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveStep(2)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer active:scale-95"
                  >
                    <span>Ir a Paso 2: Fotos y Materiales</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: FOTOS TAREA + EVALUACIÓN DE CAJA (DESPLEGABLE CON SWITCH) */}
            {activeStep === 2 && (
              <div className="space-y-5 animate-in fade-in duration-150">
                {/* Header Title with Circle Badge 2 */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-[#0284c7] text-white font-extrabold text-lg flex items-center justify-center shrink-0 shadow-xs">
                      2
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight">
                        Paso 2: Evidencias Fotográficas de la Tarea
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => fileInputEvidenciasRef.current?.click()}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-2xs"
                    >
                      <CloudUpload className="w-3.5 h-3.5 text-slate-600" />
                      <span>Subir fotos</span>
                    </button>

                    <button
                      onClick={() => onShowToast('Evidencias recargadas')}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-[#0284c7] font-bold text-xs rounded-xl transition-all cursor-pointer shadow-2xs"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Recargar</span>
                    </button>
                  </div>
                </div>

                <input
                  ref={fileInputEvidenciasRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleUploadEvidencias}
                />

                {/* TWO COLUMNS: FOTOS GENERALES (5 COLS) & EVALUACIÓN DE CAJA (7 COLS) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                  {/* Left Column: Fotos Generales (SIEMPRE lg:col-span-5) */}
                  <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-4.5 space-y-3.5 shadow-2xs">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2 font-bold text-slate-900 text-xs sm:text-sm">
                        <ImageIcon className="w-4 h-4 text-slate-600" />
                        <span>Fotos Generales</span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-extrabold border border-slate-200">
                        {fotosEvidencias.length} fotos
                      </span>
                    </div>

                    {/* Quick sample buttons */}
                    <div className="flex flex-wrap gap-1.5 pb-1">
                      {SAMPLE_PHOTOS.evidencias.map((sample, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleAddSampleEvidencia(sample)}
                          className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[10px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                          title={sample.title}
                        >
                          <Sparkles className="w-2.5 h-2.5 text-blue-500" />
                          <span>+ {sample.category}</span>
                        </button>
                      ))}
                    </div>

                    {/* Photo List / Drag items */}
                    {fotosEvidencias.length === 0 ? (
                      <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center text-slate-400 text-xs space-y-1.5">
                        <div className="w-9 h-9 rounded-full bg-slate-50 mx-auto flex items-center justify-center">
                          <ImageIcon className="w-4.5 h-4.5 text-slate-400" />
                        </div>
                        <p className="font-medium text-slate-500">No hay fotos generales disponibles.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3 max-h-[380px] overflow-y-auto p-1">
                        {fotosEvidencias.map((photo) => (
                          <div
                            key={photo.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, photo)}
                            className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-50 cursor-grab active:cursor-grabbing hover:shadow-md transition-all"
                          >
                            <img
                              src={photo.url}
                              alt={photo.title}
                              className="w-full h-24 object-cover"
                              onClick={() => openPhotoViewer(photo)}
                            />
                            <div className="p-1.5 bg-white">
                              <p className="text-[11px] font-bold text-slate-800 truncate" title={photo.title}>
                                {photo.title}
                              </p>
                              <span className="text-[10px] text-slate-500 block truncate">
                                {photo.category}
                              </span>
                            </div>

                            <button
                              onClick={() => handleDeleteEvidencia(photo.id)}
                              className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-red-600 rounded-md text-white transition-colors opacity-0 group-hover:opacity-100"
                              title="Eliminar"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right Column: (SIEMPRE lg:col-span-7) con Evaluación de Caja y Fibra y Materiales */}
                  <div className="lg:col-span-7 space-y-5">
                    {/* CONTAINER 1: EVALUACIÓN DE CAJA */}
                    <div className="bg-white border-2 border-[#0284c7]/40 rounded-2xl p-5 space-y-4 shadow-sm">
                    {/* Cabecera Interactiva: Permite colapsar/desplegar con el mouse */}
                    <div
                      onClick={() => evalCaja.seInstaloCaja && setIsCajaContentExpanded(!isCajaContentExpanded)}
                      className={`flex items-center justify-between pb-3 border-b border-slate-100 select-none p-1.5 -m-1.5 rounded-xl transition-colors ${
                        evalCaja.seInstaloCaja ? 'cursor-pointer hover:bg-slate-50/80' : ''
                      }`}
                      title={
                        evalCaja.seInstaloCaja
                          ? isCajaContentExpanded
                            ? 'Haz clic para ocultar/plegar'
                            : 'Haz clic para desplegar'
                          : undefined
                      }
                    >
                      {/* Título y Switch colocado directamente al lado */}
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <div className="flex items-center gap-2 font-extrabold text-[#0f172a] text-sm sm:text-base">
                          <Box className="w-4 h-4 text-[#0284c7]" />
                          <span>Evaluación de Caja</span>
                        </div>

                        {/* Switch al lado de la palabra Evaluación de Caja */}
                        <div
                          className="flex items-center gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            role="switch"
                            aria-checked={evalCaja.seInstaloCaja}
                            onClick={() => {
                              const nextVal = !evalCaja.seInstaloCaja;
                              updateEvalCaja({ seInstaloCaja: nextVal });
                              if (nextVal) setIsCajaContentExpanded(true);
                              onShowToast(
                                nextVal
                                  ? 'Evaluación de Caja activada'
                                  : 'Evaluación de Caja desactivada'
                              );
                            }}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              evalCaja.seInstaloCaja ? 'bg-[#0284c7]' : 'bg-slate-300'
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                evalCaja.seInstaloCaja ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                          <span
                            className={`text-[11px] font-extrabold ${
                              evalCaja.seInstaloCaja ? 'text-[#0284c7]' : 'text-slate-400'
                            }`}
                          >
                            {evalCaja.seInstaloCaja ? 'SÍ' : 'NO'}
                          </span>
                        </div>
                      </div>

                      {/* Insignia a la derecha + Chevron indicador de despliegue */}
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        {evalCaja.bloqueado && (
                          <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Lock className="w-3 h-3 text-emerald-600" />
                            <span>Guardado</span>
                          </span>
                        )}
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                            evalCaja.seInstaloCaja
                              ? 'bg-blue-50 text-[#0284c7] border-blue-200'
                              : 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}
                        >
                          {evalCaja.seInstaloCaja ? 'Instalación Activa' : 'No Instalada'}
                        </span>
                        {evalCaja.seInstaloCaja && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsCajaContentExpanded(!isCajaContentExpanded);
                            }}
                            className="p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors cursor-pointer"
                            title={isCajaContentExpanded ? 'Ocultar contenido' : 'Desplegar contenido'}
                          >
                            {isCajaContentExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Contenido Desplegable / Ocultable */}
                    {!evalCaja.seInstaloCaja ? (
                      <div className="p-5 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <p className="font-semibold text-slate-600">
                          Instalación de caja desactivada
                        </p>
                      </div>
                    ) : !isCajaContentExpanded ? (
                      <div
                        onClick={() => setIsCajaContentExpanded(true)}
                        className="p-3 text-center text-xs text-[#0284c7] bg-blue-50/50 hover:bg-blue-50 rounded-2xl border border-blue-200 cursor-pointer transition-colors"
                      >
                        <p className="font-bold">
                          Evaluación de Caja plegada
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-5 animate-in fade-in duration-150">
                        {/* Banner si está bloqueado */}
                        {evalCaja.bloqueado && (
                          <div className="p-2.5 px-3 bg-emerald-50/90 border border-emerald-200 rounded-xl flex items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-2 text-emerald-800 font-bold text-[11px]">
                              <Lock className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                              <span>Evaluación de Caja guardada y protegida.</span>
                            </div>
                            <button
                              type="button"
                              onClick={handleUnlockCaja}
                              className="px-2 py-0.5 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-[10px] font-extrabold cursor-pointer transition-colors shrink-0 shadow-2xs"
                            >
                              Desbloquear
                            </button>
                          </div>
                        )}

                      {/* Dropzone para fotos de la caja */}
                      <div
                        onDragOver={handleDragOver}
                        onDrop={handleDropOnCaja}
                        className="bg-slate-50/80 border-2 border-dashed border-[#0284c7]/60 rounded-2xl p-4 transition-all hover:bg-blue-50/40"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <Box className="w-3.5 h-3.5 text-[#0284c7]" />
                            <span>Fotos de Caja / Splitter</span>
                          </span>
                          <button
                            onClick={() => handleAddSampleCaja(SAMPLE_PHOTOS.caja[0])}
                            className="text-[10px] font-bold text-[#0284c7] hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Sparkles className="w-3 h-3 text-amber-500" />
                            <span>+ Ejemplo Caja NAP</span>
                          </button>
                        </div>

                        {evalCaja.fotosCaja.length === 0 ? (
                          <div className="p-3 text-center text-slate-400 text-xs">
                            <p className="font-medium text-slate-500">Sin fotos registradas</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                            {evalCaja.fotosCaja.map((photo) => (
                              <div
                                key={photo.id}
                                className="relative group rounded-xl overflow-hidden border border-slate-200 bg-white shadow-2xs"
                              >
                                <img
                                  src={photo.url}
                                  alt={photo.title}
                                  className="w-full h-20 object-cover cursor-pointer"
                                  onClick={() => openPhotoViewer(photo)}
                                />
                                <div className="p-1 bg-white">
                                  <p className="text-[10px] font-bold text-slate-800 truncate">
                                    {photo.title}
                                  </p>
                                </div>
                                <button
                                  onClick={() =>
                                    updateEvalCaja({
                                      fotosCaja: evalCaja.fotosCaja.filter((p) => p.id !== photo.id),
                                    })
                                  }
                                  className="absolute top-1 right-1 p-1 bg-red-600/80 hover:bg-red-600 rounded-md text-white"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* APARTADO 1: Calificar la caja instalada: Bueno, Regular, Malo */}
                      <div className="space-y-2 pt-1 border-t border-slate-100">
                        <label className="text-xs font-extrabold text-slate-900 block">
                          Calificación de la Caja Instalada:
                        </label>
                        <div className="grid grid-cols-3 gap-2.5">
                          {/* Bueno */}
                          <button
                            type="button"
                            onClick={() => {
                              updateEvalCaja({ calificacion: 'Bueno' });
                              onShowToast('Caja calificada como: BUENO 👍');
                            }}
                            className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                              evalCaja.calificacion === 'Bueno'
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm ring-2 ring-emerald-500/30'
                                : 'bg-emerald-50/70 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                            }`}
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            <span>Bueno</span>
                          </button>

                          {/* Regular */}
                          <button
                            type="button"
                            onClick={() => {
                              updateEvalCaja({ calificacion: 'Regular' });
                              onShowToast('Caja calificada como: REGULAR ⚠️');
                            }}
                            className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                              evalCaja.calificacion === 'Regular'
                                ? 'bg-amber-500 text-white border-amber-500 shadow-sm ring-2 ring-amber-400/30'
                                : 'bg-amber-50/70 hover:bg-amber-100 text-amber-800 border-amber-200'
                            }`}
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Regular</span>
                          </button>

                          {/* Malo */}
                          <button
                            type="button"
                            onClick={() => {
                              updateEvalCaja({ calificacion: 'Malo' });
                              onShowToast('Caja calificada como: MALO 👎');
                            }}
                            className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                              evalCaja.calificacion === 'Malo'
                                ? 'bg-red-600 text-white border-red-600 shadow-sm ring-2 ring-red-500/30'
                                : 'bg-red-50/70 hover:bg-red-100 text-red-800 border-red-200'
                            }`}
                          >
                            <ThumbsDown className="w-3.5 h-3.5" />
                            <span>Malo</span>
                          </button>
                        </div>
                      </div>

                      {/* APARTADO 2: Foto de las potencias de la caja y casa */}
                      <div
                        onDragOver={handleDragOver}
                        onDrop={handleDropOnPotencias}
                        className="space-y-2.5 pt-2 border-t border-slate-100 bg-slate-50/50 p-3 rounded-2xl border border-slate-200/60"
                      >
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                            <Activity className="w-4 h-4 text-blue-600" />
                            <span>Potencias Ópticas (Caja NAP y Casa)</span>
                          </label>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                handleAddSamplePotencia(SAMPLE_PHOTOS.potencias[0]);
                                handleAddSamplePotencia(SAMPLE_PHOTOS.potencias[1]);
                              }}
                              className="text-[10px] font-bold text-[#0284c7] hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Sparkles className="w-3 h-3 text-amber-500" />
                              <span>+ Ejemplos Potencias</span>
                            </button>
                          </div>
                        </div>

                        {/* Inputs de potencia en dBm */}
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="bg-white border border-slate-200 rounded-xl p-2.5">
                            <span className="text-[11px] font-bold text-slate-600 block mb-1">
                              Potencia en Caja (dBm):
                            </span>
                            <input
                              type="text"
                              value={evalCaja.potenciaCajaDbm}
                              onChange={(e) => updateEvalCaja({ potenciaCajaDbm: e.target.value })}
                              placeholder="-18.4"
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 font-mono text-slate-900 font-bold"
                            />
                          </div>

                          <div className="bg-white border border-slate-200 rounded-xl p-2.5">
                            <span className="text-[11px] font-bold text-slate-600 block mb-1">
                              Potencia en Casa / Roseta (dBm):
                            </span>
                            <input
                              type="text"
                              value={evalCaja.potenciaCasaDbm}
                              onChange={(e) => updateEvalCaja({ potenciaCasaDbm: e.target.value })}
                              placeholder="-19.2"
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 font-mono text-slate-900 font-bold"
                            />
                          </div>
                        </div>

                        {/* Drop hint or mini galería de fotos de potencia */}
                        {evalCaja.fotosPotencia.length === 0 ? (
                          <div className="border border-dashed border-slate-200 rounded-xl p-2.5 text-center text-slate-400 text-xs">
                            <span>Sin fotos de potencias registradas</span>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                            {evalCaja.fotosPotencia.map((photo) => (
                              <div
                                key={photo.id}
                                className="relative rounded-lg overflow-hidden border border-slate-200 bg-white"
                              >
                                <img
                                  src={photo.url}
                                  alt={photo.title}
                                  className="w-full h-16 object-cover cursor-pointer"
                                  onClick={() => openPhotoViewer(photo)}
                                />
                                <div className="p-1">
                                  <p className="text-[9px] font-bold text-slate-800 truncate">
                                    {photo.title}
                                  </p>
                                </div>
                                <button
                                  onClick={() =>
                                    updateEvalCaja({
                                      fotosPotencia: evalCaja.fotosPotencia.filter(
                                        (p) => p.id !== photo.id
                                      ),
                                    })
                                  }
                                  className="absolute top-1 right-1 p-0.5 bg-red-600/80 rounded text-white"
                                >
                                  <Trash2 className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* APARTADO 3: Fotos del recorrido del KMZ (CON DRAG AND DROP) */}
                      <div
                        onDragOver={handleDragOver}
                        onDrop={handleDropOnKmz}
                        className="space-y-2.5 pt-2 border-t border-slate-100 bg-emerald-50/40 p-3.5 rounded-2xl border-2 border-dashed border-emerald-300 transition-all hover:bg-emerald-50/60"
                      >
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                            <Map className="w-4 h-4 text-emerald-600" />
                            <span>Fotos del Recorrido del KMZ / Tendido</span>
                          </label>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleAddSampleKmz(SAMPLE_PHOTOS.kmz[0])}
                              className="text-[10px] font-bold text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Sparkles className="w-3 h-3 text-amber-500" />
                              <span>+ Trazo KMZ</span>
                            </button>

                            <button
                              onClick={() => handleAddSampleKmz(SAMPLE_PHOTOS.kmz[1])}
                              className="text-[10px] font-bold text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Sparkles className="w-3 h-3 text-amber-500" />
                              <span>+ Postes KMZ</span>
                            </button>
                          </div>
                        </div>

                        {evalCaja.fotosRecorridoKmz.length === 0 ? (
                          <div className="p-3 text-center text-slate-400 text-xs">
                            <span>Sin fotos de recorrido KMZ registradas</span>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-[11px] text-emerald-800 font-semibold px-1">
                              <span>Fotos registradas ({evalCaja.fotosRecorridoKmz.length})</span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {evalCaja.fotosRecorridoKmz.map((photo) => (
                                <div
                                  key={photo.id}
                                  className="relative rounded-lg overflow-hidden border border-emerald-200 bg-white shadow-2xs group"
                                >
                                  <img
                                    src={photo.url}
                                    alt={photo.title}
                                    className="w-full h-16 object-cover cursor-pointer"
                                    onClick={() => openPhotoViewer(photo)}
                                  />
                                  <div className="p-1">
                                    <p className="text-[9px] font-bold text-slate-800 truncate">
                                      {photo.title}
                                    </p>
                                  </div>
                                  <button
                                    onClick={() =>
                                      updateEvalCaja({
                                        fotosRecorridoKmz: evalCaja.fotosRecorridoKmz.filter(
                                          (p) => p.id !== photo.id
                                        ),
                                      })
                                    }
                                    className="absolute top-1 right-1 p-0.5 bg-red-600/80 hover:bg-red-600 rounded text-white"
                                    title="Eliminar foto"
                                  >
                                    <Trash2 className="w-2.5 h-2.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* PARTE FINAL DEL CONTAINER: BOTÓN DE GUARDAR EVALUACIÓN DE CAJA */}
                      <div className="pt-3.5 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/60 mt-2">
                        <div className="text-[11px] text-slate-500">
                          {evalCaja.bloqueado ? (
                            <span className="flex items-center gap-1.5 text-emerald-800 font-bold">
                              <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>Evaluación de caja asegurada. Si falta algo por colocar, pulsa Desbloquear.</span>
                            </span>
                          ) : (
                            <span className="text-slate-600">
                              Pulsa guardar para asegurar la evaluación de caja (fotos, potencia y recorrido KMZ).
                            </span>
                          )}
                        </div>
                        <SaveLockButton
                          isLocked={!!evalCaja.bloqueado}
                          onSave={handleSaveCaja}
                          onUnlock={handleUnlockCaja}
                          label="Guardar Evaluación de Caja"
                          lockedLabel="Caja Guardada"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* CONTAINER 2: FIBRA Y MATERIALES */}
                <div className="bg-white border-2 border-[#0284c7]/40 rounded-2xl p-5 space-y-4 shadow-sm">
                  {/* Cabecera Interactiva: Permite colapsar/desplegar con el mouse */}
                  <div
                    onClick={() => fibraMat.activo && setIsMaterialesContentExpanded(!isMaterialesContentExpanded)}
                    className={`flex items-center justify-between pb-3 border-b border-slate-100 select-none p-1.5 -m-1.5 rounded-xl transition-colors ${
                      fibraMat.activo ? 'cursor-pointer hover:bg-slate-50/80' : ''
                    }`}
                    title={
                      fibraMat.activo
                        ? isMaterialesContentExpanded
                          ? 'Haz clic para ocultar/plegar'
                          : 'Haz clic para desplegar'
                        : undefined
                    }
                  >
                    {/* Título y Switch colocado directamente al lado */}
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <div className="flex items-center gap-2 font-extrabold text-[#0f172a] text-sm sm:text-base">
                        <Cable className="w-4 h-4 text-[#0284c7]" />
                        <span>Fibra y Materiales</span>
                      </div>

                      {/* Switch al lado de la palabra Fibra y Materiales */}
                      <div
                        className="flex items-center gap-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          role="switch"
                          aria-checked={fibraMat.activo}
                          onClick={() => {
                            const nextVal = !fibraMat.activo;
                            updateFibraMat({ activo: nextVal });
                            if (nextVal) setIsMaterialesContentExpanded(true);
                            onShowToast(
                              nextVal
                                ? 'Fibra y Materiales activado'
                                : 'Fibra y Materiales desactivado'
                            );
                          }}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            fibraMat.activo ? 'bg-[#0284c7]' : 'bg-slate-300'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                              fibraMat.activo ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                        <span
                          className={`text-[11px] font-extrabold ${
                            fibraMat.activo ? 'text-[#0284c7]' : 'text-slate-400'
                          }`}
                        >
                          {fibraMat.activo ? 'SÍ' : 'NO'}
                        </span>
                      </div>
                    </div>

                    {/* Insignia a la derecha + Chevron indicador de despliegue */}
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      {fibraMat.bloqueado && (
                        <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Lock className="w-3 h-3 text-emerald-600" />
                          <span>Guardado</span>
                        </span>
                      )}
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                          fibraMat.activo
                            ? 'bg-blue-50 text-[#0284c7] border-blue-200'
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}
                      >
                        {fibraMat.activo ? 'Registro Activo' : 'Desactivado'}
                      </span>
                      {fibraMat.activo && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsMaterialesContentExpanded(!isMaterialesContentExpanded);
                          }}
                          className="p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors cursor-pointer"
                          title={isMaterialesContentExpanded ? 'Ocultar contenido' : 'Desplegar contenido'}
                        >
                          {isMaterialesContentExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Contenido Desplegable / Ocultable */}
                  {!fibraMat.activo ? (
                    <div className="p-5 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <p className="font-semibold text-slate-600">
                        Registro de fibra y materiales desactivado
                      </p>
                    </div>
                  ) : !isMaterialesContentExpanded ? (
                    <div
                      onClick={() => setIsMaterialesContentExpanded(true)}
                      className="p-3 bg-blue-50/50 hover:bg-blue-50 rounded-2xl border border-blue-200 cursor-pointer transition-colors flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-[#0284c7]">Fibra y Materiales:</span>
                        {fibraMat.usoFibra && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md text-[11px] font-semibold">
                            Fibra: {fibraMat.fibraResultado}m
                          </span>
                        )}
                        {fibraMat.usoUtp && (
                          <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-md text-[11px] font-semibold">
                            UTP: {fibraMat.utpResultado}m
                          </span>
                        )}
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[11px] font-semibold">
                          {Object.values(fibraMat.materiales || {}).filter((v) => v > 0).length} materiales en uso
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[#0284c7] font-semibold text-[11px] shrink-0">
                        <span>Desplegar</span>
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-5 animate-in fade-in duration-150">
                      {/* Banner si está bloqueado */}
                      {fibraMat.bloqueado && (
                        <div className="p-2.5 px-3 bg-emerald-50/90 border border-emerald-200 rounded-xl flex items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-2 text-emerald-800 font-bold text-[11px]">
                            <Lock className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                            <span>Fibra y Materiales guardados y protegidos.</span>
                          </div>
                          <button
                            type="button"
                            onClick={handleUnlockMateriales}
                            className="px-2 py-0.5 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-[10px] font-extrabold cursor-pointer transition-colors shrink-0 shadow-2xs"
                          >
                            Desbloquear
                          </button>
                        </div>
                      )}
                      {/* APARTADO DE SUBIR / ARRASTRAR FOTOS A FIBRA Y MATERIALES (DESPUÉS DEL SWITCH Y TÍTULO) */}
                      <div
                        onDragOver={handleDragOver}
                        onDrop={handleDropOnMateriales}
                        className={`p-3 rounded-2xl border-2 border-dashed transition-all ${
                          (fibraMat.fotosMateriales || []).length > 0
                            ? 'bg-blue-50/30 border-blue-300'
                            : 'bg-slate-50/60 border-slate-200/90 hover:bg-blue-50/20 hover:border-blue-300'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <Camera className="w-3.5 h-3.5 text-[#0284c7]" />
                            <span className="text-xs font-extrabold text-slate-800">
                              Fotos de Fibra y Materiales
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
                              (Arrastrar desde Fotos Generales)
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleAddSampleMateriales(SAMPLE_PHOTOS.materiales[0])}
                              className="text-[10px] font-bold text-[#0284c7] hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Sparkles className="w-3 h-3 text-amber-500" />
                              <span>+ Ejemplo Bobina</span>
                            </button>
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-extrabold rounded-full">
                              {(fibraMat.fotosMateriales || []).length} fotos
                            </span>
                          </div>
                        </div>

                        {(fibraMat.fotosMateriales || []).length === 0 ? (
                          <div className="py-2.5 px-3 text-center text-slate-400 text-xs flex items-center justify-center gap-2 border border-dashed border-slate-200/70 rounded-xl bg-white/70">
                            <Move className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="text-[11px] text-slate-500 font-medium">
                              Arrastra aquí fotos desde el panel de Fotos Generales
                            </span>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                            {(fibraMat.fotosMateriales || []).map((photo) => (
                              <div
                                key={photo.id}
                                className="relative group rounded-xl overflow-hidden border border-slate-200 bg-white shadow-2xs"
                              >
                                <img
                                  src={photo.url}
                                  alt={photo.title}
                                  className="w-full h-16 object-cover cursor-pointer hover:opacity-95"
                                  onClick={() => openPhotoViewer(photo)}
                                />
                                <div className="p-1 bg-white">
                                  <p className="text-[10px] font-bold text-slate-800 truncate" title={photo.title}>
                                    {photo.title}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = (fibraMat.fotosMateriales || []).filter((p) => p.id !== photo.id);
                                    updateFibraMat({ fotosMateriales: updated });
                                    onShowToast('Foto eliminada de Fibra y Materiales');
                                  }}
                                  className="absolute top-1 right-1 p-0.5 bg-red-600/80 hover:bg-red-600 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                  title="Eliminar foto"
                                >
                                  <Trash2 className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* REGISTRO DEBAJO: METRAJES DE FIBRA Y UTP EN FILAS COMPACTAS */}
                      <div className="space-y-2">
                        {/* Fila 1: Usó Fibra? */}
                        <div className="p-2.5 px-3 bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 rounded-xl transition-all">
                          {/* Línea superior: Pregunta y Switch */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-extrabold text-slate-800">
                                Usó Fibra?:
                              </span>
                              <div className="flex items-center bg-white p-0.5 rounded-lg border border-slate-200 text-[11px] font-extrabold">
                                <button
                                  type="button"
                                  onClick={() => updateFibraMat({ usoFibra: true })}
                                  className={`px-2 py-0.5 rounded-md cursor-pointer transition-colors ${
                                    fibraMat.usoFibra
                                      ? 'bg-[#0284c7] text-white shadow-2xs'
                                      : 'text-slate-500 hover:text-slate-800'
                                  }`}
                                >
                                  SÍ
                                </button>
                                <button
                                  type="button"
                                  onClick={() => updateFibraMat({ usoFibra: false })}
                                  className={`px-2 py-0.5 rounded-md cursor-pointer transition-colors ${
                                    !fibraMat.usoFibra
                                      ? 'bg-slate-700 text-white shadow-2xs'
                                      : 'text-slate-500 hover:text-slate-800'
                                  }`}
                                >
                                  NO
                                </button>
                              </div>
                            </div>

                            {/* Si está activo, Resultado en la esquina derecha */}
                            {fibraMat.usoFibra && (
                              <div className="flex items-center gap-1.5 bg-blue-50/90 text-[#0284c7] border border-blue-200/90 px-3 py-1 rounded-lg shrink-0 shadow-2xs">
                                <span className="text-[11px] font-bold uppercase tracking-wide text-blue-700">Resultado:</span>
                                <span className="font-mono font-black text-base leading-none text-[#0284c7]">{getFibraDiffDisplay()}</span>
                                <span className="text-xs font-bold text-blue-600">m</span>
                              </div>
                            )}
                          </div>

                          {/* Debajo: Inicio y Fin alineados a la izquierda */}
                          {fibraMat.usoFibra && (
                            <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-start gap-2 text-xs">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[11px] font-bold text-slate-600">Inicio:</span>
                                <input
                                  type="number"
                                  value={fibraMat.fibraInicio}
                                  onChange={(e) => handleFibraChange(e.target.value, fibraMat.fibraFin)}
                                  placeholder="0"
                                  className="w-16 h-7 bg-white border border-slate-200 rounded-lg px-2 text-xs font-mono font-bold text-slate-900 text-center focus:outline-none focus:border-blue-500"
                                />
                              </div>

                              <span className="text-slate-300 font-bold">-</span>

                              <div className="flex items-center gap-1.5">
                                <span className="text-[11px] font-bold text-slate-600">Fin:</span>
                                <input
                                  type="number"
                                  value={fibraMat.fibraFin}
                                  onChange={(e) => handleFibraChange(fibraMat.fibraInicio, e.target.value)}
                                  placeholder="0"
                                  className="w-16 h-7 bg-white border border-slate-200 rounded-lg px-2 text-xs font-mono font-bold text-slate-900 text-center focus:outline-none focus:border-blue-500"
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Fila 2: Usó UTP? */}
                        <div className="p-2.5 px-3 bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 rounded-xl transition-all">
                          {/* Línea superior: Pregunta y Switch */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-extrabold text-slate-800">
                                Usó UTP?:
                              </span>
                              <div className="flex items-center bg-white p-0.5 rounded-lg border border-slate-200 text-[11px] font-extrabold">
                                <button
                                  type="button"
                                  onClick={() => updateFibraMat({ usoUtp: true })}
                                  className={`px-2 py-0.5 rounded-md cursor-pointer transition-colors ${
                                    fibraMat.usoUtp
                                      ? 'bg-[#0284c7] text-white shadow-2xs'
                                      : 'text-slate-500 hover:text-slate-800'
                                  }`}
                                >
                                  SÍ
                                </button>
                                <button
                                  type="button"
                                  onClick={() => updateFibraMat({ usoUtp: false })}
                                  className={`px-2 py-0.5 rounded-md cursor-pointer transition-colors ${
                                    !fibraMat.usoUtp
                                      ? 'bg-slate-700 text-white shadow-2xs'
                                      : 'text-slate-500 hover:text-slate-800'
                                  }`}
                                >
                                  NO
                                </button>
                              </div>
                            </div>

                            {/* Si está activo, Resultado en la esquina derecha */}
                            {fibraMat.usoUtp && (
                              <div className="flex items-center gap-1.5 bg-indigo-50/90 text-indigo-700 border border-indigo-200/90 px-3 py-1 rounded-lg shrink-0 shadow-2xs">
                                <span className="text-[11px] font-bold uppercase tracking-wide text-indigo-700">Resultado:</span>
                                <span className="font-mono font-black text-base leading-none text-indigo-700">{getUtpDiffDisplay()}</span>
                                <span className="text-xs font-bold text-indigo-600">m</span>
                              </div>
                            )}
                          </div>

                          {/* Debajo: Inicio y Fin alineados a la izquierda */}
                          {fibraMat.usoUtp && (
                            <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-start gap-2 text-xs">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[11px] font-bold text-slate-600">Inicio:</span>
                                <input
                                  type="number"
                                  value={fibraMat.utpInicio}
                                  onChange={(e) => handleUtpChange(e.target.value, fibraMat.utpFin)}
                                  placeholder="0"
                                  className="w-16 h-7 bg-white border border-slate-200 rounded-lg px-2 text-xs font-mono font-bold text-slate-900 text-center focus:outline-none focus:border-blue-500"
                                />
                              </div>

                              <span className="text-slate-300 font-bold">-</span>

                              <div className="flex items-center gap-1.5">
                                <span className="text-[11px] font-bold text-slate-600">Fin:</span>
                                  <input
                                    type="number"
                                    value={fibraMat.utpFin}
                                    onChange={(e) => handleUtpChange(fibraMat.utpInicio, e.target.value)}
                                    placeholder="0"
                                    className="w-16 h-7 bg-white border border-slate-200 rounded-lg px-2 text-xs font-mono font-bold text-slate-900 text-center focus:outline-none focus:border-blue-500"
                                  />
                                </div>
                              </div>
                            )}
                        </div>
                      </div>

                      {/* SECCIÓN 2: REGISTRO DE MATERIALES */}
                      <div className="space-y-3 pt-2 border-t border-slate-100">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-1.5">
                            <Package className="w-4 h-4 text-[#0284c7]" />
                            <span className="text-xs font-extrabold text-slate-900">
                              Materiales Utilizados
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#0284c7] text-[10px] font-extrabold border border-blue-200">
                              {Object.values(fibraMat.materiales || {}).filter((v) => v > 0).length} en uso · {Object.values(fibraMat.materiales || {}).reduce((a, b) => a + b, 0)} u.
                            </span>
                          </div>
                        </div>

                        {/* Buscador de Materiales */}
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            value={materialSearch}
                            onChange={(e) => setMaterialSearch(e.target.value)}
                            placeholder="Filtrar materiales (ej: Conector, Roseta, Grapas)..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8.5 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all"
                          />
                          {materialSearch && (
                            <button
                              onClick={() => setMaterialSearch('')}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                            >
                              ×
                            </button>
                          )}
                        </div>

                        {/* Grid de Materiales */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[290px] overflow-y-auto p-1">
                          {Object.entries(fibraMat.materiales || {})
                            .filter(([name]) =>
                              name.toLowerCase().includes(materialSearch.toLowerCase())
                            )
                            .map(([matName, qty]) => (
                              <div
                                key={matName}
                                className={`p-2 rounded-xl border transition-all flex items-center justify-between gap-2 ${
                                  qty > 0
                                    ? 'bg-blue-50/70 border-blue-300 ring-1 ring-blue-300/40 shadow-2xs'
                                    : 'bg-white border-slate-200 hover:border-slate-300'
                                }`}
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span
                                      className={`w-2 h-2 rounded-full shrink-0 ${
                                        qty > 0 ? 'bg-[#0284c7]' : 'bg-slate-300'
                                      }`}
                                    />
                                    <span
                                      className={`text-xs truncate block ${
                                        qty > 0
                                          ? 'font-bold text-slate-900'
                                          : 'font-medium text-slate-700'
                                      }`}
                                      title={matName}
                                    >
                                      {matName}
                                    </span>
                                  </div>
                                </div>

                                {/* Controles de Cantidad */}
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    type="button"
                                    disabled={qty <= 0}
                                    onClick={() => handleMaterialChange(matName, -1)}
                                    className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center font-bold text-xs transition-colors cursor-pointer"
                                    title="Restar 1"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>

                                  <input
                                    type="number"
                                    min="0"
                                    value={qty}
                                    onChange={(e) => handleMaterialSet(matName, e.target.value)}
                                    className={`w-11 h-6 text-center text-xs font-bold rounded-md border outline-none font-mono ${
                                      qty > 0
                                        ? 'bg-white border-blue-400 text-blue-900 font-black'
                                        : 'bg-slate-50 border-slate-200 text-slate-600'
                                    }`}
                                  />

                                  <button
                                    type="button"
                                    onClick={() => handleMaterialChange(matName, 1)}
                                    className="w-6 h-6 rounded-lg bg-[#0284c7] hover:bg-blue-600 text-white flex items-center justify-center font-bold text-xs transition-colors cursor-pointer"
                                    title="Sumar 1"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            ))}
                        </div>

                        {/* Agregar Material Personalizado */}
                        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                          <input
                            type="text"
                            value={customMaterialName}
                            onChange={(e) => setCustomMaterialName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                if (!customMaterialName.trim()) return;
                                const name = customMaterialName.trim();
                                if (fibraMat.materiales[name] !== undefined) {
                                  onShowToast(`El material "${name}" ya existe`);
                                  return;
                                }
                                updateFibraMat({
                                  materiales: { ...fibraMat.materiales, [name]: 1 },
                                });
                                setCustomMaterialName('');
                                onShowToast(`Material "${name}" añadido`);
                              }
                            }}
                            placeholder="+ Registrar otro material no listado..."
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (!customMaterialName.trim()) return;
                              const name = customMaterialName.trim();
                              if (fibraMat.materiales[name] !== undefined) {
                                onShowToast(`El material "${name}" ya existe`);
                                return;
                              }
                              updateFibraMat({
                                materiales: { ...fibraMat.materiales, [name]: 1 },
                              });
                              setCustomMaterialName('');
                              onShowToast(`Material "${name}" añadido`);
                            }}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
                          >
                            Añadir
                          </button>
                        </div>
                      </div>

                      {/* PARTE FINAL DEL CONTAINER: BOTÓN DE GUARDAR FIBRA Y MATERIALES */}
                      <div className="pt-3.5 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/60 mt-2">
                        <div className="text-[11px] text-slate-500">
                          {fibraMat.bloqueado ? (
                            <span className="flex items-center gap-1.5 text-emerald-800 font-bold">
                              <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>Fibra y materiales guardados y protegidos. Si falta algo por colocar, pulsa Desbloquear.</span>
                            </span>
                          ) : (
                            <span className="text-slate-600">
                              Pulsa guardar para asegurar el registro de fotos, metrajes de fibra/UTP y lista de materiales.
                            </span>
                          )}
                        </div>
                        <SaveLockButton
                          isLocked={!!fibraMat.bloqueado}
                          onSave={handleSaveMateriales}
                          onUnlock={handleUnlockMateriales}
                          label="Guardar Fibra y Materiales"
                          lockedLabel="Fibra y Materiales Guardados"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* CONTAINER 3: REGISTRO DE EQUIPOS */}
                <div className="bg-white border-2 border-indigo-500/40 rounded-2xl p-5 space-y-4 shadow-sm">
                  {/* Cabecera Interactiva: Permite colapsar/desplegar con el mouse */}
                  <div
                    onClick={() => regEquipos.activo && setIsEquiposContentExpanded(!isEquiposContentExpanded)}
                    className={`flex items-center justify-between pb-3 border-b border-slate-100 select-none p-1.5 -m-1.5 rounded-xl transition-colors ${
                      regEquipos.activo ? 'cursor-pointer hover:bg-slate-50/80' : ''
                    }`}
                    title={
                      regEquipos.activo
                        ? isEquiposContentExpanded
                          ? 'Haz clic para ocultar/plegar'
                          : 'Haz clic para desplegar'
                        : undefined
                    }
                  >
                    {/* Título y Switch colocado directamente al lado */}
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <div className="flex items-center gap-2 font-extrabold text-[#0f172a] text-sm sm:text-base">
                        <Router className="w-4 h-4 text-indigo-600" />
                        <span>Registro de Equipos</span>
                      </div>

                      {/* Switch al lado de la palabra Registro de Equipos */}
                      <div
                        className="flex items-center gap-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          role="switch"
                          aria-checked={regEquipos.activo}
                          onClick={() => {
                            const nextVal = !regEquipos.activo;
                            updateRegEquipos({ activo: nextVal });
                            if (nextVal) setIsEquiposContentExpanded(true);
                            onShowToast(
                              nextVal
                                ? 'Registro de Equipos activado'
                                : 'Registro de Equipos desactivado'
                            );
                          }}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            regEquipos.activo ? 'bg-indigo-600' : 'bg-slate-300'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                              regEquipos.activo ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                        <span
                          className={`text-[11px] font-extrabold ${
                            regEquipos.activo ? 'text-indigo-600' : 'text-slate-400'
                          }`}
                        >
                          {regEquipos.activo ? 'SÍ' : 'NO'}
                        </span>
                      </div>
                    </div>

                    {/* Insignia a la derecha + Chevron indicador de despliegue */}
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      {regEquipos.bloqueado && (
                        <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Lock className="w-3 h-3 text-emerald-600" />
                          <span>Guardado</span>
                        </span>
                      )}
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                          regEquipos.activo
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}
                      >
                        {regEquipos.activo ? 'Registro Activo' : 'Desactivado'}
                      </span>
                      {regEquipos.activo && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsEquiposContentExpanded(!isEquiposContentExpanded);
                          }}
                          className="p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors cursor-pointer"
                          title={isEquiposContentExpanded ? 'Ocultar contenido' : 'Desplegar contenido'}
                        >
                          {isEquiposContentExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Contenido Desplegable / Ocultable */}
                  {!regEquipos.activo ? (
                    <div className="p-5 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <p className="font-semibold text-slate-600">
                        Registro de equipos desactivado
                      </p>
                    </div>
                  ) : !isEquiposContentExpanded ? (
                    <div
                      onClick={() => setIsEquiposContentExpanded(true)}
                      className="p-3 bg-indigo-50/50 hover:bg-indigo-50 rounded-2xl border border-indigo-200 cursor-pointer transition-colors flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-indigo-700">Registro de Equipos:</span>
                        {regEquipos.routerMarca && regEquipos.routerMarca !== 'Equipo no existe' && (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md text-[11px] font-semibold">
                            {regEquipos.routerMarca}
                          </span>
                        )}
                        {regEquipos.routerSn && (
                          <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-md text-[11px] font-semibold">
                            SN: {regEquipos.routerSn}
                          </span>
                        )}
                        {regEquipos.usoDecodificador && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md text-[11px] font-semibold">
                            {regEquipos.decodificadores.filter(Boolean).length} Deco(s)
                          </span>
                        )}
                        {regEquipos.usoRepetidor && (
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-md text-[11px] font-semibold">
                            {regEquipos.repetidores.filter(Boolean).length} Repetidor(es)
                          </span>
                        )}
                        {regEquipos.usoSwitch && (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md text-[11px] font-semibold">
                            {regEquipos.switches.filter(Boolean).length} Switch(es)
                          </span>
                        )}
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[11px] font-semibold">
                          {(regEquipos.fotosEquipos || []).length} fotos
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-indigo-700 font-semibold text-[11px] shrink-0">
                        <span>Desplegar</span>
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-5 animate-in fade-in duration-150">
                      {/* Banner si está bloqueado */}
                      {regEquipos.bloqueado && (
                        <div className="p-2.5 px-3 bg-emerald-50/90 border border-emerald-200 rounded-xl flex items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-2 text-emerald-800 font-bold text-[11px]">
                            <Lock className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                            <span>Registro de Equipos guardado y protegido.</span>
                          </div>
                          <button
                            type="button"
                            onClick={handleUnlockEquipos}
                            className="px-2 py-0.5 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-[10px] font-extrabold cursor-pointer transition-colors shrink-0 shadow-2xs"
                          >
                            Desbloquear
                          </button>
                        </div>
                      )}

                      {/* APARTADO PARA DESLIZAR / ARRASTRAR FOTOS DESDE FOTOS GENERALES */}
                      <div
                        onDragOver={handleDragOver}
                        onDrop={handleDropOnEquipos}
                        className={`p-3 rounded-2xl border-2 border-dashed transition-all ${
                          (regEquipos.fotosEquipos || []).length > 0
                            ? 'bg-indigo-50/30 border-indigo-300'
                            : 'bg-slate-50/60 border-slate-200/90 hover:bg-indigo-50/20 hover:border-indigo-300'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <Camera className="w-3.5 h-3.5 text-indigo-600" />
                            <span className="text-xs font-extrabold text-slate-800">
                              Fotos de Equipos
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
                              (Arrastrar desde Fotos Generales)
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleAddSampleEquipos(SAMPLE_PHOTOS.equipos[0])}
                              className="text-[10px] font-bold text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Sparkles className="w-3 h-3 text-amber-500" />
                              <span>+ Ejemplo Router</span>
                            </button>
                            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-[10px] font-extrabold rounded-full">
                              {(regEquipos.fotosEquipos || []).length} fotos
                            </span>
                          </div>
                        </div>

                        {(regEquipos.fotosEquipos || []).length === 0 ? (
                          <div className="py-2.5 px-3 text-center text-slate-400 text-xs flex items-center justify-center gap-2 border border-dashed border-slate-200/70 rounded-xl bg-white/70">
                            <Move className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="text-[11px] text-slate-500 font-medium">
                              Arrastra aquí fotos de routers, decos o series desde el panel de Fotos Generales
                            </span>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                            {(regEquipos.fotosEquipos || []).map((photo) => (
                              <div
                                key={photo.id}
                                className="relative group rounded-xl overflow-hidden border border-slate-200 bg-white shadow-2xs"
                              >
                                <img
                                  src={photo.url}
                                  alt={photo.title}
                                  className="w-full h-16 object-cover cursor-pointer hover:opacity-95"
                                  onClick={() => openPhotoViewer(photo)}
                                />
                                <div className="p-1 bg-white">
                                  <p className="text-[10px] font-bold text-slate-800 truncate" title={photo.title}>
                                    {photo.title}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  disabled={!!regEquipos.bloqueado}
                                  onClick={() => {
                                    const next = (regEquipos.fotosEquipos || []).filter((f) => f.id !== photo.id);
                                    updateRegEquipos({ fotosEquipos: next });
                                    onUpdateTask({
                                      fotosEvidencias: [photo, ...fotosEvidencias],
                                      registroEquipos: { ...regEquipos, fotosEquipos: next },
                                    });
                                    onShowToast('Foto devuelta a Fotos Generales');
                                  }}
                                  className="absolute top-1 right-1 p-0.5 bg-red-600/80 hover:bg-red-600 rounded text-white cursor-pointer"
                                  title="Devolver a Fotos Generales"
                                >
                                  <Trash2 className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* SECCIÓN 1: SERIE ROUTER: MAC, MARCA DE EQUIPO Y SN */}
                      <div className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-2xl space-y-2.5">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <Router className="w-4 h-4 text-indigo-600 shrink-0" />
                            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                              Serie Router
                            </h4>
                            <span className="text-[10px] text-slate-400 font-medium">
                              (Identificación y Detección Automática ONT)
                            </span>
                          </div>

                          {/* Chips de estado rápido */}
                          {regEquipos.routerMarca && (
                            <div className="flex items-center gap-1.5">
                              {regEquipos.routerMarca === 'Equipo no existe' ? (
                                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200 animate-in fade-in">
                                  <AlertCircle className="w-3 h-3 text-rose-600" />
                                  <span>Equipo no existe</span>
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 animate-in fade-in">
                                  <CheckCircle className="w-3 h-3 text-emerald-600" />
                                  <span>{regEquipos.routerMarca}</span>
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          {/* 1. MAC Router (Fila 1, Columna 1) */}
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-600 flex items-center justify-between">
                              <span>MAC Router</span>
                              <span className="text-[10px] text-slate-400 font-normal">ej. 68962ECA0ABE</span>
                            </label>
                            <input
                              type="text"
                              disabled={!!regEquipos.bloqueado}
                              value={regEquipos.routerMac}
                              onChange={(e) => handleMacChange(e.target.value)}
                              placeholder="MAC del Router..."
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-500 transition-colors"
                            />
                          </div>

                          {/* 2. Marca de equipo (Fila 1, Columna 2 - DONDE ESTABA SN ROUTER) */}
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-600 flex items-center justify-between">
                              <span>Marca de equipo</span>
                              <span
                                className={`text-[10px] font-semibold ${
                                  regEquipos.routerMarca === 'Equipo no existe'
                                    ? 'text-rose-600 font-bold'
                                    : regEquipos.routerMarca
                                    ? 'text-emerald-700 font-bold'
                                    : 'text-slate-400 font-normal'
                                }`}
                              >
                                {regEquipos.routerMarca === 'Equipo no existe'
                                  ? 'No reconocido'
                                  : regEquipos.routerMarca
                                  ? 'Reconocido'
                                  : 'Detección automática'}
                              </span>
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                readOnly
                                disabled={!!regEquipos.bloqueado}
                                value={regEquipos.routerMarca || ''}
                                placeholder="Marca del equipo..."
                                className={`w-full rounded-xl px-3 py-2 text-xs font-bold focus:outline-none transition-all pr-8 ${
                                  regEquipos.routerMarca === 'Equipo no existe'
                                    ? 'bg-rose-50 border-2 border-rose-300 text-rose-700 placeholder-rose-300'
                                    : regEquipos.routerMarca
                                    ? 'bg-emerald-50 border-2 border-emerald-300 text-emerald-900'
                                    : 'bg-slate-100/80 border border-slate-200 text-slate-600 placeholder-slate-400'
                                }`}
                              />
                              {regEquipos.routerMarca === 'Equipo no existe' && (
                                <AlertCircle className="w-4 h-4 text-rose-500 absolute right-2.5 top-2.5" />
                              )}
                              {regEquipos.routerMarca && regEquipos.routerMarca !== 'Equipo no existe' && (
                                <CheckCircle className="w-4 h-4 text-emerald-600 absolute right-2.5 top-2.5" />
                              )}
                            </div>
                          </div>

                          {/* 3. SN Router (Serie) (Fila 2, Columna 1 - DEBAJO DE MAC ROUTER) */}
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-600 flex items-center justify-between">
                              <span>SN Router (Serie)</span>
                              <span className="text-[10px] text-slate-400 font-normal">ej. 4857544397BBAFB</span>
                            </label>
                            <input
                              type="text"
                              disabled={!!regEquipos.bloqueado}
                              value={regEquipos.routerSn}
                              onChange={(e) => handleSnChange(e.target.value)}
                              placeholder="Número de Serie..."
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-500 transition-colors"
                            />
                          </div>

                          {/* 4. Fila 2, Columna 2: Acceso rápido de prueba Huawei 6 y limpiar */}
                          <div className="flex flex-col justify-end space-y-1.5 pt-0.5">
                            <span className="text-[10px] text-slate-400 font-medium px-1">
                              Prueba rápida de validación:
                            </span>
                            <div className="flex items-center gap-2 flex-wrap">
                              <button
                                type="button"
                                disabled={!!regEquipos.bloqueado}
                                onClick={() => handleSnChange('4857544397BBAFB')}
                                className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-[10px] font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                                title="Probar con serie 4857544397BBAFB"
                              >
                                <Sparkles className="w-3 h-3 text-indigo-600" />
                                <span>Probar Huawei 6 wifi</span>
                              </button>
                              <button
                                type="button"
                                disabled={!!regEquipos.bloqueado}
                                onClick={() => {
                                  handleSnChange('');
                                  handleMacChange('');
                                }}
                                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 rounded-lg text-[10px] font-semibold cursor-pointer transition-colors"
                                title="Limpiar serie y mac"
                              >
                                Limpiar
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* SECCIÓN 2: DECODIFICADOR (SWITCH + SERIES DINÁMICAS CON '+') */}
                      <div className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-2xl space-y-3">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <Tv className="w-4 h-4 text-blue-600 shrink-0" />
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-slate-800">
                                ¿Se usó Decodificador?
                              </span>
                              <span className="text-[10px] text-slate-400 hidden sm:inline">
                                (Decodificadores TV)
                              </span>
                            </div>
                          </div>

                          {/* Switch Decodificador */}
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              role="switch"
                              aria-checked={regEquipos.usoDecodificador}
                              disabled={!!regEquipos.bloqueado}
                              onClick={() => {
                                const nextVal = !regEquipos.usoDecodificador;
                                const currentList = regEquipos.decodificadores || [];
                                updateRegEquipos({
                                  usoDecodificador: nextVal,
                                  decodificadores: nextVal && currentList.length === 0 ? [''] : currentList,
                                });
                                onShowToast(
                                  nextVal
                                    ? 'Decodificador activado: registra la serie'
                                    : 'Decodificador desactivado'
                                );
                              }}
                              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                regEquipos.usoDecodificador ? 'bg-blue-600' : 'bg-slate-300'
                              } ${regEquipos.bloqueado ? 'opacity-60 cursor-not-allowed' : ''}`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                  regEquipos.usoDecodificador ? 'translate-x-4' : 'translate-x-0'
                                }`}
                              />
                            </button>
                            <span
                              className={`text-[11px] font-bold ${
                                regEquipos.usoDecodificador ? 'text-blue-600' : 'text-slate-400'
                              }`}
                            >
                              {regEquipos.usoDecodificador ? 'SÍ' : 'NO'}
                            </span>
                          </div>
                        </div>

                        {/* Si usoDecodificador es true, aparece serie del deco y el botón (+) para agregar más */}
                        {regEquipos.usoDecodificador && (
                          <div className="pt-2 border-t border-slate-200/80 space-y-2.5 animate-in fade-in duration-150">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-slate-700">
                                Series de Decodificadores ({regEquipos.decodificadores.length})
                              </span>
                              <button
                                type="button"
                                disabled={!!regEquipos.bloqueado}
                                onClick={() => {
                                  updateRegEquipos({
                                    decodificadores: [...regEquipos.decodificadores, ''],
                                  });
                                  onShowToast('Nuevo campo para Decodificador añadido');
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-[11px] font-bold transition-colors cursor-pointer border border-blue-200 disabled:opacity-50"
                                title="Agregar otro decodificador"
                              >
                                <Plus className="w-3.5 h-3.5 text-blue-600" />
                                <span>Agregar Deco (+)</span>
                              </button>
                            </div>

                            <div className="space-y-2">
                              {regEquipos.decodificadores.map((decoSerie, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 text-[10px] font-black flex items-center justify-center shrink-0">
                                    #{idx + 1}
                                  </div>
                                  <input
                                    type="text"
                                    disabled={!!regEquipos.bloqueado}
                                    value={decoSerie}
                                    onChange={(e) => {
                                      const nextList = [...regEquipos.decodificadores];
                                      nextList[idx] = e.target.value.toUpperCase();
                                      updateRegEquipos({ decodificadores: nextList });
                                    }}
                                    placeholder={`Serie / MAC Decodificador #${idx + 1}...`}
                                    className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
                                  />
                                  {regEquipos.decodificadores.length > 1 && (
                                    <button
                                      type="button"
                                      disabled={!!regEquipos.bloqueado}
                                      onClick={() => {
                                        const nextList = regEquipos.decodificadores.filter((_, i) => i !== idx);
                                        updateRegEquipos({ decodificadores: nextList });
                                        onShowToast(`Decodificador #${idx + 1} eliminado`);
                                      }}
                                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                      title="Eliminar este decodificador"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* SECCIÓN 3: REPETIDORES (SWITCH + SERIES DINÁMICAS CON '+') */}
                      <div className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-2xl space-y-3">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <Wifi className="w-4 h-4 text-purple-600 shrink-0" />
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-slate-800">
                                ¿Se usó Repetidor?
                              </span>
                              <span className="text-[10px] text-slate-400 hidden sm:inline">
                                (Repetidores Wi-Fi / MESH)
                              </span>
                            </div>
                          </div>

                          {/* Switch Repetidor */}
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              role="switch"
                              aria-checked={regEquipos.usoRepetidor}
                              disabled={!!regEquipos.bloqueado}
                              onClick={() => {
                                const nextVal = !regEquipos.usoRepetidor;
                                const currentList = regEquipos.repetidores || [];
                                updateRegEquipos({
                                  usoRepetidor: nextVal,
                                  repetidores: nextVal && currentList.length === 0 ? [''] : currentList,
                                });
                                onShowToast(
                                  nextVal
                                    ? 'Repetidor activado: registra la serie'
                                    : 'Repetidor desactivado'
                                );
                              }}
                              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                regEquipos.usoRepetidor ? 'bg-purple-600' : 'bg-slate-300'
                              } ${regEquipos.bloqueado ? 'opacity-60 cursor-not-allowed' : ''}`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                  regEquipos.usoRepetidor ? 'translate-x-4' : 'translate-x-0'
                                }`}
                              />
                            </button>
                            <span
                              className={`text-[11px] font-bold ${
                                regEquipos.usoRepetidor ? 'text-purple-600' : 'text-slate-400'
                              }`}
                            >
                              {regEquipos.usoRepetidor ? 'SÍ' : 'NO'}
                            </span>
                          </div>
                        </div>

                        {/* Si usoRepetidor es true, aparece serie del repetidor y botón (+) */}
                        {regEquipos.usoRepetidor && (
                          <div className="pt-2 border-t border-slate-200/80 space-y-2.5 animate-in fade-in duration-150">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-slate-700">
                                Series de Repetidores ({regEquipos.repetidores.length})
                              </span>
                              <button
                                type="button"
                                disabled={!!regEquipos.bloqueado}
                                onClick={() => {
                                  updateRegEquipos({
                                    repetidores: [...regEquipos.repetidores, ''],
                                  });
                                  onShowToast('Nuevo campo para Repetidor añadido');
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-[11px] font-bold transition-colors cursor-pointer border border-purple-200 disabled:opacity-50"
                                title="Agregar otro repetidor"
                              >
                                <Plus className="w-3.5 h-3.5 text-purple-600" />
                                <span>Agregar Repetidor (+)</span>
                              </button>
                            </div>

                            <div className="space-y-2">
                              {regEquipos.repetidores.map((repSerie, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 text-[10px] font-black flex items-center justify-center shrink-0">
                                    #{idx + 1}
                                  </div>
                                  <input
                                    type="text"
                                    disabled={!!regEquipos.bloqueado}
                                    value={repSerie}
                                    onChange={(e) => {
                                      const nextList = [...regEquipos.repetidores];
                                      nextList[idx] = e.target.value.toUpperCase();
                                      updateRegEquipos({ repetidores: nextList });
                                    }}
                                    placeholder={`Serie / Modelo Repetidor #${idx + 1}...`}
                                    className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-slate-100"
                                  />
                                  {regEquipos.repetidores.length > 1 && (
                                    <button
                                      type="button"
                                      disabled={!!regEquipos.bloqueado}
                                      onClick={() => {
                                        const nextList = regEquipos.repetidores.filter((_, i) => i !== idx);
                                        updateRegEquipos({ repetidores: nextList });
                                        onShowToast(`Repetidor #${idx + 1} eliminado`);
                                      }}
                                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                      title="Eliminar este repetidor"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* SECCIÓN 4: EQUIPO SWITCH (SWITCH + SERIES DINÁMICAS CON '+') */}
                      <div className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-2xl space-y-3">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <Layers className="w-4 h-4 text-emerald-600 shrink-0" />
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-slate-800">
                                ¿Se usó Switch?
                              </span>
                              <span className="text-[10px] text-slate-400 hidden sm:inline">
                                (Switch de red Ethernet)
                              </span>
                            </div>
                          </div>

                          {/* Switch de Red */}
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              role="switch"
                              aria-checked={regEquipos.usoSwitch}
                              disabled={!!regEquipos.bloqueado}
                              onClick={() => {
                                const nextVal = !regEquipos.usoSwitch;
                                const currentList = regEquipos.switches || [];
                                updateRegEquipos({
                                  usoSwitch: nextVal,
                                  switches: nextVal && currentList.length === 0 ? [''] : currentList,
                                });
                                onShowToast(
                                  nextVal
                                    ? 'Switch activado: registra la serie'
                                    : 'Switch desactivado'
                                );
                              }}
                              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                regEquipos.usoSwitch ? 'bg-emerald-600' : 'bg-slate-300'
                              } ${regEquipos.bloqueado ? 'opacity-60 cursor-not-allowed' : ''}`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                  regEquipos.usoSwitch ? 'translate-x-4' : 'translate-x-0'
                                }`}
                              />
                            </button>
                            <span
                              className={`text-[11px] font-bold ${
                                regEquipos.usoSwitch ? 'text-emerald-600' : 'text-slate-400'
                              }`}
                            >
                              {regEquipos.usoSwitch ? 'SÍ' : 'NO'}
                            </span>
                          </div>
                        </div>

                        {/* Si usoSwitch es true, aparece serie del switch y botón (+) */}
                        {regEquipos.usoSwitch && (
                          <div className="pt-2 border-t border-slate-200/80 space-y-2.5 animate-in fade-in duration-150">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-slate-700">
                                Series de Switches ({regEquipos.switches.length})
                              </span>
                              <button
                                type="button"
                                disabled={!!regEquipos.bloqueado}
                                onClick={() => {
                                  updateRegEquipos({
                                    switches: [...regEquipos.switches, ''],
                                  });
                                  onShowToast('Nuevo campo para Switch añadido');
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-[11px] font-bold transition-colors cursor-pointer border border-emerald-200 disabled:opacity-50"
                                title="Agregar otro switch"
                              >
                                <Plus className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Agregar Switch (+)</span>
                              </button>
                            </div>

                            <div className="space-y-2">
                              {regEquipos.switches.map((switchSerie, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 text-[10px] font-black flex items-center justify-center shrink-0">
                                    #{idx + 1}
                                  </div>
                                  <input
                                    type="text"
                                    disabled={!!regEquipos.bloqueado}
                                    value={switchSerie}
                                    onChange={(e) => {
                                      const nextList = [...regEquipos.switches];
                                      nextList[idx] = e.target.value.toUpperCase();
                                      updateRegEquipos({ switches: nextList });
                                    }}
                                    placeholder={`Serie / MAC Switch #${idx + 1}...`}
                                    className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100"
                                  />
                                  {regEquipos.switches.length > 1 && (
                                    <button
                                      type="button"
                                      disabled={!!regEquipos.bloqueado}
                                      onClick={() => {
                                        const nextList = regEquipos.switches.filter((_, i) => i !== idx);
                                        updateRegEquipos({ switches: nextList });
                                        onShowToast(`Switch #${idx + 1} eliminado`);
                                      }}
                                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                      title="Eliminar este switch"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* PARTE FINAL DEL CONTAINER: BOTÓN DE GUARDAR REGISTRO DE EQUIPOS */}
                      <div className="pt-3.5 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/60 mt-2">
                        <div className="text-[11px] text-slate-500">
                          {regEquipos.bloqueado ? (
                            <span className="flex items-center gap-1.5 text-emerald-800 font-bold">
                              <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>Registro de equipos guardado y protegido. Si falta algo por colocar, pulsa Desbloquear.</span>
                            </span>
                          ) : (
                            <span className="text-slate-600">
                              Pulsa guardar para asegurar el registro de series de router, decodificadores, repetidores y switches.
                            </span>
                          )}
                        </div>
                        <SaveLockButton
                          isLocked={!!regEquipos.bloqueado}
                          onSave={handleSaveEquipos}
                          onUnlock={handleUnlockEquipos}
                          label="Guardar Registro de Equipos"
                          lockedLabel="Equipos Guardados"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Navegación entre Paso 1, Paso 2 y Paso 3 */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setActiveStep(1)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer active:scale-95"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Volver a Paso 1: Fachada</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveStep(3)}
                className="flex items-center gap-2 px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer active:scale-95"
              >
                <span>Ir a Paso 3: Cierre y Observaciones</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

            {/* STEP 3: CIERRE Y OBSERVACIONES TÉCNICAS */}
            {activeStep === 3 && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div className="flex items-center gap-3.5 flex-wrap">
                  <div className="w-9 h-9 rounded-xl bg-[#0284c7] text-white font-extrabold text-lg flex items-center justify-center shrink-0 shadow-xs">
                    3
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight">
                        Paso 3: Cierre y Observaciones Técnicas
                      </h3>
                      <HoraFinalField task={task} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                  {/* COLUMNA IZQUIERDA: Fotos Generales (siempre visible, igual que Paso 2) */}
                  <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-4.5 space-y-3.5 shadow-2xs">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2 font-bold text-slate-900 text-xs sm:text-sm">
                        <ImageIcon className="w-4 h-4 text-slate-600" />
                        <span>Fotos Generales</span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-extrabold border border-slate-200">
                        {fotosEvidencias.length} fotos
                      </span>
                    </div>

                    <input ref={fileInputEvidenciasRef} type="file" accept="image/*" multiple className="hidden" onChange={handleUploadEvidencias} />
                    <button onClick={() => fileInputEvidenciasRef.current?.click()} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-2xs">
                      <CloudUpload className="w-3.5 h-3.5" /><span>Subir fotos</span>
                    </button>

                    {fotosEvidencias.length === 0 ? (
                      <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center text-slate-400 text-xs">
                        <p>No hay fotos generales.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3 max-h-[420px] overflow-y-auto p-1">
                        {fotosEvidencias.map((photo) => (
                          <div key={photo.id} draggable onDragStart={(e) => handleDragStart(e, photo)}
                            className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-50 cursor-grab active:cursor-grabbing hover:shadow-md transition-all">
                            <img src={photo.url} alt={photo.title} className="w-full h-24 object-cover" onClick={() => openPhotoViewer(photo)} />
                            <div className="p-1.5 bg-white"><p className="text-[11px] font-bold text-slate-800 truncate">{photo.title}</p></div>
                            <button onClick={() => handleDeleteEvidencia(photo.id)}
                              className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-red-600 rounded-md text-white opacity-0 group-hover:opacity-100">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* COLUMNA DERECHA: Evidencias Registradas + Tipo de Pago */}
                  <div className="lg:col-span-7 space-y-5">
                  <div className="bg-white border border-slate-200/90 rounded-2xl p-4.5 space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2 font-bold text-slate-900 text-xs sm:text-sm">
                        <ImageIcon className="w-4 h-4 text-slate-600" />
                        <span>Evidencias Registradas</span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-extrabold border border-slate-200">
                        {fotosEvidencias.length + evalCaja.fotosCaja.length + (fibraMat.fotosMateriales || []).length} fotos
                      </span>
                    </div>

                    {fotosEvidencias.length === 0 && evalCaja.fotosCaja.length === 0 && (fibraMat.fotosMateriales || []).length === 0 ? (
                      <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex-1 flex flex-col items-center justify-center text-center space-y-2 text-slate-400 min-h-[160px]">
                        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-medium text-slate-500">
                          No hay fotos registradas.
                        </span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-[300px] overflow-y-auto p-1">
                        {[...evalCaja.fotosCaja, ...(fibraMat.fotosMateriales || []), ...fotosEvidencias].map((photo) => (
                          <div
                            key={photo.id}
                            className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50 group"
                          >
                            <img
                              src={photo.url}
                              alt={photo.title}
                              className="w-full h-24 object-cover cursor-pointer"
                              onClick={() => setPreviewPhotoUrl(photo.url)}
                            />
                            <div className="p-1.5 bg-white">
                              <p className="text-[10px] font-bold text-slate-800 truncate">
                                {photo.title}
                              </p>
                              {photo.type === 'caja' && (
                                <span className="text-[9px] font-bold text-blue-600 block">
                                  Caja NAP
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Formulario: Tipo de Pago (debajo) */}
                  <div className="bg-white border border-slate-200/90 rounded-2xl p-4.5 space-y-4 shadow-2xs">
                    <div className="space-y-3.5">
                      <div className="flex items-center gap-2 font-bold text-slate-900 text-xs sm:text-sm">
                        <DollarSign className="w-4 h-4 text-emerald-600" />
                        <span>Tipo de Pago</span>
                      </div>

                      <div>
                        <select
                          value={selectedTipoPago}
                          onChange={(e) => handleTipoPagoChange(e.target.value)}
                          className="w-full text-xs font-medium text-slate-800 bg-white border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer shadow-2xs"
                        >
                          <option value="">Seleccione...</option>
                          <option value="Sin Costo / Garantía">Sin Costo / Garantía (S/ 0.00)</option>
                          <option value="Traslado Interno Promocional">Traslado Interno Promocional</option>
                          <option value="Efectivo">Efectivo</option>
                          <option value="Yape / Plin">Yape / Plin</option>
                          <option value="Transferencia">Transferencia Bancaria BCP/BBVA</option>
                          <option value="Cargo en Recibo">Cargo en Recibo (Siguiente ciclo)</option>
                        </select>
                      </div>

                      <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50 text-center space-y-1">
                        <span className="text-[11px] font-bold text-slate-500 block">
                          Precio
                        </span>
                        <div className="text-xs sm:text-sm italic text-slate-600 font-medium">
                          {selectedTipoPago ? (
                            <span className="font-extrabold font-mono text-slate-900 not-italic text-base">
                              {precio || 'S/ 0.00'}
                            </span>
                          ) : (
                            'Elegí un tipo de pago'
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleGuardarCierre}
                      className="w-full flex items-center justify-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-extrabold py-3 px-4 rounded-xl text-xs sm:text-sm transition-all shadow-md active:scale-[0.99] cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>Guardar Cierre</span>
                    </button>
                  </div>
                  </div>
                </div>

                {/* Navegación para volver a Paso 2 */}
                <div className="pt-4 border-t border-slate-200 flex items-center justify-start">
                  <button
                    type="button"
                    onClick={() => setActiveStep(2)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer active:scale-95"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Volver a Paso 2: Fotos y Materiales</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bottom rounded pill outline bar */}
          <div className="h-10 bg-slate-100/80 border border-slate-200 rounded-full flex items-center justify-between px-6 text-xs text-slate-500 mt-5 shadow-2xs">
            <span className="font-medium text-[11px]">
              Orden Odoo #{task.nroTicket} · DNI {task.dni} · {task.nombre}
            </span>
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-semibold text-slate-600">
                Paso {activeStep} de 3
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={activeStep === 1}
                  onClick={() => setActiveStep((prev) => (prev > 1 ? ((prev - 1) as any) : prev))}
                  className="px-2 py-0.5 rounded text-[10px] font-bold bg-white border border-slate-200 text-slate-700 disabled:opacity-40 cursor-pointer"
                >
                  Anterior
                </button>
                <button
                  disabled={activeStep === 3}
                  onClick={() => setActiveStep((prev) => (prev < 3 ? ((prev + 1) as any) : prev))}
                  className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#0284c7] text-white disabled:opacity-40 cursor-pointer"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>
            </>
          ) : currentActividad === 'VT' ? (
            <VTModal
              task={task}
              isOpen={isOpen}
              initialStep={activeStep}
              onClose={onClose}
              onUpdateTask={onUpdateTask}
              onShowToast={onShowToast}
              onSelectActividad={handleSelectActividad}
            />
          ) : (
            <RetiroModal
              task={task}
              isOpen={isOpen}
              initialStep={activeStep}
              onClose={onClose}
              onUpdateTask={onUpdateTask}
              onShowToast={onShowToast}
              onSelectActividad={handleSelectActividad}
            />
          )}
        </div>
      </div>

      {/* Fullscreen Interactive Photo Lightbox Modal with Mouse Wheel Zoom, Drag/Pan, and Keyboard Navigation */}
      <PhotoLightboxViewer
        isOpen={viewerState.isOpen}
        photos={viewerState.photos}
        initialIndex={viewerState.initialIndex}
        onClose={() => setViewerState((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
