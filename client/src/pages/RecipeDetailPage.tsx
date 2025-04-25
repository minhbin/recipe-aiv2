import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import RecipeDetail from "@/components/recipe/RecipeDetail";
import { Recipe } from "@shared/types";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function RecipeDetailPage() {
  const { id } = useParams();
  
  const { data: recipe, isLoading, isError } = useQuery<Recipe>({
    queryKey: [`/api/recipes/${id}`],
    enabled: !!id,
  });
  
  const { data: similarRecipes = [] } = useQuery<Recipe[]>({
    queryKey: [`/api/recipes/${id}/similar`],
    enabled: !!id,
  });
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  if (isError || !recipe) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900">Recipe Not Found</h1>
          </div>
          <p className="mt-4 text-sm text-gray-600">
            The recipe you're looking for couldn't be found. It may have been removed or doesn't exist.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return <RecipeDetail recipe={recipe} similarRecipes={similarRecipes} />;
}
