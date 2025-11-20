import React, { useRef, useState } from 'react';
import { MousePointer2, Calculator, Share2, Cloud, Zap, Layout } from 'lucide-react';

const features = [
  {
    title: "Visual Flow Builder",
    description: "Drag, drop, and connect nodes. Build complex multi-step funnels in seconds with our intuitive React Flow interface.",
    icon: <MousePointer2 className="w-6 h-6 text-indigo-400" />,
    colSpan: "lg:col-span-2",
    spotlightColor: "rgba(99, 102, 241, 0.15)" // Indigo
  },
  {
    title: "Real-Time ROI Calc",
    description: "Input traffic costs and conversion rates. Watch profit margins and EPC calculate instantly as you tweak numbers.",
    icon: <Calculator className="w-6 h-6 text-emerald-400" />,
    colSpan: "lg:col-span-1",
    spotlightColor: "rgba(16, 185, 129, 0.15)" // Emerald
  },
  {
    title: "Smart Logic Nodes",
    description: "Specialized nodes for OTOs (One-Time Offers), Downsells, and Order Bumps with automatic branching logic.",
    icon: <Zap className="w-6 h-6 text-amber-400" />,
    colSpan: "lg:col-span-1",
    spotlightColor: "rgba(245, 158, 11, 0.15)" // Amber
  },
  {
    title: "Cloud Persistence",
    description: "Auto-saving to the cloud. Never lose your work. Access your funnels from any device, anywhere, securely.",
    icon: <Cloud className="w-6 h-6 text-sky-400" />,
    colSpan: "lg:col-span-2",
    spotlightColor: "rgba(14, 165, 233, 0.15)" // Sky
  },
  {
    title: "Client-Ready Exports",
    description: "Generate professional PDF reports or high-res PNGs to impress clients and stakeholders.",
    icon: <Share2 className="w-6 h-6 text-purple-400" />,
    colSpan: "lg:col-span-1",
    spotlightColor: "rgba(168, 85, 247, 0.15)" // Purple
  },
  {
    title: "Proven Templates",
    description: "Don't start from blank. Load high-converting funnel structures for webinars, lead magnets, and high-ticket offers.",
    icon: <Layout className="w-6 h-6 text-pink-400" />,
    colSpan: "lg:col-span-2",
    spotlightColor: "rgba(236, 72, 153, 0.15)" // Pink
  }
];

interface FeatureCardProps {
  feature: typeof features[0];
}

const FeatureCard: React.FC<FeatureCardProps> = ({ feature }) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;

    const div = divRef.current;
    const rect = div.getBoundingClientRect();

    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseEnter = () => {
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`${feature.colSpan} group relative p-8 rounded-2xl border border-white/5 bg-dark-800/50 hover:bg-dark-800 transition-all duration-300 hover:border-indigo-500/30 hover:-translate-y-1 overflow-hidden`}
    >
      {/* Mouse Follow Spotlight */}
      <div
        className="pointer-events-none absolute -inset-px transition duration-300 opacity-0 group-hover:opacity-100"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${feature.spotlightColor}, transparent 40%)`,
        }}
      />

      <div className="relative z-10 flex flex-col h-full pointer-events-none">
        <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-white/5 group-hover:border-white/10 shadow-lg">
          {feature.icon}
        </div>
        <h3 className="text-xl font-bold text-white mb-3 font-display">{feature.title}</h3>
        <p className="text-slate-400 leading-relaxed text-sm md:text-base">
          {feature.description}
        </p>
      </div>
    </div>
  );
};

export const Features: React.FC = () => {
  return (
    <section id="features" className="py-24 bg-[#0a0a0f] relative overflow-hidden">
       {/* Subtle grid background */}
       <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
       <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent"></div>
       
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-6">
            Everything You Need to <br/> <span className="text-indigo-400">Plan Profitable Funnels</span>
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed">
            Professional modeling tools for marketers, entrepreneurs, and funnel strategists who value data over intuition.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <FeatureCard key={idx} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
};
