import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Send, Bot, User, Trash2, ArrowLeft, Upload, Paperclip, 
  Sparkles, Loader2, FileText, ChevronDown, MessageSquare,
  Cpu, Shield, Globe, LogIn, LogOut
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useAuth } from "../components/AuthProvider";

interface Message {
  role: "user" | "ai";
  content: string;
}

export default function ChatPage({ onBack }: { onBack: () => void }) {
  const { user, isAdmin, login, logout, loading: authLoading } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: "ai", 
      content: "Hello! I’m the AI assistant for your thesis project. Accessing decentralized knowledge clusters across secure health networks. \n\nWould you like me to explain the **Privacy-Preserving Module** or the decentralized learning architecture?" 
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [indexedFiles, setIndexedFiles] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await fetch("/api/files");
        const data = await res.json();
        setIndexedFiles(data.files);
      } catch (err) {
        console.error("Failed to fetch files", err);
      }
    };
    fetchFiles();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsTyping(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, history: messages }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "ai", content: data.text }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "ai", content: "Error: Neural connection interrupted." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploading(true);
    setUploadStatus("Indexing...");
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) formData.append("files", files[i]);
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch("/api/upload", { 
        method: "POST", 
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: "Unknown server error" }));
        throw new Error(errData.error || `Upload failed with status ${res.status}`);
      }
      const data = await res.json();
      setIndexedFiles(data.files || []);
      setUploadStatus(data.message || "Knowledge synced.");
      
      const failed = data.results?.filter((r: any) => r.status === "error");
      if (failed?.length > 0) {
        console.warn("Some files failed to index:", failed);
      }

      setTimeout(() => setUploadStatus(""), 4000);
    } catch (err: any) {
      console.error("Upload error:", err);
      setUploadStatus(`Sync failed: ${err.message || "Network error"}`);
      setTimeout(() => setUploadStatus(""), 6000);
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteFile = async (filename: string) => {
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`/api/files/${encodeURIComponent(filename)}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Delete failed");
      const data = await res.json();
      setIndexedFiles(data.files || []);
      setUploadStatus("File removed.");
      setTimeout(() => setUploadStatus(""), 3000);
    } catch (err) {
      console.error("Delete error:", err);
      setUploadStatus("Failed to delete.");
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-bg-dark text-[#e0e0e0] font-sans overflow-hidden">
      {/* Top Nav */}
      <nav className="h-16 glass-nav px-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 -ml-2 rounded-lg hover:bg-white/5 transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center shadow-lg shadow-accent-cyan/20">
              <Cpu size={18} className="text-white" />
            </div>
            <span className="font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-accent-cyan to-white uppercase text-sm">Federated Intel</span>
          </div>
        </div>
        <div className="flex items-center gap-3 md:gap-6 text-[10px] uppercase tracking-widest font-bold">
          <div className="px-3 md:px-4 py-2 rounded-full border border-border-cyan bg-accent-cyan/5 text-accent-cyan max-w-[200px] md:max-w-none truncate">
            {uploadStatus ? uploadStatus : `RAG Mode Active (${indexedFiles.length} papers)`}
          </div>
          {user ? (
            <button 
              onClick={() => logout()}
              className="px-4 py-2 rounded-lg bg-white/5 border border-border-white hover:bg-white/10 transition-colors flex items-center gap-2"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          ) : (
            <button 
              onClick={() => setShowLogin(true)}
              className="px-4 py-2 rounded-lg bg-accent-cyan text-bg-dark hover:scale-105 transition-all flex items-center gap-2"
            >
              <LogIn size={14} />
              <span className="hidden sm:inline">Admin Login</span>
            </button>
          )}
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar: Knowledge & Files */}
        <aside className="hidden lg:flex w-72 border-r border-border-white bg-black/20 p-6 flex-col gap-8">
          {isAdmin ? (
            <div>
              <h3 className="text-[10px] text-white/30 uppercase tracking-widest mb-4 font-bold flex items-center justify-between">
                Admin: Knowledge Base
                {indexedFiles.length > 0 && <span className="text-accent-cyan">{indexedFiles.length} items</span>}
              </h3>
              <div className="space-y-2">
                {indexedFiles.length === 0 && !isUploading && (
                  <div className="p-4 rounded-xl border border-dashed border-white/10 text-center">
                    <p className="text-[10px] text-white/20 italic">No papers uploaded. Add your thesis PDF/Word files.</p>
                  </div>
                )}
                {indexedFiles.map((filename, i) => (
                  <div key={i} className="p-3 rounded-xl bg-white/5 border border-border-white flex items-center justify-between group cursor-default">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] ${i % 2 === 0 ? 'bg-accent-cyan text-[#22d3ee]' : 'bg-accent-purple text-[#9333ea]'}`}></div>
                      <div className="text-[11px] font-medium text-white/60 truncate">{filename}</div>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFile(filename);
                      }}
                      className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/20 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-3 rounded-xl bg-accent-cyan/5 border border-accent-cyan/30 flex items-center gap-3 hover:bg-accent-cyan/10 transition-all group mt-2"
                >
                  {isUploading ? <Loader2 size={14} className="animate-spin text-accent-cyan" /> : <Upload size={14} className="text-accent-cyan" />}
                  <div className="text-[11px] font-bold text-accent-cyan uppercase tracking-wider">{isUploading ? "Syncing..." : "Upload Document"}</div>
                </button>
                <input type="file" multiple accept=".pdf,.txt,.docx,.md" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
              <Shield className="text-white/10 mb-4" size={32} />
              <h3 className="text-[10px] text-white/30 uppercase tracking-widest mb-2 font-bold font-sans">Secure Protocol</h3>
              <p className="text-[10px] text-white/20 leading-relaxed italic">The knowledge base references are encrypted for guests. Query the system directly to access decentralized data.</p>
            </div>
          )}

          <div className="flex-1">
            <h3 className="text-[10px] text-white/30 uppercase tracking-widest mb-4 font-bold">Recent Research</h3>
            <div className="space-y-4">
              {[
                "Neural Aggregation Protocols",
                "Differentially Private SGD",
                "Federated Outbreak Benchmarks",
                "Latent Space Analysis"
              ].map((topic, i) => (
                <button
                  key={topic}
                  onClick={() => setInput(topic)}
                  className="w-full text-left text-[11px] text-white/30 hover:text-accent-cyan cursor-pointer transition-colors border-l border-white/5 hover:border-accent-cyan/30 pl-3 py-1 flex items-center justify-between group"
                >
                  {topic}
                  <ChevronDown size={10} className="-rotate-90 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            {/* Admin specific tools removed */}
          </div>
        </aside>

        {/* Main: AI Workspace */}
        <main className="flex-1 flex flex-col relative bg-black/10">
          <div className="p-8 pb-4">
             <h1 className="text-3xl font-light tracking-tight text-white">
               Research <span className="text-accent-cyan">Workspace</span>
             </h1>
             <p className="text-white/30 text-xs mt-2 font-light">Interactive analysis engine for Federated Outbreak detection systems.</p>
          </div>

          {/* Chat Interface */}
          <div className="flex-1 flex flex-col overflow-hidden px-8">
            <div className="flex-1 overflow-y-auto py-6 space-y-6 scroll-smooth scrollbar-hide" ref={scrollRef}>
              <div className="max-w-3xl space-y-8">
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${
                      msg.role === 'ai' 
                        ? 'bg-gradient-to-tr from-accent-cyan to-accent-purple shadow-lg shadow-accent-cyan/20' 
                        : 'bg-white/10'
                    }`}>
                      {msg.role === 'ai' ? <Bot size={16} className="text-white" /> : <User size={16} />}
                    </div>
                    <div className={`flex flex-col space-y-2 max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                      <div className={`p-5 rounded-2xl text-sm leading-relaxed ${
                        msg.role === 'ai' 
                          ? 'bg-white/5 border border-border-white text-white/90' 
                          : 'bg-accent-cyan/5 border border-border-cyan text-white text-right'
                      }`}>
                      <div className="markdown-body">
                        <ReactMarkdown>
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                {isTyping && (
                  <div className="flex gap-5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-accent-cyan to-accent-purple flex items-center justify-center animate-pulse">
                      <Sparkles size={16} className="text-white" />
                    </div>
                    <div className="bg-white/5 border border-border-white px-5 py-3 rounded-2xl flex gap-1.5 items-center">
                      <span className="w-1 h-1 bg-accent-cyan rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1 h-1 bg-accent-cyan rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1 h-1 bg-accent-cyan rounded-full animate-bounce" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Input Area */}
            <div className="pb-8 pt-4">
              <div className="max-w-3xl relative group">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about methodology, results or architecture..."
                  className="w-full bg-white/5 border border-border-white rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-accent-cyan/30 transition-all backdrop-blur-xl group-hover:border-white/20"
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-accent-cyan text-bg-dark flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-20 shadow-lg shadow-accent-cyan/20"
                >
                  <Send size={18} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* Right Panel: Visualization */}
        <aside className="hidden xl:flex w-80 border-l border-border-white bg-black/30 flex-col">
          <div className="p-6">
            <h3 className="text-[10px] text-white/30 uppercase tracking-widest mb-4 font-bold">Global Outbreak Pattern</h3>
            <div className="aspect-[4/3] rounded-2xl bg-[#0a0f24] relative overflow-hidden border border-border-white flex items-center justify-center p-4">
               <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_#22d3ee_0%,_transparent_70%)]"></div>
               <div className="relative w-full h-full">
                  <div className="w-2 h-2 rounded-full bg-accent-cyan absolute top-1/4 left-1/3 shadow-[0_0_10px_#22d3ee] animate-pulse"></div>
                  <div className="w-2 h-2 rounded-full bg-accent-purple absolute top-1/2 left-1/2 shadow-[0_0_10px_#9333ea]"></div>
                  <div className="w-2 h-2 rounded-full bg-accent-cyan absolute bottom-1/3 right-1/4 shadow-[0_0_10px_#22d3ee]"></div>
                  <svg className="w-full h-full text-white/5" viewBox="0 0 200 100">
                    <path fill="currentColor" d="M20,40 Q40,10 70,30 T120,20 T180,50 L180,80 Q140,90 100,70 T20,80 Z" />
                  </svg>
               </div>
            </div>
          </div>

          <div className="flex-1 p-6 border-t border-border-white">
            <h3 className="text-[10px] text-white/30 uppercase tracking-widest mb-4 font-bold">Node Synchronicity</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-[11px] text-white/40">Aggregator Protocol</div>
                <div className="text-[11px] text-accent-cyan font-bold tracking-wider">HEALTHY</div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map(n => (
                  <div key={n} className="h-14 bg-white/5 border border-border-white rounded-xl flex flex-col items-center justify-center group hover:border-accent-cyan/30 transition-colors">
                    <span className="text-[9px] text-white/20 font-bold">N{n}</span>
                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${n === 3 ? 'bg-accent-purple animate-pulse' : 'bg-accent-cyan shadow-[0_0_6px_#22d3ee]'}`}></div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-8">
              <h3 className="text-[10px] text-white/30 uppercase tracking-widest mb-4 font-bold">Protocol Details</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 border border-border-white">
                    <Shield size={14} className="text-accent-cyan" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-white/80">Differential Privacy</div>
                    <div className="text-[9px] text-white/30">Local identifiers are masked via Gaussian noise.</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 border border-border-white">
                    <Globe size={14} className="text-accent-purple" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-white/80">Multi-Source ETL</div>
                    <div className="text-[9px] text-white/30">Syncing CDC and WHO global datasets.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 text-center border-t border-border-white">
             <div className="text-[9px] text-white/20 tracking-tighter font-mono font-bold uppercase">V 1.0.4 CORE-PROTOCOL ACTIVE</div>
          </div>
        </aside>
      </div>

      <AnimatePresence>
        {showLogin && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-0">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogin(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-[#0d1117] border border-white/10 rounded-2xl p-8 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 flex items-center justify-center border border-accent-cyan/20">
                  <Shield size={20} className="text-accent-cyan" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">Admin Access</h2>
                  <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold">Secure Protocol Entry</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2 px-1">Identity</label>
                  <input 
                    type="text" 
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="Username"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent-cyan/30 transition-all text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2 px-1">Credentials</label>
                  <input 
                    type="password" 
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent-cyan/30 transition-all text-white"
                  />
                </div>
                
                {loginError && <p className="text-red-500 text-[11px] font-medium px-1">{loginError}</p>}

                <button 
                  onClick={async () => {
                    setLoginError("");
                    const success = await login(loginEmail, loginPassword);
                    if (success) {
                      setShowLogin(false);
                      setLoginEmail("");
                      setLoginPassword("");
                    } else {
                      setLoginError("Authorization failed: Invalid credentials.");
                    }
                  }}
                  className="w-full py-4 bg-accent-cyan text-bg-dark font-bold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-accent-cyan/10 mt-2"
                >
                  Verify Protocol
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
