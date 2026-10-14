import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { TaskData } from '../types/task';
import { Layers, Crosshair, Map as MapIcon, Maximize } from 'lucide-react';

interface MapComponentProps {
  tasks: TaskData[];
  selectedTaskId: string;
  onSelectTask: (taskId: string) => void;
  centerCoordinates?: [number, number];
}

export const MapComponent: React.FC<MapComponentProps> = ({
  tasks,
  selectedTaskId,
  onSelectTask,
  centerCoordinates,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const [currentLayer, setCurrentLayer] = React.useState<'streets' | 'satellite' | 'topo'>('streets');

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Center around SMP, Lima (near Jr. Maracaibo / Av. José Granda)
    const map = L.map(mapContainerRef.current, {
      center: [-12.02983, -77.05445],
      zoom: 16,
      zoomControl: false, // will add in top-right to match screenshot
    });

    // Add zoom control in top-right as seen in screenshot
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Default OpenStreetMap layer
    const streetsLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    tileLayerRef.current = streetsLayer;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Layer if changed
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }

    let url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    let attr = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

    if (currentLayer === 'satellite') {
      url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      attr = '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
    } else if (currentLayer === 'topo') {
      url = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
      attr = 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)';
    }

    const newLayer = L.tileLayer(url, {
      maxZoom: 19,
      attribution: attr,
    }).addTo(mapInstanceRef.current);

    tileLayerRef.current = newLayer;
  }, [currentLayer]);

  // Update Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous markers
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    tasks.forEach((task) => {
      const isSelected = task.id === selectedTaskId;
      const markerClass = task.markerColor === 'yellow' ? 'custom-map-marker-yellow' : 'custom-map-marker-red';

      // Custom DivIcon matching screenshot
      const icon = L.divIcon({
        className: 'custom-leaflet-marker-wrapper',
        html: `<div class="${markerClass} ${isSelected ? 'active ring-4 ring-blue-500/50' : ''}">
          <span>${task.markerNumber}</span>
        </div>`,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
      });

      const marker = L.marker(task.coordenadas, { icon }).addTo(map);

      // Popup content with preview
      const popupContent = `
        <div style="font-family: inherit; font-size: 12px; line-height: 1.4; min-width: 190px;">
          <div style="font-weight: 800; color: #0f172a; margin-bottom: 2px;">${task.nombre}</div>
          <div style="color: #475569; font-size: 11px; margin-bottom: 4px;">DNI: ${task.dni} · Ticket: <strong>${task.nroTicket}</strong></div>
          <div style="color: #64748b; font-size: 10px; margin-bottom: 6px;">${task.direccion}</div>
          <div style="display: inline-block; padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 10px; background: ${task.estado === 'REPROGRAMADO' ? '#e2e8f0' : '#dcfce7'}; color: ${task.estado === 'REPROGRAMADO' ? '#334155' : '#15803d'};">
            ${task.estado}
          </div>
        </div>
      `;
      marker.bindPopup(popupContent);

      marker.on('click', () => {
        onSelectTask(task.id);
      });

      markersRef.current[task.id] = marker;
    });
  }, [tasks, selectedTaskId, onSelectTask]);

  // Center on coordinates when triggered (e.g. "Ubicación en Mapa")
  useEffect(() => {
    if (!mapInstanceRef.current || !centerCoordinates) return;
    mapInstanceRef.current.flyTo(centerCoordinates, 17, {
      duration: 1.2,
    });
  }, [centerCoordinates]);

  const handleCenterOnSelected = () => {
    const selected = tasks.find((t) => t.id === selectedTaskId);
    if (selected && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(selected.coordenadas, 17, {
        duration: 1,
      });
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Floating Map Controls at Top-Right (near Leaflet zoom) */}
      <div className="absolute top-20 right-2.5 z-20 flex flex-col gap-2">
        <button
          onClick={handleCenterOnSelected}
          className="p-2.5 bg-white hover:bg-slate-100 text-slate-700 rounded-lg shadow-md border border-slate-200 transition-colors cursor-pointer"
          title="Centrar en tarea seleccionada"
        >
          <Crosshair className="w-4 h-4 text-slate-800" />
        </button>

        <div className="relative group">
          <button
            className="p-2.5 bg-white hover:bg-slate-100 text-slate-700 rounded-lg shadow-md border border-slate-200 transition-colors cursor-pointer"
            title="Cambiar capa de mapa"
          >
            <Layers className="w-4 h-4 text-slate-800" />
          </button>
          
          <div className="absolute right-full top-0 mr-2 hidden group-hover:flex flex-col bg-white rounded-lg shadow-xl border border-slate-200 p-1 min-w-[120px] text-xs font-semibold text-slate-700">
            <button
              onClick={() => setCurrentLayer('streets')}
              className={`px-3 py-1.5 text-left rounded-md ${currentLayer === 'streets' ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-100'}`}
            >
              Calles (OSM)
            </button>
            <button
              onClick={() => setCurrentLayer('satellite')}
              className={`px-3 py-1.5 text-left rounded-md ${currentLayer === 'satellite' ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-100'}`}
            >
              Satélite
            </button>
            <button
              onClick={() => setCurrentLayer('topo')}
              className={`px-3 py-1.5 text-left rounded-md ${currentLayer === 'topo' ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-100'}`}
            >
              Topográfico
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
