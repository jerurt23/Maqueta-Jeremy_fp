import React, { useState } from 'react';
import { Zap, Clock, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { TaskData } from '../../types/task';

interface HistorialTabProps {
  task: TaskData;
}

export const HistorialTab: React.FC<HistorialTabProps> = ({ task }) => {
  const [showAllVisits, setShowAllVisits] = useState(false);

  const displayedVisits = showAllVisits
    ? task.visitasPrevias
    : task.visitasPrevias.slice(0, 2);

  return (
    <div className="space-y-4 text-sm">
      {/* Cambios Registrados */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-blue-600 fill-blue-600" />
          <h4 className="font-bold text-slate-900 text-xs">
            Cambios Registrados
          </h4>
          <span className="w-5 h-5 flex items-center justify-center bg-blue-600 text-white rounded-full text-[10px] font-bold">
            {task.cambiosRegistrados?.length || 0}
          </span>
        </div>

        {(!task.cambiosRegistrados || task.cambiosRegistrados.length === 0) ? (
          <div className="bg-white border border-slate-200/90 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500 font-medium">
              Todavía no hay acciones registradas en esta tarea.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {task.cambiosRegistrados.map((change) => (
              <div
                key={change.id}
                className="bg-white border border-slate-200/90 rounded-xl p-3 shadow-xs text-xs space-y-1"
              >
                <div className="flex items-center justify-between text-slate-500 text-[11px]">
                  <span className="font-semibold text-slate-800">{change.user}</span>
                  <span>{change.timestamp}</span>
                </div>
                <p className="font-bold text-slate-900">{change.action}</p>
                {change.details && (
                  <p className="text-slate-600 text-[11px]">{change.details}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Visitas Previas del Cliente */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-600" />
          <h4 className="font-bold text-slate-900 text-xs">
            Visitas Previas del Cliente
          </h4>
          <span className="w-5 h-5 flex items-center justify-center bg-slate-700 text-white rounded-full text-[10px] font-bold">
            {task.visitasPrevias.length}
          </span>
        </div>

        <div className="space-y-3">
          {displayedVisits.map((visita) => (
            <div
              key={visita.id}
              className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-xs space-y-2.5"
            >
              {/* Encabezado con Fecha y Autor */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  <span>{visita.date}</span>
                </div>
                <span className="text-[11px] font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md border border-slate-200">
                  {visita.author}
                </span>
              </div>

              {/* Diagnóstico */}
              <div className="text-xs">
                <span className="font-extrabold text-slate-900">Diagnóstico: </span>
                <span className="font-medium text-slate-700 uppercase">
                  {visita.diagnostico}
                </span>
              </div>

              {/* Solución */}
              <div className="text-xs">
                <span className="font-extrabold text-slate-900">Solución: </span>
                <span className="font-medium text-slate-700 uppercase">
                  {visita.solucion}
                </span>
              </div>

              {/* Descripción en cursiva */}
              <p className="text-xs italic text-slate-600 font-normal leading-relaxed pt-1 border-t border-slate-100">
                {visita.descripcion}
              </p>
            </div>
          ))}

          {task.visitasPrevias.length > 2 && (
            <button
              onClick={() => setShowAllVisits(!showAllVisits)}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              {showAllVisits ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" />
                  <span>Mostrar menos</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" />
                  <span>Ver todas las visitas ({task.visitasPrevias.length})</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
