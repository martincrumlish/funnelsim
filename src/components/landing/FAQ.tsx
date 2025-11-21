import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const FAQ: React.FC = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-6">
            Frequently Asked <span className="text-indigo-400">Questions</span>
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed">
            Everything you need to know about FunnelSim and how it can help you optimize your conversion rates.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full space-y-4">
            <AccordionItem value="item-1" className="border border-white/5 bg-dark-800/50 px-6 rounded-lg hover:border-indigo-500/30 transition-colors duration-300">
              <AccordionTrigger className="text-slate-200 hover:text-indigo-400 hover:no-underline text-left font-medium text-lg">
                What is FunnelSim?
              </AccordionTrigger>
              <AccordionContent className="text-slate-400 leading-relaxed text-base pb-6">
                FunnelSim is a powerful visual tool that allows you to design, simulate, and optimize your marketing funnels. You can map out customer journeys, set conversion rates, and simulate traffic flow to predict revenue and identify bottlenecks before you spend a dime on ads.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="border border-white/5 bg-dark-800/50 px-6 rounded-lg hover:border-indigo-500/30 transition-colors duration-300">
              <AccordionTrigger className="text-slate-200 hover:text-indigo-400 hover:no-underline text-left font-medium text-lg">
                Can I export my funnel designs?
              </AccordionTrigger>
              <AccordionContent className="text-slate-400 leading-relaxed text-base pb-6">
                Yes! You can export your funnel designs as high-quality images (PNG/JPG) or as PDF reports to share with your team or clients. We also support exporting data in CSV format for further analysis.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="border border-white/5 bg-dark-800/50 px-6 rounded-lg hover:border-indigo-500/30 transition-colors duration-300">
              <AccordionTrigger className="text-slate-200 hover:text-indigo-400 hover:no-underline text-left font-medium text-lg">
                How accurate are the simulations?
              </AccordionTrigger>
              <AccordionContent className="text-slate-400 leading-relaxed text-base pb-6">
                Our simulation engine uses advanced statistical models to provide realistic projections based on the conversion rates and traffic data you input. While no simulation can predict the future 100%, FunnelSim gives you a statistically significant range of probable outcomes to help you make informed decisions.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="border border-white/5 bg-dark-800/50 px-6 rounded-lg hover:border-indigo-500/30 transition-colors duration-300">
              <AccordionTrigger className="text-slate-200 hover:text-indigo-400 hover:no-underline text-left font-medium text-lg">
                Is there a free trial available?
              </AccordionTrigger>
              <AccordionContent className="text-slate-400 leading-relaxed text-base pb-6">
                Yes, we offer a 14-day free trial on all our plans. You can explore all features, build unlimited funnels, and run simulations to see if FunnelSim is the right fit for your business. No credit card required to start.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="border border-white/5 bg-dark-800/50 px-6 rounded-lg hover:border-indigo-500/30 transition-colors duration-300">
              <AccordionTrigger className="text-slate-200 hover:text-indigo-400 hover:no-underline text-left font-medium text-lg">
                Can I simulate different traffic sources?
              </AccordionTrigger>
              <AccordionContent className="text-slate-400 leading-relaxed text-base pb-6">
                Absolutely. You can define multiple traffic sources (e.g., Facebook Ads, Organic Search, Email) with different costs and conversion characteristics to see how they impact your overall funnel performance and ROI.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </section>
  );
};
