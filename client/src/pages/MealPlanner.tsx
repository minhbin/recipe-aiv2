import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import LoadingSpinner from '@/components/ui/loading-spinner';

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

const defaultDayPlan: DayPlan = {
  breakfast: null,
  lunch: null,
  dinner: null
};

const defaultWeekPlan: WeekPlan = {
  monday: { ...defaultDayPlan },
  tuesday: { ...defaultDayPlan },
  wednesday: { ...defaultDayPlan },
  thursday: { ...defaultDayPlan },
  friday: { ...defaultDayPlan },
  saturday: { ...defaultDayPlan },
  sunday: { ...defaultDayPlan }
};

export default function MealPlanner() {
  // Try to load saved meal plan from localStorage on component mount
  const loadSavedPlan = (): WeekPlan => {
    if (typeof window !== 'undefined') {
      const savedPlan = localStorage.getItem('mealPlan');
      if (savedPlan) {
        try {
          return JSON.parse(savedPlan);
        } catch (e) {
          console.error('Error parsing saved meal plan:', e);
        }
      }
    }
    return defaultWeekPlan;
  };

  const [weekPlan, setWeekPlan] = useState<WeekPlan>(loadSavedPlan);
  const [currentDay, setCurrentDay] = useState<keyof WeekPlan>('monday');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const { toast } = useToast();
  
  const handleAddMeal = (day: keyof WeekPlan, mealType: keyof DayPlan) => {
    // In a real application, this would open a modal or navigate to a recipe selection page
    // For now, we'll just add a placeholder meal
    const newMeal: Meal = {
      id: Math.floor(Math.random() * 1000),
      title: `New ${mealType} Recipe`,
      description: 'Click to choose a recipe for this meal'
    };
    
    setWeekPlan(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [mealType]: newMeal
      }
    }));
  };
  
  const handleRemoveMeal = (day: keyof WeekPlan, mealType: keyof DayPlan) => {
    setWeekPlan(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [mealType]: null
      }
    }));
  };
  
  const generateDayPlan = async (day: keyof WeekPlan) => {
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/meal-planner/generate-day', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ day }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate meal plan');
      }
      
      const mealPlan = await response.json();
      
      // Update the day's meal plan
      setWeekPlan(prev => ({
        ...prev,
        [day]: {
          breakfast: mealPlan.breakfast || null,
          lunch: mealPlan.lunch || null,
          dinner: mealPlan.dinner || null
        }
      }));
      
      toast({
        title: "Meal Plan Generated!",
        description: `Your ${day} meal plan is ready.`,
        variant: "default",
      });
    } catch (error) {
      console.error('Error generating meal plan:', error);
      toast({
        title: "Failed to generate meal plan",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const generateFullWeekPlan = async () => {
    setIsGenerating(true);
    
    try {
      // Generate meal plans for each day one by one
      const days: (keyof WeekPlan)[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      const newWeekPlan = { ...weekPlan };
      
      // Sequentially generate meal plans for each day to avoid overwhelming the API
      for (const day of days) {
        const response = await fetch('/api/meal-planner/generate-day', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ day }),
        });
        
        if (!response.ok) {
          throw new Error(`Failed to generate meal plan for ${day}`);
        }
        
        const mealPlan = await response.json();
        
        newWeekPlan[day] = {
          breakfast: mealPlan.breakfast || null,
          lunch: mealPlan.lunch || null,
          dinner: mealPlan.dinner || null
        };
      }
      
      // Update the entire week plan
      setWeekPlan(newWeekPlan);
      
      toast({
        title: "Full Week Plan Generated!",
        description: "Your complete meal plan for the week is ready.",
        variant: "default",
      });
    } catch (error) {
      console.error('Error generating full week plan:', error);
      toast({
        title: "Failed to generate full week plan",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Save a single day's meal plan
  const saveDayPlan = (day: keyof WeekPlan) => {
    setIsSaving(true);
    try {
      // Get the current complete plan
      const currentPlan = { ...weekPlan };
      
      // Save it to localStorage
      localStorage.setItem('mealPlan', JSON.stringify(currentPlan));
      
      toast({
        title: "Day Plan Saved!",
        description: `Your meal plan for ${day} has been saved.`,
        variant: "default",
      });
    } catch (error) {
      console.error('Error saving day plan:', error);
      toast({
        title: "Failed to save plan",
        description: "There was an error saving your meal plan.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Save the entire week's meal plan
  const saveWeeklyPlan = () => {
    setIsSaving(true);
    try {
      // Save the entire week plan to localStorage
      localStorage.setItem('mealPlan', JSON.stringify(weekPlan));
      
      toast({
        title: "Weekly Plan Saved!",
        description: "Your complete meal plan for the week has been saved.",
        variant: "default",
      });
    } catch (error) {
      console.error('Error saving weekly plan:', error);
      toast({
        title: "Failed to save plan",
        description: "There was an error saving your meal plan.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const renderMealCard = (day: keyof WeekPlan, mealType: keyof DayPlan) => {
    const meal = weekPlan[day][mealType];
    
    return (
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium capitalize">{mealType}</h3>
            {meal && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-red-500 h-8 px-2"
                onClick={() => handleRemoveMeal(day, mealType)}
              >
                Remove
              </Button>
            )}
          </div>
          
          {meal ? (
            <div>
              <p className="font-medium text-primary">{meal.title}</p>
              <p className="text-sm text-gray-500">{meal.description}</p>
            </div>
          ) : (
            <Button 
              variant="outline" 
              className="w-full mt-2"
              onClick={() => handleAddMeal(day, mealType)}
            >
              + Add {mealType}
            </Button>
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
            <h1 className="text-3xl font-bold">Meal Planner</h1>
          </div>
          <Button 
            variant="outline"
            onClick={() => window.location.href = '/saved-meal-plans'}
            className="flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            View Saved Plans
          </Button>
        </div>
        
        <p className="text-gray-600 mb-6">
          Plan your meals for the entire week. Click on any day to view and edit that day's meal plan.
        </p>
        
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
                  
                  <div className="flex justify-end mt-4">
                    <Button 
                      variant="outline" 
                      className="mr-2" 
                      onClick={() => generateDayPlan(day as keyof WeekPlan)}
                      disabled={isGenerating}
                    >
                      {isGenerating && day === currentDay ? (
                        <><LoadingSpinner size="sm" className="mr-2" /> Generating...</>
                      ) : (
                        'Generate Day Plan'
                      )}
                    </Button>
                    <Button 
                      onClick={() => saveDayPlan(day as keyof WeekPlan)}
                      disabled={isGenerating || isSaving}
                    >
                      {isSaving && day === currentDay ? (
                        <><LoadingSpinner size="sm" className="mr-2" /> Saving...</>
                      ) : (
                        'Save Plan'
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
        
        <div className="mt-8 flex justify-end">
          <Button 
            variant="outline" 
            className="mr-2" 
            onClick={generateFullWeekPlan}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <><LoadingSpinner size="sm" className="mr-2" /> Generating Full Week...</>
            ) : (
              'Generate Full Week Plan'
            )}
          </Button>
          <Button 
            onClick={saveWeeklyPlan}
            disabled={isGenerating || isSaving}
          >
            {isSaving ? (
              <><LoadingSpinner size="sm" className="mr-2" /> Saving...</>
            ) : (
              'Save Weekly Plan'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}