import { Link } from "wouter";
import { Recipe } from "@shared/types";

interface RecipeSimilarProps {
  recipes: Recipe[];
}

export default function RecipeSimilar({ recipes }: RecipeSimilarProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {recipes.map((recipe) => (
        <Link key={recipe.id} href={`/recipe/${recipe.id}`}>
          <a className="bg-neutral-lightest rounded-lg overflow-hidden flex items-center hover:bg-neutral-light transition-colors">
            <img 
              src={recipe.imageUrl || "https://images.unsplash.com/photo-1540420773420-3366772f4999"} 
              alt={recipe.title} 
              className="w-20 h-20 object-cover" 
            />
            <div className="p-3">
              <h4 className="font-medium text-sm">{recipe.title}</h4>
              <p className="text-xs text-gray-600">
                {recipe.nutritionFacts.calories} cal • {recipe.cookTime} min
              </p>
            </div>
          </a>
        </Link>
      ))}
    </div>
  );
}
