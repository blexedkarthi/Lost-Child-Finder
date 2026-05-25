import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  ShieldAlert, 
  Users, 
  CheckCircle2, 
  Bell, 
  MessageSquare, 
  MapPin, 
  Sparkles, 
  Loader2, 
  Radar, 
  UserCheck, 
  Compass,
  AlertTriangle,
  X,
  FileText,
  Settings,
  Shield,
  LayoutDashboard,
  LogOut,
  ChevronRight,
  Eye,
  Key
} from 'lucide-react';

// Import modular layouts and structures
import { PageType, LostChild, CameraFeed, LiveAlert, SMSLog, SystemStats } from './types';
import { LandingHero } from './components/LandingHero';
import { ParentPortal } from './components/ParentPortal';
import { AdminHub } from './components/AdminHub';
import { CCTVMonitoring } from './components/CCTVMonitoring';
import { SurveillanceMap } from './components/SurveillanceMap';
import { AIChatbot } from './components/AIChatbot';
import { SettingsPanel } from './components/SettingsPanel';

// Read API Key according to workspace standards
const GOOGLE_MAPS_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  'AIzaSyASQMfB6rkJ9Yftst0E6WSSCRDWeqN5_9E';

export default function App() {
  // Navigation State
  const [activePage, setActivePage] = useState<PageType>('landing');
  const [userRole, setUserRole] = useState<'guest' | 'parent' | 'admin'>('guest');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Authentication Fields states
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginRoleInput, setLoginRoleInput] = useState<'parent' | 'admin'>('parent');
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Unified Database State
  const [lostChildren, setLostChildren] = useState<LostChild[]>([]);
  const [cameras, setCameras] = useState<CameraFeed[]>([]);
  const [alerts, setAlerts] = useState<LiveAlert[]>([]);
  const [smsLogs, setSmsLogs] = useState<SMSLog[]>([]);
  const [stats, setStats] = useState<SystemStats>({
    activeReportsCount: 0,
    detectedCount: 0,
    reunitedCount: 0,
    activeCamerasCount: 0,
    matchConfidenceAvg: 0
  });

  // UI Toast states
  const [notification, setNotification] = useState<{
    message: string;
    type: 'alert' | 'success' | 'info';
    id: string;
  } | null>(null);

  // Live Camera/Webcam Scanner States
  const [cameraStreamActive, setCameraStreamActive] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [webcamSelection, setWebcamSelection] = useState('Rahul Sharma');
  const [webcamMatchedConfidence, setWebcamMatchedConfidence] = useState<number | null>(null);
  const [webcamAnalyzingText, setWebcamAnalyzingText] = useState('STANDBY ON CAMERA SECURE PERMISSION...');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Fetch application status
  const fetchState = async () => {
    try {
      const response = await fetch('/api/status');
      if (response.ok) {
        const data = await response.json();
        setLostChildren(data.lostChildren);
        setCameras(data.cameras);
        setAlerts(data.alerts);
        setSmsLogs(data.smsLogs);
        setStats(data.stats);
      }
    } catch (e) {
      console.error("Error communicating with Node backplane:", e);
    }
  };

  // Poll state every 4.5 seconds for real-time surveillance feel
  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, 4500);
    return () => clearInterval(interval);
  }, []);

  // Toast helper
  const triggerToast = (message: string, type: 'alert' | 'success' | 'info' = 'info') => {
    setNotification({ message, type, id: Math.random().toString() });
    setTimeout(() => {
      setNotification(prev => prev?.message === message ? null : prev);
    }, 5500);
  };

  // Safe confirm child reunion handler
  const handleConfirmReunion = async (childId: string) => {
    try {
      const res = await fetch('/api/confirm-reunion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ childId })
      });
      if (res.ok) {
        triggerToast("Case updated! Child has been verified as reunited.", "success");
        await fetchState();
      } else {
        triggerToast("Error updating case record.", "alert");
      }
    } catch (e) {
      triggerToast("Network link timed out.", "alert");
    }
  };

  // Register missing child port handler
  const handleRegisterReport = async (formData: any) => {
    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        triggerToast(`Active surveillance deployment activated for ${formData.name}!`, "success");
        await fetchState();
        setActivePage('parent-dashboard');
      } else {
        const err = await res.json();
        triggerToast(err.error || "Surveillance submission refused.", "alert");
      }
    } catch (e) {
      triggerToast("Connection failed.", "alert");
    }
  };

  // Reset database back to clean defaults
  const handleResetData = async () => {
    try {
      const res = await fetch('/api/reset-data', {
        method: 'POST'
      });
      if (res.ok) {
        triggerToast("Database re-initialized to default Indian coordinates and profiles index.", "success");
        await fetchState();
      }
    } catch (e) {
      triggerToast("Fault re-initializing database.", "alert");
    }
  };

  // Automated CCTV Camera simulations
  const handleTriggerSimulation = async (childId: string, cameraId: string, confidence: number) => {
    try {
      const res = await fetch('/api/simulate-detection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ childId, cameraId, confidence })
      });
      if (res.ok) {
        const data = await res.json();
        triggerToast(`🚨 CCTV MATCH TRIGGERED: Alert dispatched for ${data.child.name} on ${cameraId}!`, "alert");
        await fetchState();
        setActivePage('alerts-history');
      }
    } catch (e) {
      console.error(e);
      triggerToast("Simulate trigger anomaly.", "alert");
    }
  };

  // Sign In submit handler
  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginPhone) {
      triggerToast("Please input a valid Indian number to request OTP.", "alert");
      return;
    }

    setIsSigningIn(true);
    triggerToast("OTP token requested via SMS gateway...", "info");

    setTimeout(() => {
      setOtpSent(true);
      setIsSigningIn(false);
      triggerToast("Mock 6-digit OTP code text pushed to your phone. Use '123456' to pass.", "success");
    }, 1200);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpInput === '123456' || otpInput.trim() === '123456') {
      setIsLoggedIn(true);
      setUserRole(loginRoleInput);
      setOtpSent(false);
      setOtpInput('');
      setLoginPhone('');
      setLoginPass('');
      triggerToast(`Successful login! Access granted for Role: [${loginRoleInput.toUpperCase()}]`, "success");
      
      if (loginRoleInput === 'parent') {
        setActivePage('parent-dashboard');
      } else {
        setActivePage('admin-dashboard');
      }
    } else {
      triggerToast("Anomalies in OTP. Verify and input 123456 fallback.", "alert");
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUserRole('guest');
    setActivePage('landing');
    triggerToast("Logged out of secure network.", "info");
  };

  // Webcam control loop
  useEffect(() => {
    let activeStream: MediaStream | null = null;
    let textTimer: any = null;

    if (cameraStreamActive && activePage === 'live-detection') {
      setWebcamAnalyzingText("ACQUIRING PERMISSIONS...");
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
        .then((stream) => {
          activeStream = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
          setStreamError(null);
          setWebcamAnalyzingText("NEURAL SCANNER RUNNING. READING GRAPHICS...");
          
          // Micro scanning simulation loop
          let cycle = 0;
          textTimer = setInterval(() => {
            const phases = [
              "COMPUTING EMBEDDING MATRICES...",
              "CONTRASTING WITH PARENT DATABASE...",
              "ISOLATING PUBLIC DISTORTION...",
              "EVALUATING APPAREL COLOR HEX CODES..."
            ];
            setWebcamAnalyzingText(phases[cycle % phases.length]);
            cycle++;

            // Mock match trigger in webcam feed!
            if (cycle === 4) {
              setWebcamMatchedConfidence(Math.floor(Math.random() * 8) + 91); // 91-98%
              triggerToast("Webcam computer vision lock achieved resembling active search database!", "alert");
            }
          }, 4000);
        })
        .catch((err) => {
          console.error(err);
          setStreamError("Failed webcam access. Using high quality simulated CGI terminal instead.");
          setWebcamAnalyzingText("FALLBACK ACTIVE SCANNED CHANNELS SECURED.");
        });
    } else {
      setWebcamMatchedConfidence(null);
    }

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(t => t.stop());
      }
      if (textTimer) clearInterval(textTimer);
    };
  }, [cameraStreamActive, activePage]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Toast Alert floating HUD */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 max-w-sm w-full animate-bounce">
          <div className={`p-4 rounded-xl border shadow-xl flex items-start space-x-3 backdrop-blur-md ${
            notification.type === 'alert' 
              ? 'bg-red-950/90 border-red-500 text-red-200' 
              : notification.type === 'success' 
              ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200' 
              : 'bg-slate-900/90 border-cyan-500/40 text-cyan-200'
          }`}>
            <span className="mt-0.5 text-lg font-bold">
              {notification.type === 'alert' ? '🚨' : notification.type === 'success' ? '✓' : 'ℹ'}
            </span>
            <div className="flex-1 text-xs leading-relaxed font-sans font-medium">
              {notification.message}
            </div>
            <button
              id="btn-dismiss-toast"
              onClick={() => setNotification(null)}
              className="text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Futuristic Header bar */}
      <header className="bg-slate-950 border-b border-cyan-500/20 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 sticky top-0 z-30 shadow-md">
        
        {/* Branding */}
        <div className="flex items-center space-x-3.5">
          <div className="p-2.5 bg-cyan-950 border border-cyan-500/30 rounded-xl text-cyan-400 relative">
            <Radar className="h-6 w-6 animate-spin text-cyan-400" style={{ animationDuration: '6s' }} />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-extrabold tracking-wider bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent uppercase font-sans">
                ChildShield AI
              </h1>
              <span className="text-[9px] font-mono font-bold bg-cyan-900/40 text-cyan-400 px-1.5 py-0.5 border border-cyan-500/20 rounded uppercase">
                India Platform
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-mono tracking-wider uppercase">
              AI-Based Lost Child Detection & Smart CCTV Grid
            </p>
          </div>
        </div>

        {/* Global Hub operational Telemetry */}
        <div className="flex items-center justify-end space-x-4">
          <div className="hidden lg:flex items-center space-x-3 font-mono text-[10px] text-slate-400 bg-slate-900/60 border border-slate-850 px-3 py-1.5 rounded-lg">
            <span>● BACKPLANE: SECURE</span>
            <span className="text-slate-600">|</span>
            <span>ACTIVE MONITORS: {stats.activeCamerasCount} CCTV</span>
            <span className="text-slate-600">|</span>
            <span>POLICE GRID: +91 APPOINTED</span>
          </div>

          {/* Sign in/out status UI */}
          <div className="flex items-center space-x-2">
            {isLoggedIn ? (
              <div className="flex items-center space-x-2.5 bg-slate-900 border border-slate-800 rounded-lg p-1">
                <div className="px-2.5 py-1 bg-cyan-950/80 border border-cyan-500/25 rounded-md text-[10px] font-mono text-cyan-400 font-bold uppercase">
                  {userRole} Mode
                </div>
                <button
                  id="btn-header-signout-cta"
                  onClick={logout}
                  className="p-1 px-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded text-xs uppercase font-semibold font-sans flex items-center space-x-1 cursor-pointer transition-all"
                >
                  <LogOut className="h-3.5 w-3.5 text-slate-400" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <button
                id="btn-header-signin-tab"
                onClick={() => setActivePage('auth')}
                className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold uppercase rounded-lg tracking-wider transition-transform cursor-pointer"
              >
                Sign In Portal
              </button>
            )}
          </div>
        </div>

      </header>

      {/* Sub Header Navigation Menu */}
      <nav className="bg-slate-950/60 border-b border-cyan-500/10 px-6 py-2.5 flex flex-wrap gap-2 sticky top-[72px] z-20 backdrop-blur-md">
        
        <button
          id="nav-btn-landing"
          onClick={() => setActivePage('landing')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide uppercase transition-colors flex items-center space-x-1.5 cursor-pointer ${
            activePage === 'landing' ? 'bg-cyan-500 text-black font-semibold' : 'text-slate-300 hover:text-white hover:bg-slate-900'
          }`}
        >
          <span>🏠 Overview</span>
        </button>

        <button
          id="nav-btn-parent-dashboard"
          onClick={() => {
            if (isLoggedIn) {
              setActivePage('parent-dashboard');
            } else {
              setLoginRoleInput('parent');
              setActivePage('auth');
              triggerToast("Authentication required to access parents portal.", "info");
            }
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide uppercase transition-colors flex items-center space-x-1.5 cursor-pointer ${
            activePage === 'parent-dashboard' ? 'bg-cyan-500 text-black font-semibold' : 'text-slate-300 hover:text-white hover:bg-slate-900'
          }`}
        >
          <span>👨‍👩‍👦 Parents Portal</span>
        </button>

        <button
          id="nav-btn-admin-dashboard"
          onClick={() => {
            if (isLoggedIn && userRole === 'admin') {
              setActivePage('admin-dashboard');
            } else {
              setLoginRoleInput('admin');
              setActivePage('auth');
              triggerToast("Administrator access credentials required.", "info");
            }
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide uppercase transition-colors flex items-center space-x-1.5 cursor-pointer ${
            activePage === 'admin-dashboard' ? 'bg-cyan-500 text-black font-semibold' : 'text-slate-300 hover:text-white hover:bg-slate-900'
          }`}
        >
          <span>👮 Officers Hub</span>
        </button>

        <span className="text-slate-800 hidden sm:inline py-1">|</span>

        <button
          id="nav-btn-live-detection"
          onClick={() => setActivePage('live-detection')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide uppercase transition-colors flex items-center space-x-1.5 cursor-pointer ${
            activePage === 'live-detection' ? 'bg-cyan-500 text-black font-semibold' : 'text-slate-300 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Camera className="h-3.5 w-3.5" />
          <span>Webcam Matcher</span>
        </button>

        <button
          id="nav-btn-cctv-monitoring"
          onClick={() => setActivePage('cctv-monitoring')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide uppercase transition-colors flex items-center space-x-1.5 cursor-pointer ${
            activePage === 'cctv-monitoring' ? 'bg-cyan-500 text-black font-semibold' : 'text-slate-300 hover:text-white hover:bg-slate-900'
          }`}
        >
          <span>📹 CCTV Matrix</span>
        </button>

        <button
          id="nav-btn-maps"
          onClick={() => setActivePage('maps')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide uppercase transition-colors flex items-center space-x-1.5 cursor-pointer ${
            activePage === 'maps' ? 'bg-cyan-500 text-black font-semibold' : 'text-slate-300 hover:text-white hover:bg-slate-900'
          }`}
        >
          <MapPin className="h-3.5 w-3.5" />
          <span>Tactical Map</span>
        </button>

        <button
          id="nav-btn-alerts-history"
          onClick={() => setActivePage('alerts-history')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide uppercase transition-colors flex items-center space-x-1.5 cursor-pointer ${
            activePage === 'alerts-history' ? 'bg-cyan-500 text-black font-semibold' : 'text-slate-300 hover:text-white hover:bg-slate-900'
          }`}
        >
          <span>🚨 Warnings Feed</span>
        </button>

        <button
          id="nav-btn-chatbot"
          onClick={() => setActivePage('chatbot')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide uppercase transition-colors flex items-center space-x-1.5 cursor-pointer ${
            activePage === 'chatbot' ? 'bg-cyan-500 text-black font-semibold' : 'text-slate-300 hover:text-white hover:bg-slate-900'
          }`}
        >
          <MessageSquare className="h-3.5 w-3.5 text-cyan-400" />
          <span>Gemini Intelligence Assistant</span>
        </button>

        <button
          id="nav-btn-settings"
          onClick={() => setActivePage('settings')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide uppercase transition-colors flex items-center space-x-1.5 cursor-pointer ${
            activePage === 'settings' ? 'bg-cyan-500 text-black font-semibold' : 'text-slate-300 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Settings className="h-3.5 w-3.5 text-slate-400" />
          <span>Grid Opts</span>
        </button>

      </nav>

      {/* Main Content viewport */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
        
        {/* Landing Page Overview tab */}
        {activePage === 'landing' && (
          <LandingHero 
            lostChildren={lostChildren} 
            cameras={cameras} 
            stats={stats} 
            onNavigate={(tab) => {
              if (tab === 'parent-dashboard' && !isLoggedIn) {
                setLoginRoleInput('parent');
                setActivePage('auth');
                triggerToast("Authentication required.", "info");
              } else {
                setActivePage(tab);
              }
            }} 
          />
        )}

        {/* Authenticate tab (Otp simulation) */}
        {activePage === 'auth' && (
          <div className="max-w-md mx-auto my-12 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden p-6 shadow-2xl relative">
            <div className="text-center space-y-2 mb-6">
              <div className="w-12 h-12 bg-slate-950 border border-cyan-500/30 rounded-full flex items-center justify-center text-cyan-400 mx-auto">
                <Shield className="h-6 w-6 animate-pulse" />
              </div>
              <h2 className="text-base font-extrabold tracking-wide uppercase text-slate-100 font-sans">
                Secure GSM Authentication
              </h2>
              <p className="text-[11px] text-slate-500 font-mono tracking-tight text-center">
                CHANNELS MANAGED BY GOVT COMPLIANCE DEPT
              </p>
            </div>

            {/* Role select tabs */}
            <div className="flex border border-slate-800 bg-slate-950 rounded-lg p-1 mb-4">
              <button
                id="btn-login-select-parent"
                onClick={() => setLoginRoleInput('parent')}
                className={`flex-1 py-1.5 text-xs font-sans tracking-wide uppercase rounded font-bold transition-all ${loginRoleInput === 'parent' ? 'bg-cyan-500 text-black' : 'text-slate-400 hover:text-white'}`}
              >
                Parents Portal
              </button>
              <button
                id="btn-login-select-admin"
                onClick={() => setLoginRoleInput('admin')}
                className={`flex-1 py-1.5 text-xs font-sans tracking-wide uppercase rounded font-bold transition-all ${loginRoleInput === 'admin' ? 'bg-cyan-500 text-black' : 'text-slate-400 hover:text-white'}`}
              >
                Officer Hub
              </button>
            </div>

            {!otpSent ? (
              <form id="otp-request-form" onSubmit={handleSignInSubmit} className="space-y-4">
                <div>
                  <label id="lbl-login-phone" className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                    Registered Mobile Number (+91 Area) *
                  </label>
                  <input
                    id="inp-login-phone"
                    type="tel"
                    required
                    placeholder="e.g. +91 98802 XXXXX"
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label id="lbl-login-pass" className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                      Database Passkey
                    </label>
                    <span className="text-[10px] text-slate-500 font-mono">OPTIONAL PRESET</span>
                  </div>
                  <input
                    id="inp-login-pass"
                    type="password"
                    placeholder="Input passkey or leave blank"
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <button
                  id="btn-request-otp-token"
                  type="submit"
                  disabled={isSigningIn}
                  className="w-full mt-2 bg-cyan-500 hover:bg-cyan-400 text-black py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider font-sans transition-all cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  {isSigningIn ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Key className="h-4 w-4" />
                  )}
                  <span>Dispatch Secure OTP Token</span>
                </button>
              </form>
            ) : (
              <form id="otp-verification-form" onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="bg-cyan-950/30 border border-cyan-500/20 p-3 rounded-lg text-center text-xs text-slate-300">
                  Secured token sent to <strong>{loginPhone}</strong>. Check simulation logs or enter fallback token.
                </div>

                <div>
                  <label id="lbl-otp-input" className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                    Enter 6-Digit OTP Code *
                  </label>
                  <input
                    id="inp-otp-input"
                    type="text"
                    required
                    maxLength={6}
                    placeholder="e.g. 123456"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 text-center tracking-widest focus:outline-none focus:border-cyan-400 font-mono font-bold"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    id="btn-otp-back-reset"
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="flex-1 bg-slate-950 hover:bg-slate-900 border border-slate-800 py-2 rounded-lg text-xs font-bold uppercase tracking-wider font-sans text-slate-400 cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    id="btn-verify-otp-submit"
                    type="submit"
                    className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-black py-2 rounded-lg text-xs font-bold uppercase tracking-wider font-sans cursor-pointer transition-colors"
                  >
                    Verify token
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Parents Portal dashboard */}
        {activePage === 'parent-dashboard' && (
          <ParentPortal
            lostChildren={lostChildren}
            cameras={cameras}
            onRegisterReport={handleRegisterReport}
            onConfirmReunion={handleConfirmReunion}
            onTriggerToast={triggerToast}
          />
        )}

        {/* Admin Hub officers dashboard */}
        {activePage === 'admin-dashboard' && (
          <AdminHub
            stats={stats}
            lostChildren={lostChildren}
            cameras={cameras}
            alerts={alerts}
            smsLogs={smsLogs}
            onConfirmReunion={handleConfirmReunion}
            onNavigate={(tab) => setActivePage(tab)}
          />
        )}

        {/* CCTV Monitoring panel matrix */}
        {activePage === 'cctv-monitoring' && (
          <CCTVMonitoring
            cameras={cameras}
            lostChildren={lostChildren}
            onTriggerSimulation={handleTriggerSimulation}
          />
        )}

        {/* Tactical locator satellite maps overlay */}
        {activePage === 'maps' && (
          <SurveillanceMap
            cameras={cameras}
            lostChildren={lostChildren}
            googleMapsApiKey={GOOGLE_MAPS_KEY}
          />
        )}

        {/* Warnings Feed history panel */}
        {activePage === 'alerts-history' && (
          <div className="space-y-6">
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="text-red-400 h-5 w-5" />
                <div>
                  <h2 className="text-sm font-semibold tracking-wide text-slate-200 uppercase font-sans">
                    Historic Warning Signals Grid Index
                  </h2>
                  <p className="text-[10px] text-slate-500 font-mono text-left">ARCHIVES OF DETECTED RESCUES</p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-slate-900 border border-slate-800 px-3 py-1 rounded">
                REUNITED RATE: {lostChildren.filter(c => c.status === 'Reunited').length}/4 CASES
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <div className="lg:col-span-2 space-y-4">
                {alerts.map(item => (
                  <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md">
                    <div className="p-4 flex items-start justify-between bg-slate-950/40 border-b border-slate-850">
                      <div>
                        <span className="text-[10px] font-mono text-cyan-400 block uppercase">Signal Log ID: {item.id}</span>
                        <span className="text-slate-300 font-mono text-[9px] mt-0.5 block">{new Date(item.timestamp).toLocaleString()}</span>
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        item.status === 'Reunited' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : 'bg-red-500/10 text-red-500 border-red-500/20 animate-pulse'
                      }`}>
                        {item.status}
                      </span>
                    </div>

                    <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs leading-relaxed">
                      <div>
                        <span className="text-slate-500 text-[10px] block font-mono">Matched Face Index</span>
                        <span className="font-semibold text-slate-300">{item.childName}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] block font-mono">optical Sensor Camera Node</span>
                        <span className="font-medium text-cyan-300">{item.cameraName}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] block font-mono">Confidence Level</span>
                        <span className="text-red-400 font-bold">{item.confidence}% matching bounds</span>
                      </div>
                    </div>
                  </div>
                ))}
                {alerts.length === 0 && (
                  <div className="text-center p-8 bg-slate-900 border border-slate-800 rounded-xl text-slate-500 text-xs font-mono">
                    SIGNAL BANK EMPTY. BOOT SIMULATION ENGINES IN CCTV MATRIX.
                  </div>
                )}
              </div>

              {/* Informative side criteria */}
              <div className="space-y-4 lg:col-span-1">
                <div className="bg-slate-900 border border-cyan-500/10 p-5 rounded-xl space-y-3">
                  <span className="text-xs font-bold text-cyan-400 font-sans block">INTELLIGENCE DIRECTIVE FOR OFFICIALS</span>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                    Under Indian Child Protection laws, any computer-vision matches exceeding 85% accuracy trigger automatic emergency SMS packets to local railway police posts.
                  </p>
                  <div className="text-[10px] font-mono text-slate-500">
                    HELPDESK DIRECTORY: SBC maj-sbc, MAS mas-central.
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Gemini AI assistant Q&A page */}
        {activePage === 'chatbot' && (
          <AIChatbot 
            lostChildrenCount={lostChildren.filter(c => c.status === 'Searching').length} 
            detectedCount={lostChildren.filter(c => c.status === 'Detected').length} 
          />
        )}

        {/* System Settings configuration */}
        {activePage === 'settings' && (
          <SettingsPanel
            onResetData={handleResetData}
            onTriggerToast={triggerToast}
          />
        )}

        {/* Interactive webcam face detection terminal */}
        {activePage === 'live-detection' && (
          <div className="max-w-3xl mx-auto space-y-6 font-sans">
            <div className="bg-slate-900 border border-cyan-500/30 rounded-xl p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2.5">
                  <Camera className="text-cyan-400 h-5 w-5" />
                  <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wide">
                    Terminal Webcam Face Scannings Simulator
                  </h2>
                </div>
                
                <button
                  id="btn-toggle-camera-stream"
                  onClick={() => setCameraStreamActive(!cameraStreamActive)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition-transform cursor-pointer ${
                    cameraStreamActive ? 'bg-red-600 text-white' : 'bg-cyan-500 text-black'
                  }`}
                >
                  {cameraStreamActive ? 'Close Webcam' : 'Activate Webcam'}
                </button>
              </div>

              {/* Video Scanner Overlay box */}
              <div className="relative bg-slate-950 aspect-video rounded-xl overflow-hidden border border-slate-850 flex flex-col items-center justify-center">
                
                {cameraStreamActive ? (
                  <>
                    {/* Real Video rendering */}
                    <video
                      id="webcam-source-feed"
                      ref={videoRef}
                      className="absolute inset-0 w-full h-full object-cover opacity-75"
                      playsInline
                      muted
                    />

                    {/* Green scanning Target visual overlay */}
                    <div className="absolute inset-0 border-2 border-cyan-400/20 m-12 rounded pointer-events-none animate-pulse">
                      
                      {/* Corner bounds brackets */}
                      <span className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
                      <span className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
                      <span className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
                      <span className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />

                      {/* Moving sweeping laser overlay */}
                      <span className="absolute inset-x-0 h-0.5 bg-cyan-400 shadow-[0_0_8px_cyan] animate-cctv-scan pointer-events-none" />
                    </div>

                    {/* Matched target locked alert prompt inside camera screen */}
                    {webcamMatchedConfidence && (
                      <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 bg-red-950/90 border border-red-500 px-4 py-2.5 rounded-xl text-center z-10 animate-pulse w-72">
                        <span className="text-[10px] font-mono text-red-400 block uppercase font-bold tracking-widest">
                          🚨 MATCH IDENTITY LOCKED!
                        </span>
                        <div className="text-xs text-white font-sans font-bold mt-1 uppercase">
                          MATCH REPRESENTS: {webcamSelection}
                        </div>
                        <div className="text-[10px] text-red-300 font-mono mt-1">
                          SIMULATING GPS TELEMETRY DISPATCH...
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  // Stanby visual overlay
                  <div className="text-center p-6 space-y-3 z-10">
                    <Radar className="h-10 w-10 text-slate-700 animate-spin mx-auto" />
                    <p className="text-xs text-slate-400">Webcam scanning standby mode.</p>
                    <span className="text-[10px] text-slate-650 font-mono uppercase block">Permit camera in browser settings to execute test.</span>
                  </div>
                )}

                {/* Left floating live telemetry log */}
                <div className="absolute bottom-3 left-3 z-10 bg-black/80 font-mono text-[9px] text-slate-400 px-3 py-2 rounded border border-slate-800 max-w-sm">
                  <span className="text-cyan-400 font-bold uppercase block mb-1">Optical Telemetry Logs</span>
                  <div>PHASE: {webcamAnalyzingText}</div>
                  <div>DEVICE CONFIG: USB CABLE CONTROLLER</div>
                  <div>FPS FRAME: 24/s // GAIN: AUTO_RESONATE</div>
                </div>

              </div>

              {/* Selector choosing simulated child image comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-800 pt-3">
                <div>
                  <label id="lbl-webcam-comparison-target" className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1">
                    Select Target Profile to emulate computer-Vision recognition
                  </label>
                  <select
                    id="sel-webcam-comparison-target"
                    value={webcamSelection}
                    onChange={(e) => {
                      setWebcamSelection(e.target.value);
                      setWebcamMatchedConfidence(null);
                      triggerToast(`Recalibrated webcam analyzer comparison profile to: ${e.target.value}`, "info");
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                    disabled={!cameraStreamActive}
                  >
                    {lostChildren.map(c => (
                      <option key={c.id} value={c.name}>
                        {c.name} ({c.gender}, Age {c.age})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl flex items-center space-x-2.5">
                  <div className="p-1.5 bg-cyan-950 text-cyan-400 rounded-lg">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div className="text-[10px] text-slate-400 font-sans leading-normal">
                    <strong className="text-slate-300 uppercase block">Interactive CCTV Simulator test options</strong>
                    Engages computer-vision algorithms compared with uploaded photos inside high-density railway frames.
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* Footer copyright */}
      <footer className="mt-auto bg-slate-950 border-t border-cyan-500/10 py-6 px-6 text-center font-mono text-[10px] text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <span>© 2026 ChildShield AI. Government of India Missing Child Surveillance Grid Project.</span>
          <div className="flex space-x-4">
            <span className="hover:text-cyan-400">National Helplines: dial 1098 // 139 // 112</span>
            <span>|</span>
            <span className="hover:text-cyan-400">Railway Security Portal Link</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
