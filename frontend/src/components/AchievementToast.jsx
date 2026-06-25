import React, { useEffect } from 'react';
import { Award, X, Sparkles } from 'lucide-react';

const AchievementToast = ({ achievement, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 6000); // Auto close after 6 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!achievement) return null;

  return (
    <div className="fixed top-6 right-6 z-50 animate-bounce glass-panel border-amber-500/40 bg-darkBg/90 max-w-sm p-5 shadow-2xl flex gap-4 overflow-hidden">
      {/* Glow Effect */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-500/20 to-transparent blur-md pointer-events-none rounded-full"></div>

      {/* Trophy Badge */}
      <div className="flex-shrink-0 bg-gradient-to-tr from-amber-500 to-yellow-400 p-3 rounded-xl shadow-lg self-start">
        <Award className="w-6 h-6 text-white" />
      </div>

      <div className="flex-grow flex flex-col gap-1 pr-4">
        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 tracking-wider uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Achievement Unlocked!</span>
        </div>
        <h4 className="text-base font-bold text-white">{achievement.title}</h4>
        <p className="text-xs text-gray-300 leading-relaxed mt-0.5">{achievement.description}</p>
      </div>

      {/* Close button */}
      <button 
        onClick={onClose} 
        className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default AchievementToast;
