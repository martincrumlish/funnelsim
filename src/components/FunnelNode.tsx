import { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, DollarSign, Percent, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FunnelNodeData {
  name: string;
  price: number;
  conversion: number;
  nodeType: "frontend" | "oto" | "downsell";
  traffic?: number;
  onUpdate?: (nodeId: string, field: string, value: any) => void;
  onDelete?: (nodeId: string) => void;
}

export const FunnelNode = memo(({ id, data }: NodeProps<FunnelNodeData>) => {
  const { name, price, conversion, nodeType, onUpdate, onDelete } = data;

  const nodeColors = {
    frontend: "border-primary/50 bg-primary/5",
    oto: "border-accent/50 bg-accent/5",
    downsell: "border-orange-500/50 bg-orange-500/5",
  };

  return (
    <Card className={`p-4 min-w-[280px] ${nodeColors[nodeType]} border-2`}>
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-primary !w-3 !h-3"
      />
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-primary" />
            <Input
              value={name}
              onChange={(e) => onUpdate?.(id, "name", e.target.value)}
              className="text-sm font-semibold border-0 p-0 h-auto bg-transparent"
              placeholder="Step name"
            />
          </div>
          {nodeType !== "frontend" && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => onDelete?.(id)}
            >
              <Trash2 className="h-3 w-3 text-destructive" />
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              Price
            </Label>
            <Input
              type="number"
              min="0"
              step="1"
              value={price}
              onChange={(e) => onUpdate?.(id, "price", parseFloat(e.target.value) || 0)}
              className="text-sm h-8"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs flex items-center gap-1">
              <Percent className="h-3 w-3" />
              Conv %
            </Label>
            <Input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={conversion}
              onChange={(e) => onUpdate?.(id, "conversion", parseFloat(e.target.value) || 0)}
              className="text-sm h-8"
            />
          </div>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        id="yes"
        style={{ left: "30%", background: "#10b981" }}
        className="!w-3 !h-3"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="no"
        style={{ left: "70%", background: "#ef4444" }}
        className="!w-3 !h-3"
      />
      
      <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
        <span>Buy</span>
        <span>No Thanks</span>
      </div>
    </Card>
  );
});

FunnelNode.displayName = "FunnelNode";
