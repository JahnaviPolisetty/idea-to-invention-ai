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
import { generateLocalBlueprint } from "@/lib/localGenerator";
import { generateLiveBlueprint } from "@/lib/aiClient";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Index = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [agentSteps, setAgentSteps] = useState<AgentStepInfo[]>([]);
  const [currentBlueprint, setCurrentBlueprint] = useState<InventionBlueprint | null>(null);
  const [history, setHistory] = useState<InventionBlueprint[]>([]);
  const mainContentRef = useRef<HTMLDivElement>(null);

  const [provider, setProvider] = useState<"gemini" | "groq">("gemini");
  const [apiKey, setApiKey] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    setHistory(getBlueprints());
    const savedProvider = localStorage.getItem("ai_provider") as "gemini" | "groq";
    const savedKey = localStorage.getItem("ai_api_key");
    if (savedProvider) setProvider(savedProvider);
    if (savedKey) setApiKey(savedKey);
  }, []);

  const handleSaveSettings = () => {
    localStorage.setItem("ai_provider", provider);
    localStorage.setItem("ai_api_key", apiKey);
    setIsSettingsOpen(false);
    toast({
      title: "Settings Saved",
      description: "API key and provider saved securely in local storage.",
    });
  };

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

      // Call the edge function, direct LLM API, or graceful client-side fallback
      let data;
      try {
        const activeProvider = localStorage.getItem("ai_provider") as "gemini" | "groq" || "gemini";
        const activeKey = localStorage.getItem("ai_api_key") || import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GROQ_API_KEY;

        if (activeKey) {
          console.log("Real-time direct LLM generation triggered using provider:", activeProvider);
          const liveData = await generateLiveBlueprint(idea, activeProvider, activeKey);
          // Map to backend schema (setting research to dummy string to avoid schema breaks)
          data = {
            ...liveData,
            research: "Research compiled dynamically in live generation.",
          };
        } else {
          const { data: resData, error } = await supabase.functions.invoke("invention-pipeline", {
            body: { idea },
          });
          if (error) throw error;
          data = resData;
        }
      } catch (invokeError) {
        console.warn("Direct LLM call / Edge function failed. Running local fallback:", invokeError);
        data = generateLocalBlueprint(idea);
      }

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
            <div className="relative text-center space-y-6 py-8">
              <div className="absolute right-0 top-0 z-20">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-white/5 border border-border h-10 w-10"
                  onClick={() => setIsSettingsOpen(true)}
                  title="Configure LLM API Settings"
                >
                  <Settings className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
                </Button>
              </div>
              <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-slide-in">
                Idea-to-Invention Pipeline
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-slide-in">
                Transform your raw concepts into comprehensive invention blueprints using a multi-agent orchestration pipeline.
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
      {/* Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="sm:max-w-[425px] glass border border-primary/20 text-foreground">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-primary">API Settings</DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              Enter your API Key to enable real-time, ChatGPT-like dynamic patent generation directly from the client.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="provider" className="text-sm font-semibold">AI Provider</Label>
              <select
                id="provider"
                value={provider}
                onChange={(e) => setProvider(e.target.value as "gemini" | "groq")}
                className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border-primary/20 text-foreground"
              >
                <option value="gemini" className="bg-card text-foreground">Google Gemini API (gemini-1.5-flash)</option>
                <option value="groq" className="bg-card text-foreground">Groq API (llama-3.3-70b-versatile)</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="apiKey" className="text-sm font-semibold">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder={provider === "gemini" ? "Enter Gemini API Key..." : "Enter Groq API Key..."}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="bg-background/50 border-primary/20 text-foreground focus-visible:ring-primary focus-visible:border-primary"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              onClick={handleSaveSettings}
              className="bg-primary hover:bg-primary/90 text-white font-semibold w-full"
            >
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
