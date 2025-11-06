import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, Image, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "sonner";
import { Node, Edge } from "reactflow";

interface ExportMenuProps {
  nodes: Node[];
  edges: Edge[];
  trafficSources: Array<{ type: string; visits: number; cost: number }>;
  stepMetrics: Array<{ name: string; conversions: number; revenue: number; epc: number }>;
  totalTraffic: number;
  totalRevenue: number;
  totalCost: number;
}

export const ExportMenu = ({ 
  nodes, 
  edges, 
  trafficSources, 
  stepMetrics, 
  totalTraffic, 
  totalRevenue, 
  totalCost 
}: ExportMenuProps) => {
  const [isExporting, setIsExporting] = useState(false);

  const createStaticExport = () => {
    const exportContainer = document.createElement('div');
    exportContainer.style.cssText = `
      position: absolute;
      left: -9999px;
      top: 0;
      width: 1400px;
      padding: 40px;
      background: white;
      font-family: system-ui, -apple-system, sans-serif;
    `;

    const html = `
      <div style="display: flex; gap: 20px;">
        <!-- Left Side: Traffic & Metrics -->
        <div style="display: flex; flex-direction: column; gap: 20px; width: 350px;">
          <!-- Traffic -->
          <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; background: white;">
            <h3 style="font-size: 14px; font-weight: 600; margin: 0 0 12px 0;">Initial Traffic</h3>
            <table style="width: 100%; font-size: 12px; border-collapse: collapse;">
              <thead>
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <th style="padding: 8px 4px; text-align: left;">Traffic Type</th>
                  <th style="padding: 8px 4px; text-align: right;">Visits</th>
                  <th style="padding: 8px 4px; text-align: right;">$ Cost</th>
                </tr>
              </thead>
              <tbody>
                ${trafficSources.map(s => `
                  <tr>
                    <td style="padding: 4px;">${s.type || 'Unnamed'}</td>
                    <td style="padding: 4px; text-align: right;">${s.visits.toLocaleString()}</td>
                    <td style="padding: 4px; text-align: right;">$${s.cost.toFixed(2)}</td>
                  </tr>
                `).join('')}
                <tr style="border-top: 2px solid #e5e7eb; font-weight: 600;">
                  <td style="padding: 8px 4px;">Total</td>
                  <td style="padding: 8px 4px; text-align: right;">${totalTraffic.toLocaleString()}</td>
                  <td style="padding: 8px 4px; text-align: right;">$${totalCost.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Metrics -->
          <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; background: white;">
            <h3 style="font-size: 14px; font-weight: 600; margin: 0 0 12px 0;">Funnel Metrics</h3>
            <p style="font-size: 12px; margin: 0 0 12px 0;">Total Traffic In: <strong>${totalTraffic.toLocaleString()}</strong></p>
            <table style="width: 100%; font-size: 12px; border-collapse: collapse;">
              <thead>
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <th style="padding: 8px 4px; text-align: left;">Step</th>
                  <th style="padding: 8px 4px; text-align: right;">Conv</th>
                  <th style="padding: 8px 4px; text-align: right;">Revenue</th>
                  <th style="padding: 8px 4px; text-align: right;">EPC</th>
                </tr>
              </thead>
              <tbody>
                ${stepMetrics.map(s => `
                  <tr>
                    <td style="padding: 4px;">${s.name}</td>
                    <td style="padding: 4px; text-align: right;">${s.conversions.toLocaleString()}</td>
                    <td style="padding: 4px; text-align: right;">$${s.revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td style="padding: 4px; text-align: right;">$${s.epc.toFixed(2)}</td>
                  </tr>
                `).join('')}
                <tr style="border-top: 2px solid #e5e7eb; font-weight: 600;">
                  <td style="padding: 8px 4px;">Sub Total</td>
                  <td style="padding: 8px 4px;"></td>
                  <td style="padding: 8px 4px; text-align: right;">$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td style="padding: 8px 4px; text-align: right;">$${(totalRevenue / totalTraffic).toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 4px; color: #ef4444;">Costs</td>
                  <td style="padding: 4px;"></td>
                  <td style="padding: 4px; text-align: right; color: #ef4444;">-$${totalCost.toFixed(2)}</td>
                  <td style="padding: 4px;"></td>
                </tr>
                <tr style="border-top: 2px solid #e5e7eb;">
                  <td style="padding: 8px 4px; font-weight: 700;">Total Profit</td>
                  <td style="padding: 8px 4px;"></td>
                  <td style="padding: 8px 4px; text-align: right; font-weight: 700; color: ${totalRevenue - totalCost >= 0 ? '#22c55e' : '#ef4444'};">$${(totalRevenue - totalCost).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td style="padding: 8px 4px;"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Right Side: Funnel Flow -->
        <div style="flex: 1; position: relative; min-height: 800px;">
          ${nodes.map((node) => {
            const bgColor = node.data.nodeType === 'frontend' ? '#dbeafe' : 
                           node.data.nodeType === 'oto' ? '#d1fae5' : '#fed7aa';
            const borderColor = node.data.nodeType === 'frontend' ? '#3b82f6' : 
                               node.data.nodeType === 'oto' ? '#10b981' : '#f97316';
            return `
              <div style="
                position: absolute;
                left: ${node.position.x}px;
                top: ${node.position.y}px;
                min-width: 220px;
                padding: 12px;
                background: ${bgColor};
                border: 2px solid ${borderColor};
                border-radius: 8px;
                font-size: 12px;
              ">
                <div style="font-weight: 600; margin-bottom: 8px;">${node.data.name}</div>
                <div style="display: flex; gap: 8px;">
                  <div>
                    <div style="font-size: 10px; opacity: 0.7;">$ Price</div>
                    <div>${node.data.price}</div>
                  </div>
                  <div>
                    <div style="font-size: 10px; opacity: 0.7;">% Conv %</div>
                    <div>${node.data.conversion}</div>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    exportContainer.innerHTML = html;
    document.body.appendChild(exportContainer);
    return exportContainer;
  };

  const exportAsImage = async () => {
    setIsExporting(true);
    let exportContainer: HTMLElement | null = null;
    
    try {
      exportContainer = createStaticExport();
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const canvas = await html2canvas(exportContainer, {
        backgroundColor: "#ffffff",
        scale: 2,
        logging: false,
      });
      
      const link = document.createElement("a");
      link.download = `funnel-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      
      toast.success("Funnel exported as image!");
    } catch (error) {
      toast.error("Failed to export image");
      console.error(error);
    } finally {
      if (exportContainer) {
        document.body.removeChild(exportContainer);
      }
      setIsExporting(false);
    }
  };

  const exportAsPDF = async () => {
    setIsExporting(true);
    let exportContainer: HTMLElement | null = null;
    
    try {
      exportContainer = createStaticExport();
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const canvas = await html2canvas(exportContainer, {
        backgroundColor: "#ffffff",
        scale: 2,
        logging: false,
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [canvas.width, canvas.height],
      });
      
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`funnel-${Date.now()}.pdf`);
      
      toast.success("Funnel exported as PDF!");
    } catch (error) {
      toast.error("Failed to export PDF");
      console.error(error);
    } finally {
      if (exportContainer) {
        document.body.removeChild(exportContainer);
      }
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2" disabled={isExporting}>
          <Download className="h-4 w-4" />
          {isExporting ? "Exporting..." : "Export"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportAsImage} className="gap-2 cursor-pointer">
          <Image className="h-4 w-4" />
          Export as Image (PNG)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportAsPDF} className="gap-2 cursor-pointer">
          <FileText className="h-4 w-4" />
          Export as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
