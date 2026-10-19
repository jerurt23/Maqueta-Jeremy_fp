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
  Maximize2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Router,
  Tv,
  Wifi,
  Package,
  Save as SaveIcon,
} from 'lucide-react';
import { TaskData, PhotoEvidence, RTRetiroData, RTPaso3Data, RTEstadoRetiro, RTEquipoRetirado } from '../../types/task';
import { SAMPLE_PHOTOS } from '../../data/mockData';
import { PhotoLightboxViewer } from './PhotoLightboxViewer';
import { Switch, SectionHeader, DropZone, SaveLockButton, HoraFinalField, formatFechaHoraFin } from './wizardShared';

interface RetiroModalProps {
  task: TaskData;
  isOpen: boolean;
  initialStep?: 1 | 2 | 3;
  onClose: () => void;
  onUpdateTask: (updated: Partial<TaskData>) => void;
  onShowToast: (message: string) => void;
  onSelectActividad: (act: 'I' | 'VT' | 'R') => void;
}

const eqVacio: RTEquipoRetirado = { retirado: false, serieMac: '', fotos: [] };

export const RetiroModal: React.FC<RetiroModalProps> = ({
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
  const [isExpanded, setIsExpanded] = useState(true);
  const [viewerState, setViewerState] = useState<{
    isOpen: boolean;
    photos: PhotoEvidence[];
    initialIndex: number;
  }>({ isOpen: false, photos: [], initialIndex: 0 });

  const rtRetiro: RTRetiroData = task.rtRetiro || {
    activo: true,
    router: { ...eqVacio, serieMac: task.datoOnt || '', retirado: !!task.datoOnt },
    deco: { ...eqVacio, serieMac: task.macTv || '', retirado: !!task.macTv },
    repetidor: { ...eqVacio, serieMac: task.nroRepetidor || '', retirado: !!task.nroRepetidor },
    bloqueado: false,
  };

  const rtPaso3: RTPaso3Data = task.rtPaso3 || {
    retiroEquipo: 'No',
    fotosEvidencias: [],
    bloqueado: false,
  };

  const fotosFachada = task.fotosFachada || [];
  const fotosEvidencias = task.fotosEvidencias || [];
  const fileInputFachadaRef = useRef<HTMLInputElement>(null);
  const fileInputEvidenciasRef = useRef<HTMLInputElement>(null);

  const hoy = useMemo(
    () =>
      new Date().toLocaleDateString('es-PE', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
    []
  );

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
    add(rtRetiro.router.fotos);
    add(rtRetiro.deco.fotos);
    add(rtRetiro.repetidor.fotos);
    add(rtPaso3.fotosEvidencias);
    return list;
  }, [fotosFachada, fotosEvidencias, rtRetiro.router.fotos, rtRetiro.deco.fotos, rtRetiro.repetidor.fotos, rtPaso3.fotosEvidencias]);

  const openViewer = (target: PhotoEvidence | string) => {
    const url = typeof target === 'string' ? target : target.url;
    let idx = allPhotos.findIndex((p) => p.url === url);
    if (idx === -1) idx = 0;
    setViewerState({ isOpen: true, photos: allPhotos, initialIndex: idx });
  };

  const updateRetiro = (patch: Partial<RTRetiroData>) => onUpdateTask({ rtRetiro: { ...rtRetiro, ...patch } });
  const updatePaso3 = (patch: Partial<RTPaso3Data>) => onUpdateTask({ rtPaso3: { ...rtPaso3, ...patch } });

  const updateEquipo = (key: 'router' | 'deco' | 'repetidor', patch: Partial<RTEquipoRetirado>) =>
    updateRetiro({ [key]: { ...rtRetiro[key], ...patch } } as Partial<RTRetiroData>);

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
      } catch {
        /* fallback */
      }
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
  const paso2Ok =
    task.pasos.paso2 === 'Completado' ||
    rtRetiro.router.retirado ||
    rtRetiro.deco.retirado ||
    rtRetiro.repetidor.retirado;
  const paso3Ok = task.pasos.paso3 === 'Completado' || !!task.pagoInfo?.registrado;

  const stepOk = (n: 1 | 2 | 3) => (n === 1 ? paso1Ok : n === 2 ? paso2Ok : paso3Ok);

  const handleTipoPagoChange = (tipo: string) => {
    setSelectedTipoPago(tipo);
    if (tipo === 'Sin Costo / Garantía') setPrecio('S/ 0.00');
    else if (tipo === 'Efectivo' || tipo === 'Yape / Plin' || tipo === 'Transferencia') setPrecio('S/ 50.00');
    else if (tipo === 'Cargo en Recibo') setPrecio('S/ 60.00');
    else setPrecio('');
  };

  const handleGuardarCierre = () => {
    if (!selectedTipoPago) {
      onShowToast('Selecciona un tipo de pago para cerrar la orden');
      return;
    }
    const equiposRetirados = (
      [
        rtRetiro.router.retirado && `Router (${rtRetiro.router.serieMac || 'sin SN/MAC'})`,
        rtRetiro.deco.retirado && `Deco (${rtRetiro.deco.serieMac || 'sin SN/MAC'})`,
        rtRetiro.repetidor.retirado && `Repetidor (${rtRetiro.repetidor.serieMac || 'sin SN/MAC'})`,
      ].filter(Boolean) as string[]
    ).join(', ');

    const nowLog = {
      id: `cierre-r-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
      user: task.tecAsignado !== 'Sin Asignar' ? task.tecAsignado : 'Admin Ops',
      action: 'Cierre de Retiro de Equipos',
      details: `Retiro: ${rtPaso3.retiroEquipo} · Equipos: ${
        equiposRetirados || 'ninguno'
      } · Pago: ${selectedTipoPago} (${precio || 'S/ 0.00'})`,
    };

    onUpdateTask({
      pagoInfo: { tipoPago: selectedTipoPago, precio: precio || 'S/ 0.00', registrado: true },
      estado: 'LIQUIDADO',
      horaFin: formatFechaHoraFin(),
      pasos: { ...task.pasos, paso3: 'Completado' },
      cambiosRegistrados: [nowLog, ...(task.cambiosRegistrados || [])],
    });
    onShowToast('Cierre de Retiro guardado con éxito');
  };

  const handleUploadFachada = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        const newPhoto: PhotoEvidence = {
          id: `fachada-r-${Date.now()}`,
          title: file.name.replace(/\.[^/.]+$/, ''),
          url: result,
          type: 'fachada',
          timestamp: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
          category: 'Foto Fachada',
        };
        const nowTime = new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
        onUpdateTask({
          fotosFachada: [newPhoto, ...fotosFachada],
          fachadaUrl: result,
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
          newItems.push({
            id: `ev-r-${Date.now()}-${idx}`,
            title: file.name.replace(/\.[^/.]+$/, ''),
            url: result,
            type: 'general',
            timestamp: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
            category: 'Evidencia General',
          });
          if (newItems.length === files.length) {
            onUpdateTask({
              fotosEvidencias: [...newItems, ...fotosEvidencias],
              pasos: { ...task.pasos, paso2: 'Completado' },
            });
            onShowToast(`${files.length} foto(s) subida(s)`);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  /** Resumen de que equipo se retire exactamente. */
  const resumenRetiro = useMemo(() => {
    const filas: Array<{ etiqueta: string; serie: string; activo: boolean }> = [
      { etiqueta: 'Router', serie: rtRetiro.router.serieMac, activo: rtRetiro.router.retirado },
      { etiqueta: 'Deco', serie: rtRetiro.deco.serieMac, activo: rtRetiro.deco.retirado },
      { etiqueta: 'Repetidor', serie: rtRetiro.repetidor.serieMac, activo: rtRetiro.repetidor.retirado },
    ];
    const retirados = filas.filter((f) => f.activo);
    return { filas, retirados };
  }, [rtRetiro.router, rtRetiro.deco, rtRetiro.repetidor]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0 gap-4 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-rose-900/10 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-rose-900" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-extrabold text-[#0f172a] text-lg tracking-tight">Ejecución y Validación de Tarea</h2>
                <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-xs font-mono font-bold">{task.nroTicket}</span>
              </div>
              <p className="text-xs text-slate-500 font-medium truncate">{task.nombre} · {task.direccion}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl border border-slate-200 shadow-2xs">
              <button
                type="button"
                onClick={() => onSelectActividad('I')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer bg-white text-slate-600 hover:text-blue-600 border border-slate-200"
              >
                <span className="w-5 h-5 rounded-lg flex items-center justify-center text-[11px] font-black bg-slate-200 text-slate-700">I</span>
                <span className="hidden sm:inline">INSTALACIÓN</span>
              </button>
              <button
                type="button"
                onClick={() => onSelectActividad('VT')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer bg-white text-slate-600 hover:text-amber-600 border border-slate-200"
              >
                <span className="w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-black bg-slate-200 text-slate-700">VT</span>
                <span className="hidden sm:inline">VISITA TÉCNICA</span>
              </button>
              <button
                type="button"
                onClick={() => onSelectActividad('R')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer bg-rose-600 text-white shadow-sm ring-2 ring-rose-400"
              >
                <span className="w-5 h-5 rounded-lg flex items-center justify-center text-[11px] font-black bg-white text-rose-700">R</span>
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
              <button
                key={step}
                onClick={() => setActiveStep(step as 1 | 2 | 3)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer border ${
                  activeStep === step
                    ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                }`}
              >
                {step === 1 && <Camera className="w-4 h-4 shrink-0" />}
                {step === 2 && <Package className="w-4 h-4 shrink-0" />}
                {step === 3 && <FileText className="w-4 h-4 shrink-0" />}
                <span>
                  Paso {step}: {step === 1 ? 'Fachada' : step === 2 ? 'Equipos Retirados' : 'Cierre y Obs.'}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ml-1 ${
                    stepOk(step as 1 | 2 | 3) ? 'bg-emerald-600 text-white' : 'bg-slate-600 text-white'
                  }`}
                >
                  {stepOk(step as 1 | 2 | 3) ? 'OK' : 'Pendiente'}
                </span>
              </button>
            ))}
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-xs font-black shrink-0">
            ACTIVIDAD: R · RETIRO
          </span>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-slate-50/50">
          <div className="bg-white border-2 border-rose-500 rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
            {/* PASO 1: FACHADA */}
            {activeStep === 1 && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-rose-600 text-white font-extrabold text-lg flex items-center justify-center shrink-0 shadow-xs">
                    1
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight">
                      Paso 1: Foto de Fachada / Inicio
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">Registro de fecha, hora de inicio y foto de fachada</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-white border border-slate-200/90 rounded-2xl p-4 flex items-center justify-between text-xs sm:text-sm shadow-2xs">
                    <div className="flex items-center gap-2 font-bold text-slate-800">
                      <Clock className="w-4 h-4 text-slate-500" />
                      <span>Hora de inicio</span>
                    </div>
                    <span className="font-bold text-slate-700">
                      {task.horaInicio && task.horaInicio !== 'No iniciada' ? task.horaInicio : 'Pendiente'}
                    </span>
                  </div>
                  <div className="bg-white border border-slate-200/90 rounded-2xl p-4 flex items-center justify-between text-xs sm:text-sm shadow-2xs">
                    <div className="flex items-center gap-2 font-bold text-slate-800">
                      <FileText className="w-4 h-4 text-slate-500" />
                      <span>Fecha de inicio</span>
                    </div>
                    <span className="font-bold text-slate-700 capitalize">{hoy}</span>
                  </div>
                </div>

                <div className="bg-white border border-slate-200/90 rounded-2xl p-4.5 space-y-4 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-slate-900 text-xs sm:text-sm">
                      <Camera className="w-4 h-4 text-slate-600" />
                      <span>Foto de Fachada</span>
                    </div>
                    <button
                      onClick={() => fileInputFachadaRef.current?.click()}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-2xs"
                    >
                      <CloudUpload className="w-3.5 h-3.5" />
                      <span>Subir Foto</span>
                    </button>
                  </div>
                  <input ref={fileInputFachadaRef} type="file" accept="image/*" className="hidden" onChange={handleUploadFachada} />

                  {fotosFachada.length === 0 ? (
                    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center flex flex-col items-center justify-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <Camera className="w-6 h-6" />
                      </div>
                      <p className="text-slate-500 text-xs sm:text-sm font-medium">
                        No hay foto de fachada registrada para esta tarea.
                      </p>
                      <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                        <span className="text-[11px] font-bold text-slate-400">Imágenes de ejemplo:</span>
                        {SAMPLE_PHOTOS.fachada.map((s, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              const p: PhotoEvidence = {
                                id: `sf-r-${Date.now()}`,
                                title: s.title,
                                url: s.url,
                                type: 'fachada',
                                timestamp: '',
                                category: s.category,
                              };
                              onUpdateTask({
                                fotosFachada: [p, ...fotosFachada],
                                pasos: { ...task.pasos, paso1: 'Completado' },
                              });
                            }}
                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 rounded-lg text-xs font-semibold cursor-pointer"
                          >
                            <Sparkles className="w-3 h-3 text-rose-500 inline mr-1" />
                            {s.title.slice(0, 26)}...
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {fotosFachada.map((photo) => (
                        <div key={photo.id} className="relative group rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-sm">
                          <img
                            src={photo.url}
                            alt={photo.title}
                            className="w-full h-44 object-cover cursor-pointer"
                            onClick={() => openViewer(photo)}
                          />
                          <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 via-black/40 to-transparent p-3 text-white flex items-center justify-between">
                            <div>
                              <p className="text-xs font-bold truncate max-w-[200px]">{photo.title}</p>
                              <span className="text-[10px] text-slate-300">{photo.timestamp}</span>
                            </div>
                            <div className="flex gap-1.5">
                              <button onClick={() => openViewer(photo.url)} className="p-1.5 bg-white/20 hover:bg-white/40 rounded-lg text-white">
                                <Maximize2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() =>
                                  onUpdateTask({
                                    fotosFachada: fotosFachada.filter((f) => f.id !== photo.id),
                                    pasos: { ...task.pasos, paso1: fotosFachada.length > 1 ? 'Completado' : 'Pendiente' },
                                  })
                                }
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

                <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">Paso 1 de 3</span>
                  <button
                    type="button"
                    onClick={() => setActiveStep(2)}
                    className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer active:scale-95"
                  >
                    <span>Ir a Paso 2: Equipos Retirados</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* PASO 2: EQUIPOS RETIRADOS */}
            {activeStep === 2 && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-rose-600 text-white font-extrabold text-lg flex items-center justify-center shrink-0 shadow-xs">
                    2
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight">
                      Paso 2: Equipos Retirados
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Activa cada equipo retirado, arrastra sus fotos y registra el SN o MAC
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                  {/* Fotos Generales fuente */}
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
                    <button
                      onClick={() => fileInputEvidenciasRef.current?.click()}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-2xs"
                    >
                      <CloudUpload className="w-3.5 h-3.5" />
                      <span>Subir fotos</span>
                    </button>
                    {fotosEvidencias.length === 0 ? (
                      <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center text-slate-400 text-xs">
                        <p>No hay fotos generales.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3 max-h-[420px] overflow-y-auto p-1">
                        {fotosEvidencias.map((photo) => (
                          <div
                            key={photo.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, photo)}
                            className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-50 cursor-grab active:cursor-grabbing hover:shadow-md transition-all"
                          >
                            <img src={photo.url} alt={photo.title} className="w-full h-24 object-cover" onClick={() => openViewer(photo)} />
                            <div className="p-1.5 bg-white">
                              <p className="text-[11px] font-bold text-slate-800 truncate">{photo.title}</p>
                            </div>
                            <button
                              onClick={() => onUpdateTask({ fotosEvidencias: fotosEvidencias.filter((p) => p.id !== photo.id) })}
                              className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-red-600 rounded-md text-white opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 3 equipos con switch */}
                  <div className="lg:col-span-7 space-y-4">
                    {rtRetiro.bloqueado && (
                      <div className="p-2.5 px-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                        <span className="text-emerald-800 font-bold flex items-center gap-2">
                          <SaveIcon className="w-3.5 h-3.5" />
                          Registro de equipos retirado guardado y protegido.
                        </span>
                        <button
                          onClick={() => updateRetiro({ bloqueado: false })}
                          className="px-2 py-0.5 bg-white border border-emerald-300 rounded-lg text-[10px] font-extrabold cursor-pointer"
                        >
                          Desbloquear
                        </button>
                      </div>
                    )}

                    {(
                      [
                        { key: 'router' as const, icon: <Router className="w-4 h-4 text-rose-600" />, label: 'Router', color: 'rose', ph: 'MAC o SN del Router' },
                        { key: 'deco' as const, icon: <Tv className="w-4 h-4 text-blue-600" />, label: 'Deco', color: 'blue', ph: 'MAC o SN del Decodificador' },
                        { key: 'repetidor' as const, icon: <Wifi className="w-4 h-4 text-purple-600" />, label: 'Repetidor', color: 'purple', ph: 'MAC o SN del Repetidor' },
                      ]
                    ).map(({ key, icon, label, color, ph }) => {
                      const eq = rtRetiro[key];
                      const swColor = color === 'rose' ? 'bg-rose-600' : color === 'blue' ? 'bg-blue-600' : 'bg-purple-600';
                      return (
                        <div key={key} className="bg-white border-2 border-rose-500/30 rounded-2xl p-5 space-y-4 shadow-sm">
                          <div className="flex items-center justify-between gap-2 flex-wrap pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <div className="flex items-center gap-2 font-extrabold text-[#0f172a] text-sm sm:text-base">
                                {icon}
                                <span>¿Se retiró {label}?</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Switch
                                  value={eq.retirado}
                                  color={swColor}
                                  size="sm"
                                  onToggle={() => {
                                    const v = !eq.retirado;
                                    updateEquipo(key, { retirado: v });
                                    onShowToast(v ? `${label} marcado como retirado` : `${label} desmarcado`);
                                  }}
                                />
                                <span className={`text-[11px] font-extrabold ${eq.retirado ? swColor.replace('bg-', 'text-').replace('-600', '-600') : 'text-slate-400'}`}>
                                  {eq.retirado ? 'SÍ' : 'NO'}
                                </span>
                              </div>
                            </div>
                            <span
                              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                                eq.retirado ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                              }`}
                            >
                              {eq.retirado ? 'Retirado' : 'No retirado'}
                            </span>
                          </div>

                          {eq.retirado && (
                            <div className="space-y-3 animate-in fade-in duration-150">
                              <DropZone
                                photos={eq.fotos}
                                onDrop={handleDrop((photos) => updateEquipo(key, { fotos: photos }), eq.fotos)}
                                onDragOver={handleDragOver}
                                onRemove={removePhoto((photos) => updateEquipo(key, { fotos: photos }), eq.fotos)}
                                onView={openViewer}
                                color={color}
                                label={`Fotos del ${label} Retirado`}
                                emptyText={`Arrastra aquí fotos del ${label.toLowerCase()} retirado`}
                              />
                              <div className="space-y-1">
                                <label className="text-[11px] font-bold text-slate-600 block">SN / MAC del {label}:</label>
                                <input
                                  type="text"
                                  value={eq.serieMac}
                                  onChange={(e) => updateEquipo(key, { serieMac: e.target.value.toUpperCase() })}
                                  placeholder={ph}
                                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-400"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    <div className="pt-3.5 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/60">
                      <div className="text-[11px] text-slate-500">
                        {rtRetiro.bloqueado ? (
                          <span className="text-emerald-800 font-bold">Asegurado. Pulsa Desbloquear para editar.</span>
                        ) : (
                          <span>Pulsa guardar para asegurar el registro de equipos retirados.</span>
                        )}
                      </div>
                      <SaveLockButton
                        isLocked={!!rtRetiro.bloqueado}
                        onSave={() => updateRetiro({ bloqueado: true })}
                        onUnlock={() => updateRetiro({ bloqueado: false })}
                        label="Guardar Equipos Retirados"
                        lockedLabel="Equipos Guardados"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveStep(1)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-bold cursor-pointer active:scale-95"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Volver a Paso 1</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveStep(3)}
                    className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer active:scale-95"
                  >
                    <span>Ir a Paso 3: Cierre</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* PASO 3: CIERRE */}
            {activeStep === 3 && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div className="flex items-center gap-3.5 flex-wrap">
                  <div className="w-9 h-9 rounded-xl bg-rose-600 text-white font-extrabold text-lg flex items-center justify-center shrink-0 shadow-xs">
                    3
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight">
                        Paso 3: Cierre y Observaciones Técnicas
                      </h3>
                      <HoraFinalField task={task} />
                    </div>
                    <p className="text-xs text-slate-500 font-medium">Detalles de cierre y liquidación del retiro</p>
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
                    <button
                      onClick={() => fileInputEvidenciasRef.current?.click()}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-2xs"
                    >
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
                            <img src={photo.url} alt={photo.title} className="w-full h-24 object-cover" onClick={() => openViewer(photo)} />
                            <div className="p-1.5 bg-white">
                              <p className="text-[11px] font-bold text-slate-800 truncate">{photo.title}</p>
                            </div>
                            <button onClick={() => onUpdateTask({ fotosEvidencias: fotosEvidencias.filter((p) => p.id !== photo.id) })}
                              className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-red-600 rounded-md text-white opacity-0 group-hover:opacity-100">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* COLUMNA DERECHA: Evidencias de finalización + Retiro de Equipo + Pago */}
                  <div className="lg:col-span-7 space-y-5">
                  <div className="bg-white border border-slate-200/90 rounded-2xl p-4.5 space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2 font-bold text-slate-900 text-xs sm:text-sm">
                        <ImageIcon className="w-4 h-4 text-slate-600" />
                        <span>Evidencias de finalización</span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-extrabold border border-slate-200">
                        {rtPaso3.fotosEvidencias.length} fotos
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Las mismas evidencias del Paso 2. Arrastra aquí las fotos finales de la entrega.
                    </p>
                    <DropZone
                      photos={rtPaso3.fotosEvidencias}
                      onDrop={handleDrop((photos) => updatePaso3({ fotosEvidencias: photos }), rtPaso3.fotosEvidencias)}
                      onDragOver={handleDragOver}
                      onRemove={removePhoto((photos) => updatePaso3({ fotosEvidencias: photos }), rtPaso3.fotosEvidencias)}
                      onView={openViewer}
                      color="rose"
                      label="Fotos de evidencia final"
                      emptyText="Arrastra las evidencias finales desde el Paso 2"
                    />
                  </div>

                  {/* Retiro de Equipo + Pago (debajo) */}
                  <div className="bg-white border border-slate-200/90 rounded-2xl p-4.5 space-y-4 shadow-2xs">
                    {/* Retiro de Equipo: SI / No / NRE */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2 font-bold text-slate-900 text-xs sm:text-sm">
                          <Package className="w-4 h-4 text-rose-600" />
                          <span>Retiro de Equipo</span>
                        </div>
                        <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg border border-slate-200">
                          {(['SI', 'No', 'NRE'] as RTEstadoRetiro[]).map((op) => (
                            <button
                              key={op}
                              type="button"
                              onClick={() => updatePaso3({ retiroEquipo: op })}
                              className={`px-2.5 py-1 rounded-md text-[11px] font-extrabold transition-all cursor-pointer ${
                                rtPaso3.retiroEquipo === op
                                  ? 'bg-rose-600 text-white shadow-xs'
                                  : 'bg-white text-slate-600 hover:bg-rose-50'
                              }`}
                            >
                              {op}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Detalle exacto de que se retiro */}
                      <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 space-y-2">
                        <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wide block">
                          Equipos retirados registrados
                        </span>
                        {resumenRetiro.retirados.length === 0 ? (
                          <p className="text-[11px] text-slate-500 italic">
                            No hay equipos marcados como retirados en el Paso 2.
                          </p>
                        ) : (
                          <div className="space-y-1.5">
                            {resumenRetiro.retirados.map((f) => (
                              <div key={f.etiqueta} className="flex items-center gap-2 flex-wrap">
                                <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-extrabold shrink-0">
                                  {f.etiqueta.toUpperCase()}
                                </span>
                                <span className="text-[11px] font-mono font-bold text-slate-700">
                                  {f.serie || 'SIN SN/MAC'}
                                </span>
                                {!f.serie && (
                                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5">
                                    Pendiente de registro
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Tipo de Pago */}
                    <div className="space-y-1.5">
                      <label className="flex items-center gap-2 font-bold text-slate-900 text-xs sm:text-sm">
                        <DollarSign className="w-4 h-4 text-emerald-600" />
                        <span>Tipo de Pago</span>
                      </label>
                      <select
                        value={selectedTipoPago}
                        onChange={(e) => handleTipoPagoChange(e.target.value)}
                        className="w-full text-xs font-medium text-slate-800 bg-white border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 cursor-pointer shadow-2xs"
                      >
                        <option value="">Seleccione...</option>
                        <option value="Sin Costo / Garantía">Sin Costo / Garantía (S/ 0.00)</option>
                        <option value="Efectivo">Efectivo</option>
                        <option value="Yape / Plin">Yape / Plin</option>
                        <option value="Transferencia">Transferencia Bancaria</option>
                        <option value="Cargo en Recibo">Cargo en Recibo</option>
                      </select>
                    </div>

                    {/* Precio */}
                    <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50 text-center space-y-1">
                      <span className="text-[11px] font-bold text-slate-500 block">Precio</span>
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

                <div className="pt-4 border-t border-slate-200 flex items-center justify-start">
                  <button
                    type="button"
                    onClick={() => setActiveStep(2)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-bold cursor-pointer active:scale-95"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Volver a Paso 2: Equipos Retirados</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bottom pill */}
          <div className="h-10 bg-slate-100/80 border border-slate-200 rounded-full flex items-center justify-between px-6 text-xs text-slate-500 mt-5 shadow-2xs">
            <span className="font-medium text-[11px]">
              Orden Odoo #{task.nroTicket} · DNI {task.dni} · {task.nombre}
            </span>
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-semibold text-slate-600">Paso {activeStep} de 3</span>
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
                  className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white disabled:opacity-40 cursor-pointer"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PhotoLightboxViewer
        isOpen={viewerState.isOpen}
        photos={viewerState.photos}
        initialIndex={viewerState.initialIndex}
        onClose={() => setViewerState((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};