import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Lightbulb, Cpu } from "lucide-react";

interface IdeaInputProps {
  onSubmit: (idea: string) => void;
  isLoading: boolean;
}

export const IdeaInput = ({ onSubmit, isLoading }: IdeaInputProps) => {
  const [idea, setIdea] = useState("");

  const handleSubmit = () => {
    if (idea.trim() && !isLoading) {
      onSubmit(idea.trim());
    }
  };

  return (
    <div className="glass rounded-2xl p-8 animate-slide-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-primary text-white">
          <Lightbulb className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-glow">Your Invention Idea</h2>
          <p className="text-muted-foreground text-sm">Describe your idea in detail</p>
        </div>
      </div>
      
      <Textarea
        value={idea}
        onChange={(e) => setIdea(e.target.value)}
        placeholder="Enter your raw invention idea here... Be as detailed as possible. For example: 'A smart water bottle that tracks hydration levels and reminds users to drink water based on their activity level and environment...'"
        className="min-h-[200px] bg-background/50 border-primary/30 focus:border-primary text-foreground resize-none mb-6"
        disabled={isLoading}
      />
      
      <Button
        onClick={handleSubmit}
        disabled={!idea.trim() || isLoading}
        className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-6 text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
            Processing Agents...
          </>
        ) : (
          <>
            <Cpu className="w-5 h-5 mr-2" />
            Generate Invention Blueprint
          </>
        )}
      </Button>
    </div>
  );
};
