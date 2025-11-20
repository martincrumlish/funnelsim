import React from 'react';
import { Navbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { ProductShowcase } from '@/components/landing/ProductShowcase';
import { Comparison } from '@/components/landing/Comparison';
import { Testimonials } from '@/components/landing/Testimonials';
import { CTA } from '@/components/landing/CTA';
import { Footer } from '@/components/landing/Footer';

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-dark-900 text-slate-200 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Global Background Grid Pattern */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-grid opacity-20"></div>

      <Navbar />

      <main className="relative z-10">
        <Hero />
        <Features />
        <ProductShowcase />
        <Comparison />
        <Testimonials />
        <CTA />
      </main>

      <Footer />
    </div>
  );
};

export default Landing;
