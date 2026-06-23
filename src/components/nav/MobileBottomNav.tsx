import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Network, MapPin, Zap, Menu } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { cn } from '../../theme/cn';
import { motion } from 'framer-motion';

export const MobileBottomNav: React.FC = () => {
  const setMobileMenuOpen = useAppStore(s => s.setMobileMenuOpen);
  const location = useLocation();

  const tabs = [
    { to: '/', icon: Home, label: 'Overview' },
    { to: '/traffic', icon: Network, label: 'Traffic' },
    { to: '/parking', icon: MapPin, label: 'Parking' },
    { to: '/ev-charging', icon: Zap, label: 'EV' },
  ];

  return (
    <div className="md:hidden fixed bottom-4 left-4 right-4 z-40">
      <nav className="h-[68px] bg-bg-surface/90 backdrop-blur-2xl border border-border-subtle rounded-3xl flex items-center justify-around px-2 shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
        {tabs.map((tab) => {
        const isActive = tab.to === '/' ? location.pathname === '/' : location.pathname.startsWith(tab.to);
        const Icon = tab.icon;
        
        return (
          <NavLink
            key={tab.to}
            to={tab.to}
            className="relative flex flex-col items-center justify-center w-full h-full gap-1 pt-1"
          >
            <motion.div whileTap={{ scale: 0.85 }} className="flex flex-col items-center justify-center w-full h-full relative z-10">
            {/* Active Indicator Top Border */}
            {isActive && (
              <motion.div
                layoutId="bottom-nav-indicator"
                className="absolute inset-0 bg-accent-primary/10 rounded-2xl z-0"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <Icon 
              size={22} 
              strokeWidth={isActive ? 2.5 : 2} 
              className={cn(
                "transition-all duration-300 z-10",
                isActive ? "text-accent-primary scale-110" : "text-text-tertiary"
              )}
            />
            <span className={cn(
              "text-[9px] font-bold tracking-wide transition-colors z-10",
              isActive ? "text-accent-primary" : "text-text-tertiary"
            )}>
              {tab.label}
            </span>
            </motion.div>
          </NavLink>
        );
      })}
      
        {/* Menu Trigger */}
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={() => setMobileMenuOpen(true)}
          className="relative flex flex-col items-center justify-center w-full h-full gap-1 pt-1 z-10"
        >
          <Menu size={22} strokeWidth={2} className="text-text-tertiary" />
          <span className="text-[9px] font-bold tracking-wide text-text-tertiary">Menu</span>
        </motion.button>
      </nav>
    </div>
  );
};
