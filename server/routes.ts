import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertRecipeSchema, insertSavedRecipeSchema } from "@shared/schema";
import { generateAIRecipe, suggestRecipes } from "./gemini";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create an API router
  const apiRouter = express.Router();
  
  // Get all recipes
  apiRouter.get("/recipes", async (req: Request, res: Response) => {
    try {
      const recipes = await storage.getRecipes();
      res.json(recipes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recipes" });
    }
  });
  
  // Get a specific recipe by ID
  apiRouter.get("/recipes/:id", async (req: Request, res: Response) => {
    try {
      const recipeId = parseInt(req.params.id);
      const recipe = await storage.getRecipe(recipeId);
      
      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      
      res.json(recipe);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recipe" });
    }
  });
  
  // Search recipes
  apiRouter.get("/recipes/search", async (req: Request, res: Response) => {
    try {
      const query = req.query.q as string || "";
      const filters = req.query.filters ? (req.query.filters as string).split(",") : [];
      
      const recipes = await storage.searchRecipes(query, filters);
      res.json(recipes);
    } catch (error) {
      res.status(500).json({ message: "Failed to search recipes" });
    }
  });
  
  // Get similar recipes
  apiRouter.get("/recipes/:id/similar", async (req: Request, res: Response) => {
    try {
      const recipeId = parseInt(req.params.id);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 3;
      
      const similarRecipes = await storage.getSimilarRecipes(recipeId, limit);
      res.json(similarRecipes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch similar recipes" });
    }
  });
  
  // Get saved recipes
  apiRouter.get("/recipes/saved", async (req: Request, res: Response) => {
    try {
      // In a real app with authentication, we would get userId from authenticated session
      // For demo purposes, we'll use a default user ID
      const userId = 1;
      
      const savedRecipes = await storage.getSavedRecipes(userId);
      res.json(savedRecipes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch saved recipes" });
    }
  });
  
  // Save a recipe
  apiRouter.post("/recipes/saved", async (req: Request, res: Response) => {
    try {
      // Validate request body
      const validator = z.object({
        recipeId: z.number()
      });
      
      const { recipeId } = validator.parse(req.body);
      
      // In a real app with authentication, we would get userId from authenticated session
      // For demo purposes, we'll use a default user ID
      const userId = 1;
      
      // Check if recipe exists
      const recipe = await storage.getRecipe(recipeId);
      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      
      // Check if already saved
      const isAlreadySaved = await storage.isRecipeSaved(userId, recipeId);
      if (isAlreadySaved) {
        return res.status(409).json({ message: "Recipe is already saved" });
      }
      
      const savedRecipe = await storage.saveRecipe({
        userId,
        recipeId
      });
      
      res.status(201).json(savedRecipe);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to save recipe" });
    }
  });
  
  // Remove a saved recipe
  apiRouter.delete("/recipes/saved/:id", async (req: Request, res: Response) => {
    try {
      const recipeId = parseInt(req.params.id);
      
      // In a real app with authentication, we would get userId from authenticated session
      // For demo purposes, we'll use a default user ID
      const userId = 1;
      
      await storage.unsaveRecipe(userId, recipeId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to remove saved recipe" });
    }
  });
  
  // Generate a recipe with AI
  apiRouter.post("/recipes/generate", async (req: Request, res: Response) => {
    try {
      // Validate request body
      const validator = z.object({
        description: z.string(),
        dietaryPreferences: z.array(z.string()).optional(),
        cookingTime: z.number().optional()
      });
      
      const generationRequest = validator.parse(req.body);
      
      // Generate recipe with Gemini
      const generatedRecipe = await generateAIRecipe(generationRequest);
      
      // Save the generated recipe
      const recipe = await storage.createRecipe({
        ...generatedRecipe,
        isAIGenerated: true
      });
      
      res.status(201).json(recipe);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      console.error("Recipe generation error:", error);
      res.status(500).json({ message: "Failed to generate recipe" });
    }
  });
  
  // Get recipe suggestions
  apiRouter.get("/recipes/suggest", async (req: Request, res: Response) => {
    try {
      const query = req.query.query as string || "";
      
      // Get suggestions using Gemini
      const suggestions = await suggestRecipes(query);
      
      res.json(suggestions);
    } catch (error) {
      console.error("Recipe suggestion error:", error);
      res.status(500).json({ message: "Failed to get recipe suggestions" });
    }
  });
  
  // Mount the API router
  app.use("/api", apiRouter);
  
  const httpServer = createServer(app);
  return httpServer;
}
