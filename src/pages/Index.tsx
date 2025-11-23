import { useState, useEffect, useRef } from "react";
import { IdeaInput } from "@/components/IdeaInput";
import { AgentTimeline } from "@/components/AgentTimeline";
import { BlueprintResults } from "@/components/BlueprintResults";
import { HistorySidebar } from "@/components/HistorySidebar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { InventionBlueprint, AgentStepInfo } from "@/lib/types/invention";
import { AGENT_NAMES } from "@/lib/agents/prompts";
import { saveBlueprint, getBlueprints, deleteBlueprint } from "@/lib/localStorage";

const Index = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [agentSteps, setAgentSteps] = useState<AgentStepInfo[]>([]);
  const [currentBlueprint, setCurrentBlueprint] = useState<InventionBlueprint | null>(null);
  const [history, setHistory] = useState<InventionBlueprint[]>([]);
  const mainContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHistory(getBlueprints());
  }, []);

  const initializeAgentSteps = () => {
    const steps: AgentStepInfo[] = [
      { name: AGENT_NAMES.ideaIntake, status: "pending" },
      { name: AGENT_NAMES.problem, status: "pending" },
      { name: AGENT_NAMES.research, status: "pending" },
      { name: AGENT_NAMES.feasibility, status: "pending" },
      { name: AGENT_NAMES.innovation, status: "pending" },
      { name: AGENT_NAMES.patentWriter, status: "pending" },
    ];
    setAgentSteps(steps);
    return steps;
  };

  const updateStepStatus = (
    steps: AgentStepInfo[],
    index: number,
    status: AgentStepInfo["status"],
    startTime?: number,
    endTime?: number
  ) => {
    const newSteps = [...steps];
    newSteps[index] = {
      ...newSteps[index],
      status,
      ...(startTime && { startTime }),
      ...(endTime && { endTime }),
    };
    setAgentSteps(newSteps);
    return newSteps;
  };

  const handleGenerateBlueprint = async (idea: string) => {
    setIsLoading(true);
    setCurrentBlueprint(null);
    
    const steps = initializeAgentSteps();
    let currentSteps = steps;

    try {
      // Simulate agent progression
      const agentNames = Object.keys(AGENT_NAMES) as Array<keyof typeof AGENT_NAMES>;
      
      for (let i = 0; i < agentNames.length; i++) {
        currentSteps = updateStepStatus(currentSteps, i, "active", Date.now());
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      // Call the edge function
      const { data, error } = await supabase.functions.invoke("invention-pipeline", {
        body: { idea },
      });

      if (error) throw error;

      // Mark all as complete
      for (let i = 0; i < agentNames.length; i++) {
        currentSteps = updateStepStatus(
          currentSteps,
          i,
          "complete",
          currentSteps[i].startTime,
          Date.now()
        );
      }

      // Create blueprint object
      const blueprint: InventionBlueprint = {
        id: Date.now().toString(),
        rawIdea: idea,
        ...data,
        createdAt: Date.now(),
      };

      setCurrentBlueprint(blueprint);
      saveBlueprint(blueprint);
      setHistory(getBlueprints());

      toast({
        title: "Blueprint Generated!",
        description: "Your invention blueprint has been created successfully.",
      });
    } catch (error) {
      console.error("Error generating blueprint:", error);
      
      // Mark current step as error
      const activeIndex = currentSteps.findIndex(s => s.status === "active");
      if (activeIndex !== -1) {
        updateStepStatus(currentSteps, activeIndex, "error");
      }

      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate blueprint",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectBlueprint = (blueprint: InventionBlueprint) => {
    setCurrentBlueprint(blueprint);
    setAgentSteps([]);
    
    // Scroll to top smoothly
    mainContentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteBlueprint = (id: string) => {
    deleteBlueprint(id);
    setHistory(getBlueprints());
    
    if (currentBlueprint?.id === id) {
      setCurrentBlueprint(null);
      setAgentSteps([]);
    }

    toast({
      title: "Deleted",
      description: "Blueprint removed from history",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Animated background gradient */}
      <div className="fixed inset-0 gradient-full opacity-10 animate-gradient pointer-events-none" />
      
      <div className="relative z-10 min-h-screen flex">
        {/* Main Content */}
        <div className="flex-1 p-8 overflow-y-auto" ref={mainContentRef}>
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="text-center space-y-4 py-8">
              <h1 className="text-5xl font-bold text-glow gradient-primary bg-clip-text text-transparent animate-slide-in">
                Idea-to-Invention AI
              </h1>
              <p className="text-xl text-muted-foreground animate-slide-in">
                Transform your raw ideas into comprehensive invention blueprints
              </p>
            </div>

            {/* Input */}
            <IdeaInput onSubmit={handleGenerateBlueprint} isLoading={isLoading} />

            {/* Timeline */}
            {agentSteps.length > 0 && <AgentTimeline steps={agentSteps} />}

            {/* Results */}
            {currentBlueprint && <BlueprintResults blueprint={currentBlueprint} />}
          </div>
        </div>

        {/* History Sidebar */}
        <div className="w-80 border-l border-border bg-background/50 backdrop-blur-sm p-6 overflow-hidden">
          <HistorySidebar
            history={history}
            onSelect={handleSelectBlueprint}
            onDelete={handleDeleteBlueprint}
            currentId={currentBlueprint?.id}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
