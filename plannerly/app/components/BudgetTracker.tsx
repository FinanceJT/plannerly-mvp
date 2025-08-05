'use client';

import React from 'react';

interface CategoryBudget {
  allocated: number;
  spent: number;
}

interface BudgetTrackerProps {
  totalBudget: number;
  budgets: { [category: string]: CategoryBudget };
}

/**
 * BudgetTracker displays budget allocation, spent and remaining amounts for each category.
 * It shows a progress bar for each category and a total remaining budget summary.
 */
const BudgetTracker: React.FC<BudgetTrackerProps> = ({ totalBudget, budgets }) => {
  // Calculate the remaining total budget by subtracting all spent amounts
  const remainingTotal = totalBudget - Object.values(budgets).reduce((sum, { spent }) => sum + spent, 0);

  return (
    <aside className="w-full p-4 bg-gray-50 border rounded">
      <h2 className="text-lg font-semibold mb-2">Budget Tracker</h2>
      <div className="mb-4">
        <p className="font-semibold">Remaining Budget:</p>
        <p className="text-2xl text-green-600">${remainingTotal.toFixed(0)}</p>
      </div>
      {Object.entries(budgets).map(([category, { allocated, spent }]) => {
        const remaining = allocated - spent;
        const percent = allocated > 0 ? Math.min(spent / allocated, 1) * 100 : 0;
        return (
          <div key={category} className="mb-4">
            <div className="flex justify-between mb-1">
              <span className="font-medium">
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </span>
              <span className="text-sm">{`$${spent.toFixed(0)} / $${allocated.toFixed(0)}`}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-500 h-3 rounded-full"
                style={{ width: `${percent}%` }}
              ></div>
            </div>
            <p className={`text-sm ${remaining < 0 ? 'text-red-600' : 'text-gray-600'}`}>
              {remaining < 0
                ? `Over by $${Math.abs(remaining).toFixed(0)}`
                : `${remaining.toFixed(0)} remaining`}
            </p>
          </div>
        );
      })}
    </aside>
  );
};

export default BudgetTracker;
