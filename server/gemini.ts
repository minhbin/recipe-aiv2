import { RecipeGenerationRequest } from "@shared/types";
import { InsertRecipe } from "@shared/schema";

// Default image URLs for generated recipes
const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd",
  "https://images.unsplash.com/photo-1593906930848-a79daafbdcda",
  "https://images.unsplash.com/photo-1540420773420-3366772f4999"
];

// Difficulty levels
const DIFFICULTY_LEVELS = ["Easy", "Medium", "Hard"];

// Sample tag categories
const TAG_CATEGORIES = {
  cuisines: ["Italian", "Mexican", "Asian", "Mediterranean", "Indian", "American", "French"],
  dietary: ["Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "Low-Carb", "Keto", "Paleo"],
  meal_types: ["Breakfast", "Lunch", "Dinner", "Snack", "Dessert"],
  characteristics: ["Quick", "Healthy", "High-Protein", "Budget-Friendly", "One-Pot"]
};

// Generate a recipe using Gemini API
export async function generateAIRecipe(request: RecipeGenerationRequest): Promise<InsertRecipe> {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error("No Gemini API key found. Set GEMINI_API_KEY in environment variables.");
    // Fallback to generate a basic recipe without AI
    return generateFallbackRecipe(request);
  }
  
  console.log("Generating recipe with request:", request);
  
  try {
    // Create prompt for Gemini
    const dietaryStr = request.dietaryPreferences ? 
      `Dietary preferences: ${request.dietaryPreferences.join(", ")}. ` : "";
    const timeStr = request.cookingTime ? 
      `The cooking time should be around ${request.cookingTime} minutes. ` : "";
    
    const prompt = `Create a detailed recipe based on this request: "${request.description}". ${dietaryStr}${timeStr}
    
    Format the response as JSON with these fields:
    {
      "title": "Recipe title",
      "description": "Brief description",
      "ingredients": ["ingredient 1", "ingredient 2", ...],
      "instructions": ["step 1", "step 2", ...],
      "prepTime": (preparation time in minutes),
      "cookTime": (cooking time in minutes),
      "servings": (number of servings),
      "difficulty": "Easy" or "Medium" or "Hard",
      "tags": ["tag1", "tag2", ...] (up to 5 tags),
      "nutritionFacts": {
        "calories": number,
        "protein": grams,
        "carbs": grams,
        "fat": grams
      }
    }
    
    Ensure all fields are populated. Keep ingredients and instructions concise but clear. Make sure the recipe is realistic and delicious.`;

    // Using fetch directly to the Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      }
    );
    
    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0]?.content?.parts || !data.candidates[0].content.parts[0]?.text) {
      throw new Error("Invalid response format from Gemini API");
    }
    
    const recipeText = data.candidates[0].content.parts[0].text;
    
    // Parse the JSON from the response
    try {
      // Find JSON object in the response - look for opening and closing braces
      const jsonMatch = recipeText.match(/{[\s\S]*}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : null;
      
      if (!jsonStr) {
        throw new Error("No JSON object found in the response");
      }
      
      const recipeData = JSON.parse(jsonStr);
      
      // Select a random image
      const imageUrl = DEFAULT_IMAGES[Math.floor(Math.random() * DEFAULT_IMAGES.length)];
      
      // Create the recipe with the parsed data
      return {
        title: recipeData.title,
        description: recipeData.description,
        imageUrl,
        ingredients: recipeData.ingredients,
        instructions: recipeData.instructions,
        prepTime: recipeData.prepTime,
        cookTime: recipeData.cookTime,
        servings: recipeData.servings,
        difficulty: recipeData.difficulty,
        tags: recipeData.tags,
        nutritionFacts: recipeData.nutritionFacts,
        isAIGenerated: true
      };
    } catch (parseError) {
      console.error("Error parsing recipe JSON:", parseError);
      console.log("Raw response:", recipeText);
      throw new Error("Failed to parse AI-generated recipe");
    }
  } catch (error) {
    console.error("Error generating AI recipe:", error);
    return generateFallbackRecipe(request);
  }
}

