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
      // message: `Hello! I am your AI Financial Advisor. ${tickerContext ? `Currently analyzing ${tickerContext}.` : 'Ask me anything about stocks, technical indicators (RSI, MACD), or portfolio strategy!'}`,
      message: `Hello! I am your AI Financial Advisor. ${tickerContext ? `Currently analyzing ${tickerContext}.` : 'What would you like to analyze?'}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e?: React.FormEvent, forcedMessage?: string) => {
    if (e) e.preventDefault();
    // Use forcedMessage (from pill click) if provided, otherwise fall back to current input
    const userInput = forcedMessage !== undefined ? forcedMessage : input;
    if (!userInput.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      message: userInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    // Clear input only when the message came from the input field
    if (forcedMessage === undefined) {
      setInput('');
    }
    setLoading(true);

    try {
      const historyPayload = newHistory.map((m) => ({
        sender: m.sender,
        message: m.message
      }));

      // Determine whether to include tickerContext based on user input
      const shouldIncludeTicker = tickerContext &&
        new RegExp(`\\b${tickerContext}\\b`, 'i').test(userMsg.message) ||
        /this\s+stock|current\s+stock/i.test(userMsg.message);
      const res = await aiApi.sendMessage(userMsg.message, shouldIncludeTicker ? tickerContext : undefined, historyPayload);
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        message: `${res.message}\n\n*AI-generated educational analysis. This is not financial advice.*`,
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
    // Directly send the prompt as a message without waiting for user to press Send
    handleSend(undefined, prompt);
  };



  // Simplify AI messages for non‑technical users
  const simplifyMessage = (msg: string) => {
    return msg
      .replace(/strong bullish momentum/gi, 'positive trend')
      .replace(/key moving averages/gi, 'recent averages')
      .replace(/valuation metrics/gi, 'valuation')
      .replace(/strong bullish/gi, 'positive')
      .replace(/bullish/gi, 'positive')
      .replace(/bearish/gi, 'negative')
      .replace(/Moving Average Alignment[^:]*:/gi, 'Price trend:')
      .replace(/Momentum Profile[^:]*:/gi, 'Momentum:')
      // Simplify RSI description
      .replace(/Relative Strength Index \(RSI\)[\s\S]*?scale of 0 to 100\./gi, 'RSI shows whether a stock has been going up or down strongly. It uses a scale from 0 to 100.')
      // Simple RSI level explanations
      .replace(/RSI above 70[^.]*\./gi, 'The stock may have gone up too quickly and could come down or slow down.')
      .replace(/RSI below 30[^.]*\./gi, 'The stock may have fallen too much and could start recovering.')
      .replace(/RSI around 50[^.]*\./gi, 'The stock is in a neutral position. There is no strong upward or downward signal.');
  };
  // Format currency for Indian stocks (RELIANCE.NS)
  const formatCurrency = (msg: string) => {
    if (tickerContext?.toUpperCase() === 'RELIANCE.NS') {
      return msg.replace(/\$([0-9,.]+)/g, (_, num) => {
        const n = parseFloat(num.replace(/,/g, ''));
        const formatted = new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
        return `₹${formatted}`;
      });
    }
    return msg;
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
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" /> <span className="text-green-600">Online</span> • AI-powered financial guidance
            </span>
          </div>
        </div>
      </div>

      {/* Suggested Prompt Pills */}
      <div className="bg-white px-4 py-2 border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
        {['Should I buy this stock?', 'Explain RSI', 'Explain diversification', 'Compare stocks'].map((pill, i) => (
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
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.sender === 'user' ? 'bg-blue-600 text-white font-bold' : 'bg-blue-50 text-blue-600 border border-blue-200'
                }`}
            >
              {m.sender === 'user' ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`p-3.5 rounded-2xl text-xs leading-relaxed ${m.sender === 'user'
                ? 'bg-blue-600 text-white font-medium rounded-tr-none shadow-sm'
                : 'bg-blue-50 text-slate-900 border border-blue-100 rounded-tl-none shadow-sm'
                }`}
            >
              {m.sender === 'user' ? (
                <div className="whitespace-pre-wrap font-medium">{m.message}</div>
              ) : (
                <MarkdownRenderer content={formatCurrency(simplifyMessage(m.message))} />
              )}
              {m.sources && m.sources.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-blue-200 text-[10px] text-slate-500">
                  <strong className="text-slate-700">AI CAN MAKE MISTAKES </strong> {m.sources.join(' • ')}
                </div>
              )}
              <span className="block text-[9px] opacity-70 text-right mt-1 font-mono">{m.timestamp}</span>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-xs text-blue-900 bg-blue-50 p-3 rounded-2xl w-fit rounded-tl-none border border-blue-100">
            <Sparkles className="w-4 h-4 animate-pulse" /> Processing...
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
