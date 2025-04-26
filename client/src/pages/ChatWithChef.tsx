import RecipeChat from "@/components/recipe/RecipeChat";

export default function ChatWithChef() {
  return (
    <div className="space-y-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-display font-bold mb-4">Chat with AI Chef</h1>
        <p className="text-gray-600 mb-8">
          Ask our AI chef for recipe ideas, cooking tips, or meal planning advice. Simply type your question and get personalized cooking recommendations.
        </p>
        
        <RecipeChat />
      </div>
    </div>
  );
}