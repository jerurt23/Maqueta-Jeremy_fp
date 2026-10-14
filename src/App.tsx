import React, { useState, useEffect, useRef } from 'react';
import { INITIAL_TASKS } from './data/mockData';
import { TaskData } from './types/task';
import { loadTasks, saveTasks, clearPersistedTasks, isStorageNearFull } from './utils/storage';
import { MapComponent } from './components/MapComponent';
import { TaskDrawer } from './components/TaskDrawer';
import { ExecutionAuditModal } from './components/modals/ExecutionAuditModal';
import {
  Menu,
  CheckCircle2,
  Cable,
  Camera,
  FileText,
  Layers,
  Wrench,
  Package,
  RotateCcw,
} from 'lucide-react';

export default function App() {
  // === Persistencia en localStorage ===
  // Leemos de forma perezosa para no romper SSR / renderizado inicial.
  const [tasks, setTasks] = useState<TaskData[]>(() => loadTasks());
  const [selectedTaskId, setSelectedTaskId] = useState<string>('task-9');
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(true);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(true);
  const [auditInitialStep, setAuditInitialStep] = useState<1 | 2 | 3>(1);
  const [centerCoordinates, setCenterCoordinates] = useState<[number, number] | undefined>(
    undefined
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Al montar, si la tarea seleccionada por defecto no existe en los datos
  // cargados (porque el usuario pudo resetear o cambiar el stored), apuntamos
  // a la primera disponible.
  useEffect(() => {
    setSelectedTaskId((prev) =>
      tasks.some((t) => t.id === prev) ? prev : tasks[0]?.id ?? prev
    );
    // Solo en mount:tasks ya viene inicializado desde localStorage.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Limpieza del timer del toast al desmontar.
  useEffect(
    () => () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    },
    []
  );

  const currentTask = tasks.find((t) => t.id === selectedTaskId) || tasks[0];

  const showToast = (message: string) => {
    setToastMessage(message);
    // Limpia el timer previo para que toasts seguidos no se pisen entre si.
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
      toastTimerRef.current = null;
    }, 3500);
  };

  const handleUpdateTask = (updatedFields: Partial<TaskData>) => {
    setTasks((prev) => {
      const next = prev.map((t) =>
        t.id === selectedTaskId ? { ...t, ...updatedFields } : t
      );
      // Persistimos el array completo tras cada cambio.
      const res = saveTasks(next);
      if (!res.ok) {
        showToast(
          res.reason === 'quota'
            ? '⚠️ Almacenamiento lleno: los cambios NO se guardarán al cerrar'
            : '⚠️ No se pudo guardar en este navegador'
        );
      } else if (isStorageNearFull()) {
        showToast('⚠️ Almacenamiento casi lleno: se recomienda limpiar fotos antiguas');
      }
      return next;
    });
  };

  const handleResetData = () => {
    clearPersistedTasks();
    setTasks(INITIAL_TASKS);
    setSelectedTaskId(INITIAL_TASKS[0]?.id ?? 'task-9');
    showToast('Datos restablecidos a los valores iniciales');
  };

  const handleSelectTask = (taskId: string) => {
    setSelectedTaskId(taskId);
    setIsDrawerOpen(true);
    const target = tasks.find((t) => t.id === taskId);
    if (target) {
      setCenterCoordinates(target.coordenadas);
    }
  };

  const handleCenterMap = () => {
    if (currentTask) {
      // Trigger center with slight random offset to force re-render flyTo effect
      setCenterCoordinates([...currentTask.coordenadas]);
    }
  };

  const handleOpenAuditModal = (step?: 1 | 2 | 3) => {
    const targetStep = step || 1;
    setAuditInitialStep(targetStep);
    setIsAuditModalOpen(true);
  };

  // Filter tasks based on search
  const filteredTasks = tasks.filter(
    (t) =>
      t.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.dni.includes(searchQuery) ||
      t.codSuscri.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.nroTicket.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentActividad =
    currentTask?.tipoActividad ||
    (currentTask?.initials === 'VT' ? 'VT' : currentTask?.initials === 'R' ? 'R' : 'I');

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-100 flex flex-col font-sans">
      {/* Top Floating Mini Header / Search Bar for Operations */}
      <header className="absolute top-3 left-3 sm:left-[500px] z-20 flex items-center gap-2 right-14 sm:right-auto flex-wrap">
        {/* Selector de 3 Actividades I, VT, R */}
        <div className="flex items-center bg-white/95 backdrop-blur-md p-1 rounded-2xl shadow-lg border border-slate-200/90 gap-1">
          <button
            onClick={() => handleUpdateTask({ tipoActividad: 'I', initials: 'I' })}
            title="I = INSTALACIÓN"
            className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs transition-all cursor-pointer ${
              currentActividad === 'I'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            I
          </button>
          <button
            onClick={() => handleUpdateTask({ tipoActividad: 'VT', initials: 'VT' })}
            title="VT = VISITA TÉCNICA"
            className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs transition-all cursor-pointer ${
              currentActividad === 'VT'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            VT
          </button>
          <button
            onClick={() => handleUpdateTask({ tipoActividad: 'R', initials: 'R' })}
            title="R = RETIRO"
            className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs transition-all cursor-pointer ${
              currentActividad === 'R'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            R
          </button>
        </div>

        {/* Acceso a Pasos según Actividad */}
        {currentActividad === 'I' ? (
          <div className="flex items-center bg-white/95 backdrop-blur-md p-1 rounded-2xl shadow-lg border border-slate-200/90 gap-1">
            <button
              onClick={() => handleOpenAuditModal(1)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 transition-all cursor-pointer border border-transparent hover:border-blue-200 active:scale-95"
              title="Abrir Paso 1: Foto de Fachada / Inicio"
            >
              <Camera className="w-3.5 h-3.5 text-blue-600" />
              <span>Paso 1: Fachada</span>
            </button>

            <button
              onClick={() => handleOpenAuditModal(2)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all cursor-pointer active:scale-95"
              title="Abrir Paso 2: Fotos Tarea, Caja, Fibra y Materiales"
            >
              <Cable className="w-3.5 h-3.5 text-white" />
              <span>Paso 2: Fotos y Materiales</span>
            </button>

            <button
              onClick={() => handleOpenAuditModal(3)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 transition-all cursor-pointer border border-transparent hover:border-emerald-200 active:scale-95"
              title="Abrir Paso 3: Cierre y Observaciones Técnicas"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              <span>Paso 3: Cierre</span>
            </button>
          </div>
        ) : currentActividad === 'VT' ? (
          <div className="flex items-center bg-white/95 backdrop-blur-md p-1 rounded-2xl shadow-lg border border-amber-300 gap-1">
            <button
              onClick={() => handleOpenAuditModal(1)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-700 transition-all cursor-pointer border border-transparent hover:border-amber-200 active:scale-95"
              title="Abrir Paso 1: Foto de Fachada / Inicio"
            >
              <Camera className="w-3.5 h-3.5 text-amber-600" />
              <span>Paso 1: Fachada</span>
            </button>
            <button
              onClick={() => handleOpenAuditModal(2)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition-all cursor-pointer active:scale-95"
              title="Abrir Paso 2: Evidencias Técnicas y Equipos"
            >
              <Wrench className="w-3.5 h-3.5 text-white" />
              <span>Paso 2: Evidencias</span>
            </button>
            <button
              onClick={() => handleOpenAuditModal(3)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 transition-all cursor-pointer border border-transparent hover:border-emerald-200 active:scale-95"
              title="Abrir Paso 3: Cierre y Observaciones"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              <span>Paso 3: Cierre</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center bg-white/95 backdrop-blur-md p-1 rounded-2xl shadow-lg border border-rose-300 gap-1">
            <button
              onClick={() => handleOpenAuditModal(1)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 transition-all cursor-pointer border border-transparent hover:border-rose-200 active:scale-95"
              title="Abrir Paso 1: Foto de Fachada / Inicio"
            >
              <Camera className="w-3.5 h-3.5 text-rose-600" />
              <span>Paso 1: Fachada</span>
            </button>
            <button
              onClick={() => handleOpenAuditModal(2)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-all cursor-pointer active:scale-95"
              title="Abrir Paso 2: Equipos Recuperados"
            >
              <Package className="w-3.5 h-3.5 text-white" />
              <span>Paso 2: Equipos</span>
            </button>
            <button
              onClick={() => handleOpenAuditModal(3)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 transition-all cursor-pointer border border-transparent hover:border-emerald-200 active:scale-95"
              title="Abrir Paso 3: Evidencias y Acta de Devolución"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              <span>Paso 3: Cierre</span>
            </button>
          </div>
        )}

        {!isDrawerOpen && (
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-800 font-bold px-3.5 py-2 rounded-xl shadow-md border border-slate-200 transition-all cursor-pointer text-xs sm:text-sm active:scale-95"
          >
            <Menu className="w-4 h-4 text-blue-600" />
            <span>Ver Ficha Tarea ({currentTask.nroTicket})</span>
          </button>
        )}

        {/* Restablecer datos locales (limpia localStorage) */}
        <button
          onClick={handleResetData}
          title="Borrar los datos guardados en este navegador y volver a los valores iniciales"
          className="flex items-center gap-1.5 bg-white/95 hover:bg-red-50 text-slate-500 hover:text-red-600 border border-slate-200 hover:border-red-300 px-3 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer active:scale-95"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Restablecer</span>
        </button>

        {/* Task quick badges */}
        <div className="hidden lg:flex items-center gap-1.5 bg-white/95 backdrop-blur-md p-1 rounded-xl shadow-md border border-slate-200 text-xs">
          <span className="text-[11px] font-bold text-slate-400 px-2 uppercase tracking-wider">
            Tareas en Ruta:
          </span>
          {tasks.map((t) => (
            <button
              key={t.id}
              onClick={() => handleSelectTask(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                t.id === selectedTaskId
                  ? t.markerColor === 'yellow'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-red-500 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
                {t.markerNumber}
              </span>
              <span className="truncate max-w-[130px]">{t.nombre.split(' ')[0]}</span>
              <span className="text-[10px] opacity-80">({t.nroTicket})</span>
            </button>
          ))}
        </div>

        {/* Odoo Online indicator */}
        <div className="hidden md:flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border border-slate-200 text-xs">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-slate-700">Odoo v17 Conectado</span>
          <span className="text-slate-300">|</span>
          <span className="font-semibold text-blue-600">NOC Online</span>
        </div>
      </header>

      {/* Main Map Canvas */}
      <main className="w-full h-full relative">
        <MapComponent
          tasks={filteredTasks}
          selectedTaskId={selectedTaskId}
          onSelectTask={handleSelectTask}
          centerCoordinates={centerCoordinates}
        />

        {/* Task Drawer on Left */}
        <TaskDrawer
          task={currentTask}
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          onCenterMap={handleCenterMap}
          onUpdateTask={handleUpdateTask}
          onShowToast={showToast}
          onOpenAuditModal={handleOpenAuditModal}
        />
      </main>

      {/* Execution Audit Modal */}
      <ExecutionAuditModal
        task={currentTask}
        isOpen={isAuditModalOpen}
        initialStep={auditInitialStep}
        onClose={() => setIsAuditModalOpen(false)}
        onUpdateTask={handleUpdateTask}
        onShowToast={showToast}
      />

      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="bg-slate-900/95 backdrop-blur-md text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-2xl border border-slate-700/80 flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}
