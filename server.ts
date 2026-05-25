import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Gemini SDK with named parameters
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.trim() !== '') {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
  console.log('Gemini API initialized successfully server-side for ChildShield AI.');
} else {
  console.log('Gemini API running in simulated fallback mode (No valid key provided yet).');
}

// Data Interfaces
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

// Premium localized Indian mock dataset
let lostChildren: LostChild[] = [
  {
    id: "CHILD_1",
    name: "Rahul Sharma",
    age: 6,
    gender: "Male",
    hair: "Black, short trimmed",
    upperColor: "Red and blue striped t-shirt",
    lowerColor: "Blue denim jeans",
    distinctiveFeatures: "Right-hand wrist has a silver Kada bracelet, carrying a small red Spider-Man water bottle",
    photoUrl: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&q=80&w=200",
    status: 'Detected',
    lastSeenLocation: "Bengaluru Majestic Railway Station, Platform 4",
    lastSeenTime: "12 mins ago",
    coordinates: { lat: 12.9779, lng: 77.5694 },
    matchConfidence: 94,
    detectedAtCamera: "CAM_01",
    parentPhone: "+91 94445 12093"
  },
  {
    id: "CHILD_2",
    name: "Priya Gowda",
    age: 5,
    gender: "Female",
    hair: "Black hair, braided with red ribbons",
    upperColor: "Light pink floral dress",
    lowerColor: "White leggings",
    distinctiveFeatures: "Silver anklets (Payal), carrying a yellow school bottle",
    photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
    status: 'Searching',
    lastSeenLocation: "Kempegowda Bus Station (KBS), Terminal-A",
    lastSeenTime: "1 hour ago",
    coordinates: { lat: 12.9784, lng: 77.5721 },
    matchConfidence: 0,
    detectedAtCamera: null,
    parentPhone: "+91 98802 38411"
  },
  {
    id: "CHILD_3",
    name: "Aarav Patel",
    age: 7,
    gender: "Male",
    hair: "Curly black hair",
    upperColor: "Saffron / yellow cotton Kurta",
    lowerColor: "Black cotton trousers",
    distinctiveFeatures: "A blue cartoon wristwatch, wearing black strap sandals",
    photoUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200",
    status: 'Reunited',
    lastSeenLocation: "Mumbai Central Railway Station Entrance",
    lastSeenTime: "4 hours ago",
    coordinates: { lat: 18.9696, lng: 72.8194 },
    matchConfidence: 98,
    detectedAtCamera: "CAM_03",
    parentPhone: "+91 91234 56789"
  },
  {
    id: "CHILD_4",
    name: "Diya Sundaram",
    age: 4,
    gender: "Female",
    hair: "Short black bob cut",
    upperColor: "Bright yellow top with white lace",
    lowerColor: "Blue denim skirt",
    distinctiveFeatures: "Pink hairband with butterfly clip, carrying a yellow teddy bear doll",
    photoUrl: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=200",
    status: 'Searching',
    lastSeenLocation: "Dr. MGR Chennai Central Lobby",
    lastSeenTime: "2 hours ago",
    coordinates: { lat: 13.0824, lng: 80.2754 },
    matchConfidence: 0,
    detectedAtCamera: null,
    parentPhone: "+91 99887 76655"
  }
];

let cameras: CameraFeed[] = [
  {
    id: "CAM_01",
    name: "CAM-101 (KSR Bengaluru Majestic Platform 4)",
    location: "KSR Bengaluru Majestic, Karnataka",
    status: 'Match Located',
    latestIncident: "Rahul Sharma detected",
    coordinates: { lat: 12.9779, lng: 77.5694 }
  },
  {
    id: "CAM_02",
    name: "CAM-102 (Kempegowda Bus Station Exit)",
    location: "KBS Terminal, Bengaluru, Karnataka",
    status: 'Scanning',
    latestIncident: null,
    coordinates: { lat: 12.9784, lng: 77.5721 }
  },
  {
    id: "CAM_03",
    name: "CAM-103 (Mumbai Central Terminal Lobby)",
    location: "Mumbai Central, Maharashtra",
    status: 'Scanning',
    latestIncident: "Aarav Patel successfully reunited with family",
    coordinates: { lat: 18.9696, lng: 72.8194 }
  },
  {
    id: "CAM_04",
    name: "CAM-104 (Dr. MGR Chennai Central South Entry)",
    location: "Chennai Central, Tamil Nadu",
    status: 'Scanning',
    latestIncident: null,
    coordinates: { lat: 13.0824, lng: 80.2754 }
  },
  {
    id: "CAM_05",
    name: "CAM-105 (New Delhi Terminal Gate 1)",
    location: "New Delhi Railway Station, Delhi",
    status: 'Scanning',
    latestIncident: null,
    coordinates: { lat: 28.6430, lng: 77.2197 }
  }
];

