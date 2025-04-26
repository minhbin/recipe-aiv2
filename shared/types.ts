export interface RecipeGenerationRequest {
  description: string;
  dietaryPreferences?: string[];
  cookingTime?: number;
}

export interface NutritionFacts {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Recipe {
  id: number;
  title: string;
  description: string;
  imageUrl?: string;
  ingredients: string[];
  instructions: string[];
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: string;
  tags: string[];
  nutritionFacts: NutritionFacts;
  isAIGenerated: boolean;
  isSaved?: boolean;
  createdAt: string;
}
