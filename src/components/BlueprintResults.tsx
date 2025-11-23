import { useState } from "react";
import { ChevronDown, ChevronUp, FileText, Search, CheckCircle, Lightbulb, FileSignature } from "lucide-react";
import { InventionBlueprint } from "@/lib/types/invention";
import { Card } from "@/components/ui/card";

interface BlueprintResultsProps {
  blueprint: InventionBlueprint;
}

interface Section {
  title: string;
  content: string;
  icon: React.ReactNode;
  color: string;
}

export const BlueprintResults = ({ blueprint }: BlueprintResultsProps) => {
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0]));

  const toggleSection = (index: number) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSections(newExpanded);
  };

  const sections: Section[] = [
    {
      title: "Problem Summary",
      content: blueprint.problemStatement,
      icon: <FileText className="w-5 h-5" />,
      color: "text-primary",
    },
    {
      title: "Research & Similar Ideas",
      content: blueprint.research,
      icon: <Search className="w-5 h-5" />,
      color: "text-secondary",
    },
    {
      title: "Feasibility Analysis",
      content: blueprint.feasibility,
      icon: <CheckCircle className="w-5 h-5" />,
      color: "text-accent",
    },
    {
      title: "Innovation Opportunities",
      content: blueprint.innovation,
      icon: <Lightbulb className="w-5 h-5" />,
      color: "text-primary",
    },
    {
      title: "Complete Patent Document",
      content: blueprint.patentDocument,
      icon: <FileSignature className="w-5 h-5" />,
      color: "text-secondary",
    },
  ];

  return (
    <div className="space-y-6 animate-slide-in">
      {/* Header */}
      <div className="glass-strong rounded-2xl p-8 glow-primary">
        <h2 className="text-3xl font-bold mb-3 text-glow">{blueprint.title}</h2>
        <p className="text-lg text-foreground/90">{blueprint.summary}</p>
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {sections.map((section, index) => (
          <Card
            key={index}
            className="glass border-primary/20 overflow-hidden transition-all hover:border-primary/40"
          >
            <button
              onClick={() => toggleSection(index)}
              className="w-full p-6 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`${section.color}`}>
                  {section.icon}
                </div>
                <h3 className="text-xl font-semibold">{section.title}</h3>
              </div>
              
              {expandedSections.has(index) ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </button>
            
            {expandedSections.has(index) && (
              <div className="px-6 pb-6 pt-2 border-t border-border/50">
                <div className="prose prose-invert max-w-none">
                  <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed">
                    {section.content}
                  </p>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};
