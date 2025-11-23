import { Clock, Trash2 } from "lucide-react";
import { InventionBlueprint } from "@/lib/types/invention";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface HistorySidebarProps {
  history: InventionBlueprint[];
  onSelect: (blueprint: InventionBlueprint) => void;
  onDelete: (id: string) => void;
  currentId?: string;
}

export const HistorySidebar = ({ history, onSelect, onDelete, currentId }: HistorySidebarProps) => {
  if (history.length === 0) {
    return (
      <div className="glass rounded-2xl p-6 h-full">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          History
        </h3>
        <p className="text-sm text-muted-foreground">
          Your generated blueprints will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-6 h-full flex flex-col">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5" />
        History ({history.length})
      </h3>
      
      <ScrollArea className="flex-1 -mx-2 px-2">
        <div className="space-y-2">
          {history.map((item) => (
            <div
              key={item.id}
              className={`group relative p-4 rounded-lg border transition-all cursor-pointer hover:border-primary/50 ${
                currentId === item.id
                  ? "border-primary bg-primary/10"
                  : "border-border bg-background/30"
              }`}
              onClick={() => onSelect(item)}
            >
              <h4 className="font-semibold text-sm mb-1 line-clamp-2 pr-8">
                {item.title}
              </h4>
              <p className="text-xs text-muted-foreground">
                {new Date(item.createdAt).toLocaleDateString()} at{" "}
                {new Date(item.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item.id);
                }}
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
