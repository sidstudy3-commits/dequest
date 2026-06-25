import React, { useState, useEffect } from 'react';
import { fetchAPI } from '../utils/api';
import { Plus, Trash2, CheckCircle, Circle, AlertCircle, Calendar } from 'lucide-react';

const Goals = ({ onAchievementUnlock }) => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('DAILY');
  
  // Create Goal Form States
  const [goalTitle, setGoalTitle] = useState('');
  const [formError, setFormError] = useState('');

  const loadGoals = async () => {
    try {
      const data = await fetchAPI('/goals');
      setGoals(data);
    } catch (err) {
      console.error('Error loading goals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  const handleAddGoal = async (e) => {
    e.preventDefault();
    if (!goalTitle.trim()) {
      setFormError('Goal title cannot be empty');
      return;
    }

    setFormError('');
    try {
      const response = await fetchAPI('/goals', {
        method: 'POST',
        body: JSON.stringify({
          title: goalTitle,
          type: activeTab
        })
      });
      setGoals(prev => [response, ...prev]);
      setGoalTitle('');
    } catch (err) {
      setFormError(err.message || 'Failed to create goal');
    }
  };

  const handleToggleGoal = async (id) => {
    try {
      const response = await fetchAPI(`/goals/${id}/toggle`, {
        method: 'PATCH'
      });
      
      setGoals(prev => prev.map(g => g.id === id ? response.goal : g));
      
      if (response.newAchievements && response.newAchievements.length > 0) {
        response.newAchievements.forEach(ach => onAchievementUnlock(ach));
      }
    } catch (err) {
      alert('Failed to update goal: ' + err.message);
    }
  };

  const handleDeleteGoal = async (id) => {
    try {
      await fetchAPI(`/goals/${id}`, { method: 'DELETE' });
      setGoals(prev => prev.filter(g => g.id !== id));
    } catch (err) {
      alert('Failed to delete goal: ' + err.message);
    }
  };

  const filteredGoals = goals.filter(g => g.type === activeTab);
  
  const completedCount = filteredGoals.filter(g => g.completed).length;
  const totalCount = filteredGoals.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const tabLabels = {
    DAILY: 'Daily Goals',
    WEEKLY: 'Weekly Targets',
    MONTHLY: 'Monthly Objectives'
  };

  return (
    <div className="flex-1 space-y-8 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Goals Board</h2>
        <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">Set and track milestones to maintain learning streaks and build coding habits.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-glassBorder/60">
        {Object.keys(tabLabels).map((type) => (
          <button
            key={type}
            onClick={() => {
              setActiveTab(type);
              setFormError('');
            }}
            className={`px-6 py-3.5 text-sm font-semibold border-b-2 transition-all ${
              activeTab === type
                ? 'border-neonPurple text-neonPurple dark:text-white bg-neonPurple/5'
                : 'border-transparent text-slate-500 dark:text-gray-400 hover:text-slate-800 hover:dark:text-white'
            }`}
          >
            {tabLabels[type]}
          </button>
        ))}
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Left Side */}
        <div className="space-y-6 md:col-span-1">
          {/* Progress Card */}
          <div className="glass-panel p-6 flex flex-col justify-between h-44">
            <div>
              <span className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Completion Rate</span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {completedCount} / {totalCount}
              </h3>
            </div>

            <div className="space-y-2 mt-4">
              <div className="flex justify-between text-[10px] font-bold text-slate-500 dark:text-gray-400">
                <span>PROGRESS</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-darkBg/60 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-neonPurple to-neonIndigo h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Quick Add Form */}
          <div className="glass-panel p-6">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Add Task</h4>
            {formError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 p-2.5 rounded-xl text-xs font-semibold mb-3">
                {formError}
              </div>
            )}
            <form onSubmit={handleAddGoal} className="space-y-3">
              <input
                type="text"
                value={goalTitle}
                onChange={(e) => setGoalTitle(e.target.value)}
                placeholder="e.g. Solve 2 Leetcode problems"
                className="w-full glass-input text-xs"
                required
              />
              <button type="submit" className="w-full glass-button py-2.5 text-xs flex items-center justify-center gap-1.5">
                <Plus className="w-4 h-4" />
                <span>Add Goal</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Side */}
        <div className="md:col-span-2 space-y-3">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-neonPurple"></div>
            </div>
          ) : filteredGoals.length === 0 ? (
            <div className="glass-panel p-12 text-center text-slate-500 dark:text-gray-400">
              <AlertCircle className="w-10 h-10 text-neonPurple/50 mx-auto mb-3" />
              <p className="text-sm">No active tasks in this section. Add a task on the left!</p>
            </div>
          ) : (
            filteredGoals.map((goal) => (
              <div
                key={goal.id}
                className={`glass-panel p-4 flex items-center justify-between border-slate-200/60 dark:border-glassBorder/40 transition-all ${
                  goal.completed ? 'opacity-60 bg-slate-50 dark:bg-glassBg/10' : ''
                }`}
              >
                <div className="flex items-center gap-3.5 flex-1 cursor-pointer" onClick={() => handleToggleGoal(goal.id)}>
                  <button className="text-slate-400 dark:text-gray-400 hover:text-neonPurple transition-colors flex-shrink-0">
                    {goal.completed ? (
                      <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400 fill-green-500/10 dark:fill-green-400/10" />
                    ) : (
                      <Circle className="w-5 h-5 hover:text-neonPurple" />
                    )}
                  </button>
                  <span
                    className={`text-sm text-slate-800 dark:text-gray-200 truncate max-w-[320px] select-none ${
                      goal.completed ? 'line-through text-slate-400 dark:text-gray-500' : ''
                    }`}
                  >
                    {goal.title}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-slate-400 dark:text-gray-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(goal.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  <button
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="p-1 text-slate-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Goals;
