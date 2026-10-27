import React, { useState, useMemo, useRef } from 'react';
import {
  X,
  Camera,
  Image as ImageIcon,
  FileText,
  Clock,
  CloudUpload,
  Trash2,
  DollarSign,
  Save,
  Move,
  Maximize2,
  Sparkles,
  AlertTriangle,
  Cable,
  Plus,
  Minus,
  Search,
  ChevronLeft,
  ChevronRight,
  Router,
  Tv,
  Wifi,
  Layers,
  Activity,
  Wrench,
  Box,
  ThumbsUp,
  ThumbsDown,
  Map,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  ClipboardList,
} from 'lucide-react';
import { TaskData, PhotoEvidence, VTDañoData, VTMaterialesData, VTEquiposData, VTPaso3Data } from '../../types/task';
import { SAMPLE_PHOTOS, DEFAULT_MATERIALES } from '../../data/mockData';
import { PhotoLightboxViewer } from './PhotoLightboxViewer';
<<<<<<< HEAD
import { Switch, SectionHeader, DropZone, SaveLockButton } from './wizardShared';
import { TecnicoEjecucionVisitaModal, GuardarEjecucionVisitaPayload } from './TecnicoEjecucionVisitaModal';
=======
import { Switch, SectionHeader, DropZone, SaveLockButton, HoraFinalField, formatFechaHoraFin } from './wizardShared';
>>>>>>> 9d27c2dadbbfd73b3869951443c3c50ffd71307c

interface VTModalProps {
  task: TaskData;
  isOpen: boolean;
  initialStep?: 1 | 2 | 3;
  onClose: () => void;
  onUpdateTask: (updated: Partial<TaskData>) => void;
  onShowToast: (message: string) => void;
  onSelectActividad: (act: 'I' | 'VT' | 'R') => void;
}

const FIBRA_HILOS: Array<VTMaterialesData['fibraHilos']> = ['', '1 hilo', '4 hilos', '12 hilos', '48 hilos', '96 hilos'];

type ListaKey = 'seActivoDeco' | 'seActivoSwitch' | 'seActivoRepetidor';

const EQUIPOS_LISTA: ReadonlyArray<{
  key: ListaKey;
  icon: React.ReactNode;
  title: string;
  label: string;
  color: string;
  drop: string;
  ph: string;
}> = [
  { key: 'seActivoDeco', icon: <Tv className="w-4 h-4 text-blue-500" />, title: '¿Se activó deco?', label: 'deco', color: 'bg-blue-500', drop: 'blue', ph: 'Serie / MAC' },
  { key: 'seActivoSwitch', icon: <Layers className="w-4 h-4 text-indigo-500" />, title: '¿Se activó switch?', label: 'switch', color: 'bg-indigo-500', drop: 'indigo', ph: 'Serie / MAC' },
  { key: 'seActivoRepetidor', icon: <Wifi className="w-4 h-4 text-purple-500" />, title: '¿Se activó repetidor?', label: 'repetidor', color: 'bg-purple-500', drop: 'purple', ph: 'Serie / Modelo' },
];

const listaDe = (k: ListaKey): 'decodificadores' | 'switches' | 'repetidores' =>
  k === 'seActivoDeco' ? 'decodificadores' : k === 'seActivoSwitch' ? 'switches' : 'repetidores';

const fotosDe = (k: ListaKey): 'fotosDeco' | 'fotosSwitch' | 'fotosRepetidor' =>
  k === 'seActivoDeco' ? 'fotosDeco' : k === 'seActivoSwitch' ? 'fotosSwitch' : 'fotosRepetidor';

