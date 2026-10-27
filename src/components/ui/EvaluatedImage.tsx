import React from 'react';
import { PhotoEvidence } from '../../types/task';
import { Trash2 } from 'lucide-react';

interface EvaluatedImageProps {
  photo: PhotoEvidence;
  onPhotoClick?: () => void;
  onDelete?: (id: string) => void;
  className?: string;
  square?: boolean;
}

export const EvaluatedImage: React.FC<EvaluatedImageProps> = ({
  photo,
  onPhotoClick,
  onDelete,
  className = '',
  square = false,
}) => {
  const evaluacion = photo.evaluacion || '';
  const isMalo = evaluacion === 'Malo';
  const isBueno = evaluacion === 'Bueno';

  return (
    <div
      className={`relative group rounded-xl overflow-hidden border border-slate-200 bg-white shadow-2xs ${className}`}
    >
      <div
        className={`relative w-full overflow-hidden bg-slate-100 ${
          square ? 'aspect-square' : 'aspect-video'
        }`}
      >
        <img
          src={photo.url}
          alt={photo.title}
          className="w-full h-full object-cover cursor-pointer transition-opacity duration-200"
          style={{ opacity: isMalo ? 0.85 : 1 }}
          onClick={onPhotoClick}
        />

        {/* Píldora pequeña en la esquina superior izquierda */}
        {isMalo && (
          <div className="absolute top-2 left-2 z-20">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border shadow-md bg-red-100 text-red-700 border-red-200">
              MALO
            </span>
          </div>
        )}
        {isBueno && (
          <div className="absolute top-2 left-2 z-20">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border shadow-md bg-emerald-100 text-emerald-700 border-emerald-200">
              BUENO
            </span>
          </div>
        )}
      </div>

      <div className="p-1.5 bg-white">
        <p
          className={`text-[10px] font-bold truncate ${
            isMalo ? 'text-red-700' : isBueno ? 'text-emerald-700' : 'text-slate-800'
          }`}
          title={photo.title}
        >
          {photo.title}
        </p>
        <span className="text-[9px] text-slate-500 block truncate mt-0.5">
          {photo.category || 'Caja / Splitter'}
        </span>
      </div>

      {onDelete && (
        <button
          type="button"
          onClick={() => onDelete(photo.id)}
          className="absolute top-1 right-1 p-1 bg-red-600/80 hover:bg-red-600 rounded-md text-white opacity-0 group-hover:opacity-100 transition-opacity"
          title="Eliminar foto"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};
