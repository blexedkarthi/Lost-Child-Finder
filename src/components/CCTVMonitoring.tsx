import React, { useState, useEffect } from 'react';
import { Camera, ShieldAlert, Cpu, AlertTriangle, Eye, Video, Signal, Settings, HelpCircle } from 'lucide-react';
import { CameraFeed, LostChild } from '../types';

interface CCTVMonitoringProps {
  cameras: CameraFeed[];
  lostChildren: LostChild[];
  onTriggerSimulation: (childId: string, cameraId: string, confidence: number) => void;
}

export function CCTVMonitoring({ cameras, lostChildren, onTriggerSimulation }: CCTVMonitoringProps) {
  const [activeCamId, setActiveCamId] = useState<string | null>(null);
  const [selectedChildId, setSelectedChildId] = useState('');
  const [simConfidence, setSimConfidence] = useState(94);
  const [streamingStatus, setStreamingStatus] = useState<Record<string, boolean>>({
    CAM_01: true,
    CAM_02: true,
    CAM_03: true,
    CAM_04: true,
    CAM_05: true
  });

  const searchingChildren = lostChildren.filter(c => c.status === 'Searching');

  useEffect(() => {
    if (searchingChildren.length > 0 && !selectedChildId) {
      setSelectedChildId(searchingChildren[0].id);
    }
  }, [searchingChildren, selectedChildId]);

  const toggleStream = (id: string) => {
    setStreamingStatus(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      
      {/* Sidebar Controls and Sim Trigger panel */}
      <div className="lg:col-span-1 space-y-6">
        
        {/* Trigger Simulation Block */}
        <div className="bg-slate-900 border border-red-500/30 p-4 rounded-xl shadow-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 bg-red-500 text-black text-[9px] uppercase tracking-widest font-mono font-bold px-2 py-0.5 rounded-bl">
            Developer Sandbox
          </div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-red-400 mb-2 font-sans flex items-center space-x-1.5">
            <Cpu className="h-4 w-4 animate-spin text-red-500" />
            <span>AI CCTV Match Simulator</span>
          </h3>
          <p className="text-[11px] text-slate-400 font-sans leading-relaxed mb-4">
            Emulate deep facial recognition models matching children in public crowds. Force real-time SMS broadcasts!
          </p>

          <div className="space-y-3">
            <div>
              <label id="lbl-sim-child" className="block text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-1">
                Select Missing Child
              </label>
              {searchingChildren.length === 0 ? (
                <div className="bg-slate-950/60 border border-slate-800 text-slate-400 p-2 rounded text-xs font-sans text-center">
                  No active SEARCHING records. Add a case in the Portal first!
                </div>
              ) : (
                <select
                  id="sel-sim-child"
                  value={selectedChildId}
                  onChange={(e) => setSelectedChildId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-red-500 decoration-none"
                >
                  {searchingChildren.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.gender}, Age {c.age})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label id="lbl-sim-camera" className="block text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-1">
                Active CCTV Feed Hub
              </label>
              <select
                id="sel-sim-camera"
                value={activeCamId || 'CAM_01'}
                onChange={(e) => setActiveCamId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-red-500"
              >
                {cameras.map(cam => (
                  <option key={cam.id} value={cam.id}>
                    {cam.name.replace('(KSR Bengaluru ', '').replace(' Platform 4)', '').slice(0, 30)}...
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-1">
                <span>Verification Accuracy</span>
                <span className="text-cyan-400 font-bold">{simConfidence}% matches</span>
              </div>
              <input
                id="rng-sim-confidence"
                type="range"
                min="75"
                max="99"
                value={simConfidence}
                onChange={(e) => setSimConfidence(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            <button
              id="btn-trigger-matching-simulation"
              disabled={searchingChildren.length === 0}
              onClick={() => onTriggerSimulation(selectedChildId, activeCamId || 'CAM_01', simConfidence)}
              className="w-full mt-2 bg-red-600 hover:bg-red-500 active:scale-95 text-xs text-white tracking-widest font-bold uppercase font-sans py-2 px-3 rounded-lg flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-red-950/30"
            >
              <ShieldAlert className="h-4 w-4 animate-bounce" />
              <span>Broadcast Detection</span>
            </button>
          </div>
        </div>

        {/* Diagnostic Monitor panel */}
        <div className="bg-slate-900 border border-cyan-500/20 p-4 rounded-xl shadow-md">
          <h3 className="text-xs font-semibold uppercase tracking-width tracking-wider text-cyan-400 mb-3 font-sans flex items-center space-x-1.5">
            <Settings className="h-4 w-4" />
            <span>Node Sensors Diagnostics</span>
          </h3>
          <div className="space-y-3 font-mono text-[10px]">
            {cameras.map(cam => (
              <div key={cam.id} className="p-2 bg-slate-950 rounded border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-slate-300 font-sans font-medium block">{cam.id}: {cam.name.split(' (')[0]}</span>
                  <span className="text-[9px] text-slate-500">Latency: {cam.status === 'Offline' ? '∞ ms' : `${Math.floor(Math.random() * 45) + 12}ms`} // Frame rate: 24 fps</span>
                </div>
                <div className="text-right">
                  <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${cam.status === 'Match Located' ? 'bg-red-500 animate-ping' : cam.status === 'Offline' ? 'bg-slate-600' : 'bg-emerald-500 animate-pulse'}`} />
                  <span className={`uppercase tracking-tighter ${cam.status === 'Match Located' ? 'text-red-400' : cam.status === 'Offline' ? 'text-slate-500' : 'text-emerald-400'}`}>
                    {cam.status === 'Match Located' ? 'Spot Match' : cam.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CCTV Streaming Matrix - Grid representing video streams */}
      <div className="lg:col-span-3 space-y-4">
        <div className="flex justify-between items-center bg-slate-950 p-3 rounded-lg border border-slate-800">
          <div className="flex items-center space-x-2">
            <Video className="text-cyan-400 h-5 w-5" />
            <h2 className="text-sm font-semibold text-slate-200 font-sans tracking-wide">
              ChildShield Central Video Matrix (Smart Railway Feeds)
            </h2>
          </div>
          <span className="text-[10px] font-mono bg-cyan-900/40 text-cyan-400 px-2.5 py-0.5 border border-cyan-500/20 rounded">
            SYS SPEED: 4 SENSORS/SEC
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cameras.map((cam, index) => {
            const isLive = streamingStatus[cam.id];
            const isAlert = cam.status === 'Match Located';
            const matchedChildObj = lostChildren.find(c => c.detectedAtCamera === cam.id && c.status === 'Detected');

            return (
              <div
                key={cam.id}
                className={`relative bg-slate-950 rounded-xl overflow-hidden border transition-all duration-300 h-64 flex flex-col justify-between ${
                  isAlert 
                    ? 'border-red-500 shadow-lg shadow-red-950/40 ring-1 ring-red-500/40' 
                    : activeCamId === cam.id 
                    ? 'border-cyan-400 shadow-md shadow-cyan-950/20' 
                    : 'border-slate-800'
                }`}
                onClick={() => setActiveCamId(cam.id)}
              >
                
                {/* Simulated Camera Video content */}
                <div className="absolute inset-0 z-0 bg-slate-950 flex flex-col items-center justify-center overflow-hidden">
                  {!isLive ? (
                    <div className="text-center p-4">
                      <Signal className="h-8 w-8 text-slate-700 mx-auto mb-2 animate-bounce" />
                      <p className="text-xs text-slate-500 font-mono">SIGNAL STREAM SHUT</p>
                    </div>
                  ) : (
                    <>
                      {/* Grid overlays */}
                      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:24px_24px] pointer-events-none" />
                      
                      {/* Pulsing Scan lines */}
                      <div className="absolute inset-x-0 top-0 h-0.5 bg-cyan-500/30 shadow-[0_0_8px_rgba(34,211,238,0.5)] animate-cctv-scan pointer-events-none" />

                      {/* Mock people / crowd visuals */}
                      <div className="relative text-center select-none w-full h-full flex flex-col justify-center items-center font-mono opacity-80">
                        
                        {/* Simulation boxes around targets */}
                        {isAlert && matchedChildObj ? (
                          <div className="absolute w-32 h-32 border-2 border-red-500 rounded flex flex-col items-center justify-between p-1 z-10 animate-pulse bg-red-950/20">
                            <span className="bg-red-500 text-black text-[9px] font-bold px-1 rounded uppercase tracking-wider font-mono">
                              TARGET LOCKED: {matchedChildObj.matchConfidence}%
                            </span>
                            
                            {/* Inner reticle */}
                            <div className="w-4 h-4 border border-dashed border-red-400 rounded-full animate-spin" />
                            
                            <span className="text-[10px] text-red-400 bg-black/80 px-1 rounded font-bold font-sans">
                              {matchedChildObj.name}
                            </span>
                          </div>
                        ) : (
                          <div className="absolute w-16 h-16 border border-cyan-500/40 rounded flex flex-col items-center justify-between p-0.5 pointer-events-none opacity-30">
                            <span className="text-[7px] text-cyan-400 bg-slate-950 px-0.5">SCAN-A20</span>
                          </div>
                        )}

                        {/* Extra tiny mock trackers to make feed look complex */}
                        <div className="absolute top-1/4 right-1/4 w-8 h-8 border border-white/10 rounded pointer-events-none" />
                        <div className="absolute bottom-1/3 left-1/3 w-10 h-10 border border-white/10 rounded pointer-events-none" />
                      </div>
                    </>
                  )}
                </div>

                {/* Top overlay info */}
                <div className="relative z-10 bg-gradient-to-b from-black/80 via-black/40 to-transparent p-3 flex justify-between items-start pointer-events-none">
                  <div>
                    <span className="font-mono text-[10px] text-slate-300 block tracking-tight font-semibold">
                      {cam.id}: {cam.location}
                    </span>
                    <span className="font-mono text-[9px] text-slate-400">
                      SYS CODE: NEURAL-GRID://node-ind-{index + 1}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${isAlert ? 'bg-red-500 animate-ping' : 'bg-green-400 animate-pulse'}`} />
                    <span className={`text-[9px] font-mono uppercase tracking-widest ${isAlert ? 'text-red-400 font-bold' : 'text-green-400'}`}>
                      {isAlert ? 'Alarm Locked' : 'Grid Active'}
                    </span>
                  </div>
                </div>

                {/* Alarm Flash banner if detection matches */}
                {isAlert && isLive && matchedChildObj && (
                  <div className="relative z-10 mx-3 p-2 bg-red-950/90 border border-red-500/40 rounded text-center animate-pulse">
                    <div className="flex items-center justify-center space-x-1.5">
                      <AlertTriangle className="h-4 w-4 text-red-500 animate-bounce" />
                      <span className="text-[11px] font-sans font-bold text-red-200">
                        FACE CAPTURE: Match resembles {matchedChildObj.name} ({matchedChildObj.matchConfidence}% confidence)
                      </span>
                    </div>
                    <span className="text-[9px] text-slate-400 block font-mono">
                      Last Spot: Platform Area // GPS Transmitted to Parent Phone
                    </span>
                  </div>
                )}

                {/* Bottom Overlay Controls */}
                <div className="relative z-10 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3 flex justify-between items-center">
                  <div className="text-[10px] font-mono text-cyan-400 bg-black/60 px-2 py-0.5 rounded border border-cyan-500/10">
                    LATENCY: 14ms // AGC: 98%
                  </div>
                  <button
                    id={`btn-toggle-cam-${cam.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleStream(cam.id);
                    }}
                    className="bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white px-2.5 py-1 rounded text-[9px] font-mono tracking-widest uppercase cursor-pointer pointer-events-auto transition-colors"
                  >
                    {isLive ? 'Shut Video' : 'Feed Video'}
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
