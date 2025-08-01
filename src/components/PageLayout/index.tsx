"use client";

import { ReactNode } from "react";
import Header from "@/components/Header";
import FloatingActionButton from "@/components/FloatingActionButton";

interface PageLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showFab?: boolean;
}

const PageLayout = ({ children, showHeader = true, showFab = true }: PageLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      {showHeader && <Header />}
      <main className="flex-1 overflow-x-hidden">
        {children}
      </main>
      {showFab && <FloatingActionButton />}
    </div>
  );
};

export default PageLayout;
