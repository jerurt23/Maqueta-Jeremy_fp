import React, { useRef } from 'react';
import { User, Smartphone, Phone, MessageSquare, MapPin, Maximize2, Home, Upload, Cable, Sparkles, Lock, Camera, FileText, Wrench, Package } from 'lucide-react';
import { TaskData } from '../../types/task';

interface GeneralTabProps {
  task: TaskData;
  onCenterMap: () => void;
  onUpdateTask: (updated: Partial<TaskData>) => void;
  onShowToast: (message: string) => void;
  onOpenAuditModal?: (step?: 1 | 2 | 3) => void;
}

export const GeneralTab: React.FC<GeneralTabProps> = ({
  task,
  onCenterMap,
  onUpdateTask,
  onShowToast,
  onOpenAuditModal,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCall = () => {
    window.open(`tel:${task.telefono.replace(/\s+/g, '')}`, '_self');
    onShowToast(`Iniciando llamada a ${task.telefono}`);
  };

  const handleWhatsApp = () => {
    const cleanNumber = task.telefono.replace(/\D/g, '');
    const url = `https://wa.me/51${cleanNumber}?text=Hola%20${encodeURIComponent(
      task.nombre
    )},%20le%20escribimos%20de%20soporte%20t%C3%A9cnico%20de%20fibra%20%C3%B3ptica%20por%20su%20solicitud%20${task.nroTicket}`;
    window.open(url, '_blank');
    onShowToast(`Abriendo WhatsApp con ${task.telefono}`);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        onUpdateTask({ fachadaUrl: result });
        onShowToast('Foto de fachada actualizada correctamente');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-4 text-sm text-slate-700">
      {/* Acceso directo a Pasos 1, 2 y 3 - Dinámico según actividad */}
      {(() => {
        const act = task.tipoActividad || (task.initials === 'VT' ? 'VT' : task.initials === 'R' ? 'R' : 'I');
        const isVT = act === 'VT';
        const isR = act === 'R';
        const headerBg = isVT
          ? 'bg-gradient-to-r from-amber-900 to-orange-950'
          : isR
          ? 'bg-gradient-to-r from-rose-900 to-red-950'
          : 'bg-gradient-to-r from-slate-900 to-blue-950';
        const headerBorder = isVT ? 'border-amber-800' : isR ? 'border-rose-800' : 'border-slate-800';
        const headerText = isVT ? 'text-amber-200' : isR ? 'text-rose-200' : 'text-blue-200';
        const midBtn = isVT
          ? 'bg-amber-500 hover:bg-amber-400'
          : isR
          ? 'bg-rose-600 hover:bg-rose-500'
          : 'bg-blue-600 hover:bg-blue-500';
        const midText = isVT ? 'text-amber-100' : isR ? 'text-rose-100' : 'text-blue-100';
        const step2Label = isVT ? 'Evidencias' : isR ? 'Equipos' : 'Caja/Mat.';
        const step2Icon = isVT ? Wrench : isR ? Package : Cable;
        const Step2Icon = step2Icon;
        return (
          <div className={`${headerBg} text-white rounded-2xl p-3.5 shadow-md border ${headerBorder} space-y-2.5`}>
            <div className="flex items-center justify-between">
              <span className={`font-extrabold text-xs uppercase tracking-wider ${headerText}`}>
                Pasos de Validación y Auditoría
              </span>
              <span className="text-[10px] text-slate-300 font-mono">#{task.nroTicket}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => onOpenAuditModal?.(1)}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer border border-white/10 active:scale-95"
                title="Abrir Paso 1: Fachada"
              >
                <Camera className="w-4 h-4 text-sky-400 mb-1" />
                <span>Paso 1</span>
                <span className="text-[9px] text-slate-300 font-normal">Fachada</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenAuditModal?.(2)}
                className={`flex flex-col items-center justify-center p-2 rounded-xl ${midBtn} text-white text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95`}
                title="Abrir Paso 2"
              >
                <Step2Icon className="w-4 h-4 text-white mb-1" />
                <span>Paso 2</span>
                <span className={`text-[9px] ${midText} font-normal`}>{step2Label}</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenAuditModal?.(3)}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer border border-white/10 active:scale-95"
                title="Abrir Paso 3: Cierre"
              >
                <FileText className="w-4 h-4 text-emerald-400 mb-1" />
                <span>Paso 3</span>
                <span className="text-[9px] text-slate-300 font-normal">Cierre</span>
              </button>
            </div>
          </div>
        );
      })()}

      {/* Transcurso del día */}
      <div>
        <h3 className="font-bold text-slate-900 text-sm mb-2.5">Transcurso del día</h3>
        <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 space-y-2.5 shadow-xs">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center gap-2 font-medium text-slate-700">
              <User className="w-4 h-4 text-slate-500" />
              <span>Jefe Tecnico :</span>
            </div>
            <span className="font-semibold text-slate-800">{task.jefeTecnico}</span>
          </div>

          <div className="flex items-center justify-between text-xs sm:text-sm pt-1 border-t border-slate-100">
            <div className="flex items-center gap-2 font-medium text-slate-700">
              <Smartphone className="w-4 h-4 text-slate-500" />
              <span>Téc. Asignado:</span>
            </div>
            <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200">
              {task.tecAsignado}
            </span>
          </div>
        </div>
      </div>

      {/* Foto de Fachada */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-linear-to-b from-slate-200 via-slate-300 to-slate-400 h-44 shadow-inner flex flex-col justify-between p-3.5 group">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePhotoUpload}
        />

        {task.fachadaUrl ? (
          <img
            src={task.fachadaUrl}
            alt="Fachada"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
            <span className="text-3xl font-bold tracking-wider text-slate-400/60 uppercase">
              Fachada
            </span>
          </div>
        )}

        <div className="z-10 flex justify-end">
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Subir o cambiar foto de fachada"
            className="p-1.5 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-lg text-white transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="z-10 flex items-center justify-between">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-black/50 backdrop-blur-md rounded-md text-white text-xs font-medium">
            <Home className="w-3.5 h-3.5" />
            <span>{task.fachadaUrl ? 'Foto registrada' : 'Sin foto de fachada'}</span>
          </div>

          <button
            onClick={() => {
              if (task.fachadaUrl) {
                window.open(task.fachadaUrl, '_blank');
              } else {
                fileInputRef.current?.click();
              }
            }}
            className="p-1.5 bg-black/50 hover:bg-black/70 backdrop-blur-md rounded-md text-white transition-colors"
            title="Expandir imagen"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Para esta Tarea: Botones de contacto */}
      <div>
        <h4 className="font-bold text-slate-900 text-sm mb-2">Para esta Tarea:</h4>
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={handleCall}
            className="flex items-center justify-center gap-2 bg-[#0284c7] hover:bg-[#0369a1] text-white font-semibold py-2.5 px-3 rounded-xl transition-colors shadow-xs active:scale-[0.98]"
          >
            <Phone className="w-4 h-4 fill-white" />
            <span className="text-xs sm:text-sm font-bold tracking-tight">{task.telefono}</span>
          </button>

          <button
            onClick={handleWhatsApp}
            className="flex items-center justify-center gap-2 bg-[#16a34a] hover:bg-[#15803d] text-white font-semibold py-2.5 px-3 rounded-xl transition-colors shadow-xs active:scale-[0.98]"
          >
            <MessageSquare className="w-4 h-4 fill-white" />
            <span className="text-xs sm:text-sm font-bold tracking-tight">{task.telefono}</span>
          </button>
        </div>
      </div>

      {/* Comentario telf */}
      <div className="bg-[#fefce8] border border-[#fef08a] rounded-xl p-3.5 space-y-1">
        <div className="flex items-center gap-2 text-[#854d0e] font-semibold text-xs">
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Comentario telf:</span>
        </div>
        <p className="text-slate-600 text-xs pl-5.5 font-normal">
          {task.comentarioTelf || 'Sin comentarios'}
        </p>
      </div>

      {/* Dirección */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 space-y-3 shadow-xs">
        <div>
          <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase block mb-1">
            DIRECCIÓN:
          </span>
          <p className="font-extrabold text-slate-900 text-sm tracking-tight">
            {task.direccion}
          </p>
        </div>

        <button
          onClick={onCenterMap}
          className="w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 border border-slate-200 text-slate-800 font-semibold py-2.5 px-4 rounded-xl transition-all text-xs sm:text-sm cursor-pointer"
        >
          <MapPin className="w-4 h-4 text-slate-600" />
          <span>Ubicación en Mapa</span>
        </button>
      </div>
    </div>
  );
};
