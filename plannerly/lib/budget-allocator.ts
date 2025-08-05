/**
 * Budget allocation utilities for events.
 */
export interface BudgetAllocation {
  [category: string]: number;
}

export interface VendorSelection {
  category: string;
  price?: number;
}

// Default allocation templates by event type
const templates: Record<string, BudgetAllocation> = {
  wedding: {
    venue: 0.30,
    catering: 0.25,
    photography: 0.12,
    flowers: 0.08,
    music: 0.07,
    misc: 0.18,
  },
  birthday: {
    venue: 0.20,
    catering: 0.30,
    entertainment: 0.20,
    decor: 0.10,
    misc: 0.20,
  },
};

/**
 * Allocate a total budget across categories using the specified event type template.
 */
export function allocateBudget(totalBudget: number, eventType: string): BudgetAllocation {
  const template = templates[eventType] || {};
  const allocation: BudgetAllocation = {};
  for (const category in template) {
    allocation[category] = Math.round(template[category] * totalBudget);
  }
  return allocation;
}

/**
 * Calculate the total spent from selected vendors.
 */
export function spentAmount(selectedVendors: VendorSelection[]): number {
  return selectedVendors.reduce((sum, v) => sum + (v.price ?? 0), 0);
}

/**
 * Dynamically reallocate budget after vendors have been selected.
 * Subtracts selected vendor prices from their categories and adjusts remaining categories proportionally.
 */
export function reallocateBudget(
  currentAllocations: BudgetAllocation,
  selectedVendors: VendorSelection[],
  totalBudget: number
): BudgetAllocation {
  const newAllocations: BudgetAllocation = { ...currentAllocations };

  // subtract spent from their categories
  for (const vendor of selectedVendors) {
    if (vendor.category && vendor.price !== undefined) {
      newAllocations[vendor.category] =
        (newAllocations[vendor.category] ?? 0) - vendor.price;
    }
  }

  // compute remaining budget across positive categories
  let remainingBudget = 0;
  const remainingCategories: string[] = [];
  for (const category in newAllocations) {
    if (newAllocations[category] > 0) {
      remainingBudget += newAllocations[category];
      remainingCategories.push(category);
    }
  }

  // adjust categories proportionally to the remaining total budget
  const spent = spentAmount(selectedVendors);
  if (remainingBudget > 0 && (totalBudget - spent) > 0) {
    for (const category of remainingCategories) {
      const portion = newAllocations[category] / remainingBudget;
      newAllocations[category] = Math.round(portion * (totalBudget - spent));
    }
  }

  return newAllocations;
}

/**
 * Generate overage warnings for categories that exceed their allocation.
 */
export function getOverageWarnings(
  allocation: BudgetAllocation,
  selectedVendors: VendorSelection[]
): string[] {
  const warnings: string[] = [];
  const spentPerCategory: Record<string, number> = {};

  for (const vendor of selectedVendors) {
    const price = vendor.price ?? 0;
    spentPerCategory[vendor.category] =
      (spentPerCategory[vendor.category] ?? 0) + price;
  }

  for (const category in spentPerCategory) {
    const allocated = allocation[category] ?? 0;
    const spentInCategory = spentPerCategory[category];
    if (spentInCategory > allocated) {
      const overBy = spentInCategory - allocated;
      warnings.push(
        `${category} is over budget by $${overBy.toFixed(2)}`
      );
    }
  }

  return warnings;
}

// Must-have vs nice-to-have categorizations by event type
export const mustHaveCategories: Record<string, string[]> = {
  wedding: ['venue', 'catering', 'photography'],
  birthday: ['venue', 'catering', 'entertainment'],
};

export const niceToHaveCategories: Record<string, string[]> = {
  wedding: ['flowers', 'music', 'misc'],
  birthday: ['decor', 'misc'],
};

/**
 * Provide budget recommendations based on remaining budget and spending patterns.
 */
export function getBudgetRecommendations(
  totalBudget: number,
  selectedVendors: VendorSelection[],
  eventType: string
): string[] {
  const recommendations: string[] = [];
  const spent = spentAmount(selectedVendors);
  const remaining = totalBudget - spent;
  const template = templates[eventType] || {};

  // Suggest categories that are under-invested relative to template
  for (const category in template) {
    const allocated = template[category] * totalBudget;
    const spentInCategory = selectedVendors
      .filter((v) => v.category === category)
      .reduce((sum, v) => sum + (v.price ?? 0), 0);
    if (allocated > 0 && spentInCategory / allocated < 0.5) {
      recommendations.push(`Consider investing more in ${category}.`);
    }
  }

  // Splurge vs save suggestions
  if (remaining / totalBudget < 0.1) {
    recommendations.push(
      'You are nearing your budget limit. Look for more cost‑effective options.'
    );
  } else {
    recommendations.push(
      'You have room in your budget. You might consider splurging on must‑have items.'
    );
  }

  return recommendations;
}
