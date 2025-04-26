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

// Simple implementation for direct text completion
async function fetchTextFromGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    console.warn("No Gemini API key found.");
    return "";
  }
  
  try {
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
    if (data.candidates && data.candidates[0]?.content?.parts && data.candidates[0].content.parts[0]?.text) {
      return data.candidates[0].content.parts[0].text;
    }
    
    return "";
  } catch (error) {
    console.error("Error fetching from Gemini API:", error);
    return "";
  }
}

export async function processChatMessage(message: string) {
  try {
    // Chef prompt for cooking advice
    const prompt = "You are a helpful chef assistant providing recipe ideas and cooking advice. " +
                 "The user is asking about: " + message + "\n\n" +
                 "Provide a helpful, detailed response with cooking instructions if they're asking for a recipe. " +
                 "If they're asking for cooking advice, give clear, practical tips. " +
                 "Focus exclusively on food and cooking topics.\n\n" +
                 "Format your response nicely using these markdown-like features:\n" +
                 "- Use '# ' at the start of a line for section headers (like 'Ingredients' or 'Instructions')\n" +
                 "- Use '## ' for subheadings\n" +
                 "- Use '*text*' for emphasis\n" +
                 "- Use '**text**' for strong emphasis\n" +
                 "- Use proper line breaks between paragraphs for easy reading\n" +
                 "- Format ingredients and instructions as numbered or bulleted lists when appropriate";
    
    // Get response from Gemini API
    const response = await fetchTextFromGemini(prompt);
    
    // If we got a valid response, return it
    if (response && response.length > 0) {
      // Find related recipes for suggestions
      const suggestedRecipes = await findRelatedRecipes(message);
      
      return {
        response,
        recipes: suggestedRecipes
      };
    }
    
    // Otherwise use fallback
    return processFallbackChat(message);
    
  } catch (error) {
    console.error("Error with chat processing:", error);
    return processFallbackChat(message);
  }
}

