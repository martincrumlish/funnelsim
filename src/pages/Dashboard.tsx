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
import { Plus, LogOut, Trash2, Edit, User, Copy, Search, X, BarChart3, TrendingUp, Folder, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ThemeToggle";
import { calculateFunnelRevenue, formatCurrency } from "@/lib/funnelCalculations";
import { Badge } from "@/components/ui/badge";

interface Funnel {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  nodes?: any;
  edges?: any;
  traffic_sources?: any;
}

const Dashboard = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [loadingFunnels, setLoadingFunnels] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [funnelToDelete, setFunnelToDelete] = useState<{ id: string; name: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const { toast } = useToast();

  const ITEMS_PER_PAGE = 15;

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (user) {
      loadFunnels(true);
    }
  }, [user, debouncedSearch]);

  const loadFunnels = async (reset = false) => {
    if (reset) {
      setLoadingFunnels(true);
      setPage(0);
      setFunnels([]);
    } else {
      setLoadingMore(true);
    }

    const currentPage = reset ? 0 : page;
    const from = currentPage * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    let query = supabase
      .from("funnels")
      .select("id, name, created_at, updated_at, nodes, edges, traffic_sources", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    // Add search filter if query exists
    if (debouncedSearch.trim()) {
      query = query.ilike("name", `%${debouncedSearch.trim()}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      toast({
        title: "Error loading funnels",
        description: error.message,
        variant: "destructive",
      });
    } else {
      if (reset) {
        setFunnels(data || []);
      } else {
        // Filter out duplicates when appending new funnels
        setFunnels((prev) => {
          const existingIds = new Set(prev.map(f => f.id));
          const newFunnels = (data || []).filter(f => !existingIds.has(f.id));
          return [...prev, ...newFunnels];
        });
      }
      setHasMore(count ? (currentPage + 1) * ITEMS_PER_PAGE < count : false);
      // Always increment page after loading, whether it's initial load or load more
      setPage(currentPage + 1);
    }

    setLoadingFunnels(false);
    setLoadingMore(false);
    setInitialLoad(false);
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      loadFunnels(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
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
      // Remove the funnel from local state instead of reloading
      setFunnels((prev) => prev.filter((funnel) => funnel.id !== funnelToDelete.id));
    }
    
    setDeleteDialogOpen(false);
    setFunnelToDelete(null);
  };


  const cloneFunnel = async (funnelId: string) => {
    // First, fetch the complete funnel data
    const { data: funnelData, error: fetchError } = await supabase
      .from("funnels")
      .select("*")
      .eq("id", funnelId)
      .single();

    if (fetchError || !funnelData) {
      toast({
        title: "Error cloning funnel",
        description: fetchError?.message || "Funnel not found",
        variant: "destructive",
      });
      return;
    }

    // Create a new funnel with the cloned data
    const { data: clonedFunnel, error: cloneError } = await supabase
      .from("funnels")
      .insert({
        user_id: user?.id,
        name: `${funnelData.name} (cloned)`,
        nodes: funnelData.nodes,
        edges: funnelData.edges,
        traffic_sources: funnelData.traffic_sources,
      })
      .select()
      .single();

    if (cloneError) {
      toast({
        title: "Error cloning funnel",
        description: cloneError.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Funnel cloned",
        description: `"${clonedFunnel.name}" has been created`,
      });
      // Add the cloned funnel to the top of the list, ensuring no duplicates
      setFunnels((prev) => {
        const filtered = prev.filter(f => f.id !== clonedFunnel.id);
        return [clonedFunnel, ...filtered];
      });
    }
  };

  if (loading || initialLoad) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Funnel Builder</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:inline">{user?.email}</span>
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={() => navigate("/profile")}>
              <User className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => signOut()}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Your Funnels</h2>
            <p className="text-muted-foreground">View and manage all your conversion funnels</p>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Search Bar */}
            <div className="relative flex-1 sm:w-72">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search funnels..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
                  onClick={clearSearch}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <Button onClick={createNewFunnel}>
              <Plus className="mr-2 h-4 w-4" />
              New Funnel
            </Button>
          </div>
        </div>

        {/* Funnels Grid */}
        {funnels.length === 0 && !loadingFunnels ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-muted mx-auto flex items-center justify-center">
                  <Folder className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold">
                  {searchQuery ? "No funnels found" : "No funnels yet"}
                </h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  {searchQuery
                    ? `No funnels match "${searchQuery}"`
                    : "Create your first funnel to start tracking conversions"}
                </p>
                {searchQuery ? (
                  <Button onClick={clearSearch} variant="outline">
                    Clear Search
                  </Button>
                ) : (
                  <Button onClick={createNewFunnel} size="lg">
                    <Plus className="mr-2 h-5 w-5" />
                    Create Your First Funnel
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {funnels.map((funnel) => {
                const revenue = calculateFunnelRevenue(
                  Array.isArray(funnel.nodes) ? funnel.nodes : [],
                  Array.isArray(funnel.edges) ? funnel.edges : [],
                  Array.isArray(funnel.traffic_sources) ? funnel.traffic_sources : []
                );
                
                return (
                  <Card key={funnel.id} className="group hover:shadow-md transition-all duration-200 hover:border-primary/50 flex flex-col">
                    <CardHeader className="space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="line-clamp-1 flex-1">{funnel.name}</CardTitle>
                        <Badge 
                          variant="secondary" 
                          className={`flex items-center gap-1 ${
                            revenue > 0 
                              ? 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20' 
                              : 'bg-muted text-muted-foreground border-border'
                          }`}
                        >
                          <DollarSign className="h-3 w-3" />
                          {formatCurrency(revenue)}
                        </Badge>
                      </div>
                      <CardDescription className="text-xs">
                        {format(new Date(funnel.updated_at), "MMM d, yyyy 'at' h:mm a")}
                      </CardDescription>
                    </CardHeader>
                  <CardContent className="mt-auto">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-primary hover:text-primary hover:bg-primary/10 border-primary/20 hover:border-primary/30"
                        onClick={() => navigate(`/funnel/${funnel.id}`)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Open
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-muted-foreground hover:text-foreground hover:bg-accent border-border hover:border-accent-foreground/20"
                        onClick={() => cloneFunnel(funnel.id)}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Clone
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20 hover:border-destructive/30"
                        onClick={() => openDeleteDialog(funnel.id, funnel.name)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                );
              })}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center">
                <Button
                  onClick={loadMore}
                  disabled={loadingMore}
                  variant="outline"
                  size="lg"
                >
                  {loadingMore ? "Loading..." : "Load More"}
                </Button>
              </div>
            )}
          </>
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
