import React, { useState } from 'react';
import {
  X,
  Info,
  MessageSquare,
  Zap,
  Wrench,
  Clock,
  ChevronLeft,
  ChevronRight,
  User,
} from 'lucide-react';
import { TaskData, TipoActividad } from '../types/task';
import { GeneralTab } from './tabs/GeneralTab';
import { ObsTab } from './tabs/ObsTab';
import { AccionesTab } from './tabs/AccionesTab';
import { TecnicoTab } from './tabs/TecnicoTab';
import { HistorialTab } from './tabs/HistorialTab';
import { LocationCorrectionModal } from './modals/LocationCorrectionModal';
import { ReportReviewModal } from './modals/ReportReviewModal';

export type TabType = 'general' | 'obs' | 'acciones' | 'tecnico' | 'historial';

interface TaskDrawerProps {
  task: TaskData;
  isOpen: boolean;
  onClose: () => void;
  onCenterMap: () => void;
  onUpdateTask: (updated: Partial<TaskData>) => void;
  onShowToast: (message: string) => void;
  onOpenAuditModal: (step?: 1 | 2 | 3) => void;
}

export const TaskDrawer: React.FC<TaskDrawerProps> = ({
  task,
  isOpen,
  onClose,
  onCenterMap,
  onUpdateTask,
  onShowToast,
  onOpenAuditModal,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('acciones');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

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

  const handleOpenAuditModal = (step?: 1 | 2 | 3) => {
    onOpenAuditModal(step || 1);
  };

  if (!isOpen) {
    return null;
  }

  const tabs: Array<{ id: TabType; label: string; icon: React.ReactNode }> = [
    {
      id: 'general',
      label: 'General',
      icon: <Info className="w-4 h-4 text-blue-600" />,
    },
    {
      id: 'obs',
      label: 'Obs.',
      icon: <MessageSquare className="w-4 h-4 text-blue-600" />,
    },
    {
      id: 'acciones',
      label: 'Acciones',
      icon: <Zap className="w-4 h-4 text-blue-600" />,
    },
    {
      id: 'tecnico',
      label: 'Técnico',
      icon: <Wrench className="w-4 h-4 text-blue-600" />,
    },
    {
      id: 'historial',
      label: 'Historial',
      icon: <Clock className="w-4 h-4 text-blue-600" />,
    },
  ];

  return (
    <>
      <div className="absolute top-0 left-0 bottom-0 z-30 w-full sm:w-[460px] md:w-[480px] bg-slate-50/98 backdrop-blur-md shadow-2xl border-r border-slate-200/90 flex flex-col transition-all duration-300 ease-in-out">
        {/* Top Header */}
        <div className="p-4 pb-3 border-b border-slate-200/80 bg-white">
          <div className="flex items-start justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              {/* 3 Tipos de Actividades: I = INSTALACION, VT = VISITA TECNICA, R = RETIRO */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl border border-slate-200/80 shrink-0">
                {/* I = INSTALACION */}
                <button
                  type="button"
                  onClick={() => handleSelectActividad('I')}
                  title="I = INSTALACIÓN: Fotos fachada, materiales, caja y registro de equipos"
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs transition-all cursor-pointer active:scale-95 ${
                    currentActividad === 'I'
                      ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-400 scale-105'
                      : 'bg-white text-slate-500 hover:text-blue-600 hover:bg-blue-50 border border-slate-200'
                  }`}
                >
                  I
                </button>

                {/* VT = VISITA TECNICA */}
                <button
                  type="button"
                  onClick={() => handleSelectActividad('VT')}
                  title="VT = VISITA TÉCNICA: Diagnóstico de avería y soporte"
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs transition-all cursor-pointer active:scale-95 ${
                    currentActividad === 'VT'
                      ? 'bg-[#f97316] text-white shadow-sm ring-2 ring-orange-400 scale-105'
                      : 'bg-white text-slate-500 hover:text-orange-600 hover:bg-orange-50 border border-slate-200'
                  }`}
                >
                  VT
                </button>

                {/* R = RETIRO */}
                <button
                  type="button"
                  onClick={() => handleSelectActividad('R')}
                  title="R = RETIRO: Devolución de equipos y suspensión"
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs transition-all cursor-pointer active:scale-95 ${
                    currentActividad === 'R'
                      ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-400 scale-105'
                      : 'bg-white text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200'
                  }`}
                >
                  R
                </button>
              </div>

              {/* DNI & Name & Active Activity Badge */}
              <div className="min-w-0">
                <div className="font-extrabold text-slate-900 text-xs sm:text-sm tracking-tight flex items-center gap-1.5 flex-wrap">
                  <span>DNI: {task.dni}</span>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider shrink-0 ${
                      currentActividad === 'I'
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : currentActividad === 'VT'
                        ? 'bg-orange-100 text-orange-800 border border-orange-200'
                        : 'bg-rose-100 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {currentActividad === 'I'
                      ? 'I · Instalación'
                      : currentActividad === 'VT'
                      ? 'VT · Visita Técnica'
                      : 'R · Retiro'}
                  </span>
                </div>
                <h2 className="font-bold text-slate-800 text-xs sm:text-sm tracking-tight truncate max-w-[210px]">
                  {task.nombre}
                </h2>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              title="Cerrar panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Subheader info and status pills */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
            <div className="space-y-0.5 text-slate-600">
              <div className="font-extrabold text-slate-900 text-[11px] sm:text-xs">
                Cod suscri <span className="font-mono">{task.codSuscri}</span>
              </div>
              <div className="text-[11px] text-slate-500">
                Inicio: <span className="text-slate-700">{task.inicio}</span>
              </div>
              <div className="text-[11px] text-slate-500">
                Susp/Baja: <span className="text-slate-700 font-medium">{task.suspBaja}</span>
              </div>
            </div>

            {/* Badges on right: 1/1 and REPROGRAMADO */}
            <div className="flex items-center gap-1.5 shrink-0 self-start">
              <span className="px-2 py-0.5 bg-rose-50 text-rose-600 font-extrabold text-[11px] rounded-md border border-rose-200/80">
                {task.ordenRatio}
              </span>
              <span
                className={`px-2 py-0.5 text-[10px] font-extrabold rounded-md border tracking-tight ${
                  task.estado === 'REPROGRAMADO'
                    ? 'bg-slate-100 text-slate-700 border-slate-300'
                    : task.estado === 'EN_CURSO'
                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                    : task.estado === 'LIQUIDADO'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-blue-100 text-blue-800 border-blue-300'
                }`}
              >
                {task.estado}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation buttons */}
        <div className="px-3 py-2 bg-slate-100/90 border-b border-slate-200 flex items-center justify-between gap-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-1.5 px-1 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white text-blue-700 font-bold shadow-xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 font-medium'
                }`}
              >
                <div className="shrink-0">{tab.icon}</div>
                <span className="text-[11px] tracking-tight">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeTab === 'general' && (
            <GeneralTab
              task={task}
              onCenterMap={onCenterMap}
              onUpdateTask={onUpdateTask}
              onShowToast={onShowToast}
              onOpenAuditModal={handleOpenAuditModal}
            />
          )}

          {activeTab === 'obs' && (
            <ObsTab
              task={task}
              onUpdateTask={onUpdateTask}
              onShowToast={onShowToast}
            />
          )}

          {activeTab === 'acciones' && (
            <AccionesTab
              task={task}
              onUpdateTask={onUpdateTask}
              onShowToast={onShowToast}
              onOpenAuditModal={handleOpenAuditModal}
              onOpenLocationModal={() => setIsLocationModalOpen(true)}
              onOpenReportModal={() => setIsReportModalOpen(true)}
            />
          )}

          {activeTab === 'tecnico' && (
            <TecnicoTab
              task={task}
              onUpdateTask={onUpdateTask}
              onShowToast={onShowToast}
            />
          )}

          {activeTab === 'historial' && <HistorialTab task={task} />}
        </div>
      </div>

      {/* Modals */}

      <LocationCorrectionModal
        task={task}
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onUpdateTask={onUpdateTask}
        onShowToast={onShowToast}
      />

      <ReportReviewModal
        task={task}
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onUpdateTask={onUpdateTask}
        onShowToast={onShowToast}
      />
    </>
  );
};
