import { RecipeGenerationRequest } from "@shared/types";
import { storage } from "./storage";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Helper to get closest recipes for suggestions
async function findRelatedRecipes(query: string, limit: number = 3) {
  const allRecipes = await storage.getRecipes();
  
  // Very simple search - in a real application, you would use a more advanced system
  // like vector DB or proper search indexing
  const matches = allRecipes.filter(recipe => {
    const searchableText = `${recipe.title} ${recipe.description} ${recipe.ingredients.join(' ')}`.toLowerCase();
    return searchableText.includes(query.toLowerCase());
  });
  
  // Return a limited set of suggestions
  return matches.slice(0, limit).map(recipe => ({
    id: recipe.id,
    title: recipe.title
  }));
}

export async function processChatMessage(message: string) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  
  if (!apiKey) {
    console.warn("No Gemini API key found. Using fallback responses.");
    return processFallbackChat(message);
  }
  
  try {
    // Initialize Gemini API
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Use generativeModel directly without chat session
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 800,
        topP: 0.8,
        topK: 40
      }
    });
    
    // Create the prompt with cooking context
    const prompt = {
      parts: [{
        text: "You are a helpful chef assistant providing recipe ideas and cooking advice. " +
             "The user is asking about: " + message + "\n\n" +
             "Provide a helpful, detailed response with cooking instructions if they're asking for a recipe. " +
             "If they're asking for cooking advice, give clear, practical tips. " +
             "Focus exclusively on food and cooking topics."
      }]
    };
    
    // Send the message and get a response
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    // Find related recipes for suggestions
    const suggestedRecipes = await findRelatedRecipes(message);
    
    return {
      response,
      recipes: suggestedRecipes
    };
    
  } catch (error) {
    console.error("Error with Gemini API:", error);
    return processFallbackChat(message);
  }
}

// Fallback for when the API key isn't available or there's an error
function processFallbackChat(message: string) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes("chicken")) {
    return {
      response: "I'd recommend a simple roast chicken with herbs. Season a whole chicken with salt, pepper, and herbs like rosemary and thyme. Stuff with lemon and garlic, then roast at 375°F for about 1 hour and 15 minutes or until the internal temperature reaches 165°F. Let it rest for 10 minutes before carving.",
      recipes: []
    };
  } else if (lowerMessage.includes("pasta") || lowerMessage.includes("spaghetti")) {
    return {
      response: "How about a classic spaghetti carbonara? Cook spaghetti according to package instructions. In a bowl, mix 4 egg yolks, 1 whole egg, and 1 cup grated Parmesan. In a pan, cook diced pancetta until crispy. Toss hot pasta with the egg mixture and pancetta. The heat from the pasta cooks the eggs into a creamy sauce. Finish with black pepper and more cheese.",
      recipes: []
    };
  } else if (lowerMessage.includes("vegetarian") || lowerMessage.includes("vegan")) {
    return {
      response: "I suggest a hearty vegetable curry. Sauté onions, garlic, and ginger in oil, then add curry powder and cook until fragrant. Add diced vegetables like potatoes, carrots, and bell peppers, then pour in coconut milk and simmer until vegetables are tender. Serve with rice or naan bread.",
      recipes: []
    };
  } else if (lowerMessage.includes("dessert") || lowerMessage.includes("sweet")) {
    return {
      response: "A simple apple crumble is always delicious. Slice 4-5 apples and toss with cinnamon, sugar, and lemon juice. For the topping, mix oats, flour, butter, and brown sugar until crumbly. Spread the topping over the apples and bake at 350°F for 45 minutes until golden and bubbly. Serve warm with ice cream.",
      recipes: []
    };
  } else {
    return {
      response: "I'd be happy to help you find a recipe! To get started, could you tell me what kind of dish you're looking to make? Or do you have specific ingredients you'd like to use?",
      recipes: []
    };
  }
}