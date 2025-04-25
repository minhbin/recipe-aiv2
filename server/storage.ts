import { 
  users, type User, type InsertUser,
  recipes, type Recipe, type InsertRecipe,
  savedRecipes, type SavedRecipe, type InsertSavedRecipe
} from "@shared/schema";
import { NutritionFacts } from "@shared/types";
import { db } from "./db";
import { eq, and, desc, sql, like, or, not } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Recipe operations
  getRecipes(): Promise<Recipe[]>;
  getRecipe(id: number): Promise<Recipe | undefined>;
  createRecipe(recipe: InsertRecipe): Promise<Recipe>;
  searchRecipes(query: string, filters?: string[]): Promise<Recipe[]>;
  getSimilarRecipes(recipeId: number, limit?: number): Promise<Recipe[]>;
  
  // Saved recipe operations
  getSavedRecipes(userId: number): Promise<Recipe[]>;
  saveRecipe(savedRecipe: InsertSavedRecipe): Promise<SavedRecipe>;
  unsaveRecipe(userId: number, recipeId: number): Promise<void>;
  isRecipeSaved(userId: number, recipeId: number): Promise<boolean>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private recipes: Map<number, Recipe>;
  private savedRecipes: Map<number, SavedRecipe>;
  private userIdCounter: number;
  private recipeIdCounter: number;
  private savedRecipeIdCounter: number;

  constructor() {
    this.users = new Map();
    this.recipes = new Map();
    this.savedRecipes = new Map();
    this.userIdCounter = 1;
    this.recipeIdCounter = 1;
    this.savedRecipeIdCounter = 1;
    
    // Add some sample recipes
    this.addSampleRecipes();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Recipe operations
  async getRecipes(): Promise<Recipe[]> {
    return Array.from(this.recipes.values());
  }
  
  async getRecipe(id: number): Promise<Recipe | undefined> {
    return this.recipes.get(id);
  }
  
  async createRecipe(insertRecipe: InsertRecipe): Promise<Recipe> {
    const id = this.recipeIdCounter++;
    const createdAt = new Date().toISOString();
    const recipe: Recipe = { ...insertRecipe, id, createdAt };
    this.recipes.set(id, recipe);
    return recipe;
  }
  
  async searchRecipes(query: string, filters: string[] = []): Promise<Recipe[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.recipes.values()).filter(recipe => {
      // Search in title and description
      const matchesQuery = 
        recipe.title.toLowerCase().includes(lowercaseQuery) ||
        recipe.description.toLowerCase().includes(lowercaseQuery) ||
        recipe.ingredients.some(ingredient => 
          ingredient.toLowerCase().includes(lowercaseQuery)
        );
        
      // Apply filters if any
      const matchesFilters = filters.length === 0 || 
        filters.every(filter => 
          recipe.tags.some(tag => tag.toLowerCase() === filter.toLowerCase())
        );
        
      return matchesQuery && matchesFilters;
    });
  }
  
  async getSimilarRecipes(recipeId: number, limit: number = 3): Promise<Recipe[]> {
    const recipe = this.recipes.get(recipeId);
    if (!recipe) return [];
    
    // Get recipes with similar tags, excluding the current recipe
    return Array.from(this.recipes.values())
      .filter(r => r.id !== recipeId)
      .sort((a, b) => {
        // Count matching tags
        const aMatches = a.tags.filter(tag => recipe.tags.includes(tag)).length;
        const bMatches = b.tags.filter(tag => recipe.tags.includes(tag)).length;
        return bMatches - aMatches; // Sort by most matches first
      })
      .slice(0, limit);
  }
  
  // Saved recipe operations
  async getSavedRecipes(userId: number): Promise<Recipe[]> {
    const savedRecipeEntries = Array.from(this.savedRecipes.values())
      .filter(sr => sr.userId === userId);
      
    return savedRecipeEntries.map(sr => {
      const recipe = this.recipes.get(sr.recipeId);
      return recipe ? { ...recipe, isSaved: true } : undefined;
    }).filter((r): r is Recipe => r !== undefined);
  }
  
  async saveRecipe(insertSavedRecipe: InsertSavedRecipe): Promise<SavedRecipe> {
    const id = this.savedRecipeIdCounter++;
    const savedAt = new Date().toISOString();
    const savedRecipe: SavedRecipe = { ...insertSavedRecipe, id, savedAt };
    this.savedRecipes.set(id, savedRecipe);
    return savedRecipe;
  }
  
  async unsaveRecipe(userId: number, recipeId: number): Promise<void> {
    const savedRecipeEntry = Array.from(this.savedRecipes.values())
      .find(sr => sr.userId === userId && sr.recipeId === recipeId);
      
    if (savedRecipeEntry) {
      this.savedRecipes.delete(savedRecipeEntry.id);
    }
  }
  
  async isRecipeSaved(userId: number, recipeId: number): Promise<boolean> {
    return Array.from(this.savedRecipes.values())
      .some(sr => sr.userId === userId && sr.recipeId === recipeId);
  }
  
  // Helper to add sample recipes
  private addSampleRecipes() {
    const sampleRecipes: InsertRecipe[] = [
      {
        title: "Mediterranean Chicken Salad",
        description: "A light and fresh salad with grilled chicken, mixed greens, feta cheese, and a lemon vinaigrette.",
        imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
        ingredients: [
          "2 boneless, skinless chicken breasts (about 1 pound)",
          "6 cups mixed salad greens",
          "1 cup cherry tomatoes, halved",
          "1 cucumber, diced",
          "1/2 red onion, thinly sliced",
          "1/2 cup kalamata olives, pitted",
          "4 oz feta cheese, crumbled",
          "2 tbsp extra virgin olive oil",
          "1 lemon, juiced",
          "1 tsp dried oregano",
          "Salt and pepper to taste"
        ],
        instructions: [
          "Season chicken breasts with salt, pepper, and a pinch of oregano.",
          "Grill chicken over medium-high heat for 6-7 minutes per side or until internal temperature reaches 165°F (74°C).",
          "Allow chicken to rest for 5 minutes, then slice into strips.",
          "In a large bowl, whisk together olive oil, lemon juice, oregano, salt, and pepper to make the dressing.",
          "In a large salad bowl, combine mixed greens, cherry tomatoes, cucumber, red onion, and olives.",
          "Add the sliced chicken on top of the salad.",
          "Drizzle with the dressing and sprinkle crumbled feta cheese on top.",
          "Toss gently and serve immediately."
        ],
        prepTime: 15,
        cookTime: 15,
        servings: 4,
        difficulty: "Easy",
        tags: ["Healthy", "Protein", "Salad", "Gluten-Free"],
        nutritionFacts: {
          calories: 420,
          protein: 32,
          carbs: 18,
          fat: 24
        },
        isAIGenerated: false
      },
      {
        title: "Baked Salmon with Asparagus",
        description: "Perfectly baked salmon fillets with roasted asparagus and sweet potato mash.",
        imageUrl: "https://images.unsplash.com/photo-1593906930848-a79daafbdcda",
        ingredients: [
          "4 salmon fillets (about 6 oz each)",
          "1 bunch asparagus, trimmed",
          "2 large sweet potatoes, peeled and cubed",
          "3 tbsp olive oil, divided",
          "1 lemon, sliced",
          "2 cloves garlic, minced",
          "2 tbsp fresh dill, chopped",
          "1/4 cup milk",
          "2 tbsp butter",
          "Salt and pepper to taste"
        ],
        instructions: [
          "Preheat oven to 400°F (200°C).",
          "Place salmon fillets on a baking sheet lined with parchment paper.",
          "Arrange asparagus around the salmon.",
          "Drizzle salmon and asparagus with 2 tbsp olive oil.",
          "Season with salt, pepper, and sprinkle with minced garlic and dill.",
          "Place lemon slices on top of the salmon.",
          "Bake for 12-15 minutes until salmon is cooked through and asparagus is tender.",
          "Meanwhile, boil sweet potatoes in salted water until tender, about 15 minutes.",
          "Drain sweet potatoes and return to pot. Add milk, butter, salt, and pepper.",
          "Mash until smooth and creamy.",
          "Serve salmon and asparagus with sweet potato mash on the side."
        ],
        prepTime: 15,
        cookTime: 30,
        servings: 4,
        difficulty: "Medium",
        tags: ["High Protein", "Seafood", "Gluten-Free", "Omega-3"],
        nutritionFacts: {
          calories: 380,
          protein: 28,
          carbs: 22,
          fat: 18
        },
        isAIGenerated: false
      },
      {
        title: "Quick Vegetable Stir Fry",
        description: "A colorful and nutrient-packed vegetable stir fry with tofu and brown rice.",
        imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd",
        ingredients: [
          "1 block (14 oz) extra-firm tofu, pressed and cubed",
          "2 cups brown rice, cooked",
          "1 red bell pepper, sliced",
          "1 yellow bell pepper, sliced",
          "1 cup broccoli florets",
          "1 cup snap peas",
          "1 carrot, julienned",
          "1 tbsp ginger, minced",
          "2 cloves garlic, minced",
          "3 tbsp soy sauce or tamari",
          "1 tbsp rice vinegar",
          "1 tbsp sesame oil",
          "1 tbsp vegetable oil",
          "1 tbsp cornstarch",
          "2 tbsp water",
          "2 green onions, sliced",
          "1 tbsp sesame seeds"
        ],
        instructions: [
          "In a small bowl, whisk together soy sauce, rice vinegar, and cornstarch dissolved in water.",
          "Heat vegetable oil in a large wok or skillet over high heat.",
          "Add tofu cubes and cook until golden brown on all sides, about 5 minutes. Remove and set aside.",
          "In the same pan, add sesame oil, ginger, and garlic. Stir for 30 seconds until fragrant.",
          "Add all vegetables and stir fry for 4-5 minutes until crisp-tender.",
          "Return tofu to the pan and pour in the sauce mixture.",
          "Cook for another 2 minutes until sauce thickens and coats everything.",
          "Serve over brown rice, garnished with green onions and sesame seeds."
        ],
        prepTime: 15,
        cookTime: 15,
        servings: 4,
        difficulty: "Easy",
        tags: ["Vegan", "Plant-Based", "Vegetarian", "Quick"],
        nutritionFacts: {
          calories: 310,
          protein: 14,
          carbs: 42,
          fat: 12
        },
        isAIGenerated: false
      }
    ];
    
    // Add all sample recipes
    sampleRecipes.forEach(recipe => {
      const id = this.recipeIdCounter++;
      const createdAt = new Date().toISOString();
      this.recipes.set(id, { ...recipe, id, createdAt });
    });
  }
}

