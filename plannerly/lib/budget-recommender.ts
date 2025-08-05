/**
 * This module provides smart budget recommendations based on remaining budget,
 * selected vendor price points, user preferences and category priorities.
 */

export interface VendorSelection {
  category: string;
  price: number;
  essential?: boolean;
}

export interface UserPreferences {
  // Higher values indicate a preference for spending more on that category
  categoryPriorities: Record<string, number>;
  // Total budget available for the event
  totalBudget: number;
}

/**
 * Generates a list of recommendations on how to optimize spending across categories.
 *
 * The algorithm compares the user's allocations and priorities against their actual
 * selections to advise where they might save or splurge. Over budget categories
 * are flagged and suggestions are made to either scale back or shift funds from
 * less important categories.
 */
export function generateBudgetRecommendations(
  selections: VendorSelection[],
  prefs: UserPreferences
): string[] {
  const { categoryPriorities, totalBudget } = prefs;
  // Sum spent per category
  const spentByCategory: Record<string, number> = {};
  selections.forEach(({ category, price }) => {
    spentByCategory[category] = (spentByCategory[category] || 0) + price;
  });
  // Compute total spent
  const totalSpent = Object.values(spentByCategory).reduce((sum, v) => sum + v, 0);
  const remaining = totalBudget - totalSpent;

  const recommendations: string[] = [];

  // Overage or remaining message
  if (remaining < 0) {
    recommendations.push(
      `You are currently over budget by $${Math.abs(remaining).toFixed(0)}. Consider scaling back on non‑essential categories or negotiating lower rates.`
    );
  } else if (remaining > 0) {
    recommendations.push(
      `You have $${remaining.toFixed(0)} remaining in your budget. Consider investing more in high priority categories or adding nice‑to‑have elements.`
    );
  }

  // Determine categories sorted by priority
  const categories = Object.keys(categoryPriorities);
  categories.sort((a, b) => (categoryPriorities[b] || 0) - (categoryPriorities[a] || 0));

  // Suggest adjustments based on spending vs. priority
  categories.forEach((category) => {
    const spent = spentByCategory[category] || 0;
    const priority = categoryPriorities[category] || 0;

    if (priority > 0 && remaining > 0 && spent < 0.5 * priority * totalBudget) {
      recommendations.push(
        `You still have room to enhance your ${category} – consider allocating more budget here to better reflect your preferences.`
      );
    }

    // Suggest savings if spent exceeds expected proportion of budget
    const expectedShare = priority / Object.values(categoryPriorities).reduce((a, b) => a + b, 0);
    const expectedAmount = expectedShare * totalBudget;
    if (spent > expectedAmount * 1.2) {
      recommendations.push(
        `You are spending a lot on ${category}. To stay on track, consider choosing a more affordable option or trimming extras in this category.`
      );
    }
  });

  // General splurge vs save recommendation
  if (remaining > 0) {
    const topPriority = categories[0];
    recommendations.push(
      `With budget left over, you could splurge on your top priority: ${topPriority}. Look for premium options or added services in this category.`
    );
  } else {
    const lowestPriority = categories[categories.length - 1];
    recommendations.push(
      `Since funds are tight, focus on essentials and look for savings in lower priority areas like ${lowestPriority}.`
    );
  }

  return recommendations;
}
