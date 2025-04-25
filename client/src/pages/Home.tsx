import RecipeSearch from "@/components/recipe/RecipeSearch";
import RecipeAIGeneration from "@/components/recipe/RecipeAIGeneration";
import { Link } from "wouter";

export default function Home() {
  return (
    <>
      <section className="bg-gradient-to-r from-primary-light to-primary rounded-xl p-8 mb-10 text-white">
        <div className="max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-3">Your AI-Powered Kitchen Assistant</h2>
          <p className="text-lg opacity-90 mb-6">Discover personalized recipes based on ingredients you have, dietary preferences, or whatever you're craving today.</p>
          <div className="flex flex-wrap gap-3">
            <button className="bg-white text-primary font-medium py-2 px-6 rounded-full hover:bg-neutral-lightest transition-colors">
              Get Started
            </button>
            <Link href="/chat">
              <div className="bg-primary-dark text-white font-medium py-2 px-6 rounded-full hover:bg-primary-darker transition-colors flex items-center cursor-pointer">
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 12H8.01M12 12H12.01M16 12H16.01M21 12C21 16.418 16.97 20 12 20C10.5286 20 9.14629 19.7356 7.91625 19.2644C7.62208 19.1542 7.47499 19.0991 7.34373 19.0716C7.21247 19.044 7.0866 19.0522 6.96315 19.0962C6.83969 19.1403 6.73502 19.2245 6.52569 19.393L4.2 21.2C3.98712 21.3657 3.88069 21.4485 3.79472 21.4397C3.718 21.4318 3.64582 21.3811 3.60606 21.3051C3.56162 21.2199 3.56162 21.0828 3.56162 20.8086V18.8322C3.56162 18.369 3.56162 18.1374 3.47384 17.9443C3.39665 17.7751 3.27138 17.6332 3.11248 17.5359C2.93361 17.4276 2.70021 17.399 2.23341 17.3419C1.77432 17.2856 1.54477 17.2574 1.35275 17.1958C1.17611 17.1389 1.01854 17.0534 0.882436 16.9439C0.736162 16.8249 0.620088 16.6698 0.387939 16.3595C0.139346 16.0292 0 15.6238 0 15.2C0 10.7817 4.02944 7.2 9 7.2C9.56646 7.2 10.1223 7.24577 10.6634 7.33287M21 5.8C21 8.41974 18.7614 10.6 16 10.6C15.401 10.6 14.8262 10.4957 14.3 10.307L12 12L12.6954 9.55188C12.2779 9.12268 11.9578 8.62955 11.7592 8.09687" 
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Chat with Chef
              </div>
            </Link>
          </div>
        </div>
      </section>
      
      <RecipeSearch />
      <RecipeAIGeneration />
    </>
  );
}
