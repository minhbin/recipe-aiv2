import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";

interface FilterTagsProps {
  activeFilters: string[];
  onRemoveFilter: (filter: string) => void;
  onAddFilterType: (filterType: string) => void;
}

export default function RecipeFilters({ activeFilters, onRemoveFilter, onAddFilterType }: FilterTagsProps) {
  const filterTypes = [
    { id: "dietary", label: "Dietary" },
    { id: "cuisine", label: "Cuisine" },
    { id: "time", label: "Time" }
  ];
  
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {activeFilters.map((filter, index) => (
        <span 
          key={index} 
          className="bg-primary bg-opacity-10 text-primary px-3 py-1 rounded-full text-sm flex items-center"
        >
          {filter}
          <button 
            className="ml-2 text-xs"
            onClick={() => onRemoveFilter(filter)}
            aria-label={`Remove ${filter} filter`}
          >
            <X size={12} />
          </button>
        </span>
      ))}
      
      {filterTypes.map(type => (
        <button
          key={type.id}
          className="bg-neutral-light bg-opacity-50 text-gray-700 px-3 py-1 rounded-full text-sm flex items-center"
          onClick={() => onAddFilterType(type.id)}
        >
          <Plus size={12} className="mr-1" />
          {type.label}
        </button>
      ))}
    </div>
  );
}
