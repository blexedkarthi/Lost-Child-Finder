import React from 'react';
import { Camera, Bell, ShieldAlert, CheckCircle2, Phone, Clock, AlertTriangle, UserCheck, MessageSquare, Shield, Activity } from 'lucide-react';
import { LostChild, CameraFeed, LiveAlert, SMSLog, SystemStats } from '../types';

interface AdminHubProps {
  stats: SystemStats;
  lostChildren: LostChild[];
  cameras: CameraFeed[];
  alerts: LiveAlert[];
  smsLogs: SMSLog[];
  onConfirmReunion: (childId: string) => Promise<void>;
  onNavigate: (tab: any) => void;
}

export function AdminHub({ 
  stats, 
  lostChildren, 
  cameras, 
  alerts, 
  smsLogs, 
  onConfirmReunion, 
  onNavigate 
}: AdminHubProps) {
  
  const activeAlerts = alerts.filter(a => a.status !== 'Reunited');

  return (
    <div className="space-y-6 font-sans">
      
      {/* Interactive stats bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">Surveillance Cases Loading</span>
              <span className="text-2xl font-bold text-slate-200 mt-1 block">
                {lostChildren.filter(c => c.status === 'Searching').length} Active
              </span>
            </div>
            <div className="p-2 bg-slate-950 text-cyan-400 rounded-lg">
              <ShieldAlert className="h-4 w-4" />
            </div>
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-2 uppercase">
            Platform monitoring enroute
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">CCTV Camera Locks</span>
              <span className="text-2xl font-bold text-red-400 mt-1 block">
                {lostChildren.filter(c => c.status === 'Detected').length} Spottings
              </span>
            </div>
            <div className="p-2 bg-slate-950 text-red-400 rounded-lg">
              <Camera className="h-4 w-4 animate-pulse" />
            </div>
          </div>
          <div className="text-[10px] text-red-400 font-mono mt-2 uppercase animate-pulse">
            EMERGENCY WARNING IN PROGRESS
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">Reunions Reached</span>
              <span className="text-2xl font-bold text-emerald-400 mt-1 block">
                {lostChildren.filter(c => c.status === 'Reunited').length} Closed
              </span>
            </div>
            <div className="p-2 bg-slate-950 text-emerald-400 rounded-lg">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-2 uppercase">
            Verifications Confirmed Safe
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">CCTV Stream Nodes</span>
              <span className="text-2xl font-bold text-slate-200 mt-1 block">
                {cameras.length} Active
              </span>
            </div>
            <div className="p-2 bg-slate-950 text-slate-300 rounded-lg">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-2 uppercase">
            99.98% NeuralNet Latency
          </div>
        </div>

      </div>

      {/* Main split: Alerts on left, SMS log tracking on right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Alerts Center Feed */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="text-cyan-400 h-5 w-5 animate-pulse" />
              <h2 className="text-sm font-semibold tracking-wide text-slate-200 uppercase font-sans">
                Unified Face Spot Warning Logs (CCTV Output)
              </h2>
            </div>
            <button
              id="btn-navigate-cctv-grid"
              onClick={() => onNavigate('cctv-monitoring')}
              className="text-[10px] text-cyan-400 hover:text-cyan-300 font-mono uppercase cursor-pointer"
            >
              Configure simulation →
            </button>
          </div>

          <div className="space-y-3 max-h-[450px] overflow-y-auto custom-scrollbar pr-1">
            {alerts.map(alert => {
              const isSearching = lostChildren.find(c => c.id === alert.childId)?.status === 'Detected';
              return (
                <div 
                  key={alert.id}
                  className={`bg-slate-900 border p-4 rounded-xl text-xs space-y-2.5 transition-colors ${
                    alert.status === 'Reunited' 
                      ? 'border-emerald-500/10 bg-emerald-950/5' 
                      : 'border-red-500/20 bg-red-950/5'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-2">
                      <span className={`w-2 h-2 rounded-full ${alert.status === 'Reunited' ? 'bg-emerald-400' : 'bg-red-500 animate-ping'}`} />
                      <span className="font-bold text-slate-200 uppercase font-sans">
                        CAMERA MATCH ALERT ID: {alert.id}
                      </span>
                    </div>
                    <span className="text-[9px] text-slate-500 font-mono">
                      {new Date(alert.timestamp).toLocaleTimeString()} // {new Date(alert.timestamp).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="font-sans text-slate-300 grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                    <div>
                      <span className="text-slate-500 text-[10px] block font-mono">DETECTED INDIVIDUAL</span>
                      <span className="font-semibold text-slate-200">{alert.childName} (Child ID: {alert.childId})</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block font-mono">LOCATORoptical PIN</span>
                      <span className="text-cyan-400 font-medium">{alert.cameraName}</span>
                    </div>
                  </div>

                  {/* Actions line */}
                  <div className="pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono">
                    <div className="flex items-center space-x-4">
                      <span>VERIFICATION SCORING: <strong className="text-red-400">{alert.confidence}%</strong></span>
                      <span className="text-slate-500">|</span>
                      <span>TELEMETRY PUSH: <strong className="text-slate-300">{alert.status}</strong></span>
                    </div>

                    {alert.status !== 'Reunited' && (
                      <button
                        id={`btn-admin-confirm-reunion-${alert.childId}`}
                        onClick={() => onConfirmReunion(alert.childId)}
                        className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 font-sans font-bold text-black text-[9px] uppercase rounded-lg cursor-pointer transition-transform active:scale-95 shadow-md shadow-emerald-950/20"
                      >
                        Confirm Reunion Archive
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {alerts.length === 0 && (
              <div className="text-center p-8 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 text-xs font-sans">
                Waiting on CCTV scanner feeds to push facial matches.
              </div>
            )}
          </div>
        </div>

        {/* Right column: SMS broadcast Logs */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
            <h3 className="text-sm font-semibold tracking-wide text-slate-200 uppercase font-sans">
              AMBER Push Logs via +91 GSM
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">LIVE PUSH DISPATCH TRANSACTIONS</span>
          </div>

          <div className="space-y-3.5 max-h-[450px] overflow-y-auto custom-scrollbar">
            {smsLogs.map(log => (
              <div key={log.id} className="p-3 bg-slate-900 border border-slate-800/60 rounded-xl space-y-1.5 text-xs font-sans">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="font-mono text-cyan-400 font-semibold">{log.phone}</span>
                  <span className="text-slate-500 font-mono">{new Date(log.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed italic bg-slate-950/60 p-2 rounded border border-slate-900">
                  "{log.message}"
                </p>
                <div className="flex justify-between items-center text-[9px] font-mono uppercase">
                  <span>OUTBOUND MSG TICKET: {log.id}</span>
                  <span className={`font-bold ${log.status === 'Failed' ? 'text-red-400' : 'text-emerald-400'}`}>
                    {log.status}
                  </span>
                </div>
              </div>
            ))}

            {smsLogs.length === 0 && (
              <div className="text-center p-8 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 text-xs font-sans">
                No outbound notifications fired.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
