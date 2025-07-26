"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import MainNavigationMenu from "@/components/NavigationMenu";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";

const Header = () => {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-14 items-center justify-between px-4 py-2">
        <MainNavigationMenu />
        <div className="flex items-center gap-4">
          <SignedOut>
            <SignInButton>
              <Button variant="outline">Entrar</Button>
            </SignInButton>
            <SignUpButton>
              <Button className="bg-[#6c47ff] hover:bg-[#5a3ee6] text-white">
                Cadastrar
              </Button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;
