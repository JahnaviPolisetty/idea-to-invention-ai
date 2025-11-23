import { Check, Loader2, Circle } from "lucide-react";
import { AgentStepInfo } from "@/lib/types/invention";
import { AGENT_NAMES } from "@/lib/agents/prompts";

interface AgentTimelineProps {
  steps: AgentStepInfo[];
}

export const AgentTimeline = ({ steps }: AgentTimelineProps) => {
  if (steps.length === 0) return null;

  return (
    <div className="glass rounded-2xl p-6 mb-8 animate-slide-in">
      <h3 className="text-xl font-bold mb-6 text-glow">Agent Pipeline Progress</h3>
      
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={step.name} className="flex items-start gap-4">
            {/* Icon */}
            <div className="mt-1 flex-shrink-0">
              {step.status === "complete" && (
                <div className="w-8 h-8 rounded-full bg-timeline-complete glow-secondary flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" />
                </div>
              )}
              {step.status === "active" && (
                <div className="w-8 h-8 rounded-full bg-timeline-active glow-primary flex items-center justify-center animate-pulse-glow">
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                </div>
              )}
              {step.status === "pending" && (
                <div className="w-8 h-8 rounded-full bg-timeline-pending border-2 border-border flex items-center justify-center">
                  <Circle className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
              {step.status === "error" && (
                <div className="w-8 h-8 rounded-full bg-destructive flex items-center justify-center">
                  <span className="text-white text-lg">!</span>
                </div>
              )}
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-semibold text-foreground">{step.name}</h4>
                {step.endTime && step.startTime && (
                  <span className="text-xs text-muted-foreground">
                    {Math.round(step.endTime - step.startTime)}ms
                  </span>
                )}
              </div>
              
              {step.status === "active" && (
                <p className="text-sm text-primary animate-pulse">Processing...</p>
              )}
              {step.status === "complete" && (
                <p className="text-sm text-secondary">Completed</p>
              )}
              {step.status === "pending" && (
                <p className="text-sm text-muted-foreground">Waiting...</p>
              )}
            </div>
            
            {/* Connector line */}
            {index < steps.length - 1 && (
              <div className="absolute left-[35px] mt-10 w-0.5 h-8 bg-border" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
