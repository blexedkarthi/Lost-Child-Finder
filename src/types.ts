export interface LostChild {
  id: string;
  name: string;
  age: number;
  gender: string;
  hair: string;
  upperColor: string;
  lowerColor: string;
  distinctiveFeatures: string;
  photoUrl: string | null;
  status: 'Searching' | 'Detected' | 'Reunited';
  lastSeenLocation: string;
  lastSeenTime: string;
  coordinates: { lat: number; lng: number };
  matchConfidence: number;
  detectedAtCamera: string | null;
  parentPhone: string;
}

export interface CameraFeed {
  id: string;
  name: string;
  location: string;
  status: 'Scanning' | 'Match Located' | 'Offline';
  latestIncident: string | null;
  coordinates: { lat: number; lng: number };
}

export interface LiveAlert {
  id: string;
  timestamp: string;
  childName: string;
  childId: string;
  cameraName: string;
  cameraId: string;
  confidence: number;
  status: 'Parent Notified' | 'Dispatched' | 'Reunited';
  coordinates: { lat: number; lng: number };
}

export interface SMSLog {
  id: string;
  phone: string;
  message: string;
  timestamp: string;
  status: 'Sent' | 'Delivered' | 'Failed';
}

export interface SystemStats {
  activeReportsCount: number;
  detectedCount: number;
  reunitedCount: number;
  activeCamerasCount: number;
  matchConfidenceAvg: number;
}

export type PageType = 
  | 'landing' 
  | 'parent-dashboard' 
  | 'admin-dashboard' 
  | 'live-detection' 
  | 'cctv-monitoring' 
  | 'maps' 
  | 'alerts-history' 
  | 'chatbot' 
  | 'settings'
  | 'auth';
