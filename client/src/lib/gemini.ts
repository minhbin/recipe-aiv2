import { apiRequest } from './queryClient';
import { Recipe, RecipeGenerationRequest } from '@shared/types';

export async function generateRecipe(request: RecipeGenerationRequest): Promise<Recipe> {
  const response = await apiRequest('POST', '/api/recipes/generate', request);
  return response.json();
}

export async function getRecipeSuggestions(query: string): Promise<Recipe[]> {
  const response = await apiRequest('GET', `/api/recipes/suggest?query=${encodeURIComponent(query)}`);
  return response.json();
}
