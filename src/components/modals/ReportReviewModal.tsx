import React, { useState } from 'react';
import { X, AlertTriangle, Send } from 'lucide-react';
import { TaskData } from '../../types/task';

interface ReportReviewModalProps {
  task: TaskData;
  isOpen: boolean;
  onClose: () => void;
  onUpdateTask: (updated: Partial<TaskData>) => void;
  onShowToast: (message: string) => void;
}

export const ReportReviewModal: React.FC<ReportReviewModalProps> = ({
  task,
  isOpen,
  onClose,
  onUpdateTask,
  onShowToast,
}) => {
  const [motivo, setMotivo] = useState('Cliente no se encuentra en domicilio (Ausente)');
  const [detalle, setDetalle] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const nuevoCambio = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
      user: 'Supervisor Ops',
      action: 'Reportado a Revisión',
      details: `${motivo} ${detalle ? `(${detalle})` : ''}`,
    };

    onUpdateTask({
      estado: 'REPROGRAMADO',
      obsOperaciones: `REPORTADO A REVISIÓN: ${motivo.toUpperCase()}${detalle ? ` - ${detalle.toUpperCase()}` : ''}`,
      cambiosRegistrados: [nuevoCambio, ...(task.cambiosRegistrados || [])],
    });

    onShowToast(`Tarea #${task.nroTicket} enviada a revisión técnica`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-red-600 text-white">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 fill-white text-red-600" />
            <h3 className="font-extrabold text-base">
              Reportar a Revisión
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-red-700 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Motivo de Envío a Revisión:
            </label>
            <select
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-red-500 cursor-pointer"
            >
              <option value="Cliente no se encuentra en domicilio (Ausente)">
                Cliente no se encuentra en domicilio (Ausente)
              </option>
              <option value="Zona sin cobertura / Caja NAP saturada">
                Zona sin cobertura / Caja NAP saturada
              </option>
              <option value="Dificultad de acceso / Permiso vecinal o municipal">
                Dificultad de acceso / Permiso vecinal o municipal
              </option>
              <option value="Cliente solicita reprogramación de fecha">
                Cliente solicita reprogramación de fecha
              </option>
              <option value="Atenuación severa en troncal de planta externa">
                Atenuación severa en troncal de planta externa
              </option>
              <option value="Cliente desistió del servicio en sitio">
                Cliente desistió del servicio en sitio
              </option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Detalles y Evidencia Técnica:
            </label>
            <textarea
              value={detalle}
              onChange={(e) => setDetalle(e.target.value)}
              placeholder="Explica detalladamente la causa para auditoría de Odoo..."
              rows={3}
              required
              className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:bg-white focus:border-red-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Enviar a Revisión</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
