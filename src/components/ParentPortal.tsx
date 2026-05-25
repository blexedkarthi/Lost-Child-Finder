import React, { useState } from 'react';
import { Upload, Sparkles, Loader2, Phone, Clock, ShieldAlert, CheckCircle2, UserCheck, Trash2 } from 'lucide-react';
import { LostChild, CameraFeed } from '../types';

interface ParentPortalProps {
  lostChildren: LostChild[];
  cameras: CameraFeed[];
  onRegisterReport: (formData: any) => Promise<void>;
  onConfirmReunion: (childId: string) => Promise<void>;
  onTriggerToast: (msg: string, type: 'alert' | 'success' | 'info') => void;
}

export function ParentPortal({ 
  lostChildren, 
  cameras, 
  onRegisterReport, 
  onConfirmReunion, 
  onTriggerToast 
}: ParentPortalProps) {
  
  // Form values
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState('');
  const [childGender, setChildGender] = useState('Male');
  const [hairDesc, setHairDesc] = useState('');
  const [upperColorDesc, setUpperColorDesc] = useState('');
  const [lowerColorDesc, setLowerColorDesc] = useState('');
  const [featuresDesc, setFeaturesDesc] = useState('');
  const [lastLocation, setLastLocation] = useState('');
  const [parentContact, setParentContact] = useState('');
  const [selectedLocationRef, setSelectedLocationRef] = useState('CAM_01');

  // Interactive files
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setPhotoBase64(base64String);
      onTriggerToast("Photograph loaded. You can now execute 'AI Auto-Profile' profiling.", "success");
    };
    reader.readAsDataURL(file);
  };

  // Run server-side Gemini Visual Analysis via server
  const handleAiVisionAnalyze = async () => {
    if (!photoBase64) {
      onTriggerToast("Upload a photograph of the child first.", "alert");
      return;
    }

    setIsAiAnalyzing(true);
    onTriggerToast("Executing neural description extraction via server-side Gemini...", "info");

    try {
      const parts = photoBase64.split(',');
      const mimeType = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
      const rawBase64 = parts[1];

      const res = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64Data: rawBase64, mimeType })
      });

      if (res.ok) {
        const data = await res.json();
        const info = data.analysis;
        
        setAiAnalysisResult(info);
        
        // Populate the registration fields from the Gemini AI output!
        if (info.estimatedAge) setChildAge(info.estimatedAge.toString());
        if (info.gender) setChildGender(info.gender);
        if (info.hair) setHairDesc(info.hair);
        if (info.upperColor) setUpperColorDesc(info.upperColor);
        if (info.lowerColor) setLowerColorDesc(info.lowerColor);
        if (info.distinctiveFeatures) setFeaturesDesc(info.distinctiveFeatures);

        onTriggerToast(
          data.simulated 
            ? "Simulated AI description auto-populated." 
            : "Gemini AI analyzed dress colors and distinctive markers: Populated fields successfully!", 
          "success"
        );
      } else {
        onTriggerToast("Gemini Vision API busy. Please fill description manually.", "alert");
      }
    } catch (e) {
      console.error(e);
      onTriggerToast("Network link timed out. Fill manually to proceed.", "alert");
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!childName || !parentContact || !lastLocation) {
      onTriggerToast("Missing required fields: Child Name, Parent Phone, Last Location.", "alert");
      return;
    }

    setIsSubmitting(true);

    try {
      await onRegisterReport({
        name: childName,
        age: childAge,
        gender: childGender,
        hair: hairDesc,
        upperColor: upperColorDesc,
        lowerColor: lowerColorDesc,
        distinctiveFeatures: featuresDesc,
        lastSeenLocation: lastLocation,
        phone: parentContact,
        selectedLocationRef,
        photoUrl: photoBase64 || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200"
      });

      // Clear states
      setChildName('');
      setChildAge('');
      setHairDesc('');
      setUpperColorDesc('');
      setLowerColorDesc('');
      setFeaturesDesc('');
      setLastLocation('');
      setParentContact('');
      setPhotoBase64(null);
      setAiAnalysisResult(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Missing Child reporting Form */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-slate-900 border border-cyan-500/30 rounded-xl p-5 shadow-2xl relative">
          <div className="flex items-center space-x-2 mb-4">
            <ShieldAlert className="text-cyan-400 h-5 w-5 animate-pulse" />
            <h2 className="text-base font-semibold text-slate-200 tracking-wide font-sans">
              Indian Missing Kid Registration Form
            </h2>
          </div>

          <form id="missing-report-form" onSubmit={handleSubmit} className="space-y-4">
            
            {/* Primary Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label id="lbl-parent-name" className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                  Child Full Name *
                </label>
                <input
                  id="inp-parent-name"
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label id="lbl-parent-age" className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                  Age (Years)
                </label>
                <input
                  id="inp-parent-age"
                  type="number"
                  placeholder="e.g. 6"
                  value={childAge}
                  onChange={(e) => setChildAge(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label id="lbl-parent-gender" className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                  Gender Identity
                </label>
                <select
                  id="sel-parent-gender"
                  value={childGender}
                  onChange={(e) => setChildGender(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Drag & Drop Visual uploading box */}
            <div className="p-4 bg-slate-950 border-2 border-dashed border-slate-800 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
                <Upload className="h-6 w-6 text-cyan-400 mb-2" />
                <span className="text-xs font-semibold text-slate-200 font-sans block mb-1">Missing Photograph Profile</span>
                <span className="text-[10px] text-slate-500 font-sans block leading-relaxed max-w-sm">
                  Upload portrait for highaccuracy AI detection in CCTV grids. Support formats: png, jpeg.
                </span>
                
                <input
                  id="inp-image-file-picker"
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="mt-3 text-xs text-slate-400 file:mr-2.5 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-[10px] file:font-mono file:bg-cyan-950 file:text-cyan-400 hover:file:bg-cyan-900 cursor-pointer"
                />
              </div>

              {/* Action and Preview */}
              <div className="flex flex-col items-center justify-center p-3 bg-slate-900 border border-slate-800 h-28 w-44 rounded-lg relative overflow-hidden">
                {photoBase64 ? (
                  <>
                    <img referrerPolicy="no-referrer" src={photoBase64} alt="Preview" className="w-full h-full object-cover rounded opacity-80" />
                    <button
                      id="btn-remove-parent-photo"
                      type="button"
                      onClick={() => { setPhotoBase64(null); setAiAnalysisResult(null); }}
                      className="absolute right-1 top-1 bg-black/60 text-slate-400 hover:text-white p-1 rounded-full text-[9px]"
                    >
                      Reset
                    </button>
                  </>
                ) : (
                  <span className="text-[9px] text-slate-500 font-mono text-center">NO IMAGE UPLOADED</span>
                )}
              </div>
            </div>

            {/* AI Profiler button */}
            {photoBase64 && (
              <div className="bg-slate-950/80 border border-cyan-500/20 rounded-lg p-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-semibold text-cyan-400 font-sans block">Automatic AI Feature Description</span>
                  <p className="text-[10px] text-slate-400 font-sans">
                    Use server-side Gemini Vision model to scan photos, mapping clothes and distinctive details instantly.
                  </p>
                </div>
                <button
                  id="btn-trigger-ai-analyzer"
                  type="button"
                  disabled={isAiAnalyzing}
                  onClick={handleAiVisionAnalyze}
                  className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-black text-[10px] font-bold uppercase tracking-wider rounded-lg font-sans flex items-center space-x-1 cursor-pointer disabled:opacity-40 transition-colors"
                >
                  {isAiAnalyzing ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Scanning...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3 w-3 text-black" />
                      <span>Run AI Auto-Profile</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Detailed Description Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label id="lbl-parent-hair" className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                  Hair Style / Color
                </label>
                <input
                  id="inp-parent-hair"
                  type="text"
                  placeholder="e.g. Short, curly black"
                  value={hairDesc}
                  onChange={(e) => setHairDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label id="lbl-parent-upper" className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                  Upper Apparel Shirt Color
                </label>
                <input
                  id="inp-parent-upper"
                  type="text"
                  placeholder="e.g. Saffron Kurta / red t-shirt"
                  value={upperColorDesc}
                  onChange={(e) => setUpperColorDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label id="lbl-parent-lower" className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                  Lower Apparel Color
                </label>
                <input
                  id="inp-parent-lower"
                  type="text"
                  placeholder="e.g. Denim jeans / white skirt"
                  value={lowerColorDesc}
                  onChange={(e) => setLowerColorDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div>
              <label id="lbl-parent-distinctive" className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                Distinctive Physical Identifiers (E.G. Wristband, payals, moles, bag)
              </label>
              <input
                id="inp-parent-distinctive"
                type="text"
                placeholder="e.g. Silver Payal (anklet) on right feet, spider-man backpack"
                value={featuresDesc}
                onChange={(e) => setFeaturesDesc(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Search Anchors context */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label id="lbl-parent-lastseen" className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                  Last Seen Location (Platform/Portal/City) *
                </label>
                <input
                  id="inp-parent-lastseen"
                  type="text"
                  required
                  placeholder="e.g. Platforms 4, KSR Majestic station"
                  value={lastLocation}
                  onChange={(e) => setLastLocation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label id="lbl-parent-phone" className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                  Parent Contact Number (Indian format) *
                </label>
                <input
                  id="inp-parent-phone"
                  type="text"
                  required
                  placeholder="+91 XXXXX XXXXX"
                  value={parentContact}
                  onChange={(e) => setParentContact(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div>
              <label id="lbl-anchor-cctv-offset" className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                Attach Initial Search Area Anchor CCTV Node
              </label>
              <select
                id="sel-anchor-cctv-offset"
                value={selectedLocationRef}
                onChange={(e) => setSelectedLocationRef(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
              >
                {cameras.map(cam => (
                  <option key={cam.id} value={cam.id}>
                    {cam.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Submission CTA */}
            <button
              id="btn-submit-kid-report"
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest font-sans flex items-center justify-center space-x-1.5 transition-all cursor-pointer active:scale-95 shadow-md shadow-cyan-950/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Activating City Sensors...</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="h-4 w-4 text-black" />
                  <span>Activate Neural Surveillance Scanner</span>
                </>
              )}
            </button>

          </form>
        </div>
      </div>

      {/* Right Side Panel - Active Case tracking logger */}
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-sans">
              Active Grid Reports
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">TRACKING MOBILE PUSH UPDATES</span>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 bg-cyan-950 text-cyan-400 rounded-full border border-cyan-500/10">
            {lostChildren.length} TOTAL
          </span>
        </div>

        <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
          {lostChildren.map(child => (
            <div 
              key={child.id}
              className={`bg-slate-900 border rounded-xl overflow-hidden shadow-md transition-colors ${
                child.status === 'Detected' 
                  ? 'border-red-500/40 bg-red-950/5' 
                  : child.status === 'Reunited' 
                  ? 'border-emerald-500/20 bg-emerald-950/5' 
                  : 'border-slate-800'
              }`}
            >
              <div className="p-4 flex space-x-3">
                <div className="w-14 h-14 bg-slate-950 rounded-lg overflow-hidden border border-slate-800 flex-shrink-0">
                  {child.photoUrl ? (
                    <img referrerPolicy="no-referrer" src={child.photoUrl} alt="Report profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[8px] font-mono text-slate-500 p-0.5 text-center">
                      NO PIC
                    </div>
                  )}
                </div>

                <div className="flex-grow min-w-0">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-slate-200 truncate">{child.name}</span>
                    <span className={`text-[8px] font-mono px-1 py-0.5 rounded uppercase tracking-tighter ${
                      child.status === 'Detected' 
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse' 
                        : child.status === 'Reunited' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                    }`}>
                      {child.status}
                    </span>
                  </div>

                  <div className="mt-1 space-y-0.5 text-[10px] text-slate-400 font-sans">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-slate-500 flex-shrink-0" />
                      <span>Age: {child.age} // Gender: {child.gender}</span>
                    </div>
                    <div className="flex items-center space-x-1 truncate">
                      <Phone className="w-3 h-3 text-slate-500 flex-shrink-0" />
                      <span>{child.parentPhone}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status footer and interaction */}
              <div className="px-4 py-2 bg-slate-950/40 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono">
                <div>
                  {child.status === 'Detected' && (
                    <span className="text-red-400 font-bold">
                      Matched {child.matchConfidence}% at CCTV-Node
                    </span>
                  )}
                  {child.status === 'Searching' && (
                    <span className="text-cyan-400">
                      Surveillance scanning active
                    </span>
                  )}
                  {child.status === 'Reunited' && (
                    <span className="text-emerald-400 flex items-center">
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Reunited with parent
                    </span>
                  )}
                </div>

                {child.status !== 'Reunited' && (
                  <button
                    id={`btn-manual-archive-reunion-${child.id}`}
                    onClick={() => onConfirmReunion(child.id)}
                    className="px-2 py-0.5 bg-emerald-500 hover:bg-emerald-400 text-black font-sans font-bold text-[9px] rounded uppercase cursor-pointer transition-colors active:scale-95"
                  >
                    Mark Reunited
                  </button>
                )}
              </div>

            </div>
          ))}

          {lostChildren.length === 0 && (
            <div className="text-center p-8 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 text-xs font-sans">
              No reported active lost profiles.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
