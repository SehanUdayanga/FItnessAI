import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Modal from '../components/Modal';
import {
  Calendar,
  Plus,
  Droplet,
  PlusCircle,
  Bot,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Utensils,
  Trash2,
  Edit2,
  Calculator,
  Settings,
  Flame,
  Send,
  AlertTriangle,
  AlertCircle
} from 'lucide-react';

const Dashboard = () => {
  const getTodayISO = () => new Date().toISOString().split('T')[0];

  const [selectedDate, setSelectedDate] = useState(getTodayISO());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals state
  const [isWaterModalOpen, setIsWaterModalOpen] = useState(false);
  const [isEditWaterLogModalOpen, setIsEditWaterLogModalOpen] = useState(false);
  const [isWaterGoalModalOpen, setIsWaterGoalModalOpen] = useState(false);
  const [isCalorieGoalModalOpen, setIsCalorieGoalModalOpen] = useState(false);
  const [isMealModalOpen, setIsMealModalOpen] = useState(false);
  const [isBMIModalOpen, setIsBMIModalOpen] = useState(false);

  // Forms
  const [waterAmount, setWaterAmount] = useState(250);
  const [editingWaterLog, setEditingWaterLog] = useState(null);
  const [newWaterGoalLiters, setNewWaterGoalLiters] = useState(2.5);
  const [newCalorieGoal, setNewCalorieGoal] = useState(2100);

  const [editingMeal, setEditingMeal] = useState(null);
  const [mealType, setMealType] = useState('Breakfast');
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('');
  const [portion, setPortion] = useState('1 serving');

  // BMI Tool modal state
  const [bmiHeight, setBmiHeight] = useState(175);
  const [bmiWeight, setBmiWeight] = useState(68.5);
  const [bmiResult, setBmiResult] = useState(null);

  // Weight section state
  const [weightInput, setWeightInput] = useState('');
  const [weightSavedFeedback, setWeightSavedFeedback] = useState(false);
  const [isSavingWeight, setIsSavingWeight] = useState(false);

  // Embedded AI Chat State
  const [aiMessages, setAiMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: "Hi! I'm your FitTrack AI assistant 👋\nAsk me anything about your meals, water intake, weight progress, or tailored fitness suggestions."
    }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const chatBottomRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMessages, isAiTyping]);

  const handleSendAiMessage = async (textToSend) => {
    const message = textToSend || aiInput;
    if (!message || !message.trim() || isAiTyping) return;

    const userMsg = { id: Date.now(), sender: 'user', text: message.trim() };
    setAiMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setAiInput('');
    setIsAiTyping(true);

    try {
      const res = await api.post('/assistant/chat', { message: message.trim() });
      if (res.data && res.data.success) {
        const reply = res.data.message || res.data.data?.message;
        setAiMessages((prev) => [
          ...prev,
          { id: Date.now() + 1, sender: 'ai', text: reply }
        ]);
      } else {
        setAiMessages((prev) => [
          ...prev,
          { id: Date.now() + 1, sender: 'ai', text: "I'm having trouble connecting right now. Please try again in a moment." }
        ]);
      }
    } catch (err) {
      setAiMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, sender: 'ai', text: "I couldn't reach the AI service. Please verify your connection or backend setup." }
      ]);
    } finally {
      setIsAiTyping(false);
    }
  };

  const fetchDashboardData = async (dateStr) => {
    try {
      setLoading(true);
      const queryDate = dateStr || selectedDate;
      const res = await api.get(`/dashboard?date=${queryDate}`);
      if (res.data.success) {
        setData(res.data.data);
        setWeightInput(res.data.data.currentWeight.toString());
        setBmiWeight(res.data.data.currentWeight);
        setNewWaterGoalLiters((res.data.data.waterGoal / 1000).toFixed(1));
        setNewCalorieGoal(res.data.data.calorieGoal);
      }
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setError('Failed to load dashboard data. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(selectedDate);
  }, [selectedDate]);

  const formatDisplayDate = (isoStr) => {
    if (!isoStr) return '';
    const parts = isoStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return isoStr;
  };

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    if (newDate) {
      setSelectedDate(newDate);
    }
  };

  // Water Actions
  const handleAddWater = async (e) => {
    e.preventDefault();
    try {
      await api.post('/water', {
        amount: Number(waterAmount),
        date: selectedDate
      });
      setIsWaterModalOpen(false);
      fetchDashboardData(selectedDate);
    } catch (err) {
      alert('Error logging water intake');
    }
  };

  const handleOpenEditWaterLog = (log) => {
    setEditingWaterLog(log);
    setWaterAmount(log.amount);
    setIsEditWaterLogModalOpen(true);
  };

  const handleSaveEditWaterLog = async (e) => {
    e.preventDefault();
    if (!editingWaterLog || !waterAmount) return;
    try {
      await api.put(`/water/${editingWaterLog._id}`, {
        amount: Number(waterAmount)
      });
      setIsEditWaterLogModalOpen(false);
      setEditingWaterLog(null);
      fetchDashboardData(selectedDate);
    } catch (err) {
      alert('Error updating water log');
    }
  };

  const handleDeleteWater = async (id) => {
    if (!window.confirm('Delete this water entry?')) return;
    try {
      await api.delete(`/water/${id}`);
      fetchDashboardData(selectedDate);
    } catch (err) {
      alert('Error deleting water log');
    }
  };

  // Water Goal Update
  const handleSaveWaterGoal = async (e) => {
    e.preventDefault();
    const mlAmount = Math.round(Number(newWaterGoalLiters) * 1000);
    if (isNaN(mlAmount) || mlAmount <= 0) {
      alert('Please enter a valid water goal in Liters');
      return;
    }
    try {
      await api.put('/profile', { waterGoal: mlAmount });
      setIsWaterGoalModalOpen(false);
      fetchDashboardData(selectedDate);
    } catch (err) {
      alert('Failed to update water goal.');
    }
  };

  // Calorie Limit Update
  const handleSaveCalorieGoal = async (e) => {
    e.preventDefault();
    const cal = Number(newCalorieGoal);
    if (isNaN(cal) || cal <= 0) {
      alert('Please enter a valid calorie target');
      return;
    }
    try {
      await api.put('/profile', { calorieGoal: cal });
      setIsCalorieGoalModalOpen(false);
      fetchDashboardData(selectedDate);
    } catch (err) {
      alert('Failed to update calorie limit.');
    }
  };

  // Meal Actions
  const handleOpenAddMeal = () => {
    setEditingMeal(null);
    setMealType('Breakfast');
    setFoodName('');
    setCalories('');
    setPortion('1 serving');
    setIsMealModalOpen(true);
  };

  const handleOpenEditMeal = (meal) => {
    setEditingMeal(meal);
    setMealType(meal.mealType);
    setFoodName(meal.foodName);
    setCalories(meal.calories.toString());
    setPortion(meal.quantity || '1 serving');
    setIsMealModalOpen(true);
  };

  const handleSaveMeal = async (e) => {
    e.preventDefault();
    if (!foodName || !calories) return;
    try {
      if (editingMeal && editingMeal._id) {
        await api.put(`/meals/${editingMeal._id}`, {
          mealType,
          foodName,
          calories: Number(calories),
          quantity: portion || '1 serving',
          date: selectedDate
        });
      } else {
        await api.post('/meals', {
          mealType,
          foodName,
          calories: Number(calories),
          quantity: portion || '1 serving',
          date: selectedDate
        });
      }
      setIsMealModalOpen(false);
      setFoodName('');
      setCalories('');
      fetchDashboardData(selectedDate);
    } catch (err) {
      alert('Error saving meal');
    }
  };

  const handleDeleteMeal = async (id) => {
    if (!window.confirm('Delete this meal entry?')) return;
    try {
      await api.delete(`/meals/${id}`);
      fetchDashboardData(selectedDate);
    } catch (err) {
      alert('Error deleting meal');
    }
  };

  const handleSaveWeight = async (e) => {
    e.preventDefault();
    if (!weightInput || isNaN(weightInput) || Number(weightInput) <= 0) {
      alert('Please enter a valid weight number in kg');
      return;
    }
    try {
      setIsSavingWeight(true);
      await api.post('/weight', {
        weight: Number(weightInput),
        date: selectedDate
      });
      setWeightSavedFeedback(true);
      setTimeout(() => setWeightSavedFeedback(false), 4000);
      fetchDashboardData(selectedDate);
    } catch (err) {
      alert('Error updating weight');
    } finally {
      setIsSavingWeight(false);
    }
  };

  const handleCalculateBMI = (e) => {
    e.preventDefault();
    if (!bmiHeight || !bmiWeight) return;
    const hMeters = Number(bmiHeight) / 100;
    const calculated = parseFloat((Number(bmiWeight) / (hMeters * hMeters)).toFixed(1));
    let cat = 'Healthy';
    if (calculated < 18.5) cat = 'Underweight';
    else if (calculated >= 18.5 && calculated <= 24.9) cat = 'Healthy';
    else if (calculated >= 25 && calculated <= 29.9) cat = 'Overweight';
    else if (calculated >= 30) cat = 'Obese';

    setBmiResult({ bmi: calculated, category: cat });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-green-700 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-500 font-medium text-sm">Loading your FitTrack dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-center space-y-3">
        <p className="font-semibold">{error}</p>
        <button
          onClick={() => fetchDashboardData(selectedDate)}
          className="px-4 py-2 bg-rose-600 text-white font-semibold text-xs rounded-xl hover:bg-rose-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  const {
    userName = 'Alex',
    currentWeight = 68.5,
    startingWeight = 72.0,
    targetWeight = 65.0,
    toGo = 3.5,
    weightChange = -0.8,
    bmi = 22.4,
    bmiCategory = 'Healthy',
    todayCalories = 1420,
    calorieGoal = 2100,
    todayWater = 1800,
    waterGoal = 2500,
    waterLogs = [],
    recentMeals = []
  } = data || {};

  const waterInLiters = (todayWater / 1000).toFixed(1);
  const waterGoalLiters = (waterGoal / 1000).toFixed(1);
  const waterPercentage = Math.min(Math.round((todayWater / waterGoal) * 100), 100);
  const waterRemainingMl = Math.max(0, waterGoal - todayWater);
  const waterRemainingL = (waterRemainingMl / 1000).toFixed(1);

  // Time-aware 2-stage Hydration Alert System (18:00 Evening, 22:00 Urgent Night)
  const isToday = selectedDate === getTodayISO();
  const currentHour = new Date().getHours();

  let waterAlert = {
    type: 'normal',
    badge: `${waterPercentage}%`,
    badgeClass: 'bg-sky-100 text-sky-700',
    cardBorderClass: 'border-line',
    message: null
  };

  if (todayWater >= waterGoal) {
    waterAlert = {
      type: 'success',
      badge: '✓ 100% Goal Met',
      badgeClass: 'bg-green-100 text-green-700',
      cardBorderClass: 'border-green-300 ring-1 ring-green-100',
      message: null
    };
  } else if (isToday) {
    if (currentHour >= 22) { // 22:00+ (10 PM) -> Stage 2 Critical Alert
      waterAlert = {
        type: 'critical',
        badge: '🚨 Critical (22h+)',
        badgeClass: 'bg-rose-100 text-rose-800 border border-rose-200 animate-pulse font-bold',
        cardBorderClass: 'border-rose-400 ring-2 ring-rose-100 bg-rose-50/20',
        message: `🚨 Critical Hydration Alert (10:00 PM): Only ~2 hours left today! Drink ${waterRemainingMl} ml (${waterRemainingL} L) to complete your ${waterGoalLiters} L goal.`
      };
    } else if (currentHour >= 18) { // 18:00+ (6 PM) -> Stage 1 Evening Alert
      waterAlert = {
        type: 'warning',
        badge: '⚠️ Reminder (18h+)',
        badgeClass: 'bg-amber-100 text-amber-800 border border-amber-200 font-bold',
        cardBorderClass: 'border-amber-400 ring-2 ring-amber-50 bg-amber-50/20',
        message: `⚠️ Evening Hydration Reminder (6:00 PM): You have ${waterRemainingMl} ml (${waterRemainingL} L) left to reach your ${waterGoalLiters} L goal before bed.`
      };
    }
  } else if (selectedDate < getTodayISO() && todayWater < waterGoal) {
    waterAlert = {
      type: 'missed',
      badge: '⚠️ Goal Missed',
      badgeClass: 'bg-slate-100 text-slate-600',
      cardBorderClass: 'border-line',
      message: `Incomplete record: Ended ${waterRemainingMl} ml (${waterRemainingL} L) below the ${waterGoalLiters} L target.`
    };
  }

  const aiGuidanceText = todayWater >= waterGoal
    ? "Great job hitting your hydration goal today! Your calorie intake is well balanced. Keep up this momentum tomorrow."
    : "You're doing well with hydration today. Your activity level is also on track. Consider adding a short evening walk to reach your daily activity goal.";

  return (
    <div id="dashboard-overview" className="space-y-6 max-w-[1240px] mx-auto pb-12">
      {/* ==================================================
          1. TOP DASHBOARD HEADER & COMPACT DATE SELECTOR
          ================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-sora text-2xl md:text-3xl font-bold text-navy-900 tracking-tight">
            {getGreeting()}, <span className="text-green-700">{userName}</span> 👋
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Here's your health overview for today.
          </p>
        </div>

        {/* COMPACT FUNCTIONAL DATE SELECTOR [ 📅 09/01/2026 ▣ ] */}
        <div className="relative inline-flex items-center bg-white border border-[#E3E9E4] rounded-xl px-3.5 py-2 shadow-xs hover:border-green-600 transition-all font-mono text-xs text-navy-900 group">
          <Calendar className="w-4 h-4 text-green-700 mr-2.5 flex-shrink-0" />
          <span className="font-semibold tracking-wide mr-3">{formatDisplayDate(selectedDate)}</span>
          <span className="text-slate-400 group-hover:text-green-700 text-xs">▣</span>
          <input
            type="date"
            id="dashboard-date-selector"
            value={selectedDate}
            onChange={handleDateChange}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            title="Select Date"
          />
        </div>
      </div>

      {/* ==================================================
          1. EXISTING FOUR SUMMARY CARDS (STRICTLY PRESERVED)
          ================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. BMI Card (with Tool trigger) */}
        <div className="p-5 rounded-[16px] bg-white border border-line shadow-xs hover:shadow-sm transition-all group relative">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono">BMI</span>
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => setIsBMIModalOpen(true)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono text-green-700 hover:underline flex items-center"
                title="Open BMI Tool"
              >
                <Calculator className="w-3 h-3 mr-0.5" />
                <span>Calc</span>
              </button>
              <span className="font-mono text-[11px] font-bold text-green-700 bg-green-100 px-2.5 py-0.5 rounded-full">
                {bmiCategory}
              </span>
            </div>
          </div>
          <div className="font-mono text-2xl font-bold text-navy-900 tracking-tight">{bmi}</div>
          <div className="text-xs text-slate-500 mt-1">Healthy target: 18.5 – 24.9</div>
        </div>

        {/* 2. Weight Card */}
        <div className="p-5 rounded-[16px] bg-white border border-line shadow-xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono">Weight</span>
            <span className="font-mono text-[11px] font-bold text-green-700 bg-green-100 px-2.5 py-0.5 rounded-full">
              {weightChange > 0 ? `+${weightChange}` : `${weightChange}`}kg
            </span>
          </div>
          <div className="font-mono text-2xl font-bold text-navy-900 tracking-tight">
            {currentWeight} <span className="text-xs font-normal text-slate-500">kg</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">Target: {targetWeight} kg</div>
        </div>

        {/* 3. Water Card with Time-Aware Alerts */}
        <div className={`p-5 rounded-[16px] bg-white border ${waterAlert.cardBorderClass} shadow-xs hover:shadow-sm transition-all relative group`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono flex items-center gap-1">
              <Droplet className="w-3.5 h-3.5 text-sky-500" />
              <span>Water</span>
            </span>
            <span className={`font-mono text-[11px] px-2.5 py-0.5 rounded-full transition-all ${waterAlert.badgeClass}`}>
              {waterAlert.badge}
            </span>
          </div>
          <div className="font-mono text-2xl font-bold text-navy-900 tracking-tight">
            {waterInLiters} / {waterGoalLiters} <span className="text-xs font-normal text-slate-500">L</span>
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
            <span>Goal: {waterGoalLiters} L</span>
            {waterRemainingMl > 0 && isToday && (
              <span className={`font-mono text-[11px] font-semibold ${
                waterAlert.type === 'critical' ? 'text-rose-600' : waterAlert.type === 'warning' ? 'text-amber-700' : 'text-slate-400'
              }`}>
                -{waterRemainingMl}ml
              </span>
            )}
          </div>
        </div>

        {/* 4. Calories Card */}
        <div className="p-5 rounded-[16px] bg-white border border-line shadow-xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono">Calories</span>
            <span className="font-mono text-[11px] font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
              of {calorieGoal.toLocaleString()}
            </span>
          </div>
          <div className="font-mono text-2xl font-bold text-navy-900 tracking-tight">
            {todayCalories.toLocaleString()} <span className="text-xs font-normal text-slate-500">kcal</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">Daily Target: {calorieGoal.toLocaleString()} kcal</div>
        </div>
      </div>

      {/* ==================================================
          NEW DASHBOARD ORDER BELOW THE FOUR SUMMARY CARDS:
          1. Today's Meals
          2. Daily Water Intake
          3. Weight Progress / Weight Input
          4. AI Health Assistant
          ================================================== */}

      {/* 1 & 2. TODAY'S MEALS (LEFT) AND DAILY WATER INTAKE (RIGHT) SIDE BY SIDE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* 1. TODAY'S MEALS (LEFT) */}
        <section id="meals-section" className="bg-white rounded-[16px] p-6 border border-line shadow-xs space-y-4 h-full flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-3">
                <h3 className="font-sora font-bold text-navy-900 text-lg">Today's Meals</h3>
                <span className="font-mono text-xs font-bold px-2.5 py-0.5 bg-green-100 text-green-700 rounded-full">
                  {recentMeals.length} LOGGED
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsCalorieGoalModalOpen(true)}
                  className="flex items-center space-x-1 px-3 py-2 bg-[#FAFAF8] hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl border border-line shadow-xs transition-colors"
                  title="Setup Calorie Limit"
                >
                  <Settings className="w-3.5 h-3.5 text-amber-600" />
                  <span>Set Limit ({calorieGoal} kcal)</span>
                </button>

                <button
                  onClick={handleOpenAddMeal}
                  className="flex items-center space-x-1.5 px-3.5 py-2 bg-green-700 hover:bg-green-600 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Meal</span>
                </button>
              </div>
            </div>

            {recentMeals.length > 0 ? (
              <div className="divide-y divide-line/70 max-h-[300px] overflow-y-auto pr-1">
                {recentMeals.map((meal) => (
                  <div key={meal._id || meal.foodName} className="py-3 flex items-center justify-between gap-4 group">
                    <div>
                      <span className="text-[11px] font-mono font-bold text-slate-500 uppercase block">
                        {meal.mealType}
                      </span>
                      <div className="flex items-baseline space-x-2">
                        <p className="font-semibold text-navy-900 text-sm mt-0.5">{meal.foodName}</p>
                        {meal.quantity && (
                          <span className="text-xs text-slate-400 font-normal">({meal.quantity})</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="font-mono text-sm font-bold text-navy-900 whitespace-nowrap">
                        {meal.calories} <span className="text-xs font-normal text-slate-500">kcal</span>
                      </div>

                      {meal._id && (
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleOpenEditMeal(meal)}
                            className="p-1.5 text-slate-400 hover:text-green-700 rounded-lg hover:bg-green-50 transition-colors"
                            title="Edit Meal"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteMeal(meal._id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                            title="Delete Meal"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400 text-xs bg-[#FAFAF8] rounded-[12px] border border-dashed border-line">
                No meals logged for this date. Click "+ Add Meal" to record your intake.
              </div>
            )}
          </div>

          {/* Bottom Total Intake */}
          <div className="pt-3 border-t border-line flex items-center justify-between text-sm mt-auto">
            <span className="text-slate-600 font-medium">Total Intake</span>
            <span className="font-mono font-bold text-navy-900">
              {todayCalories.toLocaleString()} / {calorieGoal.toLocaleString()} kcal
            </span>
          </div>
        </section>

        {/* 2. DAILY WATER INTAKE (RIGHT) */}
        <section id="water-section" className={`bg-white rounded-[16px] p-6 border ${waterAlert.cardBorderClass} shadow-xs space-y-4 h-full flex flex-col justify-between transition-all`}>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <h3 className="font-sora font-bold text-navy-900 text-lg">Daily Water Intake</h3>
                <button
                  onClick={() => setIsWaterGoalModalOpen(true)}
                  className="text-xs font-mono font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 px-2 py-0.5 rounded-md flex items-center space-x-1 transition-colors"
                  title="Edit Water Goal Target"
                >
                  <span>GOAL {waterGoalLiters} L</span>
                  <Edit2 className="w-3 h-3 text-sky-600 ml-0.5" />
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setEditingWaterLog(null);
                    setWaterAmount(250);
                    setIsWaterModalOpen(true);
                  }}
                  className="flex items-center space-x-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Water</span>
                </button>
              </div>
            </div>

            {/* Smart Hydration Alert Notification Banner (18:00 Evening & 22:00 Critical Night) */}
            {waterAlert.message && (
              <div className={`p-3 rounded-xl border flex items-start justify-between gap-3 text-xs font-inter leading-relaxed ${
                waterAlert.type === 'critical'
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : waterAlert.type === 'warning'
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}>
                <div className="flex items-start space-x-2.5">
                  {waterAlert.type === 'critical' ? (
                    <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5 animate-pulse" />
                  ) : waterAlert.type === 'warning' ? (
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Droplet className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                  )}
                  <span>{waterAlert.message}</span>
                </div>
                {isToday && waterRemainingMl > 0 && (
                  <button
                    onClick={async () => {
                      await api.post('/water', { amount: 250, date: selectedDate });
                      fetchDashboardData(selectedDate);
                    }}
                    className={`font-mono text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap shadow-xs ${
                      waterAlert.type === 'critical'
                        ? 'bg-rose-600 hover:bg-rose-700 text-white'
                        : 'bg-amber-600 hover:bg-amber-700 text-white'
                    }`}
                  >
                    +250 ml Catch Up
                  </button>
                )}
              </div>
            )}

            <div className="flex items-baseline justify-between pt-1">
              <div className="font-mono text-2xl font-bold text-navy-900">
                {waterInLiters} / {waterGoalLiters} <span className="text-sm font-normal text-slate-500">L</span>
              </div>
              <span className="font-mono text-xs font-bold text-sky-700">
                {waterPercentage}% complete
              </span>
            </div>

            {/* Milestone Progress Bar */}
            <div className="space-y-2">
              <div className="w-full bg-[#FAFAF8] border border-line rounded-full h-3.5 overflow-hidden p-0.5">
                <div
                  className="bg-sky-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${waterPercentage}%` }}
                />
              </div>

              {/* Milestones */}
              <div className="flex justify-between text-[10px] font-mono text-slate-400 px-0.5">
                <span>250ml</span>
                <span>500ml</span>
                <span>750ml</span>
                <span>1L</span>
                <span>1.5L</span>
                <span>2L</span>
                <span>2.5L</span>
              </div>
            </div>

            {/* Quick Add Buttons */}
            <div className="pt-1 flex flex-wrap gap-2 items-center">
              {[250, 500].map((amt) => (
                <button
                  key={amt}
                  onClick={async () => {
                    await api.post('/water', { amount: amt, date: selectedDate });
                    fetchDashboardData(selectedDate);
                  }}
                  className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 font-semibold text-xs rounded-lg flex items-center space-x-1 transition-colors font-mono"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-sky-500" />
                  <span>+{amt} ml</span>
                </button>
              ))}
            </div>

            {/* Individual Water Entries with Edit/Delete */}
            {waterLogs && waterLogs.length > 0 && (
              <div className="pt-3 border-t border-line space-y-2">
                <span className="text-[11px] font-mono font-semibold text-slate-500 uppercase block">
                  Logged Entries for this Date ({waterLogs.length})
                </span>
                <div className="grid grid-cols-2 gap-2 max-h-[140px] overflow-y-auto pr-1">
                  {waterLogs.map((log) => (
                    <div
                      key={log._id}
                      className="p-2 bg-[#FAFAF8] border border-line rounded-xl flex items-center justify-between group"
                    >
                      <span className="font-mono text-xs font-bold text-navy-900">+{log.amount} ml</span>
                      <div className="flex items-center space-x-0.5">
                        <button
                          onClick={() => handleOpenEditWaterLog(log)}
                          className="p-1 text-slate-400 hover:text-sky-600 rounded"
                          title="Edit Log"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteWater(log._id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                          title="Delete Log"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* 3. WEIGHT PROGRESS / WEIGHT INPUT */}
      <section id="weight-section" className="bg-white rounded-[16px] p-6 border border-line shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-sora font-bold text-navy-900 text-lg">Weight Progress</h3>
            <p className="text-xs text-slate-500 mt-0.5">Monitor and record your body weight milestones</p>
          </div>
          <button
            onClick={() => navigate('/progress')}
            className="text-xs font-semibold text-green-700 hover:underline flex items-center space-x-1"
          >
            <span>View Full Trends</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Four Dedicated Stat Values */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 bg-[#FAFAF8] border border-line rounded-xl text-center">
            <span className="text-[11px] font-mono font-semibold text-slate-500 uppercase block mb-1">Current</span>
            <div className="font-mono text-xl font-bold text-navy-900">{currentWeight} <span className="text-xs font-normal">kg</span></div>
          </div>

          <div className="p-4 bg-[#FAFAF8] border border-line rounded-xl text-center">
            <span className="text-[11px] font-mono font-semibold text-slate-500 uppercase block mb-1">Goal</span>
            <div className="font-mono text-xl font-bold text-navy-900">{targetWeight} <span className="text-xs font-normal">kg</span></div>
          </div>

          <div className="p-4 bg-[#FAFAF8] border border-line rounded-xl text-center">
            <span className="text-[11px] font-mono font-semibold text-slate-500 uppercase block mb-1">Starting</span>
            <div className="font-mono text-xl font-bold text-navy-900">{startingWeight} <span className="text-xs font-normal">kg</span></div>
          </div>

          <div className="p-4 bg-green-50 border border-green-200/80 rounded-xl text-center">
            <span className="text-[11px] font-mono font-semibold text-green-700 uppercase block mb-1">To Go</span>
            <div className="font-mono text-xl font-bold text-green-800">{toGo} <span className="text-xs font-normal">kg</span></div>
          </div>
        </div>

        {/* Weight Input Box */}
        <div className="pt-2 border-t border-line">
          <form onSubmit={handleSaveWeight} className="space-y-3 max-w-md">
            <label htmlFor="weight-input-field" className="block text-xs font-semibold text-slate-700 uppercase font-mono">
              Today's Weight
            </label>

            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <input
                  id="weight-input-field"
                  type="number"
                  step="0.1"
                  min="20"
                  max="300"
                  required
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                  placeholder="e.g. 68.5"
                  className="w-full px-4 py-2.5 rounded-xl border border-line focus:ring-2 focus:ring-green-600 focus:border-green-600 text-sm font-mono bg-[#FAFAF8]"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-500">
                  kg
                </span>
              </div>

              <button
                type="submit"
                disabled={isSavingWeight}
                className="px-5 py-2.5 bg-green-700 hover:bg-green-600 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors whitespace-nowrap disabled:opacity-50"
              >
                {isSavingWeight ? 'Saving...' : 'Save Weight'}
              </button>
            </div>

            {weightSavedFeedback && (
              <div className="flex items-center space-x-1.5 text-xs text-green-700 font-semibold pt-1">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>✓ Weight updated today</span>
              </div>
            )}
          </form>
        </div>
      </section>

      {/* 4. AI HEALTH ASSISTANT GUIDANCE CARD */}
      <section
        id="ai-assistant-section"
        className="bg-navy-900 text-white rounded-[16px] p-6 shadow-md border border-line-dark relative overflow-hidden space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-green-400/20 flex items-center justify-center text-green-400">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-sora font-bold text-white text-base">AI Health Assistant</h3>
              <p className="text-xs text-[#9AA6AC]">Personalized guidance based on your nutrition, weight, and hydration.</p>
            </div>
          </div>
          <span className="ai-pulse w-2.5 h-2.5 rounded-full bg-green-400" />
        </div>

        <p className="text-xs sm:text-sm text-[#E7EBEA] leading-relaxed bg-navy-800/60 p-4 rounded-xl border border-line-dark/50">
          "{aiGuidanceText}"
        </p>

        <div>
          <button
            onClick={() => window.dispatchEvent(new Event('open-ai-chat'))}
            className="px-4 py-2.5 bg-green-700 hover:bg-green-600 text-white font-sora font-semibold text-xs rounded-xl inline-flex items-center space-x-2 transition-colors shadow-xs"
          >
            <span>Open AI Chat Assistant</span>
            <Sparkles className="w-3.5 h-3.5 text-green-300" />
          </button>
        </div>
      </section>

      {/* ==================================================
          MODALS FOR FUNCTIONAL LOGGING & TOOLS
          ================================================== */}
      {/* 1. Add Water Modal */}
      <Modal isOpen={isWaterModalOpen} onClose={() => setIsWaterModalOpen(false)} title="Log Water Intake">
        <form onSubmit={handleAddWater} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1 font-mono">
              Water Amount (ml)
            </label>
            <input
              type="number"
              required
              min="50"
              max="3000"
              value={waterAmount}
              onChange={(e) => setWaterAmount(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-line focus:ring-2 focus:ring-sky-500 text-sm font-mono bg-[#FAFAF8]"
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[250, 500, 750].map((val) => (
              <button
                type="button"
                key={val}
                onClick={() => setWaterAmount(val)}
                className="py-2 bg-sky-50 text-sky-700 rounded-lg text-xs font-bold hover:bg-sky-100 font-mono"
              >
                {val} ml
              </button>
            ))}
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-sm transition-colors"
          >
            Save Water Log
          </button>
        </form>
      </Modal>

      {/* 1b. Edit Water Log Modal */}
      <Modal
        isOpen={isEditWaterLogModalOpen}
        onClose={() => setIsEditWaterLogModalOpen(false)}
        title="Edit Water Entry"
      >
        <form onSubmit={handleSaveEditWaterLog} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1 font-mono">
              Water Amount (ml)
            </label>
            <input
              type="number"
              required
              min="50"
              max="3000"
              value={waterAmount}
              onChange={(e) => setWaterAmount(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-line focus:ring-2 focus:ring-sky-500 text-sm font-mono bg-[#FAFAF8]"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-sm transition-colors"
          >
            Update Water Log
          </button>
        </form>
      </Modal>

      {/* 1c. Edit Water Goal Modal */}
      <Modal
        isOpen={isWaterGoalModalOpen}
        onClose={() => setIsWaterGoalModalOpen(false)}
        title="Setup Daily Water Goal"
      >
        <form onSubmit={handleSaveWaterGoal} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1 font-mono">
              Target Water Goal (Liters)
            </label>
            <input
              type="number"
              step="0.1"
              required
              min="0.5"
              max="10.0"
              value={newWaterGoalLiters}
              onChange={(e) => setNewWaterGoalLiters(e.target.value)}
              placeholder="e.g. 2.5"
              className="w-full px-4 py-2.5 rounded-xl border border-line focus:ring-2 focus:ring-sky-500 text-sm font-mono bg-[#FAFAF8]"
            />
            <p className="text-xs text-slate-500 mt-1">Recommended healthy hydration is between 2.0 L and 3.5 L per day.</p>
          </div>
          <button
            type="submit"
            className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-sm transition-colors"
          >
            Save Goal Target
          </button>
        </form>
      </Modal>

      {/* 2. Add / Edit Meal Modal */}
      <Modal
        isOpen={isMealModalOpen}
        onClose={() => setIsMealModalOpen(false)}
        title={editingMeal ? 'Edit Meal Record' : 'Add Meal Record'}
      >
        <form onSubmit={handleSaveMeal} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1 font-mono">Meal Type</label>
            <select
              value={mealType}
              onChange={(e) => setMealType(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-line focus:ring-2 focus:ring-green-600 text-sm bg-[#FAFAF8]"
            >
              <option value="Breakfast">Breakfast</option>
              <option value="Lunch">Lunch</option>
              <option value="Dinner">Dinner</option>
              <option value="Snack">Snack</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1 font-mono">Food Name</label>
            <input
              type="text"
              required
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
              placeholder="e.g. Grilled Chicken + Rice"
              className="w-full px-4 py-2.5 rounded-xl border border-line focus:ring-2 focus:ring-green-600 text-sm bg-[#FAFAF8]"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1 font-mono">Calories (kcal)</label>
              <input
                type="number"
                required
                min="0"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                placeholder="e.g. 520"
                className="w-full px-4 py-2.5 rounded-xl border border-line focus:ring-2 focus:ring-green-600 text-sm font-mono bg-[#FAFAF8]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1 font-mono">Portion</label>
              <input
                type="text"
                value={portion}
                onChange={(e) => setPortion(e.target.value)}
                placeholder="e.g. 1 plate"
                className="w-full px-4 py-2.5 rounded-xl border border-line focus:ring-2 focus:ring-green-600 text-sm bg-[#FAFAF8]"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-green-700 hover:bg-green-600 text-white font-bold rounded-xl text-sm transition-colors"
          >
            {editingMeal ? 'Update Meal' : 'Save Meal Entry'}
          </button>
        </form>
      </Modal>

      {/* 2b. Setup Calorie Limit Modal */}
      <Modal
        isOpen={isCalorieGoalModalOpen}
        onClose={() => setIsCalorieGoalModalOpen(false)}
        title="Setup Daily Calorie Limit"
      >
        <form onSubmit={handleSaveCalorieGoal} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1 font-mono">
              Daily Calorie Limit (kcal)
            </label>
            <input
              type="number"
              required
              min="500"
              max="10000"
              value={newCalorieGoal}
              onChange={(e) => setNewCalorieGoal(e.target.value)}
              placeholder="e.g. 2100"
              className="w-full px-4 py-2.5 rounded-xl border border-line focus:ring-2 focus:ring-amber-500 text-sm font-mono bg-[#FAFAF8]"
            />
            <p className="text-xs text-slate-500 mt-1">Set your daily dietary calorie intake ceiling.</p>
          </div>
          <button
            type="submit"
            className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-sm transition-colors"
          >
            Save Calorie Limit
          </button>
        </form>
      </Modal>

      {/* 3. Quick BMI Calculator Modal */}
      <Modal isOpen={isBMIModalOpen} onClose={() => setIsBMIModalOpen(false)} title="Quick BMI Tool">
        <form onSubmit={handleCalculateBMI} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1 font-mono">Height (cm)</label>
              <input
                type="number"
                required
                min="100"
                max="250"
                value={bmiHeight}
                onChange={(e) => setBmiHeight(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-line focus:ring-2 focus:ring-green-600 text-sm font-mono bg-[#FAFAF8]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1 font-mono">Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                required
                min="30"
                max="300"
                value={bmiWeight}
                onChange={(e) => setBmiWeight(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-line focus:ring-2 focus:ring-green-600 text-sm font-mono bg-[#FAFAF8]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-green-700 hover:bg-green-600 text-white font-bold rounded-xl text-sm transition-colors"
          >
            Calculate BMI
          </button>

          {bmiResult && (
            <div className="p-4 bg-[#FAFAF8] rounded-xl border border-line text-center space-y-1 mt-3 animate-in fade-in duration-150">
              <span className="text-[11px] font-mono text-slate-500 uppercase">Calculated Score</span>
              <div className="font-mono text-2xl font-bold text-navy-900">{bmiResult.bmi}</div>
              <span className="inline-block font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-green-100 text-green-800">
                {bmiResult.category}
              </span>
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
};

export default Dashboard;

