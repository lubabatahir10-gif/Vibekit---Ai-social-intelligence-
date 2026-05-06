import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Brain, Terminal, Sparkles } from 'lucide-react';
import { generateAIResponse } from '../lib/gemini';
import { UserProfile } from '../types';

interface Props {
  profile: UserProfile;
  onUpdateAura: (delta: number) => void;
}

export default function CrushAnalyzer({ profile, onUpdateAura }: Props) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [auraChange, setAuraChange] = useState<number | null>(null);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!input.trim()) {
      setError('Paste the chat first! 💭');
      return;
    }
    setError('');
    setLoading(true);
    setAuraChange(null);
    try {
      const prompt = `You are a ruthless social psychologist for VibeKit ✨. Help "${profile.nickname}" decode this situation.
Analyze the following conversation and provide a high-IQ psychological breakdown.

PSYCHOLOGY PRINCIPLES:
- Investment Ratio: Is the user sending blocks or double texting while they send one-word replies?
- Self-Respect Check: Is the user compromising their dignity for attention?
- Mirroring: Are they matching energy or is the user a "fan"?
- High-Value Behavior: Is the user maintaining mystery or over-sharing/over-performing?

STRICT RULES:
- BE HONEST. If the crush is NOT interested, say it. Don't cope.
- PRIORITIZE SELF-RESPECT. If the user looks desperate, call it out.
- THE MOVE: Must be a strategy to regain power or walk away with dignity. No "check-ins."
- No emojis.

CONVERSATION:
"${input}"

OUTPUT FORMAT:

VIBE:
(1 line - e.g. "One-sided chase" or "High-tension alignment")

INTEREST:
(0-100% Based on their investment, not the user's hope)

PSYCHOLOGY:
(2-3 lines explaining why they are acting this way and why the user is winning or losing)

THE ANALYSIS:
(A punchy summary of the reality of the situation)

THE MOVE:
(1 realistic action to regain social value or secure the win)

AURA:
(A number from -500 to +200. Heavy penalties for chasing, double texting dry replies, or being a 'safe' option. Huge bonuses for walking away, matching brevity, or holding frame.)`;
      
      const responseText = await generateAIResponse(prompt);
      const lines = responseText?.split('\n') || [];

      // Improved section extraction
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
      
      const auraStr = getSection('AURA:');
      const auraVal = parseInt(auraStr) || 20;

      const analysisResult = {
        vibe: getSection('VIBE:'),
        interest: getSection('INTEREST:'),
        psychology: getSection('PSYCHOLOGY:'),
        reason: getSection('THE ANALYSIS:'),
        reply: getSection('THE MOVE:')
      };

      setResult(analysisResult);
      setAuraChange(auraVal);
      onUpdateAura(auraVal);

    } catch (err: any) {
      setError(err?.message || 'Analysis failed. The values are off! 🌀');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center py-2">
        <h2 className="text-xl font-bold text-gray-200 uppercase tracking-[0.3em] select-none">
          Analyze the Vibe
        </h2>
      </div>
      
      <div className="space-y-4">
        <div className="relative group">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your chat history here..."
            className="w-full h-32 p-6 bg-brand-beige border-none rounded-[32px] resize-none focus:ring-2 focus:ring-brand-accent/20 transition-all text-sm placeholder:text-gray-400 shadow-inner"
            id="crush-input"
          />
          <div className="absolute bottom-4 right-4 flex items-center gap-2">
            {loading ? (
              <Brain className="w-5 h-5 text-brand-accent animate-pulse" />
            ) : (
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="p-3 bg-brand-accent text-white rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-transform"
                id="analyze-button"
                title="Start Analysis"
              >
                <Search className="w-5 h-5" />
              </button>
            )}
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

      <AnimatePresence>
        {result && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 pb-8"
          >
            <div className="bg-white rounded-[32px] p-6 border border-brand-beige space-y-6 shadow-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Chat Vibe</span>
                  <div className="text-xs font-bold text-brand-accent truncate">{result.vibe}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Interest Level</span>
                  <div className="text-xs font-bold text-brand-accent">{result.interest}</div>
                </div>
              </div>

              {auraChange !== null && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${auraChange >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'} text-[10px] font-black uppercase tracking-wider`}
                >
                  <Sparkles className="w-3 h-3" />
                  {auraChange >= 0 ? `+${auraChange}` : auraChange} Aura Impact
                </motion.div>
              )}

              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-2 mb-1">
                  <Brain className="w-3 h-3 text-brand-accent/60" />
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Psychological Cues</span>
                </div>
                <p className="text-xs font-medium text-gray-600 leading-relaxed">
                  {result.psychology}
                </p>
              </div>

              <div className="bg-brand-lavender/20 p-4 rounded-2xl border border-brand-lavender/50">
                <div className="flex items-center gap-2 mb-1">
                  <Terminal className="w-3 h-3 text-brand-accent" />
                  <span className="text-[9px] font-black text-brand-accent uppercase tracking-widest">Expert Summary</span>
                </div>
                <p className="text-xs font-medium text-gray-700 leading-relaxed italic">
                  "{result.reason}"
                </p>
              </div>
              
              <div className="pt-4 border-t border-brand-beige">
                <div className="bg-brand-accent/5 p-5 rounded-2xl relative group">
                  <span className="absolute -top-3 left-4 px-2 bg-brand-accent text-white text-[8px] font-black uppercase rounded-full py-0.5">The Strategy</span>
                  <p className="text-sm font-semibold text-brand-accent leading-relaxed">
                    {result.reply}
                  </p>
                  <button 
                    onClick={() => navigator.clipboard.writeText(result.reply)}
                    className="mt-3 w-full py-2 bg-white hover:shadow-sm rounded-xl text-[10px] font-bold text-brand-accent uppercase transition-all active:scale-95"
                  >
                    Copy Strategy
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
