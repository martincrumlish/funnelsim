import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, LogOut, Trash2, Edit, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface Funnel {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

const Dashboard = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [loadingFunnels, setLoadingFunnels] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [funnelToDelete, setFunnelToDelete] = useState<{ id: string; name: string } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      loadFunnels();
    }
  }, [user]);

  const loadFunnels = async () => {
    setLoadingFunnels(true);
    const { data, error } = await supabase
      .from("funnels")
      .select("id, name, created_at, updated_at")
      .order("updated_at", { ascending: false });

    if (error) {
      toast({
        title: "Error loading funnels",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setFunnels(data || []);
    }
    setLoadingFunnels(false);
  };

  const createNewFunnel = async () => {
    const { data, error } = await supabase
      .from("funnels")
      .insert({
        user_id: user?.id,
        name: "Untitled Funnel",
        nodes: [],
        edges: [],
        traffic_sources: [],
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Error creating funnel",
        description: error.message,
        variant: "destructive",
      });
    } else {
      navigate(`/funnel/${data.id}`);
    }
  };

  const openDeleteDialog = (id: string, name: string) => {
    setFunnelToDelete({ id, name });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!funnelToDelete) return;

    const { error } = await supabase.from("funnels").delete().eq("id", funnelToDelete.id);

    if (error) {
      toast({
        title: "Error deleting funnel",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Funnel deleted",
        description: `"${funnelToDelete.name}" has been deleted`,
      });
      loadFunnels();
    }
    
    setDeleteDialogOpen(false);
    setFunnelToDelete(null);
  };

  if (loading || loadingFunnels) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Funnel Builder</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <Button variant="ghost" size="icon" onClick={() => navigate("/profile")}>
              <User className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => signOut()}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Your Funnels</h2>
            <p className="text-muted-foreground">Create and manage your conversion funnels</p>
          </div>
          <Button onClick={createNewFunnel} size="lg">
            <Plus className="mr-2 h-5 w-5" />
            New Funnel
          </Button>
        </div>

        {funnels.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="text-center space-y-4">
                <h3 className="text-xl font-semibold">No funnels yet</h3>
                <p className="text-muted-foreground">
                  Create your first funnel to start tracking conversions
                </p>
                <Button onClick={createNewFunnel} size="lg">
                  <Plus className="mr-2 h-5 w-5" />
                  Create Your First Funnel
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {funnels.map((funnel) => (
              <Card key={funnel.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>{funnel.name}</CardTitle>
                  <CardDescription>
                    Updated {formatDistanceToNow(new Date(funnel.updated_at))} ago
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      className="flex-1"
                      onClick={() => navigate(`/funnel/${funnel.id}`)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Open
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => openDeleteDialog(funnel.id, funnel.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Funnel?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{funnelToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dashboard;
