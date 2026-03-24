import { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';

interface MapPickerProps {
  lat?: number;
  lng?: number;
  onLocationSelect?: (lat: number, lng: number) => void;
  height?: string;
  disabled?: boolean;
}

/**
 * Leaflet-based map picker for selecting farm location.
 * Dynamically loads Leaflet CSS/JS to avoid SSR bundling issues.
 */
export default function MapPicker({ lat = 12.9716, lng = 77.5946, onLocationSelect, height = '300px', disabled = false }: MapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [selectedLat, setSelectedLat] = useState(lat);
  const [selectedLng, setSelectedLng] = useState(lng);
  const [isLoaded, setIsLoaded] = useState(false);

  // Dynamically load Leaflet
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if Leaflet is already loaded
    if ((window as any).L) {
      setIsLoaded(true);
      return;
    }

    // Load CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    // Load JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => setIsLoaded(true);
    document.head.appendChild(script);

    return () => {
      // Cleanup is not strictly necessary for the global leaflet but good practice
    };
  }, []);

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !mapRef.current || mapInstanceRef.current) return;

    const L = (window as any).L;
    const map = L.map(mapRef.current).setView([selectedLat, selectedLng], 10);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    const marker = L.marker([selectedLat, selectedLng], { draggable: !disabled }).addTo(map);
    markerRef.current = marker;
    mapInstanceRef.current = map;

    if (!disabled) {
      map.on('click', (e: any) => {
        const { lat: newLat, lng: newLng } = e.latlng;
        marker.setLatLng([newLat, newLng]);
        setSelectedLat(newLat);
        setSelectedLng(newLng);
        onLocationSelect?.(newLat, newLng);
      });

      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        setSelectedLat(pos.lat);
        setSelectedLng(pos.lng);
        onLocationSelect?.(pos.lat, pos.lng);
      });
    }

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [isLoaded]);

  if (!isLoaded) {
    return (
      <div style={{ height }} className="bg-gray-100 rounded-xl border border-gray-200 flex items-center justify-center animate-pulse">
        <div className="text-center text-gray-400">
          <MapPin className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm font-medium">Loading Map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div ref={mapRef} style={{ height }} className="rounded-xl border border-gray-200 overflow-hidden shadow-sm z-0" />
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {selectedLat.toFixed(4)}, {selectedLng.toFixed(4)}</span>
        {!disabled && <span className="text-gray-400">Click on the map or drag the marker to set location</span>}
      </div>
    </div>
  );
}
