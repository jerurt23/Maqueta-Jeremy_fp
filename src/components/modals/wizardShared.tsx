import React, { useState } from 'react';
import {
  Camera,
  Move,
  Trash2,
  ChevronUp,
  ChevronDown,
  Lock,
  Unlock,
  Clock,
} from 'lucide-react';
import { PhotoEvidence, TaskData } from '../../types/task';

/**
 * Componentes compartidos por los modulos VTModal y RetiroModal.
 *
 * NOTA sobre Tailwind: las clases NO pueden construirse dinamicamente
 * (ej. `bg-${color}-50/30`) porque el scanner de Tailwind no detecta
 * clases completas en el source y nunca las genera en el CSS.
 * Por eso los colores de DropZone viven en el mapa DROPZONE_ACTIVE
 * con cadenas literales.
 */

export const Switch: React.FC<{
  value: boolean;
  onToggle: () => void;
  color?: string;
  size?: 'sm' | 'md';
}> = ({ value, onToggle, color = 'bg-[#0284c7]', size = 'md' }) => {
  const dims = size === 'sm' ? 'h-5 w-9' : 'h-6 w-11';
  const knob = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
  const shift = size === 'sm' ? 'translate-x-4' : 'translate-x-5';
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      onClick={onToggle}
      className={`relative inline-flex ${dims} shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${value ? color : 'bg-slate-300'}`}
    >
      <span
        className={`pointer-events-none inline-block ${knob} transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
          value ? shift : 'translate-x-0'
        }`}
      />
    </button>
  );
};

export const Badge: React.FC<{ children: React.ReactNode; color?: string }> = ({
  children,
  color = 'bg-slate-100 text-slate-600 border-slate-200',
}) => (
  <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold border ${color}`}>
    {children}
  </span>
);

export const SectionHeader: React.FC<{
  icon: React.ReactNode;
  title: string;
  switchValue?: boolean;
  onSwitchToggle?: () => void;
  switchColor?: string;
  /** Color del texto SÃ/NO. Por defecto Ã¡mbar (VT). Retiro usa rose. */
  switchTextColor?: string;
  locked?: boolean;
  expanded: boolean;
  onExpand: () => void;
  badge?: string;
}> = ({
  icon,
  title,
  switchValue,
  onSwitchToggle,
  switchColor,
  switchTextColor = 'text-amber-600',
  locked,
  expanded,
  onExpand,
  badge,
}) => (
  <div
    onClick={() => switchValue !== undefined && switchValue && onExpand()}
    className={`flex items-center justify-between pb-3 border-b border-slate-100 select-none p-1.5 -m-1.5 rounded-xl transition-colors ${
      switchValue ? 'cursor-pointer hover:bg-slate-50/80' : ''
    }`}
  >
    <div className="flex items-center gap-2.5 flex-wrap">
      <div className="flex items-center gap-2 font-extrabold text-[#0f172a] text-sm sm:text-base">
        {icon}
        {title}
      </div>
      {switchValue !== undefined && onSwitchToggle && (
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <Switch value={switchValue} onToggle={onSwitchToggle} color={switchColor} />
          <span className={`text-[11px] font-extrabold ${switchValue ? switchTextColor : 'text-slate-400'}`}>
            {switchValue ? 'SÃ' : 'NO'}
          </span>
        </div>
      )}
    </div>
    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
      {locked && (
        <Badge color="bg-emerald-50 text-emerald-700 border-emerald-200">
          <Lock className="w-3 h-3 mr-1 inline" />
          Guardado
        </Badge>
      )}
      {badge && <Badge>{badge}</Badge>}
      {switchValue && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onExpand();
          }}
          className="p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors cursor-pointer"
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      )}
    </div>
  </div>
);

/** Cadenas literales para que Tailwind las pueda generar en el CSS. */
const DROPZONE_ACTIVE: Record<string, string> = {
  amber: 'bg-amber-50/40 border-amber-300',
  sky: 'bg-sky-50/40 border-sky-300',
  blue: 'bg-blue-50/40 border-blue-300',
  emerald: 'bg-emerald-50/40 border-emerald-300',
  purple: 'bg-purple-50/40 border-purple-300',
  violet: 'bg-violet-50/40 border-violet-300',
  indigo: 'bg-indigo-50/40 border-indigo-300',
  red: 'bg-red-50/40 border-red-300',
  rose: 'bg-rose-50/40 border-rose-300',
};

export const DropZone: React.FC<{
  photos: PhotoEvidence[];
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onRemove: (id: string) => void;
  onView: (photo: PhotoEvidence) => void;
  color?: string;
  label: string;
  emptyText: string;
}> = ({ photos, onDrop, onDragOver, onRemove, onView, color = 'amber', label, emptyText }) => {
  const activeCls =
    photos.length > 0
      ? DROPZONE_ACTIVE[color] ?? DROPZONE_ACTIVE.amber
      : 'bg-slate-50/60 border-slate-200/90 hover:bg-slate-100/60';
  return (
    <div onDragOver={onDragOver} onDrop={onDrop} className={`p-3 rounded-2xl border-2 border-dashed transition-all ${activeCls}`}>
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <Camera className="w-3.5 h-3.5 shrink-0 text-slate-500" />
          <span className="text-xs font-extrabold text-slate-800 truncate">{label}</span>
        </div>
        <span className="px-2 py-0.5 bg-white/80 text-slate-700 text-[10px] font-extrabold rounded-full shrink-0">
          {photos.length} fotos
        </span>
      </div>
      {photos.length === 0 ? (
        <div className="py-2.5 px-3 text-center text-slate-400 text-xs flex items-center justify-center gap-2 border border-dashed border-slate-200/70 rounded-xl bg-white/70">
          <Move className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-[11px] text-slate-500 font-medium">{emptyText}</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
          {photos.map((photo) => (
            <div key={photo.id} className="relative group rounded-xl overflow-hidden border border-slate-200 bg-white shadow-2xs">
              <img
                src={photo.url}
                alt={photo.title}
                className="w-full h-16 object-cover cursor-pointer"
                onClick={() => onView(photo)}
              />
              <div className="p-1 bg-white">
                <p className="text-[10px] font-bold text-slate-800 truncate" title={photo.title}>
                  {photo.title}
                </p>
              </div>
              <button
                onClick={() => onRemove(photo.id)}
                className="absolute top-1 right-1 p-0.5 bg-red-600/80 hover:bg-red-600 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                title="Devolver a Fotos Generales"
              >
                <Trash2 className="w-2.5 h-2.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const SaveLockButton: React.FC<{
  isLocked: boolean;
  onSave: () => void;
  onUnlock: () => void;
  label: string;
  lockedLabel: string;
}> = ({ isLocked, onSave, onUnlock, label, lockedLabel }) => {
  const [isLocking, setIsLocking] = useState(false);
  if (isLocked) {
    return (
      <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl px-3 py-1.5 shadow-2xs">
        <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-800">
          <div className="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center">
            <Lock className="w-3.5 h-3.5" />
          </div>
          <span>{lockedLabel}</span>
        </div>
        <button
          type="button"
          onClick={onUnlock}
          className="ml-2 px-2.5 py-1 bg-white hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-lg text-xs font-black cursor-pointer"
        >
          <Unlock className="w-3.5 h-3.5" />
          Desbloquear
        </button>
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={() => {
        setIsLocking(true);
        setTimeout(() => {
          setIsLocking(false);
          onSave();
        }, 550);
      }}
      disabled={isLocking}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black text-white transition-all shadow-sm cursor-pointer active:scale-95 ${
        isLocking ? 'bg-emerald-600' : 'bg-rose-600 hover:bg-rose-700'
      }`}
    >
      <Lock className="w-4 h-4" />
      <span>{isLocking ? 'Guardando...' : label}</span>
    </button>
  );
};