// Database-backed storage implementation
export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Recipe operations
  async getRecipes(): Promise<Recipe[]> {
    return db.select().from(recipes).orderBy(desc(recipes.createdAt));
  }

  async getRecipe(id: number): Promise<Recipe | undefined> {
    const [recipe] = await db.select().from(recipes).where(eq(recipes.id, id));
    return recipe || undefined;
  }

  async createRecipe(insertRecipe: InsertRecipe): Promise<Recipe> {
    const [recipe] = await db
      .insert(recipes)
      .values(insertRecipe)
      .returning();
    return recipe;
  }

  async searchRecipes(query: string, filters: string[] = []): Promise<Recipe[]> {
    let queryBuilder = db.select().from(recipes);
    
    if (query) {
      // Search in title, description, or ingredients
      queryBuilder = queryBuilder.where(
        or(
          like(recipes.title, `%${query}%`),
          like(recipes.description, `%${query}%`),
          sql`${recipes.ingredients}::text ILIKE ${'%' + query + '%'}`
        )
      );
    }
    
    // Apply tag filters if any
    if (filters && filters.length > 0) {
      // For each filter, check if it exists in the tags array
      filters.forEach(filter => {
        queryBuilder = queryBuilder.where(
          sql`${filter}=ANY(${recipes.tags})`
        );
      });
    }
    
    return queryBuilder.orderBy(desc(recipes.createdAt));
  }

  async getSimilarRecipes(recipeId: number, limit: number = 3): Promise<Recipe[]> {
    // Get the recipe we want to find similar recipes for
    const [targetRecipe] = await db.select().from(recipes).where(eq(recipes.id, recipeId));
    
    if (!targetRecipe) {
      return [];
    }
    
    // This is a simplified approach - in a real app, you might use more sophisticated
    // algorithms to find similar recipes
    const similarRecipes = await db.select().from(recipes)
      .where(
        and(
          not(eq(recipes.id, recipeId)),
          // Look for recipes with at least one matching tag
          sql`EXISTS (
            SELECT 1 
            FROM unnest(${recipes.tags}) tag
            WHERE tag = ANY(${targetRecipe.tags})
          )`
        )
      )
      .limit(limit);
    
    return similarRecipes;
  }

  // Saved recipe operations
  async getSavedRecipes(userId: number): Promise<Recipe[]> {
    const savedRecipesResult = await db
      .select({
        recipe: recipes,
        savedAt: savedRecipes.savedAt
      })
      .from(savedRecipes)
      .innerJoin(recipes, eq(savedRecipes.recipeId, recipes.id))
      .where(eq(savedRecipes.userId, userId))
      .orderBy(desc(savedRecipes.savedAt));
    
    // Add isSaved property to each recipe
    return savedRecipesResult.map(result => ({
      ...result.recipe,
      isSaved: true
    }));
  }

  async saveRecipe(insertSavedRecipe: InsertSavedRecipe): Promise<SavedRecipe> {
    const [savedRecipe] = await db
      .insert(savedRecipes)
      .values(insertSavedRecipe)
      .returning();
      
    return savedRecipe;
  }

  async unsaveRecipe(userId: number, recipeId: number): Promise<void> {
    await db
      .delete(savedRecipes)
      .where(
        and(
          eq(savedRecipes.userId, userId),
          eq(savedRecipes.recipeId, recipeId)
        )
      );
  }

  async isRecipeSaved(userId: number, recipeId: number): Promise<boolean> {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(savedRecipes)
      .where(
        and(
          eq(savedRecipes.userId, userId),
          eq(savedRecipes.recipeId, recipeId)
        )
      );
      
    return result.count > 0;
  }
}

