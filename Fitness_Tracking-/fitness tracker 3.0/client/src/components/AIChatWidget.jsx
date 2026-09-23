import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import {
  Bot,
  Send,
  X,
  Sparkles,
  MessageSquare,
  Minus,
  Maximize2
} from 'lucide-react';

const AIChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: "Hi! I'm your FitTrack AI assistant 👋\nAsk me anything about your diet, workouts, hydration, or personalized wellness advice."
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [guidanceText, setGuidanceText] = useState("Your hydration and calorie balance are on track. Ask me for personalized workout ideas or dietary tips!");
  const chatBottomRef = useRef(null);

  // Listen for global custom event to open AI assistant from Navbar
  useEffect(() => {
    const handleOpenAI = () => setIsOpen(true);
    window.addEventListener('open-ai-chat', handleOpenAI);
    return () => window.removeEventListener('open-ai-chat', handleOpenAI);
  }, []);

  // Auto scroll to bottom when messages update
  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  const handleSendMessage = async (promptToSend) => {
    const message = promptToSend || input;
    if (!message || !message.trim() || isTyping) return;

    const userMsg = { id: Date.now(), sender: 'user', text: message.trim() };
    setMessages((prev) => [...prev, userMsg]);
    if (!promptToSend) setInput('');
    setIsTyping(true);

    try {
      const res = await api.post('/assistant/chat', { message: message.trim() });
      if (res.data && res.data.success) {
        const reply = res.data.message || res.data.data?.message;
        setMessages((prev) => [
          ...prev,
          { id: Date.now() + 1, sender: 'ai', text: reply }
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { id: Date.now() + 1, sender: 'ai', text: "I'm having trouble connecting right now. Please try again in a moment." }
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, sender: 'ai', text: "I couldn't reach the AI service. Please verify your connection or backend setup." }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Circular Green Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-green-700 hover:bg-green-600 text-white shadow-xl flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 ring-4 ring-green-100/60 group focus:outline-none"
        title="Open FitTrack AI Assistant"
        aria-label="Open FitTrack AI Assistant"
      >
        {isOpen ? (
          <X className="w-6 h-6 transition-transform group-hover:rotate-90" />
        ) : (
          <div className="relative flex items-center justify-center">
            <Bot className="w-6 h-6" />
            <span className="ai-pulse absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-300 border-2 border-green-700" />
          </div>
        )}
      </button>

      {/* Floating Popup Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] sm:w-[420px] max-w-[calc(100vw-32px)] h-[560px] max-h-[calc(100vh-120px)] bg-navy-900 text-white rounded-2xl shadow-2xl border border-line-dark flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
          {/* Header */}
          <div className="px-5 py-3.5 bg-navy-950/80 border-b border-line-dark flex items-center justify-between flex-shrink-0">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-green-400/20 text-green-400 flex items-center justify-center shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-sora font-bold text-sm text-white flex items-center gap-1.5">
                  <span>FitTrack AI</span>
                  <span className="text-[9px] font-mono font-bold bg-green-400/20 text-green-400 px-1.5 py-0.5 rounded-full">
                    ONLINE
                  </span>
                </h3>
                <p className="text-[11px] text-[#9AA6AC] leading-none mt-0.5">Your personal wellness companion</p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-navy-800 transition-colors"
                title="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Dynamic Guidance Banner */}
          <div className="bg-navy-800/80 px-4 py-2.5 border-b border-line-dark/60 flex items-start space-x-2 flex-shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-green-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-[#E7EBEA] italic font-inter leading-tight">
              "{guidanceText}"
            </p>
          </div>

          {/* Chat Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-navy-950/40 font-inter">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start space-x-2 ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-6 h-6 rounded-full bg-green-400/20 text-green-400 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[82%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed whitespace-pre-line ${
                    msg.sender === 'user'
                      ? 'bg-green-700 text-white rounded-br-none shadow-xs'
                      : 'bg-navy-800 text-[#E7EBEA] border border-line-dark/60 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center space-x-2 text-xs text-slate-400 italic py-1 pl-8">
                <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span>FitTrack AI is typing...</span>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Quick Prompts */}
          <div className="px-3 py-2 bg-navy-900/90 border-t border-line-dark/50 flex flex-wrap gap-1.5 flex-shrink-0">
            {[
              'How am I doing today?',
              'How is my weight progressing?',
              'Suggest a healthy meal',
              'Explain my BMI'
            ].map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => handleSendMessage(prompt)}
                disabled={isTyping}
                className="text-[10px] bg-navy-800 hover:bg-navy-700 text-slate-300 hover:text-white px-2.5 py-1 rounded-md border border-line-dark/60 transition-colors disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-navy-950 border-t border-line-dark flex items-center gap-2 flex-shrink-0"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isTyping}
              placeholder="Ask anything about health, food, workout..."
              className="flex-1 px-3.5 py-2 rounded-xl bg-navy-800 border border-line-dark text-white placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-green-500 font-inter"
            />
            <button
              type="submit"
              disabled={isTyping || !input.trim()}
              className="p-2 bg-green-700 hover:bg-green-600 disabled:opacity-40 text-white rounded-xl transition-colors flex items-center justify-center shadow-xs"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default AIChatWidget;
