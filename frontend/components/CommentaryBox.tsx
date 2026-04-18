import React, { useEffect, useState, useRef } from 'react';
import { CommentaryEntry, Personality } from '../types.ts';
import { Volume2, VolumeX, Mic2, LineChart, MapPin, Loader2 } from 'lucide-react';

interface CommentaryBoxProps {
  currentCommentary: CommentaryEntry | null;
  personality: Personality;
  isGenerating: boolean;
}

const IconMap: Record<string, React.ElementType> = {
  LineChart,
  Mic2,
  MapPin
};

export const CommentaryBox: React.FC<CommentaryBoxProps> = ({ 
  currentCommentary, 
  personality,
  isGenerating
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Initialize Speech Synthesis and load voices robustly
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
      
      const loadVoices = () => {
        setAvailableVoices(window.speechSynthesis.getVoices());
      };
      
      loadVoices();
      
      // Chrome and some other browsers load voices asynchronously
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (currentCommentary && !isMuted && synthRef.current) {
      // Cancel any ongoing speech
      synthRef.current.cancel();

      const utterance = new SpeechSynthesisUtterance(currentCommentary.text);
      
      // Try to pick a voice that somewhat matches the persona if possible
      if (availableVoices.length > 0) {
        if (personality.id === 'data-scientist') {
          utterance.voice = availableVoices.find(v => v.lang.includes('en-GB')) || availableVoices[0];
          utterance.rate = 0.95;
          utterance.pitch = 0.9;
        } else if (personality.id === 'hype-man') {
          utterance.voice = availableVoices.find(v => v.lang.includes('en-US')) || availableVoices[0];
          utterance.rate = 1.2;
          utterance.pitch = 1.2;
        } else if (personality.id === 'local-hero') {
          utterance.voice = availableVoices.find(v => v.lang.includes('en-IN')) || availableVoices[0];
          utterance.rate = 1.05;
          utterance.pitch = 1.0;
        }
      }

      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);

      synthRef.current.speak(utterance);
    }
  }, [currentCommentary, isMuted, personality.id, availableVoices]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted && synthRef.current) {
      synthRef.current.cancel();
      setIsPlaying(false);
    }
  };

  const Icon = IconMap[personality.icon] || Mic2;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-lg relative overflow-hidden">
      {/* Background decorative element */}
      <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full blur-3xl opacity-10 ${personality.color.replace('text-', 'bg-')}`} aria-hidden="true"></div>

      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-lg bg-gray-800 border border-gray-700 ${personality.color}`}>
            <Icon className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-100">{personality.name}</h2>
            <p className="text-xs text-gray-400">AI Comm-Box Active</p>
          </div>
        </div>
        
        <button 
          onClick={toggleMute}
          className="p-2 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label={isMuted ? "Unmute Commentary" : "Mute Commentary"}
          aria-pressed={isMuted}
        >
          {isMuted ? <VolumeX className="w-5 h-5" aria-hidden="true" /> : <Volume2 className="w-5 h-5" aria-hidden="true" />}
        </button>
      </div>

      <div className="min-h-[120px] flex flex-col justify-center relative z-10" aria-live="polite">
        {isGenerating ? (
          <div className="flex items-center gap-3 text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin text-primary" aria-hidden="true" />
            <span className="text-sm italic">Analyzing game state and chat...</span>
          </div>
        ) : currentCommentary ? (
          <div>
            <p className="text-lg text-gray-200 leading-relaxed font-medium">
              "{currentCommentary.text}"
            </p>
            {isPlaying && !isMuted && (
              <div className="flex items-center gap-1 mt-4 h-4" aria-hidden="true">
                <div className="w-1 h-full bg-primary animate-pulse-fast rounded-full" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1 h-3/4 bg-primary animate-pulse-fast rounded-full" style={{ animationDelay: '150ms' }}></div>
                <div className="w-1 h-full bg-primary animate-pulse-fast rounded-full" style={{ animationDelay: '300ms' }}></div>
                <div className="w-1 h-1/2 bg-primary animate-pulse-fast rounded-full" style={{ animationDelay: '450ms' }}></div>
                <div className="w-1 h-full bg-primary animate-pulse-fast rounded-full" style={{ animationDelay: '600ms' }}></div>
                <span className="text-xs text-primary ml-2 font-semibold tracking-wider uppercase">Live Audio</span>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500 italic text-center">
            Waiting for the next big moment...
          </p>
        )}
      </div>
    </div>
  );
};
