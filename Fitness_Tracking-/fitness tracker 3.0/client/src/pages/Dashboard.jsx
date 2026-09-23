import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid, ReferenceLine } from 'recharts';
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
  AlertCircle,
  Camera,
  Scale,
  Search,
  UploadCloud,
  Loader2
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
  const [mealActiveTab, setMealActiveTab] = useState('manual'); // 'manual' | 'ai'
  const [mealType, setMealType] = useState('Breakfast');
  const [foodName, setFoodName] = useState('');
  const [quantityGrams, setQuantityGrams] = useState(150);
  const [caloriesPer100g, setCaloriesPer100g] = useState(null);
  const [selectedFoodId, setSelectedFoodId] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearchingFood, setIsSearchingFood] = useState(false);
  const mealSearchTimeoutRef = useRef(null);

  // AI Scanner States
  const [aiImagePreview, setAiImagePreview] = useState(null);
  const [aiImageBase64, setAiImageBase64] = useState(null);
  const [aiMimeType, setAiMimeType] = useState('image/jpeg');
  const [isAnalyzingFood, setIsAnalyzingFood] = useState(false);
  const [aiFoodError, setAiFoodError] = useState(null);
  const [aiScanResult, setAiScanResult] = useState(null);
  const [aiFoodsList, setAiFoodsList] = useState([]);
  const [savingItemIdx, setSavingItemIdx] = useState(null);
  const mealFileInputRef = useRef(null);

  // BMI Tool modal state
  const [bmiHeight, setBmiHeight] = useState(175);
  const [bmiWeight, setBmiWeight] = useState(68.5);
  const [bmiResult, setBmiResult] = useState(null);

  // Weight section state
  const [weightInput, setWeightInput] = useState('');
  const [weightSavedFeedback, setWeightSavedFeedback] = useState(false);
  const [isSavingWeight, setIsSavingWeight] = useState(false);
  const [isEditingWeight, setIsEditingWeight] = useState(false);

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
      setIsEditingWeight(false);
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
      setIsEditingWeight(false);
    } catch (err) {
      alert('Error updating water log');
    }
  };

  const handleDeleteWater = async (id) => {
    if (!window.confirm('Delete this water entry?')) return;
    try {
      await api.delete(`/water/${id}`);
      fetchDashboardData(selectedDate);
      setIsEditingWeight(false);
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
      setIsEditingWeight(false);
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
      setIsEditingWeight(false);
    } catch (err) {
      alert('Failed to update calorie limit.');
    }
  };

  // Meal Actions & Autocomplete
  const handleFoodNameChange = (e) => {
    const value = e.target.value;
    setFoodName(value);
    setSelectedFoodId(null);

    if (mealSearchTimeoutRef.current) {
      clearTimeout(mealSearchTimeoutRef.current);
    }

    if (!value || value.trim().length === 0) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsSearchingFood(true);
    mealSearchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await api.get(`/foods/search?q=${encodeURIComponent(value.trim())}`);
        if (res.data.success) {
          setSuggestions(res.data.data || []);
          setShowSuggestions(true);
        }
      } catch (err) {
        console.error('Error searching food suggestions:', err);
      } finally {
        setIsSearchingFood(false);
      }
    }, 300);
  };

  const handleSelectSuggestion = (food) => {
    setFoodName(food.name);
    setSelectedFoodId(food._id);
    setCaloriesPer100g(food.caloriesPer100g);
    setShowSuggestions(false);
  };

  const handleOpenAddMeal = (initialTab = 'manual') => {
    setEditingMeal(null);
    setMealActiveTab(initialTab);
    setMealType('Breakfast');
    setFoodName('');
    setQuantityGrams(150);
    setCaloriesPer100g(null);
    setSelectedFoodId(null);
    setSuggestions([]);
    setShowSuggestions(false);

    // Reset AI Scanner State
    setAiImagePreview(null);
    setAiImageBase64(null);
    setAiScanResult(null);
    setAiFoodsList([]);
    setAiFoodError(null);
    setIsAnalyzingFood(false);

    setIsMealModalOpen(true);
  };

  const handleOpenEditMeal = (meal) => {
    setEditingMeal(meal);
    setMealActiveTab('manual');
    setMealType(meal.mealType);
    setFoodName(meal.foodName);
    const grams = meal.quantityGrams || (meal.quantity ? parseInt(meal.quantity, 10) : 150) || 150;
    setQuantityGrams(grams);
    setCaloriesPer100g(meal.caloriesPer100g || (meal.calories && grams ? Math.round((meal.calories / grams) * 100) : null));
    setSelectedFoodId(meal.foodId || null);
    setSuggestions([]);
    setShowSuggestions(false);
    setIsMealModalOpen(true);
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setAiFoodError('Please select a valid image file (JPEG, PNG, WebP).');
      return;
    }

    setAiFoodError(null);
    setAiScanResult(null);
    setAiFoodsList([]);
    setAiMimeType(file.type);

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const dataUrl = uploadEvent.target.result;
      setAiImagePreview(dataUrl);
      const base64Data = dataUrl.split(',')[1];
      setAiImageBase64(base64Data);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyzeFoodImage = async () => {
    if (!aiImageBase64) {
      setAiFoodError('Please choose or capture a food photo first.');
      return;
    }

    try {
      setIsAnalyzingFood(true);
      setAiFoodError(null);

      const res = await api.post('/foods/analyze-image', {
        imageBase64: aiImageBase64,
        mimeType: aiMimeType
      });

      if (res.data.success && res.data.identified && res.data.foods && res.data.foods.length > 0) {
        setAiFoodsList(res.data.foods);
        setAiScanResult({
          isKnown: res.data.isKnown,
          totalEstimatedCalories: res.data.totalEstimatedCalories
        });
      } else {
        setAiFoodError(
          res.data.message ||
          "We couldn't confidently identify this food. The image may be unclear, blurry, or dark. Please try a clearer picture or enter the food manually."
        );
      }
    } catch (err) {
      console.error('AI image analysis error:', err);
      const errMsg = err.response?.data?.message || 'AI food analysis is temporarily unavailable. Please add your meal manually.';
      setAiFoodError(errMsg);
    } finally {
      setIsAnalyzingFood(false);
    }
  };

  // Multi-food plate item editing helpers
  const handleUpdateItemWeight = (index, weight) => {
    const numGrams = Number(weight) > 0 ? Number(weight) : 0;
    setAiFoodsList((prev) => {
      const updated = [...prev];
      const item = { ...updated[index] };
      item.estimatedWeightGrams = numGrams;
      item.estimatedCalories = Math.round(((item.caloriesPer100g || 150) / 100) * numGrams);
      updated[index] = item;
      return updated;
    });
  };

  const handleUpdateItemCalPer100g = (index, calVal) => {
    const numCal = Number(calVal) >= 0 ? Number(calVal) : 0;
    setAiFoodsList((prev) => {
      const updated = [...prev];
      const item = { ...updated[index] };
      item.caloriesPer100g = numCal;
      item.estimatedCalories = Math.round((numCal / 100) * (item.estimatedWeightGrams || 150));
      updated[index] = item;
      return updated;
    });
  };

  const handleUpdateItemName = (index, newName) => {
    setAiFoodsList((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], foodName: newName, isKnown: false };
      return updated;
    });
  };

  const handleSelectItemMatch = (index, match) => {
    setAiFoodsList((prev) => {
      const updated = [...prev];
      const item = { ...updated[index] };
      item.foodName = match.name;
      item.foodId = match._id;
      item.caloriesPer100g = match.caloriesPer100g;
      item.isKnown = true;
      item.estimatedCalories = Math.round((match.caloriesPer100g / 100) * (item.estimatedWeightGrams || 150));
      item.possibleMatches = [];
      updated[index] = item;
      return updated;
    });
  };

  const handleRemoveItem = (index) => {
    setAiFoodsList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddItem = () => {
    setAiFoodsList((prev) => [
      ...prev,
      {
        detectedName: 'Extra Item',
        foodName: 'White Rice',
        foodId: null,
        isKnown: true,
        caloriesPer100g: 137.5,
        estimatedWeightGrams: 100,
        estimatedCalories: 138,
        confidence: 1.0,
        possibleMatches: []
      }
    ]);
  };

  const calculatedManualCalories =
    caloriesPer100g && quantityGrams > 0
      ? Math.round((Number(caloriesPer100g) / 100) * Number(quantityGrams))
      : null;

  const handleSaveManualMeal = async (e) => {
    e.preventDefault();
    if (!foodName.trim()) return;

    const grams = Number(quantityGrams);
    if (isNaN(grams) || grams <= 0) {
      alert('Please enter a valid portion in grams greater than 0.');
      return;
    }

    try {
      if (editingMeal && editingMeal._id) {
        await api.put(`/meals/${editingMeal._id}`, {
          mealType,
          foodName: foodName.trim(),
          quantityGrams: grams,
          caloriesPer100g: caloriesPer100g || undefined,
          calories: calculatedManualCalories || Number(editingMeal.calories),
          date: selectedDate
        });
      } else {
        await api.post('/meals', {
          mealType,
          foodName: foodName.trim(),
          foodId: selectedFoodId,
          quantityGrams: grams,
          caloriesPer100g: caloriesPer100g || (calculatedManualCalories ? Math.round((calculatedManualCalories / grams) * 100) : 150),
          calories: calculatedManualCalories || Math.round((150 / 100) * grams),
          source: 'manual',
          date: selectedDate
        });
      }
      setIsMealModalOpen(false);
      fetchDashboardData(selectedDate);
      setIsEditingWeight(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving meal record');
    }
  };

  // Save an individual AI-selected food item directly to Meal Tracker
  const handleSaveSingleAIItem = async (index) => {
    const item = aiFoodsList[index];
    if (!item) return;

    if (!item.foodName || !item.foodName.trim()) {
      alert('Please enter a valid food name.');
      return;
    }
    const grams = Number(item.estimatedWeightGrams);
    if (isNaN(grams) || grams <= 0) {
      alert(`Please enter a valid weight (> 0g) for "${item.foodName}".`);
      return;
    }

    try {
      setSavingItemIdx(index);
      await api.post('/meals', {
        mealType,
        date: selectedDate,
        foodName: item.foodName.trim(),
        foodId: item.foodId || null,
        quantityGrams: grams,
        caloriesPer100g: Number(item.caloriesPer100g) || 150,
        calories: item.estimatedCalories || Math.round(((Number(item.caloriesPer100g) || 150) / 100) * grams),
        source: 'ai',
        saveNewFood: !item.isKnown
      });

      fetchDashboardData(selectedDate);
      setAiFoodsList((prev) => {
        const remaining = prev.filter((_, i) => i !== index);
        if (remaining.length === 0) {
          setIsMealModalOpen(false);
          setAiScanResult(null);
          setAiImagePreview(null);
          setAiImageBase64(null);
        }
        return remaining;
      });
    } catch (err) {
      console.error('Save single AI meal error:', err);
      alert(err.response?.data?.message || 'Failed to add item to Meal Tracker.');
    } finally {
      setSavingItemIdx(null);
    }
  };

  const handleSaveAIMeal = async () => {
    if (!aiFoodsList || aiFoodsList.length === 0) return;

    for (const item of aiFoodsList) {
      if (!item.foodName || !item.foodName.trim()) {
        alert('Please ensure every food item has a valid name.');
        return;
      }
      if (!item.estimatedWeightGrams || Number(item.estimatedWeightGrams) <= 0) {
        alert(`Please enter a valid weight (> 0g) for "${item.foodName}".`);
        return;
      }
    }

    try {
      await api.post('/meals', {
        mealType,
        date: selectedDate,
        meals: aiFoodsList.map((item) => ({
          foodName: item.foodName.trim(),
          foodId: item.foodId || null,
          quantityGrams: Number(item.estimatedWeightGrams),
          caloriesPer100g: Number(item.caloriesPer100g) || 150,
          source: 'ai',
          saveNewFood: !item.isKnown
        }))
      });

      setIsMealModalOpen(false);
      fetchDashboardData(selectedDate);
      setIsEditingWeight(false);
    } catch (err) {
      console.error('Save AI meal error:', err);
      alert(err.response?.data?.message || 'Failed to save meal records from AI scan.');
    }
  };

  const handleDeleteMeal = async (id) => {
    if (!window.confirm('Delete this meal entry?')) return;
    try {
      await api.delete(`/meals/${id}`);
      fetchDashboardData(selectedDate);
      setIsEditingWeight(false);
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
      setIsEditingWeight(false);
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
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Loading your FitTrack dashboard...</p>
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
    recentMeals = [],
    recentWeightRecords = []
  } = data || {};

  const groupedMeals = recentMeals.reduce((acc, meal) => {
    if (!acc[meal.mealType]) acc[meal.mealType] = { meals: [], total: 0 };
    acc[meal.mealType].meals.push(meal);
    acc[meal.mealType].total += meal.calories;
    return acc;
  }, {});

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
    cardBorderClass: 'border-line dark:border-slate-700',
    message: null
  };

  if (todayWater >= waterGoal) {
    waterAlert = {
      type: 'success',
      badge: '✓ 100% Goal Met',
      badgeClass: 'bg-emerald-100 text-emerald-700',
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
      cardBorderClass: 'border-line dark:border-slate-700',
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
          <h1 className="font-sora text-2xl md:text-3xl font-bold text-navy-900 dark:text-slate-200 tracking-tight">
            {getGreeting()}, <span className="text-emerald-700">{userName}</span> 👋
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Here's your health overview for today.
          </p>
        </div>

        {/* COMPACT FUNCTIONAL DATE SELECTOR [ 📅 09/01/2026 ▣ ] */}
        <div className="relative inline-flex items-center bg-white/60 backdrop-blur-xl border border-white/80 dark:bg-slate-800/40 dark:backdrop-blur-xl dark:border-white/10 dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)] shadow-[0_8px_30px_rgba(31,111,79,0.04)] hover:-translate-y-1 hover:bg-white/70 dark:hover:bg-slate-800/60 rounded-xl px-3.5 py-2 shadow-xs hover:border-green-600 transition-all font-mono text-xs text-navy-900 dark:text-slate-200 group">
          <Calendar className="w-4 h-4 text-emerald-700 mr-2.5 flex-shrink-0" />
          <span className="font-semibold tracking-wide mr-3">{formatDisplayDate(selectedDate)}</span>
          <span className="text-slate-400 group-hover:text-emerald-700 text-xs">▣</span>
          <input
            type="date"
            id="dashboard-date-selector"
            value={selectedDate}
            onChange={handleDateChange}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full dark:placeholder-slate-500"
            title="Select Date"
          />
        </div>
      </div>

      {/* ==================================================
          1. EXISTING FOUR SUMMARY CARDS (STRICTLY PRESERVED)
          ================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. BMI Card (with Tool trigger) */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-line dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow duration-200 group relative">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider font-mono">BMI</span>
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => setIsBMIModalOpen(true)}
                className="text-[10px] font-mono text-emerald-700 hover:underline flex items-center"
                title="Open BMI Tool"
              >
                <Calculator className="w-3 h-3 mr-0.5" />
                <span>Calc</span>
              </button>
              <span className="font-mono text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                {bmiCategory}
              </span>
            </div>
          </div>
          <div className="font-mono text-2xl font-bold text-navy-900 dark:text-slate-200 tracking-tight">{bmi}</div>
          <div className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-1">Healthy target: 18.5 – 24.9</div>
        </div>

        {/* 2. Weight Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-line dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow duration-200 group relative">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider font-mono">Weight</span>
            <div className="flex items-center space-x-1.5">
              {!isEditingWeight && (
                <button
                  onClick={() => { setWeightInput(currentWeight || ''); setIsEditingWeight(true); }}
                  className="text-[10px] font-mono text-emerald-700 hover:underline flex items-center"
                  title="Update Weight"
                >
                  <Edit2 className="w-3 h-3 mr-0.5" />
                  <span>Edit</span>
                </button>
              )}
              <span className="font-mono text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                {weightChange > 0 ? `+${weightChange}` : `${weightChange}`}kg
              </span>
            </div>
          </div>
          {isEditingWeight ? (
             <div className="flex flex-col mt-2">
                <div className="flex items-center gap-2">
                  <input 
                     type="number" 
                     value={weightInput} 
                     onChange={(e) => setWeightInput(e.target.value)}
                     className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-emerald-500 font-mono"
                     placeholder="kg"
                     autoFocus
                  />
                  <button 
                     onClick={handleSaveWeight} 
                     disabled={isSavingWeight}
                     className="bg-emerald-600 hover:bg-emerald-700 text-white p-1.5 rounded-lg transition-colors flex items-center justify-center min-w-[36px]"
                  >
                     {isSavingWeight ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  </button>
                </div>
                <button 
                   onClick={() => setIsEditingWeight(false)}
                   className="text-[10px] text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mt-2 text-left underline"
                >
                   Cancel
                </button>
             </div>
          ) : (
            <>
              <div className="font-mono text-2xl font-bold text-navy-900 dark:text-slate-200 tracking-tight flex items-center gap-2">
                {currentWeight} <span className="text-xs font-medium text-slate-700 dark:text-slate-300">kg</span>
                {weightSavedFeedback && (
                  <span className="text-[10px] text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded flex items-center animate-fade-in-up">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Updated
                  </span>
                )}
              </div>
              <div className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-1">Target: {targetWeight} kg</div>
            </>
          )}
        </div>

        {/* 3. Water Card with Time-Aware Alerts */}
        <div className={`p-6 rounded-2xl bg-white dark:bg-slate-800 border ${waterAlert.cardBorderClass} shadow-sm hover:shadow-md transition-shadow duration-200 relative group`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1">
              <Droplet className="w-3.5 h-3.5 text-sky-500" />
              <span>Water</span>
            </span>
            <span className={`font-mono text-[11px] px-2.5 py-0.5 rounded-full transition-all ${waterAlert.badgeClass}`}>
              {waterAlert.badge}
            </span>
          </div>
          <div className="font-mono text-2xl font-bold text-navy-900 dark:text-slate-200 tracking-tight">
            {waterInLiters} / {waterGoalLiters} <span className="text-xs font-medium text-slate-700 dark:text-slate-300">L</span>
          </div>
          <div className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-1 flex items-center justify-between">
            <span>Goal: {waterGoalLiters} L</span>
            {waterRemainingMl > 0 && isToday && (
              <span className={`font-mono text-[11px] font-bold ${waterAlert.type === 'critical' ? 'text-rose-700 dark:text-rose-400' : waterAlert.type === 'warning' ? 'text-amber-800 dark:text-amber-500' : 'text-slate-700 dark:text-slate-300'
                }`}>
                -{waterRemainingMl}ml
              </span>
            )}
          </div>
        </div>

        {/* 4. Calories Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-line dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider font-mono">Calories</span>
            <span className="font-mono text-[11px] font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
              of {calorieGoal.toLocaleString()}
            </span>
          </div>
          <div className="font-mono text-2xl font-bold text-navy-900 dark:text-slate-200 tracking-tight">
            {todayCalories.toLocaleString()} <span className="text-xs font-medium text-slate-700 dark:text-slate-300">kcal</span>
          </div>
          <div className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-1">Daily Target: {calorieGoal.toLocaleString()} kcal</div>
        </div>
      </div>

      {/* ==================================================
          DASHBOARD ORDER BELOW THE FOUR SUMMARY CARDS:
          1. Today's Meals
          2. Daily Water Intake
          3. Weight Progress / Weight Input
          ================================================== */}

      {/* 1 & 2. TODAY'S MEALS (LEFT) AND DAILY WATER INTAKE (RIGHT) SIDE BY SIDE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* 1. TODAY'S MEALS (LEFT) */}
        <section id="meals-section" className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-line dark:border-slate-700 shadow-sm space-y-4 h-full flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-3">
                <h3 className="font-sora font-bold text-navy-900 dark:text-slate-200 text-lg">Today's Meals</h3>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsCalorieGoalModalOpen(true)}
                  className="flex items-center space-x-1 px-3 py-2 bg-[#FAFAF8] dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl border border-line dark:border-slate-700 shadow-xs transition-colors"
                  title="Setup Calorie Limit"
                >
                  <Settings className="w-3.5 h-3.5 text-amber-600" />
                  <span>Set Limit ({calorieGoal} kcal)</span>
                </button>

                <button
                  onClick={() => handleOpenAddMeal('manual')}
                  className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 hover:-translate-y-1 text-white shadow-[0_4px_14px_rgba(31,111,79,0.2)] transition-all duration-300 font-semibold text-xs rounded-xl shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Meal</span>
                </button>
              </div>
            </div>

            {Object.keys(groupedMeals).length > 0 ? (
              <div className="space-y-6 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                {Object.keys(groupedMeals).map((mealType) => (
                  <div key={mealType} className="space-y-3">
                    <div className="flex items-center justify-between border-b border-line dark:border-slate-700 pb-2">
                      <h4 className="font-semibold text-navy-900 dark:text-slate-200 text-sm">{mealType}</h4>
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-500">{groupedMeals[mealType].total} kcal</span>
                    </div>
                    <div className="space-y-2">
                      {groupedMeals[mealType].meals.map((meal) => (
                        <div key={meal._id || meal.foodName} className="flex items-center justify-between group py-1">
                          <div className="flex flex-col">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">{meal.foodName}</span>
                              {meal.source === 'ai' && (
                                <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800/50 dark:text-emerald-400">
                                  <Sparkles className="w-2.5 h-2.5" />
                                  <span>AI</span>
                                </span>
                              )}
                            </div>
                            {(meal.quantityGrams || meal.quantity) && (
                              <span className="text-xs text-slate-400">
                                {meal.quantityGrams ? `${meal.quantityGrams}g` : meal.quantity}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <span className="font-mono text-sm text-navy-900 dark:text-slate-200">{meal.calories} <span className="text-xs text-slate-500">kcal</span></span>
                            {meal._id && (
                              <div className="flex items-center space-x-1">
                                <button
                                  onClick={() => handleOpenEditMeal(meal)}
                                  className="p-1 text-slate-400 hover:text-emerald-600 transition-colors"
                                  title="Edit Meal"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteMeal(meal._id)}
                                  className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
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
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400 text-xs bg-[#FAFAF8] dark:bg-slate-900 rounded-[12px] border border-dashed border-line dark:border-slate-700">
                No meals logged for this date. Click "+ Add Meal" to record your intake.
              </div>
            )}
          </div>

          {/* Bottom Total Intake */}
          <div className="pt-3 border-t border-line dark:border-slate-700 flex items-center justify-between text-sm mt-auto">
            <span className="text-slate-600 font-medium">Total Intake</span>
            <span className="font-mono font-bold text-navy-900 dark:text-slate-200">
              {todayCalories.toLocaleString()} / {calorieGoal.toLocaleString()} kcal
            </span>
          </div>
        </section>

        {/* 2. DAILY WATER INTAKE (RIGHT) */}
        <section id="water-section" className={`bg-white dark:bg-slate-800 rounded-2xl p-6 border ${waterAlert.cardBorderClass} shadow-sm space-y-4 h-full flex flex-col justify-between`}>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <h3 className="font-sora font-bold text-navy-900 dark:text-slate-200 text-lg">Daily Water Intake</h3>
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
              <div className={`p-3 rounded-xl border flex items-start justify-between gap-3 text-xs font-inter leading-relaxed ${waterAlert.type === 'critical'
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : waterAlert.type === 'warning'
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-slate-50 border-slate-200 text-slate-700 dark:text-slate-200'
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
                    className={`font-mono text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap shadow-xs ${waterAlert.type === 'critical'
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
              <div className="font-mono text-2xl font-bold text-navy-900 dark:text-slate-200">
                {waterInLiters} / {waterGoalLiters} <span className="text-sm font-normal text-slate-500 dark:text-slate-400">L</span>
              </div>
              <span className="font-mono text-xs font-bold text-sky-700">
                {waterPercentage}% complete
              </span>
            </div>

            {/* Milestone Progress Bar */}
            <div className="space-y-2">
              <div className="w-full bg-white/80 dark:bg-slate-900/50 border border-white/80 dark:border-white/10 shadow-inner rounded-full h-3.5 overflow-hidden p-0.5">
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
              <div className="pt-3 border-t border-line dark:border-slate-700 space-y-2">
                <span className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase block">
                  Logged Entries for this Date ({waterLogs.length})
                </span>
                <div className="grid grid-cols-2 gap-2 max-h-[140px] overflow-y-auto pr-1">
                  {waterLogs.map((log) => (
                    <div
                      key={log._id}
                      className="p-2 bg-white/80 dark:bg-slate-900/50 border border-white/80 dark:border-white/10 shadow-inner rounded-xl flex items-center justify-between group"
                    >
                      <span className="font-mono text-xs font-bold text-navy-900 dark:text-slate-200">+{log.amount} ml</span>
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
      {/* ==================================================
          MODALS FOR FUNCTIONAL LOGGING & TOOLS
          ================================================== */}
      {/* 1. Add Water Modal */}
      <Modal isOpen={isWaterModalOpen} onClose={() => setIsWaterModalOpen(false)} title="Log Water Intake">
        <form onSubmit={handleAddWater} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase mb-1 font-mono">
              Water Amount (ml)
            </label>
            <input
              type="number"
              required
              min="50"
              max="3000"
              value={waterAmount}
              onChange={(e) => setWaterAmount(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-line dark:border-slate-700 focus:ring-2 focus:ring-sky-500 text-sm font-mono bg-[#FAFAF8] dark:bg-slate-900"
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
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase mb-1 font-mono">
              Water Amount (ml)
            </label>
            <input
              type="number"
              required
              min="50"
              max="3000"
              value={waterAmount}
              onChange={(e) => setWaterAmount(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-line dark:border-slate-700 focus:ring-2 focus:ring-sky-500 text-sm font-mono bg-[#FAFAF8] dark:bg-slate-900"
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
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase mb-1 font-mono">
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
              className="w-full px-4 py-2.5 rounded-xl border border-line dark:border-slate-700 focus:ring-2 focus:ring-sky-500 text-sm font-mono bg-[#FAFAF8] dark:bg-slate-900"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Recommended healthy hydration is between 2.0 L and 3.5 L per day.</p>
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
        title={editingMeal ? 'Edit Meal Record' : 'Add Meal'}
      >
        {/* Tab Toggle (Only when adding a new meal) */}
        {!editingMeal && (
          <div className="flex p-1 bg-slate-100 rounded-xl mb-4 border border-line dark:border-slate-700">
            <button
              type="button"
              onClick={() => setMealActiveTab('manual')}
              className={`flex-1 flex items-center justify-center space-x-1.5 py-2 text-xs font-semibold rounded-lg transition-all ${mealActiveTab === 'manual'
                  ? 'bg-white dark:bg-slate-800 text-navy-900 dark:text-slate-200 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-navy-900 dark:text-slate-200'
                }`}
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>Manual Entry</span>
            </button>
            <button
              type="button"
              onClick={() => setMealActiveTab('ai')}
              className={`flex-1 flex items-center justify-center space-x-1.5 py-2 text-xs font-semibold rounded-lg transition-all ${mealActiveTab === 'ai'
                  ? 'bg-white dark:bg-slate-800 text-emerald-700 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-emerald-700'
                }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Scan Food with AI</span>
            </button>
          </div>
        )}

        {/* TAB 1: MANUAL ENTRY */}
        {mealActiveTab === 'manual' && (
          <form onSubmit={handleSaveManualMeal} className="space-y-4">
            {/* Meal Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase mb-1 font-mono">
                Meal Category
              </label>
              <select
                value={mealType}
                onChange={(e) => setMealType(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-line dark:border-slate-700 focus:ring-2 focus:ring-emerald-600 text-sm bg-[#FAFAF8] dark:bg-slate-900"
              >
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Dinner">Dinner</option>
                <option value="Snack">Snack</option>
              </select>
            </div>

            {/* Food Name Search with Autocomplete */}
            <div className="relative">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase font-mono">
                  Food Name
                </label>
                {caloriesPer100g && (
                  <span className="text-[11px] font-mono text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {caloriesPer100g} kcal / 100g
                  </span>
                )}
              </div>

              <div className="relative">
                <input
                  type="text"
                  required
                  value={foodName}
                  onChange={handleFoodNameChange}
                  onFocus={() => {
                    if (suggestions.length > 0) setShowSuggestions(true);
                  }}
                  placeholder="Type food name (e.g. chick, kottu, parippu...)"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-line dark:border-slate-700 focus:ring-2 focus:ring-emerald-600 text-sm bg-[#FAFAF8] dark:bg-slate-900"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                {isSearchingFood && (
                  <Loader2 className="w-4 h-4 text-emerald-700 animate-spin absolute right-3 top-3" />
                )}
              </div>

              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-20 left-0 right-0 mt-1.5 bg-white/60 backdrop-blur-xl border border-white/80 dark:bg-slate-800/40 dark:backdrop-blur-xl dark:border-white/10 dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)] shadow-[0_8px_30px_rgba(31,111,79,0.04)] rounded-xl shadow-lg max-h-48 overflow-y-auto divide-y divide-slate-100">
                  <div className="px-3 py-1.5 bg-slate-50 text-[10px] uppercase font-mono text-slate-400 font-semibold">
                    Food Database Suggestions
                  </div>
                  {suggestions.map((item) => (
                    <button
                      key={item._id}
                      type="button"
                      onClick={() => handleSelectSuggestion(item)}
                      className="w-full text-left px-3.5 py-2.5 hover:bg-emerald-50 flex items-center justify-between text-xs transition-colors"
                    >
                      <span className="font-semibold text-navy-900 dark:text-slate-200">{item.name}</span>
                      <span className="font-mono text-slate-500 dark:text-slate-400 text-[11px]">
                        {item.caloriesPer100g} kcal/100g
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quantity in Grams */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase mb-1 font-mono">
                Quantity (Grams)
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min="1"
                  max="10000"
                  value={quantityGrams}
                  onChange={(e) => setQuantityGrams(e.target.value)}
                  placeholder="e.g. 150"
                  className="w-full pl-9 pr-12 py-2.5 rounded-xl border border-line dark:border-slate-700 focus:ring-2 focus:ring-emerald-600 text-sm bg-[#FAFAF8] dark:bg-slate-900 font-mono"
                />
                <Scale className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-mono font-semibold">
                  grams
                </span>
              </div>
            </div>

            {/* Live Calorie Calculation Display */}
            {caloriesPer100g && quantityGrams > 0 && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-emerald-900">
                <div>
                  <div className="text-[11px] font-mono text-emerald-700 font-medium">
                    Calculated Total ({quantityGrams}g × {caloriesPer100g} / 100g)
                  </div>
                  <div className="text-xs font-semibold">{foodName}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-lg font-bold text-emerald-800">
                    {calculatedManualCalories} kcal
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 hover:-translate-y-1 text-white shadow-[0_4px_14px_rgba(31,111,79,0.2)] transition-all duration-300 font-sora font-semibold rounded-xl text-sm transition-colors shadow-xs flex items-center justify-center space-x-2"
            >
              <span>{editingMeal ? 'Update Meal' : 'Save Meal Entry'}</span>
            </button>
          </form>
        )}

        {/* TAB 2: AI FOOD IMAGE SCANNER */}
        {mealActiveTab === 'ai' && (
          <div className="space-y-4">
            {/* Image Upload Area */}
            {!aiImagePreview ? (
              <div
                onClick={() => mealFileInputRef.current?.click()}
                className="border-2 border-dashed border-line dark:border-slate-700 rounded-2xl p-6 text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/40 transition-all bg-[#FAFAF8] dark:bg-slate-900 group"
              >
                <input
                  type="file"
                  ref={mealFileInputRef}
                  onChange={handleImageFileChange}
                  accept="image/*"
                  capture="environment"
                  className="hidden dark:placeholder-slate-500"
                />
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
                  <Camera className="w-6 h-6" />
                </div>
                <h4 className="font-sora font-semibold text-sm text-navy-900 dark:text-slate-200">
                  Upload or Capture Food Photo
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                  Take a picture of your Sri Lankan or international dish for AI recognition and portion estimate.
                </p>
                <div className="mt-3 inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white/60 backdrop-blur-xl border border-white/80 dark:bg-slate-800/40 dark:backdrop-blur-xl dark:border-white/10 dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)] shadow-[0_8px_30px_rgba(31,111,79,0.04)] rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs">
                  <UploadCloud className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Choose File</span>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className={`relative rounded-xl overflow-hidden border border-line dark:border-slate-700 ${aiFoodsList.length > 0 ? 'h-24' : 'max-h-40'} bg-black flex items-center justify-center transition-all`}>
                  <img
                    src={aiImagePreview}
                    alt="Food preview"
                    className={`${aiFoodsList.length > 0 ? 'h-24' : 'max-h-40'} w-full object-cover`}
                  />
                  {!isAnalyzingFood && (
                    <button
                      onClick={() => {
                        setAiImagePreview(null);
                        setAiImageBase64(null);
                        setAiScanResult(null);
                        setAiFoodsList([]);
                        setAiFoodError(null);
                      }}
                      className="absolute top-1.5 right-1.5 px-2 py-0.5 bg-black/70 hover:bg-black text-white text-[10px] rounded-md backdrop-blur-xs font-medium"
                    >
                      Change Photo
                    </button>
                  )}
                </div>

                {!aiScanResult && (
                  <button
                    type="button"
                    disabled={isAnalyzingFood}
                    onClick={handleAnalyzeFoodImage}
                    className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-600 disabled:bg-slate-300 text-white font-sora font-semibold rounded-xl text-xs transition-colors shadow-xs flex items-center justify-center space-x-2"
                  >
                    {isAnalyzingFood ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Analyzing with Gemini AI...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Analyze Food</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* Error / Recognition Notice with Manual Search Fallback */}
            {aiFoodError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs space-y-2">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold">Recognition Notice</div>
                    <div>{aiFoodError}</div>
                  </div>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setMealActiveTab('manual');
                      setAiFoodError(null);
                    }}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 font-semibold rounded-lg text-xs transition-colors"
                  >
                    <Search className="w-3 h-3" />
                    <span>Search Food Manually</span>
                  </button>
                </div>
              </div>
            )}

            {/* AI Scan Result: Compact Card */}
            {aiFoodsList && aiFoodsList.length > 0 && (
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wide font-mono">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Food Detected {aiFoodsList.length > 1 ? `(${aiFoodsList.length})` : ''}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase font-mono">
                      Meal:
                    </label>
                    <select
                      value={mealType}
                      onChange={(e) => setMealType(e.target.value)}
                      className="px-2 py-0.5 rounded-lg border border-line dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-navy-900 dark:text-slate-200 focus:ring-1 focus:ring-emerald-600"
                    >
                      <option value="Breakfast">Breakfast</option>
                      <option value="Lunch">Lunch</option>
                      <option value="Dinner">Dinner</option>
                      <option value="Snack">Snack</option>
                    </select>
                  </div>
                </div>

                {/* List of Detected Food Items */}
                <div className="space-y-2">
                  {aiFoodsList.map((item, idx) => {
                    const isLowConf = (item.confidence !== undefined && item.confidence !== null) && item.confidence < 0.90;
                    return (
                      <div
                        key={idx}
                        className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-emerald-100 shadow-xs space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                            {aiFoodsList.length > 1 ? `Item #${idx + 1}` : 'Detected Dish'}
                          </span>
                          <div className="flex items-center space-x-1.5">
                            <span
                              className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${item.isKnown
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-amber-100 text-amber-800 border border-amber-300'
                                }`}
                            >
                              {item.isKnown ? 'In Database' : 'Estimated by AI'}
                            </span>
                            {isLowConf && (
                              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                                Low conf ({Math.round(item.confidence * 100)}%)
                              </span>
                            )}
                            {aiFoodsList.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(idx)}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                                title="Remove item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Food Name Input */}
                        <div>
                          <input
                            type="text"
                            value={item.foodName}
                            onChange={(e) => handleUpdateItemName(idx, e.target.value)}
                            placeholder="Food name"
                            className="w-full px-2.5 py-1.5 rounded-lg border border-line dark:border-slate-700 bg-slate-50/50 text-xs font-semibold text-navy-900 dark:text-slate-200 focus:bg-white dark:bg-slate-800 focus:ring-1 focus:ring-emerald-600"
                          />
                        </div>

                        {/* Suggested Matches if available */}
                        {item.possibleMatches && item.possibleMatches.length > 0 && (
                          <div className="space-y-0.5">
                            <span className="text-[9px] text-slate-500 dark:text-slate-400 font-mono">Suggested:</span>
                            <div className="flex flex-wrap gap-1">
                              {item.possibleMatches.map((m, mIdx) => (
                                <button
                                  key={mIdx}
                                  type="button"
                                  onClick={() => handleSelectItemMatch(idx, m)}
                                  className="px-2 py-0.5 text-[9px] font-medium bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded border border-emerald-200 transition-colors"
                                >
                                  {m.name} ({m.caloriesPer100g} kcal)
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Portion and Calories/100g Grid */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[9px] font-semibold text-slate-500 dark:text-slate-400 uppercase font-mono mb-0.5">
                              Portion (g)
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={item.estimatedWeightGrams}
                              onChange={(e) => handleUpdateItemWeight(idx, e.target.value)}
                              className="w-full px-2 py-1 rounded-lg border border-line dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold text-navy-900 dark:text-slate-200"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-semibold text-slate-500 dark:text-slate-400 uppercase font-mono mb-0.5">
                              Calories/100g
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={item.caloriesPer100g}
                              onChange={(e) => handleUpdateItemCalPer100g(idx, e.target.value)}
                              className="w-full px-2 py-1 rounded-lg border border-line dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold text-navy-900 dark:text-slate-200"
                            />
                          </div>
                        </div>

                        {/* Subtotal & Individual Add Button (if multiple items) */}
                        {aiFoodsList.length > 1 && (
                          <div className="flex items-center justify-between pt-1.5 border-t border-slate-100">
                            <span className="text-[11px] font-mono font-bold text-emerald-800">
                              {item.estimatedCalories} kcal ({item.estimatedWeightGrams}g)
                            </span>
                            <button
                              type="button"
                              onClick={() => handleSaveSingleAIItem(idx)}
                              disabled={savingItemIdx === idx}
                              className="inline-flex items-center space-x-1 px-2.5 py-1 bg-emerald-700 hover:bg-emerald-600 disabled:bg-slate-300 text-white font-sora font-semibold text-[10px] rounded-lg transition-all shadow-xs"
                            >
                              <Plus className="w-3 h-3" />
                              <span>{savingItemIdx === idx ? 'Adding...' : 'Add to Today\'s Meals'}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Primary Full-Width Add Button */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleSaveAIMeal}
                    className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-sora font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center space-x-1.5 active:scale-98"
                  >
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>
                      {aiFoodsList.length > 1
                        ? `Add All (${aiFoodsList.length}) Foods to Today's Meals (${aiFoodsList.reduce((sum, item) => sum + (Number(item.estimatedCalories) || 0), 0)} kcal)`
                        : `Add to Today's Meals (${aiFoodsList[0]?.estimatedCalories || 0} kcal)`}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* 2b. Setup Calorie Limit Modal */}
      <Modal
        isOpen={isCalorieGoalModalOpen}
        onClose={() => setIsCalorieGoalModalOpen(false)}
        title="Setup Daily Calorie Limit"
      >
        <form onSubmit={handleSaveCalorieGoal} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase mb-1 font-mono">
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
              className="w-full px-4 py-2.5 rounded-xl border border-line dark:border-slate-700 focus:ring-2 focus:ring-amber-500 text-sm font-mono bg-[#FAFAF8] dark:bg-slate-900"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Set your daily dietary calorie intake ceiling.</p>
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
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase mb-1 font-mono">Height (cm)</label>
              <input
                type="number"
                required
                min="100"
                max="250"
                value={bmiHeight}
                onChange={(e) => setBmiHeight(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-line dark:border-slate-700 focus:ring-2 focus:ring-emerald-600 text-sm font-mono bg-[#FAFAF8] dark:bg-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase mb-1 font-mono">Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                required
                min="30"
                max="300"
                value={bmiWeight}
                onChange={(e) => setBmiWeight(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-line dark:border-slate-700 focus:ring-2 focus:ring-emerald-600 text-sm font-mono bg-[#FAFAF8] dark:bg-slate-900"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 hover:-translate-y-1 text-white shadow-[0_4px_14px_rgba(31,111,79,0.2)] transition-all duration-300 font-bold rounded-xl text-sm transition-colors"
          >
            Calculate BMI
          </button>

          {bmiResult && (
            <div className="p-4 bg-[#FAFAF8] dark:bg-slate-900 rounded-xl border border-line dark:border-slate-700 text-center space-y-1 mt-3 animate-in fade-in duration-150">
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase">Calculated Score</span>
              <div className="font-mono text-2xl font-bold text-navy-900 dark:text-slate-200">{bmiResult.bmi}</div>
              <span className="inline-block font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
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

