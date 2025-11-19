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
      title: "Visual Funnel Planning Canvas",
      description: "Professional drag-and-drop interface powered by React Flow. Map out complex multi-step funnels with unlimited OTOs (One-Time Offers) and downsells. Visualize conditional pathways with Yes/No logic flows for sophisticated customer journeys."
    },
    {
      icon: Zap,
      title: "Real-Time Calculations",
      description: "Watch your funnel metrics update instantly as you build. See live conversion calculations, revenue projections, traffic flow through each step, and EPC (Earnings Per Click) for every funnel node. No waiting, no refreshing - just instant insights."
    },
    {
      icon: TrendingUp,
      title: "Advanced Revenue Modeling",
      description: "Model unlimited scenarios with customizable pricing and conversion rates for each step. Track revenue at every stage: Front End offers, multiple OTOs, and downsell pages. Calculate total funnel revenue, profit margins, and ROI before spending a dollar on traffic."
    },
    {
      icon: Users,
      title: "Multi-Source Traffic Management",
      description: "Add unlimited traffic sources with individual cost tracking. Model Facebook Ads, Google Ads, solo ads, and organic traffic separately. See exact profit/loss for each source and identify your most profitable acquisition channels."
    },
    {
      icon: DollarSign,
      title: "Comprehensive Product Hierarchy",
      description: "Build sophisticated product sequences with Front End offers (FE), sequential OTOs (OTO 1, 2, 3...), and strategic downsells. Each step tracks conversions independently with customizable conversion rates from 0-100%."
    },
    {
      icon: Shield,
      title: "Auto-Save & Data Persistence",
      description: "Cloud-based platform with automatic saves to Supabase backend. Never lose your work - every change is saved instantly. Access your funnels from any device with secure authentication and user-specific data isolation."
    }
  ];

  const additionalFeatures = [
    {
      title: "Professional Export Options",
      items: ["Export funnels as high-quality PNG images", "Generate detailed PDF reports with metrics", "Share visual representations with clients and team members", "Print-ready formats for presentations"]
    },
    {
      title: "Customization & Branding",
      items: ["Upload custom logos for each funnel", "Personalize funnel names and step labels", "Color-coded nodes: Primary (FE), Green (OTO), Orange (Downsell)", "Custom pricing for each offer"]
    },
    {
      title: "Metrics Dashboard",
      items: ["Live metrics table showing all step performance", "Traffic In, Conversions, Revenue per step", "Earnings Per Click (EPC) calculations", "Total revenue and profit tracking with cost deductions", "Sub-total and grand total calculations"]
    },
    {
      title: "Intelligent Node System",
      items: ["Three node types: Frontend (required), OTO (upsell), Downsell", "Yes/No handles for conditional logic", "Connect nodes with animated flow lines", "Visual indicators for buy vs. no-thanks paths", "Drag-and-drop positioning on infinite canvas"]
    },
    {
      title: "Traffic Simulation",
      items: ["Input initial traffic volume", "Watch traffic flow through each step", "See conversion numbers at each stage", "Calculate final buyer counts", "Model different traffic scenarios"]
    },
    {
      title: "User Experience",
      items: ["Clean, modern interface with dark/light mode", "Responsive design works on all devices", "Intuitive controls with no learning curve", "Context menus for quick actions", "Collapsible metrics panel for focus mode"]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/20 via-background via-50% to-background relative">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(120,119,198,0.3),transparent_50%)] animate-pulse"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(255,85,170,0.25),transparent_50%)] animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="container mx-auto px-4 py-20 lg:py-32 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in">
              <div className="flex justify-start mb-6 animate-scale-in">
                <img src={theme === "dark" ? logoDark : logo} alt="FunnelSim" className="h-12" />
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight animate-fade-in" style={{ animationDelay: '0.1s' }}>
                Plan & Model High-Converting Sales Funnels Before You Build
              </h1>
              <p className="text-xl text-muted-foreground animate-fade-in" style={{ animationDelay: '0.2s' }}>
                Visualize, calculate, and optimize your entire funnel strategy before investing in development or traffic. 
                Model revenue projections and make data-driven decisions with our intuitive planning tool.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <Button size="lg" onClick={() => navigate("/auth")} className="text-lg group hover-scale">
                  Start Planning Free
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate("/auth")} className="text-lg hover-scale">
                  View Demo
                </Button>
              </div>
              <p className="text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '0.4s' }}>
                No credit card required • Free forever plan available
              </p>
            </div>
            <div className="relative animate-scale-in" style={{ animationDelay: '0.2s' }}>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-lg blur-3xl animate-pulse"></div>
              <img 
                src={heroImage} 
                alt="Funnel Builder Dashboard" 
                className="relative rounded-lg shadow-2xl border border-border hover-scale transition-all duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 lg:py-32 relative">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl lg:text-5xl font-bold">
              Everything You Need to Plan Profitable Funnels
            </h2>
            <p className="text-xl text-muted-foreground">
              Professional planning and modeling tools for marketers, entrepreneurs, and funnel strategists
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="hover-scale border-border/50 bg-card/50 backdrop-blur transition-all duration-300 hover:shadow-xl hover:border-primary/20 animate-fade-in group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors duration-300">
                    <feature.icon className="h-6 w-6 text-primary transition-transform group-hover:scale-110" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Additional Features Detail */}
          <div className="max-w-6xl mx-auto">
            <h3 className="text-2xl lg:text-4xl font-bold text-center mb-12">
              Packed with Power Features
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {additionalFeatures.map((section, index) => (
                <Card 
                  key={index} 
                  className="border-border/50 bg-card/30 hover-scale transition-all duration-300 hover:shadow-lg hover:bg-card/50 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardHeader>
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {section.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start gap-2 text-sm text-muted-foreground group">
                          <span className="text-primary mt-1 transition-transform group-hover:scale-125">✓</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 lg:py-32 relative">
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
                <div className="flex gap-4 animate-fade-in group" style={{ animationDelay: '0.1s' }}>
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-1 transition-transform group-hover:scale-110">
                    <span className="text-primary-foreground font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Save Time & Money</h3>
                    <p className="text-muted-foreground">
                      Test and validate your funnel strategy before investing thousands in development or traffic. 
                      Model multiple scenarios in minutes instead of weeks. Identify bottlenecks before they cost you money.
                      Avoid costly mistakes and optimize from day one with data-driven funnel architecture.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4 animate-fade-in group" style={{ animationDelay: '0.2s' }}>
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-1 transition-transform group-hover:scale-110">
                    <span className="text-primary-foreground font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Data-Driven Decisions</h3>
                    <p className="text-muted-foreground">
                      See exactly how a 1% conversion rate change impacts your revenue. Model different price points instantly.
                      Calculate EPC (Earnings Per Click) for every funnel step. Compare traffic source profitability side-by-side.
                      Make confident decisions backed by real numbers, not guesswork.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 animate-fade-in group" style={{ animationDelay: '0.3s' }}>
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-1 transition-transform group-hover:scale-110">
                    <span className="text-primary-foreground font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Easy Collaboration</h3>
                    <p className="text-muted-foreground">
                      Export professional PNG images and PDF reports with full metrics breakdown. Share visual funnel maps with
                      developers, designers, and copywriters. Present data-backed proposals to stakeholders. 
                      Keep everyone aligned on conversion strategy and revenue projections.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4 animate-fade-in group" style={{ animationDelay: '0.4s' }}>
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-1 transition-transform group-hover:scale-110">
                    <span className="text-primary-foreground font-bold">4</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Scale With Confidence</h3>
                    <p className="text-muted-foreground">
                      Start with simple 2-step funnels or build complex 10+ step sequences. Add unlimited OTOs and downsells.
                      Track unlimited traffic sources. Our platform handles everything from beginner funnels to 
                      enterprise-level multi-product ecosystems. Your tool grows as your business scales.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4 animate-fade-in group" style={{ animationDelay: '0.5s' }}>
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-1 transition-transform group-hover:scale-110">
                    <span className="text-primary-foreground font-bold">5</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Instant ROI Calculations</h3>
                    <p className="text-muted-foreground">
                      Input your traffic costs and see profit calculations automatically. Track spend vs. revenue for each source.
                      Identify which traffic channels are profitable and which are bleeding money. Calculate break-even points
                      and optimize for maximum ROI before spending on ads.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 animate-fade-in group" style={{ animationDelay: '0.6s' }}>
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-1 transition-transform group-hover:scale-110">
                    <span className="text-primary-foreground font-bold">6</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Zero Learning Curve</h3>
                    <p className="text-muted-foreground">
                      Intuitive drag-and-drop interface anyone can use. No complex software training needed.
                      Start modeling your first funnel in under 5 minutes. Built-in examples and smart defaults
                      help you get started fast. If you can use a flowchart, you can use FunnelSim.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 relative">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-3xl lg:text-5xl font-bold">
              Ready to Plan Your Perfect Funnel?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Start modeling your funnel strategy today and make confident, data-driven decisions before investing in development or traffic.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate("/auth")} className="text-lg group hover-scale">
                Get Started for Free
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/auth")} className="text-lg hover-scale">
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border relative bg-background/50 backdrop-blur">
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
