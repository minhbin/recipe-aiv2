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

// Generate a recipe using Gemini API (simulated for now)
export async function generateAIRecipe(request: RecipeGenerationRequest): Promise<InsertRecipe> {
  // In a real implementation, this would make an API call to Gemini
  // For demo purposes, we'll generate a structured recipe based on the request
  
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  
  // Here we would make a call to the Gemini API with the apiKey 
  // Since we don't have access to the actual API in this demo, we'll simulate the response
  
  console.log("Generating recipe with request:", request);
  console.log("Using API Key:", apiKey ? "✓ API key found" : "✗ No API key");
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
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
  
  // Generate random prep and cook times
  const prepTime = Math.floor(Math.random() * 20) + 5;
  const cookTime = request.cookingTime 
    ? Math.min(request.cookingTime, 60) // respect requested time
    : Math.floor(Math.random() * 45) + 15;
  
  // Generate random servings
  const servings = Math.floor(Math.random() * 4) + 2;
  
  // Select a random difficulty
  const difficulty = DIFFICULTY_LEVELS[Math.floor(Math.random() * DIFFICULTY_LEVELS.length)];
  
  // Generate tags based on request
  const tags: string[] = [];
  
  // Add dietary preferences as tags
  if (request.dietaryPreferences && request.dietaryPreferences.length > 0) {
    tags.push(...request.dietaryPreferences);
  }
  
  // Add random tags from categories
  const addRandomTag = (category: string[]) => {
    const tag = category[Math.floor(Math.random() * category.length)];
    if (!tags.includes(tag)) {
      tags.push(tag);
    }
  };
  
  addRandomTag(TAG_CATEGORIES.cuisines);
  addRandomTag(TAG_CATEGORIES.meal_types);
  addRandomTag(TAG_CATEGORIES.characteristics);
  
  // Limit to 5 tags max
  while (tags.length > 5) {
    tags.pop();
  }
  
  // Generate random nutrition facts
  const nutritionFacts = {
    calories: Math.floor(Math.random() * 400) + 200,
    protein: Math.floor(Math.random() * 30) + 10,
    carbs: Math.floor(Math.random() * 40) + 10,
    fat: Math.floor(Math.random() * 20) + 5
  };
  
  // Select a random image
  const imageUrl = DEFAULT_IMAGES[Math.floor(Math.random() * DEFAULT_IMAGES.length)];
  
  // Generate sample ingredients and instructions based on the title
  let ingredients: string[] = [];
  let instructions: string[] = [];
  
  if (title === "Hearty Vegetarian Chili") {
    ingredients = [
      "1 tablespoon olive oil",
      "1 large onion, diced",
      "2 bell peppers, diced",
      "3 cloves garlic, minced",
      "2 tablespoons chili powder",
      "1 tablespoon cumin",
      "1 teaspoon oregano",
      "1/4 teaspoon cayenne pepper",
      "2 cans (15 oz each) black beans, drained and rinsed",
      "1 can (15 oz) kidney beans, drained and rinsed",
      "1 can (15 oz) diced tomatoes",
      "1 can (6 oz) tomato paste",
      "2 cups vegetable broth",
      "1 cup corn kernels (fresh or frozen)",
      "Salt and pepper to taste",
      "Optional toppings: avocado, cilantro, lime wedges, cheese"
    ];
    
    instructions = [
      "Heat olive oil in a large pot over medium heat.",
      "Add onion and bell peppers, sauté until softened, about 5 minutes.",
      "Add garlic and cook for another minute until fragrant.",
      "Stir in chili powder, cumin, oregano, and cayenne pepper.",
      "Add black beans, kidney beans, diced tomatoes, tomato paste, and vegetable broth.",
      "Bring to a boil, then reduce heat and simmer for 25-30 minutes, stirring occasionally.",
      "Add corn and cook for another 5 minutes.",
      "Season with salt and pepper to taste.",
      "Serve hot with your choice of toppings."
    ];
  } else if (title === "Lemon Herb Roasted Chicken") {
    ingredients = [
      "1 whole chicken (about 4-5 pounds)",
      "2 lemons, one zested and juiced, one quartered",
      "3 tablespoons olive oil",
      "4 cloves garlic, minced",
      "2 tablespoons fresh rosemary, chopped",
      "2 tablespoons fresh thyme, chopped",
      "1 tablespoon fresh sage, chopped",
      "1 teaspoon salt",
      "1/2 teaspoon black pepper",
      "1 onion, quartered",
      "2 carrots, chunked",
      "2 celery stalks, chunked"
    ];
    
    instructions = [
      "Preheat oven to 425°F (220°C).",
      "Pat chicken dry with paper towels inside and out.",
      "In a bowl, mix lemon zest, lemon juice, olive oil, garlic, rosemary, thyme, sage, salt, and pepper.",
      "Rub the herb mixture all over the chicken, including under the skin and inside the cavity.",
      "Stuff the chicken cavity with the quartered lemon, some onion pieces, and herbs.",
      "Place remaining onion, carrots, and celery in a roasting pan and place chicken on top.",
      "Roast for 15 minutes, then reduce heat to 375°F (190°C) and continue roasting for about 1 hour and 15 minutes, or until juices run clear.",
      "Let chicken rest for 15 minutes before carving.",
      "Serve with roasted vegetables and pan juices."
    ];
  } else {
    // Generic ingredients and instructions for other recipes
    ingredients = [
      "2 tablespoons olive oil",
      "1 onion, diced",
      "2 cloves garlic, minced",
      "1 pound protein of choice (chicken, beef, tofu, etc.)",
      "1 bell pepper, sliced",
      "1 cup vegetables of choice",
      "1 can (14 oz) diced tomatoes",
      "2 cups broth or stock",
      "1 teaspoon each of 2-3 spices",
      "Salt and pepper to taste",
      "Fresh herbs for garnish"
    ];
    
    instructions = [
      "Prepare all ingredients before starting to cook.",
      "Heat oil in a large pan over medium heat.",
      "Add onion and cook until translucent, about 3-4 minutes.",
      "Add garlic and cook for 30 seconds until fragrant.",
      "Add protein and cook until browned or cooked through.",
      "Add vegetables and cook for 3-5 minutes until slightly softened.",
      "Add tomatoes, broth, and spices. Bring to a simmer.",
      "Cook for 15-20 minutes until flavors combine and sauce thickens.",
      "Season with salt and pepper to taste.",
      "Garnish with fresh herbs before serving."
    ];
  }
  
  // Create the recipe
  return {
    title,
    description: `${title} - Generated based on your request: "${request.description}"`,
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

// Get recipe suggestions
export async function suggestRecipes(query: string): Promise<any[]> {
  // In a real implementation, this would call the Gemini API
  // For demo, we'll return some hardcoded suggestions
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
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
