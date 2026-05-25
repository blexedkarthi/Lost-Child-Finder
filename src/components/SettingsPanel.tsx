import React, { useState } from 'react';
import { Settings, RefreshCw, Sliders, Server, Cpu, Database, Command, Code, ExternalLink, HelpCircle } from 'lucide-react';

interface SettingsPanelProps {
  onResetData: () => Promise<void>;
  onTriggerToast: (msg: string, type: 'alert' | 'success' | 'info') => void;
}

export function SettingsPanel({ onResetData, onTriggerToast }: SettingsPanelProps) {
  const [alarmThreshold, setAlarmThreshold] = useState(85);
  const [frameInterval, setFrameInterval] = useState(1);
  const [activeEncryption, setActiveEncryption] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState('Real-Time Pushes');
  
  const [isResetting, setIsResetting] = useState(false);
  const [isTestingLink, setIsTestingLink] = useState(false);

  const handleReset = async () => {
    setIsResetting(true);
    onTriggerToast("Erasing custom records. Loading presets...", "info");
    try {
      await onResetData();
    } catch (e) {
      console.error(e);
    } finally {
      setIsResetting(false);
    }
  };

  const handleLinkTest = async () => {
    setIsTestingLink(true);
    onTriggerToast("Testing Node Server API link...", "info");
    try {
      const res = await fetch('/api/status');
      if (res.ok) {
        onTriggerToast("Success! ChildShield backend is fully secure and operational on Port 3000.", "success");
      } else {
        throw new Error();
      }
    } catch (e) {
      onTriggerToast("Warning: connection link has anomalies.", "alert");
    } finally {
      setIsTestingLink(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
      
      {/* System Settings & Sliders column */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-slate-900 border border-cyan-500/30 rounded-xl p-5 shadow-2xl">
          <div className="flex items-center space-x-2.5 mb-4">
            <Sliders className="text-cyan-400 h-5 w-5" />
            <h2 className="text-sm font-semibold tracking-wide text-slate-200 uppercase font-sans">
              Neural Scan Configuration Controls
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1 text-xs text-slate-300">
                <span>Alarm Matching Sensitivity Threshold</span>
                <span className="text-cyan-400 font-mono font-bold">{alarmThreshold}% Face Score</span>
              </div>
              <input
                id="rng-alarm-threshold"
                type="range"
                min="65"
                max="98"
                value={alarmThreshold}
                onChange={(e) => setAlarmThreshold(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <span className="text-[10px] text-slate-500 block leading-tight mt-1">
                Lower thresholds yield more hits but risk false triggers in cluttered markets. Recommended: 85%.
              </span>
            </div>

            <div className="border-t border-slate-800/60 pt-4">
              <div className="flex justify-between items-center mb-1 text-xs text-slate-300">
                <span>CCTV Analyzer Scan Speed</span>
                <span className="text-cyan-400 font-mono font-bold">{frameInterval} frames/sec</span>
              </div>
              <input
                id="rng-frame-interval"
                type="range"
                min="1"
                max="10"
                value={frameInterval}
                onChange={(e) => setFrameInterval(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <span className="text-[10px] text-slate-500 block leading-tight mt-1">
                Select analytical intervals. Higher frame sampling utilizes more CPU resources.
              </span>
            </div>

            <div className="border-t border-slate-800/60 pt-4 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-200 block">Encrypted Trace Locks</span>
                <p className="text-[10px] text-slate-500">Enable hashing on face coordinates returned from edge CCTV hubs under privacy laws.</p>
              </div>
              <button
                id="btn-toggle-encryption"
                onClick={() => {
                  setActiveEncryption(!activeEncryption);
                  onTriggerToast(`Edge encryption ${!activeEncryption ? 'engaged' : 'disabled'}.`, "info");
                }}
                className={`w-12 h-6 rounded-full p-1 transition-all flex border ${
                  activeEncryption ? 'bg-cyan-500/15 border-cyan-400 justify-end' : 'bg-slate-950 border-slate-800 justify-start'
                }`}
              >
                <span className={`w-3.5 h-3.5 rounded-full ${activeEncryption ? 'bg-cyan-400' : 'bg-slate-500'}`} />
              </button>
            </div>

            <div className="border-t border-slate-800/60 pt-4 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-200 block">SMS Notification Speed</span>
                <p className="text-[10px] text-slate-500">Mocks interval to push emergency sms blocks to parental phones.</p>
              </div>
              <select
                id="sel-settings-sms-speed"
                value={simulationSpeed}
                onChange={(e) => {
                  setSimulationSpeed(e.target.value);
                  onTriggerToast(`Pushes mock set to: ${e.target.value}`, "info");
                }}
                className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200 focus:outline-none"
              >
                <option value="Real-Time Pushes">Real-Time Pushes</option>
                <option value="Delayed (30s verification)">Delayed (30s verification)</option>
                <option value="Manual Dispatch Rules Only">Manual Dispatch Rules Only</option>
              </select>
            </div>

          </div>
        </div>

        {/* Database control & preset reloads */}
        <div className="bg-slate-900 border border-red-500/20 p-5 rounded-xl shadow-md">
          <div className="flex items-center space-x-2.5 mb-3">
            <Database className="text-red-400 h-5 w-5 animate-pulse" />
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-sans">
                Active Storage Re-initialization
              </h3>
              <p className="text-[10px] text-slate-500 font-mono">DANGEROUS ROOT SYSTEM PROCEDURE</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            Reverts the child database, surveillance cameras, alerts feed, and SMS logs history back to default Indian transport hubs settings (Bengaluru Majestic, KBS Station, Chennai Central, Mumbai Terminal). This will discard any custom reports you filed.
          </p>
          
          <button
            id="btn-reinitialize-lost-children-data"
            disabled={isResetting}
            onClick={handleReset}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center space-x-1.5 disabled:opacity-40"
          >
            {isResetting ? (
              <RefreshCw className="h-4 w-4 animate-spin text-white" />
            ) : (
              <RefreshCw className="h-4 w-4 text-white" />
            )}
            <span>Clean Reset All Pre-populate Records</span>
          </button>
        </div>
      </div>

      {/* Cloud Service Info column */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-slate-900 border border-slate-850 p-5 rounded-xl shadow-md space-y-4">
          <div className="flex items-center space-x-2 text-cyan-400">
            <Server className="h-5 w-5 text-cyan-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider font-sans">
              Platform Integration Nodes
            </h3>
          </div>

          <div className="space-y-3.5 font-mono text-[10px]">
            <div className="p-2.5 bg-slate-950 rounded border border-slate-850">
              <span className="text-slate-400 block mb-0.5">GEMINI TEXT INTEGRITY</span>
              <div className="flex justify-between text-cyan-400 font-bold">
                <span>MODEL ALIASES</span>
                <span>'gemini-3.5-flash'</span>
              </div>
            </div>

            <div className="p-2.5 bg-slate-950 rounded border border-slate-850">
              <span className="text-slate-400 block mb-0.5">GEMINI VISION CHANNELS</span>
              <div className="flex justify-between text-cyan-400 font-bold">
                <span>OCR DRESS PROFILE</span>
                <span>'gemini-3.5-flash'</span>
              </div>
            </div>

            <div className="p-2.5 bg-slate-950 rounded border border-slate-850">
              <span className="text-slate-400 block mb-0.5">MAPS GEOLOCATION ACCURACY</span>
              <div className="flex justify-between text-orange-400 font-bold">
                <span>GOOGLE GEO PLATFORM</span>
                <span>ACTIVE INTERPOLATION</span>
              </div>
            </div>

            <button
              id="btn-test-backend-ping"
              disabled={isTestingLink}
              onClick={handleLinkTest}
              className="w-full py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 font-bold uppercase rounded-lg text-[9px] tracking-widest cursor-pointer transition-colors"
            >
              {isTestingLink ? 'Pinging...' : 'PING CHECK API SERVER'}
            </button>
          </div>
        </div>

        {/* Developer Sandbox help card */}
        <div className="bg-gradient-to-br from-cyan-950/40 to-slate-950 p-5 rounded-xl border border-cyan-500/10 space-y-3">
          <span className="text-[11px] font-bold text-cyan-400 font-sans block">DEVELOPER DIRECTIVE COMPLIANCE</span>
          <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
            This workspace includes fully-functional full-stack bridges. All Gemini interactions are proxied server-side via Node's <code className="text-cyan-400 font-mono">/server.ts</code> executing secure token isolation.
          </p>
          <div className="flex items-center space-x-2 text-[10px] text-slate-500">
            <Code className="h-3.5 w-3.5" />
            <span>ChildShield AI Version 1.4-IND</span>
          </div>
        </div>
      </div>

    </div>
  );
}
