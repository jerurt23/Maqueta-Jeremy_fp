import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Tag,
  Clock,
  Move,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import { PhotoEvidence } from '../../types/task';

export interface PhotoLightboxViewerProps {
  isOpen: boolean;
  photos: PhotoEvidence[];
  initialIndex?: number;
  onClose: () => void;
  onEvaluacionChange?: (
    id: string,
    evaluacion: 'Bueno' | 'Malo' | ''
  ) => void;
}

export const PhotoLightboxViewer: React.FC<PhotoLightboxViewerProps> = ({
  isOpen,
  photos,
  initialIndex = 0,
  onClose,
  onEvaluacionChange,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex);
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const hasMovedRef = useRef<boolean>(false);

  // Sync initialIndex when opening
  useEffect(() => {
    if (isOpen) {
      const validIndex = Math.max(0, Math.min(initialIndex, photos.length - 1));
      setCurrentIndex(validIndex);
      setZoom(1);
      setPan({ x: 0, y: 0 });
    }
  }, [isOpen, initialIndex, photos.length]);

  const currentPhoto = photos[currentIndex];

  const resetTransform = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const handleNext = useCallback(() => {
    if (photos.length <= 1) return;
    resetTransform();
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  }, [photos.length, resetTransform]);

  const handlePrev = useCallback(() => {
    if (photos.length <= 1) return;
    resetTransform();
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  }, [photos.length, resetTransform]);

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(Number((prev * 1.25).toFixed(2)), 6));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => {
      const next = Math.max(Number((prev * 0.8).toFixed(2)), 1);
      if (next <= 1) setPan({ x: 0, y: 0 });
      return next;
    });
  }, []);

  // Keyboard navigation & zoom
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Zoom with ArrowUp and ArrowDown
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setZoom((prev) => Math.min(Number((prev * 1.25).toFixed(2)), 6));
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setZoom((prev) => {
          const next = Math.max(Number((prev * 0.8).toFixed(2)), 1);
          if (next <= 1) setPan({ x: 0, y: 0 });
          return next;
        });
      }
      // Navigate photos with ArrowLeft and ArrowRight
      else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      }
      // Escape to close
      else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
      // Quick zoom with + and -
      else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        setZoom((prev) => Math.min(Number((prev * 1.25).toFixed(2)), 6));
      } else if (e.key === '-') {
        e.preventDefault();
        setZoom((prev) => {
          const next = Math.max(Number((prev * 0.8).toFixed(2)), 1);
          if (next <= 1) setPan({ x: 0, y: 0 });
          return next;
        });
      } else if (e.key === '0') {
        e.preventDefault();
        resetTransform();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNext, handlePrev, onClose, resetTransform]);

  // Non-passive wheel event listener on container to allow preventDefault
  useEffect(() => {
    if (!isOpen) return;
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (e.deltaY < 0) {
        // Zoom In
        setZoom((prev) => Math.min(Number((prev * 1.15).toFixed(2)), 6));
      } else {
        // Zoom Out
        setZoom((prev) => {
          const next = Math.max(Number((prev * 0.85).toFixed(2)), 1);
          if (next <= 1) setPan({ x: 0, y: 0 });
          return next;
        });
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [isOpen]);

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    setIsDragging(true);
    hasMovedRef.current = false;
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    hasMovedRef.current = true;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch pan handlers for touch screens
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPan({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Double click toggles between 2x and 1x zoom
  const handleDoubleClick = () => {
    if (zoom > 1.2) {
      resetTransform();
    } else {
      setZoom(2.2);
    }
  };

  if (!isOpen || !currentPhoto) return null;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="fixed inset-0 z-70 bg-black/92 backdrop-blur-md flex flex-col select-none overflow-hidden animate-in fade-in duration-150"
    >
      {/* Top Header Bar */}
      <div className="relative z-20 flex items-center justify-between px-4 sm:px-6 py-3 bg-black/60 border-b border-white/10 text-white backdrop-blur-sm">
        {/* Left: Info */}
        <div className="flex items-center gap-3 min-w-0 pr-4">
          <span className="px-2.5 py-1 rounded-full bg-blue-600/80 text-blue-100 font-extrabold text-[11px] shrink-0">
            Foto {currentIndex + 1} de {photos.length}
          </span>

          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-bold text-white truncate max-w-[260px] sm:max-w-md">
              {currentPhoto.title || 'Evidencia fotográfica'}
            </h4>
            <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-slate-300">
              {currentPhoto.category && (
                <span className="flex items-center gap-1 font-medium text-blue-300">
                  <Tag className="w-3 h-3 text-blue-400" />
                  {currentPhoto.category}
                </span>
              )}
              {currentPhoto.timestamp && (
                <span className="flex items-center gap-1 text-slate-400">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {currentPhoto.timestamp}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Zoom indicator & Close button */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-white/10 rounded-lg text-xs font-mono font-bold text-slate-200">
            <span>{Math.round(zoom * 100)}%</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-red-600 hover:text-white rounded-xl text-slate-300 transition-colors cursor-pointer"
            title="Cerrar visor (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Photo Viewport Canvas */}
      <div
        className="relative flex-1 flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onDoubleClick={handleDoubleClick}
      >
        <div
          style={{
            transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 120ms ease-out',
          }}
          className="max-w-[90vw] max-h-[80vh] flex items-center justify-center pointer-events-none"
        >
          <img
            src={currentPhoto.url}
            alt={currentPhoto.title || 'Foto ampliada'}
            draggable={false}
            className={`max-w-[90vw] max-h-[78vh] object-contain rounded-lg shadow-2xl drop-shadow-2xl select-none ${
              currentPhoto.evaluacion === 'Malo' ? 'opacity-85' : ''
            }`}
          />

          {/* Píldora de evaluación sobre la imagen (misma posición que en la galería: esquina superior izquierda) */}
          {currentPhoto.evaluacion === 'Malo' && (
            <div className="absolute top-3 left-3 z-20">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border shadow-md bg-red-100 text-red-700 border-red-200">
                MALO
              </span>
            </div>
          )}
          {currentPhoto.evaluacion === 'Bueno' && (
            <div className="absolute top-3 left-3 z-20">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border shadow-md bg-emerald-100 text-emerald-700 border-emerald-200">
                BUENO
              </span>
            </div>
          )}
        </div>

        {/* Navigation Arrows on Left and Right (visible if more than 1 photo) */}
        {photos.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 p-3 sm:p-3.5 bg-black/60 hover:bg-blue-600/90 text-white rounded-2xl backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-xl hover:scale-105 active:scale-95 group"
              title="Foto anterior (Flecha Izquierda ←)"
            >
              <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7 group-hover:-translate-x-0.5 transition-transform" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 p-3 sm:p-3.5 bg-black/60 hover:bg-blue-600/90 text-white rounded-2xl backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-xl hover:scale-105 active:scale-95 group"
              title="Siguiente foto (Flecha Derecha →)"
            >
              <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </>
        )}
      </div>

      {/* Floating Bottom Control Bar */}
      <div className="relative z-20 px-4 py-3 bg-black/60 border-t border-white/10 backdrop-blur-sm flex flex-col sm:flex-row items-center justify-between gap-2.5 text-white">
        {/* Legend / Instructions */}
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-[10px] sm:text-xs text-slate-300">
          <span className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-md">
            <span>🖱️ Ruedita</span>
            <span className="text-slate-400">/</span>
            <span className="font-bold">↑ ↓</span>
            <span className="text-slate-300 font-medium">Zoom</span>
          </span>
          <span className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-md">
            <Move className="w-3 h-3 text-blue-400" />
            <span className="text-slate-300 font-medium">Clic y arrastra para mover</span>
          </span>
          {photos.length > 1 && (
            <span className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-md">
              <span className="font-bold">← →</span>
              <span className="text-slate-300 font-medium">Siguiente / Anterior</span>
            </span>
          )}
          <span className="hidden md:inline-flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-md text-slate-400">
            <span>Esc: Cerrar</span>
          </span>
        </div>

        {/* Evaluación de la foto (solo fotos de caja / splitter) */}
        {currentPhoto.type === 'caja' && onEvaluacionChange && (
          <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 backdrop-blur-sm">
            <span className="text-[10px] text-slate-300 font-medium">Evaluar foto:</span>
            <button
              type="button"
              onClick={() => onEvaluacionChange(currentPhoto.id, 'Bueno')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                currentPhoto.evaluacion === 'Bueno'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'bg-white/10 text-emerald-300 hover:bg-emerald-200/30 border border-emerald-300/30'
              }`}
            >
              <ThumbsUp className="w-3 h-3" />
              <span>Bueno</span>
            </button>
            <button
              type="button"
              onClick={() => onEvaluacionChange(currentPhoto.id, 'Malo')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                currentPhoto.evaluacion === 'Malo'
                  ? 'bg-red-500 text-white shadow-sm'
                  : 'bg-white/10 text-red-300 hover:bg-red-200/30 border border-red-300/30'
              }`}
            >
              <ThumbsDown className="w-3 h-3" />
              <span>Malo</span>
            </button>
          </div>
        )}

        {/* Toolbar Buttons: Zoom Out, Percentage, Zoom In, Reset */}
        <div className="flex items-center gap-1.5 bg-white/10 p-1 rounded-xl border border-white/10 shrink-0">
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={zoom <= 1}
            className="p-1.5 sm:p-2 bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10 text-white rounded-lg transition-colors cursor-pointer"
            title="Alejar (Flecha Abajo ↓)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={resetTransform}
            className="px-2.5 py-1 text-xs font-mono font-bold hover:bg-white/20 rounded-lg text-slate-200 transition-colors cursor-pointer"
            title="Restablecer tamaño (100%)"
          >
            {Math.round(zoom * 100)}%
          </button>

          <button
            type="button"
            onClick={handleZoomIn}
            disabled={zoom >= 6}
            className="p-1.5 sm:p-2 bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10 text-white rounded-lg transition-colors cursor-pointer"
            title="Acercar (Flecha Arriba ↑)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <div className="w-px h-4 bg-white/20 mx-0.5" />

          <button
            type="button"
            onClick={resetTransform}
            className="p-1.5 sm:p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors cursor-pointer"
            title="Centrar y reiniciar zoom"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
