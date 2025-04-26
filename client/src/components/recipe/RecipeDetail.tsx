import { useState } from "react";
import { Recipe } from "@shared/types";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import RecipeSimilar from "./RecipeSimilar";

interface RecipeDetailProps {
  recipe: Recipe;
  similarRecipes: Recipe[];
}

export default function RecipeDetail({ recipe, similarRecipes }: RecipeDetailProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());
  
  const handleSaveRecipe = async () => {
    try {
      setIsSaving(true);
      
      if (recipe.isSaved) {
        await apiRequest('DELETE', `/api/recipes/saved/${recipe.id}`);
        toast({
          title: "Recipe removed",
          description: "Recipe has been removed from your saved recipes",
        });
      } else {
        await apiRequest('POST', '/api/recipes/saved', { recipeId: recipe.id });
        toast({
          title: "Recipe saved",
          description: "Recipe has been added to your saved recipes",
        });
      }
      
      // Update recipe saved status
      queryClient.invalidateQueries({ queryKey: ['/api/recipes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/recipes/saved'] });
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save recipe. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const toggleIngredient = (index: number) => {
    const newChecked = new Set(checkedIngredients);
    if (newChecked.has(index)) {
      newChecked.delete(index);
    } else {
      newChecked.add(index);
    }
    setCheckedIngredients(newChecked);
  };
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: recipe.title,
        text: `Check out this recipe: ${recipe.title}`,
        url: window.location.href,
      }).catch(err => {
        toast({
          title: "Sharing failed",
          description: "Could not share this recipe",
          variant: "destructive",
        });
      });
    } else {
      // Fallback for browsers that don't support navigator.share
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Recipe link copied to clipboard",
      });
    }
  };
  
  return (
    <section className="bg-white rounded-xl shadow-md p-6 mb-10">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-3xl font-display font-bold mb-2">{recipe.title}</h2>
          <p className="text-gray-600">{recipe.description}</p>
        </div>
        <div className="flex space-x-2">
          <button 
            className="bg-neutral-lightest border border-neutral hover:bg-neutral-light transition-colors rounded-lg py-2 px-4 flex items-center"
            onClick={handleSaveRecipe}
            disabled={isSaving}
          >
            <i className={`${recipe.isSaved ? 'fas' : 'far'} fa-heart mr-2 text-accent`}></i>
            {recipe.isSaved ? 'Saved' : 'Save'}
          </button>
          <button 
            className="bg-neutral-lightest border border-neutral hover:bg-neutral-light transition-colors rounded-lg py-2 px-4 flex items-center"
            onClick={handleShare}
          >
            <i className="fas fa-share-alt mr-2"></i>
            Share
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/5">
          <div className="rounded-xl overflow-hidden mb-6">
            <img 
              src={recipe.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"}
              alt={recipe.title}
              className="w-full h-64 object-cover"
            />
          </div>

          <div className="bg-neutral-lightest rounded-xl p-5 mb-6">
            <h3 className="font-display font-bold text-xl mb-4">Nutrition Facts</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Calories</p>
                <p className="font-medium">{recipe.nutritionFacts.calories} kcal</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Protein</p>
                <p className="font-medium">{recipe.nutritionFacts.protein}g</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Carbs</p>
                <p className="font-medium">{recipe.nutritionFacts.carbs}g</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Fat</p>
                <p className="font-medium">{recipe.nutritionFacts.fat}g</p>
              </div>
            </div>
          </div>

          <div className="bg-neutral-lightest rounded-xl p-5">
            <h3 className="font-display font-bold text-xl mb-4">Recipe Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center">
                <i className="fas fa-clock text-primary mr-2"></i>
                <div>
                  <p className="text-sm text-gray-600">Prep Time</p>
                  <p className="font-medium">{recipe.prepTime} min</p>
                </div>
              </div>
              <div className="flex items-center">
                <i className="fas fa-fire text-primary mr-2"></i>
                <div>
                  <p className="text-sm text-gray-600">Cook Time</p>
                  <p className="font-medium">{recipe.cookTime} min</p>
                </div>
              </div>
              <div className="flex items-center">
                <i className="fas fa-utensils text-primary mr-2"></i>
                <div>
                  <p className="text-sm text-gray-600">Servings</p>
                  <p className="font-medium">{recipe.servings}</p>
                </div>
              </div>
              <div className="flex items-center">
                <i className="fas fa-signal text-primary mr-2"></i>
                <div>
                  <p className="text-sm text-gray-600">Difficulty</p>
                  <p className="font-medium">{recipe.difficulty}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:w-3/5">
          <div className="mb-8">
            <h3 className="font-display font-bold text-xl mb-4">Ingredients</h3>
            <ul className="space-y-3">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-start">
                  <input 
                    type="checkbox" 
                    id={`ingredient-${index}`}
                    checked={checkedIngredients.has(index)}
                    onChange={() => toggleIngredient(index)}
                    className="mt-1 mr-3 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary-light" 
                  />
                  <label 
                    htmlFor={`ingredient-${index}`}
                    className={`text-gray-800 ${checkedIngredients.has(index) ? 'line-through text-gray-500' : ''}`}
                  >
                    {ingredient}
                  </label>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display font-bold text-xl mb-4">Instructions</h3>
            <ol className="space-y-4" style={{ counterReset: 'step-counter' }}>
              {recipe.instructions.map((instruction, index) => (
                <li key={index} className="recipe-step">
                  <div className="ml-2">
                    <p className="text-gray-800">{instruction}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      {similarRecipes.length > 0 && (
        <div className="border-t border-neutral mt-8 pt-6">
          <h3 className="font-display font-bold text-xl mb-4">Similar Recipes You Might Like</h3>
          <RecipeSimilar recipes={similarRecipes} />
        </div>
      )}
    </section>
  );
}
