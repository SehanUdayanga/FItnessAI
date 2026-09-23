import React, { useState, useEffect } from 'react';
import api from '../services/api';
import StatCard from '../components/StatCard';
import Modal from '../components/Modal';
import { Scale, Plus, Trash2, Calendar as CalendarIcon, TrendingDown, Target, Award } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

const WeightTracker = () => {
  const [summary, setSummary] = useState({
    startingWeight: 0,
    currentWeight: 0,
    targetWeight: 65,
    weightChange: 0
  });
  const [weightRecords, setWeightRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [weightInput, setWeightInput] = useState('');
  const [dateInput, setDateInput] = useState(() => new Date().toISOString().split('T')[0]);

  const fetchWeightData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/weight');
      if (res.data.success) {
        setSummary(res.data.summary);
        setWeightRecords(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching weight records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeightData();
  }, []);

  const handleAddWeight = async (e) => {
    e.preventDefault();
    if (!weightInput || Number(weightInput) <= 0) return;

    try {
      await api.post('/weight', {
        weight: Number(weightInput),
        date: dateInput
      });
      setIsModalOpen(false);
      setWeightInput('');
      fetchWeightData();
    } catch (err) {
      alert('Failed to save weight record.');
    }
  };

  const handleDeleteWeight = async (id) => {
    if (!window.confirm('Delete this weight entry?')) return;
    try {
      await api.delete(`/weight/${id}`);
      fetchWeightData();
    } catch (err) {
      alert('Failed to delete entry.');
    }
  };

  const { startingWeight, currentWeight, targetWeight, weightChange } = summary;

  // Calculate progress percent towards target
  let targetProgressPercent = 0;
  if (startingWeight !== targetWeight) {
    const totalGoalDiff = Math.abs(startingWeight - targetWeight);
    const achievedDiff = Math.abs(startingWeight - currentWeight);
    targetProgressPercent = Math.min(Math.round((achievedDiff / totalGoalDiff) * 100), 100);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-sora text-2xl md:text-3xl font-bold text-navy-900 flex items-center space-x-2.5">
            <div className="p-2 rounded-[10px] bg-green-100 text-green-700">
              <Scale className="w-6 h-6" />
            </div>
            <span>Weight Tracker</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Log your body weight updates and track progress toward your target weight
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-1.5 px-4 py-2.5 bg-green-700 hover:bg-green-600 text-white font-semibold text-xs rounded-xl shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Weight Record</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Starting Weight"
          value={startingWeight}
          unit="kg"
          subtitle="Initial baseline"
          icon={Scale}
          color="purple"
        />

        <StatCard
          title="Current Weight"
          value={currentWeight}
          unit="kg"
          subtitle="Latest entry"
          icon={Scale}
          color="green"
        />

        <StatCard
          title="Target Weight"
          value={targetWeight}
          unit="kg"
          subtitle="Your target goal"
          icon={Target}
          color="blue"
        />

        <StatCard
          title="Weight Change"
          value={weightChange > 0 ? `+${weightChange}` : weightChange}
          unit="kg"
          subtitle="Total difference"
          icon={TrendingDown}
          color={weightChange <= 0 ? 'green' : 'orange'}
          trend={weightChange}
        />
      </div>

      {/* Goal Progress Banner */}
      <div className="bg-white rounded-[16px] p-6 border border-line shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-green-700" />
            <h3 className="font-sora font-bold text-navy-900 text-sm">Progress toward Target Weight ({targetWeight} kg)</h3>
          </div>
          <span className="font-mono text-xs font-bold text-green-700 bg-green-100 px-2.5 py-1 rounded-full">
            {targetProgressPercent}% Completed
          </span>
        </div>

        <div className="w-full bg-[#FAFAF8] border border-line rounded-full h-3 overflow-hidden">
          <div
            className="bg-green-600 h-full transition-all duration-500 rounded-full"
            style={{ width: `${targetProgressPercent}%` }}
          />
        </div>
      </div>

      {/* Chart & History Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart */}
        <div className="lg:col-span-2 bg-white rounded-[16px] p-6 border border-line shadow-sm space-y-4">
          <div>
            <h3 className="font-sora font-bold text-navy-900 text-base">Weight History Trend Chart</h3>
            <p className="text-xs text-slate-500">Visual progress graph over time</p>
          </div>

          <div className="h-72 w-full pt-4">
            {loading ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                Loading graph...
              </div>
            ) : weightRecords.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weightRecords}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E3E9E4" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#68737E' }} />
                  <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11, fill: '#68737E' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F151C', color: '#FFF', borderRadius: '12px', fontSize: '12px', border: 'none' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="#1F6F4F"
                    strokeWidth={3}
                    dot={{ fill: '#1F6F4F', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                No weight logs found. Click "Add Weight Record" to populate your graph.
              </div>
            )}
          </div>
        </div>

        {/* History Table */}
        <div className="bg-white rounded-[16px] p-6 border border-line shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <h3 className="font-sora font-bold text-navy-900 text-base">Weight Log History</h3>
              <span className="font-mono text-xs font-semibold text-slate-400">({weightRecords.length} entries)</span>
            </div>

            {weightRecords.length > 0 ? (
              <div className="space-y-2 mt-3 max-h-[300px] overflow-y-auto pr-1">
                {[...weightRecords].reverse().map((record) => (
                  <div
                    key={record._id}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#FAFAF8] border border-line hover:bg-slate-100/70 transition-colors"
                  >
                    <div>
                      <span className="font-mono font-bold text-sm text-navy-900">{record.weight} kg</span>
                      <p className="font-mono text-[11px] text-slate-400 font-medium">{record.date}</p>
                    </div>

                    <button
                      onClick={() => handleDeleteWeight(record._id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Delete record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-400 border border-dashed border-line rounded-xl mt-3 bg-[#FAFAF8]">
                No weight entries logged yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Weight Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Log Weight Entry">
        <form onSubmit={handleAddWeight} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1 font-mono">Body Weight (kg)</label>
            <input
              type="number"
              step="0.1"
              required
              min="20"
              max="300"
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              placeholder="e.g. 70.5"
              className="w-full px-4 py-3 rounded-xl border border-line focus:ring-2 focus:ring-green-600 text-sm bg-[#FAFAF8]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1 font-mono">Date</label>
            <input
              type="date"
              required
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-line focus:ring-2 focus:ring-green-600 text-sm bg-[#FAFAF8]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-green-700 hover:bg-green-600 text-white font-sora font-bold rounded-xl text-sm transition-colors shadow-sm"
          >
            Save Weight Entry
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default WeightTracker;

