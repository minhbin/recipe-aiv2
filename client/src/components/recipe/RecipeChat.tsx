import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Recipe } from "@shared/types";
import { toast } from "@/hooks/use-toast";
import { Link } from "wouter";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type RecipeLink = {
  id: number;
  title: string;
}

export default function RecipeChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm your recipe assistant. Ask me for any recipe ideas or cooking advice."
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedRecipes, setSuggestedRecipes] = useState<RecipeLink[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Add user message to chat
    const userMessage = { role: "user" as const, content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    
    try {
      // Send request to server
      const response = await fetch("/api/recipes/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage.content }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to get response");
      }
      
      const data = await response.json();
      
      // Add assistant message to chat
      setMessages((prev) => [...prev, { 
        role: "assistant", 
        content: data.response 
      }]);
      
      // Set any recipe suggestions if available
      if (data.recipes && data.recipes.length > 0) {
        setSuggestedRecipes(data.recipes);
      } else {
        setSuggestedRecipes([]);
      }
      
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description: "Failed to get a response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] rounded-xl overflow-hidden border border-neutral bg-white shadow-md">
      <div className="bg-primary text-white p-4 flex items-center">
        <Avatar className="h-8 w-8 mr-2">
          <AvatarImage src="/chef-avatar.png" />
          <AvatarFallback>👨‍🍳</AvatarFallback>
        </Avatar>
        <h3 className="font-bold">Recipe Chef Assistant</h3>
      </div>
      
      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div 
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === "user" 
                  ? "bg-primary text-white rounded-tr-none" 
                  : "bg-neutral-lightest rounded-tl-none"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-lg p-3 bg-neutral-lightest rounded-tl-none flex items-center">
              <LoadingSpinner size="sm" className="mr-2" />
              <span className="text-gray-600">Thinking...</span>
            </div>
          </div>
        )}
        
        {/* Recipe suggestions */}
        {suggestedRecipes.length > 0 && (
          <div className="flex justify-start">
            <Card className="w-full max-w-[80%]">
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">Suggested Recipes:</h4>
                <div className="space-y-2">
                  {suggestedRecipes.map((recipe) => (
                    <div key={recipe.id}>
                      <Link href={`/recipe/${recipe.id}`}>
                        <div className="p-2 text-primary hover:bg-neutral-lightest rounded-md transition-colors cursor-pointer">
                          {recipe.title}
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input form */}
      <form onSubmit={handleSubmit} className="border-t border-neutral p-4 bg-white">
        <div className="flex space-x-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask for any recipe... (e.g., 'Can I have a chicken recipe?')"
            className="flex-1 resize-none"
            rows={2}
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <Button 
            type="submit"
            disabled={isLoading || !input.trim()}
            className="self-end"
          >
            {isLoading ? <LoadingSpinner size="sm" /> : "Send"}
          </Button>
        </div>
      </form>
    </div>
  );
}