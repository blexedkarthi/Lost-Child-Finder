import React, { useState } from 'react';
import { MapPin, ShieldAlert, Navigation, Compass, AlertTriangle, Radio, Target } from 'lucide-react';
import { CameraFeed, LostChild } from '../types';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';

interface SurveillanceMapProps {
  cameras: CameraFeed[];
  lostChildren: LostChild[];
  googleMapsApiKey?: string;
}

export function SurveillanceMap({ cameras, lostChildren, googleMapsApiKey }: SurveillanceMapProps) {
  // Center on India average centroid or Bangalore/Majestic by default
  const [activeCenter, setActiveCenter] = useState({ lat: 12.9779, lng: 77.5694 }); // Bangalore
  const [activeZoom, setActiveZoom] = useState(13);
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);

  const hasValidGoogleKey = 
    Boolean(googleMapsApiKey) && 
    googleMapsApiKey !== 'YOUR_API_KEY' && 
    googleMapsApiKey.trim() !== '';

  const activeReports = lostChildren.filter(c => c.status !== 'Reunited');

  // Let user pan standard nodes inside India
  const transportHubs = [
    { name: "Bengaluru Majestic (KSR-SBC)", lat: 12.9779, lng: 77.5694 },
    { name: "Kempegowda Bus Stand", lat: 12.9784, lng: 77.5721 },
    { name: "Mumbai Central", lat: 18.9696, lng: 72.8194 },
    { name: "Dr. MGR Chennai Central", lat: 13.0824, lng: 80.2754 },
    { name: "New Delhi Terminal", lat: 28.6430, lng: 77.2197 }
  ];

  const panToHub = (lat: number, lng: number) => {
    setActiveCenter({ lat, lng });
    setActiveZoom(15);
  };

  return (
    <div className="bg-slate-900 border border-cyan-500/30 rounded-xl overflow-hidden shadow-2xl">
      
      {/* Top Banner mapping coordinates */}
      <div className="bg-slate-950 border-b border-cyan-500/20 p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <Navigation className="text-cyan-400 h-5 w-5 animate-pulse" />
          <div>
            <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-sans">
              Tactical Localization Grid
            </h2>
            <p className="text-[10px] text-slate-400 font-mono">
              SYSTEM LOCK ON: EAST CLOUD INTEGRITY // GEO-FENCED SHIELD DEPLOYED
            </p>
          </div>
        </div>

        {/* Quick Pan Buttons */}
        <div className="flex flex-wrap gap-1.5">
          {transportHubs.map(hub => (
            <button
              id={`btn-pan-hub-${hub.name.split(' ')[0]}`}
              key={hub.name}
              onClick={() => panToHub(hub.lat, hub.lng)}
              className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/40 text-[9px] font-mono text-cyan-300 rounded cursor-pointer transition-colors"
            >
              {hub.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 h-[550px]">
        
        {/* Left Side Panel showing active anchors */}
        <div className="lg:col-span-1 border-r border-slate-850 bg-slate-950/80 p-4 flex flex-col h-full overflow-y-auto custom-scrollbar">
          <h3 className="text-[11px] font-mono text-slate-400 uppercase tracking-widest mb-3 flex items-center">
            <Compass className="h-3.5 w-3.5 mr-1.5 text-cyan-400" /> Surveillance Coordinates
          </h3>

          <div className="space-y-3 flex-1">
            {/* Detected / Searching status list */}
            <div>
              <span className="text-[9px] font-mono text-cyan-400/80 uppercase block mb-1">CCTV Detections (Live)</span>
              <div className="space-y-1.5">
                {activeReports.map(child => (
                  <button
                    id={`btn-pin-map-${child.id}`}
                    key={child.id}
                    onClick={() => {
                      panToHub(child.coordinates.lat, child.coordinates.lng);
                      setSelectedPinId(child.id);
                    }}
                    className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all flex items-center space-x-2.5 cursor-pointer ${
                      selectedPinId === child.id 
                        ? 'bg-cyan-950/40 border-cyan-400' 
                        : child.status === 'Detected' 
                        ? 'bg-red-950/20 border-red-500/30 hover:border-red-400' 
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className={`p-1 rounded-full ${child.status === 'Detected' ? 'bg-red-500/10 text-red-400 animate-pulse' : 'bg-cyan-500/10 text-cyan-400'}`}>
                      <MapPin className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-slate-200 truncate">{child.name}</span>
                        <span className={`text-[8px] font-mono uppercase px-1 rounded ${child.status === 'Detected' ? 'bg-red-900/40 text-red-300 border border-red-500/20' : 'bg-cyan-900/40 text-cyan-300 border border-cyan-500/10'}`}>
                          {child.status}
                        </span>
                      </div>
                      <span className="text-[9px] text-slate-400 block truncate mt-0.5">{child.lastSeenLocation}</span>
                    </div>
                  </button>
                ))}
                {activeReports.length === 0 && (
                  <div className="text-center p-4 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 text-xs font-sans">
                    No active searches tracked on maps.
                  </div>
                )}
              </div>
            </div>

            {/* Camera units list */}
            <div>
              <span className="text-[9px] font-mono text-cyan-400/80 uppercase block mb-1">CCTV Optical Assets</span>
              <div className="space-y-1">
                {cameras.map(cam => (
                  <button
                    id={`btn-map-cam-${cam.id}`}
                    key={cam.id}
                    onClick={() => {
                      panToHub(cam.coordinates.lat, cam.coordinates.lng);
                      setSelectedPinId(cam.id);
                    }}
                    className="w-full text-left px-2 py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800/60 text-[10px] flex items-center justify-between transition-all"
                  >
                    <span className="text-slate-300 truncate tracking-tight">{cam.name.split(' (')[0]}</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${cam.status === 'Match Located' ? 'bg-red-500 animate-ping' : 'bg-emerald-400'}`} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 p-2.5 bg-slate-900/60 border border-cyan-500/15 rounded text-[10px] text-slate-400 leading-relaxed font-sans">
            <span className="font-mono text-cyan-400 font-bold block mb-0.5">⚠️ METROPOLITAN GEO-FENCE</span>
            Security nodes auto-restrict railway platforms and exit tunnels instantly when alert breaches occur.
          </div>
        </div>

        {/* Right Map viewport */}
        <div className="lg:col-span-3 bg-slate-950 flex flex-col items-center justify-center relative h-full">
          {hasValidGoogleKey ? (
            <APIProvider apiKey={googleMapsApiKey || ''}>
              <div className="w-full h-full">
                <Map
                  defaultCenter={activeCenter}
                  defaultZoom={activeZoom}
                  mapId="childshield_tactical_v1"
                >
                  {/* Render camera markers */}
                  {cameras.map(cam => (
                    <AdvancedMarker
                      key={cam.id}
                      position={cam.coordinates}
                      title={cam.name}
                    >
                      <div className={`p-1.5 rounded-full border shadow-lg ${cam.status === 'Match Located' ? 'bg-red-600 border-red-400 text-white animate-bounce' : 'bg-slate-800 border-slate-650 text-emerald-400'}`}>
                        <Radio className="h-4 w-4" />
                      </div>
                    </AdvancedMarker>
                  ))}

                  {/* Render children markers */}
                  {activeReports.map(child => (
                    <AdvancedMarker
                      key={child.id}
                      position={child.coordinates}
                      title={child.name}
                    >
                      <Pin 
                        background={child.status === 'Detected' ? '#ef4444' : '#06b6d4'}
                        borderColor="#ffffff" 
                        glyphColor="#ffffff"
                      />
                    </AdvancedMarker>
                  ))}
                </Map>
              </div>
            </APIProvider>
          ) : (
            // Tactical Radar Fallback Map
            <div className="w-full h-full relative overflow-hidden bg-slate-950 flex flex-col justify-end p-4">
              
              {/* Radar Circular Sweep backdrop */}
              <div className="absolute inset-0 flex items-center justify-center opacity-40">
                <div className="w-[450px] h-[450px] border border-cyan-500/20 rounded-full flex items-center justify-center relative animate-pulse">
                  <div className="w-[300px] h-[300px] border border-cyan-500/10 rounded-full flex items-center justify-center">
                    <div className="w-[150px] h-[150px] border border-cyan-500/5 rounded-full" />
                  </div>
                  
                  {/* Rotating sweep hand */}
                  <div className="absolute inset-0 border-l border-cyan-500/20 rounded-full animate-radar-sweep pointer-events-none" />
                </div>
              </div>

              {/* Grid lines */}
              <div className="absolute inset-0 bg-grid-white/[0.015] bg-[size:30px_30px]" />

              {/* Pulsing Target Overlay showing Fallback Map active area */}
              <div className="absolute top-4 left-4 bg-slate-900/90 border border-cyan-500/20 p-2.5 rounded font-mono text-[9px] text-slate-300 space-y-1">
                <div className="text-cyan-400 font-bold uppercase flex items-center">
                  <Target className="h-3.5 w-3.5 mr-1" /> SECURE RADAR FALLBACK OPERATIVE
                </div>
                <div>LOCAL ANCHOR: LAT {activeCenter.lat.toFixed(4)} // LNG {activeCenter.lng.toFixed(4)}</div>
                <div>ACCURACY: TIER-1 SATELLITE TELEMETRY GLIDE</div>
                <div>STATUS: ACTIVE TRACKING ({activeReports.length} LABELS LOCKED)</div>
              </div>

              {/* Fallback Map Mock Indian Hub pins rendering visual boxes */}
              <div className="absolute inset-0 flex items-center justify-center">
                {cameras.map(cam => {
                  // Calculate dynamic offset from Bengaluru center for visualization
                  const dLat = (cam.coordinates.lat - activeCenter.lat) * 2000;
                  const dLng = (cam.coordinates.lng - activeCenter.lng) * 2000;

                  // Bound limits so it fits center nicely
                  const x = Math.max(-180, Math.min(180, dLng));
                  const y = Math.max(-185, Math.min(185, -dLat)); // Invert Y for screen coordinates

                  const isAlert = cam.status === 'Match Located';

                  return (
                    <div
                      key={cam.id}
                      style={{ transform: `translate(${x}px, ${y}px)` }}
                      className="absolute p-2 transition-all duration-300"
                    >
                      <div className="relative group cursor-pointer" onClick={() => setSelectedPinId(cam.id)}>
                        <div className={`p-1.5 rounded-lg border flex items-center justify-center ${
                          isAlert 
                            ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse' 
                            : 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                        }`}>
                          <Radio className="h-3.5 w-3.5" />
                        </div>
                        
                        {/* Pulse animation for located match */}
                        {isAlert && (
                          <span className="absolute -inset-1 rounded-lg border-2 border-red-500 animate-ping opacity-75" />
                        )}

                        {/* Hover tag / label */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1.5 hidden group-hover:block bg-black border border-slate-700 py-1 px-2 rounded font-sans text-[10px] text-slate-200 whitespace-nowrap z-30">
                          {cam.name.replace(' (KSR Bengaluru ', ' (SBC ')}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Render children target locks */}
                {activeReports.map(child => {
                  const dLat = (child.coordinates.lat - activeCenter.lat) * 2000;
                  const dLng = (child.coordinates.lng - activeCenter.lng) * 2000;

                  const x = Math.max(-180, Math.min(180, dLng));
                  const y = Math.max(-185, Math.min(185, -dLat));

                  const isAlert = child.status === 'Detected';

                  return (
                    <div
                      key={child.id}
                      style={{ transform: `translate(${x}px, ${y}px)` }}
                      className="absolute p-2 transition-all duration-300 z-20 font-mono"
                    >
                      <div className="relative group cursor-pointer" onClick={() => setSelectedPinId(child.id)}>
                        <div className={`p-1 rounded-full border-2 ${
                          isAlert 
                            ? 'bg-red-600 border-white text-white animate-bounce' 
                            : 'bg-cyan-500 border-slate-900 text-slate-950'
                        }`}>
                          <MapPin className="h-3 w-3" />
                        </div>

                        {/* Label tag */}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-black border border-slate-700 py-0.5 px-1 rounded text-[9px] text-slate-300 whitespace-nowrap z-20 shadow-md">
                          {child.name}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Informative details overlay at bottom */}
              <div className="relative z-10 w-full bg-slate-900/90 border border-slate-800 p-2.5 rounded-lg flex items-center justify-between text-[10px] font-sans text-slate-400">
                <div className="flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  <span>Showing relative offsets from selected terminal</span>
                </div>
                <span>*Add GOOGLE_MAPS_PLATFORM_KEY for real streets render.</span>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
