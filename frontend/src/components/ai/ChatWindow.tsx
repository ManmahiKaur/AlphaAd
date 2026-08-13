import React, { useState } from 'react';
import { Send, Bot, User as UserIcon, Sparkles } from 'lucide-react';
import { ChatMessage } from '../../types';
import { aiApi } from '../../api';
import { MarkdownRenderer } from '../ui/MarkdownRenderer';

export const ChatWindow: React.FC<{ tickerContext?: string }> = ({ tickerContext }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'ai',
      message: `Hello! I am your AI Financial Advisor. ${tickerContext ? `Currently analyzing ${tickerContext}.` : 'Ask me anything about stocks, technical indicators (RSI, MACD), or portfolio strategy!'}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      message: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setLoading(true);

    try {
      const historyPayload = newHistory.map((m) => ({
        sender: m.sender,
        message: m.message
      }));

      const res = await aiApi.sendMessage(userMsg.message, tickerContext, historyPayload);
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        message: res.message,
        sources: res.sources,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          message: 'Sorry, I encountered an issue communicating with the AI service. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handlePillClick = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div className="flex flex-col h-[550px] w-full bg-white rounded-2xl border border-blue-200 overflow-hidden shadow-sm">
      {/* Chat Header */}
      <div className="bg-white px-4 py-3 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">AI Financial Advisor</h3>
            <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" /> <span className="text-green-600">Online</span> • Gemini 3.6 Flash Engine
            </span>
          </div>
        </div>
      </div>

      {/* Suggested Prompt Pills */}
      <div className="bg-white px-4 py-2 border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
        {['Should I buy Apple?', 'Compare Tesla and Nvidia', 'Explain RSI', 'What is diversification?'].map((pill, i) => (
          <button
            key={i}
            onClick={() => handlePillClick(pill)}
            className="px-2.5 py-1 rounded-full bg-white hover:bg-blue-50 text-blue-900 border border-blue-200 hover:border-blue-600 transition-colors whitespace-nowrap"
          >
            {pill}
          </button>
        ))}
      </div>

      {/* Messages Feed */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex gap-3 max-w-[90%] ${m.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                m.sender === 'user' ? 'bg-blue-600 text-white font-bold' : 'bg-blue-50 text-blue-600 border border-blue-200'
              }`}
            >
              {m.sender === 'user' ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-blue-600 text-white font-medium rounded-tr-none shadow-sm'
                  : 'bg-blue-50 text-slate-900 border border-blue-100 rounded-tl-none shadow-sm'
              }`}
            >
              {m.sender === 'user' ? (
                <div className="whitespace-pre-wrap font-medium">{m.message}</div>
              ) : (
                <MarkdownRenderer content={m.message} />
              )}
              {m.sources && m.sources.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-blue-200 text-[10px] text-slate-500">
                  <strong className="text-slate-700">Data Sources:</strong> {m.sources.join(' • ')}
                </div>
              )}
              <span className="block text-[9px] opacity-70 text-right mt-1 font-mono">{m.timestamp}</span>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-xs text-blue-900 bg-blue-50 p-3 rounded-2xl w-fit rounded-tl-none border border-blue-100">
            <Sparkles className="w-4 h-4 animate-pulse" /> Gemini 3.6 Flash reasoning...
          </div>
        )}
      </div>

      {/* Input Box */}
      <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a financial question..."
          className="flex-1 bg-white border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-slate-900 placeholder-slate-400 rounded-xl px-3.5 py-2.5 text-xs outline-none"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold rounded-xl transition-all flex items-center justify-center"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
