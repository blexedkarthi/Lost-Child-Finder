import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Sparkles, Send, Loader2, Globe, FileText, CheckCircle } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

interface AIChatbotProps {
  lostChildrenCount: number;
  detectedCount: number;
}

export function AIChatbot({ lostChildrenCount, detectedCount }: AIChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      sender: 'assistant',
      text: "Namaste. I am ChildShield AI Assistant. I can summarize active cases, check the Status of children in Bengaluru, Chennai or Delhi, or outline Indian National Childline helpline (1098) protocol. Select your preferred state language below.",
      timestamp: new Date()
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [lang, setLang] = useState<'en' | 'hi' | 'ta' | 'kn'>('en');
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    { title: "Status Summary", prompt: "Summarize all active missing child reports across transport hubs." },
    { title: "Rahul Sharma Status", prompt: "What is the current location of Rahul Sharma?" },
    { title: "FIR Procedures", prompt: "What is the immediate legal procedure for parents when a child is lost at an Indian railway station?" },
    { title: "Safety Checklist", prompt: "Generate a safety checklist for children traveling in busy metropolitan terminals." }
  ];

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const changeLanguage = (newLang: 'en' | 'hi' | 'ta' | 'kn') => {
    setLang(newLang);
    let greeting = "";
    if (newLang === 'hi') {
      greeting = "नमस्ते। मैं चाइल्डशील्ड एआई सहायक हूँ। मैं सक्रिय मामलों का पूरा सारांश दे सकती हूँ, बेंगलुरु या दिल्ली में बच्चों की स्थिति जाँच सकती हूँ, या राष्ट्रीय चाइल्डलाइन (1098) प्रक्रियाओं की जानकारी साझा कर सकती हूँ।";
    } else if (newLang === 'ta') {
      greeting = "வணக்கம். நான் சைல்ட்ஷீல்ட் ஏஐ உதவியாளர். தற்போதைய தேடுதல் நிலவரங்களை விளக்கவும், பெங்களூரு / சென்னை இரயில் நிலைய கண்காணிப்பு விபரங்கள் மற்றும் தேசிய குழந்தைகள் உதவி எண் (1098) பற்றி தகவல்களை வழங்கவும் நான் கடமைப்பட்டுள்ளேன்.";
    } else if (newLang === 'kn') {
      greeting = "ನಮಸ್ಕಾರ. ನಾನು ಚೈಲ್ಡ್‌ಶೀಲ್ಡ್ AI ಸಹಾಯಕ. ಸಕ್ರಿಯ ಪ್ರಕರಣಗಳ ಸಾರಾಂಶವನ್ನು ನೀಡಲು, ರೈಲ್ವೆ ನಿಲ್ದಾಣಗಳಲ್ಲಿನ ಮಕ್ಕಳ ಪತ್ತೆಹಚ್ಚುವಿಕೆ ವಿವರಗಳು ಹಾಗೂ ರಾಷ್ಟ್ರೀಯ ಚೈಲ್ಡ್‌ಲೈನ್ (1098) ನಿಯಮಗಳನ್ನು ತಿಳಿಸಲು ನಾನು ಸದಾ ಸಿದ್ಧ.";
    } else {
      greeting = "Hello, I am ChildShield AI Assistant. I can summarize active cases, check the status of children in Bengaluru, Chennai or Delhi, or outline Indian National Childline helpline (1098) protocol.";
    }

    setMessages(prev => [
      ...prev,
      {
        id: Math.random().toString(),
        sender: 'assistant',
        text: greeting,
        timestamp: new Date()
      }
    ]);
  };

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;
    
    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInputVal('');
    setIsSending(true);

    try {
      const res = await fetch('/api/gemini/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          language: lang,
          chatHistory: [] // Can extend for continuous chats
        })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [
          ...prev,
          {
            id: Math.random().toString(),
            sender: 'assistant',
            text: data.reply,
            timestamp: new Date()
          }
        ]);
      } else {
        throw new Error("Chat api failed");
      }
    } catch (e) {
      setMessages(prev => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: 'assistant',
          text: "System communication temporary glitch. Please describe your enquiry again. Indian Railways security office is reachable directly on 139 or child helpdesk 1098.",
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-cyan-500/30 rounded-xl overflow-hidden flex flex-col h-[calc(100vh-140px)] shadow-2xl shadow-cyan-950/40">
      
      {/* Header Info */}
      <div className="bg-slate-950 border-b border-cyan-500/20 p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-cyan-950 rounded-lg text-cyan-400 animate-pulse border border-cyan-500/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 id="ai-chat-title" className="text-sm font-semibold tracking-wide text-cyan-400 font-sans uppercase">
              Gemini Cognitive Crisis Center
            </h2>
            <p className="text-[10px] text-slate-400 font-mono">
              SYSTEM CONTEXT MODEL: GEMINI-3.5-FLASH // DIAL 1098 FOR EMERGENCY
            </p>
          </div>
        </div>

        {/* Multilingual Selector */}
        <div className="flex items-center bg-slate-900 border border-slate-700/60 rounded-lg p-1 space-x-1">
          <Globe className="text-slate-400 h-3.5 w-3.5 mx-1" />
          <button 
            id="lang-en"
            onClick={() => changeLanguage('en')}
            className={`px-2 py-0.5 text-xs rounded transition-all font-sans font-medium ${lang === 'en' ? 'bg-cyan-500 text-black font-semibold shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}
          >
            EN
          </button>
          <button 
            id="lang-hi"
            onClick={() => changeLanguage('hi')}
            className={`px-2 py-0.5 text-xs rounded transition-all font-sans font-medium ${lang === 'hi' ? 'bg-cyan-500 text-black font-semibold shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}
          >
            हिंदी
          </button>
          <button 
            id="lang-ta"
            onClick={() => changeLanguage('ta')}
            className={`px-2 py-0.5 text-xs rounded transition-all font-sans font-medium ${lang === 'ta' ? 'bg-cyan-500 text-black font-semibold shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}
          >
            தமிழ்
          </button>
          <button 
            id="lang-kn"
            onClick={() => changeLanguage('kn')}
            className={`px-2 py-0.5 text-xs rounded transition-all font-sans font-medium ${lang === 'kn' ? 'bg-cyan-500 text-black font-semibold shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}
          >
            ಕನ್ನಡ
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-950/40 custom-scrollbar">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-xl px-4 py-3 border text-sm font-sans leading-relaxed shadow-lg ${
              m.sender === 'user' 
                ? 'bg-cyan-600/10 border-cyan-500/30 text-cyan-100 rounded-tr-none' 
                : 'bg-slate-900 border-slate-700/60 text-slate-200 rounded-tl-none'
            }`}>
              <div className="flex items-center space-x-1.5 mb-1 opacity-70">
                <span className="text-[10px] font-semibold tracking-wider font-mono uppercase">
                  {m.sender === 'user' ? 'Citizen Operator' : 'ChildShield AI Agent'}
                </span>
                <span className="text-[9px] font-mono">
                  • {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="whitespace-pre-line text-[13px]">{m.text}</p>
            </div>
          </div>
        ))}
        {isSending && (
          <div className="flex justify-start">
            <div className="bg-slate-900 border border-slate-700/40 rounded-xl rounded-tl-none px-4 py-3 text-slate-300 text-xs flex items-center space-x-2">
              <Loader2 className="h-3.5 w-3.5 text-cyan-400 animate-spin" />
              <span className="font-mono text-[10px] tracking-widest text-cyan-500/80 animate-pulse">
                GEMINI AI PROCESSING INTENT IN {lang.toUpperCase()}...
              </span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Quick Prompts Panel */}
      <div className="p-3 bg-slate-950 border-t border-cyan-500/10">
        <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-2 flex items-center">
          <Sparkles className="h-3 w-3 mr-1 text-cyan-400" /> Cognitive Rapid Query suggestions
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {quickPrompts.map((p, idx) => (
            <button
              id={`quick-prompt-${idx}`}
              key={idx}
              disabled={isSending}
              onClick={() => handleSend(p.prompt)}
              className="text-left bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/40 p-2 rounded-lg text-xs hover:text-cyan-300 text-slate-300 transition-all cursor-pointer font-sans"
            >
              <div className="font-semibold text-cyan-400 mb-0.5">{p.title}</div>
              <div className="text-[10px] text-slate-400 line-clamp-1">{p.prompt}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Input Field Form */}
      <form
        id="ai-chat-input-form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(inputVal);
        }}
        className="p-3 bg-slate-950 border-t border-cyan-500/20 flex space-x-2"
      >
        <input
          id="ai-chat-text-input"
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder={`Enter query or describe incident in ${lang.toUpperCase()}...`}
          disabled={isSending}
          className="flex-1 bg-slate-900 border border-slate-700/60 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-sans disabled:opacity-50"
        />
        <button
          id="btn-ai-chat-send"
          type="submit"
          disabled={isSending || !inputVal.trim()}
          className="bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 disabled:text-slate-600 text-black px-4 py-2 rounded-lg text-xs font-semibold uppercase font-sans flex items-center space-x-1 cursor-pointer transition-all active:scale-95"
        >
          {isSending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <span>Send</span>
              <Send className="h-3 w-3" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