export const VTModal: React.FC<VTModalProps> = ({
  task,
  isOpen,
  initialStep = 1,
  onClose,
  onUpdateTask,
  onShowToast,
  onSelectActividad,
}) => {
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(initialStep);
  const [draggedPhoto, setDraggedPhoto] = useState<PhotoEvidence | null>(null);
  const [selectedTipoPago, setSelectedTipoPago] = useState<string>(task.pagoInfo?.tipoPago || '');
  const [precio, setPrecio] = useState<string>(task.pagoInfo?.precio || '');
  const [viewerState, setViewerState] = useState<{ isOpen: boolean; photos: PhotoEvidence[]; initialIndex: number }>({
    isOpen: false,
    photos: [],
    initialIndex: 0,
  });
  const [isDañoExpanded, setIsDañoExpanded] = useState(true);
  const [isMaterialesExpanded, setIsMaterialesExpanded] = useState(true);
  const [isEquiposExpanded, setIsEquiposExpanded] = useState(true);
  const [isEjecucionModalOpen, setIsEjecucionModalOpen] = useState(false);

  const vtDaño: VTDañoData = task.vtDaño || {
    activo: true, fotosDaño: [], fotosPotenciaInicial: [], fotosPotenciaFinal: [], fotosKmz: [],
    medicionInicial: '', medicionFinal: '', fotosCaja: [], calificacionCaja: '', fotosRoseta: [],
    evaluacionRoseta: '', bloqueado: false,
  };
  const vtMateriales: VTMaterialesData = task.vtMateriales || {
    activo: true, fotosMateriales: [], materiales: { ...DEFAULT_MATERIALES },
    usoFibra: true, fibraHilos: '', fibraInicio: '', fibraFin: '', fibraResultado: '0',
    usoUtp: false, utpInicio: '', utpFin: '', utpResultado: '0', bloqueado: false,
  };
  const vtEquipos: VTEquiposData = task.vtEquipos || {
    activo: true, seRetiroEquipo: false, fotosRetirados: [], equipoRetiradoMac: '', equipoRetiradoSn: '', equipoRetiradoMarca: '',
    seActivoEquipo: false, fotosActivos: [], routerMac: task.macNoc || '', routerSn: task.datoOnt || '', routerMarca: '',
    seActivoDeco: false, fotosDeco: [], decodificadores: [''], seActivoSwitch: false, fotosSwitch: [], switches: [''],
    seActivoRepetidor: false, fotosRepetidor: [], repetidores: [''], bloqueado: false,
  };
  const vtPaso3: VTPaso3Data = task.vtPaso3 || {
    causaDaño: '', gradoAfectacion: '', diagnostico: '', solucion: '', fotosEvidencias: [], bloqueado: false,
  };

  const fotosFachada = task.fotosFachada || [];
  const fotosEvidencias = task.fotosEvidencias || [];
  const fileInputFachadaRef = useRef<HTMLInputElement>(null);
  const fileInputEvidenciasRef = useRef<HTMLInputElement>(null);

  const allPhotos = useMemo(() => {
    const list: PhotoEvidence[] = [];
    const seen = new Set<string>();
    const add = (items: PhotoEvidence[]) =>
      items.forEach((p: PhotoEvidence) => {
        const k = p.id || p.url;
        if (!seen.has(k)) {
          seen.add(k);
          list.push(p);
        }
      });
    add(fotosFachada);
    add(fotosEvidencias);
    add(vtDaño.fotosDaño); add(vtDaño.fotosCaja); add(vtDaño.fotosPotenciaInicial);
    add(vtDaño.fotosPotenciaFinal); add(vtDaño.fotosRoseta); add(vtDaño.fotosKmz);
    add(vtMateriales.fotosMateriales);
    add(vtEquipos.fotosRetirados); add(vtEquipos.fotosActivos); add(vtEquipos.fotosDeco);
    add(vtEquipos.fotosSwitch); add(vtEquipos.fotosRepetidor);
    add(vtPaso3.fotosEvidencias);
    return list;
  }, [fotosFachada, fotosEvidencias, vtDaño.fotosDaño, vtDaño.fotosCaja, vtDaño.fotosPotenciaInicial,
      vtDaño.fotosPotenciaFinal, vtDaño.fotosRoseta, vtDaño.fotosKmz, vtMateriales.fotosMateriales,
      vtEquipos.fotosRetirados, vtEquipos.fotosActivos, vtEquipos.fotosDeco, vtEquipos.fotosSwitch,
      vtEquipos.fotosRepetidor, vtPaso3.fotosEvidencias]);

  const openViewer = (target: PhotoEvidence | string) => {
    const url = typeof target === 'string' ? target : target.url;
    let idx = allPhotos.findIndex((p) => p.url === url);
    if (idx === -1) idx = 0;
    setViewerState({ isOpen: true, photos: allPhotos, initialIndex: idx });
  };

  const updateDaño = (patch: Partial<VTDañoData>) => onUpdateTask({ vtDaño: { ...vtDaño, ...patch } });
  const updateMateriales = (patch: Partial<VTMaterialesData>) => onUpdateTask({ vtMateriales: { ...vtMateriales, ...patch } });
  const updateEquipos = (patch: Partial<VTEquiposData>) => onUpdateTask({ vtEquipos: { ...vtEquipos, ...patch } });
  const updatePaso3 = (patch: Partial<VTPaso3Data>) => onUpdateTask({ vtPaso3: { ...vtPaso3, ...patch } });

  const handleDragStart = (e: React.DragEvent, photo: PhotoEvidence) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(photo));
    setDraggedPhoto(photo);
  };
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleDrop =
    (setter: (photos: PhotoEvidence[]) => void, current: PhotoEvidence[]) => (e: React.DragEvent) => {
      e.preventDefault();
      let photo = draggedPhoto;
      try {
        const d = e.dataTransfer.getData('text/plain');
        if (d) photo = JSON.parse(d);
      } catch { /* fallback */ }
      if (!photo) return;
      if (!current.some((f) => f.id === photo?.id)) {
        setter([photo, ...current]);
        onUpdateTask({ fotosEvidencias: fotosEvidencias.filter((p) => p.id !== photo?.id) });
      }
      setDraggedPhoto(null);
    };

  const removePhoto =
    (setter: (photos: PhotoEvidence[]) => void, current: PhotoEvidence[]) => (photoId: string) => {
      const updated = current.filter((p) => p.id !== photoId);
      setter(updated);
      const photo = current.find((p) => p.id === photoId);
      if (photo) onUpdateTask({ fotosEvidencias: [photo, ...fotosEvidencias] });
    };

  const paso1Ok = task.pasos.paso1 === 'Completado' || fotosFachada.length > 0;
  const paso2Ok = task.pasos.paso2 === 'Completado' || fotosEvidencias.length > 0;
  const paso3Ok = task.pasos.paso3 === 'Completado' || !!task.pagoInfo?.registrado;
  const stepOk = (n: 1 | 2 | 3) => (n === 1 ? paso1Ok : n === 2 ? paso2Ok : paso3Ok);

  const handleTipoPagoChange = (tipo: string) => {
    setSelectedTipoPago(tipo);
    if (tipo === 'Sin Costo / Garantía') setPrecio('S/ 0.00');
    else if (tipo === 'Efectivo' || tipo === 'Yape / Plin' || tipo === 'Transferencia') setPrecio('S/ 50.00');
    else setPrecio('');
  };

  const handleGuardarCierre = () => {
    if (!selectedTipoPago) { onShowToast('Selecciona un tipo de pago'); return; }
    const nowLog = {
      id: `cierre-vt-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
      user: task.tecAsignado !== 'Sin Asignar' ? task.tecAsignado : 'Admin Ops',
      action: 'Cierre de Visita Técnica',
      details: `Causa: ${vtPaso3.causaDaño || 'N/A'} · Diag: ${vtPaso3.diagnostico || 'N/A'} · Pago: ${selectedTipoPago} (${precio || 'S/ 0.00'})`,
    };
    onUpdateTask({
      pagoInfo: { tipoPago: selectedTipoPago, precio: precio || 'S/ 0.00', registrado: true },
      estado: 'LIQUIDADO',
      horaFin: formatFechaHoraFin(),
      pasos: { ...task.pasos, paso3: 'Completado' },
      cambiosRegistrados: [nowLog, ...(task.cambiosRegistrados || [])],
    });
    onShowToast('Cierre de Visita Técnica guardado con éxito');
  };

  const handleUploadFachada = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        const newPhoto: PhotoEvidence = {
          id: `fachada-${Date.now()}`, title: file.name.replace(/\.[^/.]+$/, ''), url: result, type: 'fachada',
          timestamp: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }), category: 'Foto Fachada',
        };
        const nowTime = new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
        onUpdateTask({
          fotosFachada: [newPhoto, ...fotosFachada], fachadaUrl: result,
          horaInicio: task.horaInicio === 'Pendiente' ? nowTime : task.horaInicio,
          pasos: { ...task.pasos, paso1: 'Completado' },
        });
        onShowToast('Foto de fachada registrada');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadEvidencias = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newItems: PhotoEvidence[] = [];
      Array.from(files).forEach((file, idx) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          newItems.push({ id: `ev-${Date.now()}-${idx}`, title: file.name.replace(/\.[^/.]+$/, ''), url: result, type: 'general', timestamp: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }), category: 'Evidencia General' });
          if (newItems.length === files.length) {
            onUpdateTask({ fotosEvidencias: [...newItems, ...fotosEvidencias], pasos: { ...task.pasos, paso2: 'Completado' } });
            onShowToast(`${files.length} foto(s) subida(s)`);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleVTMaterialChange = (name: string, delta: number) => {
    const current = vtMateriales.materiales[name] ?? 0;
    updateMateriales({ materiales: { ...vtMateriales.materiales, [name]: Math.max(0, current + delta) } });
  };

  /** Resta absoluta: el orden en que se ingrese inicio/fin es indistinto. */
  const fmtDiff = (a: string, b: string): string => {
    if (a.trim() === '' && b.trim() === '') return '0';
    const diff = Math.abs((parseFloat(b) || 0) - (parseFloat(a) || 0));
    return diff % 1 === 0 ? `${diff}` : diff.toFixed(2);
  };
  const handleFibraChange = (inicio: string, fin: string) =>
    updateMateriales({ fibraInicio: inicio, fibraFin: fin, fibraResultado: fmtDiff(inicio, fin) });
  const handleUtpChange = (inicio: string, fin: string) =>
    updateMateriales({ utpInicio: inicio, utpFin: fin, utpResultado: fmtDiff(inicio, fin) });

  /** Botonera de calificacion reutilizable (Caja: Bueno/Regular/Malo, Roseta: Bien/Regular/Malo). */
  const Calificacion = ({
    value, onChange, labels,
  }: { value: string; onChange: (v: any) => void; labels: [string, string, string] }) => (
    <div className="grid grid-cols-3 gap-2.5">
      <button type="button" onClick={() => { onChange(labels[0]); onShowToast(`Calificado como: ${labels[0]}`); }}
        className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${value === labels[0] ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm ring-2 ring-emerald-500/30' : 'bg-emerald-50/70 hover:bg-emerald-100 text-emerald-800 border-emerald-200'}`}>
        <ThumbsUp className="w-3.5 h-3.5" /><span>{labels[0]}</span>
      </button>
      <button type="button" onClick={() => { onChange(labels[1]); onShowToast(`Calificado como: ${labels[1]}`); }}
        className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${value === labels[1] ? 'bg-amber-500 text-white border-amber-500 shadow-sm ring-2 ring-amber-400/30' : 'bg-amber-50/70 hover:bg-amber-100 text-amber-800 border-amber-200'}`}>
        <AlertTriangle className="w-3.5 h-3.5" /><span>{labels[1]}</span>
      </button>
      <button type="button" onClick={() => { onChange(labels[2]); onShowToast(`Calificado como: ${labels[2]}`); }}
        className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${value === labels[2] ? 'bg-red-600 text-white border-red-600 shadow-sm ring-2 ring-red-500/30' : 'bg-red-50/70 hover:bg-red-100 text-red-800 border-red-200'}`}>
        <ThumbsDown className="w-3.5 h-3.5" /><span>{labels[2]}</span>
      </button>
    </div>
  );

  /** Fila de Equipos con switch + dropzone + input de serie. */
  const EquipoRow = ({
    icono, titulo, value, color, dropColor, fotos, label, emptyText, placeholder,
    onToggle, onFotos, onSerie,
  }: {
    icono: React.ReactNode; titulo: string; value: boolean; color: string; dropColor: string;
    fotos: PhotoEvidence[]; label: string; emptyText: string; placeholder: { value: string; ph: string };
    onToggle: () => void; onFotos: (p: PhotoEvidence[]) => void; onSerie: (v: string) => void;
  }) => (
    <div className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-2xl space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          {icono}
          <span className="text-xs font-bold text-slate-800">{titulo}</span>
        </div>
        <div className="flex items-center gap-2">
          <Switch value={value} onToggle={onToggle} color={color} size="sm" />
          <span className={`text-[11px] font-bold ${value ? color.replace('bg-', 'text-') : 'text-slate-400'}`}>
            {value ? 'SÍ' : 'NO'}
          </span>
        </div>
      </div>
      {value && (
        <div className="pt-2 border-t border-slate-200/80 space-y-2.5 animate-in fade-in duration-150">
          <DropZone photos={fotos} onDrop={handleDrop(onFotos, fotos)} onDragOver={handleDragOver}
            onRemove={removePhoto(onFotos, fotos)} onView={openViewer} color={dropColor} label={label} emptyText={emptyText} />
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 block">Serie / MAC:</label>
            <input type="text" value={placeholder.value} onChange={(e) => onSerie(e.target.value.toUpperCase())}
              placeholder={placeholder.ph} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400" />
          </div>
        </div>
      )}
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0 gap-4 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-amber-900/10 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-amber-900" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-extrabold text-[#0f172a] text-lg tracking-tight">Ejecución y Validación de Tarea</h2>
                <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-xs font-mono font-bold">{task.nroTicket}</span>
              </div>
              <p className="text-xs text-slate-500 font-medium truncate">{task.nombre} · {task.direccion}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl border border-slate-200 shadow-2xs">
              <button type="button" onClick={() => onSelectActividad('I')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer bg-white text-slate-600 hover:text-blue-600 border border-slate-200">
                <span className="w-5 h-5 rounded-lg flex items-center justify-center text-[11px] font-black bg-slate-200 text-slate-700">I</span>
                <span className="hidden sm:inline">INSTALACIÓN</span>
              </button>
              <button type="button" onClick={() => onSelectActividad('VT')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer bg-amber-500 text-white shadow-sm ring-2 ring-amber-400">
                <span className="w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-black bg-white text-amber-700">VT</span>
                <span className="hidden sm:inline">VISITA TÉCNICA</span>
              </button>
              <button type="button" onClick={() => onSelectActividad('R')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer bg-white text-slate-600 hover:text-rose-600 border border-slate-200">
                <span className="w-5 h-5 rounded-lg flex items-center justify-center text-[11px] font-black bg-slate-200 text-slate-700">R</span>
                <span className="hidden sm:inline">RETIRO</span>
              </button>
            </div>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer" title="Cerrar">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Step Navigation */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between gap-3 overflow-x-auto shrink-0">
          <div className="flex items-center gap-3">
            {[1, 2, 3].map((step) => (
              <button key={step} onClick={() => setActiveStep(step as 1 | 2 | 3)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer border ${activeStep === step ? 'bg-amber-500 text-white border-amber-500 shadow-sm' : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'}`}>
                {step === 1 && <Camera className="w-4 h-4 shrink-0" />}
                {step === 2 && <Wrench className="w-4 h-4 shrink-0" />}
                {step === 3 && <FileText className="w-4 h-4 shrink-0" />}
                <span>Paso {step}: {step === 1 ? 'Fachada' : step === 2 ? 'Evidencias Técnicas' : 'Cierre y Obs.'}</span>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ml-1 ${stepOk(step as 1 | 2 | 3) ? 'bg-emerald-600 text-white' : 'bg-slate-600 text-white'}`}>
                  {stepOk(step as 1 | 2 | 3) ? 'OK' : 'Pendiente'}
                </span>
              </button>
            ))}
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 text-xs font-black shrink-0">
            ACTIVIDAD: VT · VISITA TÉCNICA
          </span>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-slate-50/50">
          <div className="bg-white border-2 border-amber-500 rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
            {/* PASO 1 */}
            {activeStep === 1 && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500 text-white font-extrabold text-lg flex items-center justify-center shrink-0 shadow-xs">1</div>
                  <h3 className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight">Paso 1: Foto de Fachada / Inicio</h3>
                </div>
                <div className="bg-white border border-slate-200/90 rounded-2xl p-4 flex items-center justify-between text-xs sm:text-sm shadow-2xs">
                  <div className="flex items-center gap-2 font-bold text-slate-800"><Clock className="w-4 h-4 text-slate-500" /><span>Hora inicio de actividad</span></div>
                  <span className="font-bold text-slate-700">{task.horaInicio && task.horaInicio !== 'No iniciada' ? task.horaInicio : 'Pendiente'}</span>
                </div>
                <div className="bg-white border border-slate-200/90 rounded-2xl p-4.5 space-y-4 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-slate-900 text-xs sm:text-sm"><Camera className="w-4 h-4 text-slate-600" /><span>Fotos de Fachada Registradas</span></div>
                    <button onClick={() => fileInputFachadaRef.current?.click()} className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-2xs">
                      <CloudUpload className="w-3.5 h-3.5" /><span>Subir Foto</span>
                    </button>
                  </div>
                  <input ref={fileInputFachadaRef} type="file" accept="image/*" className="hidden" onChange={handleUploadFachada} />
                  {fotosFachada.length === 0 ? (
                    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center flex flex-col items-center justify-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400"><Camera className="w-6 h-6" /></div>
                      <p className="text-slate-500 text-xs sm:text-sm font-medium">No hay fotos de fachada registradas.</p>
                      <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                        <span className="text-[11px] font-bold text-slate-400">Imágenes de ejemplo:</span>
                        {SAMPLE_PHOTOS.fachada.map((s, i) => (
                          <button key={i} onClick={() => {
                            const p: PhotoEvidence = { id: `sf-${Date.now()}`, title: s.title, url: s.url, type: 'fachada', timestamp: '', category: s.category };
                            onUpdateTask({ fotosFachada: [p, ...fotosFachada], pasos: { ...task.pasos, paso1: 'Completado' } });
                          }} className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200/80 rounded-lg text-xs font-semibold cursor-pointer">
                            <Sparkles className="w-3 h-3 text-amber-500 inline mr-1" />{s.title.slice(0, 26)}...
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {fotosFachada.map((photo) => (
                        <div key={photo.id} className="relative group rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-sm">
                          <img src={photo.url} alt={photo.title} className="w-full h-44 object-cover cursor-pointer" onClick={() => openViewer(photo)} />
                          <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 via-black/40 to-transparent p-3 text-white flex items-center justify-between">
                            <div><p className="text-xs font-bold truncate max-w-[200px]">{photo.title}</p><span className="text-[10px] text-slate-300">{photo.timestamp}</span></div>
                            <div className="flex gap-1.5">
                              <button onClick={() => openViewer(photo.url)} className="p-1.5 bg-white/20 hover:bg-white/40 rounded-lg text-white"><Maximize2 className="w-3.5 h-3.5" /></button>
                              <button onClick={() => onUpdateTask({ fotosFachada: fotosFachada.filter((f) => f.id !== photo.id), pasos: { ...task.pasos, paso1: fotosFachada.length > 1 ? 'Completado' : 'Pendiente' } })} className="p-1.5 bg-red-600/80 hover:bg-red-600 rounded-lg text-white"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">Paso 1 de 3</span>
                  <button type="button" onClick={() => setActiveStep(2)} className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer active:scale-95">
                    <span>Ir a Paso 2: Evidencias Técnicas</span><ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* PASO 2 */}
            {activeStep === 2 && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500 text-white font-extrabold text-lg flex items-center justify-center shrink-0 shadow-xs">2</div>
                  <h3 className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight">Paso 2: Evidencias Técnicas y Equipos</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEjecucionModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0066ff] hover:bg-[#0052cc] text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-95 ml-auto"
                >
                  <ClipboardList className="w-3.5 h-3.5" />
                  <span>Ejecución Visita (Stock Técnico)</span>
                </button>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                  {/* Fotos Generales */}
                  <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-4.5 space-y-3.5 shadow-2xs">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2 font-bold text-slate-900 text-xs sm:text-sm"><ImageIcon className="w-4 h-4 text-slate-600" /><span>Fotos Generales</span></div>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-extrabold border border-slate-200">{fotosEvidencias.length} fotos</span>
                    </div>
                    <input ref={fileInputEvidenciasRef} type="file" accept="image/*" multiple className="hidden" onChange={handleUploadEvidencias} />
                    <button onClick={() => fileInputEvidenciasRef.current?.click()} className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-2xs">
                      <CloudUpload className="w-3.5 h-3.5" /><span>Subir fotos</span>
                    </button>
                    <div className="flex flex-wrap gap-1.5 pb-1">
                      {SAMPLE_PHOTOS.evidencias.map((s, i) => (
                        <button key={i} onClick={() => {
                          const p: PhotoEvidence = { id: `se-${Date.now()}-${i}`, title: s.title, url: s.url, type: 'general', timestamp: '', category: s.category };
                          onUpdateTask({ fotosEvidencias: [p, ...fotosEvidencias], pasos: { ...task.pasos, paso2: 'Completado' } });
                        }} className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[10px] font-semibold cursor-pointer">
                          <Sparkles className="w-2.5 h-2.5 text-amber-500 inline" />+ {s.category}
                        </button>
                      ))}
                    </div>
                    {fotosEvidencias.length === 0 ? (
                      <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center text-slate-400 text-xs"><p>No hay fotos generales.</p></div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3 max-h-[380px] overflow-y-auto p-1">
                        {fotosEvidencias.map((photo) => (
                          <div key={photo.id} draggable onDragStart={(e) => handleDragStart(e, photo)}
                            className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-50 cursor-grab active:cursor-grabbing hover:shadow-md transition-all">
                            <img src={photo.url} alt={photo.title} className="w-full h-24 object-cover" onClick={() => openViewer(photo)} />
                            <div className="p-1.5 bg-white"><p className="text-[11px] font-bold text-slate-800 truncate">{photo.title}</p></div>
                            <button onClick={() => onUpdateTask({ fotosEvidencias: fotosEvidencias.filter((p) => p.id !== photo.id) })}
                              className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-red-600 rounded-md text-white opacity-0 group-hover:opacity-100">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 3 CONTAINERS */}
                  <div className="lg:col-span-7 space-y-5">
                    {/* CONTAINER 1: DAÑO Y MEDICIÓN */}
                    <div className="bg-white border-2 border-amber-500/40 rounded-2xl p-5 space-y-4 shadow-sm">
                      <SectionHeader icon={<AlertTriangle className="w-4 h-4 text-amber-500" />} title="Evidencias de Daño y Medición"
                        switchValue={vtDaño.activo} onSwitchToggle={() => { const v = !vtDaño.activo; updateDaño({ activo: v }); if (v) setIsDañoExpanded(true); onShowToast(v ? 'Daño activado' : 'Daño desactivado'); }}
                        locked={vtDaño.bloqueado} expanded={isDañoExpanded} onExpand={() => setIsDañoExpanded(!isDañoExpanded)}
                        badge={vtDaño.activo ? 'Activo' : 'Desactivado'} />
                      {!vtDaño.activo ? (
                        <div className="p-5 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200"><p>Desactivado</p></div>
                      ) : !isDañoExpanded ? (
                        <div onClick={() => setIsDañoExpanded(true)} className="p-3 text-center text-xs text-amber-600 bg-amber-50/50 rounded-2xl border border-amber-200 cursor-pointer font-bold">Plegado - clic para desplegar</div>
                      ) : (
                        <div className="space-y-5 animate-in fade-in duration-150">
                          {vtDaño.bloqueado && (
                            <div className="p-2.5 px-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                              <span className="text-emerald-800 font-bold">Guardado y protegido</span>
                              <button onClick={() => updateDaño({ bloqueado: false })} className="px-2 py-0.5 bg-white border border-emerald-300 rounded-lg text-[10px] font-extrabold cursor-pointer">Desbloquear</button>
                            </div>
                          )}
                          <DropZone photos={vtDaño.fotosDaño} onDrop={handleDrop((p) => updateDaño({ fotosDaño: p }), vtDaño.fotosDaño)}
                            onDragOver={handleDragOver} onRemove={removePhoto((p) => updateDaño({ fotosDaño: p }), vtDaño.fotosDaño)}
                            onView={openViewer} color="amber" label="Fotos de Daño / Avería" emptyText="Arrastra aquí fotos desde Fotos Generales" />

                          {/* Evaluacion de Caja NAP */}
                          <div className="space-y-3 pt-1 border-t border-slate-100">
                            <div className="flex items-center gap-2"><Box className="w-4 h-4 text-sky-700" /><span className="text-xs font-extrabold text-slate-900 uppercase tracking-wide">Evaluación de Caja NAP</span></div>
                            <DropZone photos={vtDaño.fotosCaja} onDrop={handleDrop((p) => updateDaño({ fotosCaja: p }), vtDaño.fotosCaja)}
                              onDragOver={handleDragOver} onRemove={removePhoto((p) => updateDaño({ fotosCaja: p }), vtDaño.fotosCaja)}
                              onView={openViewer} color="sky" label="Fotos de Caja / Splitter" emptyText="Arrastra aquí fotos de la caja o splitter" />
                            <div className="space-y-2">
                              <label className="text-xs font-extrabold text-slate-900 block">Calificación de la Caja:</label>
                              <Calificacion value={vtDaño.calificacionCaja} onChange={(v) => updateDaño({ calificacionCaja: v })} labels={['Bueno', 'Regular', 'Malo']} />
                            </div>
                          </div>

                          {/* Potencias */}
                          <div className="space-y-2 pt-1 border-t border-slate-100">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5"><Activity className="w-4 h-4 text-blue-600" />Potencia Inicial (dBm)</span>
                              <span className="text-[10px] text-slate-400">(arrastra fotos del medidor)</span>
                            </div>
                            <input type="text" value={vtDaño.medicionInicial} onChange={(e) => updateDaño({ medicionInicial: e.target.value })} placeholder="-25.0"
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 font-mono text-slate-900 font-bold" />
                            <DropZone photos={vtDaño.fotosPotenciaInicial} onDrop={handleDrop((p) => updateDaño({ fotosPotenciaInicial: p }), vtDaño.fotosPotenciaInicial)}
                              onDragOver={handleDragOver} onRemove={removePhoto((p) => updateDaño({ fotosPotenciaInicial: p }), vtDaño.fotosPotenciaInicial)}
                              onView={openViewer} color="blue" label="Fotos Potencia Inicial" emptyText="Arrastra fotos de la medición inicial" />
                          </div>
                          <div className="space-y-2 pt-1 border-t border-slate-100">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5"><Activity className="w-4 h-4 text-emerald-600" />Potencia Final (dBm)</span>
                              <span className="text-[10px] text-slate-400">(arrastra fotos del medidor)</span>
                            </div>
                            <input type="text" value={vtDaño.medicionFinal} onChange={(e) => updateDaño({ medicionFinal: e.target.value })} placeholder="-19.2"
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 font-mono text-slate-900 font-bold" />
                            <DropZone photos={vtDaño.fotosPotenciaFinal} onDrop={handleDrop((p) => updateDaño({ fotosPotenciaFinal: p }), vtDaño.fotosPotenciaFinal)}
                              onDragOver={handleDragOver} onRemove={removePhoto((p) => updateDaño({ fotosPotenciaFinal: p }), vtDaño.fotosPotenciaFinal)}
                              onView={openViewer} color="emerald" label="Fotos Potencia Final" emptyText="Arrastra fotos de la medición final" />
                          </div>

                          {/* Roseta */}
                          <div className="space-y-3 pt-1 border-t border-slate-100">
                            <div className="flex items-center gap-2"><Wifi className="w-4 h-4 text-violet-700" /><span className="text-xs font-extrabold text-slate-900 uppercase tracking-wide">Evidencias de la Roseta</span></div>
                            <DropZone photos={vtDaño.fotosRoseta} onDrop={handleDrop((p) => updateDaño({ fotosRoseta: p }), vtDaño.fotosRoseta)}
                              onDragOver={handleDragOver} onRemove={removePhoto((p) => updateDaño({ fotosRoseta: p }), vtDaño.fotosRoseta)}
                              onView={openViewer} color="violet" label="Fotos de Roseta / Conector" emptyText="Arrastra aquí fotos de la roseta óptica o conector" />
                            <div className="space-y-2">
                              <label className="text-xs font-extrabold text-slate-900 block">Evaluación de la Roseta:</label>
                              <Calificacion value={vtDaño.evaluacionRoseta} onChange={(v) => updateDaño({ evaluacionRoseta: v })} labels={['Bien', 'Regular', 'Malo']} />
                            </div>
                          </div>

                          {/* KMZ */}
                          <div className="space-y-2 pt-1 border-t border-slate-100">
                            <div className="flex items-center gap-2"><Map className="w-4 h-4 text-purple-700" /><span className="text-xs font-extrabold text-slate-900 uppercase tracking-wide">Evidencias del KMZ</span></div>
                            <DropZone photos={vtDaño.fotosKmz} onDrop={handleDrop((p) => updateDaño({ fotosKmz: p }), vtDaño.fotosKmz)}
                              onDragOver={handleDragOver} onRemove={removePhoto((p) => updateDaño({ fotosKmz: p }), vtDaño.fotosKmz)}
                              onView={openViewer} color="purple" label="Fotos del Recorrido KMZ / Tendido" emptyText="Arrastra fotos del tendido, postes o recorrido KMZ" />
                          </div>

                          <div className="pt-3.5 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/60">
                            <div className="text-[11px] text-slate-500">{vtDaño.bloqueado ? <span className="text-emerald-800 font-bold">Asegurado.</span> : <span>Pulsa guardar para asegurar.</span>}</div>
                            <SaveLockButton isLocked={!!vtDaño.bloqueado} onSave={() => updateDaño({ bloqueado: true })} onUnlock={() => updateDaño({ bloqueado: false })} label="Guardar Daño" lockedLabel="Daño Guardado" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* CONTAINER 2: MATERIALES Y FIBRA */}
                    <div className="bg-white border-2 border-amber-500/40 rounded-2xl p-5 space-y-4 shadow-sm">
                      <SectionHeader icon={<Cable className="w-4 h-4 text-amber-500" />} title="Materiales y Fibra"
                        switchValue={vtMateriales.activo} onSwitchToggle={() => { const v = !vtMateriales.activo; updateMateriales({ activo: v }); if (v) setIsMaterialesExpanded(true); onShowToast(v ? 'Materiales activado' : 'Materiales desactivado'); }}
                        locked={vtMateriales.bloqueado} expanded={isMaterialesExpanded} onExpand={() => setIsMaterialesExpanded(!isMaterialesExpanded)}
                        badge={vtMateriales.activo ? 'Activo' : 'Desactivado'} />
                      {!vtMateriales.activo ? (
                        <div className="p-5 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200"><p>Desactivado</p></div>
                      ) : !isMaterialesExpanded ? (
                        <div onClick={() => setIsMaterialesExpanded(true)} className="p-3 bg-amber-50/50 hover:bg-amber-50 rounded-2xl border border-amber-200 cursor-pointer transition-colors flex items-center justify-between gap-2 flex-wrap text-xs">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-amber-700">Materiales y Fibra:</span>
                            {vtMateriales.usoFibra && <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md text-[11px] font-semibold">Fibra: {vtMateriales.fibraResultado}m{vtMateriales.fibraHilos ? ` · ${vtMateriales.fibraHilos}` : ''}</span>}
                            {vtMateriales.usoUtp && <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-md text-[11px] font-semibold">UTP: {vtMateriales.utpResultado}m</span>}
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[11px] font-semibold">{Object.values(vtMateriales.materiales || {}).filter((v) => v > 0).length} materiales en uso</span>
                          </div>
                          <div className="flex items-center gap-1 text-amber-700 font-semibold text-[11px] shrink-0"><span>Desplegar</span><ChevronDown className="w-4 h-4" /></div>
                        </div>
                      ) : (
                        <div className="space-y-5 animate-in fade-in duration-150">
                          {vtMateriales.bloqueado && (
                            <div className="p-2.5 px-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                              <span className="text-emerald-800 font-bold">Guardado</span>
                              <button onClick={() => updateMateriales({ bloqueado: false })} className="px-2 py-0.5 bg-white border border-emerald-300 rounded-lg text-[10px] font-extrabold cursor-pointer">Desbloquear</button>
                            </div>
                          )}
                          <DropZone photos={vtMateriales.fotosMateriales} onDrop={handleDrop((p) => updateMateriales({ fotosMateriales: p }), vtMateriales.fotosMateriales)}
                            onDragOver={handleDragOver} onRemove={removePhoto((p) => updateMateriales({ fotosMateriales: p }), vtMateriales.fotosMateriales)}
                            onView={openViewer} color="amber" label="Fotos de Materiales" emptyText="Arrastra aquí fotos" />

                          {/* FIBRA */}
                          <div className="space-y-3 pt-1 border-t border-slate-100">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <div className="flex items-center gap-2"><Cable className="w-4 h-4 text-blue-600 shrink-0" /><span className="text-xs font-black text-slate-800 uppercase tracking-wider">Fibra Óptica</span></div>
                              <div className="flex items-center gap-2">
                                <Switch value={vtMateriales.usoFibra} onToggle={() => { const v = !vtMateriales.usoFibra; updateMateriales({ usoFibra: v }); onShowToast(v ? 'Fibra activada' : 'Fibra desactivada'); }} color="bg-blue-600" size="sm" />
                                <span className={`text-[11px] font-bold ${vtMateriales.usoFibra ? 'text-blue-600' : 'text-slate-400'}`}>{vtMateriales.usoFibra ? 'SÍ' : 'NO'}</span>
                              </div>
                            </div>
                            {vtMateriales.usoFibra && (
                              <div className="pt-2 border-t border-slate-200/80 space-y-3 animate-in fade-in duration-150">
                                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-end">
                                  <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-slate-600 block">Fibra (hilos):</label>
                                    <select value={vtMateriales.fibraHilos} onChange={(e) => updateMateriales({ fibraHilos: e.target.value as VTMaterialesData['fibraHilos'] })}
                                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
                                      {FIBRA_HILOS.map((h) => <option key={h || 'none'} value={h}>{h || 'No especificado'}</option>)}
                                    </select>
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-slate-600 block">Punta Inicial:</label>
                                    <input type="text" inputMode="decimal" value={vtMateriales.fibraInicio} onChange={(e) => handleFibraChange(e.target.value, vtMateriales.fibraFin)} placeholder="0"
                                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-slate-600 block">Punta Final:</label>
                                    <input type="text" inputMode="decimal" value={vtMateriales.fibraFin} onChange={(e) => handleFibraChange(vtMateriales.fibraInicio, e.target.value)} placeholder="0"
                                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-slate-600 block">Resultado (m):</label>
                                    <div className="w-full bg-blue-50 border-2 border-blue-200 rounded-xl px-3 py-2 text-center">
                                      <span className="text-sm font-black font-mono text-blue-900">{vtMateriales.fibraResultado}</span><span className="text-[10px] font-bold text-blue-600 ml-1">m</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* UTP */}
                          <div className="space-y-3 pt-1 border-t border-slate-100">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <div className="flex items-center gap-2"><Cable className="w-4 h-4 text-indigo-600 shrink-0" /><span className="text-xs font-black text-slate-800 uppercase tracking-wider">UTP</span></div>
                              <div className="flex items-center gap-2">
                                <Switch value={vtMateriales.usoUtp} onToggle={() => { const v = !vtMateriales.usoUtp; updateMateriales({ usoUtp: v }); onShowToast(v ? 'UTP activado' : 'UTP desactivado'); }} color="bg-indigo-600" size="sm" />
                                <span className={`text-[11px] font-bold ${vtMateriales.usoUtp ? 'text-indigo-600' : 'text-slate-400'}`}>{vtMateriales.usoUtp ? 'SÍ' : 'NO'}</span>
                              </div>
                            </div>
                            {vtMateriales.usoUtp && (
                              <div className="pt-2 border-t border-slate-200/80 animate-in fade-in duration-150">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-end">
                                  <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-slate-600 block">Punta Inicial:</label>
                                    <input type="text" inputMode="decimal" value={vtMateriales.utpInicio} onChange={(e) => handleUtpChange(e.target.value, vtMateriales.utpFin)} placeholder="0"
                                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-slate-600 block">Punta Final:</label>
                                    <input type="text" inputMode="decimal" value={vtMateriales.utpFin} onChange={(e) => handleUtpChange(vtMateriales.utpInicio, e.target.value)} placeholder="0"
                                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-slate-600 block">Resultado (m):</label>
                                    <div className="w-full bg-indigo-50 border-2 border-indigo-200 rounded-xl px-3 py-2 text-center">
                                      <span className="text-sm font-black font-mono text-indigo-900">{vtMateriales.utpResultado}</span><span className="text-[10px] font-bold text-indigo-600 ml-1">m</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Materiales */}
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(vtMateriales.materiales).map(([name, qty]) => (
                              <div key={name} className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 gap-1 min-w-0">
                                <span className="text-[10px] font-bold text-slate-700 truncate" title={name}>{name}</span>
                                <div className="flex items-center gap-0.5 shrink-0">
                                  <button onClick={() => handleVTMaterialChange(name, -1)} className="w-5 h-5 rounded-md bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center cursor-pointer"><Minus className="w-3 h-3" /></button>
                                  <span className="w-6 text-center text-xs font-black text-slate-900">{qty}</span>
                                  <button onClick={() => handleVTMaterialChange(name, 1)} className="w-5 h-5 rounded-md bg-amber-100 hover:bg-amber-200 text-amber-700 flex items-center justify-center cursor-pointer"><Plus className="w-3 h-3" /></button>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="pt-3.5 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/60">
                            <div className="text-[11px] text-slate-500">{vtMateriales.bloqueado ? <span className="text-emerald-800 font-bold">Asegurado.</span> : <span>Pulsa guardar.</span>}</div>
                            <SaveLockButton isLocked={!!vtMateriales.bloqueado} onSave={() => updateMateriales({ bloqueado: true })} onUnlock={() => updateMateriales({ bloqueado: false })} label="Guardar Materiales" lockedLabel="Materiales Guardados" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* CONTAINER 3: EQUIPOS */}
                    <div className="bg-white border-2 border-amber-500/40 rounded-2xl p-5 space-y-4 shadow-sm">
                      <SectionHeader icon={<Router className="w-4 h-4 text-amber-500" />} title="Equipos Activos y Retirados"
                        switchValue={vtEquipos.activo} onSwitchToggle={() => { const v = !vtEquipos.activo; updateEquipos({ activo: v }); if (v) setIsEquiposExpanded(true); onShowToast(v ? 'Equipos activado' : 'Equipos desactivado'); }}
                        locked={vtEquipos.bloqueado} expanded={isEquiposExpanded} onExpand={() => setIsEquiposExpanded(!isEquiposExpanded)}
                        badge={vtEquipos.activo ? 'Activo' : 'Desactivado'} />
                      {!vtEquipos.activo ? (
                        <div className="p-5 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200"><p>Desactivado</p></div>
                      ) : !isEquiposExpanded ? (
                        <div onClick={() => setIsEquiposExpanded(true)} className="p-3 bg-amber-50/50 rounded-2xl border border-amber-200 cursor-pointer text-xs text-center text-amber-700 font-bold">Plegado - clic para desplegar</div>
                      ) : (
                        <div className="space-y-5 animate-in fade-in duration-150">
                          {vtEquipos.bloqueado && (
                            <div className="p-2.5 px-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                              <span className="text-emerald-800 font-bold">Guardado</span>
                              <button onClick={() => updateEquipos({ bloqueado: false })} className="px-2 py-0.5 bg-white border border-emerald-300 rounded-lg text-[10px] font-extrabold cursor-pointer">Desbloquear</button>
                            </div>
                          )}

                          <EquipoRow icono={<Trash2 className="w-4 h-4 text-red-500" />} titulo="¿Se retiró equipo?" value={vtEquipos.seRetiroEquipo} color="bg-red-500" dropColor="red"
                            fotos={vtEquipos.fotosRetirados} label="Fotos de Equipo Retirado" emptyText="Arrastra aquí fotos del equipo retirado" placeholder={{ value: vtEquipos.equipoRetiradoMac + vtEquipos.equipoRetiradoSn, ph: 'MAC / SN / Marca del equipo retirado' }}
                            onToggle={() => { const v = !vtEquipos.seRetiroEquipo; updateEquipos({ seRetiroEquipo: v }); onShowToast(v ? 'Retiro activado' : 'Retiro desactivado'); }}
                            onFotos={(f) => updateEquipos({ fotosRetirados: f })}
                            onSerie={(v) => { updateEquipos({ equipoRetiradoMac: v }); updateEquipos({ equipoRetiradoSn: v }); }} />

                          <EquipoRow icono={<CheckCircle className="w-4 h-4 text-emerald-500" />} titulo="¿Se activó equipo?" value={vtEquipos.seActivoEquipo} color="bg-emerald-500" dropColor="emerald"
                            fotos={vtEquipos.fotosActivos} label="Fotos de Equipo Activado" emptyText="Arrastra aquí fotos del equipo activado" placeholder={{ value: vtEquipos.routerMac + vtEquipos.routerSn, ph: 'MAC / SN del Router' }}
                            onToggle={() => { const v = !vtEquipos.seActivoEquipo; updateEquipos({ seActivoEquipo: v }); onShowToast(v ? 'Activación activada' : 'Activación desactivada'); }}
                            onFotos={(f) => updateEquipos({ fotosActivos: f })}
                            onSerie={(v) => { updateEquipos({ routerMac: v }); updateEquipos({ routerSn: v }); }} />

                          {EQUIPOS_LISTA.map((cfg) => {
                            const flagOn = vtEquipos[cfg.key];
                            const listaKey = listaDe(cfg.key);
                            const fotosKey = fotosDe(cfg.key);
                            const lista: string[] = vtEquipos[listaKey];
                            const patch = (p: Partial<VTEquiposData>) => updateEquipos(p);
                            return (
                              <div key={cfg.key} className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-2xl space-y-3">
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                  <div className="flex items-center gap-2">{cfg.icon}<span className="text-xs font-bold text-slate-800">{cfg.title}</span></div>
                                  <div className="flex items-center gap-2">
                                    <Switch value={flagOn} color={cfg.color} size="sm"
                                      onToggle={() => {
                                        const v = !flagOn;
                                        patch({ [cfg.key]: v, [listaKey]: v && lista.length === 0 ? [''] : lista } as Partial<VTEquiposData>);
                                        onShowToast(v ? `${cfg.label} activado` : `${cfg.label} desactivado`);
                                      }} />
                                    <span className={`text-[11px] font-bold ${flagOn ? cfg.color.replace('bg-', 'text-') : 'text-slate-400'}`}>{flagOn ? 'SÍ' : 'NO'}</span>
                                  </div>
                                </div>
                                {flagOn && (
                                  <div className="pt-2 border-t border-slate-200/80 space-y-2.5 animate-in fade-in duration-150">
                                    <DropZone photos={vtEquipos[fotosKey]}
                                      onDrop={handleDrop((f) => patch({ [fotosKey]: f } as Partial<VTEquiposData>), vtEquipos[fotosKey])}
                                      onDragOver={handleDragOver}
                                      onRemove={removePhoto((f) => patch({ [fotosKey]: f } as Partial<VTEquiposData>), vtEquipos[fotosKey])}
                                      onView={openViewer} color={cfg.drop} label={`Fotos de ${cfg.label}`} emptyText={`Arrastra aquí fotos del ${cfg.label}`} />
                                    <div className="flex items-center justify-between">
                                      <span className="text-[11px] font-bold text-slate-700">Series ({lista.length})</span>
                                      <button onClick={() => patch({ [listaKey]: [...lista, ''] } as Partial<VTEquiposData>)} className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold cursor-pointer border border-slate-200">
                                        <Plus className="w-3.5 h-3.5" />Agregar (+)
                                      </button>
                                    </div>
                                    <div className="space-y-2">
                                      {lista.map((serie: string, idx: number) => (
                                        <div key={idx} className="flex items-center gap-2">
                                          <div className="w-6 h-6 rounded-lg bg-slate-200 text-slate-700 text-[10px] font-black flex items-center justify-center shrink-0">#{idx + 1}</div>
                                          <input type="text" value={serie} onChange={(e) => { const n = [...lista]; n[idx] = e.target.value.toUpperCase(); patch({ [listaKey]: n } as Partial<VTEquiposData>); }}
                                            placeholder={`${cfg.ph} #${idx + 1}...`} className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400" />
                                          {lista.length > 1 && (
                                            <button onClick={() => patch({ [listaKey]: lista.filter((_: string, i: number) => i !== idx) } as Partial<VTEquiposData>)} className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}

                          <div className="pt-3.5 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/60">
                            <div className="text-[11px] text-slate-500">{vtEquipos.bloqueado ? <span className="text-emerald-800 font-bold">Asegurado.</span> : <span>Pulsa guardar.</span>}</div>
                            <SaveLockButton isLocked={!!vtEquipos.bloqueado} onSave={() => updateEquipos({ bloqueado: true })} onUnlock={() => updateEquipos({ bloqueado: false })} label="Guardar Equipos" lockedLabel="Equipos Guardados" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <button type="button" onClick={() => setActiveStep(1)} className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-bold cursor-pointer active:scale-95"><ChevronLeft className="w-4 h-4" /><span>Volver a Paso 1</span></button>
                  <button type="button" onClick={() => setActiveStep(3)} className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs cursor-pointer active:scale-95"><span>Ir a Paso 3: Cierre</span><ChevronRight className="w-4 h-4" /></button>
                </div>
              </div>
            )}

            {/* PASO 3 */}
            {activeStep === 3 && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div className="flex items-center gap-3.5 flex-wrap">
                  <div className="w-9 h-9 rounded-xl bg-amber-500 text-white font-extrabold text-lg flex items-center justify-center shrink-0 shadow-xs">3</div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight">Paso 3: Cierre y Observaciones Técnicas</h3>
                      <HoraFinalField task={task} />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                  {/* COLUMNA IZQUIERDA: Fotos Generales (siempre visible, igual que Paso 2) */}
                  <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-4.5 space-y-3.5 shadow-2xs">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2 font-bold text-slate-900 text-xs sm:text-sm"><ImageIcon className="w-4 h-4 text-slate-600" /><span>Fotos Generales</span></div>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-extrabold border border-slate-200">{fotosEvidencias.length} fotos</span>
                    </div>
                    <input ref={fileInputEvidenciasRef} type="file" accept="image/*" multiple className="hidden" onChange={handleUploadEvidencias} />
                    <button onClick={() => fileInputEvidenciasRef.current?.click()} className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-2xs">
                      <CloudUpload className="w-3.5 h-3.5" /><span>Subir fotos</span>
                    </button>
                    {fotosEvidencias.length === 0 ? (
                      <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center text-slate-400 text-xs"><p>No hay fotos generales.</p></div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3 max-h-[420px] overflow-y-auto p-1">
                        {fotosEvidencias.map((photo) => (
                          <div key={photo.id} draggable onDragStart={(e) => handleDragStart(e, photo)}
                            className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-50 cursor-grab active:cursor-grabbing hover:shadow-md transition-all">
                            <img src={photo.url} alt={photo.title} className="w-full h-24 object-cover" onClick={() => openViewer(photo)} />
                            <div className="p-1.5 bg-white"><p className="text-[11px] font-bold text-slate-800 truncate">{photo.title}</p></div>
                            <button onClick={() => onUpdateTask({ fotosEvidencias: fotosEvidencias.filter((p) => p.id !== photo.id) })}
                              className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-red-600 rounded-md text-white opacity-0 group-hover:opacity-100">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* COLUMNA DERECHA: Evidencias de finalización + formulario */}
                  <div className="lg:col-span-7 space-y-5">
                  <div className="bg-white border border-slate-200/90 rounded-2xl p-4.5 space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2 font-bold text-slate-900 text-xs sm:text-sm"><ImageIcon className="w-4 h-4 text-slate-600" /><span>Evidencias de finalización</span></div>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-extrabold border border-slate-200">{vtPaso3.fotosEvidencias.length} fotos</span>
                    </div>
                    <DropZone photos={vtPaso3.fotosEvidencias} onDrop={handleDrop((p) => updatePaso3({ fotosEvidencias: p }), vtPaso3.fotosEvidencias)}
                      onDragOver={handleDragOver} onRemove={removePhoto((p) => updatePaso3({ fotosEvidencias: p }), vtPaso3.fotosEvidencias)}
                      onView={openViewer} color="amber" label="Fotos de evidencia final" emptyText="Arrastra las evidencias finales desde el Paso 2" />
                  </div>

                  {/* Formulario (debajo) */}
                  <div className="bg-white border border-slate-200/90 rounded-2xl p-4.5 space-y-4 shadow-2xs">
                    <div className="space-y-3.5">
                      <div>
                        <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mb-1"><AlertTriangle className="w-3.5 h-3.5 text-amber-500" />Causa de Daño</label>
                        <select value={vtPaso3.causaDaño} onChange={(e) => updatePaso3({ causaDaño: e.target.value })} className="w-full text-xs font-medium text-slate-800 bg-white border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-amber-500/20 cursor-pointer shadow-2xs">
                          <option value="">Seleccione...</option>
                          <option value="Cable Dañado">Cable Dañado</option><option value="Conector Sucio">Conductor Sucio</option>
                          <option value="Baja Potencia">Baja Potencia</option><option value="Equipo Defectuoso">Equipo Defectuoso</option>
                          <option value="Sin Servicio ONT">Sin Servicio ONT</option><option value="Otro">Otro</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mb-1"><Activity className="w-3.5 h-3.5 text-orange-500" />Grado de Afectación</label>
                        <select value={vtPaso3.gradoAfectacion} onChange={(e) => updatePaso3({ gradoAfectacion: e.target.value })} className="w-full text-xs font-medium text-slate-800 bg-white border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-amber-500/20 cursor-pointer shadow-2xs">
                          <option value="">Seleccione...</option><option value="Leve">Leve</option><option value="Moderado">Moderado</option>
                          <option value="Severo">Severo</option><option value="Crítico">Crítico</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mb-1"><Search className="w-3.5 h-3.5 text-blue-500" />Diagnóstico</label>
                        <select value={vtPaso3.diagnostico} onChange={(e) => updatePaso3({ diagnostico: e.target.value })} className="w-full text-xs font-medium text-slate-800 bg-white border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-amber-500/20 cursor-pointer shadow-2xs">
                          <option value="">Seleccione...</option><option value="Atenuación Patch Cord">Atenuación Patch Cord</option>
                          <option value="Conector Sucio">Conector Sucio</option><option value="Splitter Dañado">Splitter Dañado</option>
                          <option value="Fibra Cortada">Fibra Cortada</option><option value="ONT Sin Luz">ONT Sin Luz</option>
                          <option value="Sin Avería">Sin Avería</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mb-1"><Wrench className="w-3.5 h-3.5 text-emerald-500" />Solución</label>
                        <select value={vtPaso3.solucion} onChange={(e) => updatePaso3({ solucion: e.target.value })} className="w-full text-xs font-medium text-slate-800 bg-white border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-amber-500/20 cursor-pointer shadow-2xs">
                          <option value="">Seleccione...</option><option value="Limpieza Conector">Limpieza Conector</option>
                          <option value="Cambio Patchcord">Cambio Patchcord</option><option value="Refusión NAP">Refusión NAP</option>
                          <option value="Cambio Splitter">Cambio Splitter</option><option value="Reconexión Fibra">Reconexión Fibra</option>
                          <option value="Sin Solución">Sin Solución</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mb-1"><DollarSign className="w-3.5 h-3.5 text-emerald-600" />Tipo de Pago</label>
                        <select value={selectedTipoPago} onChange={(e) => handleTipoPagoChange(e.target.value)} className="w-full text-xs font-medium text-slate-800 bg-white border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-amber-500/20 cursor-pointer shadow-2xs">
                          <option value="">Seleccione...</option><option value="Sin Costo / Garantía">Sin Costo / Garantía (S/ 0.00)</option>
                          <option value="Efectivo">Efectivo</option><option value="Yape / Plin">Yape / Plin</option><option value="Transferencia">Transferencia</option>
                        </select>
                      </div>
                      <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50 text-center space-y-1">
                        <span className="text-[11px] font-bold text-slate-500 block">Precio</span>
                        <div className="text-xs sm:text-sm italic text-slate-600 font-medium">
                          {selectedTipoPago ? <span className="font-extrabold font-mono text-slate-900 not-italic text-base">{precio || 'S/ 0.00'}</span> : 'Elegí un tipo de pago'}
                        </div>
                      </div>
                    </div>
                    <button onClick={handleGuardarCierre} className="w-full flex items-center justify-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-extrabold py-3 px-4 rounded-xl text-xs sm:text-sm transition-all shadow-md active:scale-[0.99] cursor-pointer">
                      <Save className="w-4 h-4" /><span>Guardar Cierre</span>
                    </button>
                  </div>
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-200 flex items-center justify-start">
                  <button type="button" onClick={() => setActiveStep(2)} className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-bold cursor-pointer active:scale-95"><ChevronLeft className="w-4 h-4" /><span>Volver a Paso 2</span></button>
                </div>
              </div>
            )}
          </div>

          {/* Bottom pill */}
          <div className="h-10 bg-slate-100/80 border border-slate-200 rounded-full flex items-center justify-between px-6 text-xs text-slate-500 mt-5 shadow-2xs">
            <span className="font-medium text-[11px]">Orden Odoo #{task.nroTicket} · DNI {task.dni} · {task.nombre}</span>
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-semibold text-slate-600">Paso {activeStep} de 3</span>
              <div className="flex items-center gap-1.5">
                <button disabled={activeStep === 1} onClick={() => setActiveStep((prev) => (prev > 1 ? ((prev - 1) as any) : prev))} className="px-2 py-0.5 rounded text-[10px] font-bold bg-white border border-slate-200 text-slate-700 disabled:opacity-40 cursor-pointer">Anterior</button>
                <button disabled={activeStep === 3} onClick={() => setActiveStep((prev) => (prev < 3 ? ((prev + 1) as any) : prev))} className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-white disabled:opacity-40 cursor-pointer">Siguiente</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PhotoLightboxViewer isOpen={viewerState.isOpen} photos={viewerState.photos} initialIndex={viewerState.initialIndex}
        onClose={() => setViewerState((prev) => ({ ...prev, isOpen: false }))} />

      <TecnicoEjecucionVisitaModal
        isOpen={isEjecucionModalOpen}
        onClose={() => setIsEjecucionModalOpen(false)}
        onSave={(payload) => {
          const isFull = !Array.isArray(payload);
          const photos = isFull ? payload.photos : payload;
          const installed = isFull ? (payload as GuardarEjecucionVisitaPayload).equiposInstalados : [];

          const updates: Partial<TaskData> = {
            fotosEvidencias: [...(photos || []), ...fotosEvidencias],
            pasos: { ...task.pasos, paso2: 'Completado' },
          };
          if (installed && installed.length > 0) {
            const ont = installed.find((eq) => eq.tipo === 'Router ONT');
            const deco = installed.find((eq) => eq.tipo === 'Decodificador TV');
            const rep = installed.find((eq) => eq.tipo === 'Repetidor Wi-Fi');
            if (ont) {
              updates.datoOnt = `${ont.marca} ${ont.modelo}`.trim();
              updates.macNoc = ont.mac;
            }
            if (rep) {
              updates.marcaRepetidor = rep.marca;
              updates.nroRepetidor = rep.sn;
            }
            if (deco) {
              updates.macTv = deco.mac;
            }
          }
          onUpdateTask(updates);
          onShowToast('Ejecución de visita registrada correctamente con stock técnico');
        }}
      />
    </div>
  );
};