let alerts: LiveAlert[] = [
  {
    id: "ALERT_1",
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    childName: "Rahul Sharma",
    childId: "CHILD_1",
    cameraName: "CAM-101 (KSR Bengaluru Majestic Platform 4)",
    cameraId: "CAM_01",
    confidence: 94,
    status: 'Parent Notified',
    coordinates: { lat: 12.9779, lng: 77.5694 }
  },
  {
    id: "ALERT_2",
    timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    childName: "Aarav Patel",
    childId: "CHILD_3",
    cameraName: "CAM-103 (Mumbai Central Terminal Lobby)",
    cameraId: "CAM_03",
    confidence: 98,
    status: 'Reunited',
    coordinates: { lat: 18.9696, lng: 72.8194 }
  }
];

let smsLogs: SMSLog[] = [
  {
    id: "SMS_1",
    phone: "+91 94445 12093",
    message: "AMBER ALERT (IND): Rahul Sharma (6y/o) matched camera CAM-101 at KSR Bengaluru Majestic Platform 4 with 94% confidence. Automated police and NGO search teams dispatched. Help desk: 1098.",
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    status: 'Delivered'
  },
  {
    id: "SMS_2",
    phone: "+91 91234 56789",
    message: "REUNION EXCELLENCE: Aarav Patel has been successfully united with family at CCTV-CAM-103 Mumbai Central Terminal. Case registered as Reunited. Thank you, Citizen Assistance.",
    timestamp: new Date(Date.now() - 1000 * 60 * 238).toISOString(),
    status: 'Delivered'
  }
];

