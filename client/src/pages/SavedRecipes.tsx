import { useQuery } from "@tanstack/react-query";
import { Recipe } from "@shared/types";
import RecipeCard from "@/components/recipe/RecipeCard";
import LoadingSpinner from "@/components/ui/loading-spinner";

export default function SavedRecipes() {
  const { data: savedRecipes, isLoading } = useQuery<Recipe[]>({
    queryKey: ['/api/recipes/saved'],
  });
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-display font-bold">Saved Recipes</h1>
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : savedRecipes && savedRecipes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      ) : (
        <div className="bg-neutral-lightest rounded-xl p-8 text-center">
          <i className="far fa-bookmark text-4xl text-gray-400 mb-3"></i>
          <h3 className="text-xl font-medium mb-2">No Saved Recipes Yet</h3>
          <p className="text-gray-600">
            Save your favorite recipes to access them easily later.
          </p>
        </div>
      )}
    </div>
  );
}
