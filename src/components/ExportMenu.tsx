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

  const replaceInputsWithText = (container: HTMLElement) => {
    const inputs = container.querySelectorAll('input');
    const replacements: Array<{ input: HTMLInputElement; parent: HTMLElement; replacement: HTMLDivElement }> = [];
    
    inputs.forEach((input) => {
      const replacement = document.createElement('div');
      const value = input.value || input.placeholder || '';
      replacement.textContent = value;
      
      // Copy all computed styles
      const styles = window.getComputedStyle(input);
      replacement.style.cssText = styles.cssText;
      replacement.style.border = styles.border;
      replacement.style.padding = styles.padding;
      replacement.style.fontSize = styles.fontSize;
      replacement.style.fontWeight = styles.fontWeight;
      replacement.style.color = styles.color;
      replacement.style.backgroundColor = styles.backgroundColor;
      replacement.style.textAlign = styles.textAlign;
      replacement.style.width = styles.width;
      replacement.style.height = styles.height;
      replacement.style.lineHeight = styles.lineHeight;
      replacement.style.display = 'flex';
      replacement.style.alignItems = 'center';
      replacement.style.justifyContent = styles.textAlign === 'right' ? 'flex-end' : 'flex-start';
      
      const parent = input.parentElement!;
      replacements.push({ input, parent, replacement });
      parent.replaceChild(replacement, input);
    });
    
    return replacements;
  };

  const restoreInputs = (replacements: Array<{ input: HTMLInputElement; parent: HTMLElement; replacement: HTMLDivElement }>) => {
    replacements.forEach(({ input, parent, replacement }) => {
      parent.replaceChild(input, replacement);
    });
  };

  const exportAsImage = async () => {
    if (!canvasRef.current) return;
    
    setIsExporting(true);
    
    try {
      // Hide controls
      const controls = document.querySelector('.react-flow__controls') as HTMLElement;
      if (controls) controls.style.display = 'none';
      
      // Replace inputs with text
      const replacements = replaceInputsWithText(canvasRef.current);
      
      await new Promise(resolve => setTimeout(resolve, 150));
      
      const canvas = await html2canvas(canvasRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        logging: false,
      });
      
      // Restore everything
      restoreInputs(replacements);
      if (controls) controls.style.display = '';
      
      const link = document.createElement("a");
      link.download = `funnel-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      
      toast.success("Funnel exported as image!");
    } catch (error) {
      toast.error("Failed to export image");
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportAsPDF = async () => {
    if (!canvasRef.current) return;
    
    setIsExporting(true);
    
    try {
      // Hide controls
      const controls = document.querySelector('.react-flow__controls') as HTMLElement;
      if (controls) controls.style.display = 'none';
      
      // Replace inputs with text
      const replacements = replaceInputsWithText(canvasRef.current);
      
      await new Promise(resolve => setTimeout(resolve, 150));
      
      const canvas = await html2canvas(canvasRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        logging: false,
      });
      
      // Restore everything
      restoreInputs(replacements);
      if (controls) controls.style.display = '';
      
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
