import React, { useState, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Camera,
  ClipboardList,
  Trash2,
  CheckCircle2,
  Search,
  Package,
  Router,
  Plus,
  Minus,
  Check,
  Sparkles,
  Layers,
  CheckCircle,
  Eye,
} from 'lucide-react';
import { PhotoEvidence } from '../../types/task';
import {
  SAMPLE_PHOTOS,
  STOCK_TECNICO_MATERIALES,
  STOCK_TECNICO_EQUIPOS,
  TecnicoStockEquipo,
} from '../../data/mockData';

export interface GuardarEjecucionVisitaPayload {
  photos: PhotoEvidence[];
  fotosMateriales: PhotoEvidence[];
  materialesUtilizados: Record<string, number>;
  fotosEquipos: PhotoEvidence[];
  equiposInstalados: TecnicoStockEquipo[];
}

interface TecnicoEjecucionVisitaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: PhotoEvidence[] | GuardarEjecucionVisitaPayload) => void;
  initialPhotos?: PhotoEvidence[];
}

export const TecnicoEjecucionVisitaModal: React.FC<TecnicoEjecucionVisitaModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialPhotos = [],
}) => {
  // Active view tab inside modal
  const [activeSubTab, setActiveSubTab] = useState<'todos' | 'materiales' | 'equipos'>('todos');

  // Subcontainer 1: Materiales Utilizados
  const [fotosMateriales, setFotosMateriales] = useState<PhotoEvidence[]>([]);
  const [materialSearch, setMaterialSearch] = useState<string>('');
  const [materialesUtilizados, setMaterialesUtilizados] = useState<Record<string, number>>({
    'stm-1': 2, // Conector mecánico SC/APC (2 usados por defecto)
    'stm-2': 1, // Roseta óptica FTTH (1 usada por defecto)
  });

  // Subcontainer 2: Equipos Instalados
  const [fotosEquipos, setFotosEquipos] = useState<PhotoEvidence[]>([]);
  const [equipoSearch, setEquipoSearch] = useState<string>('');
  const [selectedEquiposIds, setSelectedEquiposIds] = useState<string[]>([
    'ste-1', // Huawei 6 wifi (SN: 4857544397BBAFB, MAC: 68962ECA0ABE)
  ]);

  // File input refs
  const fileInputMaterialesRef = useRef<HTMLInputElement>(null);
  const fileInputEquiposRef = useRef<HTMLInputElement>(null);

  // Photo handlers
  const handleMaterialesPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newPhotos: PhotoEvidence[] = Array.from(files).map((file, idx) => ({
      id: `vt-mat-pic-${Date.now()}-${idx}`,
      url: URL.createObjectURL(file),
      timestamp: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
      title: file.name,
      type: 'materiales',
      category: 'Materiales Utilizados',
    }));

    setFotosMateriales((prev) => [...prev, ...newPhotos]);
  };

  const handleEquiposPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newPhotos: PhotoEvidence[] = Array.from(files).map((file, idx) => ({
      id: `vt-eq-pic-${Date.now()}-${idx}`,
      url: URL.createObjectURL(file),
      timestamp: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
      title: file.name,
      type: 'equipos',
      category: 'Equipos Instalados',
    }));

    setFotosEquipos((prev) => [...prev, ...newPhotos]);
  };

  // Sample photo helpers
  const handleAddSampleMaterial = () => {
    const newPhoto: PhotoEvidence = {
      id: `sample-mat-${Date.now()}`,
      url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
      timestamp: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
      title: 'Conector SC/APC y Roseta Instalada',
      type: 'materiales',
      category: 'Materiales Utilizados',
    };
    setFotosMateriales((prev) => [...prev, newPhoto]);
  };

  const handleAddSampleEquipo = () => {
    const newPhoto: PhotoEvidence = {
      id: `sample-eq-${Date.now()}`,
      url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80',
      timestamp: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
      title: 'Router Huawei 6 SN: 4857544397BBAFB',
      type: 'equipos',
      category: 'Equipos Instalados',
    };
    setFotosEquipos((prev) => [...prev, newPhoto]);
  };

  // Material counters
  const handleMaterialDelta = (matId: string, delta: number, maxStock: number) => {
    setMaterialesUtilizados((prev) => {
      const current = prev[matId] || 0;
      const next = Math.max(0, Math.min(maxStock, current + delta));
      return { ...prev, [matId]: next };
    });
  };

  // Toggle equipment installation
  const handleToggleEquipo = (equipoId: string) => {
    setSelectedEquiposIds((prev) =>
      prev.includes(equipoId) ? prev.filter((id) => id !== equipoId) : [...prev, equipoId]
    );
  };

  // Filtered materials
  const filteredMateriales = useMemo(() => {
    const q = materialSearch.toLowerCase().trim();
    if (!q) return STOCK_TECNICO_MATERIALES;
    return STOCK_TECNICO_MATERIALES.filter(
      (m) =>
        m.nombre.toLowerCase().includes(q) ||
        m.categoria.toLowerCase().includes(q)
    );
  }, [materialSearch]);

  // Filtered equipment
  const filteredEquipos = useMemo(() => {
    const q = equipoSearch.toLowerCase().trim();
    if (!q) return STOCK_TECNICO_EQUIPOS;
    return STOCK_TECNICO_EQUIPOS.filter(
      (eq) =>
        eq.sn.toLowerCase().includes(q) ||
        eq.mac.toLowerCase().includes(q) ||
        eq.marca.toLowerCase().includes(q) ||
        eq.modelo.toLowerCase().includes(q) ||
        eq.tipo.toLowerCase().includes(q)
    );
  }, [equipoSearch]);

  // Count total materials used
  const totalMaterialesCount = Object.values(materialesUtilizados).reduce((acc, curr) => acc + (curr || 0), 0);

  // Submit & Save
  const handleSave = () => {
    const installedList = STOCK_TECNICO_EQUIPOS.filter((eq) => selectedEquiposIds.includes(eq.id));
    const allTaskPhotos = [...fotosMateriales, ...fotosEquipos];

    const payload: GuardarEjecucionVisitaPayload = {
      photos: allTaskPhotos,
      fotosMateriales,
      materialesUtilizados,
      fotosEquipos,
      equiposInstalados: installedList,
    };

    onSave(payload);
    onClose();
  };

  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150">
        {/* Header azul exacto de la imagen de referencia: Ejecución Visita con botón X */}
        <div className="bg-[#0066ff] px-6 py-4 flex items-center justify-between text-white shrink-0 select-none shadow-sm">
          <div className="flex items-center gap-2.5 font-bold text-base sm:text-lg">
            <ClipboardList className="w-5 h-5 text-white" />
            <span>Ejecución Visita</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-white/90 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Container Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50 space-y-5">
          {/* Marco azul interior: "Fotos de la tarea" se mantiene como título del container */}
          <div className="bg-white border-2 border-blue-500 rounded-3xl p-4 sm:p-6 shadow-sm space-y-5">
            {/* Encabezado del contenedor con círculo azul y número 2 */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#0066ff] text-white font-extrabold text-sm flex items-center justify-center shadow-xs">
                  2
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-1.5">
                    Fotos de la tarea <span className="text-red-500 font-bold">*</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Materiales utilizados y equipos instalados desde el stock técnico
                  </p>
                </div>
              </div>

              {/* Selector rápido de subcontainers */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setActiveSubTab('todos')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    activeSubTab === 'todos'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Ver Todo
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSubTab('materiales')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeSubTab === 'materiales'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>1. Materiales ({totalMaterialesCount})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSubTab('equipos')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeSubTab === 'equipos'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Router className="w-3.5 h-3.5" />
                  <span>2. Equipos ({selectedEquiposIds.length})</span>
                </button>
              </div>
            </div>

            {/* =============================================================== */}
            {/* SUBCONTAINER 1: MATERIALES UTILIZADOS                           */}
            {/* =============================================================== */}
            {(activeSubTab === 'todos' || activeSubTab === 'materiales') && (
              <div className="border-2 border-emerald-300 bg-emerald-50/20 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xs animate-in fade-in duration-150">
                <div className="flex items-center justify-between pb-2.5 border-b border-emerald-100 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      <Package className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">
                        Materiales utilizados
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Evidencia y control de materiales descargados del stock del técnico
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {totalMaterialesCount} unidad(es) usada(s)
                  </span>
                </div>

                {/* 1. dropbox de fotos */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">
                    dropbox de fotos:
                  </label>
                  <div
                    onClick={() => fileInputMaterialesRef.current?.click()}
                    className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 rounded-xl p-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-white hover:bg-emerald-50/50 transition-all text-center group shadow-2xs"
                  >
                    <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Camera className="w-5 h-5 text-emerald-600" />
                    </div>
                    <span className="text-xs font-bold text-emerald-950">
                      Toca o arrastra aquí para subir fotos de materiales utilizados
                    </span>
                    <span className="text-[11px] text-emerald-700">
                      {fotosMateriales.length === 0
                        ? '0 fotos seleccionadas'
                        : `${fotosMateriales.length} foto(s) de materiales cargada(s)`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-0.5">
                    <button
                      type="button"
                      onClick={handleAddSampleMaterial}
                      className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>+ Cargar foto de ejemplo (Conectores y Roseta)</span>
                    </button>
                  </div>

                  <input
                    ref={fileInputMaterialesRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleMaterialesPhotoUpload}
                  />

                  {/* Miniaturas de fotos de materiales */}
                  {fotosMateriales.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-2.5 border border-emerald-100 rounded-xl bg-white">
                      {fotosMateriales.map((p) => (
                        <div key={p.id} className="relative group rounded-lg overflow-hidden border border-emerald-200 bg-slate-50 shadow-2xs">
                          <img src={p.url} alt={p.title} className="w-full h-18 object-cover" />
                          <button
                            type="button"
                            onClick={() => setFotosMateriales((prev) => prev.filter((x) => x.id !== p.id))}
                            className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-red-600 text-white rounded-md"
                            title="Eliminar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <p className="text-[10px] font-semibold text-slate-700 truncate px-1.5 py-0.5">{p.title}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. box: busca materiales utilizados */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    box: busca materiales utilizados:
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={materialSearch}
                      onChange={(e) => setMaterialSearch(e.target.value)}
                      placeholder="Escribe el nombre o categoría del material a buscar..."
                      className="w-full text-xs text-slate-800 bg-white border border-emerald-300 rounded-xl pl-9 pr-8 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-2xs"
                    />
                    <Search className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    {materialSearch && (
                      <button
                        type="button"
                        onClick={() => setMaterialSearch('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* 3. box con materiales que el tecnico tiene en stock */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">
                      box con materiales que el tecnico tiene en stock:
                    </label>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {filteredMateriales.length} disponibles en inventario
                    </span>
                  </div>

                  <div className="border border-emerald-200 rounded-xl bg-white divide-y divide-emerald-100 max-h-56 overflow-y-auto shadow-2xs">
                    {filteredMateriales.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400">
                        No se encontraron materiales con ese término de búsqueda.
                      </div>
                    ) : (
                      filteredMateriales.map((item) => {
                        const qtyUsed = materialesUtilizados[item.id] || 0;
                        return (
                          <div
                            key={item.id}
                            className={`p-3 flex items-center justify-between gap-3 text-xs transition-colors ${
                              qtyUsed > 0 ? 'bg-emerald-50/60' : 'hover:bg-slate-50'
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 text-xs truncate">
                                  {item.nombre}
                                </span>
                                {qtyUsed > 0 && (
                                  <span className="bg-emerald-600 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-md">
                                    Usado: {qtyUsed}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                                <span>Categoría: {item.categoria}</span>
                                <span>·</span>
                                <span className="font-semibold text-emerald-700">
                                  Stock restante: {item.stock - qtyUsed} {item.unidad}
                                </span>
                              </div>
                            </div>

                            {/* Contador +/- */}
                            <div className="flex items-center gap-1.5 shrink-0 bg-slate-50 border border-slate-200 rounded-lg p-0.5">
                              <button
                                type="button"
                                onClick={() => handleMaterialDelta(item.id, -1, item.stock)}
                                disabled={qtyUsed <= 0}
                                className="w-7 h-7 rounded-md bg-white hover:bg-slate-100 text-slate-700 font-bold flex items-center justify-center disabled:opacity-30 cursor-pointer shadow-2xs"
                                title="Disminuir"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="w-8 text-center font-extrabold text-slate-800 text-xs">
                                {qtyUsed}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleMaterialDelta(item.id, 1, item.stock)}
                                disabled={qtyUsed >= item.stock}
                                className="w-7 h-7 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center disabled:opacity-30 cursor-pointer shadow-2xs"
                                title="Añadir"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* =============================================================== */}
            {/* SUBCONTAINER 2: EQUIPOS INSTALADOS                              */}
            {/* =============================================================== */}
            {(activeSubTab === 'todos' || activeSubTab === 'equipos') && (
              <div className="border-2 border-indigo-300 bg-indigo-50/20 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xs animate-in fade-in duration-150">
                <div className="flex items-center justify-between pb-2.5 border-b border-indigo-100 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      <Router className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">
                        Equipos instalados
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Registro y asociación de series (SN), MAC y modelos instalados
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                    {selectedEquiposIds.length} equipo(s) instalado(s)
                  </span>
                </div>

                {/* 1. dropbox de fotos */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">
                    dropbox de fotos:
                  </label>
                  <div
                    onClick={() => fileInputEquiposRef.current?.click()}
                    className="border-2 border-dashed border-indigo-300 hover:border-indigo-500 rounded-xl p-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-white hover:bg-indigo-50/50 transition-all text-center group shadow-2xs"
                  >
                    <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Camera className="w-5 h-5 text-indigo-600" />
                    </div>
                    <span className="text-xs font-bold text-indigo-950">
                      Toca o arrastra aquí para subir fotos de etiquetas y series de equipos
                    </span>
                    <span className="text-[11px] text-indigo-700">
                      {fotosEquipos.length === 0
                        ? '0 fotos seleccionadas'
                        : `${fotosEquipos.length} foto(s) de equipos cargada(s)`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-0.5">
                    <button
                      type="button"
                      onClick={handleAddSampleEquipo}
                      className="text-xs font-bold text-indigo-700 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>+ Cargar foto de ejemplo (Router Huawei 6)</span>
                    </button>
                  </div>

                  <input
                    ref={fileInputEquiposRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleEquiposPhotoUpload}
                  />

                  {/* Miniaturas de fotos de equipos */}
                  {fotosEquipos.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-2.5 border border-indigo-100 rounded-xl bg-white">
                      {fotosEquipos.map((p) => (
                        <div key={p.id} className="relative group rounded-lg overflow-hidden border border-indigo-200 bg-slate-50 shadow-2xs">
                          <img src={p.url} alt={p.title} className="w-full h-18 object-cover" />
                          <button
                            type="button"
                            onClick={() => setFotosEquipos((prev) => prev.filter((x) => x.id !== p.id))}
                            className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-red-600 text-white rounded-md"
                            title="Eliminar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <p className="text-[10px] font-semibold text-slate-700 truncate px-1.5 py-0.5">{p.title}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. box: busca serie de equipos utilizados */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">
                      box: busca serie de equipos utilizados:
                    </label>
                    <button
                      type="button"
                      onClick={() => setEquipoSearch('4857544397BBAFB')}
                      className="text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2.5 py-0.5 rounded cursor-pointer"
                    >
                      Probar SN Huawei 6: 4857544397BBAFB
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      value={equipoSearch}
                      onChange={(e) => setEquipoSearch(e.target.value.toUpperCase())}
                      placeholder="Buscar serie (SN), MAC o marca del equipo instalado..."
                      className="w-full text-xs font-mono font-bold text-slate-800 bg-white border border-indigo-300 rounded-xl pl-9 pr-8 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-2xs tracking-wider uppercase"
                    />
                    <Search className="w-4 h-4 text-indigo-600 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    {equipoSearch && (
                      <button
                        type="button"
                        onClick={() => setEquipoSearch('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* 3. box con los equipos, marcas y series relacionados que el tecnico tiene en su stock */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">
                      box con los equipos, marcas y series relacionados que el tecnico tiene en su stock:
                    </label>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Toca un equipo para marcarlo como instalado
                    </span>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {filteredEquipos.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400 border border-slate-200 rounded-xl bg-white">
                        No se encontraron equipos en stock con esa serie o marca.
                      </div>
                    ) : (
                      filteredEquipos.map((eq) => {
                        const isInstalled = selectedEquiposIds.includes(eq.id);
                        return (
                          <div
                            key={eq.id}
                            onClick={() => handleToggleEquipo(eq.id)}
                            className={`border rounded-2xl p-3 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-2xs ${
                              isInstalled
                                ? 'bg-indigo-50/90 border-indigo-400 ring-2 ring-indigo-400/30'
                                : 'bg-white hover:bg-slate-50 border-slate-200'
                            }`}
                          >
                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span
                                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                                    eq.tipo === 'Router ONT'
                                      ? 'bg-blue-100 text-blue-800'
                                      : eq.tipo === 'Decodificador TV'
                                      ? 'bg-purple-100 text-purple-800'
                                      : eq.tipo === 'Repetidor Wi-Fi'
                                      ? 'bg-teal-100 text-teal-800'
                                      : 'bg-cyan-100 text-cyan-800'
                                  }`}
                                >
                                  {eq.tipo}
                                </span>
                                <strong className="text-xs font-bold text-slate-900">
                                  {eq.marca}
                                </strong>
                                <span className="text-[11px] text-slate-500">
                                  ({eq.modelo})
                                </span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] font-mono">
                                <div className="flex items-center gap-1.5 text-slate-700">
                                  <span className="font-sans font-bold text-slate-400 text-[10px]">SN:</span>
                                  <span className="font-bold text-indigo-900 bg-white px-1.5 py-0.2 rounded border border-slate-200">
                                    {eq.sn}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-slate-700">
                                  <span className="font-sans font-bold text-slate-400 text-[10px]">MAC:</span>
                                  <span className="font-bold text-slate-800 bg-white px-1.5 py-0.2 rounded border border-slate-200">
                                    {eq.mac}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="shrink-0 flex items-center justify-end">
                              {isInstalled ? (
                                <div className="flex items-center gap-1.5 bg-indigo-600 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-xs">
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Instalado</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 bg-white hover:bg-indigo-50 border border-slate-300 hover:border-indigo-400 text-slate-700 hover:text-indigo-700 font-bold text-xs px-3.5 py-1.5 rounded-xl transition-colors">
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Instalar</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* BOTÓN DE GUARDAR DATOS (Exacto como solicitó el usuario) */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleSave}
                className="w-full py-3.5 px-5 rounded-2xl bg-[#0066ff] hover:bg-[#0052cc] text-white font-black text-sm tracking-wider uppercase transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer select-none"
              >
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>boton de guardar datos</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