// Fallback for when the API key isn't available or there's an error
function processFallbackChat(message: string) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes("chicken")) {
    return {
      response: "# Simple Roast Chicken with Herbs\n\nI'd recommend a classic roast chicken with herbs. It's a timeless dish that's both impressive and comforting.\n\n## Ingredients\n- 1 whole chicken (about a 4-5 pound chicken)\n- 2 tablespoons olive oil\n- 2 teaspoons salt\n- 1 teaspoon freshly ground black pepper\n- 1 tablespoon fresh rosemary, chopped (or 1 teaspoon dried)\n- 1 tablespoon fresh thyme leaves (or 1 teaspoon dried)\n- 1 lemon, quartered\n- 4 cloves garlic, peeled\n\n## Instructions\n1. Preheat your oven to 375°F (190°C).\n2. Pat the chicken dry thoroughly with paper towels, inside and out.\n3. Rub the entire chicken with olive oil, then season generously with salt, pepper, rosemary, and thyme both outside and inside the cavity.\n4. Stuff the cavity with the quartered lemon and garlic cloves.\n5. Place the chicken breast-side up in a roasting pan.\n6. Roast for about 1 hour and 15 minutes, or until the juices run clear when you cut between the leg and thigh, or until the internal temperature reaches 165°F.\n7. Let the chicken rest for 10 minutes before carving.\n8. Serve with the pan juices drizzled on top.\n\nThis simple preparation lets the quality of the chicken shine through while the herbs and lemon add wonderful aromatic flavors.",
      recipes: []
    };
  } else if (lowerMessage.includes("pasta") || lowerMessage.includes("spaghetti")) {
    return {
      response: "# Classic Spaghetti Carbonara\n\nHow about a classic spaghetti carbonara? It's a creamy, satisfying pasta dish that uses just a few ingredients but delivers incredible flavor.\n\n## Ingredients\n- 1 pound (450g) spaghetti\n- 8 oz (225g) pancetta or guanciale, diced\n- 4 large egg yolks\n- 1 whole large egg\n- 1 cup (100g) freshly grated Pecorino Romano or Parmesan cheese\n- Freshly ground black pepper\n- Salt for the pasta water\n\n## Instructions\n1. Bring a large pot of generously salted water to a boil and cook the spaghetti until al dente according to package instructions.\n2. While the pasta is cooking, heat a large skillet over medium heat. Add the pancetta and cook until crispy, about 8-10 minutes.\n3. In a bowl, whisk together the egg yolks, whole egg, and grated cheese until combined. Season with plenty of freshly ground black pepper.\n4. When the pasta is done, reserve 1 cup of the pasta cooking water, then drain the pasta.\n5. Working quickly, add the hot pasta to the skillet with the pancetta. Toss to combine. Remove from heat.\n6. Quickly add the egg and cheese mixture to the pasta, stirring vigorously. The heat from the pasta will cook the eggs into a creamy sauce. If it seems too thick, add a splash of the reserved pasta water to reach your desired consistency.\n7. Serve immediately with an extra sprinkle of cheese and black pepper on top.\n\n*The secret to perfect carbonara is working quickly when adding the egg mixture to ensure it becomes creamy without scrambling!*",
      recipes: []
    };
  } else if (lowerMessage.includes("vegetarian") || lowerMessage.includes("vegan")) {
    return {
      response: "# Hearty Vegetable Curry\n\nI suggest a hearty vegetable curry that's packed with flavor and nutrition. This versatile dish works with whatever vegetables you have on hand.\n\n## Ingredients\n- 2 tablespoons vegetable oil\n- 1 large onion, diced\n- 3 cloves garlic, minced\n- 1 tablespoon fresh ginger, grated\n- 2-3 tablespoons curry powder (adjust to taste)\n- 1 teaspoon ground cumin\n- 1 teaspoon ground coriander\n- 1/4 teaspoon cayenne pepper (optional, for heat)\n- 1 large potato, cubed\n- 2 carrots, sliced\n- 1 bell pepper, diced\n- 1 cup cauliflower florets\n- 1 can (14 oz) diced tomatoes\n- 1 can (14 oz) coconut milk\n- 1 cup vegetable broth\n- 1 can (15 oz) chickpeas, drained and rinsed\n- Salt and pepper to taste\n- Fresh cilantro for garnish\n\n## Instructions\n1. Heat oil in a large pot over medium heat. Add onions and sauté until softened, about 5 minutes.\n2. Add garlic and ginger and cook for another minute until fragrant.\n3. Stir in curry powder, cumin, coriander, and cayenne pepper (if using). Cook for 30 seconds to toast the spices.\n4. Add potatoes, carrots, bell pepper, and cauliflower. Stir to coat with the spices.\n5. Pour in diced tomatoes, coconut milk, and vegetable broth. Bring to a simmer.\n6. Reduce heat to medium-low, cover, and simmer for about 15-20 minutes until the vegetables are tender.\n7. Add chickpeas and cook for another 5 minutes.\n8. Season with salt and pepper to taste.\n9. Serve hot over rice or with naan bread and garnish with fresh cilantro.\n\n*This curry is even better the next day when the flavors have had time to meld together!*",
      recipes: []
    };
  } else if (lowerMessage.includes("dessert") || lowerMessage.includes("sweet")) {
    return {
      response: "# Classic Apple Crumble\n\nA simple apple crumble is always delicious and comforting. It's the perfect dessert for using seasonal apples.\n\n## Ingredients\n\n**For the filling:**\n- 4-5 large apples (Granny Smith or other tart baking apples), peeled, cored, and sliced\n- 1/2 cup granulated sugar\n- 1 tablespoon lemon juice\n- 1 teaspoon ground cinnamon\n- 1/4 teaspoon ground nutmeg\n- 1 tablespoon cornstarch\n\n**For the crumble topping:**\n- 1 cup rolled oats\n- 3/4 cup all-purpose flour\n- 3/4 cup brown sugar, packed\n- 1/2 cup cold butter, cubed\n- 1/2 teaspoon ground cinnamon\n- Pinch of salt\n\n## Instructions\n1. Preheat your oven to 350°F (175°C).\n2. In a large bowl, toss the sliced apples with granulated sugar, lemon juice, cinnamon, nutmeg, and cornstarch until evenly coated.\n3. Transfer the apple mixture to a 9-inch square baking dish or pie dish, spreading it out evenly.\n4. In another bowl, combine oats, flour, brown sugar, cinnamon, and salt.\n5. Add the cold cubed butter and use your fingers or a pastry cutter to work it into the dry ingredients until the mixture resembles coarse crumbs.\n6. Sprinkle the crumble topping evenly over the apples.\n7. Bake for 40-45 minutes until the topping is golden brown and the filling is bubbling around the edges.\n8. Let cool for 10 minutes before serving.\n9. Serve warm with vanilla ice cream or whipped cream.\n\n*The contrast between the warm, soft spiced apples and the crunchy sweet topping is absolutely divine!*",
      recipes: []
    };
  } else {
    return {
      response: "I'd be happy to help you find a recipe! To get started, could you tell me what kind of dish you're looking to make? Or do you have specific ingredients you'd like to use?\n\nI can suggest recipes based on:\n\n- Main ingredients (chicken, beef, fish, tofu, etc.)\n- Dietary preferences (vegetarian, vegan, gluten-free, etc.)\n- Meal type (breakfast, lunch, dinner, snack, dessert)\n- Cooking method (baking, grilling, slow cooker, etc.)\n- Cuisine (Italian, Mexican, Asian, etc.)\n- Cooking time (quick 30-minute meals or weekend cooking projects)\n\nJust let me know what you're in the mood for!",
      recipes: []
    };
  }
}