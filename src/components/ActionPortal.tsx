import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Compass, Zap, AlertCircle, RefreshCcw, TrendingUp, TrendingDown, Sparkles } from 'lucide-react';
import { generateAIResponse } from '../lib/gemini';
import { UserProfile } from '../types';

interface PortalAdvice {
  chances: number;
  auraText: string;
  auraPoints: number;
  situation: string;
  winText: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  advice?: PortalAdvice;
}

interface Props {
  profile: UserProfile;
  onUpdateAura: (delta: number) => void;
}

export default function ActionPortal({ profile, onUpdateAura }: Props) {
  const [situation, setSituation] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleConsult = async () => {
    if (!situation.trim()) {
      setError('What\'s the tea? Tell me the situation first! 🍵');
      return;
    }

    const currentSituation = situation.trim();
    setError('');
    setLoading(true);
    setSituation('');

    // Add user message to UI immediately
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: currentSituation
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      const chatContext = messages.map(m => 
        `${m.role === 'user' ? 'USER' : 'ASSISTANT'}: ${m.role === 'user' ? m.content : m.advice?.winText}`
      ).join('\n');

      const prompt = `You are a high-tier social data expert for VibeKit ✨. Help "${profile.nickname}" WIN this situation with maximum self-respect.
      
Rules: 
- Be honest. If they are being weird, don't tell the user to be nice. 
- Tell the user if they are crashing out or losing aura.
- "The Move" must be high-value. No chasing or over-explaining.
- Use the nickname "${profile.nickname}" if possible.
- No emojis in core sections.

${chatContext ? `PREVIOUS CONTEXT:\n${chatContext}\n` : ''}

CURRENT SITUATION:
"${currentSituation}"

OUTPUT FORMAT (STRICT):

CHANCES:
(Number 0-99)

AURA_TEXT:
(Short description why—e.g. "Preserved dignity" or "Crashed out")

AURA_POINTS:
(Number from -300 to +300. Penalize chasing, over-explaining, or being a doormat.)

SITUATION:
(1 line summary of the power dynamic)

WHAT TO SAY:
(The exact high-value message or action to take. No quotes.)
`;
      
      const responseText = await generateAIResponse(prompt);
      const lines = responseText?.split('\n') || [];

      const getSection = (name: string) => {
        const index = lines.findIndex(l => l.toUpperCase().includes(name.toUpperCase()));
        if (index === -1) return '';
        let content = lines[index].split(':')[1]?.trim() || '';
        if (!content) {
             for (let i = index + 1; i < lines.length; i++) {
              if (lines[i].includes(':') && lines[i].toUpperCase() === lines[i]) break;
              content += ' ' + lines[i].trim();
            }
        }
        return content.trim();
      };

      const points = parseInt(getSection('AURA_POINTS:')) || 10;

      const newAdvice: PortalAdvice = {
        chances: parseInt(getSection('CHANCES:')) || 50,
        auraText: getSection('AURA_TEXT:'),
        auraPoints: points,
        situation: getSection('SITUATION:'),
        winText: getSection('WHAT TO SAY:')
      };

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseText || '',
        advice: newAdvice
      };

      setMessages(prev => [...prev, assistantMsg]);
      onUpdateAura(points);

    } catch (err: any) {
      setError(err?.message || 'Portal is glitching. Try again? 🌀');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetPortal = () => {
    setMessages([]);
    setSituation('');
    setError('');
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between px-2 shrink-0">
        <h2 className="text-xl font-bold text-gray-200 uppercase tracking-[0.3em] select-none">
          Win every situation
        </h2>
        {messages.length > 0 && (
          <button 
            onClick={resetPortal}
            className="p-2 text-gray-400 hover:text-brand-accent transition-colors"
            title="Reset Conversation"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
        )}
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-6 pr-2 scrollbar-hide pb-4"
      >
        {messages.length === 0 && !loading && (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40">
            <Compass className="w-12 h-12 mb-4" />
            <p className="text-sm font-medium">No active situations.<br/>Start a thread to get your strategy.</p>
          </div>
        )}

        <AnimatePresence mode="popLayout">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              {msg.role === 'user' ? (
                <div className="max-w-[85%] bg-brand-beige p-4 rounded-[24px] rounded-tr-none text-sm text-gray-700 shadow-sm">
                  {msg.content}
                </div>
              ) : msg.advice && (
                <div className="max-w-[95%] w-full bg-white rounded-[32px] p-6 border border-brand-beige space-y-6 shadow-sm">
                  {/* Chances of Winning */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Chances of Winning</span>
                    <span className="text-2xl font-black text-brand-accent">{msg.advice.chances}%</span>
                  </div>
                  
                  <div className="w-full bg-brand-beige h-1.5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${msg.advice.chances}%` }}
                      className="h-full bg-brand-accent"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Aura Impact */}
                    {(() => {
                      const isGain = msg.advice.auraPoints >= 0;
                      const auraColor = isGain ? 'text-emerald-600' : 'text-rose-600';
                      const auraBg = isGain ? 'bg-emerald-50' : 'bg-rose-50';
                      const auraBorder = isGain ? 'border-emerald-100' : 'border-rose-100';

                      return (
                        <div className={`${auraBg} p-4 rounded-2xl border ${auraBorder} transition-colors duration-500`}>
                          <div className="flex items-center gap-2 mb-1">
                            {isGain ? <TrendingUp className="w-3 h-3 text-emerald-600" /> : <TrendingDown className="w-3 h-3 text-rose-600" />}
                            <span className={`text-[9px] font-black ${auraColor} uppercase tracking-widest`}>Aura Impact</span>
                          </div>
                          <p className="text-xs font-bold text-gray-700">
                            {isGain ? '+' : ''}{msg.advice.auraPoints} • {msg.advice.auraText}
                          </p>
                        </div>
                      );
                    })()}

                    {/* Situation */}
                    <div className="p-4 bg-brand-beige/20 rounded-2xl border border-brand-beige/50">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertCircle className="w-3 h-3 text-gray-300" />
                        <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Recap</span>
                      </div>
                      <p className="text-xs font-medium text-gray-500 italic leading-relaxed">
                        {msg.advice.situation}
                      </p>
                    </div>
                  </div>

                  {/* What to Say */}
                  <div className="pt-4 border-t border-brand-beige">
                    <div className="bg-brand-accent/5 p-5 rounded-2xl relative group">
                      <span className="absolute -top-3 left-4 px-2 bg-brand-accent text-white text-[8px] font-black uppercase rounded-full py-0.5">What to say</span>
                      <p className="text-sm font-semibold text-brand-accent leading-relaxed">
                        {msg.advice.winText}
                      </p>
                      <button 
                        onClick={() => navigator.clipboard.writeText(msg.advice.winText || '')}
                        className="mt-3 w-full py-2 bg-white hover:shadow-sm rounded-xl text-[10px] font-bold text-brand-accent uppercase transition-all active:scale-95"
                      >
                        Copy Message
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}

          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-brand-beige/30 p-4 rounded-2xl flex items-center gap-2">
                <Zap className="w-4 h-4 text-brand-accent animate-spin" />
                <span className="text-xs font-medium text-gray-400">Processing situation...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="shrink-0 space-y-2 pb-2">
        <div className="relative group">
          <textarea
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleConsult();
              }
            }}
            placeholder={messages.length > 0 ? "Follow up or update..." : "What's the situation?"}
            className="w-full h-24 p-6 bg-brand-beige border-none rounded-[32px] resize-none focus:ring-2 focus:ring-brand-accent/20 transition-all text-sm placeholder:text-gray-400 shadow-inner pr-16"
            id="portal-input"
          />
          <div className="absolute bottom-4 right-4">
            <button
              onClick={handleConsult}
              disabled={loading || !situation.trim()}
              className="p-3 bg-brand-accent text-white rounded-2xl shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all"
              id="consult-button"
              title="Win the situation"
            >
              <Zap className="w-5 h-5" />
            </button>
          </div>
        </div>

        {error && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-400 text-[10px] uppercase font-bold text-center"
          >
            {error}
          </motion.p>
        )}
      </div>
    </div>
  );
}
