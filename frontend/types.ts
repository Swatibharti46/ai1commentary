export type PersonalityId = 'data-scientist' | 'hype-man' | 'local-hero';

export interface Personality {
  id: PersonalityId;
  name: string;
  description: string;
  icon: string;
  systemInstruction: string;
  color: string;
}

export interface ChatMessage {
  id: string;
  user: string;
  text: string;
  timestamp: number;
}

export interface GameState {
  teamA: string;
  teamB: string;
  scoreA: number;
  wicketsA: number;
  overs: number;
  balls: number;
  target?: number;
  currentBatter: string;
  currentBowler: string;
  lastEvent: string;
  runRate: number;
}

export interface CommentaryEntry {
  id: string;
  text: string;
  personalityId: PersonalityId;
  timestamp: number;
}
