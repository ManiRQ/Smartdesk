"use client";

import { useCallback, useState, type ReactNode } from "react";
import { Header } from "@/components/header";
import { MobileDrawer } from "@/components/mobile-drawer";
import { Sidebar } from "@/components/sidebar";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const openMenu = useCallback(() => setIsMenuOpen(true), []);
  const closeMenu = useCallback(() => setIsMenuOpen(false), []);

  return (
    <div className="min-h-screen bg-background">
      <div inert={isMenuOpen}>
        <Header onMenuClick={openMenu} />
        <aside className="fixed bottom-0 left-0 top-16 hidden w-60 overflow-y-auto border-r border-border bg-card lg:block">
          <Sidebar />
        </aside>
        <div className="lg:pl-64">
          <main className="mx-auto w-full max-w-7xl px-4 pb-10 pt-24 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
      <MobileDrawer isOpen={isMenuOpen} onClose={closeMenu} />
    </div>
  );
}
