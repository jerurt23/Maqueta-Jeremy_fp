import React, { useState } from 'react';
import { X, MapPin, Check, AlertCircle } from 'lucide-react';
import { TaskData } from '../../types/task';

interface LocationCorrectionModalProps {
  task: TaskData;
  isOpen: boolean;
  onClose: () => void;
  onUpdateTask: (updated: Partial<TaskData>) => void;
  onShowToast: (message: string) => void;
}

export const LocationCorrectionModal: React.FC<LocationCorrectionModalProps> = ({
  task,
  isOpen,
  onClose,
  onUpdateTask,
  onShowToast,
}) => {
  const [lat, setLat] = useState(task.coordenadas[0].toString());
  const [lng, setLng] = useState(task.coordenadas[1].toString());
  const [direccion, setDireccion] = useState(task.direccion);
  const [motivo, setMotivo] = useState('Fachada desplazada en la cartografía original');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);

    if (isNaN(parsedLat) || isNaN(parsedLng)) {
      onShowToast('Ingresa coordenadas numéricas válidas');
      return;
    }

    onUpdateTask({
      coordenadas: [parsedLat, parsedLng],
      direccion: direccion.trim(),
      cambiosRegistrados: [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
          user: 'Helpdesk Ops',
          action: 'Corrección de Ubicación / Georreferencia',
          details: `${parsedLat.toFixed(5)}, ${parsedLng.toFixed(5)} (${motivo})`,
        },
        ...(task.cambiosRegistrados || []),
      ],
    });

    onShowToast('Ticket de corrección enviado a Helpdesk y coordenadas actualizadas');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-amber-500 text-white">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 fill-white" />
            <h3 className="font-extrabold text-base">
              Corregir Ubicación (Ticket Helpdesk)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-amber-600 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="text-xs text-slate-600 bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              Esta acción actualizará el punto geográfico en el mapa y notificará al equipo de Helpdesk / GIS para re-enrutar la cuadrilla.
            </span>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Dirección Verificada:
            </label>
            <input
              type="text"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Latitud:
              </label>
              <input
                type="text"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className="w-full text-xs font-mono text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Longitud:
              </label>
              <input
                type="text"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                className="w-full text-xs font-mono text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Motivo de Corrección:
            </label>
            <select
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="Fachada desplazada en la cartografía original">
                Fachada desplazada en la cartografía original
              </option>
              <option value="Error en numeración municipal">
                Error en numeración municipal
              </option>
              <option value="Punto de acceso por pasaje / calle posterior">
                Punto de acceso por pasaje / calle posterior
              </option>
              <option value="Caja NAP ubicada a más de 120 metros">
                Caja NAP ubicada a más de 120 metros
              </option>
            </select>
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
              className="px-4 py-2 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Generar Ticket y Guardar</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