const initialLostChildren = JSON.parse(JSON.stringify(lostChildren));
const initialCameras = JSON.parse(JSON.stringify(cameras));
const initialAlerts = JSON.parse(JSON.stringify(alerts));
const initialSmsLogs = JSON.parse(JSON.stringify(smsLogs));

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '15mb' }));

  // API: Get current operational state
  app.get('/api/status', (req, res) => {
    res.json({
      lostChildren,
      cameras,
      alerts,
      smsLogs,
      stats: {
        activeReportsCount: lostChildren.filter(c => c.status === 'Searching').length,
        detectedCount: lostChildren.filter(c => c.status === 'Detected').length,
        reunitedCount: lostChildren.filter(c => c.status === 'Reunited').length,
        activeCamerasCount: cameras.filter(cam => cam.status !== 'Offline').length,
        matchConfidenceAvg: Math.round(
          lostChildren.reduce((acc, curr) => acc + (curr.matchConfidence || 0), 0) /
          (lostChildren.filter(c => c.matchConfidence > 0).length || 1)
        ),
      }
    });
  });

  // API: Register the missing child report (Parent Portal)
  app.post('/api/report', (req, res) => {
    const { name, age, gender, hair, upperColor, lowerColor, distinctiveFeatures, lastSeenLocation, phone, coordinates, photoUrl } = req.body;
    
    if (!name || !phone) {
      return res.status(400).json({ error: "Name and parent Indian contact phone are required." });
    }

    // Default coordinates in Majestic if not passed
    const defaultCoords = coordinates || { lat: 12.9779 + (Math.random() - 0.5) * 0.04, lng: 77.5694 + (Math.random() - 0.5) * 0.04 };

    const newChild: LostChild = {
      id: "CHILD_" + (lostChildren.length + 1),
      name,
      age: parseInt(age) || 5,
      gender: gender || "Male",
      hair: hair || "Black",
      upperColor: upperColor || "Apparel color",
      lowerColor: lowerColor || "Pants/skirt Color",
      distinctiveFeatures: distinctiveFeatures || "No major marks",
      photoUrl: photoUrl || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
      status: 'Searching',
      lastSeenLocation: lastSeenLocation || "Bengaluru Metro",
      lastSeenTime: "Just registered",
      coordinates: defaultCoords,
      matchConfidence: 0,
      detectedAtCamera: null,
      parentPhone: phone,
    };

    lostChildren.push(newChild);

    // Dynamic initial registration SMS log
    const systemSMS: SMSLog = {
      id: "SMS_" + (smsLogs.length + 1),
      phone,
      message: `CHILDSHIELD ALERT (IND): Missing Child registration for '${name}' (Age ${age}) active on citizen surveillance grid. Smart face scanning is now scanning multi-feed CCTV cameras in transport hubs. Helpline: 1098.`,
      timestamp: new Date().toISOString(),
      status: 'Sent'
    };
    smsLogs.push(systemSMS);

    res.status(201).json({ success: true, child: newChild });
  });

  // API: Run server-side Gemini Visual Profiling analysis using @google/genai on uploaded image
  app.post('/api/gemini/analyze', async (req, res) => {
    try {
      const { base64Data, mimeType } = req.body;
      if (!base64Data) {
        return res.status(400).json({ error: "Missing image base64 data for analysis." });
      }

      if (!ai) {
        // Fallback realistic profiling in case API key is missing
        console.log("No Gemini API key. Resolving simulation analysis...");
        setTimeout(() => {
          res.json({
            analysis: {
              estimatedAge: 5,
              gender: "Female",
              hair: "Black neat bob cut with pink clip",
              upperColor: "Yellow cotton top",
              lowerColor: "Blue denim skirt",
              distinctiveFeatures: "Carrying a flower printed small backpack. Traditional metal payal visible on legs.",
              confidenceScore: 95
            },
            simulated: true,
          });
        }, 1500);
        return;
      }

      const imagePart = {
        inlineData: {
          mimeType: mimeType || 'image/jpeg',
          data: base64Data
        }
      };

      const promptPart = {
        text: `Analyze this photograph of an Indian child for a missing reporting form. Focus on clothes, apparel, ethnic factors (e.g. kangan, kadas, payals, bindi, ribbons) to construct a highly searchable description. Return exactly these fields in JSON format:
        - estimatedAge (integer)
        - gender (string, e.g. Male or Female)
        - hair (string, hair description)
        - upperColor (string, color/style of shirts/kurta/t-shirt)
        - lowerColor (string, trousers/jeans/leggings/shorts)
        - distinctiveFeatures (string, bags, glasses, sandals, payal/wristband details)
        - confidenceScore (integer, max 100)`
      };

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: { parts: [imagePart, promptPart] },
        config: {
          systemInstruction: "You are the head of the ChildShield Emergency Response Team in India. Extract clothing with precise detail to power real-time AI computer vision search.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              estimatedAge: { type: Type.INTEGER, description: "Estimated age in years" },
              gender: { type: Type.STRING },
              hair: { type: Type.STRING },
              upperColor: { type: Type.STRING },
              lowerColor: { type: Type.STRING },
              distinctiveFeatures: { type: Type.STRING },
              confidenceScore: { type: Type.INTEGER }
            },
            required: ['estimatedAge', 'gender', 'hair', 'upperColor', 'lowerColor']
          }
        }
      });

      const resultText = response.text || "{}";
      const parsed = JSON.parse(resultText.trim());

      res.json({ analysis: parsed, simulated: false });
    } catch (e: any) {
      console.error("Gemini server-side analysis failed:", e);
      res.status(500).json({ error: "Failed during AI process: " + e.message });
    }
  });

  // API: Multilingual Gemini Assistant Chatbot incorporating database context
  app.post('/api/gemini/chatbot', async (req, res) => {
    try {
      const { message, language, chatHistory } = req.body;
      
      const langNames: Record<string, string> = {
        en: "English",
        hi: "हिन्दी (Hindi)",
        ta: "தமிழ் (Tamil)",
        kn: "ಕನ್ನಡ (Kannada)"
      };
      
      const targetLang = langNames[language || 'en'] || "English";

      // Context construction: list active lost kids, cameras, alerts, helpline instructions!
      const activeSearching = lostChildren.filter(c => c.status === 'Searching');
      const detectedKids = lostChildren.filter(c => c.status === 'Detected');
      const reunitedKids = lostChildren.filter(c => c.status === 'Reunited');

      const caseDetails = activeSearching.map(c => `- ${c.name} (Age: ${c.age}, Gender: ${c.gender}, Last seen: ${c.lastSeenLocation}, Apparel: ${c.upperColor}/${c.lowerColor}, Parent Contact: ${c.parentPhone})`).join('\n') || "None";
      const detectedDetails = detectedKids.map(c => `- ${c.name} has been detected with ${c.matchConfidence}% confidence at camera ${c.detectedAtCamera}. Parent contact: ${c.parentPhone}`).join('\n') || "None";
      const reunitedDetails = reunitedKids.map(c => `- ${c.name} was successfully reunited at Chennai/Mumbai terminal.`).join('\n') || "None";

      const systemInstruction = `You are "ChildShield AI Assistant", the official crisis responder AI for the smart city missing child network in India.
      The user is asking questions about the active lost children monitoring system. Use the database state below to answer their questions 100% accurately without inventing fake children.
      
      --- CURRENT CHILDSHIELD DATABASE ---
      Active Searching Children Case Count: ${activeSearching.length}
      Detail of Kids actively searched:
      ${caseDetails}
      
      CCTV Detected Cases: ${detectedKids.length}
      Detail of CCTV detected cases:
      ${detectedDetails}
      
      Reunited Cases: ${reunitedKids.length}
      Detail of reunited kids:
      ${reunitedDetails}
      
      City Hub Camera Assets covered: 5 nodes (KSR Bengaluru Majestic, KBS Bus Station, Chennai Central, Mumbai Central Terminal, New Delhi Station Gate 1).
      Indian Emergency Child Protection Helpline: Dial '1098' (National Childline).
      
      --- LANGUAGE MANDATE ---
      You MUST respond exclusively in ${targetLang}. If the user asks in English but requested Tamil or Hindi, you must still respond in ${targetLang}. Ensure polite, clear, urgent yet reassuring tone. Make use of list formats and direct bullet points for safety instructions. Add Indian helplines and NGO integration guidance where helpful.`;

      if (!ai) {
        // High quality simulated response if API key is missing
        console.log("Gemini Chatbot running in fallback dialogue mode.");
        let simulatedReply = "";
        
        if (targetLang.includes("Hindi")) {
          simulatedReply = `नमस्ते। मैं चाइल्डशील्ड एआई सहायक हूँ। हमारी प्रणाली में इस समय ${activeSearching.length} बच्चे खोजने के अभियान सक्रिय हैं और ${detectedKids.length} बच्चे कैमरा फीड में पकड़े गए हैं। क्या आप किसी खोए हुए बच्चे की रिपोर्ट दर्ज कराना चाहते हैं या किसी सक्रिय मामले का सारांश देखना चाहते हैं? आपातकालीन राष्ट्रीय हेल्पलाइन 1098 पर भी संपर्क कर सकते हैं।`;
        } else if (targetLang.includes("Tamil")) {
          simulatedReply = `வணக்கம். நான் சைல்ட்ஷீல்ட் ஏஐ உதவியாளர். தற்போது ${activeSearching.length} குழந்தைகள் தேடுதல் கண்காணிப்பில் உள்ளனர், ${detectedKids.length} குழந்தைகள் கேமரா மூலம் அடையாளம் காணப்பட்டுள்ளனர். உடனடியாக பெற்றோருக்கு அறிவிப்பு அனுப்பப்பட்டுள்ளது. உங்களுக்கு ஏதேனும் உதவி தேவையா? தேசிய குழந்தைகள் உதவி எண்: 1098.`;
        } else if (targetLang.includes("Kannada")) {
          simulatedReply = `ನಮಸ್ಕಾರ. ನಾನು ಚೈಲ್ಡ್‌ಶೀಲ್ಡ್ AI ಸಹಾಯಕ. ಪ್ರಸ್ತುತ ${activeSearching.length} ಮಕ್ಕಳಿಗಾಗಿ ತೀವ್ರ ಹುಡುಕಾಟ ಜಾರಿಯಲ್ಲಿದೆ. ${detectedKids.length} ಮಗುವನ್ನು ಸಿಸಿಟಿವಿ ಮೂಲಕ ಪತ್ತೆಹಚ್ಚಲಾಗಿದೆ. ತಕ್ಷಣ ತಾಯಿತಂದೆಗೆ ಮಾಹಿತಿ ತಲುಪಿದೆ. ಬೇರೆ ಮಾಹಿತಿ ಬೇಕಿದ್ದರೆ ದಯವಿಟ್ಟು ಕೇಳಿ. ತುರ್ತು ಸಹಾಯವಾಣಿ: 1098.`;
        } else {
          simulatedReply = `Hello, I am ChildShield AI Assistant. Currently, there are ${activeSearching.length} active missing child searches on our grid, with ${detectedKids.length} child recently spotted on smart cameras. I can summarize active alerts, outline step-by-step procedures to file complaints, or provide information on railway and bus station node sensors. Dial '1098' for India's child safety line.`;
        }
        
        setTimeout(() => {
          res.json({ reply: simulatedReply, simulated: true });
        }, 800);
        return;
      }

      // Configure chat session on server
      const chat = ai.chats.create({
        model: 'gemini-3.5-flash',
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7
        }
      });

      // Send the query message to the chat session
      const response = await chat.sendMessage({
        message: message || "Can you summarize all active reports?"
      });

      res.json({ reply: response.text, simulated: false });
    } catch (e: any) {
      console.error("Gemini Chatbot API failed:", e);
      res.status(500).json({ error: "AI assistant suffered an internal lock: " + e.message });
    }
  });

  // API: Simulate CCTV smart sensor match detection event
  app.post('/api/simulate-detection', (req, res) => {
    const { childId, cameraId, confidence } = req.body;
    
    const child = lostChildren.find(c => c.id === childId);
    const camera = cameras.find(cam => cam.id === cameraId);

    if (!child || !camera) {
      return res.status(404).json({ error: "Child or Camera not found." });
    }

    const conf = parseInt(confidence) || Math.floor(Math.random() * 10) + 88; // 88-98%

    // Move child pin to camera hub coordinates, lock detection state
    child.status = 'Detected';
    child.matchConfidence = conf;
    child.detectedAtCamera = camera.id;
    child.coordinates = { ...camera.coordinates };

    // Update cctv node status flag
    camera.status = 'Match Located';
    camera.latestIncident = `CCTV Automated Match locked for ${child.name} with ${conf}% confidence`;

    // Overwrite/unshift warning alert trace
    const newAlert: LiveAlert = {
      id: "ALERT_" + (alerts.length + 1),
      timestamp: new Date().toISOString(),
      childName: child.name,
      childId: child.id,
      cameraName: camera.name,
      cameraId: camera.id,
      confidence: conf,
      status: 'Parent Notified',
      coordinates: { ...camera.coordinates }
    };
    alerts.unshift(newAlert);

    // Urgent Regional SMS push transmission simulation
    const smsText = `🚨 URGENT CHILDSHIELD MATCH ( Helpline 1098 ): Our CCTV camera '${camera.name}' located profile matching '${child.name}' with ${conf}% face confidence. Instant push signal dispatched. Direct coordinates: Lat ${camera.coordinates.lat.toFixed(4)}, Lng ${camera.coordinates.lng.toFixed(4)}. NGO rescue division alerted.`;
    
    const rescueSMS: SMSLog = {
      id: "SMS_" + (smsLogs.length + 1),
      phone: child.parentPhone,
      message: smsText,
      timestamp: new Date().toISOString(),
      status: 'Sent'
    };
    smsLogs.unshift(rescueSMS);

    res.json({ success: true, alert: newAlert, child });
  });

  // API: Parent/Police confirms reunion
  app.post('/api/confirm-reunion', (req, res) => {
    const { childId } = req.body;
    const child = lostChildren.find(c => c.id === childId);

    if (!child) {
      return res.status(404).json({ error: "Profile not found." });
    }

    child.status = 'Reunited';
    child.matchConfidence = 100;
    
    if (child.detectedAtCamera) {
      const camera = cameras.find(cam => cam.id === child.detectedAtCamera);
      if (camera) {
        camera.status = 'Scanning';
        camera.latestIncident = `${child.name} reunited with family. City wide locks cleared.`;
      }
    }

    // Mark matched warning alarms as reunited
    alerts.filter(a => a.childId === childId).forEach(a => {
      a.status = 'Reunited';
    });

    const reunionSMS: SMSLog = {
      id: "SMS_" + (smsLogs.length + 1),
      phone: child.parentPhone,
      message: `🎉 SAFE REUNION DECLARED: missing child '${child.name}' has been safely verified and reunited with parents. This case is officially closed on ChildShield AI tracking logs. Dial 1098 for ongoing children assistance.`,
      timestamp: new Date().toISOString(),
      status: 'Delivered'
    };
    smsLogs.unshift(reunionSMS);

    res.json({ success: true, child });
  });

  // API: Reset standard state to defaults
  app.post('/api/reset-data', (req, res) => {
    lostChildren = JSON.parse(JSON.stringify(initialLostChildren));
    cameras = JSON.parse(JSON.stringify(initialCameras));
    alerts = JSON.parse(JSON.stringify(initialAlerts));
    smsLogs = JSON.parse(JSON.stringify(initialSmsLogs));
    res.json({ success: true });
  });

  // Handle static assets routing
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ChildShield AI backplane listening securely on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Fatal startup error for ChildShield AI:", err);
});
