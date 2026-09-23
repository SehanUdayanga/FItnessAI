import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import {
  Bot,
  Send,
  Loader2,
  Sparkles,
  User,
  Scale,
  Droplet,
  Flame,
  Activity,
  Heart,
  AlertCircle
} from 'lucide-react';

const FitTrackAI = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: "Hi! I'm FitTrack AI 👋\nI can help you understand your FitTrack data and provide general health, nutrition, hydration and wellness guidance."
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [snapshot, setSnapshot] = useState(null);
  const [snapshotLoading, setSnapshotLoading] = useState(true);

  const chatEndRef = useRef(null);

  const suggestedQuestions = [
    'How am I doing today?',
    'How is my weight progressing?',
    'How much water do I need?',
    'Explain my BMI',
    'Suggest a healthy meal'
  ];

  // Fetch live health snapshot data from existing dashboard API
  useEffect(() => {
    const fetchSnapshot = async () => {
      try {
        setSnapshotLoading(true);
        const [dashRes, profileRes] = await Promise.all([
          api.get('/dashboard').catch(() => null),
          api.get('/profile').catch(() => null)
        ]);

        const dashData = dashRes?.data?.data || {};
        const profileData = profileRes?.data?.data || {};

        setSnapshot({
          currentWeight: dashData.currentWeight || profileData.currentWeight || '--',
          bmi: dashData.bmi || '--',
          bmiCategory: dashData.bmiCategory || '--',
          todayWater: dashData.todayWater !== undefined ? dashData.todayWater : '--',
          todayCalories: dashData.todayCalories !== undefined ? dashData.todayCalories : '--',
          healthGoal: profileData.healthGoal || dashData.healthGoal || 'Maintain Weight'
        });
      } catch (err) {
        console.error('Error fetching health snapshot:', err);
      } finally {
        setSnapshotLoading(false);
      }
    };

    fetchSnapshot();
  }, []);

  // Auto scroll chat to bottom when messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || loading) return;

    const userMsgId = Date.now();
    const newUserMsg = { id: userMsgId, sender: 'user', text: text.trim() };

    setMessages((prev) => [...prev, newUserMsg]);
    if (!textToSend) setInputMessage('');
    setLoading(true);
    setErrorMessage('');

    try {
      const res = await api.post('/assistant/chat', { message: text.trim() });
      if (res.data && res.data.success) {
        const aiMsg = {
          id: Date.now() + 1,
          sender: 'ai',
          text: res.data.message
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        throw new Error(res.data?.message || 'Failed to get response');
      }
    } catch (err) {
      console.error('Chat error:', err);
      const friendlyError =
        err.response?.data?.message ||
        "Sorry, I couldn't connect to FitTrack AI right now. Please try again.";
      setErrorMessage(friendlyError);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      {/* Page Title & Header */}
      <div className="bg-white p-6 rounded-[16px] border border-line shadow-sm">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-[12px] bg-green-700 flex items-center justify-center text-white shadow-md shadow-green-700/20 flex-shrink-0">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-sora text-2xl font-bold text-navy-900 tracking-tight flex items-center gap-2.5">
              FitTrack AI Assistant
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 font-mono">
                <Sparkles className="w-3.5 h-3.5" /> Groq AI
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">Your personalized health assistant</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Chat Area + Health Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Container (Takes 2 Columns on Desktop) */}
        <div className="lg:col-span-2 flex flex-col bg-white rounded-[16px] border border-line shadow-sm h-[620px]">
          {/* Chat Messages List */}
          <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${
                  msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-semibold shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-green-700 text-white'
                      : 'bg-navy-900 text-green-400'
                  }`}
                >
                  {msg.sender === 'user' ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.sender === 'user'
                      ? 'bg-green-700 text-white rounded-tr-none shadow-sm'
                      : 'bg-[#FAFAF8] text-navy-900 border border-line rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-navy-900 text-green-400 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-[#FAFAF8] text-slate-600 border border-line rounded-2xl rounded-tl-none px-4 py-3 text-sm flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-green-700" />
                  <span className="font-medium text-slate-600">FitTrack AI is thinking...</span>
                </div>
              </div>
            )}

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Suggested Questions */}
          <div className="px-4 py-2 border-t border-line bg-[#FAFAF8] flex flex-wrap gap-2">
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                disabled={loading}
                className="text-xs font-mono font-medium bg-white hover:bg-green-100 hover:text-green-800 hover:border-green-400 border border-line text-slate-700 px-3 py-1.5 rounded-full transition-all duration-150 disabled:opacity-50"
              >
                [ {q} ]
              </button>
            ))}
          </div>

          {/* Bottom Chat Input Bar */}
          <div className="p-4 border-t border-line bg-white rounded-b-[16px]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
                placeholder="Ask FitTrack AI..."
                className="flex-1 bg-[#FAFAF8] border border-line rounded-xl px-4 py-3 text-sm text-navy-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:bg-white transition-all disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={loading || !inputMessage.trim()}
                className="bg-green-700 hover:bg-green-600 text-white font-medium px-5 py-3 rounded-xl flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Health Snapshot Sidebar (Right Column) */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-5 rounded-[16px] border border-line shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h2 className="font-sora font-bold text-navy-900 text-base flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-700" />
                Your Health Snapshot
              </h2>
            </div>

            {snapshotLoading ? (
              <div className="py-8 text-center text-slate-400 flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-green-700" />
                <span className="text-sm">Loading health data...</span>
              </div>
            ) : snapshot ? (
              <div className="space-y-3">
                {/* Current Weight */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAFAF8] border border-line">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                      <Scale className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-500 font-medium font-mono uppercase">Current Weight</p>
                      <p className="text-sm font-bold text-navy-900 font-mono">{snapshot.currentWeight} kg</p>
                    </div>
                  </div>
                </div>

                {/* BMI */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAFAF8] border border-line">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-500 font-medium font-mono uppercase">BMI</p>
                      <p className="text-sm font-bold text-navy-900 font-mono">
                        {snapshot.bmi} <span className="text-xs font-medium text-slate-500">({snapshot.bmiCategory})</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Today's Water */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAFAF8] border border-line">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-600 flex items-center justify-center">
                      <Droplet className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-500 font-medium font-mono uppercase">Today's Water</p>
                      <p className="text-sm font-bold text-navy-900 font-mono">{snapshot.todayWater} ml</p>
                    </div>
                  </div>
                </div>

                {/* Today's Calories */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAFAF8] border border-line">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                      <Flame className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-500 font-medium font-mono uppercase">Today's Calories</p>
                      <p className="text-sm font-bold text-navy-900 font-mono">{snapshot.todayCalories} kcal</p>
                    </div>
                  </div>
                </div>

                {/* Health Goal */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-green-050 border border-green-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-green-100 text-green-700 flex items-center justify-center">
                      <Heart className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[11px] text-green-800 font-medium font-mono uppercase">Health Goal</p>
                      <p className="text-sm font-bold text-green-900">{snapshot.healthGoal}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">Snapshot data unavailable.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FitTrackAI;

