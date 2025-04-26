import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { AlertCircle } from 'lucide-react';

// Types from MealPlanner.tsx
type Meal = {
  id: number;
  title: string;
  description: string;
  imageUrl?: string;
}

type DayPlan = {
  breakfast: Meal | null;
  lunch: Meal | null;
  dinner: Meal | null;
}

type WeekPlan = {
  monday: DayPlan;
  tuesday: DayPlan;
  wednesday: DayPlan;
  thursday: DayPlan;
  friday: DayPlan;
  saturday: DayPlan;
  sunday: DayPlan;
}

export default function SavedMealPlans() {
  const [weekPlan, setWeekPlan] = useState<WeekPlan | null>(null);
  const [currentDay, setCurrentDay] = useState<keyof WeekPlan>('monday');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    // Try to load saved meal plan from localStorage on component mount
    const loadSavedPlan = () => {
      setIsLoading(true);
      if (typeof window !== 'undefined') {
        const savedPlan = localStorage.getItem('mealPlan');
        if (savedPlan) {
          try {
            const plan = JSON.parse(savedPlan);
            setWeekPlan(plan);
          } catch (e) {
            console.error('Error parsing saved meal plan:', e);
            toast({
              title: "Error Loading Saved Plans",
              description: "There was an error loading your saved meal plans.",
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "No Saved Plans Found",
            description: "You don't have any saved meal plans yet.",
            variant: "default",
          });
        }
      }
      setIsLoading(false);
    };

    loadSavedPlan();
  }, [toast]);

  const clearSavedPlans = () => {
    if (confirm("Are you sure you want to clear all saved meal plans?")) {
      localStorage.removeItem('mealPlan');
      setWeekPlan(null);
      toast({
        title: "Saved Plans Cleared",
        description: "All saved meal plans have been cleared.",
        variant: "default",
      });
    }
  };

  const renderMealCard = (day: keyof WeekPlan, mealType: keyof DayPlan) => {
    if (!weekPlan) return null;
    
    const meal = weekPlan[day][mealType];
    
    return (
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium capitalize">{mealType}</h3>
          </div>
          
          {meal ? (
            <div>
              <p className="font-medium text-primary">{meal.title}</p>
              <p className="text-sm text-gray-500">{meal.description}</p>
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">No meal planned</p>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="flex items-center justify-center h-10 w-10 bg-primary text-white rounded-full font-bold text-sm mr-3">
              AI
            </div>
            <h1 className="text-3xl font-bold">Saved Meal Plans</h1>
          </div>
          <Button 
            variant="outline"
            onClick={() => window.location.href = '/meal-planner'}
            className="flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Planner
          </Button>
        </div>
        
        <p className="text-gray-600 mb-6">
          View and manage your saved meal plans.
        </p>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : weekPlan ? (
          <>
            <Tabs 
              defaultValue="monday" 
              className="w-full"
              onValueChange={(value) => setCurrentDay(value as keyof WeekPlan)}
            >
              <TabsList className="grid grid-cols-7 mb-8">
                <TabsTrigger value="monday">Mon</TabsTrigger>
                <TabsTrigger value="tuesday">Tue</TabsTrigger>
                <TabsTrigger value="wednesday">Wed</TabsTrigger>
                <TabsTrigger value="thursday">Thu</TabsTrigger>
                <TabsTrigger value="friday">Fri</TabsTrigger>
                <TabsTrigger value="saturday">Sat</TabsTrigger>
                <TabsTrigger value="sunday">Sun</TabsTrigger>
              </TabsList>
              
              {Object.keys(weekPlan).map((day) => (
                <TabsContent key={day} value={day} className="mt-0">
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="text-xl font-bold mb-4 capitalize">{day}</h2>
                      
                      {renderMealCard(day as keyof WeekPlan, 'breakfast')}
                      {renderMealCard(day as keyof WeekPlan, 'lunch')}
                      {renderMealCard(day as keyof WeekPlan, 'dinner')}
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
            
            <div className="mt-8 flex justify-end">
              <Button variant="destructive" onClick={clearSavedPlans}>
                Clear All Saved Plans
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-64">
            <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 mb-2">No Saved Plans Found</h2>
            <p className="text-gray-500 mb-4">You haven't saved any meal plans yet.</p>
            <Button variant="default" onClick={() => window.location.href = '/meal-planner'}>
              Create a Meal Plan
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}