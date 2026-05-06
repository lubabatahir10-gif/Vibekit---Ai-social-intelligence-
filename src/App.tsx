/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TabType, UserProfile } from './types';
import ReplyGenerator from './components/ReplyGenerator';
import CrushAnalyzer from './components/CrushAnalyzer';
import ActionPortal from './components/ActionPortal';
import { Sparkles, Star } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('reply');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tempNickname, setTempNickname] = useState('');

  // Load profile from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('vibekit_profile');
    if (saved) {
      setProfile(JSON.parse(saved));
    }
  }, []);

  // Save profile to localStorage
  const updateProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    localStorage.setItem('vibekit_profile', JSON.stringify(newProfile));
  };

  const handleSetup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempNickname.trim()) return;
    updateProfile({ nickname: tempNickname.trim(), aura: 1000 });
  };

  const tabs = [
    { id: 'reply', label: 'Reply', emoji: '💌' },
    { id: 'crush', label: 'Analyze', emoji: '💭' },
    { id: 'portal', label: 'Portal', emoji: '🌀' },
  ] as const;

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-page-bg">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="app-container p-8 flex flex-col items-center justify-center text-center space-y-8"
        >
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tighter text-brand-pink">
              VibeKit <span className="text-2xl italic opacity-50">✨</span>
            </h1>
            <p className="text-gray-500 text-sm">Enter your cute nickname to start gaining aura.</p>
          </div>
          
          <form onSubmit={handleSetup} className="w-full space-y-4">
            <input
              type="text"
              value={tempNickname}
              onChange={(e) => setTempNickname(e.target.value)}
              placeholder="Your cute nickname..."
              className="w-full p-4 rounded-2xl bg-white border-2 border-brand-beige focus:border-brand-pink outline-none transition-all text-center font-bold text-lg"
              autoFocus
            />
            <button
              type="submit"
              className="geometric-button w-full py-4 bg-black text-white text-sm font-bold hover:opacity-90 active:scale-95 transition-all shadow-xl"
            >
              Start Generating Aura
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-page-bg">
      <div className="app-container">
        {/* Header */}
        <header className="pt-8 px-6 pb-2 flex justify-between items-center shrink-0">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-brand-pink">
                VibeKit
              </h1>
              <span className="bg-brand-pink/10 text-brand-pink text-[9px] px-2 py-0.5 rounded-full font-black uppercase">Pro</span>
            </div>
            <p className="text-[11px] font-medium text-gray-400">Hi, {profile.nickname}! 👋</p>
          </div>
          
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-lavender/30 rounded-full border border-brand-lavender/50">
              <Sparkles className="w-3 h-3 text-brand-accent fill-brand-accent" />
              <span className="text-xs font-black text-brand-accent tabular-nums">
                {profile.aura.toLocaleString()}
              </span>
            </div>
            <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest mt-1">Aura Points</span>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 px-4 overflow-hidden relative overflow-y-auto scrollbar-hide">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="py-4"
            >
              {activeTab === 'reply' && <ReplyGenerator profile={profile} onUpdateAura={(delta) => updateProfile({...profile, aura: profile.aura + delta})} />}
              {activeTab === 'crush' && <CrushAnalyzer profile={profile} onUpdateAura={(delta) => updateProfile({...profile, aura: profile.aura + delta})} />}
              {activeTab === 'portal' && <ActionPortal profile={profile} onUpdateAura={(delta) => updateProfile({...profile, aura: profile.aura + delta})} />}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Navigation Bar */}
        <nav className="h-20 border-t border-gray-100 flex items-center justify-around px-6 bg-white shrink-0 relative">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex flex-col items-center gap-1 transition-all duration-300 relative ${
                  isActive ? 'opacity-100' : 'opacity-40 hover:opacity-100'
                }`}
              >
                <div className={`text-2xl transition-transform duration-300 ${isActive ? 'scale-110 mb-1' : ''}`}>
                  {tab.emoji}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-tight ${isActive ? 'text-brand-pink' : 'text-gray-400'}`}>
                  {tab.label}
                </span>
                {isActive && (
                  <motion.div layoutId="nav-dot" className="w-1 h-1 bg-brand-pink rounded-full absolute -bottom-2" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

