import React, { useState, useEffect } from 'react';
import { fetchAPI } from '../utils/api';
import { Award, Lock, Sparkles, Calendar } from 'lucide-react';

const Achievements = () => {
  const [unlocked, setUnlocked] = useState([]);
  const [loading, setLoading] = useState(true);

  const ALL_ACHIEVEMENTS = [
    {
      type: 'FIRST_TOPIC',
      title: 'First Step',
      description: 'Created your first learning topic! The journey of a thousand miles begins with a single step.',
    },
    {
      type: 'FIVE_TOPICS',
      title: 'Dedicated Learner',
      description: 'Created five learning topics! You are building momentum.',
    },
    {
      type: 'FIRST_JOURNAL',
      title: 'Journalist',
      description: 'Wrote your first learning journal entry. Documenting is key to retention.',
    },
    {
      type: 'FIRST_PROJECT',
      title: 'Builder',
      description: 'Created your first project tracker! Moving from theory to practice.',
    },
    {
      type: 'GOAL_CRUSHER',
      title: 'Goal Crusher',
      description: 'Completed five learning or productivity goals. Stay focused!',
    }
  ];

  useEffect(() => {
    const loadAchievements = async () => {
      try {
        const data = await fetchAPI('/achievements');
        setUnlocked(data);
      } catch (err) {
        console.error('Error loading achievements:', err);
      } finally {
        setLoading(false);
      }
    };
    loadAchievements();
  }, []);

  const getUnlockDetails = (type) => {
    return unlocked.find(item => item.type === type);
  };

  const unlockedCount = unlocked.length;
  const totalCount = ALL_ACHIEVEMENTS.length;
  const percentage = Math.round((unlockedCount / totalCount) * 100);

  return (
    <div className="flex-1 space-y-8 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            Achievements
            <Sparkles className="w-6 h-6 text-amber-500 dark:text-amber-400 fill-current animate-pulse" />
          </h2>
          <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">Unlock badges by hitting developer learning milestones and completing daily goals.</p>
        </div>

        {/* Progress Scorecard */}
        <div className="glass-panel px-6 py-4 flex items-center gap-4 border-amber-500/20 bg-amber-500/5">
          <div className="bg-gradient-to-tr from-amber-500 to-yellow-400 p-2.5 rounded-xl text-white shadow-lg flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Milestones Met</span>
            <h4 className="text-lg font-black text-slate-900 dark:text-white">{unlockedCount} / {totalCount} ({percentage}%)</h4>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      {loading ? (
        <div className="flex justify-center py-24">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-neonPurple"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ALL_ACHIEVEMENTS.map((item) => {
            const unlockInfo = getUnlockDetails(item.type);
            const isUnlocked = !!unlockInfo;

            return (
              <div 
                key={item.type} 
                className={`glass-panel p-6 flex gap-5 items-start border-slate-200/60 dark:border-glassBorder/40 transition-all duration-300 relative ${
                  isUnlocked 
                    ? 'border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-transparent hover:border-amber-500/50' 
                    : 'opacity-50'
                }`}
              >
                {/* Badge Icon */}
                <div 
                  className={`flex-shrink-0 p-3.5 rounded-2xl shadow-md border ${
                    isUnlocked 
                      ? 'bg-gradient-to-tr from-amber-500 to-yellow-400 border-amber-500/30 text-white' 
                      : 'bg-slate-100 dark:bg-glassBg border-slate-200 dark:border-glassBorder text-slate-400 dark:text-gray-500'
                  }`}
                >
                  {isUnlocked ? (
                    <Award className="w-6 h-6" />
                  ) : (
                    <Lock className="w-6 h-6" />
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 space-y-1.5 pr-2">
                  <h3 className={`text-base font-bold tracking-tight ${isUnlocked ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-gray-400'}`}>
                    {item.title}
                  </h3>
                  <p className={`text-xs leading-relaxed ${isUnlocked ? 'text-slate-600 dark:text-gray-300' : 'text-slate-400 dark:text-gray-500'}`}>
                    {item.description}
                  </p>
                  
                  {isUnlocked && (
                    <div className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-500/80 font-semibold pt-1">
                      <Calendar className="w-3 h-3" />
                      <span>Unlocked {new Date(unlockInfo.unlockedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Achievements;
