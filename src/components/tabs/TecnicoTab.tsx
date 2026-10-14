import React, { useState } from 'react';
import { Copy, Check, Edit2, Save, X } from 'lucide-react';
import { TaskData } from '../../types/task';

interface TecnicoTabProps {
  task: TaskData;
  onUpdateTask: (updated: Partial<TaskData>) => void;
  onShowToast: (message: string) => void;
}

export const TecnicoTab: React.FC<TecnicoTabProps> = ({
  task,
  onUpdateTask,
  onShowToast,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    troncal: task.troncal,
    odf: task.odf,
    hilo: task.hilo,
    caja: task.caja,
    puerto: task.puerto,
    datoOnt: task.datoOnt,
    macNoc: task.macNoc,
    macTv: task.macTv,
    macTv2: task.macTv2,
    macTv3: task.macTv3,
    macTv4: task.macTv4,
    marcaRepetidor: task.marcaRepetidor,
    nroRepetidor: task.nroRepetidor,
    macSwitch: task.macSwitch,
  });

  const handleCopy = (text: string, key: string) => {
    if (text === '-') return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    onShowToast(`Copiado: ${text}`);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateTask(editFormData);
    setIsEditing(false);
    onShowToast('Parámetros técnicos actualizados en Odoo');
  };

  const technicalItems = [
    { label: 'Troncal:', value: task.troncal, key: 'troncal' },
    { label: 'ODF:', value: task.odf, key: 'odf' },
    { label: 'Hilo:', value: task.hilo, key: 'hilo' },
    { label: 'Caja:', value: task.caja, key: 'caja' },
    { label: 'Puerto:', value: task.puerto, key: 'puerto' },
    { label: 'Dato ONT:', value: task.datoOnt, key: 'datoOnt' },
    { label: 'MAC NOC:', value: task.macNoc, key: 'macNoc', isMono: true },
    { label: 'MAC TV:', value: task.macTv, key: 'macTv', isMono: true },
    { label: 'MAC TV 2:', value: task.macTv2, key: 'macTv2', isMono: true },
    { label: 'MAC TV 3:', value: task.macTv3, key: 'macTv3', isMono: true },
    { label: 'MAC TV 4:', value: task.macTv4, key: 'macTv4', isMono: true },
    { label: 'Marca Repetidor:', value: task.marcaRepetidor, key: 'marcaRepetidor' },
    { label: 'Nro. Repetidor:', value: task.nroRepetidor, key: 'nroRepetidor', isMono: true },
    { label: 'MAC Switch:', value: task.macSwitch, key: 'macSwitch', isMono: true },
  ];

  return (
    <div className="space-y-3 text-sm">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Configuración Técnica de Fibra
        </span>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
        >
          {isEditing ? (
            <>
              <X className="w-3.5 h-3.5" />
              <span>Cancelar</span>
            </>
          ) : (
            <>
              <Edit2 className="w-3.5 h-3.5" />
              <span>Editar</span>
            </>
          )}
        </button>
      </div>

      {isEditing ? (
        <form onSubmit={handleSaveEdit} className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Troncal:</label>
              <input
                type="text"
                value={editFormData.troncal}
                onChange={(e) => setEditFormData({ ...editFormData, troncal: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-xs font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">ODF:</label>
              <input
                type="text"
                value={editFormData.odf}
                onChange={(e) => setEditFormData({ ...editFormData, odf: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-xs font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Hilo:</label>
              <input
                type="text"
                value={editFormData.hilo}
                onChange={(e) => setEditFormData({ ...editFormData, hilo: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-xs font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Caja:</label>
              <input
                type="text"
                value={editFormData.caja}
                onChange={(e) => setEditFormData({ ...editFormData, caja: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-xs font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Puerto:</label>
              <input
                type="text"
                value={editFormData.puerto}
                onChange={(e) => setEditFormData({ ...editFormData, puerto: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-xs font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Dato ONT:</label>
              <input
                type="text"
                value={editFormData.datoOnt}
                onChange={(e) => setEditFormData({ ...editFormData, datoOnt: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-xs"
              />
            </div>
            <div className="col-span-2">
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">MAC NOC:</label>
              <input
                type="text"
                value={editFormData.macNoc}
                onChange={(e) => setEditFormData({ ...editFormData, macNoc: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-xs font-mono uppercase"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Marca Repetidor:</label>
              <input
                type="text"
                value={editFormData.marcaRepetidor}
                onChange={(e) => setEditFormData({ ...editFormData, marcaRepetidor: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Nro. Repetidor:</label>
              <input
                type="text"
                value={editFormData.nroRepetidor}
                onChange={(e) => setEditFormData({ ...editFormData, nroRepetidor: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-xs font-mono uppercase"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg text-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Guardar Parámetros en Odoo</span>
          </button>
        </form>
      ) : (
        <div className="bg-white border border-slate-200/90 rounded-xl divide-y divide-slate-100 shadow-xs overflow-hidden">
          {technicalItems.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between p-2.5 sm:px-3.5 hover:bg-slate-50/60 transition-colors"
            >
              <span className="font-semibold text-slate-800 text-xs sm:text-sm">
                {item.label}
              </span>

              <div className="flex items-center gap-1.5">
                <span
                  onClick={() => handleCopy(item.value, item.key)}
                  title={item.value !== '-' ? 'Click para copiar' : undefined}
                  className={`px-3 py-1 bg-slate-100/90 text-slate-800 text-xs font-medium rounded-lg border border-slate-200/80 transition-all ${
                    item.isMono ? 'font-mono' : 'font-sans'
                  } ${item.value !== '-' ? 'cursor-pointer hover:bg-slate-200 active:scale-95' : ''}`}
                >
                  {item.value}
                </span>

                {item.value !== '-' && (
                  <button
                    onClick={() => handleCopy(item.value, item.key)}
                    className="text-slate-400 hover:text-slate-600 p-1"
                    title="Copiar"
                  >
                    {copiedKey === item.key ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
