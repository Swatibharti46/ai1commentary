import React from 'react';
import { GameState } from '../types.ts';
import { Activity } from 'lucide-react';

interface ScoreboardProps {
  gameState: GameState;
}

export const Scoreboard: React.FC<ScoreboardProps> = ({ gameState }) => {
  return (
    <div 
      className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-lg"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
          <Activity className="w-5 h-5 text-red-500 animate-pulse" aria-hidden="true" />
          Live Match
        </h2>
        <span className="px-3 py-1 bg-red-500/10 text-red-500 text-xs font-semibold rounded-full border border-red-500/20">
          T20 INNINGS 1
        </span>
      </div>

      <div className="flex justify-between items-end mb-6">
        <div>
          <p className="text-sm text-gray-400 font-medium mb-1">{gameState.teamA}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black tracking-tighter text-white" aria-label={`Score: ${gameState.scoreA} for ${gameState.wicketsA}`}>
              {gameState.scoreA}<span className="text-3xl text-gray-500 font-bold">/{gameState.wicketsA}</span>
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400 font-medium mb-1">Overs</p>
          <span className="text-2xl font-bold text-gray-200" aria-label={`Overs: ${gameState.overs} point ${gameState.balls}`}>
            {gameState.overs}.{gameState.balls}
          </span>
          <p className="text-xs text-gray-500 mt-1">CRR: {gameState.runRate.toFixed(2)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-800">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Batter</p>
          <p className="font-medium text-gray-200">{gameState.currentBatter}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Bowler</p>
          <p className="font-medium text-gray-200">{gameState.currentBowler}</p>
        </div>
      </div>

      <div className="mt-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
        <p className="text-sm text-gray-300 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" aria-hidden="true"></span>
          <span className="font-semibold text-accent">Last Event:</span> {gameState.lastEvent}
        </p>
      </div>
    </div>
  );
};
