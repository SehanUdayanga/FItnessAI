import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Bot,
  Activity,
  CheckCircle2,
  XCircle,
  RefreshCw,
  KeyRound,
  Sliders,
  Sparkles,
  Zap,
  Clock,
  Send,
  AlertCircle
} from 'lucide-react';

const AdminAIMonitoring = () => {
  // Monitoring State
  const [statusData, setStatusData] = useState({
    status: 'Connected',
    provider: 'Google Gemini',
    model: 'gemini-1.5-flash',
    lastApiCheck: null,
    requestsToday: 0,
    successfulRequests: 0,
    failedRequests: 0
  });
  const [statusLoading, setStatusLoading] = useState(true);

  // Configuration State
  const [config, setConfig] = useState({
    provider: 'Google Gemini',
    model: 'gemini-1.5-flash',
    apiKeyMasked: '••••••••••••',
    isConfigured: true
  });
  const [newApiKey, setNewApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini-1.5-flash');
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState({ type: '', text: '' });

  // Test Connection State
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState(null);

  // Fetch AI Status
  const fetchStatus = async () => {
    try {
      setStatusLoading(true);
      const res = await api.get('/admin/ai/status');
      if (res.data.success) {
        setStatusData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch AI status:', err);
    } finally {
      setStatusLoading(false);
    }
  };

  // Fetch AI Config
  const fetchConfig = async () => {
    try {
      const res = await api.get('/admin/ai/config');
      if (res.data.success) {
        setConfig(res.data.data);
        setSelectedModel(res.data.data.model || 'gemini-1.5-flash');
      }
    } catch (err) {
      console.error('Failed to fetch AI config:', err);
    }
  };

  useEffect(() => {
    fetchStatus();
    fetchConfig();
  }, []);

  // Handle Save Configuration
  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setSaveMessage({ type: '', text: '' });

    try {
      setSaveLoading(true);
      const payload = {
        model: selectedModel
      };

      if (newApiKey.trim()) {
        payload.apiKey = newApiKey.trim();
      }

      const res = await api.put('/admin/ai/config', payload);
      if (res.data.success) {
        setConfig(res.data.data);
        setNewApiKey('');
        setSaveMessage({ type: 'success', text: 'AI configuration saved successfully.' });
        fetchStatus();
      }
    } catch (err) {
      setSaveMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to save configuration.'
      });
    } finally {
      setSaveLoading(false);
    }
  };

  // Handle Test Connection
  const handleTestConnection = async () => {
    setTestResult(null);
    setSaveMessage({ type: '', text: '' });

    try {
      setTestLoading(true);
      const payload = {
        model: selectedModel
      };

      if (newApiKey.trim()) {
        payload.apiKey = newApiKey.trim();
      }

      const res = await api.post('/admin/ai/test', payload);
      setTestResult({
        success: res.data.success,
        message: res.data.message || (res.data.success ? 'Connection successful' : 'Connection failed')
      });
      fetchStatus();
    } catch (err) {
      setTestResult({
        success: false,
        message: err.response?.data?.message || '✕ Connection failed. Please verify API key and model.'
      });
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <h2 className="font-sora font-bold text-xl text-navy-900 dark:text-slate-200">AI Monitoring &amp; Configuration</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Monitor Google Gemini AI performance, test connectivity, and configure API parameters
        </p>
      </div>

      {/* Grid: Left = Monitoring, Right = Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ========================================================= */}
        {/* 1. AI MONITORING PANEL (5 cols) */}
        {/* ========================================================= */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-line dark:border-slate-700 shadow-xs p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-line dark:border-slate-700 pb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-green-100 text-green-700 flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-sora font-bold text-base text-navy-900 dark:text-slate-200">AI Service Status</h3>
                  <span className="text-[11px] text-slate-400 font-mono">Live Diagnostics</span>
                </div>
              </div>

              <button
                onClick={fetchStatus}
                title="Refresh Metrics"
                className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-navy-900 dark:text-slate-200 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${statusLoading ? 'animate-spin text-green-700' : ''}`} />
              </button>
            </div>

            {/* Connection Indicator Card */}
            <div
              className={`p-4 rounded-xl border flex items-center justify-between ${
                statusData.status === 'Connected'
                  ? 'bg-green-50/60 dark:bg-green-900/20 border-green-200 dark:border-green-800/50 text-green-900 dark:text-green-400'
                  : 'bg-rose-50/60 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800/50 text-rose-900 dark:text-rose-400'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-3 h-3 rounded-full ${
                    statusData.status === 'Connected' ? 'bg-green-600 animate-pulse' : 'bg-rose-600'
                  }`}
                />
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider block font-semibold">
                    Status
                  </span>
                  <span className="font-sora font-bold text-base">
                    {statusData.status === 'Connected' ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase block">Provider</span>
                <span className="text-xs font-semibold">{statusData.provider}</span>
              </div>
            </div>

            {/* Details List */}
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-line dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400 font-medium">AI Provider</span>
                <span className="font-semibold text-navy-900 dark:text-slate-200 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Google Gemini</span>
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-line dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Current AI Model</span>
                <span className="font-mono font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                  {statusData.model}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-line dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Last API Check</span>
                <span className="font-mono text-slate-600 text-[11px]">
                  {statusData.lastApiCheck
                    ? new Date(statusData.lastApiCheck).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })
                    : 'Not tested yet'}
                </span>
              </div>
            </div>

            {/* Daily Request Metrics */}
            <div className="pt-2 space-y-2.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
                Today's Usage Metrics
              </span>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-line dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 font-mono block">Requests</span>
                  <span className="font-sora font-bold text-base text-navy-900 dark:text-slate-200 mt-0.5 block">
                    {statusData.requestsToday}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-green-50/50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/50">
                  <span className="text-[10px] text-green-600 dark:text-green-500 font-mono block">Success</span>
                  <span className="font-sora font-bold text-base text-green-700 dark:text-green-400 mt-0.5 block">
                    {statusData.successfulRequests}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-rose-50/50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/50">
                  <span className="text-[10px] text-rose-600 dark:text-rose-500 font-mono block">Failed</span>
                  <span className="font-sora font-bold text-base text-rose-700 dark:text-rose-400 mt-0.5 block">
                    {statusData.failedRequests}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. AI CONFIGURATION FORM (7 cols) */}
        {/* ========================================================= */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-line dark:border-slate-700 shadow-xs p-6 space-y-6">
            <div className="flex items-center space-x-2.5 border-b border-line dark:border-slate-700 pb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-sora font-bold text-base text-navy-900 dark:text-slate-200">AI Configuration</h3>
                <p className="text-[11px] text-slate-400">Update backend Gemini API credentials and model version</p>
              </div>
            </div>

            {/* Toast feedback */}
            {saveMessage.text && (
              <div
                className={`p-3.5 rounded-xl text-xs font-medium border flex items-center space-x-2 ${
                  saveMessage.type === 'success'
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {saveMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-green-700 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-700 flex-shrink-0" />
                )}
                <span>{saveMessage.text}</span>
              </div>
            )}

            {/* Test Connection Banner */}
            {testResult && (
              <div
                className={`p-4 rounded-xl border flex items-start space-x-3 text-xs animate-in fade-in duration-200 ${
                  testResult.success
                    ? 'bg-green-50 border-green-200 text-green-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-5 h-5 text-green-700 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-700 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-bold block text-sm">
                    {testResult.success ? '✓ Connection Successful' : '✕ Connection Failed'}
                  </span>
                  <p className="mt-0.5 text-slate-600">{testResult.message}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSaveConfig} className="space-y-4">
              {/* AI Provider */}
              <div>
                <label className="block text-xs font-mono font-semibold uppercase text-slate-600 mb-1.5">
                  AI Provider
                </label>
                <div className="relative">
                  <input
                    type="text"
                    disabled
                    value="Google Gemini"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-line dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-semibold cursor-not-allowed dark:placeholder-slate-500"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                  </div>
                </div>
              </div>

              {/* API Key */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-mono font-semibold uppercase text-slate-600">
                    AI API Key (Gemini)
                  </label>
                  <span className="text-[11px] font-mono text-slate-400">
                    Current: <span className="text-slate-700 dark:text-slate-200 font-semibold">{config.apiKeyMasked}</span>
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={newApiKey}
                    onChange={(e) => setNewApiKey(e.target.value)}
                    placeholder="Enter new Gemini API key to update..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-line dark:border-slate-700 bg-[#FAFAF8] dark:bg-slate-900 focus:bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-green-600 text-sm text-navy-900 dark:text-slate-200 font-mono"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Leave blank to keep current API key. Keys are securely stored and never exposed on frontend.
                </p>
              </div>

              {/* Model Selection */}
              <div>
                <label className="block text-xs font-mono font-semibold uppercase text-slate-600 mb-1.5">
                  AI Model
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-line dark:border-slate-700 bg-[#FAFAF8] dark:bg-slate-900 focus:bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-green-600 text-sm text-navy-900 dark:text-slate-200 font-medium cursor-pointer"
                >
                  <option value="gemini-1.5-flash">gemini-1.5-flash (Fast &amp; Recommended)</option>
                  <option value="gemini-2.0-flash">gemini-2.0-flash (Latest Flash)</option>
                  <option value="gemini-2.5-flash">gemini-2.5-flash</option>
                  <option value="gemini-3.6-flash">gemini-3.6-flash</option>
                  <option value="gemini-3.5-flash">gemini-3.5-flash</option>
                </select>
              </div>

              {/* Action Buttons: [Test Connection] [Save Changes] */}
              <div className="pt-4 border-t border-line dark:border-slate-700 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={testLoading}
                  onClick={handleTestConnection}
                  className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-line dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <Zap className={`w-3.5 h-3.5 ${testLoading ? 'animate-spin text-amber-500' : 'text-amber-500'}`} />
                  <span>{testLoading ? 'Testing...' : 'Test Connection'}</span>
                </button>

                <button
                  type="submit"
                  disabled={saveLoading}
                  className="px-5 py-2.5 bg-green-700 hover:bg-green-600 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{saveLoading ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAIMonitoring;
