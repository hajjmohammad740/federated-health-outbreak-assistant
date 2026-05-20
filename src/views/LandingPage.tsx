import React from 'react';
import { motion } from 'motion/react';
import { Bot, Shield, Globe, Cpu, ChevronRight, Upload, Layers } from 'lucide-react';

export default function LandingPage({ onStartChat }: { onStartChat: () => void }) {
  return (
    <div className="relative min-h-screen bg-bg-dark flex flex-col">
      {/* Background visual effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent-cyan/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-purple/5 blur-[120px] rounded-full" />
        <div className="absolute inset-0 opacity-[0.02]" 
             style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
        />
      </div>

      <nav className="relative z-10 glass-nav h-16 px-8 flex items-center justify-between max-w-full mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-accent-cyan to-accent-purple rounded-lg flex items-center justify-center shadow-lg shadow-accent-cyan/20">
            <Cpu size={18} className="text-white" />
          </div>
          <span className="text-base font-display font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-accent-cyan to-white uppercase">Federated Intel</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-[11px] font-bold uppercase tracking-widest">
          <a href="#architecture" className="text-white/60 hover:text-accent-cyan transition-colors">Model Architecture</a>
          <div className="px-4 py-2 rounded-full border border-border-cyan bg-accent-cyan/10 text-accent-cyan text-[10px]">System Active: 12 Nodes</div>
          <button 
            onClick={onStartChat}
            className="px-6 py-2 bg-accent-cyan text-bg-dark rounded-md hover:scale-105 transition-all font-bold"
          >
            Launch Assistant
          </button>
        </div>
      </nav>

      <main className="relative z-10 pt-20 pb-32 flex-1">
        <div className="max-w-7xl mx-auto px-8">
          {/* Hero Section */}
          <div className="max-w-3xl mb-32">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-cyan/10 border border-border-cyan text-accent-cyan text-[10px] font-bold font-mono mb-6 uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse" />
                RAG-Enabled Thesis Analysis Active
              </div>
              <h1 className="text-6xl md:text-7xl font-light tracking-tight leading-[0.95] mb-8 text-white">
                Federated Intelligence <br />
                <span className="text-accent-cyan">for Health Outbreak</span> Detection
              </h1>
              <p className="text-lg text-white/40 mb-10 leading-relaxed max-w-2xl font-light">
                Accessing decentralized knowledge clusters across secure health networks. Privacy-preserving surveillance using multi-source data fusion.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={onStartChat}
                  className="group px-8 py-4 bg-gradient-to-tr from-accent-cyan to-accent-purple text-white font-bold rounded-xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-accent-cyan/10"
                >
                  Start Researcher Chat
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <div className="px-8 py-4 bg-white/5 border border-border-white rounded-xl flex items-center gap-2 cursor-default backdrop-blur-sm">
                  <Shield size={18} className="text-accent-cyan" />
                  <span className="font-medium text-sm text-white/60 tracking-wide">Differential Privacy v1.0</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Cards Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-32">
            {[
              {
                icon: <Globe size={24} className="text-accent-cyan" />,
                title: "Global Resilience",
                desc: "Scaling health surveillance across borders without direct data sharing."
              },
              {
                icon: <Layers size={24} className="text-accent-purple" />,
                title: "Multi-Source Fusion",
                desc: "Integrating clinical data, social sentiment, and environmental factors."
              },
              {
                icon: <Shield size={24} className="text-white" />,
                title: "Privacy Clusters",
                desc: "Guaranteed anonymity through advanced noise injection and secure aggregation."
              }
            ].map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-black/20 border border-border-white p-8 group hover:border-border-cyan transition-all rounded-2xl"
              >
                <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-border-white">
                  {card.icon}
                </div>
                <h3 className="text-lg font-semibold mb-3 tracking-tight">{card.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{card.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Diagram Simulation */}
          <div id="architecture" className="mb-32">
            <h2 className="text-4xl font-bold mb-12 flex items-center gap-4">
              <span className="w-12 h-1 bg-accent-cyan" />
              Architecture Overview
            </h2>
            <div className="glass-card p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12">
               <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-accent-cyan font-mono text-sm leading-none">01</span>
                    <h3 className="text-2xl font-bold">The Federated Cycle</h3>
                  </div>
                  <p className="text-white/60 mb-8 max-w-md">
                    Local models learn from edge data, while only gradients are aggregated to a central server, ensuring data never leaves its source.
                  </p>
                  <ul className="space-y-4">
                    {['Local Model Training', 'Encrypted Gradient Upload', 'Global Aggregation'].map((step, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm font-medium">
                        <div className="w-5 h-5 rounded-full border border-accent-cyan flex items-center justify-center text-[10px] text-accent-cyan">
                          {i + 1}
                        </div>
                        {step}
                      </li>
                    ))}
                  </ul>
               </div>
               
               <div className="flex-1 w-full max-w-md aspect-square relative bg-white/5 rounded-full border border-white/10 flex items-center justify-center px-8">
                  {/* Visual mockup of federated learning center */}
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-2 border-dashed border-accent-cyan/20 rounded-full"
                  />
                  <div className="w-24 h-24 bg-white/10 rounded-full border border-white/20 flex items-center justify-center z-10 neon-glow">
                    <Cpu size={40} className="text-accent-cyan" />
                  </div>
                  
                  {/* Satellites */}
                  {[0, 72, 144, 216, 288].map((angle, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-10 h-10 bg-white/5 rounded-lg border border-white/20 flex items-center justify-center"
                      initial={{ opacity: 1 }}
                      animate={{
                        x: Math.cos(angle * Math.PI / 180) * 140,
                        y: Math.sin(angle * Math.PI / 180) * 140,
                      }}
                    >
                      <Globe size={20} className="text-accent-purple opacity-50" />
                    </motion.div>
                  ))}
               </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="relative z-10 border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 opacity-50">
            <Cpu size={20} />
            <span className="text-sm font-bold">FEDERATED ANALYTICS</span>
          </div>
          <div className="flex flex-col items-center gap-4">
            <div className="p-2 bg-white rounded-lg">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(window.location.href)}`} 
                alt="App QR Code" 
                className="w-20 h-20"
              />
            </div>
            <span className="text-[10px] text-white/30 uppercase tracking-widest font-mono">Scan to Access</span>
          </div>
          <div className="text-white/30 text-xs font-mono">
            © 2026 RESEARCH THESIS PROJECT. ACADEMIC USE ONLY.
          </div>
          <div className="flex gap-6">
             <button onClick={onStartChat} className="text-sm text-accent-cyan hover:underline">Support Assistant</button>
             <button className="text-sm text-white/50">Documentation</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
