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

interface ExportMenuProps {
  canvasRef: React.RefObject<HTMLDivElement>;
}

export const ExportMenu = ({ canvasRef }: ExportMenuProps) => {
  const [isExporting, setIsExporting] = useState(false);

  const prepareForExport = () => {
    // Hide controls and other UI elements during export
    const controls = document.querySelector('.react-flow__controls');
    const controlsDisplay = controls ? (controls as HTMLElement).style.display : '';
    if (controls) {
      (controls as HTMLElement).style.display = 'none';
    }
    
    return { controls, controlsDisplay };
  };

  const restoreAfterExport = (elements: { controls: Element | null; controlsDisplay: string }) => {
    if (elements.controls) {
      (elements.controls as HTMLElement).style.display = elements.controlsDisplay;
    }
  };

  const exportAsImage = async () => {
    if (!canvasRef.current) return;
    
    setIsExporting(true);
    const hiddenElements = prepareForExport();
    
    try {
      // Small delay to ensure elements are hidden
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const canvas = await html2canvas(canvasRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        onclone: (clonedDoc) => {
          // Ensure input values are rendered in the clone
          const inputs = clonedDoc.querySelectorAll('input');
          inputs.forEach((input) => {
            const value = (input as HTMLInputElement).value;
            input.setAttribute('value', value);
            // Replace input with a div containing the value for better rendering
            const span = clonedDoc.createElement('span');
            span.textContent = value;
            span.style.cssText = window.getComputedStyle(input).cssText;
            span.style.border = 'none';
            span.style.outline = 'none';
            input.parentNode?.replaceChild(span, input);
          });
        },
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
      restoreAfterExport(hiddenElements);
      setIsExporting(false);
    }
  };

  const exportAsPDF = async () => {
    if (!canvasRef.current) return;
    
    setIsExporting(true);
    const hiddenElements = prepareForExport();
    
    try {
      // Small delay to ensure elements are hidden
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const canvas = await html2canvas(canvasRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        onclone: (clonedDoc) => {
          // Ensure input values are rendered in the clone
          const inputs = clonedDoc.querySelectorAll('input');
          inputs.forEach((input) => {
            const value = (input as HTMLInputElement).value;
            input.setAttribute('value', value);
            // Replace input with a div containing the value for better rendering
            const span = clonedDoc.createElement('span');
            span.textContent = value;
            span.style.cssText = window.getComputedStyle(input).cssText;
            span.style.border = 'none';
            span.style.outline = 'none';
            input.parentNode?.replaceChild(span, input);
          });
        },
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? "landscape" : "portrait",
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
      restoreAfterExport(hiddenElements);
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
