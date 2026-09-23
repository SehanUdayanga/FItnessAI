import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import {
  Utensils,
  Plus,
  Trash2,
  Edit2,
  Flame,
  Calendar as CalendarIcon,
  Camera,
  Search,
  Sparkles,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Scale
} from 'lucide-react';

const MealTracker = () => {
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [meals, setMeals] = useState([]);
  const [totalCalories, setTotalCalories] = useState(0);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('manual'); // 'manual' | 'ai'
  const [editingMeal, setEditingMeal] = useState(null);

  // Form State - Manual
  const [mealType, setMealType] = useState('Breakfast');
  const [foodName, setFoodName] = useState('');
  const [quantityGrams, setQuantityGrams] = useState(150);
  const [caloriesPer100g, setCaloriesPer100g] = useState(null);
  const [selectedFoodId, setSelectedFoodId] = useState(null);

  // Autocomplete State
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearchingFood, setIsSearchingFood] = useState(false);
  const searchTimeoutRef = useRef(null);

  // Form State - AI Scanner
  const [aiImagePreview, setAiImagePreview] = useState(null);
  const [aiImageBase64, setAiImageBase64] = useState(null);
  const [aiMimeType, setAiMimeType] = useState('image/jpeg');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [aiScanResult, setAiScanResult] = useState(null);
  const [aiFoodsList, setAiFoodsList] = useState([]);
  const [savingItemIdx, setSavingItemIdx] = useState(null);
  const fileInputRef = useRef(null);

  const fetchMeals = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/meals?date=${date}`);
      if (res.data.success) {
        setMeals(res.data.data);
        setTotalCalories(res.data.totalCalories);
      }
    } catch (err) {
      console.error('Error fetching meals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeals();
  }, [date]);

  // Handle Food Autocomplete Search with Debounce
  const handleFoodNameChange = (e) => {
    const value = e.target.value;
    setFoodName(value);
    setSelectedFoodId(null);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!value || value.trim().length === 0) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsSearchingFood(true);
    searchTimeoutRef.current = setTimeout(async () => {
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

  // Open Modal for Add
  const handleOpenAddModal = (initialTab = 'manual') => {
    setEditingMeal(null);
    setActiveTab(initialTab);
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
    setAiError(null);
    setIsAnalyzing(false);

    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEditModal = (meal) => {
    setEditingMeal(meal);
    setActiveTab('manual');
    setMealType(meal.mealType);
    setFoodName(meal.foodName);
    const grams = meal.quantityGrams || (meal.quantity ? parseInt(meal.quantity, 10) : 150) || 150;
    setQuantityGrams(grams);
    setCaloriesPer100g(meal.caloriesPer100g || (meal.calories && grams ? Math.round((meal.calories / grams) * 100) : null));
    setSelectedFoodId(meal.foodId || null);
    setSuggestions([]);
    setShowSuggestions(false);
    setIsModalOpen(true);
  };

  // Handle Image Selection for AI Scanner
  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setAiError('Please select a valid image file (JPEG, PNG, WebP).');
      return;
    }

    setAiError(null);
    setAiScanResult(null);
    setAiFoodsList([]);
    setAiMimeType(file.type);

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const dataUrl = uploadEvent.target.result;
      setAiImagePreview(dataUrl);

      // Extract base64 payload
      const base64Data = dataUrl.split(',')[1];
      setAiImageBase64(base64Data);
    };
    reader.readAsDataURL(file);
  };

  // Trigger AI Image Analysis
  const handleAnalyzeImage = async () => {
    if (!aiImageBase64) {
      setAiError('Please choose or capture a food photo first.');
      return;
    }

    try {
      setIsAnalyzing(true);
      setAiError(null);

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
        setAiError(
          res.data.message ||
          "We couldn't confidently identify this food. The image may be unclear, blurry, or dark. Please try a clearer picture or enter the food manually."
        );
      }
    } catch (err) {
      console.error('AI image analysis error:', err);
      const errMsg = err.response?.data?.message || 'AI food analysis is temporarily unavailable. Please add your meal manually.';
      setAiError(errMsg);
    } finally {
      setIsAnalyzing(false);
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

  // Calculated Calories for Manual Tab
  const calculatedManualCalories =
    caloriesPer100g && quantityGrams > 0
      ? Math.round((Number(caloriesPer100g) / 100) * Number(quantityGrams))
      : null;

  // Save Meal from Manual Entry Form
  const handleSaveManualMeal = async (e) => {
    e.preventDefault();
    if (!foodName.trim()) {
      alert('Please provide a food name.');
      return;
    }

    const grams = Number(quantityGrams);
    if (isNaN(grams) || grams <= 0) {
      alert('Please enter a valid portion in grams greater than 0.');
      return;
    }

    try {
      if (editingMeal) {
        await api.put(`/meals/${editingMeal._id}`, {
          mealType,
          foodName: foodName.trim(),
          quantityGrams: grams,
          caloriesPer100g: caloriesPer100g || undefined,
          calories: calculatedManualCalories || Number(editingMeal.calories),
          date
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
          date
        });
      }

      setIsModalOpen(false);
      fetchMeals();
    } catch (err) {
      console.error('Save meal error:', err);
      alert(err.response?.data?.message || 'Failed to save meal record.');
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
        date,
        foodName: item.foodName.trim(),
        foodId: item.foodId || null,
        quantityGrams: grams,
        caloriesPer100g: Number(item.caloriesPer100g) || 150,
        calories: item.estimatedCalories || Math.round(((Number(item.caloriesPer100g) || 150) / 100) * grams),
        source: 'ai',
        saveNewFood: !item.isKnown
      });

      fetchMeals();
      setAiFoodsList((prev) => {
        const remaining = prev.filter((_, i) => i !== index);
        if (remaining.length === 0) {
          setIsModalOpen(false);
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

  // Save Meal from AI Scanner Result (Multi-Food Plate)
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
        date,
        meals: aiFoodsList.map((item) => ({
          foodName: item.foodName.trim(),
          foodId: item.foodId || null,
          quantityGrams: Number(item.estimatedWeightGrams),
          caloriesPer100g: Number(item.caloriesPer100g) || 150,
          source: 'ai',
          saveNewFood: !item.isKnown
        }))
      });

      setIsModalOpen(false);
      fetchMeals();
    } catch (err) {
      console.error('Save AI meal error:', err);
      alert(err.response?.data?.message || 'Failed to save meal records from AI scan.');
    }
  };

  // Delete Meal
  const handleDeleteMeal = async (id) => {
    if (!window.confirm('Are you sure you want to delete this meal record?')) return;
    try {
      await api.delete(`/meals/${id}`);
      fetchMeals();
    } catch (err) {
      alert('Failed to delete meal.');
    }
  };

  const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-sora text-2xl md:text-3xl font-bold text-navy-900 dark:text-slate-200 flex items-center space-x-2.5">
            <div className="p-2 rounded-[10px] bg-emerald-100 text-emerald-700">
              <Utensils className="w-6 h-6" />
            </div>
            <span>Meal Tracker</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Log Sri Lankan & international meals with smart food search and AI scanner
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          {/* Date Selector */}
          <div className="flex items-center space-x-2 bg-white dark:bg-slate-800 px-3.5 py-2 rounded-xl border border-line dark:border-slate-700 shadow-sm text-xs font-semibold text-slate-700 dark:text-slate-200 font-mono">
            <CalendarIcon className="w-4 h-4 text-emerald-700" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent focus:outline-none text-navy-900 dark:text-slate-200"
            />
          </div>

          {/* AI Quick Scan Button */}
          <button
            onClick={() => handleOpenAddModal('ai')}
            className="flex items-center space-x-1.5 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-sm transition-all"
            title="Scan food with camera or image"
          >
            <Camera className="w-4 h-4" />
            <span className="hidden sm:inline">Scan Food</span>
          </button>

          {/* Add Meal Button */}
          <button
            onClick={() => handleOpenAddModal('manual')}
            className="flex items-center space-x-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 hover:-translate-y-1 text-white shadow-[0_4px_14px_rgba(31,111,79,0.2)] transition-all duration-300 font-semibold text-xs rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Meal</span>
          </button>
        </div>
      </div>

      {/* Summary Banner */}
      <div className="bg-gradient-to-r from-navy-900 via-slate-900 to-green-900 rounded-[16px] p-6 text-white shadow-md flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-green-400 font-mono">
            Total Calories Consumed
          </span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="font-mono text-3xl md:text-4xl font-extrabold">{totalCalories}</span>
            <span className="text-sm text-[#A7B4AC] font-medium font-mono">kcal</span>
          </div>
        </div>
        <div className="p-3.5 rounded-[12px] bg-white/10 backdrop-blur-md">
          <Flame className="w-7 h-7 text-amber-400" />
        </div>
      </div>

      {/* Meals grouped by category */}
      {loading ? (
        <div className="py-12 text-center text-slate-500 dark:text-slate-400 font-medium">Loading meals...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mealTypes.map((type) => {
            const groupMeals = meals.filter((m) => m.mealType === type);
            const groupCalories = groupMeals.reduce((sum, m) => sum + (m.totalCalories || m.calories || 0), 0);

            return (
              <div
                key={type}
                className="bg-white dark:bg-slate-800 rounded-[16px] p-5 border border-line dark:border-slate-700 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-line dark:border-slate-700">
                  <div className="flex items-center space-x-2">
                    <span className="font-sora font-bold text-navy-900 dark:text-slate-200 text-base">{type}</span>
                    <span className="text-xs font-semibold text-slate-400 font-mono">({groupMeals.length})</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                    {groupCalories} kcal
                  </span>
                </div>

                {groupMeals.length > 0 ? (
                  <div className="space-y-2.5">
                    {groupMeals.map((meal) => (
                      <div
                        key={meal._id}
                        className="flex items-center justify-between p-3 rounded-xl bg-white/80 dark:bg-slate-900/50 border border-white/80 dark:border-white/10 shadow-inner hover:bg-slate-100/80 transition-colors group"
                      >
                        <div className="truncate pr-2">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-semibold text-navy-900 dark:text-slate-200 text-sm truncate">{meal.foodName}</h4>
                            {meal.source === 'ai' && (
                              <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200">
                                <Sparkles className="w-2.5 h-2.5" />
                                <span>AI Scan</span>
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {meal.quantityGrams ? `${meal.quantityGrams}g` : meal.quantity}
                            {meal.caloriesPer100g ? ` • ${meal.caloriesPer100g} kcal/100g` : ''}
                          </p>
                        </div>

                        <div className="flex items-center space-x-3">
                          <span className="font-mono text-xs font-bold text-navy-900 dark:text-slate-200">
                            {meal.totalCalories || meal.calories} kcal
                          </span>
                          <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100">
                            <button
                              onClick={() => handleOpenEditModal(meal)}
                              className="p-1 rounded text-slate-400 hover:text-emerald-700 hover:bg-white dark:hover:bg-slate-700"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteMeal(meal._id)}
                              className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-white dark:hover:bg-slate-700"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center text-xs text-slate-400 border border-dashed border-line dark:border-slate-700 rounded-xl bg-[#FAFAF8] dark:bg-slate-900">
                    No {type.toLowerCase()} items logged for this date.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal for Add / Edit Meal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMeal ? 'Edit Meal Entry' : 'Add Meal'}
      >
        {/* Tab Toggle (Only for Add Meal) */}
        {!editingMeal && (
          <div className="flex p-1 bg-slate-100 rounded-xl mb-4 border border-line dark:border-slate-700">
            <button
              type="button"
              onClick={() => setActiveTab('manual')}
              className={`flex-1 flex items-center justify-center space-x-1.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'manual'
                  ? 'bg-white dark:bg-slate-800 text-navy-900 dark:text-slate-200 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-navy-900 dark:text-slate-200'
              }`}
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>Manual Entry</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ai')}
              className={`flex-1 flex items-center justify-center space-x-1.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'ai'
                  ? 'bg-white dark:bg-slate-800 text-emerald-700 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-emerald-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Scan Food with AI</span>
            </button>
          </div>
        )}

        {/* TAB 1: MANUAL FOOD ENTRY */}
        {activeTab === 'manual' && (
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
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 hover:-translate-y-1 text-white shadow-[0_4px_14px_rgba(31,111,79,0.2)] transition-all duration-300 font-sora font-semibold rounded-xl text-sm transition-colors shadow-sm flex items-center justify-center space-x-2"
            >
              <span>{editingMeal ? 'Update Meal' : 'Add Meal'}</span>
            </button>
          </form>
        )}

        {/* TAB 2: AI FOOD IMAGE SCANNER */}
        {activeTab === 'ai' && (
          <div className="space-y-4">
            {/* Image Upload Area */}
            {!aiImagePreview ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-line dark:border-slate-700 rounded-2xl p-6 text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/40 transition-all bg-[#FAFAF8] dark:bg-slate-900 group"
              >
                <input
                  type="file"
                  ref={fileInputRef}
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
                  {!isAnalyzing && (
                    <button
                      onClick={() => {
                        setAiImagePreview(null);
                        setAiImageBase64(null);
                        setAiScanResult(null);
                        setAiFoodsList([]);
                        setAiError(null);
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
                    disabled={isAnalyzing}
                    onClick={handleAnalyzeImage}
                    className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-600 disabled:bg-slate-300 text-white font-sora font-semibold rounded-xl text-xs transition-colors shadow-sm flex items-center justify-center space-x-2"
                  >
                    {isAnalyzing ? (
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
            {aiError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs space-y-2">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold">Recognition Notice</div>
                    <div>{aiError}</div>
                  </div>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('manual');
                      setAiError(null);
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
                              className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${
                                item.isKnown
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
    </div>
  );
};

export default MealTracker;
