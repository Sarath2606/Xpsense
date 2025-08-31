import React from 'react';
import CircularProgress from './CircularProgress';

const SavingsGoalPost2 = ({
  onBack,
  goalTitle = 'Savings Goal',
  goalSubtitle = 'Track your progress',
  savedAmount = 3500,
  targetAmount = 5000,
  accent = '#111111',
  onAddSavings,
  onEditGoal,
  goalIcon = '💰' // Default icon, can be overridden
}) => {
  // Ensure we have valid numbers
  const safeSavedAmount = typeof savedAmount === 'number' ? savedAmount : 0;
  const safeTargetAmount = typeof targetAmount === 'number' ? targetAmount : 1;
  const percent = Math.max(0, Math.min(100, Math.round((safeSavedAmount / safeTargetAmount) * 100)));

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-6 py-6">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onBack} className="text-gray-700 font-medium flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Goals
          </button>
        </div>

        <div className="rounded-3xl overflow-hidden shadow-xl border border-gray-200">
          {/* Header band */}
          <div className="p-5" style={{ background: '#f6f6f6' }}>
            <div className="text-xs uppercase tracking-widest text-gray-500">Savings</div>
            <h2 className="mt-1 text-2xl font-extrabold text-gray-900">{goalTitle}</h2>
            <p className="text-gray-600 text-sm">{goalSubtitle}</p>
          </div>

          {/* Content */}
          <div className="bg-white p-6">
                         <div className="flex items-center">
               <div className="mr-5">
                 <CircularProgress 
                   progress={percent}
                   icon={goalIcon}
                   size="md"
                 />
               </div>
              <div className="flex-1">
                <div className="text-sm text-gray-500">Saved</div>
                <div className="text-3xl font-bold text-gray-900">${safeSavedAmount.toLocaleString()}</div>
                <div className="mt-1 text-sm text-gray-500">Target ${safeTargetAmount.toLocaleString()}</div>
                <div className="mt-4 h-2 w-full bg-gray-200 rounded-full">
                  <div className="h-2 rounded-full" style={{ width: `${percent}%`, backgroundColor: accent }} />
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  const amount = typeof window !== 'undefined' ? window.prompt('Add amount to savings', '100') : null;
                  if (!amount) return;
                  const parsed = parseFloat(amount);
                  if (Number.isFinite(parsed) && parsed > 0) onAddSavings?.(parsed);
                }}
                className="px-4 py-2 rounded-xl bg-black text-white font-semibold"
              >
                Add Savings
              </button>
              <button onClick={onEditGoal} className="px-4 py-2 rounded-xl border border-gray-300 text-gray-800 font-semibold">Edit Goal</button>
            </div>
          </div>

          {/* Footer band */}
          <div className="px-6 py-4 border-t bg-gray-50">
            <div className="text-xs text-gray-500">Designed to match Figma Post 2</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavingsGoalPost2;


