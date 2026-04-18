import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types.ts';
import { Send, MessageSquare } from 'lucide-react';

interface ChatBoxProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
}

export const ChatBox: React.FC<ChatBoxProps> = ({ messages, onSendMessage }) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <div className="flex flex-col h-[400px] bg-gray-900 border border-gray-800 rounded-xl shadow-lg overflow-hidden">
      <div className="p-4 border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-primary" aria-hidden="true" />
        <h3 className="font-semibold text-gray-100">Fan Zone</h3>
      </div>
      
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent"
        aria-live="polite"
        aria-relevant="additions"
      >
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-500 text-sm italic">
            Be the first to react!
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="flex flex-col">
              <span className="text-xs font-medium text-gray-400 mb-0.5">{msg.user}</span>
              <div className="bg-gray-800 text-gray-200 px-3 py-2 rounded-lg rounded-tl-none text-sm inline-block max-w-[85%]">
                {msg.text}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-3 border-t border-gray-800 bg-gray-900">
        <div className="relative flex items-center">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="React to the game..."
            aria-label="Type your reaction to the game"
            className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-full pl-4 pr-10 py-2.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            aria-label="Send message"
            className="absolute right-1.5 p-1.5 bg-primary text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:hover:bg-primary transition-colors"
          >
            <Send className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </form>
    </div>
  );
};
