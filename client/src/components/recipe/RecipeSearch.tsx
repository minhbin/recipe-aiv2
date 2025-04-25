import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Recipe } from "@shared/types";
import RecipeFilters from "./RecipeFilters";
import RecipeCard from "./RecipeCard";
import LoadingSpinner from "@/components/ui/loading-spinner";

export default function RecipeSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  
  // For initial render without a search
  const { data: initialRecipes, isLoading: initialLoading } = useQuery({
    queryKey: ['/api/recipes'],
    enabled: true,
  });
  
  // For searching with query
  const { data: searchedRecipes, isLoading: searchLoading, refetch } = useQuery({
    queryKey: ['/api/recipes/search', searchQuery, activeFilters],
    enabled: false,
  });
  
  const isLoading = initialLoading || searchLoading;
  const recipes: Recipe[] = searchedRecipes || initialRecipes || [];
  
  const handleSearch = () => {
    if (searchQuery.trim()) {
      refetch();
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  const handleRemoveFilter = (filter: string) => {
    setActiveFilters(activeFilters.filter(f => f !== filter));
  };
  
  const handleAddFilterType = (filterType: string) => {
    // In a real app, this would open a modal or dropdown
    // For now, we'll just add a placeholder filter
    const filterMap: Record<string, string> = {
      'dietary': 'Vegetarian',
      'cuisine': 'Italian',
      'time': 'Under 30 min'
    };
    
    const newFilter = filterMap[filterType];
    if (newFilter && !activeFilters.includes(newFilter)) {
      setActiveFilters([...activeFilters, newFilter]);
    }
  };
  
  return (
    <section className="mb-12">
      <div className="flex flex-col md:flex-row md:items-end gap-6 mb-8">
        <div className="flex-grow">
          <h2 className="text-2xl font-display font-bold mb-4">Find Your Next Meal</h2>
          <div className="flex items-center">
            <div className="relative flex-grow">
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <input 
                type="text" 
                placeholder="Search recipes or ingredients..." 
                className="w-full py-3 pl-10 pr-4 rounded-lg border border-neutral focus:border-primary focus:ring-2 focus:ring-primary-light focus:outline-none transition"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
            <button 
              className="ml-2 bg-primary text-white py-3 px-6 rounded-lg hover:bg-primary-dark transition-colors"
              onClick={handleSearch}
              disabled={isLoading}
            >
              Search
            </button>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button className="bg-neutral-lightest border border-neutral hover:bg-neutral-light transition-colors rounded-lg py-2 px-4 flex items-center">
            <i className="fas fa-sliders-h mr-2"></i>
            Filters
          </button>
          <button className="bg-neutral-lightest border border-neutral hover:bg-neutral-light transition-colors rounded-lg py-2 px-4 flex items-center">
            <i className="fas fa-magic mr-2"></i>
            AI Suggest
          </button>
        </div>
      </div>

      <RecipeFilters 
        activeFilters={activeFilters}
        onRemoveFilter={handleRemoveFilter}
        onAddFilterType={handleAddFilterType}
      />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          <h3 className="text-lg font-medium text-gray-700 mb-4">
            {recipes.length ? `${recipes.length} recipes found${searchQuery ? ` for "${searchQuery}"` : ''}` : 'No recipes found'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
