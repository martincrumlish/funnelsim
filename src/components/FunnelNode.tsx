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
  isExporting?: boolean;
}

export const FunnelNode = memo(({ id, data }: NodeProps<FunnelNodeData>) => {
  const { name, price, conversion, nodeType, onUpdate, onDelete, isExporting } = data;

  const nodeColors = {
    frontend: "border-primary/50 bg-primary/20",
    oto: "border-emerald-500/50 bg-emerald-500/20",
    downsell: "border-orange-500/50 bg-orange-500/20",
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
            <Tag className="h-4 w-4 text-primary flex-shrink-0" />
            {isExporting ? (
              <div className="text-sm font-semibold">{name}</div>
            ) : (
              <Input
                value={name}
                onChange={(e) => onUpdate?.(id, "name", e.target.value)}
                className="text-sm font-semibold border-0 p-0 h-auto bg-transparent nodrag"
                placeholder="Step name"
              />
            )}
          </div>
          {nodeType !== "frontend" && !isExporting && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => onDelete?.(id)}
            >
              <Trash2 className="h-3.5 w-3.5 text-destructive" />
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="space-y-1 flex-1">
            <Label className="text-xs flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              Price
            </Label>
            {isExporting ? (
              <div className="text-sm h-8 px-3 py-2 rounded-md border border-input bg-background flex items-center">
                {price}
              </div>
            ) : (
              <Input
                type="number"
                min="0"
                max="1000000"
                step="1"
                value={price}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  if (value > 1000000) return;
                  onUpdate?.(id, "price", value);
                }}
                onInput={(e) => {
                  const input = e.target as HTMLInputElement;
                  const value = input.value.replace('.', '').replace('-', '');
                  if (value.length > 7) {
                    input.value = input.value.slice(0, -1);
                  }
                }}
                className="text-sm h-8 nodrag"
              />
            )}
          </div>

          <div className="space-y-1 w-20">
            <Label className="text-xs flex items-center gap-1">
              <Percent className="h-3 w-3" />
              Conv %
            </Label>
            {isExporting ? (
              <div className="text-sm h-8 px-3 py-2 rounded-md border border-input bg-background flex items-center">
                {conversion}
              </div>
            ) : (
              <Input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={conversion}
                onChange={(e) => {
                  const value = e.target.value;
                  // Limit to 3 digits before decimal
                  if (value.replace('.', '').length > 5) return; // 3 digits + decimal + 1 decimal place
                  const numValue = parseFloat(value) || 0;
                  if (numValue > 100) return;
                  onUpdate?.(id, "conversion", numValue);
                }}
                onInput={(e) => {
                  const input = e.target as HTMLInputElement;
                  const value = input.value;
                  // Remove any characters beyond 3 digits (plus decimal)
                  if (value.replace('.', '').replace('-', '').length > 4) {
                    input.value = value.slice(0, -1);
                  }
                }}
                className="text-sm h-8 nodrag"
              />
            )}
          </div>
        </div>
      </div>

      {nodeType === "frontend" ? (
        <>
          <Handle
            type="source"
            position={Position.Bottom}
            id="yes"
            style={{ left: "50%", background: "#10b981", transform: "translateX(-50%)" }}
            className="!w-3 !h-3"
          />
          <div className="text-center mt-2 text-xs text-muted-foreground">
            <span>Buy</span>
          </div>
        </>
      ) : (
        <>
          <Handle
            type="source"
            position={Position.Bottom}
            id="yes"
            style={{ left: "30%", background: "#10b981", transform: "translateX(-50%)" }}
            className="!w-3 !h-3"
          />
          <Handle
            type="source"
            position={Position.Bottom}
            id="no"
            style={{ left: "70%", background: "#ef4444", transform: "translateX(-50%)" }}
            className="!w-3 !h-3"
          />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>Buy</span>
            <span>No Thanks</span>
          </div>
        </>
      )}
    </Card>
  );
});

FunnelNode.displayName = "FunnelNode";
