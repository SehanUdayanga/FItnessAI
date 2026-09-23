import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { User, Target, Scale, Ruler, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';

const ProfileSetup = () => {
  const { user, profile, updateProfileState } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [age, setAge] = useState(profile?.age || 24);
  const [gender, setGender] = useState(profile?.gender || 'Male');
  const [height, setHeight] = useState(profile?.height || 175);
  const [currentWeight, setCurrentWeight] = useState(profile?.currentWeight || 70);
  const [targetWeight, setTargetWeight] = useState(profile?.targetWeight || 65);
  const [healthGoal, setHealthGoal] = useState(profile?.healthGoal || 'Maintain Weight');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.name) setName(user.name);
    if (profile) {
      if (profile.age) setAge(profile.age);
      if (profile.gender) setGender(profile.gender);
      if (profile.height) setHeight(profile.height);
      if (profile.currentWeight) setCurrentWeight(profile.currentWeight);
      if (profile.targetWeight) setTargetWeight(profile.targetWeight);
      if (profile.healthGoal) setHealthGoal(profile.healthGoal);
    }
  }, [user, profile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      const res = await api.put('/profile', {
        name,
        age: Number(age),
        gender,
        height: Number(height),
        currentWeight: Number(currentWeight),
        targetWeight: Number(targetWeight),
        healthGoal
      });

      if (res.data.success) {
        updateProfileState(res.data.data);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] dark:bg-slate-900 flex items-center justify-center p-4 selection:bg-green-100 selection:text-green-900">
      <div className="w-full max-w-xl bg-white dark:bg-slate-800 rounded-[24px] shadow-lg border border-line dark:border-slate-700 p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-[12px] bg-green-100 text-green-700 mb-2">
            <User className="w-6 h-6" />
          </div>
          <h1 className="font-sora text-2xl font-bold text-navy-900 dark:text-slate-200 tracking-tight">Complete Your Fitness Profile</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Tell us about your body metrics so we can personalize your health dashboard
          </p>
        </div>

        {error && (
          <div className="flex items-center space-x-2 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1.5 font-mono">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-line dark:border-slate-700 focus:ring-2 focus:ring-green-600 focus:outline-none text-sm bg-[#FAFAF8] dark:bg-slate-900 text-navy-900 dark:text-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1.5 font-mono">
                Age (years)
              </label>
              <input
                type="number"
                required
                min="10"
                max="120"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-line dark:border-slate-700 focus:ring-2 focus:ring-green-600 focus:outline-none text-sm bg-[#FAFAF8] dark:bg-slate-900 text-navy-900 dark:text-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1.5 font-mono">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-line dark:border-slate-700 focus:ring-2 focus:ring-green-600 focus:outline-none text-sm bg-[#FAFAF8] dark:bg-slate-900 text-navy-900 dark:text-slate-200"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1.5 font-mono">
                Height (cm)
              </label>
              <input
                type="number"
                required
                min="50"
                max="250"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="175"
                className="w-full px-4 py-3 rounded-xl border border-line dark:border-slate-700 focus:ring-2 focus:ring-green-600 focus:outline-none text-sm bg-[#FAFAF8] dark:bg-slate-900 text-navy-900 dark:text-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1.5 font-mono">
                Current Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                required
                min="20"
                max="300"
                value={currentWeight}
                onChange={(e) => setCurrentWeight(e.target.value)}
                placeholder="70"
                className="w-full px-4 py-3 rounded-xl border border-line dark:border-slate-700 focus:ring-2 focus:ring-green-600 focus:outline-none text-sm bg-[#FAFAF8] dark:bg-slate-900 text-navy-900 dark:text-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1.5 font-mono">
                Target Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                required
                min="20"
                max="300"
                value={targetWeight}
                onChange={(e) => setTargetWeight(e.target.value)}
                placeholder="65"
                className="w-full px-4 py-3 rounded-xl border border-line dark:border-slate-700 focus:ring-2 focus:ring-green-600 focus:outline-none text-sm bg-[#FAFAF8] dark:bg-slate-900 text-navy-900 dark:text-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1.5 font-mono">
              Primary Health Goal
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: 'Lose Weight', desc: 'Reduce body mass safely' },
                { label: 'Maintain Weight', desc: 'Sustain current energy & body' },
                { label: 'Gain Weight', desc: 'Build muscle mass & nutrition' },
                { label: 'Improve General Health', desc: 'Enhance overall vitality' }
              ].map((item) => (
                <div
                  key={item.label}
                  onClick={() => setHealthGoal(item.label)}
                  className={`p-3.5 rounded-[14px] border cursor-pointer transition-all ${
                    healthGoal === item.label
                      ? 'border-green-700 bg-green-050 ring-2 ring-green-700/20'
                      : 'border-line dark:border-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-navy-900 dark:text-slate-200">{item.label}</span>
                    {healthGoal === item.label && <CheckCircle2 className="w-5 h-5 text-green-700" />}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-green-700 hover:bg-green-600 text-white font-sora font-semibold rounded-xl shadow-[0_8px_20px_rgba(31,111,79,0.25)] hover:shadow-[0_12px_26px_rgba(31,111,79,0.32)] transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? <span>Saving Profile...</span> : <span>Save &amp; Continue to Dashboard</span>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup;
