import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, ChatMessage, CommentaryEntry, PersonalityId } from './types.ts';
import { PERSONALITIES, INITIAL_GAME_STATE } from './constants.ts';
import { generateCommentary } from './services/geminiService.ts';
import { Scoreboard } from './components/Scoreboard.tsx';
import { ChatBox } from './components/ChatBox.tsx';
import { CommentaryBox } from './components/CommentaryBox.tsx';
import { Settings2, Radio } from 'lucide-react';

const SIMULATION_EVENTS = [
  { text: "FOUR! Smashed through the covers!", runs: 4, balls: 1 },
  { text: "Dot ball. Good tight bowling.", runs: 0, balls: 1 },
  { text: "Single taken down to long on.", runs: 1, balls: 1 },
  { text: "SIX! Massive hit over mid-wicket!", runs: 6, balls: 1 },
  { text: "WICKET! Caught behind! Huge breakthrough.", runs: 0, balls: 1, wicket: true },
  { text: "Two runs, good running between the wickets.", runs: 2, balls: 1 },
  { text: "Dot ball. The pressure is building up.", runs: 0, balls: 1 },
];

const SIMULATED_CHAT_POOL = [
  { user: 'MahiFan', text: 'Why are they playing so slow?!' },
  { user: 'CricketNerd', text: 'Need to accelerate now, death overs are here.' },
  { user: 'MumbaiRocker', text: 'Tuk tuk academy open today 😴' },
  { user: 'StatsGuy', text: 'Projected score is barely 150 at this rate.' },
  { user: 'HypeBeast', text: 'WE NEED SIXES!!!' },
  { user: 'LocalBoy', text: 'Come on guys, hit out or get out!' }
];

export default function App() {
  const [activePersonalityId, setActivePersonalityId] = useState<PersonalityId>('hype-man');
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: '1', user: 'CricketFan99', text: 'This run rate is too slow for a T20!', timestamp: Date.now() - 10000 },
    { id: '2', user: 'MumbaiRocker', text: 'Come on, hit a boundary! Frustrating to watch.', timestamp: Date.now() - 5000 }
  ]);
  const [currentCommentary, setCurrentCommentary] = useState<CommentaryEntry | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Use refs to access latest state inside intervals/callbacks without causing re-renders
  const gameStateRef = useRef(gameState);
  const chatMessagesRef = useRef(chatMessages);
  const activePersonalityRef = useRef(PERSONALITIES[activePersonalityId]);

  useEffect(() => {
    gameStateRef.current = gameState;
    chatMessagesRef.current = chatMessages;
    activePersonalityRef.current = PERSONALITIES[activePersonalityId];
  }, [gameState, chatMessages, activePersonalityId]);

  const triggerCommentary = useCallback(async (currentState: GameState, reason: string) => {
    setIsGenerating(true);
    
    // Get last 5 messages for context to feed the "Wow" factor
    const recentChat = chatMessagesRef.current.slice(-5);
    
    const text = await generateCommentary(
      currentState,
      recentChat,
      activePersonalityRef.current
    );

    setCurrentCommentary({
      id: Date.now().toString(),
      text,
      personalityId: activePersonalityRef.current.id,
      timestamp: Date.now()
    });
    
    setIsGenerating(false);
  }, []);

  // Game Simulation Loop
  useEffect(() => {
    const interval = setInterval(() => {
      setGameState(prev => {
        const event = SIMULATION_EVENTS[Math.floor(Math.random() * SIMULATION_EVENTS.length)];
        
        let newBalls = prev.balls + event.balls;
        let newOvers = prev.overs;
        if (newBalls >= 6) {
          newOvers += 1;
          newBalls = 0;
        }

        const newScore = prev.scoreA + event.runs;
        const newWickets = prev.wicketsA + (event.wicket ? 1 : 0);
        const totalBallsBowled = (newOvers * 6) + newBalls;
        const newRunRate = totalBallsBowled > 0 ? (newScore / totalBallsBowled) * 6 : 0;

        const newState = {
          ...prev,
          scoreA: newScore,
          wicketsA: newWickets,
          overs: newOvers,
          balls: newBalls,
          runRate: newRunRate,
          lastEvent: event.text,
          currentBatter: event.wicket ? 'New Batter (0*)' : prev.currentBatter
        };

        // Trigger commentary on significant events (boundaries or wickets) or randomly
        if (event.runs >= 4 || event.wicket || Math.random() > 0.6) {
           triggerCommentary(newState, 'game_event');
        }

        return newState;
      });
    }, 12000); // Simulate an event every 12 seconds

    return () => clearInterval(interval);
  }, [triggerCommentary]);

  // Simulated Live Chat Loop (to keep the room active and give AI something to react to)
  useEffect(() => {
    const chatInterval = setInterval(() => {
      if (Math.random() > 0.5) {
        const randomMsg = SIMULATED_CHAT_POOL[Math.floor(Math.random() * SIMULATED_CHAT_POOL.length)];
        setChatMessages(prev => [...prev, {
          id: Date.now().toString(),
          user: randomMsg.user,
          text: randomMsg.text,
          timestamp: Date.now()
        }]);
      }
    }, 6000); // Potentially add a new chat message every 6 seconds

    return () => clearInterval(chatInterval);
  }, []);

  // Initial commentary on load
  useEffect(() => {
    triggerCommentary(INITIAL_GAME_STATE, 'init');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSendMessage = (text: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      user: 'You',
      text,
      timestamp: Date.now()
    };
    setChatMessages(prev => [...prev, newMessage]);
    
    // Trigger commentary based on user chat to show immediate responsiveness
    if (!isGenerating) {
      setTimeout(() => {
        triggerCommentary(gameStateRef.current, 'user_chat');
      }, 1000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent flex items-center gap-3">
            <Radio className="w-8 h-8 text-primary" aria-hidden="true" />
            The AI Comm-Box
          </h1>
          <p className="text-gray-400 mt-1">Generative AI powered custom sports commentary</p>
        </div>

        {/* Personality Selector */}
        <div 
          className="flex items-center gap-2 bg-gray-900 p-1.5 rounded-lg border border-gray-800"
          role="group"
          aria-label="Select Commentary Personality"
        >
          <Settings2 className="w-4 h-4 text-gray-500 ml-2" aria-hidden="true" />
          <div className="flex gap-1">
            {Object.values(PERSONALITIES).map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setActivePersonalityId(p.id as PersonalityId);
                  // Trigger new commentary immediately when switching persona
                  triggerCommentary(gameStateRef.current, 'persona_switch');
                }}
                aria-label={`Select ${p.name} personality`}
                aria-pressed={activePersonalityId === p.id}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary ${
                  activePersonalityId === p.id
                    ? 'bg-gray-800 text-white shadow-sm'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Game State & Chat */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <Scoreboard gameState={gameState} />
          <ChatBox messages={chatMessages} onSendMessage={handleSendMessage} />
        </div>

        {/* Right Column: Commentary Box */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <CommentaryBox 
            currentCommentary={currentCommentary}
            personality={PERSONALITIES[activePersonalityId]}
            isGenerating={isGenerating}
          />
          
          {/* Info Panel */}
          <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-6 text-sm text-gray-400">
            <h3 className="text-gray-200 font-semibold mb-2">How it works</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>The game state updates automatically every few seconds.</li>
              <li>The selected AI personality generates commentary based on the latest event.</li>
              <li><strong>The "Wow" Factor:</strong> The AI reads the live chat! If the community complains about a slow run rate, the AI acknowledges the "frustration in the room" in real-time.</li>
              <li>Audio is generated using browser-native Text-to-Speech.</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
