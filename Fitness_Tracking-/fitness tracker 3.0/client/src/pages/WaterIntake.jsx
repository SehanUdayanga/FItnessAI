import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import { Droplet, Plus, Trash2, Calendar as CalendarIcon, CheckCircle2, GlassWater } from 'lucide-react';

const WaterIntake = () => {
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [waterData, setWaterData] = useState({
    totalAmount: 0,
    goal: 2500,
    percentage: 0,
    remaining: 2500,
    logs: []
  });
  const [loading, setLoading] = useState(true);
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [customAmount, setCustomAmount] = useState(300);

  const fetchWater = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/water?date=${date}`);
      if (res.data.success) {
        setWaterData(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching water intake:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWater();
  }, [date]);

  const handleQuickAdd = async (amount) => {
    try {
      await api.post('/water', { amount, date });
      fetchWater();
    } catch (err) {
      alert('Failed to log water intake.');
    }
  };

  const handleCustomSubmit = async (e) => {
    e.preventDefault();
    if (!customAmount || Number(customAmount) <= 0) return;

    try {
      await api.post('/water', { amount: Number(customAmount), date });
      setCustomModalOpen(false);
      fetchWater();
    } catch (err) {
      alert('Failed to log water intake.');
    }
  };

  const handleDeleteLog = async (id) => {
    try {
      await api.delete(`/water/${id}`);
      fetchWater();
    } catch (err) {
      alert('Failed to delete log entry.');
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const { totalAmount, goal, percentage, remaining, logs } = waterData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-sora text-2xl md:text-3xl font-bold text-navy-900 flex items-center space-x-2.5">
            <div className="p-2 rounded-[10px] bg-sky-100 text-sky-700">
              <Droplet className="w-6 h-6" />
            </div>
            <span>Water Intake Tracker</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Monitor daily hydration and hit your recommended 2.5L daily target
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-white px-3.5 py-2 rounded-xl border border-line shadow-sm text-xs font-semibold text-slate-700 font-mono">
            <CalendarIcon className="w-4 h-4 text-sky-600" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent focus:outline-none text-navy-900"
            />
          </div>

          <button
            onClick={() => setCustomModalOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Custom Amount</span>
          </button>
        </div>
      </div>

      {/* Main Hydration Progress Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress & Circular Indicator */}
        <div className="lg:col-span-2 bg-white rounded-[16px] p-6 border border-line shadow-sm flex flex-col justify-between space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-3 text-center md:text-left">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono">Hydration Status</span>
              <div className="flex items-baseline justify-center md:justify-start space-x-2">
                <span className="font-mono text-4xl md:text-5xl font-extrabold text-navy-900">
                  {(totalAmount / 1000).toFixed(2)}
                </span>
                <span className="font-mono text-xl font-bold text-sky-600">/ {(goal / 1000).toFixed(1)} L</span>
              </div>
              <p className="text-xs font-medium text-slate-500">
                {remaining > 0
                  ? `You have ${remaining} ml remaining to reach your daily hydration goal.`
                  : '🎉 Congratulations! You met your 2.5L daily hydration target!'}
              </p>
            </div>

            {/* Circular Progress Display */}
            <div className="relative w-36 h-36 flex items-center justify-center flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-[#FAFAF8]"
                  strokeWidth="3.5"
                  stroke="#E3E9E4"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-sky-500 transition-all duration-700 ease-out"
                  strokeDasharray={`${percentage}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="font-mono text-2xl font-black text-navy-900">{percentage}%</span>
                <span className="font-mono text-[10px] text-slate-400 font-semibold uppercase">Goal</span>
              </div>
            </div>
          </div>

          {/* Quick Buttons Grid */}
          <div className="space-y-2 pt-4 border-t border-line">
            <h4 className="text-xs font-bold text-slate-700 uppercase font-mono">Quick Hydration Buttons</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: '+250 ml', val: 250, desc: 'Small Glass' },
                { label: '+500 ml', val: 500, desc: 'Regular Bottle' },
                { label: '+750 ml', val: 750, desc: 'Large Bottle' },
                { label: '+1 L', val: 1000, desc: 'Hydration Flask' }
              ].map((btn) => (
                <button
                  key={btn.val}
                  onClick={() => handleQuickAdd(btn.val)}
                  className="p-3 bg-sky-50 hover:bg-sky-100/80 border border-sky-100 text-sky-800 rounded-xl text-center transition-all hover:scale-[1.02] shadow-sm"
                >
                  <div className="font-mono font-bold text-sm text-sky-700">{btn.label}</div>
                  <div className="text-[10px] text-sky-600 font-medium">{btn.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Today's History Panel */}
        <div className="bg-white rounded-[16px] p-6 border border-line shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <h3 className="font-sora font-bold text-navy-900 text-base">Intake History</h3>
              <span className="font-mono text-xs font-semibold text-slate-400">({logs.length} logs)</span>
            </div>

            {loading ? (
              <div className="py-6 text-center text-xs text-slate-400">Loading history...</div>
            ) : logs.length > 0 ? (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {logs.map((log) => (
                  <div
                    key={log._id}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#FAFAF8] border border-line hover:bg-slate-100/60 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-sky-100 text-sky-600">
                        <GlassWater className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-mono font-bold text-sm text-navy-900">+{log.amount} ml</p>
                        <p className="font-mono text-[10px] text-slate-400 font-medium">{formatTime(log.createdAt)}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteLog(log._id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Delete entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-400 border border-dashed border-line rounded-xl bg-[#FAFAF8]">
                No hydration records logged for this date.
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-line text-center">
            <span className="text-xs text-slate-400 font-mono">Daily Recommended Goal: 2,500 ml</span>
          </div>
        </div>
      </div>

      {/* Modal for Custom Water Intake */}
      <Modal isOpen={customModalOpen} onClose={() => setCustomModalOpen(false)} title="Custom Water Entry">
        <form onSubmit={handleCustomSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1 font-mono">
              Water Amount (milliliters)
            </label>
            <input
              type="number"
              required
              min="10"
              max="3000"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="e.g. 350"
              className="w-full px-4 py-3 rounded-xl border border-line focus:ring-2 focus:ring-sky-500 text-sm bg-[#FAFAF8]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1 font-mono">Date</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-line focus:ring-2 focus:ring-sky-500 text-sm bg-[#FAFAF8]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-sky-600 hover:bg-sky-500 text-white font-sora font-bold rounded-xl text-sm transition-colors shadow-sm"
          >
            Record Hydration
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default WaterIntake;

