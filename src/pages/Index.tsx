import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, BarChart3, Zap, Shield, TrendingUp, Users, DollarSign } from "lucide-react";
import logo from "@/assets/logo.png";
import logoDark from "@/assets/logo-dark.png";
import heroImage from "@/assets/hero-funnel.jpg";
import { useTheme } from "next-themes";
import { ThemeToggle } from "@/components/ThemeToggle";

const Index = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const features = [
    {
      icon: BarChart3,
      title: "Visual Funnel Builder",
      description: "Drag-and-drop interface to design complex sales funnels with multiple paths and conditional logic."
    },
    {
      icon: Zap,
      title: "Real-Time Analytics",
      description: "See conversion rates, revenue projections, and traffic flow calculations update instantly as you build."
    },
    {
      icon: TrendingUp,
      title: "Revenue Optimization",
      description: "Model different scenarios with Front End offers and unlimited OTOs to maximize your funnel profitability."
    },
    {
      icon: Users,
      title: "Traffic Source Tracking",
      description: "Manage multiple traffic sources and see how different audiences perform through your funnel."
    },
    {
      icon: DollarSign,
      title: "Multi-Product Support",
      description: "Build sophisticated funnels with main offers, upsells, downsells, and order bumps all in one place."
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Cloud-based platform with automatic saves, version history, and enterprise-grade security."
    }
  ];

  return (
    <div className="min-h-screen bg-background relative">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto px-4 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in">
              <div className="flex justify-start mb-6">
                <img src={theme === "dark" ? logoDark : logo} alt="FunnelSim" className="h-12" />
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                Build High-Converting Sales Funnels in Minutes
              </h1>
              <p className="text-xl text-muted-foreground">
                Design, analyze, and optimize your entire sales funnel with our intuitive visual builder. 
                Calculate potential revenue and make data-driven decisions before you launch.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" onClick={() => navigate("/auth")} className="text-lg">
                  Start Building Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate("/auth")} className="text-lg">
                  View Demo
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                No credit card required • Free forever plan available
              </p>
            </div>
            <div className="relative animate-scale-in">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-lg blur-3xl"></div>
              <img 
                src={heroImage} 
                alt="Funnel Builder Dashboard" 
                className="relative rounded-lg shadow-2xl border border-border"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 lg:py-32 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl lg:text-5xl font-bold">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-muted-foreground">
              Powerful features designed to help you create, test, and optimize profitable sales funnels
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover-scale border-border/50 bg-card/50 backdrop-blur">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl lg:text-5xl font-bold">
                Why Choose FunnelSim?
              </h2>
              <p className="text-xl text-muted-foreground">
                The smartest way to plan and optimize your sales funnel strategy
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-primary-foreground font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Save Time & Money</h3>
                    <p className="text-muted-foreground">
                      Test and validate your funnel strategy before investing in development or traffic. 
                      Avoid costly mistakes and optimize from day one.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-primary-foreground font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Data-Driven Decisions</h3>
                    <p className="text-muted-foreground">
                      See exactly how conversion rate changes impact your bottom line. 
                      Model different scenarios and choose the most profitable path.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-primary-foreground font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Easy Collaboration</h3>
                    <p className="text-muted-foreground">
                      Share your funnels with team members, export professional reports, 
                      and keep everyone aligned on your conversion strategy.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-primary-foreground font-bold">4</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Scale With Confidence</h3>
                    <p className="text-muted-foreground">
                      From simple funnels to complex multi-path journeys, our platform grows with your business. 
                      Handle unlimited traffic sources and products.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-3xl lg:text-5xl font-bold">
              Ready to Build Your Perfect Funnel?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of marketers and entrepreneurs who trust FunnelSim to plan and optimize their sales funnels.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate("/auth")} className="text-lg">
                Get Started for Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/auth")} className="text-lg">
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <img src={theme === "dark" ? logoDark : logo} alt="FunnelSim" className="h-8" />
              <span className="text-sm text-muted-foreground">
                © 2025 FunnelSim. All rights reserved.
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Built for marketers who mean business
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
