import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { FunnelCanvas } from "@/components/FunnelCanvas";
import { ReactFlowProvider } from "reactflow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase as supabaseClient } from "@/integrations/supabase/client";

const FunnelBuilder = () => {
  const { id } = useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [funnelData, setFunnelData] = useState<any>(null);
  const [loadingFunnel, setLoadingFunnel] = useState(true);
  const [funnelName, setFunnelName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
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
      setFunnelName(data.name || "Untitled Funnel");
    }
    setLoadingFunnel(false);
  };

  const saveFunnelName = async () => {
    if (!id) return;
    
    setSaving(true);
    const { error } = await supabaseClient
      .from("funnels")
      .update({ name: funnelName })
      .eq("id", id);

    if (error) {
      toast({
        title: "Error saving funnel name",
        description: error.message,
        variant: "destructive",
      });
    } else {
      updateFunnelName(funnelName);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
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
    <div className="h-screen flex flex-col">
      <header className="border-b bg-background/80 backdrop-blur-sm z-10">
        <div className="px-4 py-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Input
            value={funnelName}
            onChange={(e) => setFunnelName(e.target.value)}
            className="max-w-sm font-semibold"
            placeholder="Funnel Name"
          />
          <Button
            onClick={saveFunnelName}
            variant={saved ? "default" : "outline"}
            size="sm"
            disabled={saving}
          >
            {saved ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Saved
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save"}
              </>
            )}
          </Button>
        </div>
      </header>
      <ReactFlowProvider>
        <FunnelCanvas 
          funnelId={id} 
          initialData={funnelData} 
          onNameChange={updateFunnelName}
        />
      </ReactFlowProvider>
    </div>
  );
};

export default FunnelBuilder;
