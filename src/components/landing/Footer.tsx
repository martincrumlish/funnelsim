import React from 'react';
import { Zap, Twitter, Github, Linkedin } from 'lucide-react';
import logoDark from '@/assets/logo-dark.png';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-dark-900 border-t border-white/5 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <img src={logoDark} alt="FunnelSim" className="h-8" />
          </div>
          <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
            The standard for funnel modeling and simulation. Built for marketers who demand data over guesswork.
          </p>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col items-center justify-center">
          <p className="text-slate-500 text-xs">
            &copy; {new Date().getFullYear()} FunnelSim. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};