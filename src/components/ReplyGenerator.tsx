import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, X, Sparkles } from 'lucide-react';
import { generateAIResponse } from '../lib/gemini';
import { UserProfile } from '../types';

interface Props {
  profile: UserProfile;
  onUpdateAura: (delta: number) => void;
}

const DEFAULT_TONES = [
  { id: 'polite', label: 'Polite', emoji: '😇', color: 'bg-vibe-polite text-teal-700' },
  { id: 'funny', label: 'Funny', emoji: '😂', color: 'bg-vibe-funny text-amber-700' },
  { id: 'caring', label: 'Caring', emoji: '🧸', color: 'bg-vibe-caring text-pink-700' },
  { id: 'savage', label: 'Savage', emoji: '💅', color: 'bg-vibe-savage text-slate-700' },
];

const PRESET_COLORS = [
  { bg: 'bg-[#E3F2FD]', text: 'text-blue-700', label: 'Blue' },
  { bg: 'bg-[#F3E5F5]', text: 'text-purple-700', label: 'Purple' },
  { bg: 'bg-[#E8F5E9]', text: 'text-green-700', label: 'Green' },
  { bg: 'bg-[#FFF3E0]', text: 'text-orange-700', label: 'Orange' },
  { bg: 'bg-[#FFEBEE]', text: 'text-red-700', label: 'Red' },
];

export default function ReplyGenerator({ profile, onUpdateAura }: Props) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [auraChange, setAuraChange] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Custom Tone Form State
  const [newLabel, setNewLabel] = useState('');
  const [newEmoji, setNewEmoji] = useState('✨');
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);

  const [customTones, setCustomTones] = useState<{id: string, label: string, emoji: string, color: string}[]>([]);

  const allTones = [...DEFAULT_TONES, ...customTones];

  const handleAddTone = (e: FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim()) return;

    const newTone = {
      id: Date.now().toString(),
      label: newLabel.trim(),
      emoji: newEmoji,
      color: `${PRESET_COLORS[selectedColorIndex].bg} ${PRESET_COLORS[selectedColorIndex].text}`
    };

    setCustomTones(prev => [...prev, newTone]);
    setNewLabel('');
    setNewEmoji('✨');
    setShowAddForm(false);
    onUpdateAura(50); // Small bonus for creativity
  };

  const removeTone = (id: string) => {
    setCustomTones(prev => prev.filter(t => t.id !== id));
  };

  const handleGenerate = async (tone: string) => {
    if (!input.trim()) {
      setError('Please paste a message first ✨');
      return;
    }
    setError('');
    setLoading(true);
    setAuraChange(null);
    try {
      const prompt = `You are a social data assistant for VibeKit. Help "${profile.nickname}" get a W in this chat.
Rewrite this message into a ${tone} reply. Be clever and socially smart.

Message: ${input}

OUTPUT FORMAT:
REPLY: (The actual reply)
AURA: (A number from 10 to 50 based on how cool this reply makes the user look)`;
      
      const result = await generateAIResponse(prompt);
      const replyMatch = result.match(/REPLY:\s*(.*)/is);
      const auraMatch = result.match(/AURA:\s*([-+]?\d+)/i);

      const finalReply = replyMatch ? replyMatch[1].trim() : result;
      const finalAura = auraMatch ? parseInt(auraMatch[1]) : 10;

      setOutput(finalReply);
      setAuraChange(finalAura);
      onUpdateAura(finalAura);
    } catch (err) {
      setError('AI is having a moment. Try again! 💫');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-2">
        <h2 className="text-lg font-semibold text-gray-700">Reply Generator 💌</h2>
        <p className="text-xs text-gray-400">Let's find the perfect words.</p>
      </div>

      <div className="space-y-4">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste message..."
          className="w-full h-24 p-4 geometric-input resize-none"
          id="reply-input"
        />
        
        {error && <p className="text-red-400 text-[10px] uppercase font-bold ml-1">{error}</p>}

        <div className="grid grid-cols-2 gap-2">
          {allTones.map((tone) => (
            <div key={tone.id} className="relative group">
              <button
                onClick={() => handleGenerate(tone.label)}
                disabled={loading}
                className={`w-full geometric-button py-2.5 px-2 text-xs flex items-center justify-center gap-1.5 ${tone.color} hover:opacity-80 transition-all`}
                id={`tone-${tone.id}`}
              >
                <span>{tone.emoji}</span>
                <span>{tone.label}</span>
              </button>
              {!DEFAULT_TONES.find(dt => dt.id === tone.id) && (
                <button
                  onClick={() => removeTone(tone.id)}
                  className="absolute -top-1 -right-1 p-0.5 bg-white rounded-full shadow-sm border border-brand-beige opacity-0 group-hover:opacity-100 transition-opacity z-10"
                >
                  <X className="w-2 h-2 text-gray-400" />
                </button>
              )}
            </div>
          ))}
          
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="geometric-button py-2.5 px-2 text-xs flex items-center justify-center gap-1.5 bg-brand-beige text-gray-400 border-dashed hover:text-brand-accent transition-colors"
          >
            <Plus className="w-3 h-3" />
            <span>{showAddForm ? 'Cancel' : 'Add Custom'}</span>
          </button>
        </div>

        <AnimatePresence>
          {showAddForm && (
            <motion.form
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              onSubmit={handleAddTone}
              className="overflow-hidden bg-white/50 rounded-2xl p-4 border border-brand-beige space-y-3"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newEmoji}
                  onChange={(e) => setNewEmoji(e.target.value)}
                  placeholder="✨"
                  className="w-12 p-2 bg-brand-beige rounded-xl text-center focus:ring-1 focus:ring-brand-accent border-none"
                  maxLength={4}
                />
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="Tone name (e.g. Sarcastic)"
                  className="flex-1 p-2 bg-brand-beige rounded-xl px-4 focus:ring-1 focus:ring-brand-accent border-none text-sm"
                  maxLength={15}
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  {PRESET_COLORS.map((color, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedColorIndex(idx)}
                      className={`w-6 h-6 rounded-full border-2 transition-all ${color.bg} ${selectedColorIndex === idx ? 'border-brand-accent scale-110' : 'border-transparent hover:scale-105'}`}
                      title={color.label}
                    />
                  ))}
                </div>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-brand-accent text-white rounded-xl text-xs font-bold shadow-sm hover:opacity-90 active:scale-95 transition-all"
                >
                  Save Tone
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {(loading || output) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 bg-brand-beige p-4 rounded-2xl rounded-bl-none border border-black/5 min-h-[80px]"
          >
            {loading ? (
              <div className="flex gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce [animation-delay:-0.3s]"></span>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{output}</p>
                {auraChange !== null && (
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-brand-accent/10 rounded-full"
                  >
                    <Sparkles className="w-2.5 h-2.5 text-brand-accent" />
                    <span className="text-[10px] font-bold text-brand-accent">+{auraChange} Aura</span>
                  </motion.div>
                )}
              </div>
            )}
            {!loading && (
              <button 
                onClick={() => navigator.clipboard.writeText(output)}
                className="mt-3 block text-[10px] font-bold text-brand-pink uppercase hover:underline"
              >
                Copy to clipboard
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
