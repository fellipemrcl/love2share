"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import MainNavigationMenu from "@/components/NavigationMenu";
import AuthButtons from "@/components/AuthButtons";
import { AdminButton } from "@/components/AdminButton";

const Header = () => {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-14 items-center justify-between px-4 py-2">
        <MainNavigationMenu />
        <div className="flex items-center gap-4">
          <AdminButton />
          <AuthButtons />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;
