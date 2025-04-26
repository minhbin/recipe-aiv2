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
  description?: string;
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
            {message.role === "assistant" && (
              <Avatar className="h-8 w-8 mr-2 mt-1 flex-shrink-0">
                <AvatarImage src="/chef-avatar.png" />
                <AvatarFallback>👨‍🍳</AvatarFallback>
              </Avatar>
            )}
            <div 
              className={`max-w-[80%] rounded-lg p-4 shadow-sm ${
                message.role === "user" 
                  ? "bg-primary text-white rounded-tr-none" 
                  : "bg-neutral-lightest rounded-tl-none border border-neutral/10"
              }`}
            >
              {message.role === "assistant" ? (
                <div className="prose prose-sm max-w-none text-gray-800">
                  {message.content.split('\n').map((paragraph, i) => {
                    if (!paragraph.trim()) return null;
                    
                    // Handle special formatting
                    if (paragraph.startsWith('# ')) {
                      return (
                        <h3 key={i} className="text-lg font-bold mt-3 mb-2 text-primary">
                          {paragraph.substring(2)}
                        </h3>
                      );
                    } else if (paragraph.startsWith('## ')) {
                      return (
                        <h4 key={i} className="text-md font-semibold mt-3 mb-1 text-primary/90">
                          {paragraph.substring(3)}
                        </h4>
                      );
                    } else if (paragraph.startsWith('- ')) {
                      return (
                        <div key={i} className="ml-4 mb-2 flex">
                          <span className="mr-2">•</span>
                          <span>{paragraph.substring(2)}</span>
                        </div>
                      );
                    } else if (paragraph.match(/^\d+\.\s/)) {
                      return (
                        <div key={i} className="flex mb-2">
                          <span className="font-semibold mr-2">{paragraph.match(/^\d+\./)?.[0]}</span>
                          <span>{paragraph.replace(/^\d+\.\s/, '')}</span>
                        </div>
                      );
                    } else {
                      // Handle emphasis and strong elements
                      if (paragraph.startsWith('*') && paragraph.endsWith('*')) {
                        return (
                          <p key={i} className="mb-2 last:mb-0">
                            <em>{paragraph.substring(1, paragraph.length - 1).trim()}</em>
                          </p>
                        );
                      } else if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                        return (
                          <p key={i} className="mb-2 last:mb-0">
                            <strong>{paragraph.substring(2, paragraph.length - 2)}</strong>
                          </p>
                        );
                      } else {
                        return (
                          <p key={i} className="mb-2 last:mb-0">
                            {paragraph}
                          </p>
                        );
                      }
                    }
                  })}
                </div>
              ) : (
                message.content
              )}
            </div>
            {message.role === "user" && (
              <Avatar className="h-8 w-8 ml-2 mt-1 flex-shrink-0 bg-primary">
                <AvatarFallback className="text-white">You</AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <Avatar className="h-8 w-8 mr-2 mt-1 flex-shrink-0">
              <AvatarImage src="/chef-avatar.png" />
              <AvatarFallback>👨‍🍳</AvatarFallback>
            </Avatar>
            <div className="max-w-[80%] rounded-lg p-3 bg-neutral-lightest rounded-tl-none flex items-center border border-neutral/10 shadow-sm">
              <LoadingSpinner size="sm" className="mr-2" />
              <span className="text-gray-600">Chef is cooking up a response...</span>
            </div>
          </div>
        )}
        
        {/* Recipe suggestions */}
        {suggestedRecipes.length > 0 && (
          <div className="flex justify-start pl-10">
            <Card className="w-full max-w-[80%] shadow-md border-neutral/20 overflow-hidden">
              <div className="bg-primary/10 p-3 border-b border-neutral/10">
                <h4 className="font-medium text-primary">Related Recipes You Might Like</h4>
              </div>
              <CardContent className="p-0">
                <div className="divide-y divide-neutral/10">
                  {suggestedRecipes.map((recipe) => (
                    <div key={recipe.id}>
                      <Link href={`/recipe/${recipe.id}`}>
                        <div className="p-3 hover:bg-neutral-lightest transition-colors cursor-pointer">
                          <div className="font-medium text-primary hover:text-primary/80">
                            {recipe.title}
                          </div>
                          {recipe.description && (
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {recipe.description}
                            </p>
                          )}
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