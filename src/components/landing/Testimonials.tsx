import React, { useState, useEffect } from 'react';
import { Quote, Check } from 'lucide-react';
import { Button } from './ui/Button';
import { useNavigate } from 'react-router-dom';
import { useWhitelabel, DEFAULT_TESTIMONIALS } from '@/hooks/useWhitelabel';
import { supabase } from '@/integrations/supabase/client';
import type { SubscriptionTier } from '@/integrations/supabase/types';

// Default pricing plans (fallback when no tiers in database)
const DEFAULT_PLANS = [
  {
    name: "Starter",
    price: "0",
    description: "Perfect for solo marketers testing ideas.",
    features: ["3 Active Funnels", "Basic Analytics", "Export to PNG", "Standard Nodes"],
    cta: "Start Free",
    featured: false,
    priceId: null,
  },
  {
    name: "Pro",
    price: "29",
    description: "For agencies and power users scaling up.",
    features: ["Unlimited Funnels", "Advanced ROI Calculation", "Team Sharing", "Prioritized Support", "White-label Exports"],
    cta: "Start Trial",
    featured: true,
    priceId: null,
  },
];

export const Testimonials: React.FC = () => {
  const navigate = useNavigate();
  const { config, isLoading: configLoading } = useWhitelabel();
  const [tiers, setTiers] = useState<SubscriptionTier[]>([]);
  const [tiersLoading, setTiersLoading] = useState(true);

  // Fetch subscription tiers from database
  useEffect(() => {
    const fetchTiers = async () => {
      try {
        const { data, error } = await supabase
          .from('subscription_tiers')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true });

        if (error) {
          console.error('Error fetching tiers:', error);
        } else if (data) {
          setTiers(data);
        }
      } catch (err) {
        console.error('Error in fetchTiers:', err);
      } finally {
        setTiersLoading(false);
      }
    };

    fetchTiers();
  }, []);

  // Use whitelabel testimonials or defaults
  const testimonials = config.testimonials && config.testimonials.length > 0
    ? config.testimonials
    : DEFAULT_TESTIMONIALS;

  // Build plans from database tiers or use defaults
  const plans = tiersLoading
    ? DEFAULT_PLANS
    : tiers.length > 0
    ? tiers.map((tier, index) => {
        // Parse features from JSONB
        let features: string[] = [];
        try {
          if (tier.features) {
            const parsed = typeof tier.features === 'string'
              ? JSON.parse(tier.features)
              : tier.features;
            if (Array.isArray(parsed)) {
              features = parsed;
            }
          }
        } catch {
          features = [];
        }

        return {
          name: tier.name,
          price: tier.price_monthly.toString(),
          description: index === 0
            ? "Perfect for solo marketers testing ideas."
            : index === 1
            ? "For agencies and power users scaling up."
            : "Enterprise-grade features for teams.",
          features: features.length > 0
            ? features
            : [`${tier.max_funnels === -1 ? 'Unlimited' : tier.max_funnels} Funnels`],
          cta: tier.price_monthly === 0 ? "Start Free" : "Get Started",
          featured: index === 1, // Middle tier is featured
          priceId: tier.stripe_price_id_monthly,
        };
      })
    : DEFAULT_PLANS;

  const handlePlanClick = (plan: typeof plans[0]) => {
    // For now, navigate to auth page
    // In future, could initiate checkout directly if user is logged in
    navigate('/auth');
  };

  return (
    <section className="py-24 relative overflow-hidden">
       {/* Shared Background elements for both Testimonials and Pricing */}
       <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] -z-10"></div>
       <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-violet-600/5 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* --- TESTIMONIALS PART --- */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-6">
            Loved by Top <span className="text-indigo-400">Marketers</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-32">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-dark-800/40 border border-white/5 p-8 rounded-2xl relative group hover:bg-dark-800/60 transition-colors">
              <Quote className="absolute top-6 right-6 w-8 h-8 text-indigo-500/10 group-hover:text-indigo-500/20 transition-colors" />

              <p className="text-slate-300 leading-relaxed mb-8 relative z-10">
                "{t.quote}"
              </p>

              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/30 overflow-hidden">
                    {/* Using colored placeholder if image fails, or actual image */}
                   {t.image ? (
                     <img
                       src={t.image}
                       alt={t.author}
                       className="w-full h-full object-cover opacity-80"
                       onError={(e) => {
                         (e.target as HTMLImageElement).style.display = 'none';
                       }}
                     />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-indigo-400 font-bold">
                       {t.author.charAt(0)}
                     </div>
                   )}
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm">{t.author}</h4>
                  {t.role && <p className="text-indigo-400 text-xs">{t.role}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* --- PRICING PART (Merged into same section) --- */}
        <div id="pricing">
            <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
                Simple, Transparent Pricing
            </h2>
            <p className="text-slate-400">
                Start for free. Upgrade when you need to manage more funnels.
            </p>
            </div>

            <div className={`grid gap-8 max-w-4xl mx-auto ${plans.length === 2 ? 'md:grid-cols-2' : plans.length >= 3 ? 'md:grid-cols-3' : 'md:grid-cols-1'}`}>
            {plans.map((plan, idx) => (
                <div
                key={idx}
                className={`relative p-8 rounded-2xl border flex flex-col transition-all duration-300 ${
                    plan.featured
                    ? 'bg-white/[0.02] border-indigo-500/30 shadow-2xl shadow-indigo-500/10 backdrop-blur-sm'
                    : 'bg-transparent border-white/5 hover:border-white/10 hover:bg-white/[0.01]'
                }`}
                >
                {plan.featured && (
                    <>
                    <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none rounded-2xl"></div>
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow-lg shadow-indigo-500/20">
                        Most Popular
                    </div>
                    </>
                )}

                <div className="mb-8 relative z-10">
                    <h3 className="text-lg font-medium text-white mb-2">{plan.name}</h3>
                    <div className="flex items-baseline text-white">
                    <span className="text-4xl font-bold tracking-tight">${plan.price}</span>
                    <span className="text-slate-500 ml-2">/month</span>
                    </div>
                    <p className="text-slate-400 mt-4 text-sm">{plan.description}</p>
                </div>

                <ul className="space-y-4 mb-8 flex-1 relative z-10">
                    {plan.features.map((feat, i) => (
                    <li key={i} className="flex items-center text-slate-300 text-sm">
                        <Check className="w-4 h-4 text-indigo-400 mr-3 shrink-0" />
                        {feat}
                    </li>
                    ))}
                </ul>

                <Button
                    variant={plan.featured ? 'primary' : 'outline'}
                    className="w-full relative z-10"
                    onClick={() => handlePlanClick(plan)}
                >
                    {plan.cta}
                </Button>
                </div>
            ))}
            </div>
        </div>
      </div>
    </section>
  );
};
