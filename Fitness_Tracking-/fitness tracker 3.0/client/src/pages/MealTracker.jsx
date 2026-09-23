import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import { Utensils, Plus, Trash2, Edit2, Flame, Calendar as CalendarIcon, Clock } from 'lucide-react';

const MealTracker = () => {
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [meals, setMeals] = useState([]);
  const [totalCalories, setTotalCalories] = useState(0);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);

  // Form State
  const [mealType, setMealType] = useState('Breakfast');
  const [foodName, setFoodName] = useState('');
  const [quantity, setQuantity] = useState('1 portion');
  const [calories, setCalories] = useState('');

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

  const handleOpenAddModal = () => {
    setEditingMeal(null);
    setMealType('Breakfast');
    setFoodName('');
    setQuantity('1 portion');
    setCalories('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (meal) => {
    setEditingMeal(meal);
    setMealType(meal.mealType);
    setFoodName(meal.foodName);
    setQuantity(meal.quantity);
    setCalories(meal.calories);
    setIsModalOpen(true);
  };

  const handleSaveMeal = async (e) => {
    e.preventDefault();
    if (!foodName || !calories) return;

    try {
      if (editingMeal) {
        await api.put(`/meals/${editingMeal._id}`, {
          mealType,
          foodName,
          quantity,
          calories: Number(calories),
          date
        });
      } else {
        await api.post('/meals', {
          mealType,
          foodName,
          quantity,
          calories: Number(calories),
          date
        });
      }
      setIsModalOpen(false);
      fetchMeals();
    } catch (err) {
      alert('Failed to save meal record.');
    }
  };

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
          <h1 className="font-sora text-2xl md:text-3xl font-bold text-navy-900 flex items-center space-x-2.5">
            <div className="p-2 rounded-[10px] bg-green-100 text-green-700">
              <Utensils className="w-6 h-6" />
            </div>
            <span>Meal Tracker</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Log your food intake and monitor daily caloric consumption
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Date Selector */}
          <div className="flex items-center space-x-2 bg-white px-3.5 py-2 rounded-xl border border-line shadow-sm text-xs font-semibold text-slate-700 font-mono">
            <CalendarIcon className="w-4 h-4 text-green-700" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent focus:outline-none text-navy-900"
            />
          </div>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center space-x-1.5 px-4 py-2.5 bg-green-700 hover:bg-green-600 text-white font-semibold text-xs rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Meal</span>
          </button>
        </div>
      </div>

      {/* Summary Banner */}
      <div className="bg-gradient-to-r from-navy-900 to-green-900 rounded-[16px] p-6 text-white shadow-md flex items-center justify-between">
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
        <div className="py-12 text-center text-slate-500 font-medium">Loading meals...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mealTypes.map((type) => {
            const groupMeals = meals.filter((m) => m.mealType === type);
            const groupCalories = groupMeals.reduce((sum, m) => sum + m.calories, 0);

            return (
              <div
                key={type}
                className="bg-white rounded-[16px] p-5 border border-line shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-line">
                  <div className="flex items-center space-x-2">
                    <span className="font-sora font-bold text-navy-900 text-base">{type}</span>
                    <span className="text-xs font-semibold text-slate-400 font-mono">({groupMeals.length})</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-green-700 bg-green-100 px-2.5 py-1 rounded-full">
                    {groupCalories} kcal
                  </span>
                </div>

                {groupMeals.length > 0 ? (
                  <div className="space-y-2.5">
                    {groupMeals.map((meal) => (
                      <div
                        key={meal._id}
                        className="flex items-center justify-between p-3 rounded-xl bg-[#FAFAF8] border border-line hover:bg-slate-100/80 transition-colors group"
                      >
                        <div className="truncate pr-2">
                          <h4 className="font-semibold text-navy-900 text-sm truncate">{meal.foodName}</h4>
                          <p className="text-xs text-slate-500">{meal.quantity}</p>
                        </div>

                        <div className="flex items-center space-x-3">
                          <span className="font-mono text-xs font-bold text-navy-900">{meal.calories} kcal</span>
                          <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100">
                            <button
                              onClick={() => handleOpenEditModal(meal)}
                              className="p-1 rounded text-slate-400 hover:text-green-700 hover:bg-white"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteMeal(meal._id)}
                              className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-white"
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
                  <div className="py-6 text-center text-xs text-slate-400 border border-dashed border-line rounded-xl bg-[#FAFAF8]">
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
        title={editingMeal ? 'Edit Meal Entry' : 'Add New Meal'}
      >
        <form onSubmit={handleSaveMeal} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1 font-mono">Meal Category</label>
            <select
              value={mealType}
              onChange={(e) => setMealType(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-line focus:ring-2 focus:ring-green-600 text-sm bg-[#FAFAF8]"
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
              placeholder="e.g. Scrambled Eggs with Avocado"
              className="w-full px-4 py-3 rounded-xl border border-line focus:ring-2 focus:ring-green-600 text-sm bg-[#FAFAF8]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1 font-mono">Portion / Quantity</label>
            <input
              type="text"
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="e.g. 2 eggs, 1 slice toast"
              className="w-full px-4 py-3 rounded-xl border border-line focus:ring-2 focus:ring-green-600 text-sm bg-[#FAFAF8]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1 font-mono">Calories (kcal)</label>
            <input
              type="number"
              required
              min="0"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              placeholder="e.g. 350"
              className="w-full px-4 py-3 rounded-xl border border-line focus:ring-2 focus:ring-green-600 text-sm bg-[#FAFAF8]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-green-700 hover:bg-green-600 text-white font-sora font-semibold rounded-xl text-sm transition-colors shadow-sm"
          >
            {editingMeal ? 'Update Meal' : 'Save Meal Record'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default MealTracker;
