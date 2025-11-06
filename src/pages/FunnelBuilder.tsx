import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { FunnelCanvas } from "@/components/FunnelCanvas";
import { ReactFlowProvider } from "reactflow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const FunnelBuilder = () => {
  const { id } = useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [funnelData, setFunnelData] = useState<any>(null);
  const [loadingFunnel, setLoadingFunnel] = useState(true);
  const [funnelName, setFunnelName] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user && id) {
      loadFunnel();
    }
  }, [user, id]);

  const loadFunnel = async () => {
    setLoadingFunnel(true);
    const { data, error } = await supabase
      .from("funnels")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      toast({
        title: "Error loading funnel",
        description: error.message,
        variant: "destructive",
      });
      navigate("/dashboard");
    } else {
      setFunnelData(data);
      setFunnelName(data.name);
    }
    setLoadingFunnel(false);
  };

  const updateFunnelName = (name: string) => {
    setFunnelData((prev: any) => prev ? { ...prev, name } : prev);
  };

  if (loading || loadingFunnel) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading funnel...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="px-4 py-3 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          {isEditingName ? (
            <Input
              value={funnelName}
              onChange={(e) => setFunnelName(e.target.value)}
              onBlur={() => setIsEditingName(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setIsEditingName(false);
                }
              }}
              autoFocus
              className="w-auto p-0 m-0 bg-transparent border-0 border-b-2 border-dashed border-primary focus:outline-none focus:ring-0 text-xl font-semibold"
              style={{ fontSize: 'inherit', lineHeight: 'inherit', fontWeight: 'inherit', letterSpacing: 'inherit' }}
            />
          ) : (
            <h1 
              className="text-xl font-semibold cursor-pointer hover:text-primary transition-colors"
              onClick={() => setIsEditingName(true)}
            >
              {funnelName}
            </h1>
          )}
        </div>
      </header>
      <ReactFlowProvider>
        <FunnelCanvas 
          funnelId={id} 
          initialData={funnelData} 
          onNameChange={updateFunnelName}
          funnelName={funnelName}
          onFunnelNameChange={setFunnelName}
        />
      </ReactFlowProvider>
    </div>
  );
};

export default FunnelBuilder;