// Initialize sample data in the database
async function initializeDatabase() {
  try {
    const sampleRecipes: InsertRecipe[] = [
      {
        title: "Mediterranean Chicken Salad",
        description: "A light and fresh salad with grilled chicken, mixed greens, feta cheese, and a lemon vinaigrette.",
        imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
        ingredients: [
          "2 boneless, skinless chicken breasts (about 1 pound)",
          "6 cups mixed salad greens",
          "1 cup cherry tomatoes, halved",
          "1 cucumber, diced",
          "1/2 red onion, thinly sliced",
          "1/2 cup kalamata olives, pitted",
          "4 oz feta cheese, crumbled",
          "2 tbsp extra virgin olive oil",
          "1 lemon, juiced",
          "1 tsp dried oregano",
          "Salt and pepper to taste"
        ],
        instructions: [
          "Season chicken breasts with salt, pepper, and a pinch of oregano.",
          "Grill chicken over medium-high heat for 6-7 minutes per side or until internal temperature reaches 165°F (74°C).",
          "Allow chicken to rest for 5 minutes, then slice into strips.",
          "In a large bowl, whisk together olive oil, lemon juice, oregano, salt, and pepper to make the dressing.",
          "In a large salad bowl, combine mixed greens, cherry tomatoes, cucumber, red onion, and olives.",
          "Add the sliced chicken on top of the salad.",
          "Drizzle with the dressing and sprinkle crumbled feta cheese on top.",
          "Toss gently and serve immediately."
        ],
        prepTime: 15,
        cookTime: 15,
        servings: 4,
        difficulty: "Easy",
        tags: ["Healthy", "Protein", "Salad", "Gluten-Free"],
        nutritionFacts: {
          calories: 420,
          protein: 32,
          carbs: 18,
          fat: 24
        },
        isAIGenerated: false
      },
      {
        title: "Baked Salmon with Asparagus",
        description: "Perfectly baked salmon fillets with roasted asparagus and sweet potato mash.",
        imageUrl: "https://images.unsplash.com/photo-1593906930848-a79daafbdcda",
        ingredients: [
          "4 salmon fillets (about 6 oz each)",
          "1 bunch asparagus, trimmed",
          "2 large sweet potatoes, peeled and cubed",
          "3 tbsp olive oil, divided",
          "1 lemon, sliced",
          "2 cloves garlic, minced",
          "2 tbsp fresh dill, chopped",
          "1/4 cup milk",
          "2 tbsp butter",
          "Salt and pepper to taste"
        ],
        instructions: [
          "Preheat oven to 400°F (200°C).",
          "Place salmon fillets on a baking sheet lined with parchment paper.",
          "Arrange asparagus around the salmon.",
          "Drizzle salmon and asparagus with 2 tbsp olive oil.",
          "Season with salt, pepper, and sprinkle with minced garlic and dill.",
          "Place lemon slices on top of the salmon.",
          "Bake for 12-15 minutes until salmon is cooked through and asparagus is tender.",
          "Meanwhile, boil sweet potatoes in salted water until tender, about 15 minutes.",
          "Drain sweet potatoes and return to pot. Add milk, butter, salt, and pepper.",
          "Mash until smooth and creamy.",
          "Serve salmon and asparagus with sweet potato mash on the side."
        ],
        prepTime: 15,
        cookTime: 30,
        servings: 4,
        difficulty: "Medium",
        tags: ["High Protein", "Seafood", "Gluten-Free", "Omega-3"],
        nutritionFacts: {
          calories: 380,
          protein: 28,
          carbs: 22,
          fat: 18
        },
        isAIGenerated: false
      },
      {
        title: "Quick Vegetable Stir Fry",
        description: "A colorful and nutrient-packed vegetable stir fry with tofu and brown rice.",
        imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd",
        ingredients: [
          "1 block (14 oz) extra-firm tofu, pressed and cubed",
          "2 cups brown rice, cooked",
          "1 red bell pepper, sliced",
          "1 yellow bell pepper, sliced",
          "1 cup broccoli florets",
          "1 cup snap peas",
          "1 carrot, julienned",
          "1 tbsp ginger, minced",
          "2 cloves garlic, minced",
          "3 tbsp soy sauce or tamari",
          "1 tbsp rice vinegar",
          "1 tbsp sesame oil",
          "1 tbsp vegetable oil",
          "1 tbsp cornstarch",
          "2 tbsp water",
          "2 green onions, sliced",
          "1 tbsp sesame seeds"
        ],
        instructions: [
          "In a small bowl, whisk together soy sauce, rice vinegar, and cornstarch dissolved in water.",
          "Heat vegetable oil in a large wok or skillet over high heat.",
          "Add tofu cubes and cook until golden brown on all sides, about 5 minutes. Remove and set aside.",
          "In the same pan, add sesame oil, ginger, and garlic. Stir for 30 seconds until fragrant.",
          "Add all vegetables and stir fry for 4-5 minutes until crisp-tender.",
          "Return tofu to the pan and pour in the sauce mixture.",
          "Cook for another 2 minutes until sauce thickens and coats everything.",
          "Serve over brown rice, garnished with green onions and sesame seeds."
        ],
        prepTime: 15,
        cookTime: 15,
        servings: 4,
        difficulty: "Easy",
        tags: ["Vegan", "Plant-Based", "Vegetarian", "Quick"],
        nutritionFacts: {
          calories: 310,
          protein: 14,
          carbs: 42,
          fat: 12
        },
        isAIGenerated: false
      }
    ];

    // Check if recipes already exist
    const existingRecipes = await db.select({ count: sql<number>`count(*)` }).from(recipes);
    if (existingRecipes[0].count === 0) {
      console.log("Initializing database with sample recipes...");
      await db.insert(recipes).values(sampleRecipes);
      console.log("Sample recipes added successfully!");
    } else {
      console.log("Database already has recipes, skipping initialization.");
    }
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}

// Initialize db and create storage object
initializeDatabase().catch(console.error);

export const storage = new DatabaseStorage();
