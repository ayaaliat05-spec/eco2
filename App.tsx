import React, { useState, useRef, useEffect } from 'react';
import { sendMessageToGemini } from './services/geminiService';
import { Message, MessageRole, EcoMode } from './types';
import EcoTree from './components/EcoTree';
import ChartRenderer from './components/ChartRenderer';
import { Mic, Paperclip, Send, Save, ChevronLeft, Terminal, Volume2, VolumeX, Square, FileText } from 'lucide-react';

// MathJax global definition
declare global {
  interface Window {
    MathJax: any;
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const App: React.FC = () => {
  const [mode, setMode] = useState<EcoMode>(EcoMode.Home);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{data: string, type: string, name: string} | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoVoice, setAutoVoice] = useState(true);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initial Greeting
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'init-1',
          role: MessageRole.Model,
          text: 'Eco activated. Systems online. Specialized in Material Chemistry, Quality Control, and Robotics. I can now analyze PDF/Word documents and speak your language.',
          timestamp: new Date()
        }
      ]);
    }
  }, []);

  // Load Voices for TTS
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        setAvailableVoices(voices);
      }
    };

    loadVoices();
    // Chrome requires this event to load voices asynchronously
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle Speech Synthesis state
  useEffect(() => {
    const checkSpeaking = setInterval(() => {
      if (!window.speechSynthesis.speaking && isSpeaking) {
        setIsSpeaking(false);
      }
    }, 500);
    return () => clearInterval(checkSpeaking);
  }, [isSpeaking]);

  const speakText = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    // التنظيف من رموز الماركدواون والرياضيات للقراءة السلسة
    const cleanText = text
      .replace(/\*\*/g, '') // Remove bold
      .replace(/[#`$]/g, '') // Remove markdown symbols
      .replace(/\\ce\{([^}]+)\}/g, '$1') // Clean chemical formulas
      .replace(/\\/g, ''); // Remove backslashes

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // كشف اللغة بدقة
    // العربية: نطاق يونيكود من 0600 إلى 06FF
    const hasArabicChar = /[\u0600-\u06FF]/.test(cleanText);
    
    utterance.lang = hasArabicChar ? 'ar-SA' : 'en-US';
    
    // محاولة اختيار صوت مناسب من القائمة المحملة
    if (availableVoices.length > 0) {
      let preferredVoice;
      if (hasArabicChar) {
        // البحث عن صوت عربي
        preferredVoice = availableVoices.find(v => v.lang.includes('ar') || v.name.toLowerCase().includes('arabic'));
      } else {
        // البحث عن صوت إنجليزي (يفضل Google US أو Microsoft Zira)
        preferredVoice = availableVoices.find(v => (v.lang === 'en-US' && v.name.includes('Google')) || v.name.includes('Zira'));
      }

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
    }

    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const handleSendMessage = async () => {
    if ((!inputText.trim() && !selectedFile) || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: MessageRole.User,
      text: inputText,
      timestamp: new Date(),
      imageUrl: selectedFile ? selectedFile.data : undefined
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setSelectedFile(null);
    setIsLoading(true);

    const response = await sendMessageToGemini(messages, userMsg.text, userMsg.imageUrl);

    const modelMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: MessageRole.Model,
      text: response.text,
      timestamp: new Date(),
      chartConfig: response.chartConfig
    };

    setMessages(prev => [...prev, modelMsg]);
    setIsLoading(false);

    // نطق الإجابة تلقائياً إذا كان الخيار مفعلاً
    if (autoVoice) {
      speakText(response.text);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedFile({
          data: reader.result as string,
          type: file.type,
          name: file.name
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input not supported in this browser.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ar-SA'; // افتراض العربية للإدخال الصوتي، ويمكن تغييره ديناميكياً
    recognition.interimResults = false;
    
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputText(prev => prev + (prev ? ' ' : '') + transcript);
    };

    recognition.start();
  };

  const renderFormattedText = (text: string) => {
    return text.split('\n').map((line, i) => (
      <p key={i} className="mb-2 min-h-[1em]">
        {line.split(/(\*\*.*?\*\*)/).map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={j} className="text-eco-300 font-bold drop-shadow-[0_0_2px_rgba(52,211,153,0.5)]">{part.slice(2, -2)}</strong>;
          }
          return part;
        })}
      </p>
    ));
  };

  return (
    <div className="min-h-screen bg-black text-gray-200 font-mono flex flex-col overflow-hidden relative">
      {/* Background Drawings - Chemistry Symbols */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-10">
        <svg className="w-full h-full" viewBox="0 0 1000 1000">
          <path d="M50 50 L150 50 L150 150 L50 150 Z" fill="none" stroke="#10b981" />
          <circle cx="500" cy="500" r="100" fill="none" stroke="#10b981" />
          <path d="M800 100 L900 200 M900 100 L800 200" stroke="#10b981" />
        </svg>
      </div>

      {/* Header */}
      <header className="p-4 flex justify-between items-center z-40 bg-black/60 backdrop-blur-lg border-b border-eco-900/40">
        <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setMode(EcoMode.Home)}>
          <div className="w-10 h-10 border-2 border-eco-500 rounded-lg flex items-center justify-center rotate-45 group-hover:rotate-90 transition-transform">
             <div className="w-6 h-6 bg-eco-500/20 rounded-sm -rotate-45"></div>
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-white tracking-widest">ECO <span className="text-eco-500">AI</span></h1>
            <span className="text-[9px] text-eco-600 uppercase font-bold">Materials Intelligence</span>
          </div>
        </div>
        
        <div className="flex gap-3 items-center">
           {/* Voice Toggle */}
           <button 
             onClick={() => setAutoVoice(!autoVoice)}
             className={`p-2 rounded-full border transition-all ${autoVoice ? 'bg-eco-900/40 border-eco-500 text-eco-400' : 'bg-neutral-900 border-neutral-700 text-neutral-500'}`}
             title={autoVoice ? "Auto-Voice ON" : "Auto-Voice OFF"}
           >
             {autoVoice ? <Volume2 size={18} /> : <VolumeX size={18} />}
           </button>

           {isSpeaking && (
              <button 
                onClick={stopSpeaking} 
                className="p-2 bg-red-900/30 border border-red-800 rounded-full animate-pulse text-red-400"
                title="Stop AI Voice"
              >
                <Square size={16} fill="currentColor" />
              </button>
           )}
           
           {mode === EcoMode.Chat && (
             <button onClick={() => setMode(EcoMode.Home)} className="p-2 hover:bg-eco-900/20 rounded-full">
               <ChevronLeft size={20} className="text-eco-500" />
             </button>
           )}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 relative overflow-hidden flex flex-col z-10">
        {mode === EcoMode.Home ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <EcoTree onBranchSelect={(prefix) => { setMode(EcoMode.Chat); setInputText(prefix); }} />
          </div>
        ) : (
          <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full">
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth">
               {messages.map((msg) => (
                 <div key={msg.id} className={`flex ${msg.role === MessageRole.User ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                   <div className={`max-w-[85%] p-5 rounded-2xl relative ${
                     msg.role === MessageRole.User 
                       ? 'bg-neutral-900/80 border border-neutral-800 text-gray-200' 
                       : 'bg-eco-950/20 backdrop-blur-md border border-eco-500/20 text-eco-50 shadow-[0_0_20px_-5px_rgba(16,185,129,0.1)]'
                   }`}>
                     <div className="flex items-center justify-between mb-2 border-b border-white/5 pb-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-eco-600">
                          {msg.role === MessageRole.User ? 'Researcher' : 'Eco Core'}
                        </span>
                        {msg.role === MessageRole.Model && (
                          <button onClick={() => speakText(msg.text)} className="text-eco-500 hover:text-white p-1">
                            <Volume2 size={14} />
                          </button>
                        )}
                     </div>

                     {msg.imageUrl && (
                       <div className="mb-3">
                         {msg.imageUrl.startsWith('data:image') ? (
                           <img src={msg.imageUrl} className="max-w-xs rounded border border-white/10" alt="Content" />
                         ) : (
                           <div className="flex items-center gap-2 p-2 bg-eco-900/40 rounded text-xs text-eco-400">
                             <FileText size={16} /> Document Uploaded (Analysis Ready)
                           </div>
                         )}
                       </div>
                     )}

                     <div className="text-sm leading-7 rtl:text-right">
                       {renderFormattedText(msg.text)}
                     </div>

                     {msg.chartConfig && <ChartRenderer config={msg.chartConfig} />}
                   </div>
                 </div>
               ))}
               {isLoading && (
                 <div className="flex justify-start animate-pulse">
                   <div className="bg-eco-900/20 p-4 rounded-xl border border-eco-500/30 text-xs text-eco-500">
                     Analyzing Molecular Structure...
                   </div>
                 </div>
               )}
               <div ref={messagesEndRef} />
            </div>

            {/* Terminal Input */}
            <div className="p-6">
              <div className="bg-black/90 border border-eco-800/50 rounded-xl overflow-hidden shadow-2xl">
                <div className="bg-eco-950/80 px-4 py-1.5 flex items-center justify-between border-b border-eco-900/40">
                   <div className="flex items-center gap-2">
                     <Terminal size={12} className="text-eco-500" />
                     <span className="text-[10px] text-eco-600 font-mono">CORE_SHELL_V2</span>
                   </div>
                   {selectedFile && (
                     <div className="flex items-center gap-2 text-[10px] text-eco-400 truncate max-w-[200px]">
                       <FileText size={10} /> {selectedFile.name}
                       <button onClick={() => setSelectedFile(null)} className="text-red-500 px-1">×</button>
                     </div>
                   )}
                </div>

                <div className="p-3 flex items-end gap-2">
                  <input 
                    type="file" 
                    accept=".pdf,.doc,.docx,image/*" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                  />
                  <button onClick={() => fileInputRef.current?.click()} className="p-3 text-gray-500 hover:text-eco-400">
                    <Paperclip size={20} />
                  </button>

                  <div className="flex-1">
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                      placeholder="Upload PDF/Word or type chemical query..."
                      className="w-full bg-transparent border-none focus:ring-0 text-sm py-3 text-eco-100 placeholder-eco-900/50 resize-none max-h-32"
                      rows={1}
                    />
                  </div>

                  <button 
                    onClick={toggleVoiceInput} 
                    className={`p-3 transition-colors ${isListening ? 'text-red-500' : 'text-gray-500 hover:text-eco-400'}`}
                  >
                    <Mic size={20} />
                  </button>

                  <button 
                    onClick={handleSendMessage} 
                    disabled={isLoading}
                    className="p-3 bg-eco-600 text-white rounded-lg hover:bg-eco-500 disabled:opacity-20"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
};

export default App;