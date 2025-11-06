import { Card } from "@/components/ui/card";
import { DollarSign } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface StepMetric {
  name: string;
  trafficIn: number;
  conversions: number;
  revenue: number;
  epc: number;
}

interface FunnelMetricsTableProps {
  steps: StepMetric[];
  totalTraffic: number;
  totalRevenue: number;
  cost: number;
}

export const FunnelMetricsTable = ({
  steps,
  totalTraffic,
  totalRevenue,
  cost,
}: FunnelMetricsTableProps) => {
  const profit = totalRevenue - cost;

  return (
    <Card className="absolute bottom-4 left-4 p-4 bg-card border-border shadow-lg z-10 max-w-[600px]">
      <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
        <DollarSign className="h-4 w-4 text-accent" />
        Funnel Metrics
      </h3>

      <div className="space-y-3">
        <div className="text-xs">
          <span className="text-muted-foreground">Total Traffic In: </span>
          <span className="font-semibold text-foreground">{totalTraffic.toLocaleString()}</span>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Step</TableHead>
              <TableHead className="text-xs text-right">Conversions</TableHead>
              <TableHead className="text-xs text-right">Revenue</TableHead>
              <TableHead className="text-xs text-right">EPC</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {steps.map((step, idx) => (
              <TableRow key={idx}>
                <TableCell className="text-xs font-medium">{step.name}</TableCell>
                <TableCell className="text-xs text-right">{step.conversions.toLocaleString()}</TableCell>
                <TableCell className="text-xs text-right">
                  <span className="text-green-600">$</span>{step.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </TableCell>
                <TableCell className="text-xs text-right">
                  <span className="text-green-600">$</span>{step.epc.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </TableCell>
              </TableRow>
            ))}
            
            <TableRow className="border-t-2">
              <TableCell className="text-xs font-bold">Sub Total</TableCell>
              <TableCell className="text-xs"></TableCell>
              <TableCell className="text-xs text-right font-bold">
                <span className="text-green-600">$</span>{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </TableCell>
              <TableCell className="text-xs text-right font-bold">
                <span className="text-green-600">$</span>{totalTraffic > 0 ? (totalRevenue / totalTraffic).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell className="text-xs text-destructive font-medium">Costs</TableCell>
              <TableCell className="text-xs"></TableCell>
              <TableCell className="text-xs text-right text-destructive">
                -<span className="text-green-600">$</span>{cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </TableCell>
              <TableCell className="text-xs"></TableCell>
            </TableRow>

            <TableRow className="border-t-2">
              <TableCell className="text-sm font-bold">Total Profit</TableCell>
              <TableCell className="text-xs"></TableCell>
              <TableCell className={`text-sm text-right font-bold ${profit >= 0 ? 'text-accent' : 'text-destructive'}`}>
                <span className="text-green-600">$</span>{profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </TableCell>
              <TableCell className="text-xs"></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};
