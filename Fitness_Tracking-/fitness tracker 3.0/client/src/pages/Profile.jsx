import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { User, Mail, Calendar, Ruler, Scale, Target, CheckCircle2, Edit3, Save, AlertCircle } from 'lucide-react';

const Profile = () => {
  const { user, profile, updateProfileState, fetchUser } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [age, setAge] = useState(24);
  const [gender, setGender] = useState('Male');
  const [height, setHeight] = useState(175);
  const [currentWeight, setCurrentWeight] = useState(70);
  const [targetWeight, setTargetWeight] = useState(65);
  const [healthGoal, setHealthGoal] = useState('Maintain Weight');
  const [profileImage, setProfileImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user?.name) setName(user.name);
    if (profile) {
      if (profile.age) setAge(profile.age);
      if (profile.gender) setGender(profile.gender);
      if (profile.height) setHeight(profile.height);
      if (profile.currentWeight) setCurrentWeight(profile.currentWeight);
      if (profile.targetWeight) setTargetWeight(profile.targetWeight);
      if (profile.healthGoal) setHealthGoal(profile.healthGoal);
      if (profile.profileImage) setProfileImage(profile.profileImage);
    }
  }, [user, profile]);

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    try {
      setLoading(true);
      const res = await api.put('/profile', {
        name,
        age: Number(age),
        gender,
        height: Number(height),
        currentWeight: Number(currentWeight),
        targetWeight: Number(targetWeight),
        healthGoal,
        profileImage
      });

      if (res.data.success) {
        updateProfileState(res.data.data);
        await fetchUser();
        setIsEditing(false);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update profile.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sora text-2xl md:text-3xl font-bold text-navy-900 flex items-center space-x-2.5">
            <div className="p-2 rounded-[10px] bg-green-100 text-green-700">
              <User className="w-6 h-6" />
            </div>
            <span>User Profile</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            View and update your personal health parameters and preferences
          </p>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all ${
            isEditing
              ? 'bg-[#FAFAF8] border border-line text-slate-700 hover:bg-slate-100'
              : 'bg-green-700 hover:bg-green-600 text-white shadow-sm'
          }`}
        >
          <Edit3 className="w-4 h-4" />
          <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
        </button>
      </div>

      {message.text && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center space-x-2 ${
            message.type === 'success'
              ? 'bg-green-050 border border-green-200 text-green-800'
              : 'bg-rose-50 border border-rose-200 text-rose-700'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-green-700" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Main Profile Card */}
      <div className="bg-white rounded-[20px] p-6 md:p-8 border border-line shadow-sm space-y-8">
        {/* User Top Info Avatar */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 pb-6 border-b border-line">
          <div className="relative">
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-green-100 shadow-md"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-green-400 to-green-700 text-white flex items-center justify-center font-bold text-3xl shadow-md">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
          </div>

          <div className="space-y-1 text-center sm:text-left">
            <h2 className="font-sora text-xl font-bold text-navy-900">{user?.name || name}</h2>
            <p className="text-xs sm:text-sm text-slate-500 flex items-center justify-center sm:justify-start space-x-1 font-mono">
              <Mail className="w-4 h-4 text-slate-400" />
              <span>{user?.email}</span>
            </p>
            <div className="pt-1.5">
              <span className="inline-block px-3 py-1 bg-green-050 text-green-700 text-xs font-bold rounded-full border border-green-200 font-mono">
                Goal: {healthGoal}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Information / Edit Form */}
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-line text-sm focus:ring-2 focus:ring-green-600 bg-[#FAFAF8]"
                />
              ) : (
                <div className="text-base font-bold text-navy-900">{user?.name || name}</div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">
                Age
              </label>
              {isEditing ? (
                <input
                  type="number"
                  required
                  min="10"
                  max="120"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-line text-sm focus:ring-2 focus:ring-green-600 bg-[#FAFAF8]"
                />
              ) : (
                <div className="text-base font-bold text-navy-900 font-mono">{age} years</div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">
                Gender
              </label>
              {isEditing ? (
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-line text-sm focus:ring-2 focus:ring-green-600 bg-[#FAFAF8]"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              ) : (
                <div className="text-base font-bold text-navy-900">{gender}</div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">
                Height
              </label>
              {isEditing ? (
                <input
                  type="number"
                  required
                  min="50"
                  max="250"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-line text-sm focus:ring-2 focus:ring-green-600 bg-[#FAFAF8]"
                />
              ) : (
                <div className="text-base font-bold text-navy-900 font-mono">{height} cm</div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">
                Current Weight
              </label>
              {isEditing ? (
                <input
                  type="number"
                  step="0.1"
                  required
                  min="20"
                  max="300"
                  value={currentWeight}
                  onChange={(e) => setCurrentWeight(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-line text-sm focus:ring-2 focus:ring-green-600 bg-[#FAFAF8]"
                />
              ) : (
                <div className="text-base font-bold text-navy-900 font-mono">{currentWeight} kg</div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">
                Target Weight
              </label>
              {isEditing ? (
                <input
                  type="number"
                  step="0.1"
                  required
                  min="20"
                  max="300"
                  value={targetWeight}
                  onChange={(e) => setTargetWeight(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-line text-sm focus:ring-2 focus:ring-green-600 bg-[#FAFAF8]"
                />
              ) : (
                <div className="text-base font-bold text-navy-900 font-mono">{targetWeight} kg</div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">
              Primary Health Goal
            </label>
            {isEditing ? (
              <select
                value={healthGoal}
                onChange={(e) => setHealthGoal(e.target.value)}
                className="w-full sm:w-1/2 px-4 py-2.5 rounded-xl border border-line text-sm focus:ring-2 focus:ring-green-600 bg-[#FAFAF8]"
              >
                <option value="Lose Weight">Lose Weight</option>
                <option value="Maintain Weight">Maintain Weight</option>
                <option value="Gain Weight">Gain Weight</option>
                <option value="Improve General Health">Improve General Health</option>
              </select>
            ) : (
              <div className="text-base font-bold text-navy-900">{healthGoal}</div>
            )}
          </div>

          {isEditing && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">
                Profile Image URL (Optional)
              </label>
              <input
                type="url"
                value={profileImage}
                onChange={(e) => setProfileImage(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className="w-full px-4 py-2.5 rounded-xl border border-line text-sm focus:ring-2 focus:ring-green-600 bg-[#FAFAF8]"
              />
            </div>
          )}

          {isEditing && (
            <div className="pt-4 border-t border-line flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center space-x-2 px-6 py-3 bg-green-700 hover:bg-green-600 text-white font-sora font-bold rounded-xl text-sm transition-all shadow-sm"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Profile;

