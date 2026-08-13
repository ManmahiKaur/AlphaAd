import React from 'react';
import { ChatWindow } from '../components/ai/ChatWindow';
import { Bot, Sparkles } from 'lucide-react';

export const AIChatPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="glass-card p-6 rounded-2xl flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Bot className="w-6 h-6 text-blue-600" /> AI Financial Advisor Chatbot
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Ask multi-turn queries regarding technical indicators, stock comparisons, portfolio risk, or general market principles.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" /> LangGraph Active
        </div>
      </div>

      <ChatWindow />
    </div>
  );
};