/** Formatea una fecha como `dd/mm/yyyy hh:mm` (hora local). */
export const formatFechaHoraFin = (date: Date = new Date()): string => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const FIN_PILL =
  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border whitespace-nowrap shrink-0';
const FIN_VARIANT = {
  oficial: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  pendiente: 'bg-slate-100 text-slate-500 border-slate-200',
};

/**
 * Campo de solo lectura con la fecha y hora de finalizaciÃ³n de la tarea.
 * Va junto al h3 del Paso 3. Muestra "Pendiente" hasta que se cierra el Paso 3
 * (momento en el que se escribe `task.horaFin`).
 */
export const HoraFinalField: React.FC<{ task: TaskData }> = ({ task }) => {
  const oficial =
    typeof task.horaFin === 'string' &&
    task.horaFin.trim() !== '' &&
    task.horaFin !== 'Pendiente';

  if (oficial) {
    return (
      <span
        className={`${FIN_PILL} ${FIN_VARIANT.oficial}`}
        title="Fecha y hora de finalizaciÃ³n de la tarea"
      >
        <Clock className="w-3 h-3" />
        <span>Hora Final:</span>
        <strong className="font-black">{task.horaFin}</strong>
      </span>
    );
  }

  return (
    <span
      className={`${FIN_PILL} ${FIN_VARIANT.pendiente}`}
      title="Se registrarÃ¡ cuando se cierre el Paso 3"
    >
      <Clock className="w-3 h-3" />
      <span>Hora Final:</span>
      <strong className="font-black">Pendiente</strong>
    </span>
  );
};
