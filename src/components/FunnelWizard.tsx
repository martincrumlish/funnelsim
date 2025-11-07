import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, ChevronLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Product {
  id: string;
  type: "FE" | "OTO" | "Downsell";
  name: string;
  price: string;
  conversion: string;
}

interface FunnelWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBack: () => void;
  userId: string | undefined;
}

export const FunnelWizard = ({ open, onOpenChange, onBack, userId }: FunnelWizardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [funnelName, setFunnelName] = useState("");
  const [products, setProducts] = useState<Product[]>([
    { id: "1", type: "FE", name: "Frontend", price: "", conversion: "" },
  ]);
  const [isCreating, setIsCreating] = useState(false);

  const addProduct = () => {
    const otoCount = products.filter((p) => p.type === "OTO").length;
    const downsellCount = products.filter((p) => p.type === "Downsell").length;
    
    const newProduct: Product = {
      id: Date.now().toString(),
      type: "OTO",
      name: `OTO ${otoCount + 1}`,
      price: "",
      conversion: "",
    };
    
    setProducts([...products, newProduct]);
  };

  const removeProduct = (id: string) => {
    const productToRemove = products.find((p) => p.id === id);
    
    // Don't allow removing the Frontend product
    if (productToRemove?.type === "FE") {
      toast({
        title: "Cannot remove Frontend",
        description: "Every funnel must have a Frontend product",
        variant: "destructive",
      });
      return;
    }
    
    if (products.length > 1) {
      setProducts(products.filter((p) => p.id !== id));
    }
  };

  const updateProduct = (id: string, field: keyof Product, value: string) => {
    setProducts(
      products.map((p) => {
        if (p.id === id) {
          const updated = { ...p, [field]: value };
          
          // Auto-update name based on type
          if (field === "type") {
            // Check if trying to change FROM FE to something else
            if (p.type === "FE" && value !== "FE") {
              toast({
                title: "Cannot change Frontend type",
                description: "The Frontend product type cannot be changed",
                variant: "destructive",
              });
              return p; // Return unchanged
            }
            
            // Check if trying to add another FE
            const hasFE = products.some((prod) => prod.type === "FE" && prod.id !== id);
            if (value === "FE" && hasFE) {
              toast({
                title: "Only one Frontend allowed",
                description: "You can only have one Frontend product per funnel",
                variant: "destructive",
              });
              return p; // Return unchanged
            }
            
            const sameTypeCount = products.filter(
              (prod) => prod.type === value && prod.id !== id
            ).length;
            
            if (value === "FE") {
              updated.name = "Frontend";
            } else if (value === "OTO") {
              updated.name = `OTO ${sameTypeCount + 1}`;
            } else if (value === "Downsell") {
              updated.name = `Downsell ${sameTypeCount + 1}`;
            }
          }
          
          return updated;
        }
        return p;
      })
    );
  };

  const createFunnel = async () => {
    // Validation
    if (!funnelName.trim()) {
      toast({
        title: "Funnel name required",
        description: "Please enter a name for your funnel",
        variant: "destructive",
      });
      return;
    }

    const invalidProducts = products.filter(
      (p) => !p.price || !p.conversion || parseFloat(p.price) <= 0 || parseFloat(p.conversion) <= 0
    );

    if (invalidProducts.length > 0) {
      toast({
        title: "Invalid product data",
        description: "Please enter valid price and conversion rate for all products",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);

    try {
      // Create nodes and edges
      const nodes = [];
      const edges = [];
      let yPosition = 50;
      const xPosition = 250;
      const spacing = 150;

      // Create frontend node first
      const feProduct = products.find((p) => p.type === "FE");
      if (feProduct) {
        nodes.push({
          id: "frontend",
          type: "funnelStep",
          position: { x: xPosition, y: yPosition },
          data: {
            label: feProduct.name,
            price: parseFloat(feProduct.price),
            conversion: parseFloat(feProduct.conversion),
            nodeType: "frontend",
          },
        });
        yPosition += spacing;
      }

      // Create OTO and Downsell nodes
      let previousNodeId = "frontend";
      const otherProducts = products.filter((p) => p.type !== "FE");
      
      otherProducts.forEach((product, index) => {
        const nodeId = `${product.type.toLowerCase()}-${index + 1}`;
        
        nodes.push({
          id: nodeId,
          type: "funnelStep",
          position: { x: xPosition, y: yPosition },
          data: {
            label: product.name,
            price: parseFloat(product.price),
            conversion: parseFloat(product.conversion),
            nodeType: product.type.toLowerCase(),
          },
        });

        // Connect to previous node
        // "yes" edge goes to next offer
        edges.push({
          id: `${previousNodeId}-${nodeId}-yes`,
          source: previousNodeId,
          target: nodeId,
          sourceHandle: "yes",
          type: "custom",
          animated: true,
        });

        // "no" edge skips to the node after next (if exists) or ends
        const nextIndex = index + 1;
        if (nextIndex < otherProducts.length) {
          const nextNodeId = `${otherProducts[nextIndex].type.toLowerCase()}-${nextIndex + 1}`;
          edges.push({
            id: `${previousNodeId}-${nextNodeId}-no`,
            source: previousNodeId,
            target: nextNodeId,
            sourceHandle: "no",
            type: "custom",
            animated: true,
          });
        }

        previousNodeId = nodeId;
        yPosition += spacing;
      });

      // Create the funnel in Supabase
      const { data, error } = await supabase
        .from("funnels")
        .insert({
          user_id: userId,
          name: funnelName,
          nodes,
          edges,
          traffic_sources: [],
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Funnel created!",
        description: "Your funnel has been generated successfully",
      });

      onOpenChange(false);
      navigate(`/funnel/${data.id}`);
    } catch (error: any) {
      toast({
        title: "Error creating funnel",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div>
              <DialogTitle>Funnel Wizard</DialogTitle>
              <DialogDescription>
                Configure your funnel products and we'll build it for you
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden px-6">
          <ScrollArea className="h-full">
            <div className="space-y-6 pb-4 pr-4">
              {/* Funnel Name */}
              <div className="space-y-2">
                <Label htmlFor="funnel-name">Funnel Name *</Label>
                <Input
                  id="funnel-name"
                  placeholder="e.g., My Product Launch Funnel"
                  value={funnelName}
                  onChange={(e) => setFunnelName(e.target.value)}
                />
              </div>

            {/* Products Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Products *</Label>
                <Button variant="outline" size="sm" onClick={addProduct}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Product
                </Button>
              </div>

              {products.map((product, index) => (
                <div
                  key={product.id}
                  className="border rounded-lg p-4 space-y-3 bg-muted/30"
                >
                  <div className="flex items-start justify-between">
                    <span className="text-sm font-medium text-muted-foreground">
                      Product {index + 1}
                    </span>
                    {products.length > 1 && product.type !== "FE" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => removeProduct(product.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor={`type-${product.id}`}>Type</Label>
                      <Select
                        value={product.type}
                        onValueChange={(value) =>
                          updateProduct(product.id, "type", value)
                        }
                        disabled={product.type === "FE"}
                      >
                        <SelectTrigger id={`type-${product.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem 
                            value="FE" 
                            disabled={products.some((p) => p.type === "FE" && p.id !== product.id)}
                          >
                            Frontend (FE)
                          </SelectItem>
                          <SelectItem value="OTO">One-Time Offer (OTO)</SelectItem>
                          <SelectItem value="Downsell">Downsell</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`name-${product.id}`}>Name</Label>
                      <Input
                        id={`name-${product.id}`}
                        value={product.name}
                        onChange={(e) =>
                          updateProduct(product.id, "name", e.target.value)
                        }
                        placeholder="Product name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`price-${product.id}`}>Price ($)</Label>
                      <Input
                        id={`price-${product.id}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={product.price}
                        onChange={(e) =>
                          updateProduct(product.id, "price", e.target.value)
                        }
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`conversion-${product.id}`}>
                        Conversion Rate (%)
                      </Label>
                      <Input
                        id={`conversion-${product.id}`}
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={product.conversion}
                        onChange={(e) =>
                          updateProduct(product.id, "conversion", e.target.value)
                        }
                        placeholder="0.0"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            </div>
          </ScrollArea>
        </div>

        <DialogFooter className="px-6 py-4 border-t">
          <Button variant="outline" onClick={onBack} disabled={isCreating}>
            Cancel
          </Button>
          <Button onClick={createFunnel} disabled={isCreating}>
            {isCreating ? "Creating..." : "Create Funnel"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
