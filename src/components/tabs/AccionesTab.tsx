import React, { useState } from 'react';
import {
  UserCheck,
  RotateCw,
  Clock,
  ExternalLink,
  ClipboardList,
  MapPin,
  AlertTriangle,
  Share2,
  Save,
  CheckCircle,
} from 'lucide-react';
import { TaskData } from '../../types/task';
import { JEFES_TECNICOS, TECNICOS_POR_JEFE } from '../../data/mockData';

interface AccionesTabProps {
  task: TaskData;
  onUpdateTask: (updated: Partial<TaskData>) => void;
  onShowToast: (message: string) => void;
  onOpenAuditModal: (step?: 1 | 2 | 3) => void;
  onOpenLocationModal: () => void;
  onOpenReportModal: () => void;
}

export const AccionesTab: React.FC<AccionesTabProps> = ({
  task,
  onUpdateTask,
  onShowToast,
  onOpenAuditModal,
  onOpenLocationModal,
  onOpenReportModal,
}) => {
  const [jefe, setJefe] = useState(task.jefeSeleccionado || '');
  const [tecnico, setTecnico] = useState(task.tecSeleccionado || '');
  const [isSavingReasign, setIsSavingReasign] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const currentActividad = task.tipoActividad || (task.initials === 'VT' ? 'VT' : task.initials === 'R' ? 'R' : 'I');

  // Available technicians based on chosen chief
  const availableTechs = jefe ? TECNICOS_POR_JEFE[jefe] || [] : [];

  const handleJefeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newJefe = e.target.value;
    setJefe(newJefe);
    setTecnico(''); // reset technician selection
  };

  const handleSaveReasign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jefe || !tecnico) {
      onShowToast('Selecciona tanto el Jefe Técnico como el Técnico Asignado');
      return;
    }

    setIsSavingReasign(true);
    setTimeout(() => {
      const nuevoCambio = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
        user: 'Admin Ops',
        action: 'Reasignación de personal',
        details: `${jefe} -> ${tecnico}`,
      };

      onUpdateTask({
        jefeTecnico: jefe.split('(')[0].trim(),
        tecAsignado: tecnico,
        jefeSeleccionado: jefe,
        tecSeleccionado: tecnico,
        cambiosRegistrados: [nuevoCambio, ...(task.cambiosRegistrados || [])],
      });

      setIsSavingReasign(false);
      onShowToast(`Reasignación guardada exitosamente en Odoo para ${tecnico}`);
    }, 450);
  };

  const handleRefreshAvance = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      onShowToast('Supervisión de avance actualizada con Odoo en tiempo real');
    }, 500);
  };

  const handleTogglePaso = (pasoKey: 'paso1' | 'paso2' | 'paso3') => {
    const current = task.pasos[pasoKey];
    let next: 'Pendiente' | 'En Proceso' | 'Completado' = 'En Proceso';
    if (current === 'Pendiente') next = 'En Proceso';
    else if (current === 'En Proceso') next = 'Completado';
    else next = 'Pendiente';

    const newPasos = { ...task.pasos, [pasoKey]: next };
    
    // Check if start time should be set
    let newHoraInicio = task.horaInicio;
    if (newHoraInicio === 'No iniciada' && next !== 'Pendiente') {
      newHoraInicio = new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
    }

    onUpdateTask({
      pasos: newPasos,
      horaInicio: newHoraInicio,
      estado: next === 'Completado' && pasoKey === 'paso3' ? 'LIQUIDADO' : 'EN_CURSO',
    });

    onShowToast(`${pasoKey.toUpperCase()}: Cambiado a estado ${next}`);
  };

  const handleShare = () => {
    const text = `*FIBERPRO - TAREA ASIGNADA*\nCliente: ${task.nombre}\nDNI: ${task.dni}\nTicket: ${task.nroTicket}\nDirección: ${task.direccion}\nTeléfono: ${task.telefono}\nEstado: ${task.estado}\nUbicación: https://maps.google.com/?q=${task.coordenadas[0]},${task.coordenadas[1]}`;
    
    if (navigator.share) {
      navigator.share({
        title: `Tarea FiberPro - ${task.nroTicket}`,
        text: text,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      onShowToast('Detalles de tarea copiados al portapapeles');
    }
  };

  return (
    <div className="space-y-4 text-sm">
      {/* Reasignar Esta Tarea */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
            <UserCheck className="w-4 h-4 text-slate-600" />
            <span>Reasignar Esta Tarea:</span>
          </div>
          <span className="text-[11px] font-semibold bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-md border border-slate-200">
            Admin Ops
          </span>
        </div>

        <form onSubmit={handleSaveReasign} className="space-y-2.5">
          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">
              Jefe Técnico / Contratista:
            </label>
            <select
              value={jefe}
              onChange={handleJefeChange}
              className="w-full text-xs text-slate-800 bg-slate-50 focus:bg-white border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
            >
              <option value="">Seleccionar jefe técnico...</option>
              {JEFES_TECNICOS.map((jt) => (
                <option key={jt} value={jt}>
                  {jt}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">
              Técnico Asignado:
            </label>
            <select
              value={tecnico}
              onChange={(e) => setTecnico(e.target.value)}
              disabled={!jefe}
              className="w-full text-xs text-slate-800 bg-slate-50 focus:bg-white border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer disabled:bg-slate-100 disabled:text-slate-400"
            >
              <option value="">
                {jefe ? 'Seleccione técnico disponible...' : 'Seleccione primero un jefe'}
              </option>
              {availableTechs.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={isSavingReasign}
            className="w-full flex items-center justify-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition-all shadow-xs active:scale-[0.99] cursor-pointer disabled:opacity-60"
          >
            {isSavingReasign ? (
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Guardar Reasignación en Odoo</span>
          </button>
        </form>
      </div>

      {/* Supervisión de Avance */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-slate-900 text-xs">Supervisión de Avance:</h4>
          <button
            onClick={handleRefreshAvance}
            className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-md border border-slate-200 transition-colors cursor-pointer"
          >
            <RotateCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>
        </div>

        <div className="flex items-center justify-between text-xs pt-1">
          <div className="flex items-center gap-1.5 font-semibold text-slate-700">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Hora Inicio:</span>
          </div>
          <span className="font-bold text-slate-800">{task.horaInicio}</span>
        </div>

        {/* Workflow according to Activity Type: I (3 steps), VT, R */}
        {currentActividad === 'I' ? (
          <>
            {/* 3 Steps workflow (EXCLUSIVO PARA INSTALACIONES) */}
            <div className="grid grid-cols-3 gap-2">
              {/* PASO 1 */}
              <button
                type="button"
                onClick={() => onOpenAuditModal(1)}
                title="Entrar a ver Paso 1: Foto de Fachada / Inicio"
                className={`border rounded-xl p-2.5 text-center flex flex-col items-center justify-between transition-all cursor-pointer active:scale-95 hover:shadow-xs ${
                  task.pasos.paso1 === 'Completado'
                    ? 'bg-emerald-50/80 border-emerald-300 hover:bg-emerald-100/60'
                    : task.pasos.paso1 === 'En Proceso'
                    ? 'bg-blue-50/80 border-blue-300 hover:bg-blue-100/60'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-slate-800 mb-0.5">
                  <span>PASO 1</span>
                  <ExternalLink className="w-2.5 h-2.5 text-blue-600" />
                </div>
                <span className="text-[10px] text-slate-500 font-medium mb-1.5">Fachada</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    task.pasos.paso1 === 'Completado'
                      ? 'bg-emerald-600 text-white'
                      : task.pasos.paso1 === 'En Proceso'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {task.pasos.paso1 === 'Completado' ? 'OK' : task.pasos.paso1}
                </span>
              </button>

              {/* PASO 2 */}
              <button
                type="button"
                onClick={() => onOpenAuditModal(2)}
                title="Entrar a ver Paso 2: Fotos Tarea, Caja, Fibra y Materiales"
                className={`border rounded-xl p-2.5 text-center flex flex-col items-center justify-between transition-all cursor-pointer active:scale-95 hover:shadow-xs ${
                  task.pasos.paso2 === 'Completado'
                    ? 'bg-emerald-50/80 border-emerald-300 hover:bg-emerald-100/60'
                    : task.pasos.paso2 === 'En Proceso'
                    ? 'bg-blue-50/80 border-blue-300 hover:bg-blue-100/60'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-slate-800 mb-0.5">
                  <span>PASO 2</span>
                  <ExternalLink className="w-2.5 h-2.5 text-blue-600" />
                </div>
                <span className="text-[10px] text-slate-500 font-medium mb-1.5">Fotos/Mat.</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    task.pasos.paso2 === 'Completado'
                      ? 'bg-emerald-600 text-white'
                      : task.pasos.paso2 === 'En Proceso'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {task.pasos.paso2 === 'Completado' ? 'OK' : task.pasos.paso2}
                </span>
              </button>

              {/* PASO 3 */}
              <button
                type="button"
                onClick={() => onOpenAuditModal(3)}
                title="Entrar a ver Paso 3: Cierre y Observaciones Técnicas"
                className={`border rounded-xl p-2.5 text-center flex flex-col items-center justify-between transition-all cursor-pointer active:scale-95 hover:shadow-xs ${
                  task.pasos.paso3 === 'Completado'
                    ? 'bg-emerald-50/80 border-emerald-300 hover:bg-emerald-100/60'
                    : task.pasos.paso3 === 'En Proceso'
                    ? 'bg-blue-50/80 border-blue-300 hover:bg-blue-100/60'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-slate-800 mb-0.5">
                  <span>PASO 3</span>
                  <ExternalLink className="w-2.5 h-2.5 text-blue-600" />
                </div>
                <span className="text-[10px] text-slate-500 font-medium mb-1.5">Cierre</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    task.pasos.paso3 === 'Completado'
                      ? 'bg-emerald-600 text-white'
                      : task.pasos.paso3 === 'En Proceso'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {task.pasos.paso3 === 'Completado' ? 'OK' : task.pasos.paso3}
                </span>
              </button>
            </div>

            {/* Ver / Auditar Detalles de Instalación */}
            <button
              onClick={() => onOpenAuditModal(1)}
              className="w-full flex items-center justify-center gap-2 bg-white hover:bg-blue-50 border border-blue-500 text-blue-600 font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition-all cursor-pointer shadow-2xs"
            >
              <ClipboardList className="w-4 h-4 text-blue-600" />
              <span>Ver / Auditar Instalación (Paso 1, 2 y 3)</span>
            </button>
          </>
        ) : currentActividad === 'VT' ? (
          <>
            {/* 3 Steps workflow para VT - mismo esquema que Instalaciones */}
            <div className="grid grid-cols-3 gap-2">
              {/* PASO 1 */}
              <button
                type="button"
                onClick={() => onOpenAuditModal(1)}
                title="Entrar a ver Paso 1: Foto de Fachada / Inicio"
                className={`border rounded-xl p-2.5 text-center flex flex-col items-center justify-between transition-all cursor-pointer active:scale-95 hover:shadow-xs ${
                  task.pasos.paso1 === 'Completado'
                    ? 'bg-emerald-50/80 border-emerald-300 hover:bg-emerald-100/60'
                    : task.pasos.paso1 === 'En Proceso'
                    ? 'bg-amber-50/80 border-amber-300 hover:bg-amber-100/60'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-slate-800 mb-0.5">
                  <span>PASO 1</span>
                  <ExternalLink className="w-2.5 h-2.5 text-amber-600" />
                </div>
                <span className="text-[10px] text-slate-500 font-medium mb-1.5">Fachada</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    task.pasos.paso1 === 'Completado'
                      ? 'bg-emerald-600 text-white'
                      : task.pasos.paso1 === 'En Proceso'
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {task.pasos.paso1 === 'Completado' ? 'OK' : task.pasos.paso1}
                </span>
              </button>

              {/* PASO 2 */}
              <button
                type="button"
                onClick={() => onOpenAuditModal(2)}
                title="Entrar a ver Paso 2: Evidencias Técnicas y Equipos"
                className={`border rounded-xl p-2.5 text-center flex flex-col items-center justify-between transition-all cursor-pointer active:scale-95 hover:shadow-xs ${
                  task.pasos.paso2 === 'Completado'
                    ? 'bg-emerald-50/80 border-emerald-300 hover:bg-emerald-100/60'
                    : task.pasos.paso2 === 'En Proceso'
                    ? 'bg-amber-50/80 border-amber-300 hover:bg-amber-100/60'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-slate-800 mb-0.5">
                  <span>PASO 2</span>
                  <ExternalLink className="w-2.5 h-2.5 text-amber-600" />
                </div>
                <span className="text-[10px] text-slate-500 font-medium mb-1.5">Evidencias</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    task.pasos.paso2 === 'Completado'
                      ? 'bg-emerald-600 text-white'
                      : task.pasos.paso2 === 'En Proceso'
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {task.pasos.paso2 === 'Completado' ? 'OK' : task.pasos.paso2}
                </span>
              </button>

              {/* PASO 3 */}
              <button
                type="button"
                onClick={() => onOpenAuditModal(3)}
                title="Entrar a ver Paso 3: Cierre y Observaciones"
                className={`border rounded-xl p-2.5 text-center flex flex-col items-center justify-between transition-all cursor-pointer active:scale-95 hover:shadow-xs ${
                  task.pasos.paso3 === 'Completado'
                    ? 'bg-emerald-50/80 border-emerald-300 hover:bg-emerald-100/60'
                    : task.pasos.paso3 === 'En Proceso'
                    ? 'bg-amber-50/80 border-amber-300 hover:bg-amber-100/60'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-slate-800 mb-0.5">
                  <span>PASO 3</span>
                  <ExternalLink className="w-2.5 h-2.5 text-amber-600" />
                </div>
                <span className="text-[10px] text-slate-500 font-medium mb-1.5">Cierre</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    task.pasos.paso3 === 'Completado'
                      ? 'bg-emerald-600 text-white'
                      : task.pasos.paso3 === 'En Proceso'
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {task.pasos.paso3 === 'Completado' ? 'OK' : task.pasos.paso3}
                </span>
              </button>
            </div>

            {/* Ver / Auditar Detalles de Visita Técnica */}
            <button
              type="button"
              onClick={() => onOpenAuditModal(1)}
              className="w-full flex items-center justify-center gap-2 bg-white hover:bg-amber-50 border border-amber-500 text-amber-600 font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition-all cursor-pointer shadow-2xs"
            >
              <ClipboardList className="w-4 h-4 text-amber-600" />
              <span>Ver / Auditar Visita Técnica (Paso 1, 2 y 3)</span>
            </button>
          </>
        ) : (
          <>
            {/* 3 Steps workflow para R - mismo esquema que Instalaciones y VT */}
            <div className="grid grid-cols-3 gap-2">
              {/* PASO 1 */}
              <button
                type="button"
                onClick={() => onOpenAuditModal(1)}
                title="Entrar a ver Paso 1: Foto de Fachada / Inicio"
                className={`border rounded-xl p-2.5 text-center flex flex-col items-center justify-between transition-all cursor-pointer active:scale-95 hover:shadow-xs ${
                  task.pasos.paso1 === 'Completado'
                    ? 'bg-emerald-50/80 border-emerald-300 hover:bg-emerald-100/60'
                    : task.pasos.paso1 === 'En Proceso'
                    ? 'bg-rose-50/80 border-rose-300 hover:bg-rose-100/60'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-slate-800 mb-0.5">
                  <span>PASO 1</span>
                  <ExternalLink className="w-2.5 h-2.5 text-rose-600" />
                </div>
                <span className="text-[10px] text-slate-500 font-medium mb-1.5">Fachada</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    task.pasos.paso1 === 'Completado'
                      ? 'bg-emerald-600 text-white'
                      : task.pasos.paso1 === 'En Proceso'
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {task.pasos.paso1 === 'Completado' ? 'OK' : task.pasos.paso1}
                </span>
              </button>

              {/* PASO 2 */}
              <button
                type="button"
                onClick={() => onOpenAuditModal(2)}
                title="Entrar a ver Paso 2: Equipos Recuperados"
                className={`border rounded-xl p-2.5 text-center flex flex-col items-center justify-between transition-all cursor-pointer active:scale-95 hover:shadow-xs ${
                  task.pasos.paso2 === 'Completado'
                    ? 'bg-emerald-50/80 border-emerald-300 hover:bg-emerald-100/60'
                    : task.pasos.paso2 === 'En Proceso'
                    ? 'bg-rose-50/80 border-rose-300 hover:bg-rose-100/60'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-slate-800 mb-0.5">
                  <span>PASO 2</span>
                  <ExternalLink className="w-2.5 h-2.5 text-rose-600" />
                </div>
                <span className="text-[10px] text-slate-500 font-medium mb-1.5">Equipos</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    task.pasos.paso2 === 'Completado'
                      ? 'bg-emerald-600 text-white'
                      : task.pasos.paso2 === 'En Proceso'
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {task.pasos.paso2 === 'Completado' ? 'OK' : task.pasos.paso2}
                </span>
              </button>

              {/* PASO 3 */}
              <button
                type="button"
                onClick={() => onOpenAuditModal(3)}
                title="Entrar a ver Paso 3: Evidencias y Acta de Devolución"
                className={`border rounded-xl p-2.5 text-center flex flex-col items-center justify-between transition-all cursor-pointer active:scale-95 hover:shadow-xs ${
                  task.pasos.paso3 === 'Completado'
                    ? 'bg-emerald-50/80 border-emerald-300 hover:bg-emerald-100/60'
                    : task.pasos.paso3 === 'En Proceso'
                    ? 'bg-rose-50/80 border-rose-300 hover:bg-rose-100/60'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-slate-800 mb-0.5">
                  <span>PASO 3</span>
                  <ExternalLink className="w-2.5 h-2.5 text-rose-600" />
                </div>
                <span className="text-[10px] text-slate-500 font-medium mb-1.5">Cierre</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    task.pasos.paso3 === 'Completado'
                      ? 'bg-emerald-600 text-white'
                      : task.pasos.paso3 === 'En Proceso'
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {task.pasos.paso3 === 'Completado' ? 'OK' : task.pasos.paso3}
                </span>
              </button>
            </div>

            {/* Ver / Auditar Detalles de Retiro */}
            <button
              type="button"
              onClick={() => onOpenAuditModal(1)}
              className="w-full flex items-center justify-center gap-2 bg-white hover:bg-rose-50 border border-rose-500 text-rose-600 font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition-all cursor-pointer shadow-2xs"
            >
              <ClipboardList className="w-4 h-4 text-rose-600" />
              <span>Ver / Auditar Retiro (Paso 1, 2 y 3)</span>
            </button>
          </>
        )}
      </div>

      {/* Herramientas Operativas */}
      <div className="space-y-2.5">
        <h4 className="font-bold text-slate-900 text-xs">Herramientas Operativas:</h4>

        {/* Corregir Ubicación (Ticket Helpdesk) */}
        <button
          onClick={onOpenLocationModal}
          className="w-full flex items-center justify-center gap-2 bg-[#eab308] hover:bg-[#ca8a04] text-white font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition-all shadow-xs active:scale-[0.99] cursor-pointer"
        >
          <MapPin className="w-4 h-4 fill-white" />
          <span>Corregir Ubicación (Ticket Helpdesk)</span>
        </button>

        {/* Reportar a Revisión & Compartir */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={onOpenReportModal}
            className="flex items-center justify-center gap-2 bg-[#ef4444] hover:bg-[#dc2626] text-white font-bold py-2.5 px-3 rounded-xl text-xs sm:text-sm transition-all shadow-xs active:scale-[0.99] cursor-pointer"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Reportar a Revisión</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-2 bg-[#16a34a] hover:bg-[#15803d] text-white font-bold py-2.5 px-3 rounded-xl text-xs sm:text-sm transition-all shadow-xs active:scale-[0.99] cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>Compartir</span>
          </button>
        </div>
      </div>
    </div>
  );
};
