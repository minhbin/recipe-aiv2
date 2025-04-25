import RecipeSearch from "@/components/recipe/RecipeSearch";
import RecipeAIGeneration from "@/components/recipe/RecipeAIGeneration";

export default function Home() {
  return (
    <>
      <section className="bg-gradient-to-r from-primary-light to-primary rounded-xl p-8 mb-10 text-white">
        <div className="max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-3">Your AI-Powered Kitchen Assistant</h2>
          <p className="text-lg opacity-90 mb-6">Discover personalized recipes based on ingredients you have, dietary preferences, or whatever you're craving today.</p>
          <button className="bg-white text-primary font-medium py-2 px-6 rounded-full hover:bg-neutral-lightest transition-colors">
            Get Started
          </button>
        </div>
      </section>
      
      <RecipeSearch />
      <RecipeAIGeneration />
    </>
  );
}
