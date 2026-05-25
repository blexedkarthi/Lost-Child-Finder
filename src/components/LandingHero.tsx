import React from 'react';
import { ShieldAlert, Users, CheckCircle2, Bell, Sparkles, Navigation, Phone, Heart, ArrowRight } from 'lucide-react';
import { LostChild, CameraFeed } from '../types';

interface LandingHeroProps {
  lostChildren: LostChild[];
  cameras: CameraFeed[];
  stats: any;
  onNavigate: (tab: any) => void;
}

export function LandingHero({ lostChildren, cameras, stats, onNavigate }: LandingHeroProps) {
  
  const searchingCount = lostChildren.filter(c => c.status === 'Searching').length;
  const detectedCount = lostChildren.filter(c => c.status === 'Detected').length;
  const reunitedCount = lostChildren.filter(c => c.status === 'Reunited').length;

  const keyDetections = lostChildren.filter(c => c.status === 'Detected').slice(0, 2);

  return (
    <div className="space-y-8 font-sans">
      
      {/* Hero Header panel */}
      <div className="relative bg-slate-900 border border-cyan-500/20 p-8 rounded-3xl overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-red-600/5 rounded-full blur-2xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center relative z-10">
          
          <div className="lg:col-span-3 space-y-5">
            <div className="inline-flex items-center space-x-2 bg-cyan-950/60 border border-cyan-500/30 px-3 py-1 rounded-full text-[10px] font-mono tracking-widest text-cyan-400">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              <span>COGNITIVE EYE SURVEILLANCE FOR INDIA</span>
            </div>

            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              AI-Based Lost Child Detection & <span className="text-cyan-400">Smart CCTV Scan Grid</span>
            </h1>

            <p className="text-slate-300 text-sm leading-relaxed max-w-xl">
              An advanced cyber-surveillance network that empowers police, parents, and transportation Hubs (major metropolitan railway and bus stations in India) to locate missing children. Driven by real-time computer vision scanners, automated SMS warning protocols, and server-side Gemini AI.
            </p>

            {/* Quick CTAs */}
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                id="btn-nav-parent-portal"
                onClick={() => onNavigate('parent-dashboard')}
                className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold uppercase tracking-wider rounded-xl transition-all hover:scale-105 cursor-pointer shadow-md shadow-cyan-950/20 flex items-center space-x-1.5"
              >
                <span>Parents Reporting Portal</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                id="btn-nav-cctv-monitoring"
                onClick={() => onNavigate('cctv-monitoring')}
                className="px-5 py-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer hover:border-slate-700"
              >
                Launch Live CCTV Matrix
              </button>
            </div>
          </div>

          {/* Quick Stats Panel */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-4">
            
            <div className="bg-slate-950 border border-slate-850 p-4 rounded-2xl flex flex-col justify-between">
              <span className="text-[10px] font-mono tracking-wider text-slate-500 uppercase block">Active Searches</span>
              <span className="text-2xl font-extrabold text-cyan-400 mt-2 font-mono">{searchingCount} Cases</span>
              <span className="text-[9px] text-slate-500 font-mono mt-1">Multifeed scanner engaged</span>
            </div>

            <div className="bg-slate-950 border border-slate-850 p-4 rounded-2xl flex flex-col justify-between">
              <span className="text-[10px] font-mono tracking-wider text-slate-500 uppercase block">CCTV Spottings</span>
              <span className="text-2xl font-extrabold text-red-400 mt-2 font-mono">{detectedCount} Matches</span>
              <span className="text-[9px] text-slate-500 font-mono mt-1">Telemetry alert dispatched</span>
            </div>

            <div className="bg-slate-950 border border-slate-850 p-4 rounded-2xl flex flex-col justify-between">
              <span className="text-[10px] font-mono tracking-wider text-slate-500 uppercase block">Safe Reunions</span>
              <span className="text-2xl font-extrabold text-emerald-400 mt-2 font-mono">{reunitedCount} Kids</span>
              <span className="text-[9px] text-slate-500 font-mono mt-1">National Helpline archived</span>
            </div>

            <div className="bg-slate-950 border border-slate-850 p-4 rounded-2xl flex flex-col justify-between">
              <span className="text-[10px] font-mono tracking-wider text-slate-500 uppercase block">Coverage Area</span>
              <span className="text-2xl font-extrabold text-slate-300 mt-2 font-mono">5 Node Hubs</span>
              <span className="text-[9px] text-slate-500 font-mono mt-1">Majestic / Chennai / Mumbai / Delhi</span>
            </div>

          </div>

        </div>
      </div>

      {/* Emergency Helpline highlight bar */}
      <div className="bg-red-950/30 border border-red-500/20 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-2.5 bg-red-500/10 text-red-400 rounded-xl border border-red-500/20">
            <Phone className="h-5 w-5 animate-bounce" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-red-200">National Missing Child Protection Helpdesk (India)</h3>
            <p className="text-xs text-slate-400">Integrated with Ministry of Women & Child Development (MWCD) system protocols.</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <a
            id="link-emergency-childline"
            href="tel:1098"
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-mono font-extrabold text-sm rounded-xl tracking-wider shadow-md cursor-pointer transition-colors"
          >
            CALL 1098 (24/7 National Childline)
          </a>
          <a
            id="link-emergency-railways"
            href="tel:139"
            className="px-3 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-mono text-xs rounded-xl cursor-pointer"
          >
            Railways Security: Dial 139
          </a>
        </div>
      </div>

      {/* Grid Features Walkthrough */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl space-y-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-950 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Users className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-200">1. Register Profile</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Parents file complaints containing photos. Gemini AI scans colors, extracting garment features automatically to load into city node databases within seconds.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl space-y-3">
          <div className="w-10 h-10 rounded-lg bg-red-950 border border-red-500/20 flex items-center justify-center text-red-400">
            <Bell className="h-5 w-5 animate-pulse" />
          </div>
          <h3 className="text-sm font-bold text-slate-200">2. Smart CCTV scan</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Surveillance grids at major terminals scan footages. Bounding boxes highlight matches above safe thresholds, pinpointing coordinates dynamically.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl space-y-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-950 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-200">3. Rescue Notification</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Incident rooms send location payloads to parents' phones. Ground security blocks doors, allowing rescue divisions to verify identity and confirm safe reunion.
          </p>
        </div>

      </div>

      {/* Critical alerts list highlighting live status of cases */}
      {keyDetections.length > 0 && (
        <div className="bg-slate-900 border border-red-500/20 rounded-2xl p-5 space-y-3.5">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-red-400">
              URGENT CAPTURE LEAKS DETECTED ON PUBLIC CAMERA CHANNELS
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {keyDetections.map(child => (
              <div key={child.id} className="p-3 bg-slate-950/80 border border-red-500/30 rounded-xl flex items-center space-x-3">
                <div className="w-12 h-12 rounded-lg bg-slate-900 border border-slate-850 overflow-hidden flex-shrink-0">
                  {child.photoUrl ? (
                    <img referrerPolicy="no-referrer" src={child.photoUrl} alt="face locked" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[8px] font-mono p-1">No Frame</span>
                  )}
                </div>
                <div className="min-w-0 flex-grow text-xs">
                  <div className="font-semibold text-slate-200 truncate">{child.name} matched!</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">Spot: {child.lastSeenLocation}</div>
                  <div className="text-[9px] text-red-400 font-mono tracking-tight font-semibold mt-1">Accuracy match {child.matchConfidence}% // Parents Dialed: {child.parentPhone}</div>
                </div>
                <button
                  id={`btn-hero-pan-to-child-${child.id}`}
                  onClick={() => onNavigate('maps')}
                  className="px-2.5 py-1.5 bg-red-600 hover:bg-red-500 text-white font-sans font-bold text-[9px] uppercase rounded-lg tracking-wider transition-colors cursor-pointer flex-shrink-0"
                >
                  Locate Pin
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
