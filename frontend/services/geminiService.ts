import { GoogleGenAI } from '@google/genai';
import { GameState, ChatMessage, Personality } from '../types.ts';

// Initialize the SDK. 
// Note: Relies on process.env.API_KEY being available in the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY, vertexai: true });

export const generateCommentary = async (
  gameState: GameState,
  recentChat: ChatMessage[],
  personality: Personality
): Promise<string> => {
  try {
    const chatContext = recentChat.length > 0 
      ? recentChat.map(msg => `${msg.user}: ${msg.text}`).join('\n')
      : 'No recent chat activity.';

    const prompt = `
Current Game State:
- Match: ${gameState.teamA} vs ${gameState.teamB} (Indian Domestic T20)
- Batting Team: ${gameState.teamA}
- Score: ${gameState.scoreA}/${gameState.wicketsA}
- Overs: ${gameState.overs}.${gameState.balls}
- Current Run Rate: ${gameState.runRate.toFixed(2)}
- Batter: ${gameState.currentBatter}
- Bowler: ${gameState.currentBowler}
- LATEST EVENT: ${gameState.lastEvent}

Recent Fan Chat (CRITICAL - YOU MUST REACT TO THIS):
${chatContext}

Based on your persona, provide a short commentary (1-3 sentences) on the LATEST EVENT. 
You MUST incorporate the game state.
If there are messages in the Recent Fan Chat, you MUST acknowledge the "frustration in the room", the hype, or specific user comments in real-time. Do not just read stats; respond to the community!
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: personality.systemInstruction,
        temperature: 0.8, // Slightly higher temperature for more creative/comical/local responses
      }
    });

    return response.text || "I'm speechless!";
  } catch (error) {
    console.error("Error generating commentary:", error);
    return "Technical difficulties in the comm-box. We'll be right back!";
  }
};
