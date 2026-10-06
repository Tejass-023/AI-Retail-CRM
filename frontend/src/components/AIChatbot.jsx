import React, { useState, useRef, useEffect } from 'react';
import { Bot, MessageSquare, X, Send, Sparkles, ChevronRight, RefreshCw } from 'lucide-react';
import { aiAPI } from '../services/api';

const QUICK_PROMPTS = [
  "What is my revenue?",
  "Which items are low in stock?",
  "Predict demand for Power Bank",
  "Show top customers"
];

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "🤖 **Hello! I'm your AI Retail Assistant**. Ask me anything about your revenue, inventory stockouts, demand predictions, or top customers!",
      suggested_actions: QUICK_PROMPTS
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputMessage;
    if (!query.trim()) return;

    // Append user message
    const userMsg = { sender: 'user', text: query };
    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const res = await aiAPI.chat(query);
      const data = res.data;
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: data.response || "I couldn't process that query. Try asking about your revenue or stock.",
          suggested_actions: data.suggested_actions || []
        }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: "⚠ **Connection issue**: Make sure the backend server is running on port 8000.",
          suggested_actions: QUICK_PROMPTS
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-full shadow-2xl shadow-blue-500/40 transform hover:scale-105 transition-all font-semibold text-xs"
        >
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center border border-white/30 shadow-inner">
            <Sparkles className="w-4 h-4 text-white animate-pulse" />
          </div>
          <span>AI Assistant</span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping absolute top-1 right-1"></span>
        </button>
      )}

      {/* Chatbot Window */}
      {isOpen && (
        <div className="bg-slate-900 text-white rounded-3xl w-80 sm:w-96 h-[500px] shadow-2xl border border-slate-700/80 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          
          {/* Header */}
          <div className="bg-slate-800/90 p-4 border-b border-slate-700/80 flex items-center justify-between backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  Apna AI Assistant
                  <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/20 px-1.5 py-0.2 rounded-full border border-emerald-500/30">
                    Live
                  </span>
                </h3>
                <p className="text-[10px] text-slate-400">Demand & CRM Intelligence</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 font-sans text-xs">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none shadow-md'
                      : 'bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-bl-none shadow-sm'
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-line">{msg.text.replace(/\*\*/g, '')}</p>
                </div>

                {/* Suggested Action Chips */}
                {msg.sender === 'bot' && msg.suggested_actions && msg.suggested_actions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 max-w-[90%]">
                    {msg.suggested_actions.map((act, aIdx) => (
                      <button
                        key={aIdx}
                        onClick={() => handleSendMessage(act)}
                        className="text-[10px] bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 px-2.5 py-1 rounded-full border border-indigo-500/30 transition-all font-medium"
                      >
                        {act}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs p-2 bg-slate-800/40 rounded-xl max-w-fit">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
                <span>AI Assistant is analyzing store database...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-slate-800/90 border-t border-slate-700/80 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask about revenue, stock, demand..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
            />
            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="p-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl transition-all shadow-md shadow-blue-600/30"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </div>
  );
};

export default AIChatbot;