// Fallback recipe generation when API fails
function generateFallbackRecipe(request: RecipeGenerationRequest): InsertRecipe {
  console.log("Using fallback recipe generation");
  
  // Create a title based on the request description
  let title = "";
  if (request.description.toLowerCase().includes("vegetarian")) {
    title = "Hearty Vegetarian Chili";
  } else if (request.description.toLowerCase().includes("chicken")) {
    title = "Lemon Herb Roasted Chicken";
  } else if (request.description.toLowerCase().includes("quick")) {
    title = "15-Minute Shrimp Pasta";
  } else if (request.description.toLowerCase().includes("healthy")) {
    title = "Super Green Nutrient Bowl";
  } else {
    title = "Homestyle Comfort Casserole";
  }
  
  // Generate times and servings
  const prepTime = Math.floor(Math.random() * 20) + 5;
  const cookTime = request.cookingTime 
    ? Math.min(request.cookingTime, 60)
    : Math.floor(Math.random() * 45) + 15;
  const servings = Math.floor(Math.random() * 4) + 2;
  const difficulty = DIFFICULTY_LEVELS[Math.floor(Math.random() * DIFFICULTY_LEVELS.length)];
  
  // Generate tags
  const tags: string[] = [];
  if (request.dietaryPreferences && request.dietaryPreferences.length > 0) {
    tags.push(...request.dietaryPreferences);
  }
  
  // Add random tags from categories
  const addRandomTag = (category: string[]) => {
    const tag = category[Math.floor(Math.random() * category.length)];
    if (!tags.includes(tag)) tags.push(tag);
  };
  
  addRandomTag(TAG_CATEGORIES.cuisines);
  addRandomTag(TAG_CATEGORIES.meal_types);
  addRandomTag(TAG_CATEGORIES.characteristics);
  
  // Limit to 5 tags max
  while (tags.length > 5) tags.pop();
  
  // Generate nutrition facts
  const nutritionFacts = {
    calories: Math.floor(Math.random() * 400) + 200,
    protein: Math.floor(Math.random() * 30) + 10,
    carbs: Math.floor(Math.random() * 40) + 10,
    fat: Math.floor(Math.random() * 20) + 5
  };
  
  // Select a random image
  const imageUrl = DEFAULT_IMAGES[Math.floor(Math.random() * DEFAULT_IMAGES.length)];
  
  // Default ingredients and instructions
  let ingredients = [
    "2 tablespoons olive oil",
    "1 onion, diced",
    "2 cloves garlic, minced",
    "1 pound protein of choice",
    "1 bell pepper, sliced",
    "1 cup vegetables of choice",
    "1 can (14 oz) diced tomatoes",
    "2 cups broth or stock",
    "1 teaspoon mixed herbs",
    "Salt and pepper to taste"
  ];
  
  let instructions = [
    "Prepare all ingredients before cooking.",
    "Heat oil in a large pan over medium heat.",
    "Add onion and cook until translucent, about 3-4 minutes.",
    "Add garlic and cook for 30 seconds until fragrant.",
    "Add protein and cook until browned.",
    "Add vegetables and cook for 3-5 minutes.",
    "Add remaining ingredients and simmer for 15-20 minutes.",
    "Season with salt and pepper to taste.",
    "Serve hot with your favorite sides."
  ];
  
  return {
    title,
    description: `${title} - Based on your request: "${request.description}"`,
    imageUrl,
    ingredients,
    instructions,
    prepTime,
    cookTime,
    servings,
    difficulty,
    tags,
    nutritionFacts,
    isAIGenerated: true
  };
}

// Get recipe suggestions using Gemini API
export async function suggestRecipes(query: string): Promise<any[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error("No Gemini API key found for recipe suggestions");
    return getFallbackSuggestions();
  }
  
  try {
    const prompt = `Based on the query "${query}", suggest 3 recipe ideas. 
    Provide the response as a JSON array with each recipe having a title and short description:
    [
      {
        "title": "Recipe Title 1",
        "description": "Brief description of recipe 1"
      },
      {
        "title": "Recipe Title 2",
        "description": "Brief description of recipe 2"
      },
      {
        "title": "Recipe Title 3",
        "description": "Brief description of recipe 3"
      }
    ]`;

    // Using fetch directly to the Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      }
    );
    
    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0]?.content?.parts || !data.candidates[0].content.parts[0]?.text) {
      throw new Error("Invalid response format from Gemini API");
    }
    
    const suggestionsText = data.candidates[0].content.parts[0].text;
    
    // Parse the JSON from the response
    try {
      // Find JSON array in the response
      const jsonMatch = suggestionsText.match(/\[[\s\S]*\]/);
      const jsonStr = jsonMatch ? jsonMatch[0] : null;
      
      if (!jsonStr) {
        throw new Error("No JSON array found in the response");
      }
      
      const suggestions = JSON.parse(jsonStr);
      
      // Add IDs to the suggestions
      return suggestions.map((suggestion: any, index: number) => ({
        id: 1000 + index, // Use high IDs to avoid conflicts with existing recipes
        title: suggestion.title,
        description: suggestion.description
      }));
    } catch (parseError) {
      console.error("Error parsing suggestions JSON:", parseError);
      return getFallbackSuggestions();
    }
  } catch (error) {
    console.error("Error getting recipe suggestions:", error);
    return getFallbackSuggestions();
  }
}

// Fallback suggestions when API fails
function getFallbackSuggestions(): any[] {
  return [
    {
      id: 101,
      title: "Lemon Herb Grilled Chicken",
      description: "Tender chicken breasts marinated in lemon, garlic and fresh herbs."
    },
    {
      id: 102,
      title: "One-Pot Vegetable Quinoa",
      description: "Protein-packed quinoa with seasonal vegetables and herbs."
    },
    {
      id: 103,
      title: "Sheet Pan Salmon & Veggies",
      description: "Easy cleanup dinner with omega-rich salmon and roasted vegetables."
    }
  ];
}
