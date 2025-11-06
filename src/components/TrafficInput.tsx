import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, DollarSign } from "lucide-react";

interface TrafficInputProps {
  trafficType: string;
  visits: number;
  cost: number;
  onTrafficTypeChange: (value: string) => void;
  onVisitsChange: (value: number) => void;
  onCostChange: (value: number) => void;
}

export const TrafficInput = ({
  trafficType,
  visits,
  cost,
  onTrafficTypeChange,
  onVisitsChange,
  onCostChange,
}: TrafficInputProps) => {
  return (
    <Card className="absolute top-4 left-4 p-4 bg-card border-border shadow-lg z-10 min-w-[250px]">
      <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
        <Users className="h-4 w-4 text-primary" />
        Initial Traffic
      </h3>
      
      <div className="space-y-3">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Traffic Type</Label>
          <Input
            type="text"
            value={trafficType}
            onChange={(e) => onTrafficTypeChange(e.target.value)}
            className="text-sm h-8 nodrag"
            placeholder="e.g., Facebook Ads"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Visits</Label>
          <Input
            type="number"
            min="0"
            value={visits}
            onChange={(e) => onVisitsChange(parseInt(e.target.value) || 0)}
            className="text-sm h-8 nodrag"
            placeholder="10000"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground flex items-center gap-1">
            <DollarSign className="h-3 w-3" />
            Cost
          </Label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={cost}
            onChange={(e) => onCostChange(parseFloat(e.target.value) || 0)}
            className="text-sm h-8 nodrag"
            placeholder="0.00"
          />
        </div>
      </div>
    </Card>
  );
};
