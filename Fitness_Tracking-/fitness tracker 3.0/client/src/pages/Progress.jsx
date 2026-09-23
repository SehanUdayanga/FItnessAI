import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import {
  TrendingUp,
  Scale,
  Droplet,
  Flame,
  Calendar,
  Eye,
  ArrowDownRight,
  ArrowUpRight,
  Minus,
  Utensils,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  CalendarDays
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Progress = () => {
  const getTodayISO = () => new Date().toISOString().split('T')[0];

  const [range, setRange] = useState('7days'); // '7days' or '4weeks'
  const [selectedDate, setSelectedDate] = useState(getTodayISO());
  const [progData, setProgData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // History Week View State
  const [currentWeekPage, setCurrentWeekPage] = useState(0);
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' (newest first) or 'asc' (oldest first)

  // Day Details Modal
  const [selectedDayDetails, setSelectedDayDetails] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const fetchProgression = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/progress?range=${range}&date=${selectedDate}`);
      if (res.data.success) {
        setProgData(res.data);
      }
    } catch (err) {
      console.error('Error fetching progress:', err);
      setError('Failed to load progression data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgression();
  }, [range, selectedDate]);

  const handleViewDayDetails = (row) => {
    setSelectedDayDetails(row);
    setIsDetailsModalOpen(true);
  };

  // Format date display for selector DD/MM/YYYY
  const formatDisplayDate = (isoStr) => {
    if (!isoStr) return '';
    const parts = isoStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return isoStr;
  };

  if (loading && !progData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-green-700 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-500 font-medium text-sm">Loading your progression...</p>
        </div>
      </div>
    );
  }

  const {
    summary = {
      currentWeight: 68.5,
      goalWeight: 65.0,
      startingWeight: 72.0,
      toGo: 3.5,
      weightTrend: -0.8,
      avgWater: 2.0,
      goalWater: 2.5,
      waterCompletion: 80,
      avgCalories: 1979,
      goalCalories: 2100
    },
    chartData = [],
    historyTable = []
  } = progData || {};

  const labels = chartData.map((d) => d.label);

  // 1. Weight Chart Data (Actual Weight = Solid FitTrack Green, Goal = Dashed Gray)
  const weightChartConfig = {
    labels,
    datasets: [
      {
        label: 'Actual Weight (kg)',
        data: chartData.map((d) => d.weight),
        borderColor: '#1F6F4F',
        backgroundColor: 'rgba(31, 111, 79, 0.08)',
        borderWidth: 3,
        pointBackgroundColor: '#1F6F4F',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        tension: 0.3,
        fill: false,
        spanGaps: true
      },
      {
        label: 'Goal Weight (kg)',
        data: chartData.map(() => summary.goalWeight),
        borderColor: '#94A3B8',
        borderWidth: 2,
        borderDash: [6, 6],
        pointRadius: 0,
        fill: false
      }
    ]
  };

  const weightChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          boxWidth: 12,
          boxHeight: 12,
          usePointStyle: true,
          font: { family: 'Inter', size: 12 }
        }
      },
      tooltip: {
        backgroundColor: '#0F151C',
        padding: 12,
        titleFont: { family: 'Sora', size: 12 },
        bodyFont: { family: 'IBM Plex Mono', size: 12 },
        cornerRadius: 10,
        displayColors: true
      }
    },
    scales: {
      x: {
        grid: { color: '#E3E9E4', drawBorder: false },
        ticks: { font: { family: 'Inter', size: 11 }, color: '#68737E' }
      },
      y: {
        grid: { color: '#E3E9E4', drawBorder: false },
        ticks: { font: { family: 'IBM Plex Mono', size: 11 }, color: '#68737E' }
      }
    }
  };

  // 2. Water Intake Chart Data (in Liters)
  const waterChartConfig = {
    labels,
    datasets: [
      {
        type: 'bar',
        label: 'Water Intake (L)',
        data: chartData.map((d) => d.water),
        backgroundColor: '#0EA5E9',
        borderRadius: 8,
        barThickness: range === '7days' ? 28 : 12
      },
      {
        type: 'line',
        label: `Goal (${summary.goalWater} L)`,
        data: chartData.map(() => summary.goalWater),
        borderColor: '#68737E',
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0,
        fill: false
      }
    ]
  };

  const waterChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          boxWidth: 12,
          usePointStyle: true,
          font: { family: 'Inter', size: 11 }
        }
      },
      tooltip: {
        backgroundColor: '#0F151C',
        padding: 10,
        titleFont: { family: 'Sora', size: 12 },
        bodyFont: { family: 'IBM Plex Mono', size: 12 },
        cornerRadius: 10
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { family: 'Inter', size: 11 }, color: '#68737E' }
      },
      y: {
        suggestedMax: 3.0,
        grid: { color: '#E3E9E4', drawBorder: false },
        ticks: { font: { family: 'IBM Plex Mono', size: 11 }, color: '#68737E' }
      }
    }
  };

  // 3. Calorie Intake Chart Data
  const calorieChartConfig = {
    labels,
    datasets: [
      {
        type: 'bar',
        label: 'Calorie Intake (kcal)',
        data: chartData.map((d) => d.calories),
        backgroundColor: '#D98A3D',
        borderRadius: 8,
        barThickness: range === '7days' ? 28 : 12
      },
      {
        type: 'line',
        label: `Goal (${summary.goalCalories.toLocaleString()} kcal)`,
        data: chartData.map(() => summary.goalCalories),
        borderColor: '#68737E',
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0,
        fill: false
      }
    ]
  };

  const calorieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          boxWidth: 12,
          usePointStyle: true,
          font: { family: 'Inter', size: 11 }
        }
      },
      tooltip: {
        backgroundColor: '#0F151C',
        padding: 10,
        titleFont: { family: 'Sora', size: 12 },
        bodyFont: { family: 'IBM Plex Mono', size: 12 },
        cornerRadius: 10
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { family: 'Inter', size: 11 }, color: '#68737E' }
      },
      y: {
        suggestedMax: 2500,
        grid: { color: '#E3E9E4', drawBorder: false },
        ticks: { font: { family: 'IBM Plex Mono', size: 11 }, color: '#68737E' }
      }
    }
  };

  return (
    <div className="space-y-8 max-w-[1240px] mx-auto pb-16">
      {/* ==================================================
          10 & 11. HEADING & PROGRESSION FILTERS
          ================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-sora text-2xl md:text-3xl font-bold text-navy-900 tracking-tight">
            Your Progression
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Track your health and fitness progress over time.
          </p>
        </div>

        {/* Filters: [ Last 7 Days ] [ Last 4 Weeks ] and [ 📅 Select Date ] */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex bg-white p-1 rounded-xl border border-line shadow-xs font-inter text-xs">
            <button
              onClick={() => setRange('7days')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                range === '7days'
                  ? 'bg-green-700 text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-navy-900 hover:bg-slate-50'
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setRange('4weeks')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                range === '4weeks'
                  ? 'bg-green-700 text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-navy-900 hover:bg-slate-50'
              }`}
            >
              Last 4 Weeks
            </button>
          </div>

          {/* Functional Date Selector */}
          <div className="relative inline-flex items-center bg-white border border-line rounded-xl px-3.5 py-2 shadow-xs hover:border-green-600 transition-all font-mono text-xs text-navy-900 group">
            <Calendar className="w-3.5 h-3.5 text-green-700 mr-2" />
            <span className="font-medium mr-2">{formatDisplayDate(selectedDate)}</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                if (e.target.value) setSelectedDate(e.target.value);
              }}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              title="Select Anchor Date"
            />
          </div>
        </div>
      </div>

      {/* ==================================================
          12. WEIGHT PROGRESSION CHART (CHART.JS)
          ================================================== */}
      <div className="bg-white rounded-[16px] p-6 border border-line shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-sora font-bold text-navy-900 text-lg">Weight Progress</h3>
            <p className="text-xs text-slate-500">Historical trend compared against target weight</p>
          </div>

          <div className="flex items-center space-x-3 text-xs font-mono">
            <span className="flex items-center space-x-1.5 text-slate-600">
              <span className="w-3 h-3 rounded-full bg-green-700 inline-block" />
              <span>Actual Weight</span>
            </span>
            <span className="flex items-center space-x-1.5 text-slate-500">
              <span className="w-3 h-1 border-t-2 border-dashed border-slate-400 inline-block" />
              <span>Goal Weight</span>
            </span>
          </div>
        </div>

        {/* Chart Canvas */}
        <div className="h-72 w-full pt-2">
          <Line data={weightChartConfig} options={weightChartOptions} />
        </div>

        {/* Four Dedicated Values Below Chart */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 pt-4 border-t border-line">
          <div className="p-3.5 bg-[#FAFAF8] rounded-xl border border-line text-center">
            <span className="text-[11px] font-mono font-semibold text-slate-500 uppercase block mb-0.5">Current</span>
            <span className="font-mono text-lg font-bold text-navy-900">{summary.currentWeight} kg</span>
          </div>

          <div className="p-3.5 bg-[#FAFAF8] rounded-xl border border-line text-center">
            <span className="text-[11px] font-mono font-semibold text-slate-500 uppercase block mb-0.5">Goal</span>
            <span className="font-mono text-lg font-bold text-navy-900">{summary.goalWeight} kg</span>
          </div>

          <div className="p-3.5 bg-[#FAFAF8] rounded-xl border border-line text-center">
            <span className="text-[11px] font-mono font-semibold text-slate-500 uppercase block mb-0.5">Starting</span>
            <span className="font-mono text-lg font-bold text-navy-900">{summary.startingWeight} kg</span>
          </div>

          <div className="p-3.5 bg-green-50 rounded-xl border border-green-200 text-center">
            <span className="text-[11px] font-mono font-semibold text-green-700 uppercase block mb-0.5">To Go</span>
            <span className="font-mono text-lg font-bold text-green-800">{summary.toGo} kg</span>
          </div>

          <div className="col-span-2 sm:col-span-4 lg:col-span-1 p-3.5 bg-[#FAFAF8] rounded-xl border border-line text-center flex flex-col justify-center">
            <span className="text-[11px] font-mono font-semibold text-slate-500 uppercase block mb-0.5">Weight Trend</span>
            <div className="flex items-center justify-center space-x-1 font-mono text-sm font-bold text-green-700">
              {summary.weightTrend <= 0 ? (
                <ArrowDownRight className="w-4 h-4 text-green-600" />
              ) : (
                <ArrowUpRight className="w-4 h-4 text-amber-600" />
              )}
              <span>{summary.weightTrend > 0 ? `+${summary.weightTrend}` : summary.weightTrend} kg</span>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================
          13 & 14. WATER INTAKE & CALORIE INTAKE CHARTS (CHART.JS)
          ================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 13. Water Intake Chart */}
        <div className="bg-white rounded-[16px] p-6 border border-line shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-sky-100 text-sky-700">
                <Droplet className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-sora font-bold text-navy-900 text-base">Water Intake</h3>
                <span className="text-xs text-slate-500">Target: {summary.goalWater} L/day</span>
              </div>
            </div>
          </div>

          <div className="h-60 w-full">
            <Bar data={waterChartConfig} options={waterChartOptions} />
          </div>

          {/* Water Stats Below */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-line text-center">
            <div className="p-2.5 bg-[#FAFAF8] rounded-xl border border-line">
              <span className="text-[10px] font-mono font-semibold text-slate-500 uppercase block">Average</span>
              <span className="font-mono text-sm font-bold text-navy-900">{summary.avgWater} L/day</span>
            </div>
            <div className="p-2.5 bg-[#FAFAF8] rounded-xl border border-line">
              <span className="text-[10px] font-mono font-semibold text-slate-500 uppercase block">Goal</span>
              <span className="font-mono text-sm font-bold text-navy-900">{summary.goalWater} L/day</span>
            </div>
            <div className="p-2.5 bg-sky-50 rounded-xl border border-sky-200">
              <span className="text-[10px] font-mono font-semibold text-sky-700 uppercase block">Completion</span>
              <span className="font-mono text-sm font-bold text-sky-800">{summary.waterCompletion}%</span>
            </div>
          </div>
        </div>

        {/* 14. Calorie Intake Chart */}
        <div className="bg-white rounded-[16px] p-6 border border-line shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-sora font-bold text-navy-900 text-base">Calorie Intake</h3>
                <span className="text-xs text-slate-500">Target: {summary.goalCalories.toLocaleString()} kcal/day</span>
              </div>
            </div>
          </div>

          <div className="h-60 w-full">
            <Bar data={calorieChartConfig} options={calorieChartOptions} />
          </div>

          {/* Calorie Stats Below */}
          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-line text-center">
            <div className="p-2.5 bg-[#FAFAF8] rounded-xl border border-line">
              <span className="text-[10px] font-mono font-semibold text-slate-500 uppercase block">Average</span>
              <span className="font-mono text-sm font-bold text-navy-900">{summary.avgCalories.toLocaleString()} kcal/day</span>
            </div>
            <div className="p-2.5 bg-[#FAFAF8] rounded-xl border border-line">
              <span className="text-[10px] font-mono font-semibold text-slate-500 uppercase block">Goal</span>
              <span className="font-mono text-sm font-bold text-navy-900">{summary.goalCalories.toLocaleString()} kcal/day</span>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================
          15 & 16. HISTORY SECTION (WEEK VIEW & DETAILS MODAL)
          ================================================== */}
      {(() => {
        const sortedHistory = [...historyTable].sort((a, b) => {
          if (sortOrder === 'asc') {
            return (a.date || '').localeCompare(b.date || '');
          }
          return (b.date || '').localeCompare(a.date || '');
        });

        const totalWeeks = Math.max(1, Math.ceil(sortedHistory.length / 7));
        const activeWeek = Math.min(currentWeekPage, totalWeeks - 1);
        const currentWeekRecords = sortedHistory.slice(activeWeek * 7, (activeWeek + 1) * 7);

        const weekWaterAvg = currentWeekRecords.length > 0
          ? (currentWeekRecords.reduce((acc, r) => acc + (parseFloat(r.water) || 0), 0) / currentWeekRecords.length).toFixed(1)
          : '0.0';

        const weekCalAvg = currentWeekRecords.length > 0
          ? Math.round(currentWeekRecords.reduce((acc, r) => acc + (parseInt(String(r.calories).replace(/,/g, '')) || 0), 0) / currentWeekRecords.length)
          : 0;

        return (
          <section className="bg-white rounded-[16px] p-6 border border-line shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-sora font-bold text-navy-900 text-xl">History</h3>
                  <span className="font-mono text-xs font-bold px-2.5 py-0.5 bg-green-100 text-green-700 rounded-full">
                    WEEK VIEW
                  </span>
                </div>
                <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                  Showing 7-day weekly log chunks for easy review and sorting.
                </p>
              </div>

              {/* Controls: Week Navigation & Sort Toggle */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Sort Toggle */}
                <button
                  type="button"
                  onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#FAFAF8] hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl border border-line shadow-xs transition-colors"
                  title="Toggle Sort Order"
                >
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                  <span>{sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}</span>
                </button>

                {/* Week Pagination */}
                <div className="flex items-center space-x-1 bg-[#FAFAF8] border border-line p-1 rounded-xl shadow-xs">
                  <button
                    type="button"
                    onClick={() => setCurrentWeekPage((prev) => Math.max(0, prev - 1))}
                    disabled={activeWeek === 0}
                    className="p-1.5 text-slate-600 hover:text-navy-900 disabled:opacity-30 disabled:hover:text-slate-600 rounded-lg hover:bg-white transition-colors"
                    title="Previous Week"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <span className="font-mono text-xs font-semibold px-2.5 text-navy-900 whitespace-nowrap">
                    Week {activeWeek + 1} of {totalWeeks}
                  </span>

                  <button
                    type="button"
                    onClick={() => setCurrentWeekPage((prev) => Math.min(totalWeeks - 1, prev + 1))}
                    disabled={activeWeek >= totalWeeks - 1}
                    className="p-1.5 text-slate-600 hover:text-navy-900 disabled:opacity-30 disabled:hover:text-slate-600 rounded-lg hover:bg-white transition-colors"
                    title="Next Week"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Week Summary Badge Ribbon */}
            {currentWeekRecords.length > 0 && (
              <div className="flex flex-wrap items-center gap-3 p-3 bg-[#FAFAF8] rounded-xl border border-line text-xs font-inter">
                <span className="font-mono font-semibold text-slate-500">
                  📅 {currentWeekRecords[0]?.formattedDate} – {currentWeekRecords[currentWeekRecords.length - 1]?.formattedDate}
                </span>
                <span className="text-slate-300">|</span>
                <span className="text-slate-600">
                  Avg Water: <strong className="font-mono text-sky-700">{weekWaterAvg} L/day</strong>
                </span>
                <span className="text-slate-300">|</span>
                <span className="text-slate-600">
                  Avg Calories: <strong className="font-mono text-amber-700">{weekCalAvg.toLocaleString()} kcal/day</strong>
                </span>
                <span className="ml-auto font-mono text-[11px] text-slate-400">
                  ({currentWeekRecords.length} days in this view)
                </span>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-inter text-xs">
                <thead>
                  <tr className="border-b border-line bg-[#FAFAF8] text-slate-500 font-mono text-[11px] uppercase tracking-wider">
                    <th className="py-3.5 px-4 font-semibold">Date</th>
                    <th className="py-3.5 px-4 font-semibold">Weight</th>
                    <th className="py-3.5 px-4 font-semibold">Water</th>
                    <th className="py-3.5 px-4 font-semibold">Calories</th>
                    <th className="py-3.5 px-4 font-semibold">Meals</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/70">
                  {currentWeekRecords.length > 0 ? (
                    currentWeekRecords.map((row) => (
                      <tr key={row.date} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-semibold text-navy-900 whitespace-nowrap">
                          {row.formattedDate}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-medium text-slate-700 whitespace-nowrap">
                          {row.weight}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-medium text-sky-700 whitespace-nowrap">
                          {row.water}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-medium text-amber-700 whitespace-nowrap">
                          {row.calories}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-600 whitespace-nowrap">
                          {row.mealsCount}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => handleViewDayDetails(row)}
                            className="inline-flex items-center space-x-1 px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 font-semibold text-xs rounded-lg transition-colors border border-green-200"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Details</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-slate-400 text-xs">
                        No historical logs found for this period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        );
      })()}

      {/* ==================================================
          DAY DETAILS MODAL
          ================================================== */}
      {selectedDayDetails && (
        <Modal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          title={`Day Records: ${selectedDayDetails.formattedDate}`}
        >
          <div className="space-y-5">
            {/* Quick Metrics Header */}
            <div className="grid grid-cols-3 gap-2 text-center font-mono">
              <div className="p-3 bg-[#FAFAF8] rounded-xl border border-line">
                <span className="text-[10px] text-slate-500 uppercase block">Weight</span>
                <span className="text-sm font-bold text-navy-900">{selectedDayDetails.weight}</span>
              </div>
              <div className="p-3 bg-sky-50 rounded-xl border border-sky-200">
                <span className="text-[10px] text-sky-700 uppercase block">Water</span>
                <span className="text-sm font-bold text-sky-800">{selectedDayDetails.water}</span>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                <span className="text-[10px] text-amber-700 uppercase block">Calories</span>
                <span className="text-sm font-bold text-amber-800">{selectedDayDetails.calories}</span>
              </div>
            </div>

            {/* Meals Detailed Breakdown */}
            <div>
              <div className="flex items-center space-x-2 mb-2.5">
                <Utensils className="w-4 h-4 text-green-700" />
                <h4 className="font-sora font-bold text-navy-900 text-sm">Meals Logged</h4>
              </div>

              {selectedDayDetails.meals && selectedDayDetails.meals.length > 0 ? (
                <div className="divide-y divide-line/70 bg-[#FAFAF8] rounded-xl border border-line px-3.5 py-1">
                  {selectedDayDetails.meals.map((meal, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-green-700 uppercase block">
                          {meal.mealType}
                        </span>
                        <span className="text-xs font-semibold text-navy-900">{meal.foodName}</span>
                        {meal.quantity && (
                          <span className="text-[11px] text-slate-500 ml-2 font-normal">({meal.quantity})</span>
                        )}
                      </div>
                      <span className="font-mono text-xs font-bold text-navy-900">{meal.calories} kcal</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic bg-[#FAFAF8] p-3 rounded-xl border border-dashed border-line">
                  No individual meals logged for this day.
                </p>
              )}
            </div>

            {/* Hydration Logs Breakdown */}
            {selectedDayDetails.waterLogs && selectedDayDetails.waterLogs.length > 0 && (
              <div>
                <div className="flex items-center space-x-2 mb-2.5">
                  <Droplet className="w-4 h-4 text-sky-600" />
                  <h4 className="font-sora font-bold text-navy-900 text-sm">Hydration Logs</h4>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {selectedDayDetails.waterLogs.map((log, idx) => (
                    <div key={idx} className="p-2 bg-sky-50 rounded-lg border border-sky-100 text-center font-mono text-xs text-sky-800 font-semibold">
                      +{log.amount} ml
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Progress;

