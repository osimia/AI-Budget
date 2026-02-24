import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { GeminiService } from '../services/geminiService';
import { ChatMessage, Transaction, UserSettings } from '../types';
import { translations } from '../utils/i18n';

interface AIAdvisorProps {
  transactions: Transaction[];
  settings: UserSettings;
}

export const AIAdvisor: React.FC<AIAdvisorProps> = ({ transactions, settings }) => {
  const t = translations[settings.language];
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Set initial welcome message based on language
    setMessages([{
      id: 'welcome',
      role: 'model',
      text: t.advisor.welcome,
      timestamp: Date.now()
    }]);
  }, [settings.language]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => scrollToBottom(), [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Prepare context
    const expenseTotal = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const incomeTotal = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    
    const context = `
      User Language: ${settings.language}.
      User Currency: ${settings.currency}.
      Monthly Budget: ${settings.monthlyBudget}.
      Current Month Expenses: ${expenseTotal}.
      Current Month Income: ${incomeTotal}.
      Recent Transactions: ${transactions.slice(0, 5).map(t => `${t.date}: ${t.description} (${t.amount})`).join('; ')}.
    `;

    // Map history for Gemini
    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    try {
      const responseText = await GeminiService.getFinancialAdvice(userMsg.text, context, history);
      
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: "I'm having trouble connecting right now. Please try again.",
        timestamp: Date.now()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900 to-emerald-800 p-4 text-white flex items-center space-x-3 shadow-md z-10">
        <div className="p-2 bg-white/10 rounded-full text-amber-400 border border-white/10">
          <Sparkles size={20} />
        </div>
        <div>
          <h3 className="font-semibold text-white tracking-wide">{t.advisor.title}</h3>
          <p className="text-xs text-emerald-200/80">{t.advisor.subtitle}</p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                msg.role === 'user'
                  ? 'bg-emerald-800 text-white rounded-tr-none'
                  : 'bg-white text-stone-700 border border-stone-200 rounded-tl-none'
              }`}
            >
              {/* Simple markdown rendering for bold text */}
              {msg.text.split('**').map((part, i) => 
                i % 2 === 1 ? <strong key={i} className={msg.role === 'user' ? 'text-amber-300' : 'text-emerald-800'}>{part}</strong> : part
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
             <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-stone-200 shadow-sm flex space-x-2 items-center">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-stone-100">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={t.advisor.placeholder}
            className="flex-1 p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all text-stone-800 placeholder-stone-400"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="p-3 bg-emerald-800 text-white rounded-xl hover:bg-emerald-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-emerald-200"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};