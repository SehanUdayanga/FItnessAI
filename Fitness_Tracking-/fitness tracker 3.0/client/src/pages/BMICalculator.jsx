import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Calculator, CheckCircle2, History, Scale, Ruler, Info } from 'lucide-react';

const BMICalculator = () => {
  const [height, setHeight] = useState(175);
  const [weight, setWeight] = useState(70);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchBMIHistory = async () => {
    try {
      const res = await api.get('/bmi/history');
      if (res.data.success) {
        setHistory(res.data.data);
        if (res.data.defaults) {
          if (res.data.defaults.height) setHeight(res.data.defaults.height);
          if (res.data.defaults.weight) setWeight(res.data.defaults.weight);
        }
      }
    } catch (err) {
      console.error('Error fetching BMI history:', err);
    }
  };

  useEffect(() => {
    fetchBMIHistory();
  }, []);

  const handleCalculate = async (e) => {
    e.preventDefault();
    if (!height || !weight) return;

    try {
      setLoading(true);
      const res = await api.post('/bmi/calculate', {
        height: Number(height),
        weight: Number(weight)
      });
      if (res.data.success) {
        setResult(res.data.data);
        fetchBMIHistory();
      }
    } catch (err) {
      alert('Failed to calculate BMI.');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Underweight':
        return 'text-sky-600 bg-sky-50 border-sky-200';
      case 'Normal':
        return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'Overweight':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'Obese':
        return 'text-rose-600 bg-rose-50 border-rose-200';
      default:
        return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="font-sora text-2xl md:text-3xl font-bold text-navy-900 flex items-center space-x-2.5">
          <div className="p-2 rounded-[10px] bg-green-100 text-green-700">
            <Calculator className="w-6 h-6" />
          </div>
          <span>BMI Calculator</span>
        </h1>
        <p className="text-xs md:text-sm text-slate-500 mt-1">
          Calculate your Body Mass Index (BMI) based on your height and latest weight
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form & Result Box */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[16px] p-6 border border-line shadow-sm space-y-5">
            <h3 className="font-sora font-bold text-navy-900 text-base">Calculate Body Mass Index</h3>

            <form onSubmit={handleCalculate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1 flex items-center space-x-1 font-mono">
                    <Ruler className="w-3.5 h-3.5 text-slate-400" />
                    <span>Height (cm)</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="50"
                    max="250"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="175"
                    className="w-full px-4 py-3 rounded-xl border border-line focus:ring-2 focus:ring-green-600 text-sm bg-[#FAFAF8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1 flex items-center space-x-1 font-mono">
                    <Scale className="w-3.5 h-3.5 text-slate-400" />
                    <span>Weight (kg)</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    min="20"
                    max="300"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="70"
                    className="w-full px-4 py-3 rounded-xl border border-line focus:ring-2 focus:ring-green-600 text-sm bg-[#FAFAF8]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-green-700 hover:bg-green-600 text-white font-sora font-bold rounded-xl text-sm transition-colors shadow-sm disabled:opacity-50"
              >
                {loading ? 'Calculating...' : 'Calculate BMI'}
              </button>
            </form>
          </div>

          {/* Active Result Card */}
          {result && (
            <div className="bg-white rounded-[16px] p-6 border border-line shadow-sm space-y-4 animate-in fade-in duration-300">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Calculation Output</span>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-mono text-4xl font-extrabold text-navy-900">{result.bmi}</div>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">Calculated BMI Score</p>
                </div>

                <div className={`px-4 py-2 rounded-2xl border font-bold text-sm ${getCategoryColor(result.bmiCategory)}`}>
                  {result.bmiCategory} Weight
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#FAFAF8] border border-line text-xs text-slate-600 space-y-1">
                <p>Formula used: <span className="font-mono font-bold text-navy-900">BMI = Weight (kg) / Height (m)²</span></p>
                <p className="font-mono">Height: {result.height} cm | Weight: {result.weight} kg</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Reference Table */}
        <div className="space-y-6">
          <div className="bg-white rounded-[16px] p-6 border border-line shadow-sm space-y-4">
            <div className="flex items-center space-x-2">
              <Info className="w-5 h-5 text-green-700" />
              <h3 className="font-sora font-bold text-navy-900 text-base">BMI Categories Reference</h3>
            </div>

            <div className="space-y-2">
              {[
                { range: 'Below 18.5', category: 'Underweight', color: 'bg-sky-100 text-sky-800' },
                { range: '18.5 – 24.9', category: 'Normal Weight', color: 'bg-green-100 text-green-800' },
                { range: '25.0 – 29.9', category: 'Overweight', color: 'bg-amber-100 text-amber-800' },
                { range: '30.0+', category: 'Obese', color: 'bg-rose-100 text-rose-800' }
              ].map((item) => (
                <div
                  key={item.category}
                  className="flex items-center justify-between p-3 rounded-xl border border-line bg-[#FAFAF8] text-xs"
                >
                  <span className="font-semibold text-slate-700 font-mono">{item.range}</span>
                  <span className={`px-2.5 py-0.5 rounded-full font-bold font-mono text-[11px] ${item.color}`}>
                    {item.category}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* History Panel */}
          <div className="bg-white rounded-[16px] p-6 border border-line shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-line pb-2">
              <h4 className="font-sora font-bold text-navy-900 text-sm flex items-center space-x-1.5">
                <History className="w-4 h-4 text-slate-500" />
                <span>BMI History Log</span>
              </h4>
              <span className="font-mono text-xs text-slate-400">({history.length})</span>
            </div>

            {history.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {[...history].reverse().map((item) => (
                  <div key={item._id} className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-[#FAFAF8] border border-line">
                    <span className="font-mono font-bold text-navy-900">{item.bmi} ({item.bmiCategory})</span>
                    <span className="font-mono text-slate-400">{item.date}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">No historical BMI records calculated yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BMICalculator;

