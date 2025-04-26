import { Link } from "wouter";
import { useState } from "react";
import { Recipe } from "@shared/types";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";

interface RecipeCardProps {
  recipe: Recipe;
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  const [isSaving, setIsSaving] = useState(false);
  
  const handleSaveRecipe = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
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
  
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={recipe.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"} 
          alt={recipe.title} 
          className="w-full h-full object-cover"
        />
        <button 
          className="absolute top-3 right-3 bg-white bg-opacity-80 p-2 rounded-full hover:bg-white transition-colors"
          onClick={handleSaveRecipe}
          disabled={isSaving}
        >
          <i className={`${recipe.isSaved ? 'fas' : 'far'} fa-heart text-accent`}></i>
        </button>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <div className="flex items-center space-x-2">
            {recipe.tags.map((tag, index) => (
              <span key={index} className="text-white text-xs px-2 py-1 bg-primary-dark rounded-full">{tag}</span>
            ))}
            <span className="text-white text-xs px-2 py-1 bg-primary-dark rounded-full">{recipe.cookTime} min</span>
          </div>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-display font-bold text-lg mb-2">{recipe.title}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{recipe.description}</p>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-sm font-medium">
              <i className="fas fa-bolt text-accent-light mr-1"></i> {recipe.nutritionFacts.calories} cal
            </span>
            <span className="mx-2 text-gray-300">|</span>
            <span className="text-sm">
              <i className="fas fa-utensils text-gray-400 mr-1"></i> {recipe.servings} servings
            </span>
          </div>
          <Link href={`/recipe/${recipe.id}`}>
            <a className="text-primary hover:text-primary-dark transition-colors">View</a>
          </Link>
        </div>
      </div>
    </div>
  );
}
