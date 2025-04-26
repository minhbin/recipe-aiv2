import { useState, FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { Recipe, RecipeGenerationRequest } from "@shared/types";
import { Link } from "wouter";
import { generateRecipe, getRecipeSuggestions } from "@/lib/gemini";
import { toast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import LoadingSpinner from "@/components/ui/loading-spinner";

export default function RecipeAIGeneration() {
  const [description, setDescription] = useState("");
  const [dietaryPreferences, setDietaryPreferences] = useState<string[]>([]);
  const [cookingTime, setCookingTime] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const { data: recipeSuggestions, isLoading: loadingSuggestions, refetch: refetchSuggestions } = useQuery({
    queryKey: ['/api/recipes/suggest'],
    enabled: false,
  });
  
  const preferences = [
    { id: "vegetarian", label: "Vegetarian" },
    { id: "vegan", label: "Vegan" },
    { id: "glutenFree", label: "Gluten-Free" },
    { id: "dairyFree", label: "Dairy-Free" },
    { id: "lowCarb", label: "Low-Carb" },
  ];
  
  const togglePreference = (preference: string) => {
    setDietaryPreferences(prev => 
      prev.includes(preference) 
        ? prev.filter(p => p !== preference)
        : [...prev, preference]
    );
  };
  
  const handleGenerateRecipe = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!description.trim()) {
      toast({
        title: "Error",
        description: "Please describe what you'd like to cook",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsGenerating(true);
      
      const request: RecipeGenerationRequest = {
        description,
        dietaryPreferences,
        cookingTime: cookingTime ? parseInt(cookingTime) : undefined
      };
      
      await generateRecipe(request);
      
      toast({
        title: "Recipe Generated",
        description: "Your AI-generated recipe is ready!",
      });
      
      // Show suggestions for the newly generated recipe
      setShowSuggestions(true);
      refetchSuggestions();
      
      // Also refresh the recipes list
      queryClient.invalidateQueries({ queryKey: ['/api/recipes'] });
      
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate recipe. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <section className="bg-white rounded-xl shadow-md p-6 mb-10">
      <h2 className="text-2xl font-display font-bold mb-6">Generate New Recipes with AI</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <form className="space-y-4" onSubmit={handleGenerateRecipe}>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">What would you like to cook?</label>
              <textarea 
                id="description"
                placeholder="Describe what you're looking for (e.g., 'a high-protein vegetarian dinner' or 'something with chicken and spinach')"
                className="w-full rounded-lg border border-neutral focus:border-primary focus:ring-2 focus:ring-primary-light focus:outline-none transition p-3 h-32"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dietary Restrictions</label>
              <div className="flex flex-wrap gap-2">
                {preferences.map(pref => (
                  <label 
                    key={pref.id}
                    className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm cursor-pointer hover:bg-neutral-light ${
                      dietaryPreferences.includes(pref.id) 
                        ? 'bg-primary text-white' 
                        : 'bg-neutral-lightest'
                    }`}
                  >
                    <input 
                      type="checkbox" 
                      className="sr-only"
                      checked={dietaryPreferences.includes(pref.id)}
                      onChange={() => togglePreference(pref.id)}
                    />
                    {pref.label}
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <label htmlFor="cookingTime" className="block text-sm font-medium text-gray-700 mb-1">Cooking Time</label>
              <select 
                id="cookingTime"
                className="w-full rounded-lg border border-neutral focus:border-primary focus:ring-2 focus:ring-primary-light focus:outline-none transition p-2"
                value={cookingTime}
                onChange={(e) => setCookingTime(e.target.value)}
              >
                <option value="">Any duration</option>
                <option value="15">15 minutes or less</option>
                <option value="30">30 minutes or less</option>
                <option value="60">1 hour or less</option>
                <option value="120">2 hours or less</option>
              </select>
            </div>
            
            <button 
              type="submit" 
              className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center"
              disabled={isGenerating}
            >
              {isGenerating ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                <i className="fas fa-wand-magic-sparkles mr-2"></i>
              )}
              {isGenerating ? 'Generating...' : 'Generate Recipe'}
            </button>
          </form>
        </div>
        
        <div className="bg-neutral-lightest rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-medium text-lg">AI Recipe Suggestions</h3>
            <span className="text-xs bg-primary bg-opacity-10 text-primary px-2 py-1 rounded-full">Powered by Gemini</span>
          </div>
          
          <div className="space-y-4">
            <p className="text-gray-700 text-sm">Based on your preferences, here are some recipe ideas:</p>
            
            {loadingSuggestions && (
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-neutral rounded"></div>
                <div className="h-4 bg-neutral rounded w-5/6"></div>
                <div className="h-4 bg-neutral rounded w-4/6"></div>
                <div className="h-4 bg-neutral rounded w-5/6"></div>
                <div className="h-4 bg-neutral rounded w-3/6"></div>
              </div>
            )}
            
            {!loadingSuggestions && recipeSuggestions && recipeSuggestions.length > 0 && (
              <div className="space-y-4">
                {recipeSuggestions.map((recipe: Recipe) => (
                  <Link key={recipe.id} href={`/recipe/${recipe.id}`}>
                    <a className="block p-3 border border-neutral rounded-lg hover:border-primary hover:bg-white transition-colors cursor-pointer">
                      <h4 className="font-medium">{recipe.title}</h4>
                      <p className="text-sm text-gray-600">{recipe.description}</p>
                    </a>
                  </Link>
                ))}
              </div>
            )}
            
            {!loadingSuggestions && (!recipeSuggestions || recipeSuggestions.length === 0) && (
              <div className="p-3 border border-neutral border-dashed rounded-lg text-center">
                <p className="text-sm text-gray-600">
                  {showSuggestions ? 'No suggestions available yet' : 'Generate a recipe to see suggestions'}
                </p>
              </div>
            )}
            
            {recipeSuggestions && recipeSuggestions.length > 3 && (
              <div className="text-center">
                <button className="text-primary hover:text-primary-dark transition-colors text-sm">
                  Show More Ideas
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
