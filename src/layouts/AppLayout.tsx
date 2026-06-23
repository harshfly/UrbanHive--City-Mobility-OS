import React from 'react';
import { Outlet } from 'react-router-dom';
import { TopNav } from '../components/nav/TopNav';
import { Sidebar } from '../components/nav/Sidebar';
import { MobileBottomNav } from '../components/nav/MobileBottomNav';
import { SpotlightCommandBar } from '../components/spotlight/SpotlightCommandBar';

export const AppLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-bg-canvas overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden relative">
        <TopNav />
        <main className="flex-1 overflow-y-auto p-4 md:p-5 pb-24 md:pb-5">
          <Outlet />
        </main>
        {/* Fixed Mobile Bottom Bar */}
        <MobileBottomNav />
      </div>
      {/* Global Spotlight (Cmd+K) */}
      <SpotlightCommandBar />
    </div>
  );
};
