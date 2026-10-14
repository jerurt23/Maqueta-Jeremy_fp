import React, { useState } from 'react';
import { Ticket, Edit3, Save, CheckCircle2 } from 'lucide-react';
import { TaskData } from '../../types/task';

interface ObsTabProps {
  task: TaskData;
  onUpdateTask: (updated: Partial<TaskData>) => void;
  onShowToast: (message: string) => void;
}

export const ObsTab: React.FC<ObsTabProps> = ({
  task,
  onUpdateTask,
  onShowToast,
}) => {
  const [notaTexto, setNotaTexto] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleGrabarOdoo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notaTexto.trim()) {
      onShowToast('Por favor escribe una nota técnica antes de grabar.');
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      const nuevaNota = {
        id: `nota-${Date.now()}`,
        fecha: new Date().toLocaleDateString('es-PE', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }),
        autor: 'Admin Ops',
        texto: notaTexto.trim(),
      };

      const nuevasNotas = [nuevaNota, ...(task.notasOdoo || [])];
      const nuevosCambios = [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
          user: 'Admin Ops',
          action: 'Nota añadida a Odoo',
          details: notaTexto.trim().slice(0, 45) + (notaTexto.length > 45 ? '...' : ''),
        },
        ...(task.cambiosRegistrados || []),
      ];

      onUpdateTask({
        notasOdoo: nuevasNotas,
        cambiosRegistrados: nuevosCambios,
        obsTecnico: task.obsTecnico === '-' ? notaTexto.trim() : `${task.obsTecnico} | ${notaTexto.trim()}`,
      });

      setNotaTexto('');
      setIsSaving(false);
      onShowToast(`Nota técnica anexada exitosamente a Odoo (${task.nroTicket})`);
    }, 400);
  };

  return (
    <div className="space-y-3.5 text-sm">
      {/* TRASLADO INTERNO Card */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-xs">
        <h3 className="font-extrabold text-slate-900 text-sm mb-2.5 tracking-tight uppercase">
          {task.tipoTrabajo}
        </h3>
        <div className="border border-amber-300 bg-amber-50/50 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ticket className="w-4 h-4 text-amber-700" />
            <span className="text-xs font-bold text-slate-800">Nro. Ticket:</span>
          </div>
          <span className="bg-slate-900 text-white font-mono font-bold text-xs px-2.5 py-1 rounded-md tracking-wider shadow-xs">
            {task.nroTicket}
          </span>
        </div>
      </div>

      {/* OBS. DE PLANIFICACIÓN */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-xs">
        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
          OBS. DE PLANIFICACIÓN:
        </span>
        <p className="text-xs font-semibold text-slate-700 leading-relaxed uppercase">
          {task.obsPlanificacion}
        </p>
      </div>

      {/* OBSRV. OPERACIONES */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-xs">
        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
          OBSRV. OPERACIONES:
        </span>
        <p className="text-xs font-medium text-slate-600">
          {task.obsOperaciones}
        </p>
      </div>

      {/* OBSRV. TÉCNICO */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-xs">
        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
          OBSRV. TÉCNICO:
        </span>
        <p className="text-xs font-medium text-slate-600">
          {task.obsTecnico}
        </p>
      </div>

      {/* Formulario Agregar Nota Técnica rápida */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
          <Edit3 className="w-4 h-4 text-blue-600" />
          <span>Agregar Nota Técnica rápida:</span>
        </div>

        <form onSubmit={handleGrabarOdoo} className="space-y-2.5">
          <textarea
            value={notaTexto}
            onChange={(e) => setNotaTexto(e.target.value)}
            placeholder="Escribe aquí para anexar a Odoo..."
            rows={3}
            className="w-full text-xs text-slate-800 placeholder-slate-400 bg-slate-50 focus:bg-white border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
          />

          <button
            type="submit"
            disabled={isSaving}
            className="w-full flex items-center justify-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition-all shadow-xs active:scale-[0.99] cursor-pointer disabled:opacity-60"
          >
            {isSaving ? (
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Grabar en Odoo</span>
          </button>
        </form>
      </div>

      {/* Lista de notas registradas en Odoo si existen */}
      {task.notasOdoo && task.notasOdoo.length > 0 && (
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Notas Anexadas a Odoo ({task.notasOdoo.length}):
          </span>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {task.notasOdoo.map((n) => (
              <div
                key={n.id}
                className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3 text-xs space-y-1"
              >
                <div className="flex items-center justify-between text-blue-900 font-semibold text-[11px]">
                  <span>{n.autor}</span>
                  <span className="text-blue-700 font-normal">{n.fecha}</span>
                </div>
                <p className="text-slate-800 font-medium">{n.texto}</p>
                <div className="flex items-center gap-1 text-[10px] text-blue-600 font-medium pt-1">
                  <CheckCircle2 className="w-3 h-3 text-blue-600" />
                  <span>Sincronizado con Odoo</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
