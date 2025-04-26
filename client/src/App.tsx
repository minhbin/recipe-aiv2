import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Home from "@/pages/Home";
import RecipeDetailPage from "@/pages/RecipeDetailPage";
import SavedRecipes from "@/pages/SavedRecipes";
import ChatWithChef from "@/pages/ChatWithChef";
import MealPlanner from "@/pages/MealPlanner";
import SavedMealPlans from "@/pages/SavedMealPlans";

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-6">
        <Switch>
          <Route path="/" component={ChatWithChef} />
          <Route path="/meal-planner" component={MealPlanner} />
          <Route path="/saved-meal-plans" component={SavedMealPlans} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
